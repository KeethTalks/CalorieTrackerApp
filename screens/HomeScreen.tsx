import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText} accessibilityRole="header">
          Welcome Back!
        </Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Sign Out Button"
          accessibilityHint="Signs out of your account and returns to the login page"
        >
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfoContainer} accessibilityLabel="User Information">
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email ?? 'Not available'}</Text>

          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user?.uid ?? 'Not available'}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>2000</Text>
            <Text style={styles.statLabel}>Daily Goal</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1200</Text>
            <Text style={styles.statLabel}>Consumed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>800</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel="Add Meal Button"
          accessibilityHint="Add a new meal to your daily calorie count"
        >
          <Text style={styles.addButtonText}>Add Meal</Text>
        </TouchableOpacity>

        <Text style={styles.motivation} accessibilityLabel="Motivational Message">
          Remember, every calorie counts toward your goals!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F2',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFC300',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5733',
  },
  logoutButton: {
    padding: 12,
    backgroundColor: '#FF5733',
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userInfoContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFC300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#FFC300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5733',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#FF5733',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  motivation: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 