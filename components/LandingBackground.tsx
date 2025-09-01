'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';

function FloatingSphere({ position, color, scale = 1, speed = 1 }: any) {
  const meshRef = useRef<any>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t) * 0.2;
      meshRef.current.rotation.y = Math.cos(t) * 0.2;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={1}
      floatIntensity={2}
    >
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={4}
          roughness={0.2}
        />
      </Sphere>
    </Float>
  );
}

export function LandingBackground() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 -z-10"
    >
      <Canvas
        camera={{ position: [0, 0, 20], fov: 45 }}
        style={{ background: 'linear-gradient(to bottom right, #f0f9ff, #e0e7ff)' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Add multiple floating spheres */}
        <FloatingSphere position={[-4, 2, -5]} color="#4F46E5" scale={1.5} speed={0.8} />
        <FloatingSphere position={[4, -2, -10]} color="#7C3AED" scale={2} speed={1.2} />
        <FloatingSphere position={[0, -4, -15]} color="#EC4899" scale={2.5} speed={1} />
        
        {/* Add stars in the background */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      </Canvas>
    </motion.div>
  );
} 