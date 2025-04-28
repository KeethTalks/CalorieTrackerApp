import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth } from '../firebase-config';

export function FirebaseTest() {
  const [status, setStatus] = useState('Checking Firebase...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Test Firebase Auth
        const unsubscribe = auth.onAuthStateChanged((user) => {
          setStatus(`Firebase Auth initialized. User: ${user ? 'Logged in' : 'Not logged in'}`);
        });

        // Test Firestore (if needed)
        // const db = getFirestore();
        // const testDoc = await getDoc(doc(db, 'test', 'test'));
        // console.log('Firestore test:', testDoc.exists());

        return () => unsubscribe();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Firebase initialization failed');
      }
    };

    checkFirebase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>
      {error && <Text style={styles.error}>Error: {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
}); 