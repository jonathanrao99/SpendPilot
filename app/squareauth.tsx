import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './utils/supabaseClient';

// Complete any pending auth sessions when the app is opened
WebBrowser.maybeCompleteAuthSession();

// Environment variables (make sure these are set in your .env and app config)
const SQUARE_APP_ID = process.env.EXPO_PUBLIC_SQUARE_APP_ID as string;
const SQUARE_APP_SECRET = process.env.SQUARE_APP_SECRET as string;
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true } as any);

const discovery = {
  authorizationEndpoint: 'https://connect.squareup.com/oauth2/authorize',
  tokenEndpoint: 'https://connect.squareup.com/oauth2/token',
};

export default function SquareAuthScreen({ navigation }: any) {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SQUARE_APP_ID,
      redirectUri: REDIRECT_URI,
      scopes: ['MERCHANT_PROFILE_READ', 'PAYMENTS_READ', 'REPORT_READ'],
      responseType: AuthSession.ResponseType.Code,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      (async () => {
        // Exchange the code for tokens
        const tokenResponse = await fetch(discovery.tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: SQUARE_APP_ID,
            client_secret: SQUARE_APP_SECRET,
            grant_type: 'authorization_code',
            code,
          }),
        });
        const tokenData = await tokenResponse.json();
        const { access_token, refresh_token, merchant_id, expires_at } = tokenData;
        // Store tokens and merchant ID
        await AsyncStorage.setItem('square_access_token', access_token);
        await AsyncStorage.setItem('square_refresh_token', refresh_token);
        await AsyncStorage.setItem('merchant_id', merchant_id);
        await AsyncStorage.setItem('square_token_expires_at', expires_at);
        // Upsert user record in Supabase
        await supabase.from('users').upsert({ id: merchant_id, email: null });
        // Navigate to main app
        navigation.replace('(tabs)');
      })().catch(console.error);
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Connect your Square account</Text>
      <Button
        mode="contained"
        onPress={() => promptAsync({ useProxy: true } as any)}
        disabled={!request}
        style={{ marginTop: 20 }}
      >
        Connect Square
      </Button>
    </View>
  );
} 