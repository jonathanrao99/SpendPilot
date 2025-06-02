'use client';

import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, Modal, Pressable, Platform, Text as RNText, Dimensions } from 'react-native';
import { TextInput, Button, useTheme, Text, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';
import { getTmpImage } from './utils/tmpImageStore';
import { useBills, Bill } from '@/components/BillsContext';

// Screen width for image sizing
const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORY_OPTIONS = [
  'Food Supplies',
  'Electronics',
  'Hardware',
  'Gas',
  'Other',
];

export default function NewBillScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { bills, setBills } = useBills();
  const imageUri = getTmpImage();

  const [store, setStore] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');
  const [tax, setTax] = useState('');
  const [total, setTotal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!store) newErrors.store = 'Store is required.';
    if (!date) newErrors.date = 'Date is required.';
    if (!category) newErrors.category = 'Category is required.';
    if (category === 'Other' && !otherCategory) newErrors.otherCategory = 'Please specify category.';
    if (!tax) newErrors.tax = 'Tax is required.';
    if (!total) newErrors.total = 'Total is required.';
    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    // Add bill to bills list (replace with context/state in real app)
    const newBill: Bill = {
      id: Date.now().toString(),
      image: imageUri,
      store,
      date: date.toISOString().split('T')[0], // Only YYYY-MM-DD
      category: category === 'Other' ? otherCategory : category,
      tax: parseFloat(tax),
      amount: parseFloat(total),
      total: parseFloat(total),
    };
    setBills([newBill, ...bills]);
    router.replace('/scanbill');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { padding: 20 }]}> 
        {/* Bill Image with pop-out */}
        {imageUri && (
          <>
            <Pressable onPress={() => setModalVisible(true)} style={styles.imagePressable}>
              <Image source={{ uri: imageUri }} style={[styles.image, { width: SCREEN_WIDTH - 40 }]} resizeMode="contain" />
            </Pressable>
            <Modal visible={modalVisible} transparent animationType="fade">
              <View style={styles.modalBackdrop}>
                <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
                  <Image source={{ uri: imageUri }} style={styles.modalImage} resizeMode="contain" />
                </Pressable>
              </View>
            </Modal>
          </>
        )}
        {/* Store Field */}
        <TextInput label="Store" value={store} onChangeText={setStore} style={styles.input} />
        {errors.store && <RNText style={styles.errorText}>{errors.store}</RNText>}
        {/* Date & Category Row */}
        <View style={styles.row}>
          <Pressable style={[styles.halfInput, { marginRight: 6 }]} onPress={() => setShowDatePicker(true)}>
            <TextInput
              label="Date"
              value={date.toLocaleDateString()}
              editable={false}
              pointerEvents="none"
              style={{ backgroundColor: 'transparent' }}
            />
          </Pressable>
          <View style={styles.halfInput}>
            <Menu
              visible={showCategoryMenu}
              onDismiss={() => setShowCategoryMenu(false)}
              anchor={
                <Pressable onPress={() => setShowCategoryMenu(true)}>
                  <TextInput
                    label="Category"
                    value={category}
                    editable={false}
                    pointerEvents="none"
                    style={{ backgroundColor: 'transparent' }}
                  />
                </Pressable>
              }
            >
              {CATEGORY_OPTIONS.map(opt => (
                <Menu.Item
                  key={opt}
                  title={opt}
                  onPress={() => {
                    setCategory(opt);
                    setShowCategoryMenu(false);
                  }}
                />
              ))}
            </Menu>
          </View>
        </View>
        {errors.date && <RNText style={styles.errorText}>{errors.date}</RNText>}
        {errors.category && <RNText style={styles.errorText}>{errors.category}</RNText>}
        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_: unknown, selectedDate?: Date) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
        {/* Other Category Field */}
        {category === 'Other' && (
          <>
            <TextInput
              label="Please specify"
              value={otherCategory}
              onChangeText={setOtherCategory}
              style={styles.input}
            />
            {errors.otherCategory && <RNText style={styles.errorText}>{errors.otherCategory}</RNText>}
          </>
        )}
        {/* Tax and Total Fields */}
        <TextInput label="Tax" value={tax} onChangeText={setTax} keyboardType="numeric" style={styles.input} />
        {errors.tax && <RNText style={styles.errorText}>{errors.tax}</RNText>}
        <TextInput label="Total" value={total} onChangeText={setTotal} keyboardType="numeric" style={styles.input} />
        {errors.total && <RNText style={styles.errorText}>{errors.total}</RNText>}
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          Save Bill
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181B',
  },
  bellBtn: { padding: 8 },
  scrollContent: {
    // alignItems: 'center',
    // padding: 20,
  },
  imagePressable: {
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: '#fff',
  },
  image: {
    height: 260,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: 340,
    height: 340,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 6,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    marginTop: 20,
    width: '100%',
    borderRadius: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
}); 