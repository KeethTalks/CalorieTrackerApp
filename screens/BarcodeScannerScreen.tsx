import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface FoodData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

type RootStackParamList = {
  BarcodeScanner: undefined;
  // Add other screen types as needed
};

type BarcodeScannerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BarcodeScanner'>;

interface BarcodeScannerScreenProps {
  navigation: BarcodeScannerScreenNavigationProp;
}

export default function BarcodeScannerScreen({ navigation }: BarcodeScannerScreenProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [foodData, setFoodData] = useState<FoodData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setIsLoading(true);

    try {
      // Mock API call - replace with actual API integration
      const mockResponse: FoodData = {
        name: "Granola Bar",
        calories: 150,
        protein: 3,
        carbs: 25,
        fat: 5
      };
      
      setFoodData(mockResponse);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to retrieve food data. Please try again or enter manually.",
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToMealLog = async () => {
    if (!foodData || !user) return;

    try {
      await addDoc(collection(db, 'meals'), {
        name: foodData.name,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        mealType: "scanned",
        timestamp: serverTimestamp(),
        userId: user.uid
      });

      Alert.alert("Success", "Meal added to your log!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save meal. Please try again.");
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>
          Camera permission is required to scan barcodes. Please enable it in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={[styles.viewfinder, { borderColor: colors.primary }]} />
      </View>

      {foodData && (
        <View style={[styles.foodDataContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.foodName, { color: colors.text }]}>{foodData.name}</Text>
          <View style={styles.nutritionInfo}>
            <Text style={[styles.nutritionText, { color: colors.text }]}>
              Calories: {foodData.calories}
            </Text>
            <Text style={[styles.nutritionText, { color: colors.text }]}>
              Protein: {foodData.protein}g
            </Text>
            <Text style={[styles.nutritionText, { color: colors.text }]}>
              Carbs: {foodData.carbs}g
            </Text>
            <Text style={[styles.nutritionText, { color: colors.text }]}>
              Fat: {foodData.fat}g
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleAddToMealLog}
              accessibilityRole="button"
              accessibilityLabel="Add to meal log"
              accessibilityHint="Saves the scanned food item to your meal log"
            >
              <Text style={styles.buttonText}>Add to Meal Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => setScanned(false)}
              accessibilityRole="button"
              accessibilityLabel="Scan again"
              accessibilityHint="Resets the scanner to scan another barcode"
            >
              <Text style={styles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: 300,
    height: 200,
    borderWidth: 2,
  },
  foodDataContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nutritionInfo: {
    marginBottom: 16,
  },
  nutritionText: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
}); 