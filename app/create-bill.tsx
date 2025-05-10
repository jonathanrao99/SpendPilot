import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Bill, useBills } from '@/context/BillsContext';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, Modal as RNModal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, IconButton, RadioButton, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateBillScreen() {
  const [showPicker, setShowPicker] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const receivedImageUri = params.imageUri;
  const theme = useTheme();

  const [displayableUri, setDisplayableUri] = useState<string | null>(null);

  const [storeName, setStoreName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Cooking Supplies and Material');
  const [taxPaid, setTaxPaid] = useState('');
  const [total, setTotal] = useState('');
  const [attempted, setAttempted] = useState(false);
  const { addBill } = useBills();
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (receivedImageUri) {
      let uriToDisplay = decodeURIComponent(receivedImageUri);
      if (Platform.OS === 'android' && !uriToDisplay.startsWith('file://')) {
        uriToDisplay = `file://${uriToDisplay}`;
      }
      setDisplayableUri(uriToDisplay);
      console.log("Displayable URI set to:", uriToDisplay);
    } else {
      setDisplayableUri(null);
    }
  }, [receivedImageUri]);

  const fixedHeaderHeight = insets.top + (Platform.OS === 'ios' ? 44 : 56);

  const handleSave = () => {
    setAttempted(true);
    if (storeName && date && category && taxPaid && total && displayableUri) {
      const newBill: Bill = {
        id: String(Date.now()),
        imageUri: displayableUri,
        storeName,
        date,
        category,
        taxPaid,
        total,
      };
      addBill(newBill);
      router.back();
    } else {
      console.log("Save validation failed. Missing fields or URI:", 
        { storeName, date, category, taxPaid, total, displayableUri }
      );
    }
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'android') {
        setShowPicker(false);
    }
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
    }
  };

  const showDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date ? new Date(date) : new Date(),
        mode: 'date',
        onChange: onChangeDate,
      });
    } else {
      setShowPicker(true);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.customHeaderBar,
          {
            height: fixedHeaderHeight,
            paddingTop: insets.top,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => {
            setPreviewVisible(false);
            router.back();
          }}
          iconColor={theme.colors.onSurface}
          style={styles.customHeaderBackButton}
        />
        <ThemedText type="subtitle" style={styles.customHeaderTitle}>New Bill</ThemedText>
        <View style={{ width: Platform.OS === 'ios' ? 48 : 56 }} />
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: fixedHeaderHeight }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {displayableUri && (
          <TouchableOpacity onPress={() => setPreviewVisible(true)} style={styles.imageOuterContainer}>
            <Image source={{ uri: displayableUri }} style={styles.previewImage} resizeMode="cover" />
          </TouchableOpacity>
        )}
        <TextInput
          label="Store Name"
          value={storeName}
          onChangeText={setStoreName}
          error={attempted && !storeName}
          style={styles.input}
        />
        <View
          style={styles.input}
          onStartShouldSetResponder={() => true}
          onResponderRelease={showDatePicker}
        >
          <TextInput
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            error={attempted && !date}
            showSoftInputOnFocus={false}
            editable={false}
          />
        </View>
        {showPicker && Platform.OS !== 'android' && (
          <DateTimePicker
            value={date ? new Date(date) : new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
            style={styles.datePicker}
          />
        )}
        <RadioButton.Group onValueChange={setCategory} value={category}>
          <RadioButton.Item label="Cooking Supplies and Material" value="Cooking Supplies and Material" />
          <RadioButton.Item label="Electrical and Hardware" value="Electrical and Hardware" />
          <RadioButton.Item label="Gas" value="Gas" />
          <RadioButton.Item label="Other" value="Other" />
        </RadioButton.Group>
        <TextInput
          label="Tax Paid"
          value={taxPaid}
          onChangeText={setTaxPaid}
          error={attempted && !taxPaid}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          label="Grand Total"
          value={total}
          onChangeText={setTotal}
          error={attempted && !total}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
          Save Bill
        </Button>
      </ScrollView>

      <RNModal
        visible={previewVisible}
        transparent={false}
        onRequestClose={() => setPreviewVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          {displayableUri && <Image source={{ uri: displayableUri }} style={styles.modalImage} resizeMode="contain" />}
          <IconButton
            icon="close"
            iconColor="#fff"
            size={30}
            onPress={() => setPreviewVisible(false)}
            style={[styles.modalClose, {top: insets.top > 20 ? insets.top + 10 : 20}]}
          />
        </View>
      </RNModal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  customHeaderBackButton: {
    marginRight: 8,
  },
  customHeaderTitle: {
    textAlign: 'center',
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  imageOuterContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  input: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  datePicker: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '90%',
  },
  modalClose: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
  },
}); 