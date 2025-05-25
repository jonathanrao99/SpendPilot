import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, ProgressBar, Button, useTheme } from 'react-native-paper';
import Feather from '@expo/vector-icons/Feather';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import Colors from '@/constants/Colors';

const businessData = {
  totalBalance: 19074.45,
  revenue: 4352.9,
  expenses: 2180.75,
  overview: [
    { label: 'Mon', value: 4.2 },
    { label: 'Tue', value: 7.1 },
    { label: 'Wed', value: 5.6 },
    { label: 'Thu', value: 9.2 },
    { label: 'Fri', value: 7.5 },
    { label: 'Sat', value: 3.1 },
    { label: 'Sun', value: 2.8 },
  ],
  categories: [
    {
      icon: 'home',
      label: 'Rent',
      color: '#A78BFA',
      spent: 1200,
      budget: 1500,
    },
    {
      icon: 'users',
      label: 'Payroll',
      color: '#34D399',
      spent: 4500,
      budget: 6000,
    },
    {
      icon: 'briefcase',
      label: 'Operations',
      color: '#818CF8',
      spent: 900,
      budget: 1200,
    },
    {
      icon: 'bar-chart-2',
      label: 'Marketing',
      color: '#F472B6',
      spent: 700,
      budget: 1000,
    },
  ],
};

const timeFrames = ['Week', 'Month', 'Year'];
const HEADER_HEIGHT = 100;

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [selectedTime, setSelectedTime] = useState('Week');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.headerRow, { backgroundColor: colors.background }]}> 
        <Text style={[styles.greeting, { color: colors.onSurface }]}>Hi, Desi Flavors Katy</Text>
        <TouchableOpacity style={styles.bellBtn}>
          <View style={styles.bellCircle}>
            <Feather name="bell" size={22} color={colors.onSurface} />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 32 }}
      >
      {/* Total Balance Card */}
      <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}> 
        <Card.Content>
          <Text style={[styles.balanceLabel, { color: Colors.light.white }]}>Total Balance</Text>
          <Text style={[styles.balanceValue, { color: Colors.light.white }]}>${businessData.totalBalance.toLocaleString()}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItemLarge}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.balanceSubLarge, { color: Colors.light.white }]}>Revenue</Text>
                <Feather name="arrow-up-right" size={18} color={Colors.light.green} />
              </View>
              <Text style={[styles.balanceSubValueLarge, { color: Colors.light.white }]}>${businessData.revenue.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceItemLarge}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.balanceSubLarge, { color: Colors.light.white }]}>Expenses</Text>
                <Feather name="arrow-down-right" size={18} color={colors.error || '#EF4444'} />
              </View>
              <Text style={[styles.balanceSubValueLarge, { color: Colors.light.white }]}>${businessData.expenses.toLocaleString()}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Financial Overview */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Financial Overview</Text>
      <View style={styles.toggleRow}>
        {timeFrames.map((frame) => (
          <Button
            key={frame}
            mode={selectedTime === frame ? 'contained' : 'outlined'}
            onPress={() => setSelectedTime(frame)}
            style={styles.toggleBtn}
            labelStyle={{ fontFamily: 'Inter_500Medium' }}
            buttonColor={selectedTime === frame ? colors.primary : colors.background}
            textColor={selectedTime === frame ? Colors.light.white : colors.onSurface}
          >
            {frame}
          </Button>
        ))}
      </View>
      <View style={styles.chartCard}>
        <LineChart
          data={businessData.overview.map((d) => ({ value: d.value, label: d.label }))}
          areaChart
          curved
          color={colors.primary}
          thickness={3}
          hideDataPoints={false}
          yAxisColor={colors.outline}
          xAxisColor={colors.outline}
          yAxisTextStyle={{ color: colors.onSurface, fontFamily: 'Inter_400Regular' }}
          xAxisLabelTextStyle={{ color: colors.onSurface, fontFamily: 'Inter_400Regular' }}
          spacing={24}
          maxValue={10}
          height={180}
          initialSpacing={0}
          noOfSections={4}
          rulesType="solid"
          rulesColor={colors.outline}
          backgroundColor={colors.background}
          showVerticalLines={false}
          showXAxisIndices={false}
          showYAxisIndices={false}
          yAxisThickness={0.5}
          xAxisThickness={0.5}
          xAxisTextNumberOfLines={1}
          yAxisTextNumberOfLines={1}
        />
      </View>

      {/* Budget Categories */}
      <View style={styles.categoriesHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Budget Categories</Text>
        <Button compact mode="text" onPress={() => {}} labelStyle={{ fontFamily: 'Inter_500Medium' }}>
          View All
        </Button>
      </View>
      <View style={{ gap: 16 }}>
        {businessData.categories.map((cat) => {
          const percent = Math.round((cat.spent / cat.budget) * 100);
          return (
            <Card key={cat.label} style={styles.categoryCard}>
              <Card.Content style={styles.categoryContent}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '22' }]}> 
                  <Feather name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.categoryRow}>
                    <Text style={[styles.categoryLabel, { color: colors.onSurface }]}>{cat.label}</Text>
                    <Text style={[styles.categoryPercent, { color: colors.primary }]}>{percent}%</Text>
                  </View>
                  <Text style={styles.categorySub}>{`$${cat.spent.toLocaleString()} / $${cat.budget.toLocaleString()}`}</Text>
                  <ProgressBar progress={cat.spent / cat.budget} color={cat.color} style={styles.progressBar} />
                </View>
              </Card.Content>
            </Card>
          );
        })}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    elevation: 0,
  },
  bellBtn: {
    padding: 0,
    borderRadius: 20,
  },
  bellCircle: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    paddingBottom: 14,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: -80,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 0,
    minHeight: 120,
    paddingVertical: 12,
  },
  balanceLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    opacity: 0.9,
  },
  balanceValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    marginTop: 2,
    marginBottom: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  balanceItemLarge: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 0,
  },
  balanceSubLarge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    marginTop: 6,
    opacity: 0.9,
  },
  balanceSubValueLarge: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    marginLeft: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  toggleBtn: {
    marginHorizontal: 4,
    borderRadius: 20,
    minWidth: 80,
  },
  chartCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    marginHorizontal: 0,
    padding: 12,
    marginBottom: 32,
    paddingBottom: 24,
  },
  categoriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  categoryCard: {
    borderRadius: 16,
    marginHorizontal: 20,
    elevation: 0,
    backgroundColor: '#fff',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  categoryPercent: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  categorySub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
  progressBar: {
    height: 7,
    borderRadius: 8,
    marginTop: 2,
  },
}); 