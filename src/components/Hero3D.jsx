import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  Sparkles, 
  Environment, 
  MeshTransmissionMaterial,
  Center
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Camera controller for smooth ambient mouse movement
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      // Normalize mouse coordinates (-1 to 1)
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    // Smooth camera target interpolation based on mouse coords
    const targetX = mouse.current.x * 2.5;
    const targetY = mouse.current.y * 1.5;
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + 0.5, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// The Premium Glass 3D Torus Knot Object
function GlassObject() {
  const meshRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Rotate slowly in ambient background
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.004;
      meshRef.current.rotation.z += 0.002;
    }
  });

  return (
    <Float
      speed={2.2} 
      rotationIntensity={1.2} 
      floatIntensity={1.8}
    >
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.05 : 1}
      >
        {/* Intricate and organic Torus Knot geometry */}
        <torusKnotGeometry args={[1.1, 0.38, 250, 24, 3, 5]} />
        
        {/* Ultra-premium refractive glass material mimicking Drei transmission standard */}
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.2}
          thickness={1.2}
          roughness={0.08}
          transmission={1.0}
          ior={1.45}
          chromaticAberration={0.15}
          anisotropy={0.3}
          distortion={0.3}
          distortionScale={0.2}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#fffce1"
          color="#dfffd1"
        />
      </mesh>
    </Float>
  );
}

// Cinematic 3D Scene Entry Wrapper
export default function Hero3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Smooth fade-in entrance for the 3D Canvas element
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.8, ease: 'power3.out', delay: 0.3 }
    );
  }, []);

  return (
    <div 
      id="hero-canvas-container"
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
    >
      <Canvas
        id="three-canvas"
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {/* Ambient base lighting */}
          <ambientLight intensity={0.25} />
          
          {/* High dynamic range lights simulating physical studio lights */}
          <directionalLight position={[5, 8, 5]} intensity={1.8} color="#fffce1" castShadow />
          <directionalLight position={[-5, -5, -5]} intensity={0.8} color="#00bae2" />
          <pointLight position={[0, 4, 2]} intensity={2.2} color="#fec5fb" />
          <pointLight position={[3, -2, 1]} intensity={1.5} color="#0ae448" />

          {/* Cinematic Sparkle Particles */}
          <Sparkles 
            count={70} 
            scale={7} 
            size={2.2} 
            speed={0.3} 
            noise={1.0} 
            color="#fffce1" 
          />

          {/* Center alignment for premium object */}
          <Center>
            <GlassObject />
          </Center>

          {/* Dynamic Studio Reflection environment */}
          <Environment preset="studio" />

          {/* Rig to bind mouse tracking & camera sways */}
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
