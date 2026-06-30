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
    backgroundColor: '#EEF2F7'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#EEF2F7',
      showSpinner: false
    }
  }
};

export default config;