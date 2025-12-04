import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect explicitly to Dashboard tab (index) when app loads or after sign-in
  return <Redirect href="/(tabs)/index" />;
}
