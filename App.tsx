import React, { lazy, Suspense, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';
import Constants from 'expo-constants';

// Import Firebase config and context
import './firebase-config';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FirebaseTest } from './components/FirebaseTest';

// Import navigation and screens
import AppNavigator from './navigation/AppNavigator';
import LoadingScreen from './screens/LoadingScreen';

// Error Fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Something went wrong!</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Text style={styles.errorHint}>
        Please try restarting the app or contact support if the problem persists.
      </Text>
      <Text style={styles.retryButton} onPress={resetErrorBoundary}>
        Try Again
      </Text>
    </View>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF5733" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

// Main App component
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Validate environment variables
        if (!Constants.expoConfig?.extra?.firebase) {
          throw new Error('Firebase configuration is missing. Please check your environment variables.');
        }
        
        // Log the Firebase config (without sensitive data)
        console.log('Firebase Config:', {
          ...Constants.expoConfig.extra.firebase,
          apiKey: '[REDACTED]'
        });
        
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize app'));
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return <LoadingFallback />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
              setError(null);
              setIsReady(false);
            }}
          >
            <AppNavigator />
          </ErrorBoundary>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF7F2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF7F2',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorTitle: {
    color: '#FF5733',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#333',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorHint: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  retryButton: {
    color: '#FF5733',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});