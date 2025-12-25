import React, { useEffect, useRef, useState } from 'react';
import { GestureType } from '../types';
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";

interface GestureControllerProps {
  onGestureChange: (gesture: GestureType) => void;
  onRotationChange: (rot: { x: number, y: number }) => void;
}

export const GestureController: React.FC<GestureControllerProps> = ({ onGestureChange, onRotationChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recognizer, setRecognizer] = useState<GestureRecognizer | null>(null);
  const [status, setStatus] = useState<string>('Initializing AI...');
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>(0);
  const [detectedGesture, setDetectedGesture] = useState<string>('None');

  // 1. Initialize MediaPipe with better error handling
  useEffect(() => {
    const init = async () => {
      try {
        console.log("Loading MediaPipe Vision...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        );
        
        // Note: The log "INFO: Created TensorFlow Lite XNNPACK delegate for CPU" comes from here.
        // It is a SUCCESS message indicating the WASM backend is running, not an error.
        const gestRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU" // Attempts to use GPU, falls back to CPU (XNNPACK) automatically if unavailable
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setRecognizer(gestRecognizer);
        setStatus('Camera Access Required');
        console.log("MediaPipe AI Model Ready.");
      } catch (e) {
        console.error("MediaPipe Init Error:", e);
        setStatus('AI Load Failed');
      }
    };
    init();
  }, []);

  // 2. Start Camera
  useEffect(() => {
    if (!recognizer) return;

    const startCamera = async () => {
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 320 }, 
              height: { ideal: 240 },
              facingMode: "user" 
            } 
          });
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
              setStatus('Active');
          });
        } catch (err) {
          console.error("Camera access denied:", err);
          setStatus('Camera Denied');
        }
      }
    };
    startCamera();
  }, [recognizer]);

  // 3. Loop
  const renderLoop = () => {
    if (recognizer && videoRef.current && videoRef.current.readyState >= 2) {
        if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = videoRef.current.currentTime;
            
            try {
                const results = recognizer.recognizeForVideo(videoRef.current, Date.now());
                
                let currentGesture: GestureType = 'OPEN'; // Default state
                let gestureName = 'None';

                if (results.landmarks.length > 0) {
                    const landmarks = results.landmarks[0];
                    const wrist = landmarks[0]; 
                    const thumbTip = landmarks[4];
                    const indexTip = landmarks[8];

                    // --- PINCH DETECTION (OK Gesture) ---
                    // Calculate distance between thumb tip and index tip in normalized coordinates
                    const dx = thumbTip.x - indexTip.x;
                    const dy = thumbTip.y - indexTip.y;
                    const distance = Math.sqrt(dx*dx + dy*dy);

                    // Threshold for "touching" (0.05 is roughly 5% of screen width/height)
                    if (distance < 0.08) {
                        currentGesture = 'PINCH';
                        gestureName = 'OK / PINCH';
                    } else if (results.gestures.length > 0) {
                        // Fallback to model categories if not pinching
                        const category = results.gestures[0][0].categoryName;
                        const score = results.gestures[0][0].score;
                        
                        if (score > 0.4) {
                            if (category === 'Closed_Fist') {
                                currentGesture = 'FIST';
                                gestureName = 'FIST';
                            } else if (category === 'Open_Palm') {
                                currentGesture = 'OPEN';
                                gestureName = 'OPEN';
                            } else {
                                // Default for other gestures
                                currentGesture = 'OPEN'; 
                                gestureName = category;
                            }
                        }
                    } else {
                         gestureName = 'Hand Detected';
                    }

                    // --- ROTATION MAPPING ---
                    // Map hand position to rotation
                    const sensitivity = 2.5;
                    const normX = (wrist.x - 0.5) * sensitivity; 
                    const normY = (wrist.y - 0.5) * sensitivity;
                    
                    onRotationChange({
                        y: -normX * Math.PI, 
                        x: normY * (Math.PI / 4)
                    });

                } else {
                    gestureName = 'None';
                }

                setDetectedGesture(gestureName);
                onGestureChange(currentGesture);

            } catch (e) {
                // Ignore transient errors
            }
        }
    }
    requestRef.current = requestAnimationFrame(renderLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderLoop);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [recognizer, status]);

  return (
    <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 50 }}>
      {/* Video Preview */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        style={{ 
            width: '160px', 
            height: '120px', 
            borderRadius: '12px',
            border: '2px solid rgba(255,255,255,0.2)',
            transform: 'scaleX(-1)', // Mirror
            objectFit: 'cover',
            display: 'block'
        }} 
      />
      
      {/* Status Overlay */}
      <div style={{
          position: 'absolute', 
          bottom: 5, 
          left: 5, 
          right: 5,
          padding: '4px',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '8px',
          color: status === 'Active' ? '#00ffaa' : '#ff4444',
          fontSize: '10px',
          textAlign: 'center',
          fontFamily: 'monospace',
          pointerEvents: 'none'
      }}>
          {status === 'Active' ? `DETECT: ${detectedGesture}` : status}
      </div>
    </div>
  );
};