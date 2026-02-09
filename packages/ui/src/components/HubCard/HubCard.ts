import { Platform } from 'react-native';

export const HubCard =
  Platform.OS === 'web'
    ? require('./HubCard.web').HubCard
    : require('./HubCard.native').HubCard;
