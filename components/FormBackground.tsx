'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';

function AnimatedSphere(props: any) {
  const sphereRef = useRef<any>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.x = elapsed * 0.2;
      sphereRef.current.rotation.y = elapsed * 0.1;
      sphereRef.current.position.y = Math.sin(elapsed * 0.5) * 0.2;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color="#4F46E5"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
      />
    </Sphere>
  );
}

export function FormBackground() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 -z-10"
    >
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedSphere />
      </Canvas>
    </motion.div>
  );
} 