import * as THREE from 'three';
import { TREE_COLORS } from '../types';

export const generateTreeParticles = (count: number) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const types = new Float32Array(count); // 0:Leaf, 1:Snow, 2:Light

  // Color Palette Definitions
  const cWood = new THREE.Color(TREE_COLORS.WOOD).multiplyScalar(0.6); // Darker trunk
  const cShadow = new THREE.Color(TREE_COLORS.PINE_DEEP).multiplyScalar(0.5); // Inner depth
  const cMid = new THREE.Color(TREE_COLORS.PINE_DEEP); // Main body
  const cTip = new THREE.Color(TREE_COLORS.PINE_FRESH).multiplyScalar(1.2); // Highlights
  
  // ADJUSTMENT: Snow brightness reduced by 3% (0.9 -> 0.873)
  const cSnow = new THREE.Color(TREE_COLORS.SNOW).multiplyScalar(0.873);
  
  // Lights Palette
  // ADJUSTMENT: Gold brightness reduced by 15% (1.0 -> 0.85)
  const cRed = new THREE.Color(TREE_COLORS.RED);
  const cGold = new THREE.Color(TREE_COLORS.GOLD).multiplyScalar(0.85);
  const cOrange = new THREE.Color('#ffaa00').multiplyScalar(0.9);
  const cBlue = new THREE.Color('#88ccff').multiplyScalar(0.9);

  // 1. TOP STAR Placeholder
  positions[0] = 0; positions[1] = 8.5; positions[2] = 0;
  colors[0] = 1; colors[1] = 0.8; colors[2] = 0;
  sizes[0] = 0.1;
  types[0] = 0;

  let pIndex = 1;

  // --- CONFIG ---
  const TREE_HEIGHT = 13.5; 
  const BASE_Y = -6.5;      
  const FLOOR_LIMIT = -6.5;
  const TRUNK_RATIO = 0.06; // More trunk particles for stability
  
  // 2. TRUNK (The Core)
  const trunkCount = Math.floor(count * TRUNK_RATIO);
  for (let i = 0; i < trunkCount; i++) {
    const h = Math.random() * TREE_HEIGHT;
    const y = BASE_Y + h;
    // Tapering trunk
    const r = (1 - Math.pow(h / TREE_HEIGHT, 1.2)) * 1.2 * (0.8 + Math.random()*0.4); 
    const theta = Math.random() * Math.PI * 2;

    positions[pIndex * 3] = Math.cos(theta) * r;
    positions[pIndex * 3 + 1] = y;
    positions[pIndex * 3 + 2] = Math.sin(theta) * r;
    
    // Trunk is always wood colored
    colors[pIndex * 3] = cWood.r;
    colors[pIndex * 3 + 1] = cWood.g;
    colors[pIndex * 3 + 2] = cWood.b;
    
    sizes[pIndex] = 0.5;
    types[pIndex] = 0;
    pIndex++;
  }

  // 3. FOLIAGE (The Layers)
  const foliageCount = count - trunkCount - 1;
  const TOTAL_BRANCHES = 140; 
  const particlesPerBranch = Math.floor(foliageCount / TOTAL_BRANCHES);
  const PHI = Math.PI * (3 - Math.sqrt(5)); 

  for (let b = 0; b < TOTAL_BRANCHES; b++) {
    const t = b / TOTAL_BRANCHES; // 0 (Bottom) -> 1 (Top)
    
    const yBase = BASE_Y + (t * TREE_HEIGHT);
    const yJitter = (Math.random() - 0.5) * 0.8;
    const branchRootY = yBase + yJitter;

    // Concave shape (Pointy top)
    let maxBranchLen = Math.pow(1.0 - t, 1.4) * 7.5 + 0.1;
    
    // Silhouette modulation
    const lobeFactor = 0.85 + 0.25 * Math.sin(t * Math.PI * 10.0); 
    maxBranchLen *= lobeFactor;
    
    const branchAngle = b * PHI; // Golden Angle distribution

    // Branch Physics
    const liftSlope = 0.5; 
    const droopFactor = (maxBranchLen * 0.35) * (1.1 - t * 0.3);

    // Light String Logic
    const hasLights = Math.random() < 0.35; // 35% of branches have lights
    
    // ADJUSTMENT: Weighted random for lights to double Red probability
    // Weights: Red(2), Gold(1), Orange(1), Blue(1)
    let lightColor = cGold;
    const randLight = Math.random();
    if (randLight < 0.4) lightColor = cRed; // 0.0 - 0.4 (40%)
    else if (randLight < 0.6) lightColor = cGold; // 0.4 - 0.6 (20%)
    else if (randLight < 0.8) lightColor = cOrange; // 0.6 - 0.8 (20%)
    else lightColor = cBlue; // 0.8 - 1.0 (20%)

    for (let p = 0; p < particlesPerBranch; p++) {
        if (pIndex >= count) break;

        // d is distance from trunk (0 to 1)
        // Bias distribution towards outer shell for volume
        const d = Math.pow(Math.random(), 0.5); 
        const r = d * maxBranchLen;

        const coreX = Math.cos(branchAngle) * r;
        const coreZ = Math.sin(branchAngle) * r;

        // Curve Physics
        const liftY = r * liftSlope;
        const droopY = Math.pow(d, 3.0) * droopFactor;
        
        let coreY = branchRootY + liftY - droopY;

        // Floor Protection
        if (coreY < FLOOR_LIMIT + 0.5) {
            coreY = Math.max(coreY, FLOOR_LIMIT + Math.random() * 0.5);
        }
        
        // Volume Cloud around the "Branch Line"
        // Tighter at top, wider at bottom
        const volumeRadius = (0.3 + (Math.sin(d * Math.PI) * 0.8)) * (1.0 - t * 0.5); 
        
        const vTheta = Math.random() * Math.PI * 2;
        const vR = Math.random() * volumeRadius; 
        
        const pX = coreX + Math.cos(vTheta) * vR;
        const pZ = coreZ + Math.sin(vTheta) * vR;
        
        // Calculate vertical offset relative to the branch core
        const relY = (Math.random() - 0.5) * volumeRadius;
        let pY = coreY + relY; 

        // --- LAYERED COLORING LOGIC ---
        let type = 0;
        let color = cMid;
        let size = (Math.random() * 0.08 + 0.04); 

        // 1. Depth Grading
        if (d < 0.3) {
            // Inner Core: Shadowy / Wood
            color = Math.random() > 0.5 ? cWood : cShadow;
            size *= 1.2; // Inner particles slightly chunkier to block light
        } else if (d > 0.85) {
            // Tips: Fresh growth
            color = cTip;
            size *= 0.8; // Fine detail at tips
        } else {
            // Mid Body: Mix
            color = Math.random() > 0.7 ? cTip : cMid;
        }

        // 2. Snow Logic (Directional)
        // Only settle snow on the UPPER surface of the branch volume
        // And more snow towards the top of the tree (t > 0.5)
        const isTopSurface = relY > (volumeRadius * 0.2); 
        if (isTopSurface && Math.random() > 0.4) {
            type = 1;
            color = cSnow;
            size *= 1.1;
            pY += 0.05; // Sit slightly on top
        }

        // 3. Light Logic (Clustered/Wrapped)
        // If this branch has lights, place them periodically along 'd'
        if (hasLights && type === 0) {
             // Create "nodes" of light along the branch
             const lightPhase = (d * 10.0) % 1.0; // periodic 
             if (lightPhase < 0.15 && Math.random() > 0.5) {
                 type = 2;
                 color = lightColor;
                 size = 0.12 + Math.random() * 0.05;
             }
        }

        // Final Assignment
        positions[pIndex * 3] = pX;
        positions[pIndex * 3 + 1] = pY;
        positions[pIndex * 3 + 2] = pZ;

        colors[pIndex * 3] = color.r;
        colors[pIndex * 3 + 1] = color.g;
        colors[pIndex * 3 + 2] = color.b;
        sizes[pIndex] = size;
        types[pIndex] = type;
        
        pIndex++;
    }
  }

  return { positions, colors, sizes, types };
};

export const generateRandomSphere = (count: number, radius: number) => {
  const positions = new Float32Array(count * 3);
  const SCATTER_RADIUS = 40.0; 

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = SCATTER_RADIUS * Math.cbrt(Math.random()); 
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);
  }
  return positions;
};