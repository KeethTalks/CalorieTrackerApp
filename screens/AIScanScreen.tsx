import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AIScanScreen() {
  const { colors } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakePhoto = async () => {
    if (!camera) return;

    try {
      const photo = await camera.takePictureAsync();
      Alert.alert(
        "Coming Soon",
        "AI Meal Scanning feature will be available soon!",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>
          Camera permission is required to scan meals. Please enable it in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        ref={ref => setCamera(ref)}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleTakePhoto}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            accessibilityHint="Takes a photo of your meal for AI analysis"
          >
            <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
}); 