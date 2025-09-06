import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

//gelen mesajlarin tiplerini burada tanımladim
type JoinPayload = { roomId: string };
type SdpPayload = { roomId: string; sdp: any };
type IcePayload = { roomId: string; candidate: any };

// class websocket olarak tanimladim ve configleri yaptim
@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket'],
  pingTimeout: 20000,
  pingInterval: 25000,
})
export class SignalingGateway {
  // Socket.IO sunucusunu bu degiskene bildirdim
  @WebSocketServer() server!: Server;


  private rooms = new Map<string, Set<string>>(); // oda uyeleri
  private partner = new Map<string, string>();  // eslesme
  private initiatorByRoom = new Map<string, string>(); // odayi baslatan kisi

  /*helpers (yardimci fonksiyonlar)*/

  private now() { return new Date().toISOString(); }

  // console log
  private L(tag: string, ...args: any[]) {
    console.log(`[${this.now()}] [${tag}]`, ...args);
  }

  // gelen idye ait oda yoksa oda olusturur. ve listeye ekler
  private ensureRoom(roomId: string): Set<string> {
    let set = this.rooms.get(roomId);
    if (!set) {
      set = new Set<string>();
      this.rooms.set(roomId, set);
      this.L('ROOM', 'create', { roomId });
    }
    return set;
  }

  // odanin o anki durumunu konsola yazar
  private printRoom(roomId: string) {
    const set = this.rooms.get(roomId);
    this.L('ROOM', 'state', { roomId, size: set?.size ?? 0, members: set ? [...set] : [] });
  }

  // eslesen socket id de partnerin id bulur
  private getPartner(id: string) {
    const p = this.partner.get(id);
    return p && p !== id ? p : undefined;
  }

  // iki soketi birbirine esler
  private pair(a: string, b: string) {
    this.partner.set(a, b);
    this.partner.set(b, a);
  }

  //eslesmeyi siler
  private unpair(id: string) {
    const p = this.partner.get(id);
    if (p) this.partner.delete(p);
    this.partner.delete(id);
  }

  /* soket  */

  // yeni client gelince otomatik calisir log basar             
  handleConnection(client: Socket) {
    this.L('SOCK', 'connected', { id: client.id, transport: client.conn.transport.name });
    client.conn.on('upgrade', (t) => this.L('SOCK', 'upgrade', { id: client.id, to: t.name }));
  }

  // client bağlantisi kesilince, tüm odalardan cikar ve eslesmeleri temizler
  // baglanti kesilince otomatik calisir
  handleDisconnect(client: Socket) {
    this.L('SOCK', 'disconnected', { id: client.id });
    for (const [roomId, members] of this.rooms) {
      if (!members.has(client.id)) continue;

      members.delete(client.id);
      this.L('ROOM', 'member removed', { roomId, id: client.id, size: members.size });

      // partnere haber verir
      const p = this.getPartner(client.id);
      if (p) {
        this.partner.delete(p);  // odadan cikarir
        this.server.to(p).emit('peer-left', { roomId, socketId: client.id });
      }
      this.unpair(client.id);

      // oda bossa sil
      if (members.size === 0) {
        this.rooms.delete(roomId);
        this.initiatorByRoom.delete(roomId);
        this.L('ROOM', 'deleted (empty)', { roomId });
      } else {
        if (members.size === 1) {
          const [only] = members;
          this.initiatorByRoom.set(roomId, only); // odada tek kisi kaldıysa, onu "initiator" yapar
        }
        this.printRoom(roomId);
      }
    }
  }


  @SubscribeMessage('join-room') //.  join-room eventi gelince calisir
  onJoin(@ConnectedSocket() client: Socket, @MessageBody() data: JoinPayload) {
    try {
      const roomId = (data?.roomId || '').trim();
      this.L('JOIN', 'request', { id: client.id, roomId });

      if (!roomId) {
        client.emit('error', { message: 'roomId is required' }); // id yoksa hata gonder
        this.L('JOIN', 'reject (no roomId)', { id: client.id });
        return;
      }

      const room = this.ensureRoom(roomId);

      // sadece 2 kisi kuralı
      if (room.size >= 2) {
        client.emit('room-full', { roomId, message: 'Room is full (2 max)' });
        this.L('JOIN', 'reject (full)', { id: client.id, roomId });
        return;
      }


      client.join(roomId); // odaya al
      const before = room.size;
      room.add(client.id);  // clienti odalar listesine ekle
      this.L('JOIN', 'ok', { roomId, id: client.id, before, after: room.size });
      this.printRoom(roomId);

      // katılanlara basarili sekilde gerceklestigine dair  bilgi
      client.emit('joined', { roomId, members: [...room] });


      if (room.size === 2) { // oda da iki kisi olunca
        const [a, b] = [...room];
        const initiatorId = this.initiatorByRoom.get(roomId) ?? a; // initiator ilk giren kisi  onceden belirlenmediyse a olsun 
        this.initiatorByRoom.set(roomId, initiatorId);
        this.pair(a, b); // iki kisiyi esle

        // herkese “ready” ve rolleri yolla
        const roles = [
          { to: a, role: initiatorId === a ? 'caller' : 'callee', partnerId: b },
          { to: b, role: initiatorId === b ? 'caller' : 'callee', partnerId: a },
        ];
        for (const r of roles) { // belirli kisiye mesaj yolla
          this.server.to(r.to).emit('ready', {
            roomId,
            initiatorId,
            role: r.role,
            partnerId: r.partnerId,
            members: [a, b],
          });
        }
        this.L('READY', 'emit', { roomId, initiatorId, members: [a, b] });
      } else {
        this.initiatorByRoom.set(roomId, client.id);  // odada tek kisi ise kendisini "initiator" olarak belirle
        this.L('READY', 'waiting (need 2)', { roomId, size: room.size });
      }
    } catch (err) {
      this.L('JOIN', 'error', { id: client.id, err });
      client.emit('error', { message: 'join failed', detail: String(err) });
    }
  }


