import * as THREE from 'three';
import { TREE_COLORS } from '../types';

export type DecorationType = 'SPHERE' | 'TREE_BOX' | 'CANDY' | 'FLOOR_GIFT' | 'CAPSULE' | 'STAR' | 'RIBBON';

export const generateDecorations = (count: number, type: DecorationType) => {
  const data: { position: [number, number, number], rotation: [number, number, number], scale: number, color: string }[] = [];

  // High saturation Christmas palette for floor gifts
  const SATURATED_GIFT_COLORS = [
      '#D6001C', // Vivid Red
      '#008F39', // Vivid Green
      '#FFD700', // Bright Gold
      '#0047AB', // Cobalt Blue
      '#800080', // Deep Purple
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
  ];

  for (let i = 0; i < count; i++) {
    let x=0, y=0, z=0, scale=1, color=TREE_COLORS.RED;
    let rotX=0, rotY=0, rotZ=0;

    if (type === 'FLOOR_GIFT') {
        const r = 2.5 + Math.random() * 4.5; 
        const theta = Math.random() * Math.PI * 2;
        x = Math.cos(theta) * r;
        z = Math.sin(theta) * r;
        y = -6.5 + 0.35; // New Floor Level
        rotY = Math.random() * Math.PI;
        
        // Size variation for floor gifts
        scale = 0.5 + Math.random() * 0.7; // 0.5 to 1.2
        
        color = SATURATED_GIFT_COLORS[Math.floor(Math.random() * SATURATED_GIFT_COLORS.length)];
    } 
    else {
        // --- TREE DECORATIONS ---
        const hNorm = Math.random(); 
        
        const treeHeight = 13.5;
        const baseY = -6.5;
        
        const yBase = baseY + (hNorm * treeHeight);
        
        const maxRadiusBase = (1.0 - hNorm) * 6.5 + 0.1;
        
        const lobeFactor = 0.85 + 0.25 * Math.sin(hNorm * Math.PI * 9.0);
        const maxRadius = maxRadiusBase * lobeFactor * (0.8 + Math.random()*0.4);
        
        const distNorm = 0.5 + (Math.random() * 0.5); 
        const r = distNorm * maxRadius;
        
        const theta = Math.random() * Math.PI * 2;

        const liftSlope = 0.45;
        const droopFactor = (maxRadius * 0.3) * (1.1 - hNorm * 0.4);
        
        const liftY = r * liftSlope;
        const droopY = Math.pow(distNorm, 3.0) * droopFactor;
        
        y = yBase + liftY - droopY;

        if (y < -6.5 + 0.5) y = -6.5 + 0.5 + Math.random()*0.5;
        y -= 0.4; 
        
        x = Math.cos(theta) * r;
        z = Math.sin(theta) * r;
        
        rotY = Math.random() * Math.PI * 2;

        // Base Scale logic
        if (type === 'CANDY') {
            scale = 0.3; 
            color = '#ffffff'; 
            rotZ = Math.PI; 
            color = Math.random() > 0.5 ? '#ff2222' : '#ffffff';
        } 
        else if (type === 'TREE_BOX') { // Bear on tree
            scale = 0.25 + Math.random() * 0.15; 
            color = '#c4a484'; 
            rotX = 0; 
        }
        else if (type === 'STAR') {
            scale = 0.2 + Math.random() * 0.1;
            color = TREE_COLORS.GOLD;
            rotZ = Math.random() * 0.5;
        }
        else if (type === 'CAPSULE') { // Bulb
            scale = 0.2 + Math.random() * 0.1;
            color = TREE_COLORS.SILVER;
        }
        else { // Gift on Tree (SPHERE/Box)
            scale = 0.18 + Math.random() * 0.15; 
            const colors = [TREE_COLORS.RED, TREE_COLORS.GOLD, '#4488ff', '#ff88cc'];
            color = colors[Math.floor(Math.random() * colors.length)];
        }

        // --- DOUBLE SCALE ADJUSTMENT ---
        // "Tree ornaments volume increase double"
        scale *= 2.0;
    }

    data.push({
        position: [x, y, z],
        rotation: [rotX, rotY, rotZ],
        scale: scale,
        color: color
    });
  }

  return data;
};