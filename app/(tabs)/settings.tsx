import React from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';

const HEADER_HEIGHT = 80;
const businessInfo = [
  { label: 'Business Name', value: 'Desi Flavors Katy' },
  { label: 'Email', value: 'owner@desiflavors.com' },
  { label: 'Plan', value: 'Pro' },
  { label: 'Last Login', value: 'Today' },
];
const preferences = [
  { label: 'Notifications', value: true },
  { label: 'Budget Alerts', value: false },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerRow}><Text style={styles.headerTitle}>Settings</Text></View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: HEADER_HEIGHT, paddingBottom: 32 }}>
        {/* Profile Card */}
        <Card style={[styles.profileCard, styles.prominentCard]}>
          <Card.Content>
            {businessInfo.map((info) => (
              <View key={info.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{info.label}</Text>
                <Text style={styles.infoValue}>{info.value}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card style={styles.sectionCard}>
          <Card.Content>
            {preferences.map((pref) => (
              <View key={pref.label} style={styles.prefRow}>
                <Text style={styles.prefLabel}>{pref.label}</Text>
                <Switch value={pref.value} disabled accessibilityLabel={pref.label + ' toggle'} />
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    elevation: 0,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#18181B',
  },
  profileCard: {
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: -80,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 0,
    minHeight: 120,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  prominentCard: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#18181B',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 4,
    color: '#18181B',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prefLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
}); 