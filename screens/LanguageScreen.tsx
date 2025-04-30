import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'es', name: 'Spanish' },
  { id: 'fr', name: 'French' },
];

export default function LanguageScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      if (!user) return;
      
      const settingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSelectedLanguage(data.language || 'en');
      } else {
        setSelectedLanguage('en');
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelect = async (languageId: string) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      await updateDoc(settingsRef, {
        language: languageId,
        updatedAt: new Date(),
      });
      
      setSelectedLanguage(languageId);
      Alert.alert('Success', 'Language preference updated');
    } catch (error) {
      console.error('Error updating language:', error);
      Alert.alert('Error', 'Failed to update language preference');
    } finally {
      setIsSaving(false);
    }
  };

  const renderLanguageItem = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        { backgroundColor: colors.card },
        selectedLanguage === item.id && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      onPress={() => handleLanguageSelect(item.id)}
      disabled={isSaving}
      accessibilityRole="button"
      accessibilityLabel={`Select ${item.name} language`}
      accessibilityHint={`Changes the app language to ${item.name}`}
    >
      <Text style={[styles.languageText, { color: colors.text }]}>{item.name}</Text>
      {selectedLanguage === item.id && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Language Settings</Text>
      </View>

      <FlatList
        data={LANGUAGES}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 