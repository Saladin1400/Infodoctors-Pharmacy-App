import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.infodoctors.patient',
  appName: 'InfoDoctors Pharmacy',
  webDir: 'dist',
  server: {
    // الرابط الجديد للاستضافة
    url: 'https://app.infodoctors.net',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;