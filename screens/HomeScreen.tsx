import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

type DailyStats = {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goalCalories: number;
};

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState<DailyStats>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    goalCalories: 2000, // Default goal, can be made dynamic
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailyStats();
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
      
      const dailyStats = meals.reduce((acc, meal) => ({
        totalCalories: acc.totalCalories + meal.calories,
        totalProtein: acc.totalProtein + meal.protein,
        totalCarbs: acc.totalCarbs + meal.carbs,
        totalFat: acc.totalFat + meal.fat,
        goalCalories: acc.goalCalories,
      }), { ...stats });
      
      setStats(dailyStats);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = () => {
    return Math.min((stats.totalCalories / stats.goalCalories) * 100, 100);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
        <Text style={[styles.headerText, { color: colors.text }]} accessibilityRole="header">
          Welcome Back!
        </Text>
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
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Sign Out Button"
            accessibilityHint="Signs out of your account and returns to the login page"
          >
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfoContainer} accessibilityLabel="User Information">
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email ?? 'Not available'}</Text>

          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user?.uid ?? 'Not available'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>2000</Text>
            <Text style={styles.statLabel}>Daily Goal</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1200</Text>
            <Text style={styles.statLabel}>Consumed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>800</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border }
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Calories
          </Text>
          <Text style={[styles.calories, { color: colors.text }]}>
            {stats.totalCalories} / {stats.goalCalories} kcal
          </Text>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: colors.border }
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: colors.primary,
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.macrosContainer}>
          <View
            style={[
              styles.macroCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
          >
            <Text style={[styles.macroTitle, { color: colors.text }]}>
              Protein
            </Text>
            <Text style={[styles.macroValue, { color: colors.text }]}>
              {stats.totalProtein}g
            </Text>
          </View>

          <View
            style={[
              styles.macroCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
          >
            <Text style={[styles.macroTitle, { color: colors.text }]}>
              Carbs
            </Text>
            <Text style={[styles.macroValue, { color: colors.text }]}>
              {stats.totalCarbs}g
            </Text>
          </View>

          <View
            style={[
              styles.macroCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
          >
            <Text style={[styles.macroTitle, { color: colors.text }]}>
              Fat
            </Text>
            <Text style={[styles.macroValue, { color: colors.text }]}>
              {stats.totalFat}g
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: colors.primary }
          ]}
          onPress={() => navigation.navigate('AddMeal')}
          accessibilityLabel="Add new meal"
          accessibilityHint="Double tap to add a new meal"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Meal</Text>
        </TouchableOpacity>

        <Text style={styles.motivation} accessibilityLabel="Motivational Message">
          Remember, every calorie counts toward your goals!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F2',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFC300',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5733',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeButton: {
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 12,
    backgroundColor: '#FF5733',
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userInfoContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFC300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#FFC300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5733',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  calories: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
    marginHorizontal: 4,
    borderWidth: 1,
    alignItems: 'center',
  },
  macroTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  motivation: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 