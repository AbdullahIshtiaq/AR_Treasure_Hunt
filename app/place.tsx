// app/place.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Treasure } from '../constants/coordinates';
import { useLocation } from '../hooks/useLocation';

export default function PlaceScreen() {
  const [treasureName, setTreasureName] = useState('');
  const { location, errorMsg } = useLocation();
  const router = useRouter();

  const handlePlaceTreasure = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    if (!treasureName.trim()) {
      Alert.alert('Error', 'Please enter a treasure name');
      return;
    }

    try {
      const newTreasure: Treasure = {
        id: treasureName,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        found: false,
      };

      // Load existing treasures
      const stored = await AsyncStorage.getItem('treasures');
      const treasures: Treasure[] = stored ? JSON.parse(stored) : [];

      // Add new treasure
      treasures.push(newTreasure);

      // Save back to storage
      await AsyncStorage.setItem('treasures', JSON.stringify(treasures));

      Alert.alert(
        'Success! 🎉',
        `Treasure "${treasureName}" placed at your location!`,
        [
          {
            text: 'Place Another',
            onPress: () => setTreasureName(''),
          },
          {
            text: 'Go Home',
            onPress: () => router.push('/'),
          },
        ]
      );

      console.log('✅ Treasure placed:', newTreasure);
    } catch (error) {
      Alert.alert('Error', 'Failed to save treasure');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>📍 Place Treasure</Text>
        <Text style={styles.subtitle}>Hide a treasure at your current location</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Your Location:</Text>
          {location ? (
            <View style={styles.locationBox}>
              <Text style={styles.locationText}>
                📍 Lat: {location.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                📍 Lon: {location.coords.longitude.toFixed(6)}
              </Text>
              <Text style={styles.accuracyText}>
                Accuracy: ±{location.coords.accuracy?.toFixed(0)}m
              </Text>
            </View>
          ) : errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <Text style={styles.loadingText}>Getting location...</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Treasure Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter treasure name..."
            placeholderTextColor="#888"
            value={treasureName}
            onChangeText={setTreasureName}
            autoFocus
          />
        </View>

        <Pressable
          style={[styles.placeButton, !location && styles.disabledButton]}
          onPress={handlePlaceTreasure}
          disabled={!location}
        >
          <Text style={styles.placeButtonText}>
            {location ? '🎁 Place Treasure Here' : '⏳ Waiting for GPS...'}
          </Text>
        </Pressable>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Tip: Walk to different locations to place multiple treasures!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  backButton: {
    marginTop: 50,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#2a2a3e',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 10,
  },
  locationBox: {
    gap: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'monospace',
  },
  accuracyText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
  },
  loadingText: {
    fontSize: 14,
    color: '#aaa',
  },
  input: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    fontSize: 18,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  placeButton: {
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.5,
  },
  placeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  infoBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  infoText: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
  },
});