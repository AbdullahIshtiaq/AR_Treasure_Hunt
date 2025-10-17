/* eslint-disable @typescript-eslint/no-require-imports */
export interface Treasure {
  id: string;
  latitude: number;
  longitude: number;
  found: boolean;
  modelPath?: any; // Optional custom model
}

export const treasures: Treasure[] = [
  { 
    id: 'Golden Chest', 
    latitude: 37.7749, 
    longitude: -122.4194, 
    found: false,
    modelPath: require('../assets/models/treasure.glb')
  },
  { 
    id: 'Magic Stone', 
    latitude: 37.7750, 
    longitude: -122.4195, 
    found: false,
    modelPath: require('../assets/models/stone.glb')
  },
];