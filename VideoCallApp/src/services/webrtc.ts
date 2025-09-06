import {
  RTCPeerConnection,
  mediaDevices,
  type MediaStream,
  RTCIceCandidate,
} from 'react-native-webrtc';


const pcConfig = {
  bundlePolicy: 'max-bundle',
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const now = () => new Date().toISOString();
const L = (tag: string, ...args: any[]) => console.log(`[${now()}] [${tag}]`, ...args);



export const startLocalStream = async () => {
  const stream = (await mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    } as any,
    video: { facingMode: 'user' },
  })) as MediaStream;
  return stream;
};

export const createPeerConnection = ({
  onRemoteStream,
  onIceCandidate,
}: {
  onRemoteStream: (stream: MediaStream) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
}) => {
  const pc = new RTCPeerConnection(pcConfig as any);
  const anyPc = pc as any; 

  
  if (typeof anyPc.addEventListener === 'function') {
    anyPc.addEventListener('track', (event: any) => {
      const stream: MediaStream | undefined = event?.streams?.[0] ?? event?.stream;
      if (stream) {
        onRemoteStream(stream);
      }
    });
    
   
    anyPc.addEventListener('addstream', (event: any) => {
        if (event.stream) {
            onRemoteStream(event.stream);
        }
    });

    anyPc.addEventListener('icecandidate', (event: any) => {
      if (event.candidate) {
        onIceCandidate(event.candidate.toJSON());
      }
    });
  } else {
   
    anyPc.ontrack = (event: any) => {
        const stream: MediaStream | undefined = event?.streams?.[0] ?? event?.stream;
        if (stream) {
          onRemoteStream(stream);
        }
    };
    anyPc.onaddstream = (event: any) => {
        if (event.stream) {
            onRemoteStream(event.stream);
        }
    };
    anyPc.onicecandidate = (event: any) => {
      if (event.candidate) {
        onIceCandidate(event.candidate.toJSON());
      }
    };
  }

  return pc;
};


export function preferVp8(sdp: string): string {
  try {
    const m = sdp.match(/^a=rtpmap:(\d+)\s+VP8\/90000$/m);
    if (!m) return sdp;
    const vp8Pt = m[1]; 
    return sdp.replace(/^m=video (.+)$/m, (line) => {
      const parts = line.split(' ');
      const header = parts.slice(0, 3);
      const pts = parts.slice(3);
      const newPts = [vp8Pt, ...pts.filter((p) => p !== vp8Pt)];
      const out = [...header, ...newPts].join(' ');
      return out;
    });
  } catch {
    return sdp;
  }
}