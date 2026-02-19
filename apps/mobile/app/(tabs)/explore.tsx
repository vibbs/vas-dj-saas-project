// This file is kept for backwards compatibility but the Explore tab has been
// replaced with Notifications and Settings tabs in the tab layout.
// It will not be shown in the tab bar.
import { Redirect } from 'expo-router';

export default function ExploreFallback() {
  return <Redirect href="/(tabs)" />;
}
