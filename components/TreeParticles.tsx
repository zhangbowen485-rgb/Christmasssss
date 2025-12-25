import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateTreeParticles, generateRandomSphere } from '../utils/treeMath';
import { GestureType } from '../types';

interface TreeParticlesProps {
  gesture: GestureType;
}

const PARTICLE_COUNT = 75000;

export const TreeParticles: React.FC<TreeParticlesProps> = ({ gesture }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  // Ref to hold shader uniforms
  const uniformsRef = useRef({
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uTime: { value: 0 }
  });

  const { positions: treePositions, colors, sizes, types } = useMemo(() => generateTreeParticles(PARTICLE_COUNT), []);
  const spherePositions = useMemo(() => generateRandomSphere(PARTICLE_COUNT, 45), []);
  const currentPositions = useMemo(() => new Float32Array(treePositions), [treePositions]);
  
  // Random offset for sparkle independence
  const randoms = useMemo(() => {
      const arr = new Float32Array(PARTICLE_COUNT);
      for(let i=0; i<PARTICLE_COUNT; i++) arr[i] = Math.random();
      return arr;
  }, []);

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
      geometryRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometryRef.current.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometryRef.current.setAttribute('pType', new THREE.BufferAttribute(types, 1));
      geometryRef.current.setAttribute('random', new THREE.BufferAttribute(randoms, 1));
    }
  }, [colors, sizes, types, currentPositions, randoms]);

  useFrame((state, delta) => {
    // Safety check: ensure geometry and attributes exist before accessing them
    if (
        !pointsRef.current || 
        !geometryRef.current || 
        !geometryRef.current.attributes.position || 
        !geometryRef.current.attributes.position.array
    ) return;

    // Update Uniforms
    uniformsRef.current.uTime.value = state.clock.elapsedTime;

    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const isScatter = gesture === 'OPEN';
    const targetArray = isScatter ? spherePositions : treePositions;
    const speed = isScatter ? 2.5 : 3.0; 

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const cx = positions[i3];
      const cy = positions[i3 + 1];
      const cz = positions[i3 + 2];
      const tx = targetArray[i3];
      const ty = targetArray[i3 + 1];
      const tz = targetArray[i3 + 2];

      const time = state.clock.elapsedTime;
      const windForce = 0.01 + (Math.abs(ty + 10) * 0.001); 
      const windX = Math.sin(time * 1.0 + ty * 0.3) * windForce;
      const windZ = Math.cos(time * 0.8 + ty * 0.3) * windForce;
      const lerpFactor = speed * delta;
      
      positions[i3] = THREE.MathUtils.lerp(cx, tx + windX, lerpFactor);
      positions[i3 + 1] = THREE.MathUtils.lerp(cy, ty, lerpFactor);
      positions[i3 + 2] = THREE.MathUtils.lerp(cz, tz + windZ, lerpFactor);
    }
    geometryRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending} 
        vertexColors
        uniforms={uniformsRef.current}
        vertexShader={`
          uniform float uPixelRatio;
          uniform float uTime;
          attribute float size;
          attribute float pType;
          attribute float random;
          varying vec3 vColor;
          varying float vType;
          varying float vRandom;
          
          void main() {
            vColor = color;
            vType = pType;
            vRandom = random;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            
            // Sparkle size modulation
            float sparkleScale = 1.0;
            if (pType > 1.5) {
               // Lights pulse
               sparkleScale = 1.0 + 0.5 * sin(uTime * 5.0 + random * 10.0);
            }
            
            gl_PointSize = (size * sparkleScale) * uPixelRatio * (900.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec3 vColor;
          varying float vType;
          varying float vRandom;

          void main() {
            vec2 uv = gl_PointCoord.xy - 0.5;
            float r = length(uv);
            if (r > 0.5) discard;

            float alpha = 1.0;
            alpha = 1.0 - smoothstep(0.35, 0.5, r);
            
            vec3 finalColor = vColor;

            // SPARKLE LOGIC
            float sparkle = 0.0;
            
            if (vType > 1.5) {
                // LIGHTS: Intense flickering
                float flash = sin(uTime * 4.0 + vRandom * 6.28);
                finalColor *= (2.0 + flash); // Glow intensity
                // Diamond star shape core
                float star = 1.0 - smoothstep(0.1, 0.4, abs(uv.x * uv.y) * 10.0);
                alpha += star * 0.5;
            } 
            else if (vType > 0.5) {
                // SNOW: Glistening
                float glisten = smoothstep(0.8, 1.0, sin(uTime * 2.0 + vRandom * 20.0));
                finalColor += vec3(glisten * 0.5); 
                finalColor *= 1.8;
            } 
            else {
                // PINE: Subtle sheen
                alpha *= 0.85;
            }

            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
      />
    </points>
  );
};