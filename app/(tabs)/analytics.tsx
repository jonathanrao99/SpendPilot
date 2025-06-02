import React from 'react';
import { View, ScrollView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import ScreenHeader from '@/components/ScreenHeader';

const HEADER_HEIGHT = 80;
const kpis = [
  { label: 'Total Sales', value: '$12,500' },
  { label: 'Avg Order', value: '$42.30' },
  { label: 'Top Product', value: 'Paneer Tikka' },
  { label: 'Returning', value: '38%' },
];
const salesTrend = [4, 7, 5, 9, 7, 3, 2];
const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const chartWidth = 320;
const chartHeight = 120;
const maxValue = 10;
const minValue = 0;
const points = salesTrend.map((v, i) => {
  const x = (i / (salesTrend.length - 1)) * chartWidth;
  const y = chartHeight - ((v - minValue) / (maxValue - minValue)) * chartHeight;
  return { x, y };
});
const pathStr = points.reduce((acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`), '');

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Analytics" />
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
        {/* Animated Line Chart */}
        <Text style={styles.sectionTitle}>Sales Trend</Text>
        <View style={styles.chartCard}>
          <Canvas style={{ width: chartWidth, height: chartHeight }}>
            <Path
              path={Skia.Path.MakeFromSVGString(pathStr) || Skia.Path.Make()}
              color={'#7C3AED'}
              style="stroke"
              strokeWidth={3}
            />
          </Canvas>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            {chartLabels.map((label) => (
              <Text key={label} style={styles.chartLabel}>{label}</Text>
            ))}
          </View>
        </View>
        {/* Sectioned Layout */}
        <Text style={styles.sectionTitle}>Trends</Text>
        <Card style={styles.sectionCard}><Card.Content><Text>Sales are up 12% this week.</Text></Card.Content></Card>
        <Text style={styles.sectionTitle}>Breakdown</Text>
        <Card style={styles.sectionCard}><Card.Content><Text>Top category: Food (60%)</Text></Card.Content></Card>
        <Text style={styles.sectionTitle}>Insights</Text>
        <Card style={styles.sectionCard}><Card.Content><Text>Returning customers are increasing.</Text></Card.Content></Card>
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