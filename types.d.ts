declare module 'expo-three' {
  import { Object3D } from 'three';

  export interface GLTFResult {
    scene: Object3D;
    animations: any[];
    cameras: any[];
    asset: any;
  }

  export function loadAsync(
    uri: string,
    onProgress?: null | ((progress: number) => void),
    onAssetRequested?: ((assetUri: string) => any) | null
  ): Promise<GLTFResult>;
}