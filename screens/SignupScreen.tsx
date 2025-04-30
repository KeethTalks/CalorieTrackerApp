import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

export default function SignupScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, loading } = useAuth();
  const { colors } = useTheme();

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const emailTranslateX = useSharedValue(-100);
  const passwordTranslateX = useSharedValue(-100);
  const confirmPasswordTranslateX = useSharedValue(-100);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);

  useEffect(() => {
    // Start animations
    logoOpacity.value = withTiming(1, { duration: 1000 });
    logoScale.value = withSpring(1, { damping: 8 });
    
    emailTranslateX.value = withDelay(
      200,
      withSpring(0, { damping: 8 })
    );
    
    passwordTranslateX.value = withDelay(
      400,
      withSpring(0, { damping: 8 })
    );
    
    confirmPasswordTranslateX.value = withDelay(
      600,
      withSpring(0, { damping: 8 })
    );
    
    buttonOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 500 })
    );
    
    buttonScale.value = withDelay(
      800,
      withSpring(1, { damping: 8 })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const emailStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: emailTranslateX.value }],
  }));

  const passwordStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: passwordTranslateX.value }],
  }));

  const confirmPasswordStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: confirmPasswordTranslateX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Text style={[styles.logo, { color: colors.primary }]}>
            Calorie Tracker by KeethTalks
          </Text>
        </Animated.View>

        <Animated.View style={[styles.inputContainer, emailStyle]}>
          <Ionicons name="mail-outline" size={24} color={colors.text} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Email Input Field"
            accessibilityHint="Enter your email address"
          />
        </Animated.View>

        <Animated.View style={[styles.inputContainer, passwordStyle]}>
          <Ionicons name="lock-closed-outline" size={24} color={colors.text} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Password Input Field"
            accessibilityHint="Enter a secure password with at least 6 characters"
          />
        </Animated.View>

        <Animated.View style={[styles.inputContainer, confirmPasswordStyle]}>
          <Ionicons name="lock-closed-outline" size={24} color={colors.text} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Confirm Password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            accessibilityLabel="Confirm Password Input Field"
            accessibilityHint="Re-enter your password to confirm it matches"
          />
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSignup}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Signup Button"
            accessibilityHint="Creates your account using the provided email and password"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Login Link"
            accessibilityHint="Navigate to the login page"
          >
            <Text style={[styles.loginText, { color: colors.primary }]}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 