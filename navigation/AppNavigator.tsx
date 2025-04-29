import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { BottomTabs } from './BottomTabs';
import LoadingScreen from '../screens/LoadingScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import AIScanScreen from '../screens/AIScanScreen';
import VoiceLogScreen from '../screens/VoiceLogScreen';
import AddMealScreen from '../screens/AddMealScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Tabs: undefined;
  AddMeal: undefined;
  BarcodeScanner: undefined;
  AIScan: undefined;
  VoiceLog: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { isDark, colors } = useTheme();

  const theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName={user ? 'Tabs' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
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
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                headerShown: false,
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
              }}
            />
            <Stack.Screen
              name="AddMeal"
              component={AddMealScreen}
              options={{
                title: 'Add Meal',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="BarcodeScanner"
              component={BarcodeScannerScreen}
              options={{
                title: 'Scan Barcode',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="AIScan"
              component={AIScanScreen}
              options={{
                title: 'Scan with AI',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="VoiceLog"
              component={VoiceLogScreen}
              options={{
                title: 'Voice Log',
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 