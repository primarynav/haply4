import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.happilyeverafteragain.app',
  appName: 'Happily Ever After Again',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Happily Ever After Again',
  },
};

export default config;
