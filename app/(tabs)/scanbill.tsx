import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
} from 'react-native';
import { Text, useTheme, Button, List } from 'react-native-paper';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';

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
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [budget, setBudget] = useState(1000);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

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
        <View style={[styles.topCard]}>
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
              style={styles.budgetInput}
            />
            <Text>{Math.round(percentUsed * 100)}% used</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bill History</Text>
        <List.Section>
          {Object.entries(groupedBills).map(([month, items]) => (
            <List.Accordion
              key={month}
              title={month}
              titleStyle={{ color: '#7C3AED' }}
              style={{ backgroundColor: '#EDE9FE', borderRadius: 10 }}
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
            <TouchableOpacity style={styles.fabActionBtn}><Feather name="camera" size={22} color="#fff" /><Text>Scan Bill</Text></TouchableOpacity>
            <TouchableOpacity style={styles.fabActionBtn}><Feather name="upload" size={22} color="#fff" /><Text>Upload Bill</Text></TouchableOpacity>
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
  topCard: { margin: 20, padding: 16, borderRadius: 12, backgroundColor: '#F4F4F5' },
  topCardTitle: { fontSize: 16 },
  topCardAmount: { fontSize: 26, fontWeight: 'bold' },
  budgetInput: { marginLeft: 8, minWidth: 60, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 8 },
  billContainer: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 },
  billContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  fabContainer: { position: 'absolute', right: 24, alignItems: 'flex-end' },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  fabActions: { marginBottom: 16 },
  fabActionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7C3AED', padding: 10, borderRadius: 20, marginBottom: 10 },
});