  @SubscribeMessage('offer')
  onOffer(@ConnectedSocket() client: Socket, @MessageBody() payload: SdpPayload) {  //arayan tarafın (caller) gönderdiği SDP teklifi
    try {
      const roomId = (payload?.roomId || '').trim();
      const sdp = payload?.sdp;
      const sdpType = sdp?.type;
      const len = typeof sdp?.sdp === 'string' ? sdp.sdp.length : 0;

      const to = this.getPartner(client.id);  // teklif kime gidecek
      this.L('OFFER', 'recv', { from: client.id, to, roomId, sdpType, len });

      if (!roomId || !to) {
        this.L('OFFER', 'drop', { reason: !roomId ? 'no roomId' : 'no partner', from: client.id });
        return;
      }
      this.server.to(to).emit('offer-received', { roomId, sdp, from: client.id });   // teklifi, eslestigi partnere doğrudan iletir partnerin sockete msaj gönderir
      this.L('OFFER', '→ forward', { from: client.id, to, roomId });
    } catch (err) {
      this.L('OFFER', 'error', { from: client.id, err });
      client.emit('error', { message: 'offer failed', detail: String(err) });
    }
  }

  @SubscribeMessage('answer')
  onAnswer(@ConnectedSocket() client: Socket, @MessageBody() payload: SdpPayload) {    // aranan tarafin gonderdigi cevap
    try {
      const roomId = (payload?.roomId || '').trim();
      const sdp = payload?.sdp;
      const sdpType = sdp?.type;
      const len = typeof sdp?.sdp === 'string' ? sdp.sdp.length : 0;

      const to = this.getPartner(client.id);  //cevap kime gidecek
      this.L('ANSWER', 'recv', { from: client.id, to, roomId, sdpType, len });

      if (!roomId || !to) {
        this.L('ANSWER', 'drop', { reason: !roomId ? 'no roomId' : 'no partner', from: client.id });
        return;
      }
      this.server.to(to).emit('answer-received', { roomId, sdp, from: client.id });
      this.L('ANSWER', '→ forward', { from: client.id, to, roomId });
    } catch (err) {
      this.L('ANSWER', 'error', { from: client.id, err });
      client.emit('error', { message: 'answer failed', detail: String(err) });
    }
  }

  @SubscribeMessage('ice-candidate')
  onIce(@ConnectedSocket() client: Socket, @MessageBody() payload: IcePayload) { // cihazın bulduğu potansiyel ag adreslerinin bilgisi
    try {
      const roomId = (payload?.roomId || '').trim();
      const candidate = payload?.candidate;
      const cStr: string = candidate?.candidate || '';

      const info = {
        mid: candidate?.sdpMid,
        mline: candidate?.sdpMLineIndex,
        typ: cStr.includes(' typ relay')
          ? 'relay'
          : cStr.includes(' typ srflx')
            ? 'srflx'
            : cStr.includes(' typ host')
              ? 'host'
              : 'unknown',
        udp: cStr.includes(' udp '),
        tcp: cStr.includes(' tcp '),
        len: cStr.length,
      };

      const to = this.getPartner(client.id);  // adayi kime gondericegimizin bilgisi
      this.L('ICE', 'recv', { from: client.id, to, roomId, ...info });

      if (!roomId || !to || !candidate) {
        this.L('ICE', 'drop', {
          reason: !roomId ? 'no roomId' : !to ? 'no partner' : 'no candidate',
          from: client.id,
        });
        return;
      }
      this.server.to(to).emit('ice-candidate-received', { roomId, candidate, from: client.id }); // eslesilen partnere dogrudan ilet
    } catch (err) {
      this.L('ICE', 'error', { from: client.id, err });
      client.emit('error', { message: 'ice failed', detail: String(err) });
    }
  }

  @SubscribeMessage('leave-room')
  onLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) { // kullanici manuel olarak leave yaparsa calisir
    const roomId = (data?.roomId || '').trim();
    this.L('LEAVE', 'request', { id: client.id, roomId });
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.delete(client.id)) {
      client.leave(roomId);
      const p = this.getPartner(client.id);
      if (p) {
        this.partner.delete(p);
        this.server.to(p).emit('peer-left', { roomId, socketId: client.id });  // partnere ayrildigini bildirir
      }
      this.unpair(client.id);

      if (room.size === 0) {
        this.rooms.delete(roomId);
        this.initiatorByRoom.delete(roomId);
        this.L('ROOM', 'deleted (empty)', { roomId });
      } else {
        this.printRoom(roomId);
      }
    }
  }
}
