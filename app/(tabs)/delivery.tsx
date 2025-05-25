import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';

const HEADER_HEIGHT = 100;

const metrics = [
  { label: 'Total Orders', value: '1,230' },
  { label: 'Avg Delivery Time', value: '32 min' },
  { label: 'Top Platform', value: 'UberEats' },
  { label: 'On-Time Rate', value: '94%' },
];

export default function DeliveryScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.headerRow, { backgroundColor: colors.background }]}> 
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Delivery</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 32 }}>
        <View style={styles.metricsRow}>
          {metrics.map((m) => (
            <Card key={m.label} style={styles.metricCard}>
              <Card.Content>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricValue}>{m.value}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={{ color: colors.onSurface, fontFamily: 'Inter_400Regular', fontSize: 16 }}>
            Delivery platform performance (Grubhub, UberEats, DoorDash) will appear here.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    elevation: 0,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  metricCard: {
    width: '47%',
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    elevation: 0,
  },
  metricLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  metricValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    marginTop: 4,
    color: '#18181B',
  },
}); 