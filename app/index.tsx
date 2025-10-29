import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to tabs layout which includes the navigation bar
  return <Redirect href="/(tabs)" />;
}
