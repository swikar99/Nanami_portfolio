'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Box, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

function FloatingGeometry({ position, geometry, color, speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001 * speed;
      meshRef.current.rotation.y += 0.002 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        {geometry === 'sphere' && <Sphere args={[1, 32, 32]} />}
        {geometry === 'torus' && <Torus args={[1, 0.4, 16, 32]} />}
        {geometry === 'box' && <Box args={[1.5, 1.5, 1.5]} />}
        {geometry === 'octahedron' && <Octahedron args={[1.2]} />}
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

export function FloatingShapes() {
  return (
    <div className="fixed inset-0 -z-10 opacity-40">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />

        {/* Floating geometric shapes */}
        <FloatingGeometry position={[-4, 2, -2]} geometry="sphere" color="#ec4899" speed={0.8} />
        <FloatingGeometry position={[4, -1, -1]} geometry="torus" color="#8b5cf6" speed={1.2} />
        <FloatingGeometry position={[2, 3, -3]} geometry="box" color="#3b82f6" speed={0.6} />
        <FloatingGeometry position={[-3, -2, -2]} geometry="octahedron" color="#06b6d4" speed={1} />
        <FloatingGeometry position={[0, 0, -4]} geometry="sphere" color="#10b981" speed={0.9} />
        <FloatingGeometry position={[-2, 4, -1]} geometry="torus" color="#f59e0b" speed={0.7} />
      </Canvas>
    </div>
  );
}
