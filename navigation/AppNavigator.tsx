import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';
import BottomTabs from './BottomTabs';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AddMealScreen from '../screens/AddMealScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import AIScanScreen from '../screens/AIScanScreen';
import VoiceLogScreen from '../screens/VoiceLogScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import LanguageScreen from '../screens/LanguageScreen';
import { BottomTabParamList } from './BottomTabs';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Tabs: undefined;
  AddMeal: {
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'water';
  };
  BarcodeScanner: undefined;
  AIScan: undefined;
  VoiceLog: undefined;
  EditProfile: undefined;
  Language: undefined;
  MealPlan: undefined;
} & BottomTabParamList;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Tabs' : 'Login'}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!user ? (
          // Authentication Screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />
          </>
        ) : (
          // Authenticated Screens
          <>
            <Stack.Screen
              name="Tabs"
              component={BottomTabs}
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="AddMeal"
              component={AddMealScreen}
              options={{
                title: 'Add Meal',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="BarcodeScanner"
              component={BarcodeScannerScreen}
              options={{
                title: 'Scan Barcode',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="AIScan"
              component={AIScanScreen}
              options={{
                title: 'Scan with AI',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="VoiceLog"
              component={VoiceLogScreen}
              options={{
                title: 'Voice Log',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                title: 'Edit Profile',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Language"
              component={LanguageScreen}
              options={{
                title: 'Language Settings',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 