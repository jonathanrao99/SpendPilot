// DashboardScreen.tsx
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Button,
  Menu
} from 'react-native-paper';
import Feather from '@expo/vector-icons/Feather';
import {
  Canvas,
  Path,
  Skia,
  vec,
  TileMode
} from '@shopify/react-native-skia';
import { StatusBar } from 'expo-status-bar';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];
type Point = { x: number; y: number };

// --- Dummy data for three timeframes ---
const allData = {
  Daily:   [  800,  950,  700,  900,  850,  920, 1000 ],
  Weekly:  [4200, 3800, 4500, 4300, 4700, 4900, 5200],
  Monthly: [12000,13000,12500,13500,14000,14500,15000],
} as const;

// --- Balance & transactions ---
const balanceData = {
  balance: 7200.5,
  revenue: 4250,
  profit: 2150,
  expenses: 2100,
  dailyAvg: 607,
  expensesChange: -3,
  profitChange:   5,
  dailyAvgChange: 2,
};

const transactions: {
  icon: FeatherIconName;
  label: string;
  date: string;
  amount: number;
  color: string;
}[] = [
  { icon:'shopping-bag', label:'Food Supplies',  date:'May 21, 2:14 pm', amount:-230, color:'#A78BFA' },
  { icon:'dollar-sign',   label:'Order Payment', date:'May 20, 5:30 pm', amount: 350, color:'#34D399' },
  { icon:'droplet',       label:'Fuel',          date:'May 20,10:11 am',amount:-120, color:'#818CF8' },
  { icon:'trending-up',   label:'Sale',          date:'May 19, 3:45 pm', amount: 420, color:'#7C3AED' },
  { icon:'file-text',     label:'Bill Payment',  date:'May 18, 1:05 pm', amount:-180, color:'#F472B6' },
];

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();

  // Timeframe state
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [menuVisible, setMenuVisible] = useState(false);

  // Chart config
  const cardMargin = 10;
  const chartWidth = screenWidth - cardMargin * 2;
  const chartHeight = 100;

  // Data for selected timeframe
  const data = allData[timeframe];
  const sumRevenue = data.reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...data) * 1.1;
  const minVal = Math.min(...data) * 0.9;
  const points: Point[] = data.map((v, i) => ({
    x: (i / (data.length - 1)) * chartWidth,
    y: chartHeight - ((v - minVal) / (maxVal - minVal)) * chartHeight,
  }));
  const buildPath = (pts: Point[]): string => {
    if (pts.length < 2) return '';
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const midX = (p0.x + p1.x) / 2, midY = (p0.y + p1.y) / 2;
      d += ` Q${p0.x},${p0.y} ${midX},${midY}`;
    }
    const last = pts[pts.length - 1];
    d += ` T${last.x},${last.y}`;
    return d;
  };
  const linePath = buildPath(points);
  const areaPath = `${linePath} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;

  // KPI cards for each timeframe
  const kpiData = {
    Daily: [
      { label: 'Expenses', value: 2100, change: -3 },
      { label: 'Profit', value: 2150, change: 5 },
      { label: 'Daily Avg', value: 607, change: 2 },
    ],
    Weekly: [
      { label: 'Expenses', value: 4200, change: -2 },
      { label: 'Profit', value: 3150, change: 4 },
      { label: 'Daily Avg', value: 900, change: 3 },
    ],
    Monthly: [
      { label: 'Expenses', value: 12000, change: 1 },
      { label: 'Profit', value: 7150, change: 6 },
      { label: 'Daily Avg', value: 1200, change: 4 },
    ],
  };
  const kpis = kpiData[timeframe];

  // Quick-action handlers
  const handleBuildReport = () => alert('Build Report clicked');
  const handleUploadCSV = () => alert('Upload CSV clicked');
  const handleScanBill = () => alert('Scan Bill clicked');

  return (
    <View style={{ flex:1, backgroundColor: colors.background }}>
      {/* Always white status bar for all screens */}
      <StatusBar style="dark" />

      {/* Header aligned to bottom */}
      <View style={[styles.headerRow, { backgroundColor: colors.background }]}> 
        <Text style={[styles.greeting, { color: colors.onSurface }]}>
          Hi, Desi Flavors Katy
        </Text>
        <Pressable style={styles.bellBtn}>
          <Feather name="bell" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom:100 }}>
        {/* Overview Dropdown and Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginBottom: 4, marginTop: 8 }}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#7C3AED', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={{ color: '#7C3AED', fontWeight: '600', fontSize: 15 }}>{timeframe}</Text>
                <Feather name="chevron-down" size={18} color="#7C3AED" style={{ marginLeft: 2 }} />
              </Pressable>
            }
      >
            {(['Daily', 'Weekly', 'Monthly'] as const).map(opt => (
              <Menu.Item
                key={opt}
                title={opt}
                onPress={() => {
                  setTimeframe(opt);
                  setMenuVisible(false);
                }}
              />
            ))}
          </Menu>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#18181B', marginLeft: 10 }}>Overview</Text>
        </View>

        {/* ── Chart Card ───────────────────────────────────── */}
        <Card style={[
          styles.chartCard,
          {
            backgroundColor: '#EDE9FE',
            marginHorizontal: cardMargin,
            ...Platform.select({
              ios: {
                shadowColor: '#aaa',
                shadowOffset: { width:0, height:2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              },
              android: { elevation: 4 }
            })
          }
        ]}>
          <Card.Content style={styles.chartContent}>
            {/* Full-width Canvas, no left gap */}
            <Canvas
              style={{
                width: chartWidth,
                height: chartHeight,
                marginLeft: 0,
              }}
            >
              {/* gradient fill */}
              <Path
                path={Skia.Path.MakeFromSVGString(areaPath)!}
                style="fill"
                paint={(() => {
                  const p = Skia.Paint();
                  p.setShader(
                    Skia.Shader.MakeLinearGradient(
                      vec(0,0),
                      vec(0,chartHeight),
                      [Skia.Color('#7C3AED33'), Skia.Color('#7C3AED00')],
                      [0,1],
                      TileMode.Clamp
                    )
                  );
                  return p;
                })()}
              />
              {/* purple curved line */}
              <Path
                path={Skia.Path.MakeFromSVGString(linePath)!}
                color="#7C3AED"
                style="stroke"
                strokeWidth={3}
              />
            </Canvas>
            {/* Number, badge, and subtitle under the chart */}
            <View style={[styles.chartInfo, { alignItems: 'center', justifyContent: 'center' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.chartValue}>
                  ${sumRevenue.toLocaleString()}
                </Text>
                <View style={[styles.badge, { marginLeft: 8, marginBottom: 8 }]}> 
                  <Text style={styles.badgeText}>+25%</Text>
                </View>
              </View>
              <Text style={styles.chartTitleBold}>Total Revenue</Text>
            </View>
          </Card.Content>
        </Card>

        {/* ── Bank Account Balance ───────────────────────── */}
        <Card style={[
          styles.balanceCard,
          {
            backgroundColor: '#F0FDF4',
            marginHorizontal: 10,
            ...Platform.select({
              ios: {
                shadowColor: '#aaa',
                shadowOffset: { width:0, height:2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              },
              android: { elevation: 4 }
            })
          }
        ]}>
          <Card.Content style={styles.balanceContent}>
            <View style={styles.balanceLeft}>
              <Feather name="credit-card" size={24} color="#10B981" />
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Bank Account</Text>
                <Text style={styles.balanceSubtitle}>Primary Business</Text>
              </View>
            </View>
            <Text style={styles.balanceValue}>
              ${balanceData.balance.toLocaleString()}
            </Text>
        </Card.Content>
      </Card>

        {/* ── KPI GRID ─────────────────────────────────────── */}
        <View style={[styles.kpiGrid, { marginHorizontal: 10 }]}>
          {kpis.map(({ label, value, change }) => (
            <View key={label} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{label}</Text>
              <Text style={styles.kpiValue}>${value.toLocaleString()}</Text>
              <Text style={[
                styles.kpiChange,
                { color: change >= 0 ? '#22C55E' : '#EF4444' }
              ]}>
                {change >= 0 ? '+' : ''}{change}%
              </Text>
      </View>
          ))}
        </View>

        {/* ── QUICK ACTIONS ──────────────────────────────── */}
        <View style={[styles.actionsContainer, { marginHorizontal: 10 }]}>
          <View style={styles.actionsLeft}>
            <Pressable style={styles.actionBtn} onPress={handleBuildReport}>
              <Feather name="bar-chart-2" size={16} color="#7C3AED" />
              <Text style={styles.actionBtnText}>Build Report</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleUploadCSV}>
              <Feather name="upload" size={16} color="#7C3AED" />
              <Text style={styles.actionBtnText}>Upload CSV</Text>
            </Pressable>
          </View>
          <View style={styles.actionsRight}>
            <Pressable style={[styles.actionBtn, styles.scanBillBtn]} onPress={handleScanBill}>
              <Feather name="camera" size={18} color="#7C3AED" />
              <Text style={[styles.actionBtnText, { fontSize:15 }]}>Scan Bill</Text>
            </Pressable>
        </View>
      </View>

        {/* ── Sync Status ─────────────────────────────────── */}
        <View style={[styles.syncCard, { marginTop: -12, marginHorizontal: 10 }]}>
          <Feather name="folder" size={22} color="#7C3AED" />
          <Text style={styles.syncText}>All financials updated and synced</Text>
      </View>

        {/* ── Transactions ─────────────────────────────────── */}
        <View style={[styles.transactionsHeader, { marginTop: -6, marginHorizontal: 10 }]}>
          <Text style={styles.sectionTitle}>Latest Transactions</Text>
          <Button compact mode="text" onPress={()=>{}}>View all</Button>
                </View>
        {transactions.map((tx,i) => (
          <Card key={i} style={[styles.txCard, { marginHorizontal: 10, }]}>
            <Card.Content style={styles.txContent}>
              <View style={[styles.txIcon, { backgroundColor: tx.color + '22' }]}>
                <Feather name={tx.icon} size={20} color={tx.color} />
                  </View>
              <View style={{ flex:1 }}>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
                </View>
              <Text style={[
                styles.txAmount,
                { color: tx.amount >= 0 ? '#34D399' : '#EF4444' }
              ]}>
                {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount)}
              </Text>
              </Card.Content>
            </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    height: 80,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingHorizontal:10,
    paddingTop:30,
  },
  greeting:       { fontSize:20, fontWeight:'600' },
  bellBtn:        { padding:8 },
  chartCard:{
    marginHorizontal:20,
    borderRadius:18,
    overflow:'hidden',
    marginTop:12
  },
  chartContent:{
    padding:0,
    alignItems:'center'
  },
  chartInfo:{
    alignItems:'center',
    marginVertical:16
  },
  chartValue:{
    fontSize:32,
    fontWeight:'800',
    color:'#1F2937'
  },
  chartTitleBold:{
    fontSize:16,
    fontWeight:'700',
    color:'#6B7280',
    marginTop:4
  },
    badge: {
    backgroundColor:'#22C55E',
    paddingHorizontal:8,
    paddingVertical:4,
    borderRadius:12,
  },
  badgeText: {
    color:'#fff',
    fontSize:12,
    fontWeight:'600',
  },

  balanceCard:    {
    marginHorizontal:20,
    borderRadius:18,
    marginTop:16,
    overflow:'hidden',
  },
  balanceContent: {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingVertical:16,
  },
  balanceLeft:    {
    flexDirection:'row',
    alignItems:'center',
  },
  balanceInfo:    {
    marginLeft:12,
  },
  balanceLabel:   { fontSize:16, fontWeight:'600', color:'#1F2937' },
  balanceSubtitle:{ fontSize:12, color:'#6B7280', marginTop:2 },
  balanceValue:   { fontSize:24, fontWeight:'800', color:'#10B981' },

  kpiGrid:        {
    flexDirection:'row',
    justifyContent:'space-between',
    marginHorizontal:20,
    marginTop:12,
  },
  kpiCard:        {
    flex:1,
    backgroundColor:'#FEF9C3',
    borderRadius:12,
    padding:12,
    marginHorizontal:4,
    alignItems:'center',
  },
  kpiLabel:       { fontSize:14, color:'#4B5563' },
  kpiValue:       { fontSize:18, fontWeight:'700', marginTop:4 },
  kpiChange:      { fontSize:13, marginTop:2 },

  actionsContainer:{
    flexDirection:'row',
    alignItems:'stretch',
    marginHorizontal:20,
    marginTop:10,
    marginBottom:24,
    height:100,
  },
  actionsLeft:    {
    flex:1,
    justifyContent:'space-between',
    marginRight:8,
  },
  actionsRight:   {
    flex:1,
    justifyContent:'center',
  },
  actionBtn:      {
    backgroundColor:'#F3E8FF',
    borderRadius:12,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    paddingVertical:14,
    marginBottom:8,
    minHeight:44,
  },
  scanBillBtn:    {
    marginBottom:0,
    height:'100%',
    paddingVertical:0,
  },
  actionBtnText:  { marginLeft:6, fontWeight:'500', color:'#7C3AED', fontSize:14 },

  syncCard:       {
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#F5F3FF',
    borderRadius:12,
    margin:20,
    padding:16,
  },
  syncText:       { marginLeft:10, fontSize:15, color:'#7C3AED' },

  transactionsHeader:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginHorizontal:20,
    marginBottom:4,
  },
  sectionTitle:   { fontSize:18, fontWeight:'700' },

  txCard:         { marginHorizontal:20, marginBottom:8, borderRadius:14 },
  txContent:      { flexDirection:'row', alignItems:'center' },
  txIcon:         {
    width:36, height:36,
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center',
    marginRight:10,
  },
  txLabel:        { fontSize:15, fontWeight:'500' },
  txDate:         { fontSize:12, color:'#6B7280' },
  txAmount:       { fontSize:16, fontWeight:'700' },
});
