import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function NewBillScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ images?: string }>();
  const imageUris: string[] = params.images ? JSON.parse(params.images) : [];

  const [store, setStore] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [tax, setTax] = useState('');
  const [total, setTotal] = useState('');

  const handleSave = () => {
    // TODO: save bill data
    Alert.alert('Bill saved', 'Your bill has been saved.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.imageContainer}>
        {imageUris.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={styles.image} />
        ))}
      </View>
      <TextInput label="Store" value={store} onChangeText={setStore} style={styles.input} />
      <TextInput label="Date" value={date} onChangeText={setDate} style={styles.input} />
      <TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />
      <TextInput label="Category" value={category} onChangeText={setCategory} style={styles.input} />
      <TextInput label="Tax" value={tax} onChangeText={setTax} keyboardType="numeric" style={styles.input} />
      <TextInput label="Total" value={total} onChangeText={setTotal} keyboardType="numeric" style={styles.input} />
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Save Bill
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  image: {
    width: '48%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 20,
  },
}); 