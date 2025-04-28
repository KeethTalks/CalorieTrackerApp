import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';

type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
};

export default function MealsScreen() {
  const { colors } = useTheme();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const mealsRef = collection(db, 'meals');
      const q = query(
        mealsRef,
        where('timestamp', '>=', today)
      );
      
      const querySnapshot = await getDocs(q);
      const mealsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as Meal[];
      
      setMeals(mealsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    } catch (error) {
      console.error('Error fetching meals:', error);
      Alert.alert('Error', 'Failed to load meals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'meals', mealId));
              setMeals(meals.filter(meal => meal.id !== mealId));
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderMealItem = ({ item }: { item: Meal }) => (
    <View
      style={[
        styles.mealItem,
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}
    >
      <View style={styles.mealHeader}>
        <Text style={[styles.mealName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.mealType, { color: colors.primary }]}>
          {item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}
        </Text>
      </View>
      
      <View style={styles.mealDetails}>
        <Text style={[styles.calories, { color: colors.text }]}>
          {item.calories} kcal
        </Text>
        <View style={styles.macros}>
          <Text style={[styles.macroText, { color: colors.text }]}>
            P: {item.protein}g
          </Text>
          <Text style={[styles.macroText, { color: colors.text }]}>
            C: {item.carbs}g
          </Text>
          <Text style={[styles.macroText, { color: colors.text }]}>
            F: {item.fat}g
          </Text>
        </View>
      </View>
      
      <View style={styles.mealFooter}>
        <Text style={[styles.timestamp, { color: colors.text }]}>
          {format(item.timestamp, 'h:mm a')}
        </Text>
        <TouchableOpacity
          onPress={() => handleDeleteMeal(item.id)}
          accessibilityLabel="Delete meal"
          accessibilityHint="Double tap to delete this meal"
        >
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading meals...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={meals}
        renderItem={renderMealItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No meals logged today
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  mealItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mealType: {
    fontSize: 14,
    fontWeight: '500',
  },
  mealDetails: {
    marginBottom: 8,
  },
  calories: {
    fontSize: 16,
    marginBottom: 4,
  },
  macros: {
    flexDirection: 'row',
    gap: 12,
  },
  macroText: {
    fontSize: 14,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 14,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 