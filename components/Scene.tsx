import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import { OrbitControls, Stars, ContactShadows, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { TreeParticles } from './TreeParticles';
import { PhotoGallery } from './PhotoGallery';
import { Decorations } from './Decorations';
import { TopStar } from './TopStar';
import { GestureType, PhotoData } from '../types';

interface SceneProps {
  gesture: GestureType;
  rotation: { x: number; y: number };
  photos: PhotoData[];
  selectedPhotoId: string | null;
  onPhotoSelect: (id: string | null) => void;
}

const TreeGroup: React.FC<{ 
    rotation: { x: number; y: number }; 
    children: React.ReactNode 
}> = ({ rotation, children }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Smoothly interpolate rotation
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation.y, 0.1);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation.x * 0.2, 0.1);
        }
    });

    return <group ref={groupRef}>{children}</group>;
};

export const Scene: React.FC<SceneProps> = ({ 
  gesture, 
  rotation, 
  photos, 
  selectedPhotoId,
  onPhotoSelect
}) => {
  return (
    <Canvas
      // Camera Z=30 for close-up, Y=2 to align tree bottom with screen bottom
      camera={{ position: [0, 2, 30], fov: 35 }} 
      dpr={[1, 2]}
      shadows
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} 
    >
      <color attach="background" args={['#010204']} />
      
      <Environment preset="night" blur={0.8} background={false} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      {/* --- BACKGROUND PARTICLES --- */}
      <Sparkles count={500} scale={40} size={4} speed={0.4} opacity={0.6} color="#ffd700" />
      <Sparkles count={200} scale={30} size={2} speed={0.2} opacity={0.3} color="#ffffff" />
      <Sparkles count={350} scale={45} size={5} speed={0.5} opacity={0.7} color="#ff0000" />
      
      <ambientLight intensity={0.25} color="#cceeff" />
      <pointLight position={[10, 10, 15]} intensity={1.7} color="#ffd700" castShadow shadow-bias={-0.0001} />
      <pointLight position={[-15, 5, -10]} intensity={1.4} color="#00ced1" />
      <spotLight position={[0, 30, 10]} intensity={3.5} angle={0.5} penumbra={1} castShadow color="#fffaf0" />

      <TreeGroup rotation={rotation}>
        <TreeParticles gesture={gesture} />
        <Decorations gesture={gesture} />
        <TopStar gesture={gesture} />
        <PhotoGallery 
            photos={photos} 
            gesture={gesture} 
            selectedId={selectedPhotoId} 
            onSelect={onPhotoSelect}
        />
      </TreeGroup>

      <ContactShadows opacity={0.6} scale={50} blur={2.5} far={10} resolution={512} color="#000000" />

      <EffectComposer>
        <DepthOfField target={[0, 4, 0]} focalLength={0.02} bokehScale={0.7} height={480} />
        <Bloom luminanceThreshold={0.85} mipmapBlur intensity={1.8} radius={0.6} />
        <Vignette eskil={false} offset={0.1} darkness={0.85} />
      </EffectComposer>

      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        enableRotate={false} 
        maxDistance={60} 
        minDistance={5}  
        // Target adjusted to look at the visual center of the tree
        target={[0, 2, 0]}
      />
    </Canvas>
  );
};