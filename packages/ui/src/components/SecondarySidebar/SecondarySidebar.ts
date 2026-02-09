import { Platform } from 'react-native';

export const SecondarySidebar =
  Platform.OS === 'web'
    ? require('./SecondarySidebar.web').SecondarySidebar
    : require('./SecondarySidebar.native').SecondarySidebar;
