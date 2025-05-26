import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useFonts as useInterFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import Colors from '@/constants/Colors';
import type { MD3Theme } from 'react-native-paper';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const isDark = false;
  const interFont = {
    fontFamily: 'Inter_400Regular',
    fontWeight: 'normal',
    letterSpacing: 0,
    fontSize: 16,
    lineHeight: 24,
  };
  const interFontMedium = {
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    letterSpacing: 0,
    fontSize: 16,
    lineHeight: 24,
  };
  const interFontBold = {
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    letterSpacing: 0,
    fontSize: 16,
    lineHeight: 24,
  };
  const theme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: Colors[isDark ? 'dark' : 'light'].purple,
      secondary: Colors[isDark ? 'dark' : 'light'].green,
      background: Colors[isDark ? 'dark' : 'light'].background,
      surface: Colors[isDark ? 'dark' : 'light'].card,
      onSurface: Colors[isDark ? 'dark' : 'light'].text,
      text: Colors[isDark ? 'dark' : 'light'].text,
      outline: Colors[isDark ? 'dark' : 'light'].grey,
    },
    fonts: {
      displayLarge: interFontBold,
      displayMedium: interFontBold,
      displaySmall: interFontBold,
      headlineLarge: interFontMedium,
      headlineMedium: interFontMedium,
      headlineSmall: interFontMedium,
      titleLarge: interFontMedium,
      titleMedium: interFontMedium,
      titleSmall: interFontMedium,
      labelLarge: interFontMedium,
      labelMedium: interFontMedium,
      labelSmall: interFontMedium,
      bodyLarge: interFont,
      bodyMedium: interFont,
      bodySmall: interFont,
    },
  } as any;
  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
