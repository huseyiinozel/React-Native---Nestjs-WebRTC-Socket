import { io, type Socket } from 'socket.io-client';
import { RTCSessionDescription } from 'react-native-webrtc';
import { Platform } from 'react-native';
const SERVER_URL = Platform.select({
    ios: 'http://192.168.1.101:3001',
    android: 'http://192.168.1.101:3001',
    default: 'http://192.168.1.101:3001',
}) as string;

const now = () => new Date().toISOString();
const L = (tag: string, ...args: any[]) => console.log(`[${now()}] [${tag}]`, ...args);

export const createSignaling = () => {
    const listeners = new Map<string, Function[]>();
    let socket: Socket | null = null;

    const on = (event: string, callback: Function) => {
        if (!listeners.has(event)) {
            listeners.set(event, []);
        }
        listeners.get(event)?.push(callback);
    };

    const emit = (event: string, ...args: any[]) => {
        listeners.get(event)?.forEach(cb => cb(...args));
    };

    const connect = async () => {
        if (socket) return;
        
        socket = io(SERVER_URL, {
            transports: ['websocket'],
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 10000,
        });

        socket.on('connect', () => {
            L('SOCKET', 'connected', { id: socket?.id });
            emit('connect');
        });

        socket.on('ready', (payload: any) => {
            L('READY', 'recv', payload);
            emit('ready', payload);
        });

        socket.on('offer-received', (payload: any) => {
            L('SDP', 'offer-received', { type: payload?.sdp?.type, len: (payload?.sdp?.sdp || '').length });
            emit('offer-received', { sdp: new RTCSessionDescription(payload.sdp) });
        });

        socket.on('answer-received', (payload: any) => {
            L('SDP', 'answer-received', { type: payload?.sdp?.type, len: (payload?.sdp?.sdp || '').length });
            emit('answer-received', { sdp: new RTCSessionDescription(payload.sdp) });
        });

        socket.on('ice-candidate-received', (payload: any) => {
            L('ICE', 'candidate-received', payload);
            emit('ice-candidate-received', payload);
        });

        socket.on('peer-left', (payload: any) => {
            L('SOCKET', 'peer-left', payload);
            emit('peer-left', payload);
        });

        socket.on('disconnect', (reason: any) => {
            L('SOCKET', 'disconnected', reason);
            emit('disconnect');
        });
    };

    const joinRoom = (roomId: string) => {
        if (socket) {
            socket.emit('join-room', { roomId });
        }
    };

    const sendOffer = (roomId: string, sdp: any) => {
        if (socket) {
            socket.emit('offer', { roomId, sdp });
        }
    };

    const sendAnswer = (roomId: string, sdp: any) => {
        if (socket) {
            socket.emit('answer', { roomId, sdp });
        }
    };

    const sendIce = (roomId: string, candidate: any) => {
        if (socket) {
            socket.emit('ice-candidate', { roomId, candidate });
        }
    };

    const cleanup = () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
        listeners.clear();
    };

    return { on, connect, joinRoom, sendOffer, sendAnswer, sendIce, cleanup };
};