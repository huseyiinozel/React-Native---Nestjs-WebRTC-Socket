import React, { useEffect, useRef, useState } from 'react';
import {Alert, Platform, PermissionsAndroid } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createPeerConnection, startLocalStream, preferVp8 } from '../../services/webrtc';
import { createSignaling } from '../../services/socket';
import { RootStackParamList } from '../../AppNavigator';
import { type MediaStreamTrack } from 'react-native-webrtc';
import TalkComp from  "../../components/Talk"

type Props = NativeStackScreenProps<RootStackParamList, 'Call'>;

export default function CallScreen({ route, navigation }: Props) {
  const { roomId } = route.params;
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);

  const pcRef = useRef<any>(null);
  const joiningRef = useRef(false);
  const tracksAddedRef = useRef(false);
  const offerMadeRef = useRef(false);
  const isInitiatorRef = useRef(false);
  const pendingRemoteCandidatesRef = useRef<any[]>([]);

  const signaling = useRef(createSignaling()).current;

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    const res = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    const camOk = res['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED;
    const micOk = res['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED;
    if (!camOk || !micOk) Alert.alert('İzin gerekli');
    return camOk && micOk;
  };

  const ensurePc = () => {
    if (pcRef.current) return pcRef.current;
    const pc = createPeerConnection({
      onRemoteStream: setRemoteStream,
      onIceCandidate: (c) => signaling.sendIce(roomId, c),
    });
    pcRef.current = pc;
    return pc;
  };

  const joinRoom = async () => {
    if (joiningRef.current) return;
    joiningRef.current = true;
    if (!(await requestPermissions())) { joiningRef.current = false; return; }

    await signaling.connect();
    signaling.joinRoom(roomId);

    const stream = localStream ?? await startLocalStream();
    setLocalStream(stream);

    const pc = ensurePc();
    if (!tracksAddedRef.current) {
      stream.getTracks().forEach((t: MediaStreamTrack) => pc.addTrack(t, stream));
      tracksAddedRef.current = true;
    }
    joiningRef.current = false;
  };

  const leaveRoom = () => {
    signaling.cleanup();
    pcRef.current?.close();
    pcRef.current = null;
    localStream?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    navigation.navigate("Home");
  };

  useEffect(() => {
    signaling.on('ready', ({ role }: any) => {
      isInitiatorRef.current = role === 'caller';
      offerMadeRef.current = false;
      if (isInitiatorRef.current) setTimeout(async () => {
        const pc = ensurePc();
        const offer = await pc.createOffer();
        await pc.setLocalDescription({ type: 'offer', sdp: preferVp8(offer.sdp) });
        signaling.sendOffer(roomId, pc.localDescription);
      }, 50);
    });

    signaling.on('offer-received', async ({ sdp }: any) => {
      const pc = ensurePc();
      await pc.setRemoteDescription(sdp);
      for (const c of pendingRemoteCandidatesRef.current) {
        await pc.addIceCandidate(c);
      }
      pendingRemoteCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription({ type: 'answer', sdp: preferVp8(answer.sdp) });
      signaling.sendAnswer(roomId, pc.localDescription);
    });

    signaling.on('answer-received', async ({ sdp }: any) => {
      const pc = ensurePc();
      await pc.setRemoteDescription(sdp);
      for (const c of pendingRemoteCandidatesRef.current) {
        await pc.addIceCandidate(c);
      }
      pendingRemoteCandidatesRef.current = [];
    });

    signaling.on('ice-candidate-received', async ({ candidate }: any) => {
      const pc = ensurePc();
      if (!pc.remoteDescription) {
        pendingRemoteCandidatesRef.current.push(candidate);
        return;
      }
      await pc.addIceCandidate(candidate);
    });

    signaling.on('peer-left', () => setRemoteStream(null));

    joinRoom();

    return () => leaveRoom();
  }, []);

  return (
  <TalkComp 
  leaveRoom={leaveRoom} 
  localStream={localStream} 
  remoteStream={remoteStream} 
/>
  );
}

