import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading } = useAuth();

  const handleSignup = async () => {
    if (email === '' || password === '' || confirmPassword === '') {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters long');
      return;
    }

    try {
      await signUp(email, password);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create account'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Create Your Account
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Email Input Field"
          accessibilityHint="Enter your email address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Password Input Field"
          accessibilityHint="Enter a secure password with at least 6 characters"
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          accessibilityLabel="Confirm Password Input Field"
          accessibilityHint="Re-enter your password to confirm it matches"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonLoading]}
        onPress={handleSignup}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Signup Button"
        accessibilityHint="Creates your account using the provided email and password"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText} accessibilityLabel="Login Suggestion">
          Already have an account?{' '}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="link"
          accessibilityLabel="Login Link"
          accessibilityHint="Navigates to the login page"
        >
          <Text style={styles.footerLink}>Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF7F2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FF5733',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC300',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF5733',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  footerLink: {
    color: '#FF5733',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
}); 