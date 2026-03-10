import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Sparkles, Torus, Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';

function SpeedLines({ count = 60 }) {
  const lines = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30 - 15
      ),
      speed: Math.random() * 0.8 + 0.4,
      length: Math.random() * 8 + 4,
      color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff',
    }));
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const l = lines[i];
        child.position.z += l.speed;
        if (child.position.z > 15) {
          child.position.z = -25;
          child.position.x = (Math.random() - 0.5) * 40;
          child.position.y = (Math.random() - 0.5) * 40;
        }
        // Slight wobble
        child.position.x += Math.sin(state.clock.elapsedTime * 2 + i) * 0.01;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {lines.map((l, i) => (
        <mesh key={i} position={l.position.toArray()} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.02, l.length, 4]} />
          <meshBasicMaterial color={l.color} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function EnergyRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.z += 0.002;
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x = Math.sin(time * 0.5 + i) * 0.2;
        child.rotation.y = Math.cos(time * 0.3 + i) * 0.2;
        child.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.05);
      });
    }
  });

  return (
    <group ref={groupRef}>
      <Torus args={[4, 0.01, 16, 100]} position={[0, 0, -5]}>
        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
      </Torus>
      <Torus args={[5, 0.005, 16, 100]} position={[0, 0, -6]}>
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.1} />
      </Torus>
      <Torus args={[3.5, 0.02, 16, 100]} position={[0, 0, -4]}>
        <meshBasicMaterial color="#ffff00" transparent opacity={0.3} />
      </Torus>
    </group>
  );
}

function AnimeCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.8;
      meshRef.current.rotation.z = time * 0.4;
      
      // Glitch effect
      if (Math.random() > 0.97) {
        meshRef.current.position.x = (Math.random() - 0.5) * 0.2;
        meshRef.current.position.y = (Math.random() - 0.5) * 0.2;
      } else {
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, 0.1);
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 0.1);
      }
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = -time * 1.2;
      wireRef.current.rotation.x = time * 0.6;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={2}>
      <group>
        <mesh ref={meshRef}>
          <octahedronGeometry args={[1.8, 0]} />
          <meshToonMaterial color="#7000ff" />
        </mesh>
        <mesh ref={wireRef}>
          <octahedronGeometry args={[2, 0]} />
          <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.5} />
        </mesh>
        <Sparkles count={50} scale={3} size={4} speed={0.4} color="#00ffff" />
      </group>
    </Float>
  );
}

function FloatingCrystals() {
  const crystals = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 5,
      ] as [number, number, number],
      scale: Math.random() * 0.3 + 0.1,
      color: i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ffff00',
      speed: Math.random() * 1.5 + 0.5,
    }));
  }, []);

  return (
    <group>
      {crystals.map((c, i) => (
        <Float key={i} speed={c.speed} rotationIntensity={3} floatIntensity={1.5}>
          <mesh position={c.position} scale={c.scale}>
            <tetrahedronGeometry args={[1, 0]} />
            <meshToonMaterial color={c.color} />
            <mesh scale={1.1}>
              <tetrahedronGeometry args={[1, 0]} />
              <meshBasicMaterial color="white" wireframe transparent opacity={0.1} />
            </mesh>
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-[#020202]">
      <div className="scanline" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={55} />
        <ambientLight intensity={0.6} />
        <pointLight position={[15, 15, 15]} intensity={1.5} color="#00ffff" />
        <pointLight position={[-15, -15, 15]} intensity={1.5} color="#ff00ff" />
        <spotLight position={[0, 20, 0]} intensity={1} color="#ffffff" />
        
        <Sparkles count={300} scale={20} size={1.5} speed={0.2} color="#ffffff" />
        
        <SpeedLines />
        <EnergyRings />
        <AnimeCore />
        <FloatingCrystals />
        
        <fog attach="fog" args={['#020202', 8, 25]} />
      </Canvas>
    </div>
  );
}
