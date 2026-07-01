import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.materapp.app',
  appName: 'Mater',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#EEF2F7',
    limitsNavigationsToAppBoundDomains: true
  }
};

export default config;
