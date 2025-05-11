<<<<<<< HEAD
// app/(tabs)/delivery-performance.tsx
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import React, { useMemo, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Button, Card, Chip, IconButton, Modal, Paragraph, Portal, Title } from 'react-native-paper';
import XLSX from 'xlsx';

import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import { OrderRecord, PlatformType, useDelivery } from '@/context/DeliveryContext';

const screenWidth = Dimensions.get('window').width;
const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0,122,255,${opacity})`,
};

export default function DeliveryPerformanceScreen() {
  const [filter, setFilter] = useState<PlatformType>('all');
  const { records, addRecords, clearRecords } = useDelivery();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadPlatform, setUploadPlatform] = useState<PlatformType | null>(null);
  const [pendingFiles, setPendingFiles] = useState<any[]>([]);

  // Filtered data slice
  const data = useMemo(() => {
    return filter === 'all'
      ? records
      : records.filter(r => r.platform === filter);
  }, [records, filter]);

  // KPI computations
  const totalOrders = data.length;
  const totalGross = data.reduce((sum, r) => sum + r.grossSales, 0);
  const totalNet = data.reduce((sum, r) => sum + r.netPayout, 0);
  const avgOrder = totalOrders ? totalGross / totalOrders : 0;

  const openUploadModal = () => setUploadModalVisible(true);
  const pickFiles = async () => {
    // Allow picking multiple documents
    const res: any = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      multiple: true,
      copyToCacheDirectory: true,
    });
    // New API returns `canceled` boolean and `assets` array
    if (res.canceled) return;
    const assets = res.assets as { uri: string; name: string }[];
    const files = assets.map(a => ({ uri: a.uri, name: a.name }));
    setPendingFiles(prev => [...prev, ...files]);
  };
  const processFiles = async () => {
    if (!uploadPlatform) return;
    let allParsed: OrderRecord[] = [];
    for (const file of pendingFiles) {
      const content = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.UTF8 });
      let parsed: OrderRecord[] = [];
      if (file.name.endsWith('.csv')) {
        const { data: rows } = Papa.parse<any>(content, { header: true });
        parsed = rows.map(r => ({
          id: r['Order ID'] || Math.random().toString(),
          date: new Date(r['Date']),
          platform: uploadPlatform,
          itemsCount: +r['Items'] || 0,
          grossSales: +r['Gross Sales'] || 0,
          netPayout: +r['Net Payout'] || 0,
          fees: +r['Fees'] || 0,
          tip: +r['Tip'] || 0,
        }));
      } else {
        const wb = XLSX.read(content, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);
        parsed = rows.map(r => ({
          id: r['Order ID'] || Math.random().toString(),
          date: new Date(r['Date']),
          platform: uploadPlatform,
          itemsCount: +r['Items'] || 0,
          grossSales: +r['Gross Sales'] || 0,
          netPayout: +r['Net Payout'] || 0,
          fees: +r['Fees'] || 0,
          tip: +r['Tip'] || 0,
        }));
      }
      allParsed = allParsed.concat(parsed);
    }
    addRecords(allParsed);
    setPendingFiles([]);
    setUploadPlatform(null);
    setUploadModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="Delivery" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.filterRow}>
          {(['grubhub','ubereats','doordash'] as PlatformType[]).map(p => (
            <Chip
              key={p}
              selected={filter === p}
              onPress={() => setFilter(filter === p ? 'all' : p)}
              style={styles.chip}
            >
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </Chip>
          ))}
        </View>
        <Button mode="outlined" onPress={openUploadModal} style={styles.uploadBtn}>
          Upload CSV / Excel
        </Button>
        <Portal>
          <Modal
            visible={uploadModalVisible}
            onDismiss={() => {
              setUploadModalVisible(false);
              setPendingFiles([]);
              setUploadPlatform(null);
            }}
            contentContainerStyle={styles.modalContainer}
          >
            <Title>Select Platform</Title>
            <View style={styles.filterRow}>
              {(['grubhub','ubereats','doordash'] as PlatformType[]).map(p => (
                <Chip
                  key={p}
                  selected={uploadPlatform === p}
                  onPress={() => setUploadPlatform(p)}
                  style={styles.chip}
                >
                  {p.charAt(0).toUpperCase()+p.slice(1)}
                </Chip>
              ))}
            </View>
            <Button
              mode="outlined"
              onPress={pickFiles}
              disabled={!uploadPlatform}
              style={{ marginVertical: 8 }}
            >
              Select Files
            </Button>
            <Title style={{ marginVertical: 8 }}>Selected Files</Title>
            <View style={styles.fileListContainer}>
              <ScrollView>
                {pendingFiles.length > 0 ? pendingFiles.map(file => (
                  <View key={file.uri} style={styles.fileRow}>
                    <Paragraph style={styles.fileName}>{file.name}</Paragraph>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => setPendingFiles(prev => prev.filter(f => f.uri !== file.uri))}
                    />
                  </View>
                )) : (
                  <Paragraph>No files selected</Paragraph>
                )}
              </ScrollView>
            </View>
            <Button
              mode="contained"
              onPress={processFiles}
              disabled={!uploadPlatform || pendingFiles.length === 0}
            >
              Process
            </Button>
          </Modal>
        </Portal>
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}><Card.Content>
            <Title>Orders</Title><Paragraph>{totalOrders}</Paragraph>
          </Card.Content></Card>
          <Card style={styles.kpiCard}><Card.Content>
            <Title>Gross</Title><Paragraph>${totalGross.toFixed(2)}</Paragraph>
          </Card.Content></Card>
          <Card style={styles.kpiCard}><Card.Content>
            <Title>Avg Value</Title><Paragraph>${avgOrder.toFixed(2)}</Paragraph>
          </Card.Content></Card>
        </View>
        {data.length > 0 ? (
          <>
            <LineChart
              data={{
                labels: data.map(r => r.date.toISOString().slice(5,10)),
                datasets: [{ data: data.map(r => r.grossSales) }],
              }}
              width={screenWidth-32}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
            />
            <BarChart
              data={{
                labels: data.map(r => r.date.toISOString().slice(5,10)),
                datasets: [{ data: data.map(r => r.netPayout) }],
              }}
              width={screenWidth-32}
              height={200}
              chartConfig={chartConfig}
              yAxisLabel="$"
              yAxisSuffix=""
              style={styles.chart}
            />
          </>
        ) : (
          <Paragraph>No delivery data yet. Upload CSV/Excel to see charts.</Paragraph>
        )}
      </ScrollView>
=======
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
>>>>>>> 8189ee61bcc1da1cca4c311014d1546dbb150c8e
    </ThemedView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex:1, paddingTop: Platform.OS==='ios'?60:70 },
  content: { padding:16 },
  filterRow: { flexDirection:'row', justifyContent:'space-around', marginBottom:16 },
  chip: { flex:1, margin:4 },
  uploadBtn: { marginBottom:24 },
  kpiRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:24 },
  kpiCard: { flex:1, margin:4 },
  chart: { marginVertical:8, borderRadius:8 },
  modalContainer: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 12,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fileListContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    padding: 8,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fileName: { flex: 1 },
});
=======
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
>>>>>>> 8189ee61bcc1da1cca4c311014d1546dbb150c8e
