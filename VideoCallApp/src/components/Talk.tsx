import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { RTCView, type MediaStream } from 'react-native-webrtc';
import { useTranslation } from 'react-i18next';

type Props = {
  leaveRoom: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

export default function Talk({ leaveRoom, localStream, remoteStream }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{t('call.local')}</Text>
        <Pressable style={styles.leaveBtn} onPress={leaveRoom}>
          <Text style={styles.btnText}>{t('call.leave')}</Text>
        </Pressable>
      </View>

      <View style={styles.videoBox}>
        {localStream ? (
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.video}
            mirror
            objectFit="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{t('call.nosignal')}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.label, { marginTop: 12, marginBottom: 12 }]}>{t('call.remote')}</Text>
      <View style={styles.videoBox}>
        {remoteStream ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={styles.video}
            objectFit="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{t('call.nosignal')}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 16},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 20,
  },
  leaveBtn: {
    backgroundColor: '#e14c4c',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  videoBox: {
    width: width - 25,
    height: height / 2.8,
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  video: { flex: 1, borderRadius: 6 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#aaa' },
  label: { color: '#bbb', fontWeight: '600' },
  btnText: { color: '#fff', fontWeight: '700' },
});
