import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'dinner', name: 'Dinner' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'water', name: 'Water' },
];

export default function AddMealScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [mealType, setMealType] = useState('');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMealTypeModalVisible, setIsMealTypeModalVisible] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIResultModalVisible, setIsAIResultModalVisible] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const cameraRef = useRef<Camera>(null);

  const handleAddMeal = async () => {
    if (!mealType || !mealName || !calories) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const mealsRef = collection(db, 'meals');
      await addDoc(mealsRef, {
        userId: user?.uid,
        type: mealType,
        name: mealName,
        calories: parseFloat(calories),
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        timestamp: serverTimestamp(),
      });

      Alert.alert('Success', 'Meal added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        // Mock AI recognition
        const mockResult = {
          name: "Turkey Sandwich",
          calories: 350,
          protein: 20,
          carbs: 30,
          fat: 10,
        };
        setAiResult(mockResult);
        setIsCameraVisible(false);
        setIsAIResultModalVisible(true);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const handleVoiceLog = async () => {
    try {
      setIsRecording(true);
      // Mock voice recording and NLP
      const mockResult = {
        name: "Turkey Sandwich",
        calories: 350,
        protein: 20,
        carbs: 30,
        fat: 10,
      };
      setAiResult(mockResult);
      setIsVoiceModalVisible(false);
      setIsAIResultModalVisible(true);
    } catch (error) {
      console.error('Error recording voice:', error);
      Alert.alert('Error', 'Failed to record voice');
    } finally {
      setIsRecording(false);
    }
  };

  const handleApplyAIResult = () => {
    if (aiResult) {
      setMealName(aiResult.name);
      setCalories(aiResult.calories.toString());
      setProtein(aiResult.protein.toString());
      setCarbs(aiResult.carbs.toString());
      setFat(aiResult.fat.toString());
      setIsAIResultModalVisible(false);
    }
  };

  const renderMealTypeItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.mealTypeItem,
        { backgroundColor: colors.card },
        mealType === item.id && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      onPress={() => {
        setMealType(item.id);
        setIsMealTypeModalVisible(false);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Select ${item.name} meal type`}
      accessibilityHint={`Sets the meal type to ${item.name}`}
    >
      <Text style={[styles.mealTypeText, { color: colors.text }]}>{item.name}</Text>
      {mealType === item.id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Add Meal</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.aiButtonsContainer}>
            <TouchableOpacity
              style={[styles.aiButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsCameraVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Scan Meal"
              accessibilityHint="Opens camera to scan your meal"
            >
              <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
              <Text style={styles.aiButtonText}>Scan Meal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.aiButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsVoiceModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Voice Log"
              accessibilityHint="Record your meal details by voice"
            >
              <Ionicons name="mic-outline" size={24} color="#FFFFFF" />
              <Text style={styles.aiButtonText}>Voice Log</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.mealTypeButton, { backgroundColor: colors.card }]}
            onPress={() => setIsMealTypeModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Meal Type Selector"
            accessibilityHint="Opens the meal type selection modal"
          >
            <Text style={[styles.mealTypeButtonText, { color: colors.text }]}>
              {mealType ? MEAL_TYPES.find(type => type.id === mealType)?.name : 'Select Meal Type'}
            </Text>
            <Ionicons name="chevron-down" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Meal Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={mealName}
              onChangeText={setMealName}
              placeholder="Enter meal name"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel="Meal Name Input Field"
              accessibilityHint="Enter the name of your meal"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Calories</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={calories}
              onChangeText={setCalories}
              placeholder="Enter calories"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              accessibilityLabel="Calories Input Field"
              accessibilityHint="Enter the number of calories"
            />
          </View>

          <View style={styles.macrosContainer}>
            <View style={styles.macroInput}>
              <Text style={[styles.label, { color: colors.text }]}>Protein (g)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                accessibilityLabel="Protein Input Field"
                accessibilityHint="Enter the amount of protein in grams"
              />
            </View>
            <View style={styles.macroInput}>
              <Text style={[styles.label, { color: colors.text }]}>Carbs (g)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={carbs}
                onChangeText={setCarbs}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                accessibilityLabel="Carbs Input Field"
                accessibilityHint="Enter the amount of carbohydrates in grams"
              />
            </View>
            <View style={styles.macroInput}>
              <Text style={[styles.label, { color: colors.text }]}>Fat (g)</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={fat}
                onChangeText={setFat}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                accessibilityLabel="Fat Input Field"
                accessibilityHint="Enter the amount of fat in grams"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleAddMeal}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Save Meal"
            accessibilityHint="Saves the meal entry"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Meal</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={isMealTypeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMealTypeModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Meal Type
            </Text>
            <FlatList
              data={MEAL_TYPES}
              renderItem={renderMealTypeItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.border }]}
              onPress={() => setIsMealTypeModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              accessibilityHint="Closes the meal type selection modal"
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCameraVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCameraVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.cameraContainer, { backgroundColor: colors.card }]}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={Camera.Constants.Type.back}
            >
              <View style={styles.cameraButtons}>
                <TouchableOpacity
                  style={[styles.cameraButton, { backgroundColor: colors.primary }]}
                  onPress={handleTakePicture}
                  accessibilityRole="button"
                  accessibilityLabel="Take Picture"
                  accessibilityHint="Captures the current camera view"
                >
                  <Ionicons name="camera" size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cameraButton, { backgroundColor: colors.error }]}
                  onPress={() => setIsCameraVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close Camera"
                  accessibilityHint="Closes the camera view"
                >
                  <Ionicons name="close" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </Camera>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isVoiceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVoiceModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.voiceContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.voiceTitle, { color: colors.text }]}>
              Voice Log Meal
            </Text>
            <View style={styles.voiceContent}>
              <Ionicons
                name={isRecording ? "mic" : "mic-outline"}
                size={64}
                color={colors.primary}
              />
              <Text style={[styles.voiceText, { color: colors.text }]}>
                {isRecording ? "Recording..." : "Tap to start recording"}
              </Text>
            </View>
            <View style={styles.voiceButtons}>
              <TouchableOpacity
                style={[styles.voiceButton, { backgroundColor: colors.primary }]}
                onPress={handleVoiceLog}
                disabled={isRecording}
                accessibilityRole="button"
                accessibilityLabel={isRecording ? "Recording" : "Start Recording"}
                accessibilityHint={isRecording ? "Currently recording" : "Starts voice recording"}
              >
                <Text style={styles.voiceButtonText}>
                  {isRecording ? "Recording..." : "Start Recording"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.voiceButton, { backgroundColor: colors.error }]}
                onPress={() => setIsVoiceModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Closes the voice recording modal"
              >
                <Text style={styles.voiceButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAIResultModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAIResultModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.aiResultContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.aiResultTitle, { color: colors.text }]}>
              AI Recognition Result
            </Text>
            {aiResult && (
              <View style={styles.aiResultContent}>
                <Text style={[styles.aiResultText, { color: colors.text }]}>
                  Name: {aiResult.name}
                </Text>
                <Text style={[styles.aiResultText, { color: colors.text }]}>
                  Calories: {aiResult.calories}
                </Text>
                <Text style={[styles.aiResultText, { color: colors.text }]}>
                  Protein: {aiResult.protein}g
                </Text>
                <Text style={[styles.aiResultText, { color: colors.text }]}>
                  Carbs: {aiResult.carbs}g
                </Text>
                <Text style={[styles.aiResultText, { color: colors.text }]}>
                  Fat: {aiResult.fat}g
                </Text>
              </View>
            )}
            <View style={styles.aiResultButtons}>
              <TouchableOpacity
                style={[styles.aiResultButton, { backgroundColor: colors.primary }]}
                onPress={handleApplyAIResult}
                accessibilityRole="button"
                accessibilityLabel="Apply Result"
                accessibilityHint="Applies the AI recognition result to the form"
              >
                <Text style={styles.aiResultButtonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.aiResultButton, { backgroundColor: colors.error }]}
                onPress={() => setIsAIResultModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Closes the AI result modal"
              >
                <Text style={styles.aiResultButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  aiButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  aiButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  mealTypeButtonText: {
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  mealTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  voiceContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  voiceContent: {
    alignItems: 'center',
    marginVertical: 32,
  },
  voiceText: {
    fontSize: 16,
    marginTop: 16,
  },
  voiceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voiceButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aiResultContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
  },
  aiResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  aiResultContent: {
    marginVertical: 16,
  },
  aiResultText: {
    fontSize: 16,
    marginBottom: 8,
  },
  aiResultButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiResultButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  aiResultButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 