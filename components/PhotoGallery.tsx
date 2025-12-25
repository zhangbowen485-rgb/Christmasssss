import React, { useRef } from 'react';
import { Image, Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PhotoData, GestureType } from '../types';

interface PhotoGalleryProps {
  photos: PhotoData[];
  gesture: GestureType;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, gesture, selectedId, onSelect }) => {
  return (
    <group>
      {photos.map((photo) => (
        <PhotoItem 
          key={photo.id} 
          photo={photo} 
          isSelected={selectedId === photo.id}
          isPinching={gesture === 'PINCH'}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
};

const PhotoItem: React.FC<{
  photo: PhotoData;
  isSelected: boolean;
  isPinching: boolean;
  onSelect: (id: string | null) => void;
}> = ({ photo, isSelected, isPinching, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  const homePosition = new THREE.Vector3(...photo.position);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isSelected) {
      const normal = homePosition.clone().normalize();
      const targetPos = normal.multiplyScalar(15); 
      
      meshRef.current.position.lerp(targetPos, delta * 4);
      meshRef.current.scale.lerp(new THREE.Vector3(4, 4, 4), delta * 4);
      // Face camera when selected
      meshRef.current.lookAt(state.camera.position);
    } else {
      meshRef.current.position.lerp(homePosition, delta * 5);
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2);
      // Billboard handles rotation when not selected (always faces cam)
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(isSelected ? null : photo.id);
  };

  return (
    <Billboard
      ref={meshRef}
      position={photo.position}
      follow={!isSelected} // Disable billboard follow when selected to use manual lookAt
    >
      <group onClick={handleClick}>
        {/* Frame Outer (Gold) */}
        <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[1.7, 1.7, 0.05]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Frame Inner/Backing (Dark Wood) */}
        <mesh position={[0, 0, -0.01]}>
            <boxGeometry args={[1.5, 1.5, 0.06]} />
            <meshStandardMaterial color="#3d2817" roughness={0.8} />
        </mesh>

        {/* Hanger String */}
        <mesh position={[0, 0.9, 0]}>
             <torusGeometry args={[0.15, 0.02, 8, 16]} />
             <meshStandardMaterial color="#d4af37" />
        </mesh>
        
        <Image 
          url={photo.url} 
          transparent 
          opacity={isSelected ? 1 : 0.95}
          scale={[1.4, 1.4]} 
          position={[0, 0, 0.06]}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
        />
      </group>
    </Billboard>
  );
};