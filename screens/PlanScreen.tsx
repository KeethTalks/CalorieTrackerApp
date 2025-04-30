import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format, addDays, subDays, isToday, isYesterday, isTomorrow } from 'date-fns';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';

type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: any;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'water';
};

type MealContainer = {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'water';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const MEAL_CONTAINERS: MealContainer[] = [
  { type: 'breakfast', icon: 'cafe-outline', label: 'Breakfast' },
  { type: 'lunch', icon: 'restaurant-outline', label: 'Lunch' },
  { type: 'dinner', icon: 'fast-food-outline', label: 'Dinner' },
  { type: 'snacks', icon: 'nutrition-outline', label: 'Snacks' },
  { type: 'water', icon: 'water-outline', label: 'Water' },
];

export default function PlanScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  const fetchMeals = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const mealsRef = collection(db, 'meals');
      const q = query(
        mealsRef,
        where('timestamp', '>=', startOfDay),
        where('timestamp', '<=', endOfDay)
      );
      
      const querySnapshot = await getDocs(q);
      const mealsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meal[];
      
      setMeals(mealsData);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
  };

  const getDateDisplay = () => {
    if (isToday(selectedDate)) return 'Today';
    if (isYesterday(selectedDate)) return 'Yesterday';
    if (isTomorrow(selectedDate)) return 'Tomorrow';
    return format(selectedDate, 'MMM d, yyyy');
  };

  const handleSwipeLeft = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };

  const handleSwipeRight = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  const getMealsForType = (type: Meal['mealType']) => {
    return meals.filter(meal => meal.mealType === type);
  };

  const getTotalCalories = () => {
    return meals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Swipeable
          onSwipeableLeftOpen={handleSwipeLeft}
          onSwipeableRightOpen={handleSwipeRight}
          containerStyle={styles.swipeContainer}
        >
          <View style={styles.dateContainer}>
            <TouchableOpacity onPress={handleSwipeLeft}>
              <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {getDateDisplay()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleSwipeRight}>
              <Ionicons name="chevron-forward-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </Swipeable>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: colors.text }]}>Meal Planner</Text>
          
          <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryText, { color: colors.text }]}>
              Total: {getTotalCalories()}/2000 kcal
            </Text>
          </View>

          {MEAL_CONTAINERS.map((container) => (
            <View
              key={container.type}
              style={[styles.mealContainer, { backgroundColor: colors.card }]}
            >
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleContainer}>
                  <Ionicons name={container.icon} size={24} color={colors.primary} />
                  <Text style={[styles.mealTitle, { color: colors.text }]}>
                    {container.label}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddMeal', { mealType: container.type })}
                  accessibilityLabel={`Add ${container.label} meal`}
                  accessibilityHint={`Navigates to add a ${container.label} meal`}
                >
                  <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {getMealsForType(container.type).length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No meals added
                </Text>
              ) : (
                getMealsForType(container.type).map((meal) => (
                  <View key={meal.id} style={styles.mealItem}>
                    <Text style={[styles.mealName, { color: colors.text }]}>
                      {meal.name}
                    </Text>
                    <Text style={[styles.mealCalories, { color: colors.textSecondary }]}>
                      {meal.calories} kcal
                    </Text>
                  </View>
                ))
              )}
            </View>
          ))}
        </ScrollView>

        <DateTimePicker
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateChange}
          onCancel={() => setDatePickerVisible(false)}
          date={selectedDate}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swipeContainer: {
    width: '100%',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  mealContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mealName: {
    fontSize: 16,
  },
  mealCalories: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
}); 