import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to tabs layout (Dashboard is the default first tab)
  return <Redirect href="/(tabs)" />;
}
