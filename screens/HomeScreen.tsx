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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import * as Progress from 'react-native-progress';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

type DailyStats = {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goalCalories: number;
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
              onPress={() => Alert.alert('Coming Soon', 'Add Weight feature coming soon!')}
              accessibilityRole="button"
              accessibilityLabel="Add weight"
              accessibilityHint="Opens a dialog to add new weight entry"
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

        <View style={styles.discoverContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
            Discover
          </Text>
          <View style={styles.discoverBoxesContainer}>
            <TouchableOpacity
              style={[styles.discoverBox, { backgroundColor: colors.card }]}
              onPress={() => console.log('Navigating to Sleep')}
              accessibilityRole="button"
              accessibilityLabel="Sleep tracking"
              accessibilityHint="Opens sleep tracking feature"
            >
              <Text style={[styles.discoverBoxText, { color: colors.text }]}>
                Sleep
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.discoverBox, { backgroundColor: colors.card }]}
              onPress={() => console.log('Navigating to Workouts')}
              accessibilityRole="button"
              accessibilityLabel="Workout tracking"
              accessibilityHint="Opens workout tracking feature"
            >
              <Text style={[styles.discoverBoxText, { color: colors.text }]}>
                Workouts
              </Text>
            </TouchableOpacity>
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
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: colors.primary }
        ]}
        onPress={() => navigation.navigate('AddMeal')}
        accessibilityRole="button"
        accessibilityLabel="Add new meal"
        accessibilityHint="Double tap to add a new meal"
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.fabText}>Add Meal</Text>
      </TouchableOpacity>
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
    marginBottom: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  discoverContainer: {
    padding: 16,
    marginTop: 16,
  },
  discoverBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discoverBox: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
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
  discoverBoxText: {
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
    marginBottom: 8,
  },
  quickLogButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 