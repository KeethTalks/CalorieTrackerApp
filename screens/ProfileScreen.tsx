import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebase-config.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const DIET_TYPES = [
  { label: 'None', value: 'none' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Keto', value: 'keto' },
  { label: 'Gluten-Free', value: 'gluten-free' },
];

const CUISINE_PREFERENCES = [
  { label: 'Any', value: 'any' },
  { label: 'Italian', value: 'italian' },
  { label: 'Asian', value: 'asian' },
  { label: 'Mexican', value: 'mexican' },
];

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dietType, setDietType] = useState('none');
  const [cuisinePreference, setCuisinePreference] = useState('any');

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    if (!user) return;
    
    try {
      const userSettingsRef = doc(db, 'userSettings', user.uid);
      const docSnap = await getDoc(userSettingsRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDietType(data.dietType || 'none');
        setCuisinePreference(data.cuisinePreference || 'any');
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      Alert.alert('Error', 'Failed to load user settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', user.uid);
      await setDoc(userSettingsRef, {
        dietType,
        cuisinePreference,
      }, { merge: true });
      
      Alert.alert('Success', 'Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditProfile')}
          accessibilityRole="button"
          accessibilityLabel="Edit Profile"
          accessibilityHint="Opens the edit profile screen"
        >
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Dietary Preferences</Text>
        
        <View style={styles.preferenceGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Diet Type</Text>
          <View style={styles.optionsContainer}>
            {DIET_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.option,
                  { 
                    backgroundColor: dietType === type.value ? colors.primary : colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => setDietType(type.value)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${type.label} diet type`}
                accessibilityState={{ selected: dietType === type.value }}
              >
                <Text style={[
                  styles.optionText,
                  { color: dietType === type.value ? '#fff' : colors.text }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.preferenceGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Cuisine Preference</Text>
          <View style={styles.optionsContainer}>
            {CUISINE_PREFERENCES.map((cuisine) => (
              <TouchableOpacity
                key={cuisine.value}
                style={[
                  styles.option,
                  { 
                    backgroundColor: cuisinePreference === cuisine.value ? colors.primary : colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => setCuisinePreference(cuisine.value)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${cuisine.label} cuisine`}
                accessibilityState={{ selected: cuisinePreference === cuisine.value }}
              >
                <Text style={[
                  styles.optionText,
                  { color: cuisinePreference === cuisine.value ? '#fff' : colors.text }
                ]}>
                  {cuisine.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSavePreferences}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Save Preferences"
          accessibilityHint="Saves your dietary preferences"
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Language')}
          accessibilityRole="button"
          accessibilityLabel="Language Settings"
          accessibilityHint="Opens language settings"
        >
          <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={signOut}
        accessibilityRole="button"
        accessibilityLabel="Sign Out"
        accessibilityHint="Signs out of your account"
      >
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  preferenceGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  saveButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen; 