import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ThemeProvider } from './__mocks__/ThemeProvider';
import { AuthProvider } from './__mocks__/AuthProvider';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { BottomTabParamList } from '../navigation/BottomTabs';
import BottomTabs from '../navigation/BottomTabs';
import PlanScreen from '../screens/PlanScreen';
import AddMealScreen from '../screens/AddMealScreen';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  const mockNavigation = {
    navigate: jest.fn(),
    getParent: jest.fn().mockImplementation(() => ({
      navigate: jest.fn()
    })),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setParams: jest.fn(),
    setOptions: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(),
    canGoBack: jest.fn(),
    getState: jest.fn(),
    addListener: jest.fn()
  };

  return {
    ...actualNav,
    useNavigation: () => mockNavigation,
    useRoute: () => ({
      params: {},
      key: 'test-key'
    })
  };
});

// Mock other dependencies
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user' },
    loading: false,
  }),
}));

jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      text: '#000000',
      primary: '#007AFF',
      card: '#ffffff',
      border: '#e0e0e0'
    },
  }),
}));

// Mock screens
describe('Navigation Tests', () => {
  const mockNavigate = jest.fn();
  const mockGetParent = jest.fn().mockImplementation(() => ({
    navigate: jest.fn()
  }));
  const mockNavigation = {
    navigate: mockNavigate,
    getParent: mockGetParent,
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setParams: jest.fn(),
    setOptions: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(),
    canGoBack: jest.fn(),
    getState: jest.fn(),
    addListener: jest.fn()
  } as unknown as NativeStackNavigationProp<RootStackParamList, 'AddMeal'>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => mockNavigation,
      useRoute: () => ({
        params: {},
        key: 'test-key'
      } as unknown as RouteProp<RootStackParamList, 'AddMeal'>)
    }));
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should navigate to AddMeal screen from AddMeal tab', async () => {

    render(
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <BottomTabs />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    );

    const addMealTab = screen.getByTestId('add-meal-tab');
    fireEvent.press(addMealTab);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockGetParent).toHaveBeenCalled();
    expect(mockGetParent().navigate).toHaveBeenCalledWith('Tabs', {
      screen: 'AddMeal'
    });
  });

  it('should navigate to AddMeal screen from PlanScreen + icon', async () => {

    render(
      <NavigationContainer>
        <ThemeProvider>
          <AuthProvider>
            <PlanScreen />
          </AuthProvider>
        </ThemeProvider>
      </NavigationContainer>
    );

    const addMealButton = screen.getByText('Add Breakfast meal');
    fireEvent.press(addMealButton);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockGetParent).toHaveBeenCalled();
    expect(mockGetParent().navigate).toHaveBeenCalledWith('Tabs', {
      screen: 'AddMeal'
    });
  });

  it('should handle navigation from AddMeal screen back to previous screen', async () => {

    const mockRoute = {
      name: 'AddMeal',
      key: 'test-key',
      params: {
        mealType: 'breakfast'
      }
    } as unknown as RouteProp<RootStackParamList, 'AddMeal'>;

    render(
      <NavigationContainer>
        <ThemeProvider>
          <AuthProvider>
            <AddMealScreen 
              navigation={mockNavigation}
              route={mockRoute}
            />
          </AuthProvider>
        </ThemeProvider>
      </NavigationContainer>
    );

    const backButton = screen.getByText('Back');
    fireEvent.press(backButton);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockGetParent).toHaveBeenCalled();
    expect(mockGetParent().navigate).toHaveBeenCalledWith('Tabs', {
      screen: 'Home'
    });
  });
});
