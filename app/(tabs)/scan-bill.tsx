import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import { Bill, useBills } from '@/context/BillsContext';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { CameraCapturedPicture } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Image, Platform, Modal as RNModal, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Button, Card, Dialog, IconButton, Portal, RadioButton, TextInput } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanBillScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (Platform.OS === 'ios' ? 44 : 56);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { bills, updateBill, deleteBill } = useBills();
  const cameraRef = useRef<CameraView | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const anim = useSharedValue(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const panStartMove = useRef<{ rectX: number; rectY: number; touchPageX: number; touchPageY: number }>({ rectX: 0, rectY: 0, touchPageX: 0, touchPageY: 0 });
  const panStartResize = useRef<{ rectX: number; rectY: number; rectWidth: number; rectHeight: number; touchPageX: number; touchPageY: number } | null >(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [editStoreName, setEditStoreName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTaxPaid, setEditTaxPaid] = useState('');
  const [editTotal, setEditTotal] = useState('');
  const [showEditPicker, setShowEditPicker] = useState(false);
  const [editPreviewVisible, setEditPreviewVisible] = useState(false);

  React.useEffect(() => {
    if (photo) {
      const size = screenWidth * 0.8;
      const x = (screenWidth - size) / 2;
      const y = (screenHeight - size) / 2;
      setCropRect({ x, y, width: size, height: size });
    }
  }, [photo, screenWidth, screenHeight]);

  const saveImageToPersistentStorage = async (tempUri: string): Promise<string | null> => {
    try {
      const filename = tempUri.split('/').pop() || `image_${Date.now()}.jpg`;
      const persistentUri = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({ from: tempUri, to: persistentUri });
      console.log('Image copied to:', persistentUri);
      return persistentUri;
    } catch (error) {
      console.error('Failed to copy image to persistent storage:', error);
      return null;
    }
  };

  const handleScan = async () => {
    if (!permission?.granted) {
      const p = await requestPermission();
      if (!p.granted) return;
    }
    setPhoto(null);
    setShowCamera(true);
  };

  const handleUpload = async () => {
    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets[0] && result.assets[0].uri) {
        const persistentUri = await saveImageToPersistentStorage(result.assets[0].uri);
        if (persistentUri) {
          router.push({ pathname: '/create-bill', params: { imageUri: persistentUri } });
        }
      }
    } catch (error) {
      console.error("Error during image upload: ", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFab = () => {
    setFabOpen((open) => {
      anim.value = withTiming(open ? 0 : 1, { duration: 250 });
      return !open;
    });
  };

  const scanButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -anim.value * 70 },
      { scale: anim.value },
    ],
    opacity: anim.value,
  }));
  const uploadButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -anim.value * 130 },
      { scale: anim.value },
    ],
    opacity: anim.value,
  }));

  if (!permission) {
    return <View style={styles.container} />;
  }
  if (!permission.granted) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight }] }>
        <Header title="Scan Bill" />
        <ThemedText>Please enable camera access</ThemedText>
        <Button mode="contained" onPress={requestPermission} style={styles.controlButton}>
          Grant Permission
        </Button>
      </ThemedView>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      try {
        const photoData = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        setPhoto(photoData);
      } catch (error) {
        console.error("Error taking photo: ", error);
        setPhoto(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleConfirm = async () => {
    if (isProcessing || !photo || !cropRect) return;
    setIsProcessing(true);
    try {
      const ratioX = photo.width / screenWidth;
      const ratioY = photo.height / screenHeight;
      const originX = cropRect.x * ratioX;
      const originY = cropRect.y * ratioY;
      const widthCrop = cropRect.width * ratioX;
      const heightCrop = cropRect.height * ratioY;
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: { originX, originY, width: widthCrop, height: heightCrop } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      const croppedUri = manipulated.uri;
      const persistentUri = await saveImageToPersistentStorage(croppedUri);
      if (persistentUri) {
        setShowCamera(false);
        setPhoto(null);
        setCropRect(null);
        requestAnimationFrame(() => {
          router.push({ pathname: '/create-bill', params: { imageUri: persistentUri } });
        });
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error during cropping process: ", error);
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectBill = (bill: Bill) => {
    setSelectedBill(bill);
    setEditStoreName(bill.storeName);
    setEditDate(bill.date);
    setEditCategory(bill.category);
    setEditTaxPaid(bill.taxPaid);
    setEditTotal(bill.total);
  };

  const handleSaveEdit = () => {
    if (selectedBill) {
      updateBill({ ...selectedBill, storeName: editStoreName, date: editDate, category: editCategory, taxPaid: editTaxPaid, total: editTotal });
      setSelectedBill(null);
    }
  };

  const handleDeleteBill = () => {
    if (selectedBill) {
      deleteBill(selectedBill.id);
      setSelectedBill(null);
    }
  };

  const onEditChangeDate = (_event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'android') setShowEditPicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setEditDate(`${year}-${month}-${day}`);
    }
  };

  const showEditDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: editDate ? new Date(editDate) : new Date(), mode: 'date', onChange: onEditChangeDate });
    } else {
      setShowEditPicker(true);
    }
  };

  return (
    <>
      <ThemedView style={[styles.container, { paddingTop: headerHeight, paddingHorizontal: 16 }] }>
        <Header title="Scan Bill" />
        {!showCamera && bills.length > 0 && (
          <FlatList
            data={bills}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card style={styles.card} onPress={() => handleSelectBill(item)}>
                <Card.Title title={item.storeName} subtitle={`${item.date} • Total: ${item.total}`} />
              </Card>
            )}
          />
        )}
        {!showCamera && (
          <>
            <Animated.View style={[styles.fabButton, uploadButtonStyle]} pointerEvents={fabOpen ? 'auto' : 'none'}>
              <Button mode="outlined" onPress={handleUpload} style={styles.fabMini} icon="upload" loading={isProcessing && fabOpen} disabled={isProcessing}>
                Upload Bill
              </Button>
            </Animated.View>
            <Animated.View style={[styles.fabButton, scanButtonStyle]} pointerEvents={fabOpen ? 'auto' : 'none'}>
              <Button mode="contained" onPress={handleScan} style={styles.fabMini} icon="camera" disabled={isProcessing}>
                Scan Bill
              </Button>
            </Animated.View>
            <View style={styles.fabButton}>
              <Button
                mode="contained"
                icon={fabOpen ? 'close' : 'plus'}
                onPress={toggleFab}
                style={styles.fabMain}
                labelStyle={{ fontSize: 20 }}
                contentStyle={{ justifyContent: 'center', alignItems: 'center' }}
                disabled={isProcessing}
              >
                {fabOpen ? '' : 'Bill'}
              </Button>
            </View>
          </>
        )}
      </ThemedView>
      <Portal>
        {isProcessing && !showCamera && (
            <View style={styles.activityOverlay}>
                <ActivityIndicator animating={true} size="large" />
            </View>
        )}
        {showCamera && (
          <View style={styles.cameraContainer}>
            {!photo ? (
              <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            ) : (
              <>
                <Image source={{ uri: photo.uri }} style={[styles.camera, { resizeMode: 'cover' }]} />
                {cropRect && (
                  <View
                    style={[
                      styles.cropContainer,
                      { left: cropRect.x, top: cropRect.y, width: cropRect.width, height: cropRect.height },
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={(evt) => {
                      if (!cropRect) return;
                      panStartMove.current = {
                        rectX: cropRect.x,
                        rectY: cropRect.y,
                        touchPageX: evt.nativeEvent.pageX,
                        touchPageY: evt.nativeEvent.pageY,
                      };
                    }}
                    onResponderMove={(evt) => {
                      if (!cropRect) return;
                      const { rectX, rectY, touchPageX, touchPageY } = panStartMove.current;
                      const dx = evt.nativeEvent.pageX - touchPageX;
                      const dy = evt.nativeEvent.pageY - touchPageY;
                      const newX = rectX + dx;
                      const newY = rectY + dy;
                      const clampedX = Math.min(Math.max(newX, 0), screenWidth - cropRect.width);
                      const clampedY = Math.min(Math.max(newY, 0), screenHeight - cropRect.height);
                      setCropRect({ ...cropRect, x: clampedX, y: clampedY });
                    }}
                  >
                    {/* Top Handle */}
                    <View
                      style={[styles.handle, styles.handleHorizontal, { top: -10, left: (cropRect.width - styles.handleHorizontal.width) / 2 }]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={(evt) => {
                        if (!cropRect) return;
                        panStartResize.current = { rectX: cropRect.x, rectY: cropRect.y, rectWidth: cropRect.width, rectHeight: cropRect.height, touchPageX: evt.nativeEvent.pageX, touchPageY: evt.nativeEvent.pageY };
                      }}
                      onResponderMove={(evt) => {
                        if (!cropRect || !panStartResize.current) return;
                        const { rectY, rectHeight, touchPageY } = panStartResize.current;
                        const dy = evt.nativeEvent.pageY - touchPageY;
                        let newY = rectY + dy;
                        let newHeight = rectHeight - dy;
                        const minY = 0; const minHeight = 50;
                        if (newY < minY) { newHeight -= (minY - newY); newY = minY; }
                        if (newHeight < minHeight) { newY -= (minHeight - newHeight); newHeight = minHeight; }
                        if (newY + newHeight > screenHeight) { newHeight = screenHeight - newY; }
                        setCropRect({ ...cropRect, y: newY, height: newHeight });
                      }}
                    />
                    {/* Bottom Handle */}
                    <View
                      style={[styles.handle, styles.handleHorizontal, { bottom: -10, left: (cropRect.width - styles.handleHorizontal.width) / 2 }]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={(evt) => {
                        if (!cropRect) return;
                        panStartResize.current = { rectX: cropRect.x, rectY: cropRect.y, rectWidth: cropRect.width, rectHeight: cropRect.height, touchPageX: evt.nativeEvent.pageX, touchPageY: evt.nativeEvent.pageY };
                      }}
                      onResponderMove={(evt) => {
                        if (!cropRect || !panStartResize.current) return;
                        const { rectHeight, touchPageY } = panStartResize.current;
                        const dy = evt.nativeEvent.pageY - touchPageY;
                        let newHeight = rectHeight + dy;
                        const minHeight = 50;
                        if (newHeight < minHeight) newHeight = minHeight;
                        if (cropRect.y + newHeight > screenHeight) newHeight = screenHeight - cropRect.y;
                        setCropRect({ ...cropRect, height: newHeight });
                      }}
                    />
                    {/* Left Handle */}
                    <View
                      style={[styles.handle, styles.handleVertical, { left: -10, top: (cropRect.height - styles.handleVertical.height) / 2 }]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={(evt) => {
                        if (!cropRect) return;
                        panStartResize.current = { rectX: cropRect.x, rectY: cropRect.y, rectWidth: cropRect.width, rectHeight: cropRect.height, touchPageX: evt.nativeEvent.pageX, touchPageY: evt.nativeEvent.pageY };
                      }}
                      onResponderMove={(evt) => {
                        if (!cropRect || !panStartResize.current) return;
                        const { rectX, rectWidth, touchPageX } = panStartResize.current;
                        const dx = evt.nativeEvent.pageX - touchPageX;
                        let newX = rectX + dx;
                        let newWidth = rectWidth - dx;
                        const minX = 0; const minWidth = 50;
                        if (newX < minX) { newWidth -= (minX - newX); newX = minX; }
                        if (newWidth < minWidth) { newX -= (minWidth - newWidth); newWidth = minWidth; }
                        if (newX + newWidth > screenWidth) { newWidth = screenWidth - newX; }
                        setCropRect({ ...cropRect, x: newX, width: newWidth });
                      }}
                    />
                    {/* Right Handle */}
                    <View
                      style={[styles.handle, styles.handleVertical, { right: -10, top: (cropRect.height - styles.handleVertical.height) / 2 }]}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={(evt) => {
                        if (!cropRect) return;
                        panStartResize.current = { rectX: cropRect.x, rectY: cropRect.y, rectWidth: cropRect.width, rectHeight: cropRect.height, touchPageX: evt.nativeEvent.pageX, touchPageY: evt.nativeEvent.pageY };
                      }}
                      onResponderMove={(evt) => {
                        if (!cropRect || !panStartResize.current) return;
                        const { rectWidth, touchPageX } = panStartResize.current;
                        const dx = evt.nativeEvent.pageX - touchPageX;
                        let newWidth = rectWidth + dx;
                        const minWidth = 50;
                        if (newWidth < minWidth) newWidth = minWidth;
                        if (cropRect.x + newWidth > screenWidth) newWidth = screenWidth - cropRect.x;
                        setCropRect({ ...cropRect, width: newWidth });
                      }}
                    />
                  </View>
                )}
              </>
            )}
            {isProcessing && photo == null && (
                <View style={styles.activityOverlayCamera}>
                    <ActivityIndicator animating={true} size="large" color="#fff"/>
                </View>
            )}
            <IconButton
              icon="close"
              size={28}
              iconColor="#fff"
              onPress={() => {
                if (isProcessing) return;
                setShowCamera(false);
                setPhoto(null);
                setCropRect(null);
              }}
              style={[styles.closeButton, { top: insets.top + 8 }]}
              disabled={isProcessing}
            />
            <View style={styles.actions}>
              {!photo ? (
                <Button mode="contained" onPress={takePhoto} style={styles.controlButton} loading={isProcessing && photo == null} disabled={isProcessing}>
                  Capture
                </Button>
              ) : (
                <>
                  <Button mode="outlined" onPress={() => { setPhoto(null); setCropRect(null); }} style={styles.controlButton} disabled={isProcessing}>
                    Retake
                  </Button>
                  <Button mode="contained" onPress={handleConfirm} style={styles.controlButton} loading={isProcessing} disabled={isProcessing || !photo || !cropRect}>
                    Confirm
                  </Button>
                </>
              )}
            </View>
          </View>
        )}
        {selectedBill && (
          <Dialog visible onDismiss={() => setSelectedBill(null)}>
            <Dialog.Title>Edit Bill</Dialog.Title>
            <Dialog.Content>
              <TouchableOpacity activeOpacity={1} onPress={() => setEditPreviewVisible(true)}>
                <Image source={{ uri: selectedBill.imageUri }} style={{ width: '100%', height: 200, marginBottom: 16 }} />
              </TouchableOpacity>
              <TextInput label="Store Name" value={editStoreName} onChangeText={setEditStoreName} style={styles.input} />
              <View style={styles.input} onStartShouldSetResponder={() => true} onResponderRelease={showEditDatePicker}>
                <TextInput
                  label="Date"
                  value={editDate}
                  showSoftInputOnFocus={false}
                  editable={false}
                  pointerEvents="none"
                />
              </View>
              {showEditPicker && Platform.OS !== 'android' && (
                <DateTimePicker
                  value={editDate ? new Date(editDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onEditChangeDate}
                  style={{ width: '100%', marginBottom: 16 }}
                />
              )}
              <RadioButton.Group onValueChange={setEditCategory} value={editCategory}>
                <RadioButton.Item label="Cooking Supplies and Material" value="Cooking Supplies and Material" />
                <RadioButton.Item label="Electrical and Hardware" value="Electrical and Hardware" />
                <RadioButton.Item label="Gas" value="Gas" />
                <RadioButton.Item label="Other" value="Other" />
              </RadioButton.Group>
              <TextInput label="Tax Paid" value={editTaxPaid} onChangeText={setEditTaxPaid} keyboardType="numeric" style={styles.input} />
              <TextInput label="Total" value={editTotal} onChangeText={setEditTotal} keyboardType="numeric" style={styles.input} />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleDeleteBill} icon="delete">Delete</Button>
              <Button mode="contained" onPress={handleSaveEdit}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        )}
      </Portal>
      {selectedBill && (
        <RNModal
          visible={editPreviewVisible}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setEditPreviewVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: selectedBill.imageUri }} style={{ width: '100%', height: '90%' }} resizeMode="contain" />
            <IconButton
              icon="close"
              size={30}
              iconColor="#fff"
              onPress={() => setEditPreviewVisible(false)}
              style={{ position: 'absolute', top: insets.top + 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)' }}
            />
          </View>
        </RNModal>
      )}
    </>
  );
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  preview: {
    flex: 1,
    resizeMode: 'cover',
  },
  buttonContainer: {
    marginTop: 20,
  },
  actions: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 1001,
  },
  controlButton: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 16,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  fabButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    zIndex: 10,
    alignItems: 'flex-end',
    width: 180,
  },
  fabMain: {
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    width: 120,
  },
  fabMini: {
    borderRadius: 20,
    height: 40,
    marginBottom: 8,
    width: 140,
    alignSelf: 'flex-end',
    elevation: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  activityOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  activityOverlayCamera: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  },
  cropContainer: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0,0,0,0.01)',
    zIndex: 1001,
  },
  handle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 1001,
  },
  handleHorizontal: {
    width: 40, // Wider touch area for horizontal handles
    height: 20,
  },
  handleVertical: {
    width: 20,
    height: 40, // Taller touch area for vertical handles
  },
  input: {
    marginBottom: 16,
  },
}); 