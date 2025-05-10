import { BillsProvider } from '@/context/BillsContext';
import { EventsProvider } from '@/context/EventsContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme as PaperDarkTheme, MD3LightTheme as PaperLightTheme, Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // derive themes for Paper and Navigation
  const paperTheme = colorScheme === 'dark' ? PaperDarkTheme : PaperLightTheme;
  const navTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <EventsProvider>
        <BillsProvider>
          <PaperProvider theme={paperTheme}>
            <ThemeProvider value={navTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen name="create-bill" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" options={{ headerShown: false }} />
              </Stack>
              <StatusBar
                style={colorScheme === 'dark' ? 'light' : 'dark'}
                backgroundColor={paperTheme.colors.surface}
                translucent
              />
            </ThemeProvider>
          </PaperProvider>
        </BillsProvider>
      </EventsProvider>
    </SafeAreaProvider>
  );
}
