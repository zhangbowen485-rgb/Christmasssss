import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GestureType } from '../types';

export const TopStar: React.FC<{ gesture: GestureType }> = ({ gesture }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Sharp Star Geometry
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.0;
    const innerRadius = 0.4; 

    // Generate star points
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        
        // Angle calculation to align one tip to X-axis (0 degrees)
        // Standard distribution is 360 / 10 = 36 degrees per step.
        // i=0 -> 0 deg (X+). i=1 -> 36 deg.
        const a = (i / (points * 2)) * Math.PI * 2; 
        
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i===0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();

    // Thicker extrusion for 3D look
    const geom = new THREE.ExtrudeGeometry(shape, {
        depth: 0.6, // Thicker
        bevelEnabled: true,
        bevelThickness: 0.1, 
        bevelSize: 0.05, 
        bevelSegments: 3 // Smoother bevel
    });
    geom.center(); 
    return geom;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Scale Logic: Reduced by 35% from previous baseline (1.3 * 0.65 ≈ 0.85)
    // Idle/Fist: 0.85, Open: 0.1
    const targetScale = gesture === 'OPEN' ? 0.1 : 0.85;
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 3);
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group 
        ref={groupRef} 
        position={[0, 8.5, 0]}
        // Rotate 90 degrees on Y-axis.
        // The shape has a tip at X+. Rotating Y+90 moves X+ to Z+.
        // One tip now overlaps the Z-axis (pointing at camera).
        rotation={[0, Math.PI / 2, 0]} 
    >
      <mesh geometry={starGeometry}>
        <meshStandardMaterial 
            color="#ffcc00" 
            emissive="#ffaa00"
            emissiveIntensity={3.0} 
            roughness={0.1}
            metalness={1.0} 
        />
      </mesh>
      <pointLight distance={25} intensity={5} color="#ffaa00" decay={2} />
    </group>
  );
};