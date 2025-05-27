import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { Text, useTheme, Card, ProgressBar, Button, List } from 'react-native-paper';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import { Canvas, RoundedRect, Skia } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';

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

const defaultBudget = 1000;

const initialBills: Bill[] = [
  { id: '1', store: 'Walmart', date: '2024-06-01', amount: 120.45, image: undefined, category: 'Cooking Supplies', tax: 8.5, total: 120.45 },
  { id: '2', store: 'Best Buy', date: '2024-06-03', amount: 340.00, image: undefined, category: 'Electronics', tax: 25.0, total: 340.00 },
  { id: '3', store: 'Shell', date: '2024-06-05', amount: 60.00, image: undefined, category: 'Gas', tax: 4.2, total: 60.00 },
];

export default function ScanBillScreen() {
  const { colors } = useTheme();
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [budget, setBudget] = useState(defaultBudget);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  const totalSpent = bills.reduce((sum, b) => sum + b.amount, 0);
  const percentUsed = Math.min(1, totalSpent / budget);

  const handleBillPress = (bill: Bill) => {
    setSelectedBill(bill);
    setModalVisible(true);
  };

  // Group bills by month-year
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
        {/* Top Card with Skia Progress */}
        <Card style={[styles.topCard, styles.prominentCard, { backgroundColor: '#EDE9FE', borderColor: '#EDE9FE' }]}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.topCardTitle}>Total Spent</Text>
              <Text style={styles.topCardAmount}>${totalSpent.toFixed(2)}</Text>
            </View>
            <View style={{ marginVertical: 16, alignItems: 'center' }}>
              <Canvas style={{ width: 220, height: 18 }}>
                <RoundedRect x={0} y={0} width={220} height={18} r={9} color={'#E5E7EB'} />
                <RoundedRect x={0} y={0} width={220 * percentUsed} height={18} r={9} color={'#7C3AED'} />
              </Canvas>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.budgetLabel}>Budget:</Text>
              <TextInput
                style={styles.budgetInput}
                value={budget.toString()}
                onChangeText={t => setBudget(Number(t.replace(/[^0-9.]/g, '')))}
                keyboardType="numeric"
                placeholder="$0.00"
              />
              <Text style={styles.percentUsed}>{Math.round(percentUsed * 100)}% used</Text>
            </View>
          </Card.Content>
        </Card>
        {/* Logged Bills Accordion */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 20 }]}>Logged Bills</Text>
        <List.Section>
          {Object.entries(groupedBills).map(([month, items]) => (
            <List.Accordion
              key={month}
              title={month}
              style={{ backgroundColor: '#EDE9FE', borderRadius: 12, marginHorizontal: 10, marginBottom: 4 }}
              titleStyle={{ color: '#7C3AED', fontFamily: 'Inter_700Bold', fontSize: 16 }}
              left={props => <List.Icon {...props} icon="calendar" color="#7C3AED" />}
            >
              {items
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(item => (
                  <TouchableOpacity key={item.id} onPress={() => handleBillPress(item)} activeOpacity={0.8}>
                    <Card style={[styles.billCard, { borderLeftColor: item.category === 'Cooking Supplies' ? '#7C3AED' : item.category === 'Electronics' ? '#22C55E' : item.category === 'Gas' ? '#F59E42' : '#6B7280', width: '95%', alignSelf: 'center' }]}>
                      <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="receipt" size={32} color={colors.primary} style={{ marginRight: 16 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.billStore}>{item.store}</Text>
                          <Text style={styles.billDate}>{item.date}</Text>
                        </View>
                        <Text style={styles.billAmount}>${item.amount.toFixed(2)}</Text>
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                ))}
            </List.Accordion>
          ))}
        </List.Section>
      </ScrollView>
      {/* Bill Modal */}
      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedBill?.store}</Text>
          <Text style={styles.modalDate}>{selectedBill?.date}</Text>
          <Text style={styles.modalAmount}>${selectedBill?.amount?.toFixed(2)}</Text>
          <Text style={styles.modalDetail}>Category: {selectedBill?.category}</Text>
          <Text style={styles.modalDetail}>Tax: ${selectedBill?.tax?.toFixed(2)}</Text>
          <Text style={styles.modalDetail}>Total: ${selectedBill?.total?.toFixed(2)}</Text>
          {/* Placeholder for bill image */}
          <View style={{ height: 120, backgroundColor: '#eee', borderRadius: 12, marginVertical: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="image" size={48} color="#bbb" />
            <Text style={{ color: '#bbb', fontSize: 12 }}>Bill Image</Text>
          </View>
          <Button mode="contained" onPress={() => setModalVisible(false)} style={{ marginTop: 8 }}>Close</Button>
        </View>
      </Modal>
      {/* Floating Action Button */}
      <View style={[styles.fabContainer, { bottom: 90 }]}>
        {fabOpen && (
          <View style={styles.fabActions}>
            <TouchableOpacity style={styles.fabActionBtn} onPress={() => {/* TODO: navigate to scan bill */}}>
              <Feather name="camera" size={22} color="#fff" />
              <Text style={styles.fabActionLabel}>Scan Bill</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabActionBtn} onPress={() => {/* TODO: navigate to upload bill */}}>
              <Feather name="upload" size={22} color="#fff" />
              <Text style={styles.fabActionLabel}>Upload Bill</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.fab} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setFabOpen(o => !o); }}>
          <Feather name={fabOpen ? "x" : "plus"} size={28} color="#fff" />
        </TouchableOpacity>
      </View>
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
  topCard: {
    marginHorizontal: 20,
    marginTop: -80,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 0,
    minHeight: 120,
    paddingVertical: 12,
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  prominentCard: {},
  topCardTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  topCardAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#18181B',
  },
  budgetLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  budgetInput: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#18181B',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 70,
    textAlign: 'right',
    marginHorizontal: 8,
  },
  percentUsed: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  billCard: {
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  billStore: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#18181B',
  },
  billDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  billAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#18181B',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#18181B',
  },
  modalDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#7C3AED',
    marginBottom: 8,
  },
  modalDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#18181B',
    marginBottom: 2,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    alignItems: 'flex-end',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  fabActions: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  fabActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
    elevation: 3,
  },
  fabActionLabel: {
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    marginLeft: 8,
  },
}); 