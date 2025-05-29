import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  useTheme,
  Button,
  Card,
  TextInput,
} from 'react-native-paper';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const HEADER_OFFSET = Platform.OS === 'ios' ? 44 : 56;
const HEADER_HEIGHT = HEADER_OFFSET;

type Bill = {
  id: string;
  store: string;
  date: string;
  amount: number;
  category: string;
  tax: number;
  total: number;
};

const initialBills: Bill[] = [
  { id: '1', store: 'Walmart', date: '2024-06-01', amount: 120.45, category: 'Cooking Supplies', tax: 8.5, total: 120.45 },
  { id: '2', store: 'Best Buy', date: '2024-06-03', amount: 340.0, category: 'Electronics', tax: 25.0, total: 340.0 },
  { id: '3', store: 'Shell', date: '2024-06-05', amount: 60.0, category: 'Gas', tax: 4.2, total: 60.0 },
  { id: '4', store: 'Target', date: '2024-05-28', amount: 80.0, category: 'Groceries', tax: 6.0, total: 80.0 },
  { id: '5', store: 'Starbucks', date: '2024-05-27', amount: 15.25, category: 'Food', tax: 1.25, total: 15.25 },
  { id: '6', store: 'Home Depot', date: '2024-05-20', amount: 200.0, category: 'Hardware', tax: 16.0, total: 200.0 },
];

const getCategoryColor = (category: string, themeColors: any): string => {
  switch (category) {
    case 'Cooking Supplies': return themeColors.primary;
    case 'Electronics': return themeColors.success;
    case 'Gas': return themeColors.warning;
    default: return themeColors.onSurfaceVariant;
  }
};

