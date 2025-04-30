import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import * as Progress from 'react-native-progress';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Pedometer } from 'expo-sensors';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

type DailyStats = {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goalCalories: number;
};

const RECOMMENDED_MEALS = [
  {
    id: '1',
    name: 'Keto Breakfast Bowl',
    calories: 450,
    protein: 25,
    carbs: 10,
    fat: 35,
    ingredients: ['Eggs', 'Avocado', 'Bacon', 'Spinach', 'Cheese'],
  },
  {
    id: '2',
    name: 'Vegan Salad',
    calories: 320,
    protein: 15,
    carbs: 30,
    fat: 18,
    ingredients: ['Mixed Greens', 'Chickpeas', 'Tomatoes', 'Cucumber', 'Olive Oil'],
  },
  {
    id: '3',
    name: 'Protein Smoothie',
    calories: 280,
    protein: 30,
    carbs: 25,
    fat: 8,
    ingredients: ['Protein Powder', 'Banana', 'Almond Milk', 'Peanut Butter', 'Ice'],
  },
];

const WEARABLE_DATA = {
  steps: 8456,
  caloriesBurned: 420,
  heartRate: 72,
  sleepHours: 7.5,
  lastSync: '2 hours ago',
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState<DailyStats>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    goalCalories: 2000,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [isShoppingListModalVisible, setIsShoppingListModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isWearableModalVisible, setIsWearableModalVisible] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [isTrackingSteps, setIsTrackingSteps] = useState(false);

  useEffect(() => {
    fetchDailyStats();
    checkPedometerAvailability();
    return () => {
      stopStepTracking();
    };
  }, []);

  const fetchDailyStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const mealsRef = collection(db, 'meals');
      const q = query(
        mealsRef,
        where('timestamp', '>=', today)
      );
      
      const querySnapshot = await getDocs(q);
      const meals = querySnapshot.docs.map(doc => doc.data());
      
      const dailyStats: DailyStats = {
        totalCalories: meals.reduce((sum, meal) => sum + (meal.calories || 0), 0),
        totalProtein: meals.reduce((sum, meal) => sum + (meal.protein || 0), 0),
        totalCarbs: meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0),
        totalFat: meals.reduce((sum, meal) => sum + (meal.fat || 0), 0),
        goalCalories: stats.goalCalories,
      };
      
      setStats(dailyStats);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPedometerAvailability = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(isAvailable);
  };

  const startStepTracking = async () => {
    if (!isPedometerAvailable) {
      Alert.alert('Error', 'Step tracking is not available on this device');
      return;
    }

    setIsTrackingSteps(true);
    const subscription = Pedometer.watchStepCount(result => {
      setStepCount(result.steps);
    });

    return () => {
      subscription.remove();
    };
  };

  const stopStepTracking = () => {
    setIsTrackingSteps(false);
  };

  const handleToggleStepTracking = async () => {
    if (isTrackingSteps) {
      stopStepTracking();
    } else {
      await startStepTracking();
    }
  };

  const handleSaveWeight = async () => {
    if (!weight || isNaN(parseFloat(weight))) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    setIsSavingWeight(true);
    try {
      const weightsRef = collection(db, 'weights');
      await addDoc(weightsRef, {
        userId: user?.uid,
        weight: parseFloat(weight),
        timestamp: new Date(),
      });

      Alert.alert('Success', 'Weight recorded successfully');
      setIsWeightModalVisible(false);
      setWeight('');
    } catch (error) {
      console.error('Error saving weight:', error);
      Alert.alert('Error', 'Failed to save weight');
    } finally {
      setIsSavingWeight(false);
    }
  };

  const getProgressPercentage = () => {
    return Math.min((stats.totalCalories / stats.goalCalories) * 100, 100);
  };

  const getMotivationalMessage = () => {
    const progress = stats.totalCalories / stats.goalCalories;
    return progress > 0.5 ? "Great job, keep it up!" : "You're on your way!";
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGenerateShoppingList = (meal: any) => {
    setSelectedMeal(meal);
    setIsShoppingListModalVisible(true);
  };

  const handleSyncWearable = async () => {
    setIsSyncing(true);
    try {
      // Mock wearable sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Wearable data synced successfully');
      setIsWearableModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to sync wearable data');
    } finally {
      setIsSyncing(false);
    }
  };

  const renderRecommendedMeal = ({ item }: { item: any }) => (
    <View style={[styles.recommendedMealCard, { backgroundColor: colors.card }]}>
      <View style={styles.recommendedMealHeader}>
        <Text style={[styles.recommendedMealName, { color: colors.text }]}>
          {item.name}
        </Text>
        <TouchableOpacity
          onPress={() => handleGenerateShoppingList(item)}
          accessibilityRole="button"
          accessibilityLabel="Generate Shopping List"
          accessibilityHint="Shows ingredients needed for this meal"
        >
          <Ionicons name="cart-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.recommendedMealMacros}>
        <Text style={[styles.recommendedMealMacro, { color: colors.text }]}>
          {item.calories} kcal
        </Text>
        <Text style={[styles.recommendedMealMacro, { color: colors.text }]}>
          P: {item.protein}g
        </Text>
        <Text style={[styles.recommendedMealMacro, { color: colors.text }]}>
          C: {item.carbs}g
        </Text>
        <Text style={[styles.recommendedMealMacro, { color: colors.text }]}>
          F: {item.fat}g
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Hello, {user?.displayName || 'User'}!
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: colors.card }]}
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
            accessibilityHint="Switches between light and dark mode"
          >
            <Ionicons 
              name={isDark ? 'sunny' : 'moon'} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.avatarButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
            accessibilityLabel="View Profile"
            accessibilityHint="Navigates to your profile page"
          >
            <Ionicons name="person-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
          <View style={styles.caloriesProgressContainer}>
            {Platform.OS === 'web' ? (
              <View style={styles.webProgressContainer}>
                <View style={[styles.webProgressCircle, { borderColor: colors.primary }]}>
                  <Text style={[styles.progressText, { color: colors.text }]}>
                    {Math.round(getProgressPercentage())}%
                  </Text>
                </View>
              </View>
            ) : (
              <Progress.Circle
                progress={getProgressPercentage() / 100}
                size={200}
                thickness={12}
                color={colors.primary}
                unfilledColor={colors.border}
                borderWidth={0}
                showsText
                formatText={() => `${Math.round(getProgressPercentage())}%`}
                textStyle={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.text,
                }}
              />
            )}
            <View style={styles.caloriesTextContainer}>
              <Text style={[styles.caloriesText, { color: colors.text }]}>
                {stats.totalCalories} / {stats.goalCalories}
              </Text>
              <Text style={[styles.caloriesLabel, { color: colors.textSecondary }]}>
                Calories
              </Text>
            </View>
          </View>

          <View style={styles.macrosContainer}>
            <View
              style={[
                styles.macroCard,
                { backgroundColor: colors.card }
              ]}
            >
              <Ionicons name="nutrition" size={24} color={colors.primary} />
              <Text style={[styles.macroValue, { color: colors.text }]}>
                {stats.totalProtein}g
              </Text>
              <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>
                Protein
              </Text>
            </View>

            <View
              style={[
                styles.macroCard,
                { backgroundColor: colors.card }
              ]}
            >
              <Ionicons name="pizza" size={24} color={colors.primary} />
              <Text style={[styles.macroValue, { color: colors.text }]}>
                {stats.totalCarbs}g
              </Text>
              <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>
                Carbs
              </Text>
            </View>

            <View
              style={[
                styles.macroCard,
                { backgroundColor: colors.card }
              ]}
            >
              <Ionicons name="flame" size={24} color={colors.primary} />
              <Text style={[styles.macroValue, { color: colors.text }]}>
                {stats.totalFat}g
              </Text>
              <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>
                Fat
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: colors.card, marginTop: 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Weight Tracking
            </Text>
            <TouchableOpacity
              onPress={() => setIsWeightModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Add weight"
              accessibilityHint="Opens the weight input modal"
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weightPlaceholder}>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Weight tracking graph coming soon!
            </Text>
          </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: colors.card, marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recommended Meals
          </Text>
          <FlatList
            data={RECOMMENDED_MEALS}
            renderItem={renderRecommendedMeal}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedMealsList}
          />
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: colors.card, marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Weight Forecast
          </Text>
          <View style={styles.forecastContainer}>
            <Text style={[styles.forecastText, { color: colors.text }]}>
              At current intake, you'll lose 2 lbs by May 29, 2025
            </Text>
            <Text style={[styles.suggestionText, { color: colors.primary }]}>
              Suggestion: Increase protein by 10g daily
            </Text>
          </View>
        </View>

        <Text style={[styles.motivation, { color: colors.textSecondary }]}>
          {getMotivationalMessage()}
        </Text>

        <View style={styles.quickLogContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Log Options
          </Text>
          
          <TouchableOpacity
            style={[styles.quickLogButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('BarcodeScanner')}
            accessibilityRole="button"
            accessibilityLabel="Scan barcode"
            accessibilityHint="Opens the barcode scanner to add food items"
          >
            <Ionicons name="barcode-outline" size={24} color="#FFFFFF" />
            <Text style={styles.quickLogButtonText}>Scan Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickLogButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AIScan')}
            accessibilityRole="button"
            accessibilityLabel="Scan with AI"
            accessibilityHint="Opens the AI scanner to analyze your meal"
          >
            <Ionicons name="camera-outline" size={24} color="#FFFFFF" />
            <Text style={styles.quickLogButtonText}>Scan with AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickLogButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('VoiceLog')}
            accessibilityRole="button"
            accessibilityLabel="Log with voice"
            accessibilityHint="Opens voice logging to add meals by speaking"
          >
            <Ionicons name="mic-outline" size={24} color="#FFFFFF" />
            <Text style={styles.quickLogButtonText}>Log with Voice</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: colors.card, marginTop: 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Wearable Data
            </Text>
            <TouchableOpacity
              onPress={() => setIsWearableModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Sync wearable data"
              accessibilityHint="Opens the wearable sync modal"
            >
              <Ionicons name="sync-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.wearableGrid}>
            <View style={[styles.wearableCard, { backgroundColor: colors.card }]}>
              <Ionicons name="walk-outline" size={24} color={colors.primary} />
              <Text style={[styles.wearableValue, { color: colors.text }]}>
                {WEARABLE_DATA.steps}
              </Text>
              <Text style={[styles.wearableLabel, { color: colors.textSecondary }]}>
                Steps
              </Text>
            </View>
            <View style={[styles.wearableCard, { backgroundColor: colors.card }]}>
              <Ionicons name="flame-outline" size={24} color={colors.primary} />
              <Text style={[styles.wearableValue, { color: colors.text }]}>
                {WEARABLE_DATA.caloriesBurned}
              </Text>
              <Text style={[styles.wearableLabel, { color: colors.textSecondary }]}>
                Calories Burned
              </Text>
            </View>
            <View style={[styles.wearableCard, { backgroundColor: colors.card }]}>
              <Ionicons name="heart-outline" size={24} color={colors.primary} />
              <Text style={[styles.wearableValue, { color: colors.text }]}>
                {WEARABLE_DATA.heartRate}
              </Text>
              <Text style={[styles.wearableLabel, { color: colors.textSecondary }]}>
                Heart Rate
              </Text>
            </View>
            <View style={[styles.wearableCard, { backgroundColor: colors.card }]}>
              <Ionicons name="moon-outline" size={24} color={colors.primary} />
              <Text style={[styles.wearableValue, { color: colors.text }]}>
                {WEARABLE_DATA.sleepHours}
              </Text>
              <Text style={[styles.wearableLabel, { color: colors.textSecondary }]}>
                Sleep Hours
              </Text>
            </View>
          </View>
          <Text style={[styles.lastSyncText, { color: colors.textSecondary }]}>
            Last synced: {WEARABLE_DATA.lastSync}
          </Text>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: colors.card, marginTop: 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Step Tracking
            </Text>
            <TouchableOpacity
              onPress={handleToggleStepTracking}
              accessibilityRole="button"
              accessibilityLabel={isTrackingSteps ? "Stop tracking steps" : "Start tracking steps"}
              accessibilityHint={isTrackingSteps ? "Stops tracking your steps" : "Starts tracking your steps"}
            >
              <Ionicons 
                name={isTrackingSteps ? "stop-circle-outline" : "play-circle-outline"} 
                size={24} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.stepContainer}>
            <Text style={[styles.stepCount, { color: colors.text }]}>
              {stepCount}
            </Text>
            <Text style={[styles.stepLabel, { color: colors.textSecondary }]}>
              Steps Today
            </Text>
            {!isPedometerAvailable && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                Step tracking is not available on this device
              </Text>
            )}
          </View>
          <View style={styles.stepProgress}>
            <Progress.Bar
              progress={Math.min(stepCount / 10000, 1)}
              width={Dimensions.get('window').width - 64}
              height={8}
              color={colors.primary}
              unfilledColor={colors.border}
              borderWidth={0}
            />
            <Text style={[styles.stepGoal, { color: colors.textSecondary }]}>
              Goal: 10,000 steps
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isWeightModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsWeightModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Weight
            </Text>
            <TextInput
              style={[styles.weightInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Enter weight in lbs"
              placeholderTextColor={colors.textSecondary}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              accessibilityLabel="Weight Input Field"
              accessibilityHint="Enter your weight in pounds"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setIsWeightModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Closes the weight input modal"
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveWeight}
                disabled={isSavingWeight}
                accessibilityRole="button"
                accessibilityLabel="Save Weight"
                accessibilityHint="Saves your weight entry"
              >
                {isSavingWeight ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isShoppingListModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsShoppingListModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Shopping List
            </Text>
            {selectedMeal && (
              <View style={styles.shoppingListContainer}>
                <Text style={[styles.shoppingListTitle, { color: colors.text }]}>
                  {selectedMeal.name}
                </Text>
                <View style={styles.ingredientsList}>
                  {selectedMeal.ingredients.map((ingredient: string, index: number) => (
                    <Text
                      key={index}
                      style={[styles.ingredientText, { color: colors.text }]}
                    >
                      • {ingredient}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsShoppingListModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              accessibilityHint="Closes the shopping list modal"
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isWearableModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsWearableModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Sync Wearable Data
            </Text>
            <Text style={[styles.modalText, { color: colors.text }]}>
              Connect your wearable device to sync activity data.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setIsWearableModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Closes the wearable sync modal"
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSyncWearable}
                disabled={isSyncing}
                accessibilityRole="button"
                accessibilityLabel="Sync Data"
                accessibilityHint="Starts syncing wearable data"
              >
                {isSyncing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Sync</Text>
                )}
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
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeButton: {
    padding: 8,
    borderRadius: 12,
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
  avatarButton: {
    padding: 8,
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
  },
  contentContainer: {
    paddingBottom: 100,
  },
  sectionContainer: {
    padding: 16,
    borderRadius: 12,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  caloriesProgressContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  webProgressContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webProgressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  caloriesTextContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  caloriesText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
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
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  macroLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  motivation: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 16, 
    marginBottom: 24,
  },
  quickLogContainer: {
    padding: 16,
    marginTop: 16,
  },
  quickLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  quickLogButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
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
  weightInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  weightPlaceholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
  recommendedMealsList: {
    paddingVertical: 16,
  },
  recommendedMealCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
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
  recommendedMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendedMealName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  recommendedMealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendedMealMacro: {
    fontSize: 14,
  },
  forecastContainer: {
    padding: 16,
  },
  forecastText: {
    fontSize: 16,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  shoppingListContainer: {
    marginVertical: 16,
  },
  shoppingListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ingredientsList: {
    marginLeft: 8,
  },
  ingredientText: {
    fontSize: 16,
    marginBottom: 8,
  },
  wearableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  wearableCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
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
  wearableValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  wearableLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  lastSyncText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  stepCount: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 16,
    marginTop: 8,
  },
  stepProgress: {
    alignItems: 'center',
    marginTop: 16,
  },
  stepGoal: {
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
}); 