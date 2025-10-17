// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Home() {
  const clearAllTreasures = async () => {
    Alert.alert(
      'Clear All Treasures?',
      'This will delete all placed treasures. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('treasures');
            Alert.alert('✅ Success', 'All treasures cleared!');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🗺️</Text>
        <Text style={styles.title}>AR Treasure Hunt</Text>
        <Text style={styles.subtitle}>Find hidden treasures using GPS + AR</Text>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonContainer}>
        {/* Place Treasure Card */}
        <Link href="/place" asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={styles.iconBoxEmoji}>📍</Text>
            </View>
            <Text style={styles.cardTitle}>Place Treasure</Text>
            <Text style={styles.cardSubtext}>Hide a treasure at your location</Text>
          </Pressable>
        </Link>

        {/* Start Hunt Card - Primary */}
        <Link href="/explore" asChild>
          <Pressable style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={styles.iconBoxEmoji}>🔍</Text>
            </View>
            <Text style={styles.cardTitle}>Start Hunt</Text>
            <Text style={styles.cardSubtext}>Find treasures near you</Text>
          </Pressable>
        </Link>

        {/* Clear All Card - Danger */}
        <Pressable style={[styles.card, styles.dangerCard]} onPress={clearAllTreasures}>
          <View style={[styles.iconBox, styles.dangerIconBox]}>
            <Text style={styles.iconBoxEmoji}>🗑️</Text>
          </View>
          <Text style={[styles.cardTitle, styles.dangerCardTitle]}>Clear All</Text>
          <Text style={[styles.cardSubtext, styles.dangerCardSubtext]}>
            Reset the game
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>📱 Walk around to discover hidden treasures!</Text>
        <Text style={styles.footerSubtext}>Place treasures, then hunt them down with AR</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#2a2a3e',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3a3a5e',
  },
  primaryCard: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  dangerCard: {
    backgroundColor: '#2a2a3e',
    borderColor: '#ff4444',
    borderWidth: 1.5,
  },
  // Icon Box Styles
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  primaryIconBox: {
    backgroundColor: 'rgba(26, 26, 46, 0.15)',
    borderColor: 'rgba(26, 26, 46, 0.25)',
  },
  dangerIconBox: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  iconBoxEmoji: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  primaryCardTitle: {
    color: '#1a1a2e',
  },
  dangerCardTitle: {
    color: '#ff4444',
  },
  cardSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  primaryCardSubtext: {
    color: '#1a1a2e',
    opacity: 0.7,
  },
  dangerCardSubtext: {
    color: '#999',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});