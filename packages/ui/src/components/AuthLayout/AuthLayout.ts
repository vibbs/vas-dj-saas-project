import { PlatformUtils } from '../../utils/platform';

export const AuthLayout = PlatformUtils.isWeb()
  ? require('./AuthLayout.web').AuthLayout
  : require('./AuthLayout.native').AuthLayout;