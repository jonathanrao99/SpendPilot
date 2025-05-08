import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/ui/Header';
import { useBills } from '@/context/BillsContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Image, Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Portal } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanBillScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (Platform.OS === 'ios' ? 44 : 56);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { bills } = useBills();
  const cameraRef = useRef<CameraView | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const anim = useSharedValue(0);

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
    setPhotoUri(null);
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
        const photo = await cameraRef.current.takePictureAsync({ 
          quality: 0.5,
        });
        setPhotoUri(photo.uri);
      } catch (error) {
        console.error("Error taking photo: ", error);
        setPhotoUri(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleConfirm = async () => {
    console.log("[handleConfirm] Called. isProcessing:", isProcessing, "photoUri:", photoUri);
    if (isProcessing || !photoUri) {
      console.log("[handleConfirm] Bailing out: Already processing or no photoUri.");
      return;
    }
    setIsProcessing(true);
    console.log("[handleConfirm] Set isProcessing to true.");
    try {
      const persistentUri = await saveImageToPersistentStorage(photoUri);
      console.log("[handleConfirm] Persistent URI obtained:", persistentUri);
      if (persistentUri) {
        console.log("[handleConfirm] Hiding camera overlay and navigating to create-bill with URI:", persistentUri);
        setShowCamera(false);
        setPhotoUri(null);
        requestAnimationFrame(() => {
          router.push({ pathname: '/create-bill', params: { imageUri: persistentUri } });
        });
      } else {
        console.error("[handleConfirm] Could not confirm photo due to save failure (persistentUri is null).");
        setIsProcessing(false); // Explicitly stop processing if save failed and no navigation
      }
    } catch (error) {
      console.error("[handleConfirm] Error during confirmation process: ", error);
      setIsProcessing(false); // Stop processing on error
    } finally {
      console.log("[handleConfirm] Reached finally block. Setting isProcessing to false.");
      setIsProcessing(false); // Explicitly set to false in all cases when finally is reached
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
              <Card style={styles.card}>
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
            {!photoUri ? (
              <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            ) : (
              <Image source={{ uri: photoUri }} style={[styles.camera, { resizeMode: 'cover' }]} />
            )}
            {isProcessing && photoUri == null && (
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
                setPhotoUri(null);
              }}
              style={[styles.closeButton, { top: insets.top + 8 }]}
              disabled={isProcessing}
            />
            <View style={styles.actions}>
              {!photoUri ? (
                <Button mode="contained" onPress={takePhoto} style={styles.controlButton} loading={isProcessing && photoUri == null} disabled={isProcessing}>
                  Capture
                </Button>
              ) : (
                <>
                  <Button mode="outlined" onPress={() => { setPhotoUri(null); }} style={styles.controlButton} disabled={isProcessing}>
                    Retake
                  </Button>
                  <Button mode="contained" onPress={handleConfirm} style={styles.controlButton} loading={isProcessing} disabled={isProcessing || !photoUri}>
                    Confirm
                  </Button>
                </>
              )}
            </View>
          </View>
        )}
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
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
}); 