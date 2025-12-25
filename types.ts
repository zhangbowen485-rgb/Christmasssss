export type GestureType = 'OPEN' | 'FIST' | 'PINCH' | 'IDLE';

export interface PhotoData {
  id: string;
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

export interface TreeState {
  gesture: GestureType;
  rotationY: number;
  handPosition: { x: number; y: number };
  photos: PhotoData[];
  selectedPhotoId: string | null;
}

// Extracted from the reference image
export const TREE_COLORS = {
  PINE_DEEP: '#051f18',   // Almost black-green (Shadows)
  PINE_FRESH: '#1a473e',  // Muted Emerald (Mid-tones)
  SNOW: '#ffffff',        // Pure bright white (High contrast)
  GOLD: '#eebb44',        // Warm Star Gold
  RED: '#8a1c1c',         // Deep Velvet Red (Bows/Balls)
  SILVER: '#a0b8c4',      // Icy Blueish Silver (Ornaments)
  WOOD: '#291b12',        // Dark Trunk
  BOX_RED: '#661111',     
  BOX_GREEN: '#0f3322',   
  BOX_GOLD: '#b8860b',    
};
