// app/settings/build-report.tsx
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Button, List, Text } from 'react-native-paper';

import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import { useBills } from '@/context/BillsContext';
import { useDelivery } from '@/context/DeliveryContext';

export default function BuildReportScreen() {
  const router = useRouter();
  const { bills } = useBills();
  const { records } = useDelivery();
  const [from, setFrom] = useState<Date>(new Date());
  const [to, setTo] = useState<Date>(new Date());
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [loading, setLoading] = useState(false);

  // filter data
  const filteredOrders = records.filter(r => r.date >= from && r.date <= to);
  const filteredBills = bills.filter(b => {
    const d = new Date(b.date);
    return d >= from && d <= to;
  });

  const generate = async () => {
    setLoading(true);
    // simple HTML report
    const html = `
      <h1>Report ${from.toDateString()} – ${to.toDateString()}</h1>
      <h2>Orders (${filteredOrders.length})</h2>
      <ul>${filteredOrders.map(o=>`<li>${o.date.toDateString()}: $${o.grossSales}</li>`).join('')}</ul>
      <h2>Bills (${filteredBills.length})</h2>
      ${filteredBills.map(b=>`<p>${b.storeName} – ${b.date}</p><img src="${b.imageUri}" style="width:200px;" />`).join('')}
    `;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
    setLoading(false);
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Build Report" showAvatar={false} />
      <ScrollView contentContainerStyle={styles.content}>
        <Button onPress={() => setShowFrom(true)}>From: {from.toDateString()}</Button>
        <DateTimePickerModal
          isVisible={showFrom}
          mode="date"
          onConfirm={d => { setFrom(d); setShowFrom(false); }}
          onCancel={() => setShowFrom(false)}
        />
        <Button onPress={() => setShowTo(true)}>To: {to.toDateString()}</Button>
        <DateTimePickerModal
          isVisible={showTo}
          mode="date"
          onConfirm={d => { setTo(d); setShowTo(false); }}
          onCancel={() => setShowTo(false)}
        />
        <List.Section title="Filters">
          <Text>Orders: {filteredOrders.length}</Text>
          <Text>Bills: {filteredBills.length}</Text>
        </List.Section>
        <Button mode="contained" onPress={generate} loading={loading} style={styles.button}>
          Generate PDF
        </Button>
        <Button onPress={() => router.back()} style={styles.button}>
          ← Back
        </Button>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, paddingTop: Platform.OS==='ios'?60:70 },
  content: { padding:16 },
  button: { marginVertical:12 },
});