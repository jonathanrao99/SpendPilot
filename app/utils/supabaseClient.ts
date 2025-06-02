import { PostgrestClient } from '@supabase/postgrest-js';
import { StorageClient } from '@supabase/storage-js';
// Add URL & fetch polyfills for React Native before anything else
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// REST (Postgrest) client
export const rest = new PostgrestClient(`${supabaseUrl}/rest/v1`, {
  headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }
} as any);

// Storage client
export const storage = new StorageClient(supabaseUrl, {
  headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }
} as any); 