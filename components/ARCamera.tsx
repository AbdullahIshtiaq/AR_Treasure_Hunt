/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable react/no-unknown-property */
// components/ARCamera.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Canvas } from '@react-three/fiber/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Treasure } from '../constants/coordinates';
import { useLocation } from '../hooks/useLocation';
import { ARModel } from './ARScene';

const FIND_RADIUS = 1; // meters

// Import your local OBJ and MTL files from assets
const treasureModel = {
  obj: require('../assets/models/soul.obj'),
};

export const ARCamera = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [foundTreasure, setFoundTreasure] = useState<Treasure | null>(null);
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const { location } = useLocation();
  const router = useRouter();
  const lastCheckTime = useRef<number>(0);

  // Request camera permission
  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Load treasures from storage
  useEffect(() => {
    const loadTreasures = async () => {
      try {
        const stored = await AsyncStorage.getItem('treasures');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Only load unfound treasures
          const unfound = parsed.filter((t: Treasure) => !t.found);
          setTreasures(unfound);
          console.log(`📍 Loaded ${unfound.length} treasures`);
        }
      } catch (error) {
        console.error('Failed to load treasures', error);
      }
    };
    loadTreasures();
  }, []);

  // Check distance to treasures - triggered on every location update
  useEffect(() => {
    if (!location || treasures.length === 0) return;

    // Check more frequently - only process every 200ms to avoid excessive calculations
    const now = Date.now();
    if (now - lastCheckTime.current < 200) return;
    lastCheckTime.current = now;

    let nearest = Infinity;

    for (let treasure of treasures) {
      const distance = getDistance(
        location.coords.latitude,
        location.coords.longitude,
        treasure.latitude,
        treasure.longitude
      );

      console.log(`📏 Distance to "${treasure.id}": ${distance.toFixed(2)}m`);

      // Track nearest
      if (distance < nearest) {
        nearest = distance;
      }

      // Find treasure if within radius
      if (distance <= FIND_RADIUS && !foundTreasure) {
        console.log(`🎉 FOUND: ${treasure.id} at ${distance.toFixed(2)}m`);
        setFoundTreasure(treasure);
        markAsFound(treasure.id);
        break;
      }
    }

    setNearestDistance(nearest !== Infinity ? nearest : null);
  }, [location, treasures, foundTreasure]);

  const markAsFound = async (treasureId: string) => {
    try {
      const stored = await AsyncStorage.getItem('treasures');
      if (stored) {
        const all = JSON.parse(stored);
        const updated = all.map((t: Treasure) =>
          t.id === treasureId ? { ...t, found: true } : t
        );
        await AsyncStorage.setItem('treasures', JSON.stringify(updated));
        console.log(`✅ Marked "${treasureId}" as found`);
      }
    } catch (error) {
      console.error('Failed to mark as found', error);
    }
  };

  const handleContinue = () => {
    setFoundTreasure(null);
    setTreasures(prev => prev.filter(t => t.id !== foundTreasure?.id));
  };

  if (permission === null) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>📷 No access to camera</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView style={styles.camera} facing="back" />

      {/* 3D Model Overlay - Only when found */}
      {foundTreasure && (
        <View style={styles.arLayer} pointerEvents="none">
          <Canvas
            style={styles.canvas}
            camera={{ position: [0, 0, 3], fov: 75 }}
            gl={{ alpha: true }}
          >
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 5]} intensity={2} />
            <directionalLight position={[-10, -10, 5]} intensity={1.5} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#FFFFFF" />
            <pointLight position={[-5, -5, 5]} intensity={2} color="#00D9FF" />
            <pointLight position={[0, 10, 0]} intensity={1.5} color="#FFFFFF" />
            <pointLight position={[0, -10, 0]} intensity={1.5} color="#9932CC" />
            <pointLight position={[0, 0, 10]} intensity={1.5} color="#00CED1" />
            <ARModel 
              position={[0, 0, -1.5]} 
              scale={3}
              modelSource={treasureModel}
            />
          </Canvas>
        </View>
      )}

      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>✕</Text>
      </Pressable>

      {/* Status Badge */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>
          🎁 {treasures.length} treasures remaining
        </Text>
      </View>

      {/* Distance Display - Only when NOT found */}
      {!foundTreasure && nearestDistance !== null && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceNumber}>{nearestDistance.toFixed(0)}m</Text>
          <Text style={styles.distanceLabel}>to nearest treasure</Text>
          {nearestDistance <= FIND_RADIUS && (
            <Text style={styles.distanceClose}>🔥 Very close!</Text>
          )}
          {nearestDistance > FIND_RADIUS && nearestDistance <= 30 && (
            <Text style={styles.distanceWarm}>Getting warmer!</Text>
          )}
        </View>
      )}

      {/* Found Overlay */}
      {foundTreasure && (
        <View style={styles.foundOverlay}>
          <View style={styles.foundCard}>
            <Text style={styles.foundTitle}>🎉 YOU FOUND IT!</Text>
            <Text style={styles.foundName}>{foundTreasure.id}</Text>
            <Text style={styles.foundSubtext}>
              Look at your screen to see the treasure!
            </Text>

            <View style={styles.buttonRow}>
              <Pressable style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueText}>
                  Keep Hunting ({treasures.length - 1} left)
                </Text>
              </Pressable>

              <Pressable style={styles.homeButton} onPress={() => router.push('/')}>
                <Text style={styles.homeText}>Home</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* No Treasures */}
      {!foundTreasure && treasures.length === 0 && (
        <View style={styles.noTreasuresOverlay}>
          <Text style={styles.noTreasuresTitle}>🗺️</Text>
          <Text style={styles.noTreasuresText}>No treasures to find!</Text>
          <Pressable style={styles.button} onPress={() => router.push('/place')}>
            <Text style={styles.buttonText}>📍 Place Treasure</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  arLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  canvas: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  distanceContainer: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  distanceNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  distanceLabel: {
    fontSize: 18,
    color: '#fff',
    marginTop: 5,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  distanceClose: {
    fontSize: 20,
    color: '#ff4444',
    marginTop: 15,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  distanceWarm: {
    fontSize: 18,
    color: '#ff6b6b',
    marginTop: 15,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  foundOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  foundCard: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  foundTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  foundName: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  foundSubtext: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  homeButton: {
    backgroundColor: '#555',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  homeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  noTreasuresOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  noTreasuresTitle: {
    fontSize: 64,
    marginBottom: 20,
  },
  noTreasuresText: {
    fontSize: 24,
    color: '#FFD700',
    marginBottom: 30,
    fontWeight: 'bold',
  },
});