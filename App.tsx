import React, { useState, useEffect, useCallback } from 'react';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { GestureController } from './components/GestureController';
import { MusicPlayer } from './components/MusicPlayer';
import { GestureType, PhotoData } from './types';

export default function App() {
  const [gesture, setGesture] = useState<GestureType>('OPEN'); 
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // --- MOUSE Interaction Handlers (Fallback) ---
  const handlePointerDown = () => { if (!selectedPhotoId) setGesture('FIST'); };
  const handlePointerUp = () => { if (!selectedPhotoId) setGesture('OPEN'); };
  
  // --- CAMERA Interaction Handlers ---
  const handleCameraGesture = (newGesture: GestureType) => {
      if (!selectedPhotoId) {
          setGesture(newGesture);
      }
  };

  const handleCameraRotation = (newRot: { x: number, y: number }) => {
      // Lerp for smoothness is handled in Scene, just set target here
      setRotation(newRot);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incomingFiles = Array.from(e.target.files);
      const remainingSlots = 12 - photos.length;
      if (remainingSlots <= 0) { alert("Maximum 12 decoration photos allowed."); return; }
      const filesToProcess = incomingFiles.slice(0, remainingSlots);
      const newPhotos: PhotoData[] = filesToProcess.map((file) => {
        const url = URL.createObjectURL(file as Blob);
        const angle = Math.random() * Math.PI * 2;
        const hNorm = Math.pow(Math.random(), 1.0); 
        const height = (hNorm * 18) - 7; 
        const hMap = (height + 9.5) / 21;
        const radiusBase = (1 - Math.pow(hMap, 0.9)) * 12.0;
        const radius = radiusBase * 0.95; 
        return {
          id: Math.random().toString(36).substr(2, 9),
          url,
          position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
          rotation: [0, 0, 0],
          scale: 1
        };
      });
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handlePhotoSelect = useCallback((id: string | null) => {
      setSelectedPhotoId(id);
      setGesture(id ? 'PINCH' : 'FIST'); 
  }, []);

  useEffect(() => { return () => photos.forEach(p => URL.revokeObjectURL(p.url)); }, [photos]);

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Scene 
        gesture={gesture} 
        rotation={rotation}
        photos={photos}
        selectedPhotoId={selectedPhotoId}
        onPhotoSelect={handlePhotoSelect}
      />
      
      <UI 
        gesture={gesture} 
        onUpload={handlePhotoUpload} 
      />
      
      <MusicPlayer />
      
      <GestureController 
        onGestureChange={handleCameraGesture}
        onRotationChange={handleCameraRotation}
      />

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30" />
    </div>
  );
}