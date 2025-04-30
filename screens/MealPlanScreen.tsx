import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebase-config.js';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MealPlanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MealPlan'>;

interface Props {
  navigation: MealPlanScreenNavigationProp;
}

interface Meal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface MealPlan {
  Breakfast?: Meal;
  Lunch?: Meal;
  Dinner?: Meal;
  Snacks?: Meal;
}

const MealPlanScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [userSettings, setUserSettings] = useState({
    dietType: 'none',
    cuisinePreference: 'any',
    goalCalories: 2000,
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    if (!user) return;
    
    try {
      const userSettingsRef = doc(db, 'userSettings', user.uid);
      const docSnap = await getDoc(userSettingsRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserSettings({
          dietType: data.dietType || 'none',
          cuisinePreference: data.cuisinePreference || 'any',
          goalCalories: data.goalCalories || 2000,
        });
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      Alert.alert('Error', 'Failed to load user settings');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMealPlan = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      // Mock AI meal plan generation based on user preferences
      const mockMealPlan: MealPlan = {
        Breakfast: { name: "Avocado Toast", calories: 250 },
        Lunch: { name: "Grilled Chicken Salad", calories: 400 },
        Dinner: { name: "Salmon with Quinoa", calories: 500 },
        Snacks: { name: "Greek Yogurt", calories: 150 },
      };

      // Filter based on dietary preferences
      if (userSettings.dietType === 'vegetarian') {
        mockMealPlan.Lunch = { name: "Quinoa Buddha Bowl", calories: 400 };
        mockMealPlan.Dinner = { name: "Vegetable Stir Fry", calories: 500 };
      } else if (userSettings.dietType === 'vegan') {
        mockMealPlan.Breakfast = { name: "Tofu Scramble", calories: 250 };
        mockMealPlan.Lunch = { name: "Vegan Buddha Bowl", calories: 400 };
        mockMealPlan.Dinner = { name: "Lentil Curry", calories: 500 };
        mockMealPlan.Snacks = { name: "Hummus with Veggies", calories: 150 };
      }

      setMealPlan(mockMealPlan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      Alert.alert('Error', 'Failed to generate meal plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToLog = async (mealType: keyof MealPlan) => {
    if (!user || !mealPlan[mealType]) return;
    
    try {
      const mealsRef = collection(db, 'meals');
      await addDoc(mealsRef, {
        userId: user.uid,
        mealType,
        name: mealPlan[mealType]?.name,
        calories: mealPlan[mealType]?.calories,
        timestamp: selectedDate,
      });
      
      Alert.alert('Success', `${mealPlan[mealType]?.name} added to your log`);
    } catch (error) {
      console.error('Error adding meal to log:', error);
      Alert.alert('Error', 'Failed to add meal to log');
    }
  };

  const renderMealContainer = (mealType: keyof MealPlan) => {
    const meal = mealPlan[mealType];
    
    return (
      <View
        key={mealType}
        style={[styles.mealContainer, { backgroundColor: colors.card }]}
      >
        <Text style={[styles.mealType, { color: colors.text }]}>
          {mealType}
        </Text>
        {meal ? (
          <>
            <Text style={[styles.mealName, { color: colors.text }]}>
              {meal.name}
            </Text>
            <Text style={[styles.mealCalories, { color: colors.textSecondary }]}>
              {meal.calories} calories
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => handleAddToLog(mealType)}
              accessibilityRole="button"
              accessibilityLabel={`Add ${meal.name} to log`}
              accessibilityHint={`Adds ${meal.name} to your meal log`}
            >
              <Ionicons name="add-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add to Log</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No meal planned
          </Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Meal Plan</Text>
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: colors.primary }]}
          onPress={generateMealPlan}
          disabled={isGenerating}
          accessibilityRole="button"
          accessibilityLabel="Generate AI Meal Plan"
          accessibilityHint="Generates a personalized meal plan for the day"
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate AI Meal Plan</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {Object.keys(mealPlan).length > 0 ? (
          <>
            {renderMealContainer('Breakfast')}
            {renderMealContainer('Lunch')}
            {renderMealContainer('Dinner')}
            {renderMealContainer('Snacks')}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Generate a meal plan to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  generateButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mealContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  mealType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MealPlanScreen; 