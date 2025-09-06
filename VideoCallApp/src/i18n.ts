import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tr from './locales/tr.json';
import en from './locales/en.json';

const getStoredLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem('appLang');
    return lang || 'tr'; 
  } catch {
    return 'tr';
  }
};

(async () => {
  const lng = await getStoredLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        tr: { translation: tr },
        en: { translation: en },
      },
      lng,
      fallbackLng: 'tr',
      interpolation: { escapeValue: false },
    });
})();

export default i18n;
