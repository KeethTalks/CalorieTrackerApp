import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as Speech from 'expo-speech';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type VoiceLogScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VoiceLog'>;

interface VoiceLogScreenProps {
  navigation: VoiceLogScreenNavigationProp;
}

export default function VoiceLogScreen({ navigation }: VoiceLogScreenProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartRecording = async () => {
    if (!user) return;

    try {
      setIsRecording(true);
      setIsProcessing(true);

      // Mock voice recognition - replace with actual speech-to-text service
      const mockTranscription = "I had a chicken salad for lunch with 350 calories";
      
      // Mock AI analysis - replace with actual AI service integration
      const mockAnalysis = {
        name: "Chicken Salad",
        calories: 350,
        protein: 25,
        carbs: 15,
        fat: 20
      };

      // Save to Firestore
      await addDoc(collection(db, 'meals'), {
        name: mockAnalysis.name,
        calories: mockAnalysis.calories,
        protein: mockAnalysis.protein,
        carbs: mockAnalysis.carbs,
        fat: mockAnalysis.fat,
        mealType: "voice",
        timestamp: serverTimestamp(),
        userId: user.uid,
        transcription: mockTranscription
      });

      Alert.alert(
        "Success",
        "Meal logged successfully!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to process voice input. Please try again.");
    } finally {
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Voice Log</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Describe your meal and we'll log it for you
        </Text>
        
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            (isRecording || isProcessing) && styles.buttonDisabled
          ]}
          onPress={handleStartRecording}
          disabled={isRecording || isProcessing}
          accessibilityRole="button"
          accessibilityLabel={isRecording ? "Recording in progress" : "Start recording"}
          accessibilityHint="Starts recording your voice to log a meal"
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons 
                name={isRecording ? "mic" : "mic-outline"} 
                size={24} 
                color="#FFFFFF" 
              />
              <Text style={styles.buttonText}>
                {isRecording ? "Recording..." : "Start Recording"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {isRecording && (
          <Text style={[styles.recordingText, { color: colors.textSecondary }]}>
            Speak now...
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingText: {
    marginTop: 16,
    fontSize: 14,
    fontStyle: 'italic',
  },
}); 