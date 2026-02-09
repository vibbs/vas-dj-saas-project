import { Platform } from 'react-native';

export const SettingsHub =
  Platform.OS === 'web'
    ? require('./SettingsHub.web').SettingsHub
    : require('./SettingsHub.native').SettingsHub;
