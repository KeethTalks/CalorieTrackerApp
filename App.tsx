import React, { lazy, Suspense } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';

// Import Firebase config and context
import './firebase-config';
import { AuthProvider } from './context/AuthContext';

// Import navigation and screens
import AppNavigator from './navigation/AppNavigator';
import LoadingScreen from './screens/LoadingScreen';

// Error Fallback component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Something went wrong!</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Text style={styles.errorHint}>
        Please try restarting the app or contact support if the problem persists.
      </Text>
    </View>
  );
}

// Main App component
export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
            <AppNavigator />
          </Suspense>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
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
});