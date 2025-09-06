
Sunucu tarafında NestJS üzerinde WebSocketGateway (Socket.IO) kullanılmıştır. Bu yapı, istemciler arası signaling sürecini yönetir.

🔴 Kullanılan Teknolojiler

󠁯•󠁏󠁏 NestJS → Backend framework

󠁯•󠁏󠁏 @nestjs/websockets & socket.io → WebSocket iletişimi


🔴 Yapı ve Akış

󠁯•󠁏󠁏 SignalingGateway sınıfı → Tüm socket olaylarını yönetir.

󠁯•󠁏󠁏 Kullanıcı bağlandığında → handleConnection() log tutar.

󠁯•󠁏󠁏 Kullanıcı ayrıldığında → handleDisconnect() çalışır, odadan çıkarır ve partnerine peer-left gönderir.

󠁯•󠁏󠁏 Odalar (rooms) → Maksimum 2 kullanıcı barındırır. Kullanıcı sayısı 2’ye ulaşınca bağlantı başlatılır.

󠁯•󠁏󠁏 Partner eşleşmesi (partner map) → Kullanıcılar birbirine eşleştirilir.

󠁯•󠁏󠁏 Initiator mantığı (initiatorByRoom) → Odaya ilk giren kişi caller (offer yapan) olur.

🔴 Eventler

󠁯•󠁏󠁏 join-room → Odaya katılım, 2 kullanıcı varsa eşleştirme yapılır ve ready event gönderilir.

󠁯•󠁏󠁏 offer → Caller tarafından gönderilen SDP offer, partnerine iletilir.

󠁯•󠁏󠁏 answer → Callee tarafından gönderilen SDP answer, caller’a iletilir.

󠁯•󠁏󠁏 ice-candidate → Aday adres bilgileri karşı tarafa iletilir.

󠁯•󠁏󠁏 leave-room → Kullanıcı manuel ayrıldığında partnerine haber verilir.


| Event           | Gönderen      | Backend Görevi                                         | Partner Client Eventi            |
| --------------- | ------------- | ------------------------------------------------------ | -------------------------------- |
| `join-room`     | Kullanıcı     | Odaya katılım sağlar; oda 2 kişiye ulaşırsa eşleştirir | `ready` (rol ve partner bilgisi) |
| `offer`         | Caller        | Gönderilen SDP offer’ı alır ve partnerine iletir       | `offer-received`                 |
| `answer`        | Callee        | Gönderilen SDP answer’ı alır ve partnerine iletir      | `answer-received`                |
| `ice-candidate` | Her iki taraf | Aday adres bilgisini alır ve partnerine iletir         | `ice-candidate-received`         |

## Kurulum

```bash
$ npm install
```

## Çalıştırma

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```



