import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Button, Text } from 'react-native-paper';
import { setTmpImage } from './utils/tmpImageStore';

export default function CameraCropScreen() {
  const cameraRef = useRef(null);
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      // @ts-ignore
      const result = await cameraRef.current.takePictureAsync({ quality: 1, base64: true });
      const uri = 'data:image/jpeg;base64,' + (result.base64 ?? '');
      setTmpImage(uri);
      setPhoto(uri);
      setLoading(false);
    }
  };

  const handleDone = () => {
    router.push('/newbill');
  };

  if (hasPermission === null) {
    return <View style={styles.center}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.center}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {!photo ? (
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      ) : (
        <Image source={{ uri: photo }} style={styles.fullImage} resizeMode="contain" />
      )}
      <View style={styles.controls}>
        {!photo ? (
          <Button mode="contained" onPress={takePicture} style={styles.button} loading={loading}>
            Take Photo
          </Button>
        ) : (
          <Button mode="contained" onPress={handleDone} style={styles.button}>
            Done
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  fullImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  controls: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    marginVertical: 6,
    borderRadius: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 