export default function ScanBillScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [budget, setBudget] = useState(1000);
  const [taxRate, setTaxRate] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  // Sort and take 5 most recent bills
  const recentBills = [...bills]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalSpent = bills.reduce((sum, b) => sum + b.amount, 0);
  const percentUsed = Math.min(1, totalSpent / budget);
  const taxPaid = Math.round((totalSpent * taxRate) / 100 * 100) / 100;

  const handleBillPress = (bill: Bill) => {
    setSelectedBill(bill);
    setModalVisible(true);
  };

  const handleDelete = (bill: Bill) => {
    Alert.alert('Delete Bill', 'Are you sure you want to delete this bill?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setBills(curr => curr.filter(b => b.id !== bill.id)) },
    ]);
  };

  const renderRightActions = (bill: Bill) => (
    <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: colors.error }]} onPress={() => handleDelete(bill)}>
      <Feather name="trash-2" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const handleFabScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/camera-crop' });
  };
  const handleFabUpload = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 1 });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      router.push({ pathname: '/newbill', params: { images: JSON.stringify(uris) } });
    }
  };

  const getCategoryIcon = (category: string) => {
    const color = getCategoryColor(category, colors);
    switch (category) {
      case 'Cooking Supplies': return <Feather name="shopping-bag" size={24} color={color} style={{ marginRight: 10 }} />;
      case 'Electronics': return <MaterialIcons name="devices-other" size={24} color={color} style={{ marginRight: 10 }} />;
      case 'Gas': return <MaterialIcons name="local-gas-station" size={24} color={color} style={{ marginRight: 10 }} />;
      case 'Groceries': return <Feather name="shopping-cart" size={24} color={color} style={{ marginRight: 10 }} />;
      case 'Food': return <Feather name="coffee" size={24} color={color} style={{ marginRight: 10 }} />;
      case 'Hardware': return <MaterialIcons name="build" size={24} color={color} style={{ marginRight: 10 }} />;
      default: return <MaterialIcons name="receipt" size={24} color={color} style={{ marginRight: 10 }} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Scan Bill</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={[styles.topCard, { backgroundColor: '#EDE0FD' }]}>          
          <Card.Content>
            <Text style={styles.topTitle}>Total Spent</Text>
            <Text style={styles.topAmount}>${totalSpent.toFixed(2)}</Text>
            <Canvas style={styles.progressCanvas}>
              <RoundedRect x={0} y={0} width={220} height={18} r={9} color={colors.backdrop} />
              <RoundedRect x={0} y={0} width={220 * percentUsed} height={18} r={9} color={colors.primary} />
            </Canvas>
            <View style={styles.budgetRow}>
              <Text>Budget:</Text>
              <TextInput
                mode="flat"
                value={budget.toString()}
                onChangeText={t => setBudget(Number(t.replace(/[^0-9.]/g, '')))}
                keyboardType="numeric"
                style={styles.budgetInput}
              />
              <Text>{Math.round(percentUsed * 100)}% used</Text>
            </View>
            <View style={[styles.budgetRow, { marginTop: 12 }]}>                
              <Text>Tax Rate %:</Text>
              <TextInput
                mode="flat"
                value={taxRate.toString()}
                onChangeText={t => setTaxRate(Number(t.replace(/[^0-9.]/g, '')))}
                keyboardType="numeric"
                style={styles.budgetInput}
              />
              <Text>Tax Paid: ${taxPaid.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.historyHeader}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Bill History</Text>
          {/* @ts-ignore: custom route not in typed routes */}
          <TouchableOpacity onPress={() => router.push('/bill-history')}>
            <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentBills.map(item => (
          <Swipeable key={item.id} renderRightActions={() => renderRightActions(item)}>
            <Pressable
              onPress={() => handleBillPress(item)}
              style={[styles.billItem, { borderLeftColor: getCategoryColor(item.category, colors) }]}
            >
              {getCategoryIcon(item.category)}
              <View style={styles.billText}>
                <Text>{item.store}</Text>
                <Text style={{ color: colors.onSurfaceVariant }}>{item.date}</Text>
              </View>
              <Text>${item.amount.toFixed(2)}</Text>
            </Pressable>
          </Swipeable>
        ))}
      </ScrollView>

      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>          
          <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{selectedBill?.store}</Text>
          <Text style={{ color: colors.onSurfaceVariant }}>{selectedBill?.date}</Text>
          <Text style={[styles.modalAmount, { color: colors.primary }]}>${selectedBill?.amount.toFixed(2)}</Text>
          <Text style={{ color: colors.onSurface }}>Category: {selectedBill?.category}</Text>
          <Text style={{ color: colors.onSurface }}>Tax: ${selectedBill?.tax.toFixed(2)}</Text>
          <Text style={{ color: colors.onSurface }}>Total: ${selectedBill?.total.toFixed(2)}</Text>
          <Button mode="contained" onPress={() => setModalVisible(false)} style={{ marginTop: 12 }}>
            Close
          </Button>
        </View>
      </Modal>

      <View style={[styles.fabContainer, { bottom: 120 }]}>        
        {fabOpen && (
          <View style={styles.fabActions}>
            <TouchableOpacity style={styles.fabAction} onPress={handleFabScan}>
              <Feather name="camera" size={20} color="#fff" />
              <Text style={styles.fabText}>Scan Bill</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabAction} onPress={handleFabUpload}>
              <Feather name="upload" size={20} color="#fff" />
              <Text style={styles.fabText}>Upload Bill</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setFabOpen(o => !o)}>
          <Feather name={fabOpen ? 'x' : 'plus'} size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { height: HEADER_HEIGHT, justifyContent: 'center', paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 200 },
  topCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topTitle: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  topAmount: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  progressCanvas: { width: 220, height: 18, marginVertical: 8 },
  budgetRow: { flexDirection: 'row', alignItems: 'center' },
  budgetInput: { marginHorizontal: 8, width: 80, height: 36, backgroundColor: 'transparent', padding: 0 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  viewAll: { fontSize: 14, fontWeight: '500' },
  billItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff' },
  billText: { flex: 1, marginHorizontal: 12 },
  deleteBtn: { justifyContent: 'center', alignItems: 'center', width: 60 },
  modal: { padding: 20, borderRadius: 12, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  modalAmount: { fontSize: 18, fontWeight: '600', marginVertical: 8 },
  fabContainer: { position: 'absolute', right: 16, alignItems: 'flex-end' },
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 4 },
  fabActions: { marginBottom: 16 },
  fabAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2, elevation: 2, backgroundColor: '#7C3AED' },
  fabText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
});
