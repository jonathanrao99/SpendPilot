import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card, Paragraph, Title } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import { useEvents } from '@/context/EventsContext';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (Platform.OS === 'ios' ? 44 : 56);
  const { events } = useEvents();
  const upcomingEvents = events.slice(-3).reverse();
  const screenWidth = Dimensions.get('window').width;
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  };
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{ data: [5, 7, 6, 8, 9] }],
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: headerHeight + 5 }] }>
      <Header />
      <ThemedText type="title">Dashboard</ThemedText>
      <View style={styles.metricsContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Total Revenue</Title>
            <Paragraph>$35,000</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Total Orders</Title>
            <Paragraph>1,200</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Avg. Order Value</Title>
            <Paragraph>$29.17</Paragraph>
          </Card.Content>
        </Card>
      </View>
      <LineChart
        data={revenueData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        withInnerLines={false}
        withOuterLines={false}
        yAxisSuffix="K"
        style={styles.chart}
      />
      {upcomingEvents.length > 0 && (
        <>
          <ThemedText type="subtitle">Upcoming Events</ThemedText>
          {upcomingEvents.map((event) => (
            <Card key={event.id} style={styles.eventCard}>
              <Card.Content>
                <ThemedText type="defaultSemiBold">{event.title}</ThemedText>
                <ThemedText>{event.date}</ThemedText>
              </Card.Content>
            </Card>
          ))}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    marginVertical: 4,
    padding: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
});
