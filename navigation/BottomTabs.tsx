import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { TouchableOpacity } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './AppNavigator';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MealsScreen from '../screens/MealsScreen';
import PlanScreen from '../screens/PlanScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddMealScreen from '../screens/AddMealScreen';

export type BottomTabParamList = {
  Home: undefined;
  Meals: undefined;
  AddMeal: undefined;
  Plan: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarShowLabel: true,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home Screen',
        }}
      />
      <Tab.Screen
        name="Meals"
        component={MealsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
          tabBarLabel: 'Meals',
          tabBarAccessibilityLabel: 'Meals Screen',
        }}
      />
      <Tab.Screen
        name="AddMeal"
        component={AddMealScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
          tabBarLabel: 'Add Meal',
          tabBarAccessibilityLabel: 'Add Meal Screen'
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            const parent = navigation.getParent();
            if (parent) {
              parent.navigate({
                name: 'Tabs',
                params: { screen: 'AddMeal' }
              });
            }
          }
        })}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          tabBarLabel: 'Plan',
          tabBarAccessibilityLabel: 'Meal Plan Screen',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
          tabBarAccessibilityLabel: 'Profile Screen',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          tabBarLabel: 'Settings',
          tabBarAccessibilityLabel: 'Settings Screen',
        }}
      />
    </Tab.Navigator>
  );
} 