import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DeliveryPerformanceScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (Platform.OS === 'ios' ? 44 : 56);
  return (
    <ThemedView style={[styles.container, { paddingTop: headerHeight }] }>
      <Header title="Delivery Performance" />
      <ThemedText type="title">Delivery Performance</ThemedText>
      <ThemedText>Placeholder for delivery partner performance metrics.</ThemedText>
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