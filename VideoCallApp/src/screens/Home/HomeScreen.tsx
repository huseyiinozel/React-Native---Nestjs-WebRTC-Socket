import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  Keyboard, 
  TouchableWithoutFeedback 
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../AppNavigator';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "./HomeScreen.styles";

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [roomId, setRoomId] = useState('');
  const { t, i18n } = useTranslation();

  const toggleLang = async () => {
    const newLang = i18n.language === 'en' ? 'tr' : 'en';
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem('appLang', newLang);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Pressable style={styles.langBtn} onPress={toggleLang}>
          <Text style={styles.langText}>
            {i18n.language.toUpperCase()}
          </Text>
        </Pressable>

        <Text style={styles.title}>{t('home.title')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('home.roomId')}
          placeholderTextColor="#888"
          value={roomId}
          onChangeText={setRoomId}
        />
        <Pressable
          style={[styles.btn, !roomId && { opacity: 0.5 }]}
          disabled={!roomId}
          onPress={() => navigation.navigate('Call', { roomId })}
        >
          <Text style={styles.btnText}>{t('home.join')}</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}
