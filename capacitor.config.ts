import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.appstatik.app',
  appName: 'Statik',
  webDir: 'dist',
  server: {
    // For Strava OAuth - allow navigation to these domains
    allowNavigation: ['www.strava.com', 'strava.com', 'appstatik.com']
  },
  ios: {
    scheme: 'Statik',
    contentInset: 'automatic'
  },
  plugins: {
    App: {
      // URL schemes the app responds to
      // statik:// for direct deep links
      // https://appstatik.com for Universal Links (requires Apple setup)
    }
  }
};

export default config;
