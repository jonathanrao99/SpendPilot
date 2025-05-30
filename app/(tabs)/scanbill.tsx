import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
  Animated,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Share,
} from 'react-native';
import {
  Text,
  useTheme,
  Button,
  Card,
  TextInput,
  Chip,
  Menu,
  Switch,
  Divider,
} from 'react-native-paper';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import { Canvas, RoundedRect, Path as SkiaPath, Skia } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBills, Bill } from '@/components/BillsContext';

const HEADER_OFFSET = Platform.OS === 'ios' ? 44 : 56;

const getCategoryColor = (category: string, themeColors: any): string => {
  switch (category) {
    case 'Cooking Supplies': return themeColors.primary;
    case 'Electronics': return themeColors.success;
    case 'Gas': return themeColors.warning;
    default: return themeColors.onSurfaceVariant;
  }
};

function TotalSpentCard({ totalSpent, budget, percentUsed, dailySpend, onBudgetChange }: { totalSpent: number, budget: number, percentUsed: number, dailySpend: number[], onBudgetChange: (newBudget: number) => void }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(budget.toString());
  useEffect(() => { setBudgetValue(budget.toString()); }, [budget]);
  const avg = dailySpend.length ? (dailySpend.reduce((a, b) => a + b, 0) / dailySpend.length) : 0;
  const max = Math.max(...dailySpend);
  const projected = avg * 30;
  const progress = Math.min(1, percentUsed);
  const overBudget = percentUsed > 1;
  const progressColor = overBudget ? '#EF4444' : '#7C3AED';
  return (
    <Card style={{ backgroundColor: '#EDE0FD', borderRadius: 16, marginBottom: 16, overflow: 'hidden' }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#7C3AED' }}>${totalSpent.toFixed(2)}</Text>
          {overBudget && (
            <View style={{ backgroundColor: '#F472B6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Over Budget</Text>
            </View>
          )}
        </View>
        {/* Progress bar */}
        <View style={{ marginTop: 8, marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <View style={{ flex: 1, height: 10, backgroundColor: '#DDD6FE', borderRadius: 5, overflow: 'hidden', marginRight: 8 }}>
              <View style={{ width: `${Math.min(100, percentUsed * 100)}%`, height: '100%', backgroundColor: progressColor, borderRadius: 5 }} />
            </View>
            <Text style={{ fontSize: 13, color: progressColor, fontWeight: '600' }}>{Math.round(percentUsed * 100)}%</Text>
          </View>
          {/* Editable budget display */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#7C3AED', fontWeight: '500' }}>${totalSpent.toFixed(2)} of </Text>
            {isEditingBudget ? (
              <TextInput
                mode="flat"
                value={budgetValue}
                keyboardType="numeric"
                onChangeText={setBudgetValue}
                onBlur={() => {
                  const num = parseFloat(budgetValue) || budget;
                  onBudgetChange(num);
                  setIsEditingBudget(false);
                }}
                onSubmitEditing={() => {
                  const num = parseFloat(budgetValue) || budget;
                  onBudgetChange(num);
                  setIsEditingBudget(false);
                }}
                autoFocus
                style={{ backgroundColor: 'transparent', padding: 0, borderBottomColor: '#7C3AED', borderBottomWidth: 1 }}
              />
            ) : (
              <TouchableOpacity onPress={() => setIsEditingBudget(true)}>
                <Text style={{ fontSize: 13, color: '#7C3AED', fontWeight: '600', textDecorationLine: 'underline' }}>${budget}</Text>
              </TouchableOpacity>
            )}
            <Text style={{ fontSize: 13, color: '#7C3AED', fontWeight: '500' }}> used</Text>
          </View>
        </View>
        {/* Sparkline */}
        <View style={{ marginTop: 8, marginBottom: 2 }}>
          <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>Last 7 days</Text>
          <Sparkline data={dailySpend} color="#7C3AED" height={28} />
        </View>
        {/* Collapsible metrics */}
        <TouchableWithoutFeedback onPress={() => setExpanded(e => !e)}>
          <View style={{ marginTop: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#DDD6FE', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#7C3AED', fontWeight: '600' }}>More metrics</Text>
            <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#7C3AED" />
          </View>
        </TouchableWithoutFeedback>
        {expanded && (
          <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Avg/Bill</Text>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#7C3AED' }}>${avg.toFixed(2)}</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Max Bill</Text>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#7C3AED' }}>${max.toFixed(2)}</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Projected/Month</Text>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#7C3AED' }}>${projected.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

function Sparkline({ data, color, height = 28 }: { data: number[], color: string, height?: number }) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 32;
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * cardWidth, y: height - ((v - min) / (max - min || 1)) * height }));
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const midX = (p0.x + p1.x) / 2, midY = (p0.y + p1.y) / 2;
    d += ` Q${p0.x},${p0.y} ${midX},${midY}`;
  }
  const last = pts[pts.length - 1];
  d += ` T${last.x},${last.y}`;
  const path = Skia.Path.MakeFromSVGString(d)!;
  return (
    <Canvas style={{ width: cardWidth, height }}>
      <SkiaPath path={path} color={color} style="stroke" strokeWidth={2} />
    </Canvas>
  );
}

function MiniKPI({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.green + '22', borderRadius: 12, alignItems: 'center', padding: 14, marginHorizontal: 4, flexDirection: 'row', gap: 8 }}>
      {icon}
      <View>
        <Text style={{ fontSize: 13, color: Colors.light.green, fontWeight: '600' }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.light.green }}>{value}</Text>
      </View>
    </View>
  );
}

export default function ScanBillScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  // Use bills from context
  const { bills, setBills } = useBills();

  const [budget, setBudget] = useState(1000);
  const [taxRate, setTaxRate] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterFromDate, setFilterFromDate] = useState<Date | null>(null);
  const [filterToDate, setFilterToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [filterStore, setFilterStore] = useState<string | null>(null);
  const [storeMenuVisible, setStoreMenuVisible] = useState(false);
  const storeNames = Array.from(new Set(bills.map(b => b.store)));
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const categories = Array.from(new Set(bills.map(b => b.category)));
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');
  const [filterHasTax, setFilterHasTax] = useState<boolean | null>(null);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sort and take 5 most recent bills
  const recentBills = [...bills]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalSpent = bills.reduce((sum, b) => sum + b.amount, 0);
  const percentUsed = Math.min(1, totalSpent / budget);
  const taxPaid = Math.round((totalSpent * taxRate) / 100 * 100) / 100;

  // Last 7 days daily spend
  const dailySpendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    return bills.filter(b => b.date.startsWith(dayStr)).reduce((sum, b) => sum + b.amount, 0);
  });
  // Total bills
  const totalBillsCount = bills.length;
  // Last scan date
  const mostRecentTs = bills.length ? Math.max(...bills.map(b => new Date(b.date).getTime())) : null;
  const mostRecentDate = mostRecentTs ? new Date(mostRecentTs) : null;
  const formattedLastScan = mostRecentDate
    ? (() => {
        const day = mostRecentDate.getDate();
        const suffix = day % 10 === 1 && day !== 11
          ? 'st'
          : day % 10 === 2 && day !== 12
          ? 'nd'
          : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day}${suffix} ${monthNames[mostRecentDate.getMonth()]}`;
      })()
    : '-';

  // Apply filters
  const filteredBills = bills.filter(b => {
    const date = new Date(b.date);
    if (filterFromDate && date < filterFromDate) return false;
    if (filterToDate && date > filterToDate) return false;
    if (filterStore && b.store !== filterStore) return false;
    if (filterCategory && b.category !== filterCategory) return false;
    if (filterMinAmount && b.amount < parseFloat(filterMinAmount)) return false;
    if (filterMaxAmount && b.amount > parseFloat(filterMaxAmount)) return false;
    if (filterHasTax != null) {
      if (filterHasTax && b.tax === 0) return false;
      if (!filterHasTax && b.tax > 0) return false;
    }
    return true;
  });
  // Top categories
  const categoryTotals = bills.reduce((acc, b) => {
    if (b.category && b.category.trim() !== '') {
      acc[b.category] = (acc[b.category] || 0) + b.amount;
    }
    return acc;
  }, {} as Record<string, number>);
  const topCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 3);
  // Handlers
  const handleDownloadAll = async () => {
    const csv = ['Store,Date,Amount,Category,Tax,Total', ...filteredBills.map(b => `${b.store},${b.date},${b.amount},${b.category},${b.tax},${b.total}`)].join('\n');
    try { await Share.share({ message: csv, title: 'Export Bills CSV' }); } catch (e) { console.error(e); }
  };
  const handleBulkDelete = () => { setBills(curr => curr.filter(b => !selectedIds.includes(b.id))); setSelectedIds([]); setBulkSelectMode(false); };
  const handleBulkExport = async () => {
    const sel = bills.filter(b => selectedIds.includes(b.id));
    const csv = ['Store,Date,Amount,Category,Tax,Total', ...sel.map(b => `${b.store},${b.date},${b.amount},${b.category},${b.tax},${b.total}`)].join('\n');
    try { await Share.share({ message: csv, title: 'Export Selected Bills CSV' }); } catch (e) { console.error(e); }
    setBulkSelectMode(false);
    setSelectedIds([]);
  };
  const handleLongPress = (id: string) => { if (!bulkSelectMode) { setBulkSelectMode(true); setSelectedIds([id]); } };
  const handleSelect = (id: string) => { if (bulkSelectMode) { setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]); } };

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
      <Modal isVisible={filterModalVisible} onBackdropPress={() => setFilterModalVisible(false)}>
        <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 16, width: '90%', alignSelf: 'center', maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: '700' }}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Feather name="x" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>
          <Divider style={{ marginVertical: 12 }} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 8 }}>Date Range</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <TouchableOpacity onPress={() => setShowFromPicker(true)} style={{ flex: 1, marginRight: 8 }}>
                <TextInput label="From" value={filterFromDate ? filterFromDate.toDateString() : ''} editable={false} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowToPicker(true)} style={{ flex: 1 }}>
                <TextInput label="To" value={filterToDate ? filterToDate.toDateString() : ''} editable={false} />
              </TouchableOpacity>
            </View>
            {showFromPicker && <DateTimePicker value={filterFromDate || new Date()} mode="date" display="default" onChange={(e, d) => { setShowFromPicker(false); if (d) setFilterFromDate(d); }} />}
            {showToPicker && <DateTimePicker value={filterToDate || new Date()} mode="date" display="default" onChange={(e, d) => { setShowToPicker(false); if (d) setFilterToDate(d); }} />}
            <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 16 }}>Store</Text>
            <Menu visible={storeMenuVisible} onDismiss={() => setStoreMenuVisible(false)} anchor={<TouchableOpacity onPress={() => setStoreMenuVisible(true)}><TextInput label="Store" value={filterStore || ''} editable={false} style={{ marginTop: 4 }} /></TouchableOpacity>}>
              {storeNames.map(s => <Menu.Item key={s} title={s} onPress={() => { setFilterStore(s); setStoreMenuVisible(false); }} />)}
            </Menu>
            <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 16 }}>Category</Text>
            <Menu visible={categoryMenuVisible} onDismiss={() => setCategoryMenuVisible(false)} anchor={<TouchableOpacity onPress={() => setCategoryMenuVisible(true)}><TextInput label="Category" value={filterCategory || ''} editable={false} style={{ marginTop: 4 }} /></TouchableOpacity>}>
              {categories.map(c => <Menu.Item key={c} title={c} onPress={() => { setFilterCategory(c); setCategoryMenuVisible(false); }} />)}
            </Menu>
            <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 16 }}>Amount Range</Text>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <TextInput label="Min" value={filterMinAmount} keyboardType="numeric" onChangeText={setFilterMinAmount} style={{ flex: 1, marginRight: 8 }} />
              <TextInput label="Max" value={filterMaxAmount} keyboardType="numeric" onChangeText={setFilterMaxAmount} style={{ flex: 1 }} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 16 }}>Tax Status</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ flex: 1 }}>Has Tax?</Text>
              <Switch value={filterHasTax === true} onValueChange={v => setFilterHasTax(v)} />
            </View>
          </ScrollView>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button onPress={() => { setFilterFromDate(null); setFilterToDate(null); setFilterStore(null); setFilterCategory(null); setFilterMinAmount(''); setFilterMaxAmount(''); setFilterHasTax(null); }}>Reset</Button>
            <Button mode="contained" style={{ marginLeft: 8 }} onPress={() => setFilterModalVisible(false)}>Apply</Button>
          </View>
        </View>
      </Modal>
      <ScreenHeader title="Scan Bill" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TotalSpentCard totalSpent={totalSpent} budget={budget} percentUsed={percentUsed} dailySpend={dailySpendData} onBudgetChange={setBudget} />
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <MiniKPI icon={<Feather name="file-plus" size={22} color={Colors.light.green} />} label="Total Bills" value={totalBillsCount} />
          <MiniKPI icon={<Feather name="clock" size={22} color={Colors.light.green} />} label="Last Scan" value={formattedLastScan} />
        </View>
        {/* Top Categories section */}
        {topCategories.length > 0 && (
          <>
            <View style={styles.historyHeader}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Top Categories</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 16 }}>
              {topCategories.map(([cat, total]) => (
                <MiniKPI
                  key={cat}
                  icon={getCategoryIcon(cat)}
                  label={cat}
                  value={`$${total.toFixed(2)}`}
                />
              ))}
            </View>
          </>
        )}
        {bulkSelectMode && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
            <Button icon="delete" mode="contained" onPress={handleBulkDelete}>Delete ({selectedIds.length})</Button>
            <Button icon="download" mode="contained" onPress={handleBulkExport}>Export ({selectedIds.length})</Button>
          </View>
        )}
        <View style={styles.historyHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Bill History</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleDownloadAll} style={{ padding: 8 }}>
              <Feather name="download" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
              <Feather name="filter" size={20} color={colors.primary} />
              <Text style={{ marginLeft: 4, color: colors.primary }}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
        {filteredBills
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(item => {
            // Format date as MM/DD/YYYY
            let formattedDate = item.date;
            if (formattedDate.length >= 10) {
              const [y, m, d] = formattedDate.slice(0, 10).split('-');
              formattedDate = `${m}/${d}/${y}`;
            }
            return (
              <Swipeable key={item.id} renderRightActions={() => renderRightActions(item)}>
                <Pressable
                  onPress={() => bulkSelectMode ? handleSelect(item.id) : handleBillPress(item)}
                  onLongPress={() => handleLongPress(item.id)}
                  style={[styles.billItem, { borderLeftColor: getCategoryColor(item.category, colors) }, bulkSelectMode && selectedIds.includes(item.id) ? { backgroundColor: Colors.light.grey } : {}]}
                >
                  {getCategoryIcon(item.category)}
                  <View style={styles.billText}>
                    <Text>{item.store}</Text>
                    <Text style={{ color: colors.onSurfaceVariant }}>{formattedDate}</Text>
                  </View>
                  <Text>${item.amount.toFixed(2)}</Text>
                </Pressable>
              </Swipeable>
            );
          })}
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
  container: { flex: 1, paddingTop: -35 },
  scrollContent: { padding: 16, paddingBottom: 200, paddingTop: -25 },
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
  txCard: { width: 120, height: 120, borderRadius: 12, overflow: 'hidden' },
  txContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  txLabel: { fontSize: 14, fontWeight: '600', color: Colors.light.green },
  txAmount: { fontSize: 16, fontWeight: 'bold', color: Colors.light.green },
});
