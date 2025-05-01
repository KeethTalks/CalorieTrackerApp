import React, { useState, useRef, useEffect } from 'react';
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'dinner', name: 'Dinner' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'water', name: 'Water' },
];

type AddMealScreenProps = NativeStackScreenProps<RootStackParamList, 'AddMeal'>;

export default function AddMealScreen({ navigation, route }: AddMealScreenProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [mealType, setMealType] = useState(route.params?.mealType || '');
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

  useEffect(() => {
    if (route.params?.mealType) {
      setMealType(route.params.mealType);
    }
  }, [route.params?.mealType]);

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
    >
      <Text style={[styles.mealTypeName, { color: colors.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={[
              styles.mealTypeButton,
              { backgroundColor: colors.card },
            ]}
            onPress={() => setIsMealTypeModalVisible(true)}
          >
            <Text style={[styles.mealTypeText, { color: colors.text }]}>
              {mealType ? MEAL_TYPES.find(t => t.id === mealType)?.name : 'Select Meal Type'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Meal Name"
            placeholderTextColor={colors.textSecondary}
            value={mealName}
            onChangeText={setMealName}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Calories"
            placeholderTextColor={colors.textSecondary}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Protein (optional)"
            placeholderTextColor={colors.textSecondary}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Carbs (optional)"
            placeholderTextColor={colors.textSecondary}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Fat (optional)"
            placeholderTextColor={colors.textSecondary}
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.card }]}
              onPress={() => setIsCameraVisible(true)}
            >
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={[styles.buttonText, { color: colors.text }]}>Scan with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.voiceButton, { backgroundColor: colors.card }]}
              onPress={() => setIsVoiceModalVisible(true)}
            >
              <Ionicons name="mic" size={24} color={colors.primary} />
              <Text style={[styles.buttonText, { color: colors.text }]}>Voice Log</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddMeal}
            disabled={isLoading || !mealType || !mealName || !calories}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.addButtonText}>Add Meal</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Meal Type Modal */}
      <Modal
        visible={isMealTypeModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Meal Type</Text>
            <FlatList
              data={MEAL_TYPES}
              renderItem={renderMealTypeItem}
              keyExtractor={(item) => item.id}
              style={styles.mealTypeList}
            />
          </View>
        </View>
      </Modal>

      {/* Camera Modal */}
      <Modal
        visible={isCameraVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={Camera.Constants.Type.Back}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: colors.card }]}
                onPress={handleTakePicture}
              >
                <Ionicons name="camera" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.card }]}
                onPress={() => setIsCameraVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      </Modal>

      {/* Voice Modal */}
      <Modal
        visible={isVoiceModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Voice Log</Text>
            <TouchableOpacity
              style={[styles.voiceButton, { backgroundColor: colors.primary }]}
              onPress={handleVoiceLog}
            >
              <Ionicons name="mic" size={24} color={colors.background} />
              <Text style={styles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
            {isRecording && (
              <ActivityIndicator style={styles.recordingIndicator} color={colors.primary} />
            )}
          </View>
        </View>
      </Modal>

      {/* AI Result Modal */}
      <Modal
        visible={isAIResultModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>AI Suggestion</Text>
            <Text style={[styles.aiResultText, { color: colors.text }]}>
              {aiResult?.name}
            </Text>
            <Text style={[styles.aiResultText, { color: colors.textSecondary }]}>Calories: {aiResult?.calories} kcal</Text>
            <Text style={[styles.aiResultText, { color: colors.textSecondary }]}>Protein: {aiResult?.protein} g</Text>
            <Text style={[styles.aiResultText, { color: colors.textSecondary }]}>Carbs: {aiResult?.carbs} g</Text>
            <Text style={[styles.aiResultText, { color: colors.textSecondary }]}>Fat: {aiResult?.fat} g</Text>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApplyAIResult}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Apply Suggestion
              </Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 16,
  },
  mealTypeButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  mealTypeText: {
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    height: 50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  cameraButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  voiceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  addButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  mealTypeItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  mealTypeName: {
    fontSize: 16,
    textAlign: 'center',
  },
  mealTypeList: {
    maxHeight: 300,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
  },
  recordingIndicator: {
    marginTop: 16,
  },
  aiResultText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  applyButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
});
