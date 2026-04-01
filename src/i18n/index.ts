import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'intl-pluralrules';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Suraksha',
      report_incident: 'Report Incident',
      alerts: 'Alerts',
      profile: 'Profile',
      home: 'Home',
      select_language: 'Select Language',
    },
  },
  si: {
    translation: {
      welcome: 'සුරක්ෂා වෙත ඔබව සාදරයෙන් පිළිගනිමු',
      report_incident: 'සිද්ධියක් වාර්තා කරන්න',
      alerts: 'අනතුරු ඇඟවීම්',
      profile: 'ගිණුම',
      home: 'මුල් පිටුව',
      select_language: 'භාෂාව තෝරන්න',
    },
  },
  ta: {
    translation: {
      welcome: 'சுரக்ஷாவுக்கு உங்களை வரவேற்கிறோம்',
      report_incident: 'சம்பவத்தை அறிக்கையிடவும்',
      alerts: 'எச்சரிக்கைகள்',
      profile: 'சுயவிவரம்',
      home: 'முகப்பு',
      select_language: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
