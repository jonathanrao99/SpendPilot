import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Divider, List, Switch, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [businessName, setBusinessName] = useState('My Business');
  const [address, setAddress] = useState('123 Main St.');
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (Platform.OS === 'ios' ? 44 : 56);
  const router = useRouter();

  return (
    <ThemedView style={[styles.container, { paddingTop: headerHeight }]}>
      <Header title="Settings" showAvatar={false} />
      <View style={styles.backContainer}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.avatarContainer, { marginTop: 0 }]}>
        <Avatar.Image size={100} source={{ uri: 'https://placehold.co/100x100' }} />
        <Button mode="text" onPress={() => {}} style={styles.changeAvatarButton}>
          Change Avatar
        </Button>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <List.Section title="Business Information">
          <TextInput
            label="Business Name"
            value={businessName}
            onChangeText={setBusinessName}
            style={styles.input}
          />
          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
          />
          <Button mode="contained" onPress={() => {}} style={styles.button}>
            Save
          </Button>
        </List.Section>
        <Divider />
        <List.Section title="Notifications">
          <View style={styles.row}>
            <List.Item title="New Order Alerts" />
            <Switch value={orderAlerts} onValueChange={setOrderAlerts} />
          </View>
          <View style={styles.row}>
            <List.Item title="Promotional Alerts" />
            <Switch value={promoAlerts} onValueChange={setPromoAlerts} />
          </View>
        </List.Section>
        <Divider />
        <List.Section title="Integrations">
          <Button mode="outlined" onPress={() => {}} style={styles.button}>
            Manage Integrations
          </Button>
        </List.Section>
        <Divider />
        <List.Section title="Reports">
          <Button mode="contained" onPress={() => router.push('/settings/build-report')} style={styles.button}>
            Build New Report
          </Button>
        </List.Section>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  input: { marginBottom: 12 },
  button: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backContainer: {
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 0,
  },
  backText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  changeAvatarButton: {
    marginTop: -2,
  },
}); 