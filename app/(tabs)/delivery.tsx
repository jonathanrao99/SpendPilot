import React from 'react';
import { View, ScrollView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { Canvas, Rect, Skia } from '@shopify/react-native-skia';

const HEADER_HEIGHT = 80;
const kpis = [
  { label: 'Total Orders', value: '1,230' },
  { label: 'Avg Delivery', value: '32 min' },
  { label: 'Top Platform', value: 'UberEats' },
  { label: 'On-Time Rate', value: '94%' },
];
const platforms = [
  { label: 'UberEats', value: 600, color: '#7C3AED' },
  { label: 'DoorDash', value: 400, color: '#22C55E' },
  { label: 'Grubhub', value: 230, color: '#F59E42' },
];
const maxBar = Math.max(...platforms.map(p => p.value));
const chartWidth = 320;
const chartHeight = 120;
const barWidth = 60;
const barGap = 30;

export default function DeliveryScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerRow}><Text style={styles.headerTitle}>Delivery</Text></View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 32 }}>
        {/* KPI Cards */}
        <View style={[styles.kpiCardContainer, styles.prominentCard]}>
          <FlatList
            data={kpis}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.label}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item }) => (
              <View style={styles.kpiItem}>
                <Text style={styles.kpiLabel}>{item.label}</Text>
                <Text style={styles.kpiValue}>{item.value}</Text>
              </View>
            )}
          />
        </View>
        {/* Animated Bar Chart */}
        <Text style={styles.sectionTitle}>Orders by Platform</Text>
        <View style={styles.chartCard}>
          <Canvas style={{ width: chartWidth, height: chartHeight }}>
            {platforms.map((p, i) => (
              <Rect
                key={p.label}
                x={i * (barWidth + barGap) + 10}
                y={chartHeight - (p.value / maxBar) * chartHeight}
                width={barWidth}
                height={(p.value / maxBar) * chartHeight}
                color={p.color}
                style="fill"
              />
            ))}
          </Canvas>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            {platforms.map((p) => (
              <Text key={p.label} style={styles.chartLabel}>{p.label}</Text>
            ))}
          </View>
        </View>
        {/* Sectioned Layout */}
        <Text style={styles.sectionTitle}>Recent Deliveries</Text>
        <Card style={styles.sectionCard}><Card.Content><Text>UberEats #1234 - Delivered 10 min ago</Text></Card.Content></Card>
        <Card style={styles.sectionCard}><Card.Content><Text>DoorDash #5678 - Delivered 30 min ago</Text></Card.Content></Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    elevation: 0,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#18181B',
  },
  kpiCardContainer: {
    marginHorizontal: 20,
    marginTop: -80,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 0,
    minHeight: 120,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
  },
  prominentCard: {},
  kpiItem: {
    alignItems: 'center',
    marginRight: 18,
  },
  kpiLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  kpiValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    marginTop: 4,
    color: '#7C3AED',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 20,
    padding: 12,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chartLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 4,
    color: '#18181B',
  },
  sectionCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    elevation: 0,
  },
}); 