import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars, MeshDistortMaterial, PerspectiveCamera, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function Meteors({ count = 20 }) {
  const meteors = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 40,
        Math.random() * 20 + 10,
        (Math.random() - 0.5) * 40
      ),
      speed: Math.random() * 0.2 + 0.1,
      length: Math.random() * 2 + 1,
    }));
  }, [count]);

  const linesRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (linesRef.current) {
      linesRef.current.children.forEach((child, i) => {
        const m = meteors[i];
        child.position.y -= m.speed;
        child.position.x -= m.speed * 0.5;
        if (child.position.y < -20) {
          child.position.y = 20;
          child.position.x = (Math.random() - 0.5) * 40;
        }
      });
    }
  });

  return (
    <group ref={linesRef}>
      {meteors.map((m, i) => (
        <mesh key={i} position={m.position.toArray()}>
          <capsuleGeometry args={[0.02, m.length, 4, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Supernova() {
  const particlesRef = useRef<THREE.Points>(null);
  const [active, setActive] = useState(false);
  const timer = useMemo(() => new (THREE as any).Timer(), []);

  useFrame(() => {
    timer.update();
    if (particlesRef.current) {
      const time = timer.getElapsed();
      // Occasional explosion effect
      if (Math.sin(time * 0.2) > 0.98 && !active) {
        setActive(true);
      } else if (Math.sin(time * 0.2) < 0) {
        setActive(false);
      }

      if (active) {
        particlesRef.current.scale.addScalar(0.05);
        (particlesRef.current.material as THREE.PointsMaterial).opacity *= 0.95;
      } else {
        particlesRef.current.scale.set(1, 1, 1);
        (particlesRef.current.material as THREE.PointsMaterial).opacity = 0.8;
      }
    }
  });

  return (
    <group position={[5, 5, -10]}>
      <Sparkles count={100} scale={2} size={2} speed={0.5} color="#f59e0b" />
      <points ref={particlesRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <pointsMaterial color="#ef4444" size={0.05} transparent opacity={0.8} />
      </points>
    </group>
  );
}

function CentralCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const timer = useMemo(() => new (THREE as any).Timer(), []);

  useFrame(() => {
    timer.update();
    if (meshRef.current) {
      const time = timer.getElapsed();
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
      const scale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1, 15]} />
        <MeshDistortMaterial
          color={hovered ? "#6366f1" : "#4338ca"}
          speed={2}
          distort={0.4}
          radius={1}
        />
      </mesh>
    </Float>
  );
}

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.1, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.1, 0.05);
    }
  });

  const shapes = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
      ] as [number, number, number],
      scale: Math.random() * 0.3 + 0.05,
      color: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#10b981' : '#f59e0b',
      speed: Math.random() * 2 + 1,
    }));
  }, []);

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <Float key={i} speed={shape.speed} rotationIntensity={2} floatIntensity={2}>
          <mesh position={shape.position} scale={shape.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={shape.color} wireframe transparent opacity={0.2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={75} />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#4338ca" intensity={0.5} />
        
        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
        
        <Meteors />
        <Supernova />
        <CentralCore />
        <FloatingShapes />
        
        <fog attach="fog" args={['#09090b', 5, 15]} />
      </Canvas>
    </div>
  );
}
