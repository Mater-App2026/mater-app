import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.materapp.app',
  appName: 'Mater',
  webDir: 'build',
  server: {
    url: 'https://materapp.org',
    cleartext: false
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#EEF2F7'
  }
};

export default config;
