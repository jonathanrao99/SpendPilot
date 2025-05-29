'use client';

import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { Text, useTheme, Button, List, Card } from 'react-native-paper';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const HEADER_HEIGHT = 100;

type Bill = {
  id: string;
  store: string;
  date: string;
  amount: number;
  image?: string;
  category: string;
  tax: number;
  total: number;
};

const initialBills: Bill[] = [
  { id: '1', store: 'Walmart', date: '2024-06-01', amount: 120.45, category: 'Cooking Supplies', tax: 8.5, total: 120.45 },
  { id: '2', store: 'Best Buy', date: '2024-06-03', amount: 340.0, category: 'Electronics', tax: 25.0, total: 340.0 },
  { id: '3', store: 'Shell', date: '2024-06-05', amount: 60.0, category: 'Gas', tax: 4.2, total: 60.0 },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Cooking Supplies':
      return '#7C3AED';
    case 'Electronics':
      return '#22C55E';
    case 'Gas':
      return '#F59E42';
    default:
      return '#6B7280';
  }
};

export default function ScanBillScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [budget, setBudget] = useState(1000);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  // FAB action handlers: navigate to custom camera/crop screen
  const handleFabScan = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/camera-crop' });
  };
  const handleFabUpload = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        const uris = result.assets.map(a => a.uri);
        router.push({ pathname: '/newbill', params: { images: JSON.stringify(uris) } });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const totalSpent = bills.reduce((sum, b) => sum + b.amount, 0);
  const percentUsed = Math.min(1, totalSpent / budget);

  const handleBillPress = (bill: Bill) => {
    setSelectedBill(bill);
    setModalVisible(true);
  };

  const groupedBills: Record<string, Bill[]> = {};
  bills.forEach(bill => {
    const d = new Date(bill.date);
    const month = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    if (!groupedBills[month]) groupedBills[month] = [];
    groupedBills[month].push(bill);
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerRow}><Text style={styles.headerTitle}>Scan Bill</Text></View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 160 }}>
        {/* Top spend card */}
        <Card style={styles.topCard}>
          <Card.Content>
            <Text style={styles.topCardTitle}>Total Spent</Text>
            <Text style={styles.topCardAmount}>${totalSpent.toFixed(2)}</Text>
            <Canvas style={{ width: 220, height: 18 }}>
              <RoundedRect x={0} y={0} width={220} height={18} r={9} color={'#E5E7EB'} />
              <RoundedRect x={0} y={0} width={220 * percentUsed} height={18} r={9} color={'#7C3AED'} />
            </Canvas>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>Budget:</Text>
              <TextInput
                value={budget.toString()}
                onChangeText={t => setBudget(Number(t.replace(/[^0-9.]/g, '')))}
                keyboardType="numeric"
                style={[styles.budgetInput, { borderBottomColor: '#7C3AED' }]}
              />
              <Text>{Math.round(percentUsed * 100)}% used</Text>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Bill History</Text>
        <List.Section>
          {Object.entries(groupedBills).map(([month, items]) => (
            <List.Accordion
              key={month}
              title={month}
              style={styles.accordion}
              titleStyle={styles.accordionTitle}
            >
              <View style={{ paddingHorizontal: 12 }}>
                {items.map(item => (
                  <Swipeable key={item.id} renderRightActions={() => <View style={{ width: 60 }} />}>
                    <Pressable
                      onPress={() => handleBillPress(item)}
                      style={[styles.billContainer, { borderLeftColor: getCategoryColor(item.category) }]}
                    >
                      <View style={styles.billContent}>
                        <MaterialIcons name="receipt" size={24} color="#7C3AED" style={{ marginRight: 10 }} />
                        <View style={{ flex: 1 }}>
                          <Text>{item.store}</Text>
                          <Text>{item.date}</Text>
                        </View>
                        <Text>${item.amount.toFixed(2)}</Text>
                      </View>
                    </Pressable>
                  </Swipeable>
                ))}
              </View>
            </List.Accordion>
          ))}
        </List.Section>
      </ScrollView>

      {/* Modal */}
      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedBill?.store}</Text>
          <Text>{selectedBill?.date}</Text>
          <Text>${selectedBill?.amount.toFixed(2)}</Text>
          <Text>Category: {selectedBill?.category}</Text>
          <Text>Tax: ${selectedBill?.tax}</Text>
          <Text>Total: ${selectedBill?.total}</Text>
          <Button onPress={() => setModalVisible(false)}>Close</Button>
        </View>
      </Modal>

      {/* FAB */}
      <View style={[styles.fabContainer, { bottom: 120 }]}>
        {fabOpen && (
          <View style={styles.fabActions}>
            <TouchableOpacity style={styles.fabActionBtn} onPress={handleFabScan}>
              <Feather name="camera" size={22} color="#fff" />
              <Text style={styles.fabActionText}>Scan Bill</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabActionBtn} onPress={handleFabUpload}>
              <Feather name="upload" size={22} color="#fff" />
              <Text style={styles.fabActionText}>Upload Bill</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.fab} onPress={() => setFabOpen(o => !o)}>
          <Feather name={fabOpen ? "x" : "plus"} size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { height: HEADER_HEIGHT, justifyContent: 'flex-end', paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  topCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  topCardTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  topCardAmount: { fontSize: 26, fontWeight: '800', color: '#1F2937' },
  budgetInput: { marginLeft: 8, minWidth: 60, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 8 },
  billContainer: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 },
  accordion: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    overflow: 'hidden',
  },
  accordionTitle: { color: '#7C3AED', fontWeight: '600', fontSize: 16 },
  billContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  fabContainer: { position: 'absolute', right: 24, alignItems: 'flex-end' },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  fabActions: { marginBottom: 24 },
  fabActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    marginBottom: 16,
  },
  fabActionText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
});
