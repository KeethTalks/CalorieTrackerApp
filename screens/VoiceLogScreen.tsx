import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VoiceLogScreen() {
  const { colors } = useTheme();

  const handleStartRecording = () => {
    Alert.alert(
      "Coming Soon",
      "Voice Logging feature will be available soon!",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Voice Log</Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleStartRecording}
          accessibilityRole="button"
          accessibilityLabel="Start recording"
          accessibilityHint="Starts recording your voice to log a meal"
        >
          <Ionicons name="mic-outline" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Start Recording</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 