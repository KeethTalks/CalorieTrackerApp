import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import MealsScreen from '../screens/MealsScreen';
import AddMealScreen from '../screens/AddMealScreen';
import PlanScreen from '../screens/PlanScreen';

const Tab = createBottomTabNavigator();

export function BottomTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Meals':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'AddMeal':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Plan':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: 15,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarAccessibilityLabel: 'Dashboard tab',
        }}
      />
      <Tab.Screen 
        name="Meals" 
        component={MealsScreen}
        options={{
          title: 'Today\'s Meals',
          tabBarAccessibilityLabel: 'Meals tab',
        }}
      />
      <Tab.Screen 
        name="AddMeal" 
        component={AddMealScreen}
        options={{
          title: 'Add Meal',
          tabBarAccessibilityLabel: 'Add meal tab',
        }}
      />
      <Tab.Screen 
        name="Plan" 
        component={PlanScreen}
        options={{
          title: 'Meal Plan',
          tabBarAccessibilityLabel: 'Meal plan tab',
        }}
      />
    </Tab.Navigator>
  );
} 