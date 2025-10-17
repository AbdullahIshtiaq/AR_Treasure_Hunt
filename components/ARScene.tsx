/* eslint-disable react/no-unknown-property */
// components/ARScene.tsx
import { useFrame } from '@react-three/fiber';
import * as Asset from 'expo-asset';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

type ARModelProps = {
  position?: [number, number, number];
  scale?: number;
  modelSource?: string | { obj: any};
};

// OBJ Model Loader Component
function OBJModelLoader({ 
  position = [0, 0, -1], 
  scale = 0.3, 
  modelSource 
}: ARModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [modelObject, setModelObject] = useState<THREE.Object3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!modelSource) {
      console.error('No model source provided');
      setIsLoading(false);
      return;
    }

    const loadLocalModel = async () => {
      try {
        // Check if modelSource is an object with obj property
        if (typeof modelSource === 'object' && modelSource.obj) {
          console.log('Loading local OBJ model');
          
          // Resolve OBJ asset
          const objAsset = Asset.Asset.fromModule(modelSource.obj);
          await objAsset.downloadAsync();
          const objUri = objAsset.localUri;
          
          console.log('OBJ URI:', objUri);
          
          // Load OBJ without MTL - just geometry with solid color
          const objLoader = new OBJLoader();
          
          objLoader.load(
            objUri!,
            (object) => {
              console.log('✅ OBJ Model loaded!');
              console.log('Children:', object.children.length);
              
              // Apply realistic metallic, golden, and mystical colors
              let meshIndex = 0;
              const colors = [
                0xFFD700, // Gold
                0xFFA500, // Orange-Gold
                0xC0C0C0, // Silver
                0x696969, // Dim Gray (metallic)
                0x8B7355, // Bronze
                0x9932CC, // Dark Orchid (mystical)
                0x4B0082, // Indigo (mystical)
                0x00CED1, // Dark Turquoise
              ];
              
              object.traverse((child: any) => {
                if (child.isMesh) {
                  const color = colors[meshIndex % colors.length];
                  child.material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.9,      // Very high metalness for realistic metal
                    roughness: 0.1,      // Very low roughness for high shine
                    emissive: color,
                    emissiveIntensity: 0.4  // Strong glow for mystical effect
                  });
                  meshIndex++;
                }
              });
              
              setModelObject(object);
              setIsLoading(false);
            },
            (progress) => {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              console.log('Loading OBJ:', percent + '%');
            },
            (error) => {
              console.error('Error loading OBJ:', error);
              setIsLoading(false);
            }
          );
        } else {
          console.error('modelSource must be an object with obj property');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading local model:', error);
        setIsLoading(false);
      }
    };
    
    loadLocalModel();
  }, [modelSource]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.015;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.12;
    }
  });

  if (isLoading) {
    return <LoadingCube />;
  }

  if (!modelObject) {
    return <FallbackModel position={position} scale={scale} />;
  }

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={modelObject} />
    </group>
  );
}

// Fallback model if OBJ fails to load
function FallbackModel({ position = [0, 0, -1], scale = 0.3 }: ARModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.015;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main Moonstone Crystal */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#e6f0ff"
          metalness={0.3}
          roughness={0.1}
          emissive="#a8c5ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner Glow Core */}
      <mesh position={[0, 0, 0]} scale={0.7}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#d4e5ff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Outer Ethereal Shell */}
      <mesh position={[0, 0, 0]} scale={1.15}>
        <octahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial
          color="#c9dfff"
          metalness={0.8}
          roughness={0.05}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crystal Base/Pedestal */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.15, 6]} />
        <meshStandardMaterial
          color="#b8d4ff"
          metalness={0.6}
          roughness={0.3}
          emissive="#8fb3ff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Floating Particles/Stars around moonstone */}
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 0.8;
        const heightOffset = Math.sin(i * 0.5) * 0.3;
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              heightOffset + Math.sin(i * 0.8) * 0.15,
              Math.sin(angle) * radius,
            ]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#d4e5ff"
              emissiveIntensity={2}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}

      {/* Energy Rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={`ring-${i}`}
          position={[0, -0.3 + i * 0.3, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.5 + i * 0.15, 0.02, 8, 32]} />
          <meshStandardMaterial
            color="#a8c5ff"
            emissive="#d4e5ff"
            emissiveIntensity={1.5 - i * 0.3}
            transparent
            opacity={0.5 - i * 0.15}
          />
        </mesh>
      ))}

      {/* Main Light Source */}
      <pointLight position={[0, 0, 0]} intensity={2.5} distance={4} color="#d4e5ff" />
      
      {/* Accent Lights */}
      <pointLight position={[0, 0.5, 0]} intensity={1.5} distance={2} color="#ffffff" />
      <pointLight position={[0, -0.5, 0]} intensity={1} distance={2} color="#a8c5ff" />
    </group>
  );
}

// Main export component with Suspense wrapper
export function ARModel(props: ARModelProps) {
  return (
    <Suspense fallback={<LoadingCube />}>
      <OBJModelLoader {...props} />
    </Suspense>
  );
}

// Loading Cube
export function LoadingCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="orange" wireframe />
    </mesh>
  );
}