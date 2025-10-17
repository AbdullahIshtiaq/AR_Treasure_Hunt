// app/explore.tsx
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ARCamera } from '../components/ARCamera';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ARCamera />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});