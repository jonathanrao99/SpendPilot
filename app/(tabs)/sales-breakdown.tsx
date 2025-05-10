import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SalesBreakdownScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (Platform.OS === 'ios' ? 44 : 56);
  return (
    <ThemedView style={[styles.container, { paddingTop: headerHeight }] }>
      <Header title="Sales Breakdown" />
      <ThemedText type="title">Analytics</ThemedText>
      <ThemedText>Placeholder for detailed sales breakdown graphs and metrics.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 