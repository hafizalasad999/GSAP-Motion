import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial, Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Zap, Target, Sliders, Layers } from 'lucide-react';
import PerformanceModal from './PerformanceModal.jsx';

gsap.registerPlugin(ScrollTrigger);

// 3D Visual Mesh for each Discipline Card
function InteractiveMesh({ type, hovered }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Constant rotation
    meshRef.current.rotation.x += 0.006;
    meshRef.current.rotation.y += 0.008;

    // React to hover states by scaling and accelerating rotation
    const speed = hovered ? 3 : 1;
    meshRef.current.rotation.z += 0.004 * speed;
  });

  // Render different premium geometries based on discipline type
  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1.5}>
      <mesh ref={meshRef} scale={hovered ? 1.25 : 1.0}>
        {type === 'scroll' && <icosahedronGeometry args={[1.2, 1]} />}
        {type === 'svg' && <octahedronGeometry args={[1.3, 0]} />}
        {type === 'text' && <coneGeometry args={[1.0, 1.8, 4]} />}
        {type === 'ui' && <boxGeometry args={[1.2, 1.2, 1.2]} />}

        <MeshWobbleMaterial
          factor={hovered ? 0.6 : 0.25}
          speed={3}
          color={
            type === 'scroll' ? '#fec5fb' :
            type === 'svg' ? '#ff8709' :
            type === 'text' ? '#9d95ff' : '#00bae2'
          }
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

// Compact Feature Glass Card component
function FeatureCard({ item, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  // Mouse move effect for interactive dynamic lighting glow within the glass card
  const handleMouseMove = (e) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(glowRef.current, {
      left: x,
      top: y,
      duration: 0.3,
      ease: 'power2.out',
      opacity: 0.65
    });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: 0,
        duration: 0.5
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.preventDefault();
        onClick(item.title);
      }}
      className="feature-glass-card group animate-child relative bg-off-black/40 border border-surface-25 rounded-xl p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:border-surface-cream/40 min-h-[520px] cursor-pointer select-none"
    >
      {/* Interactive dynamic glow spotlight */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute w-60 h-60 rounded-full mix-blend-screen filter blur-[80px] opacity-0 transition-opacity duration-500 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: `radial-gradient(circle, ${item.glowColor} 0%, transparent 70%)`
        }}
      />

      {/* Top Metadata Header Row */}
      <div className="flex justify-between items-center relative z-10">
        <span className={`text-body-small font-mono font-bold tracking-widest uppercase ${item.textColor}`}>
          // DISCIPLINE {item.tag}
        </span>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-just-black border border-surface-25/50 rounded-full text-caption-standard text-surface-50">
          <item.Icon className="w-3.5 h-3.5 text-surface-cream" />
          <span>{item.meta}</span>
        </div>
      </div>

      {/* Embedded 3D Illustration Scene */}
      <div className="h-56 relative w-full flex items-center justify-center my-6 z-10 rounded-lg bg-just-black/20 border border-surface-25/10 overflow-hidden">
        <Canvas camera={{ position: [0, 0, 4.2] }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color={item.glowColor} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} color="#fffce1" />
          <Sparkles count={15} scale={4} size={1.2} speed={0.4} color={item.glowColor} />
          <Suspense fallback={null}>
            <InteractiveMesh type={item.type} hovered={hovered} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content description */}
      <div className="relative z-10 flex flex-col gap-4">
        <h3 className="text-subheading font-mori-bold text-surface-cream group-hover:text-surface-cream transition-colors duration-300">
          {item.title}
        </h3>
        <p className="text-body-small text-surface-50 leading-relaxed font-mori-regular">
          {item.desc}
        </p>

        {/* Outlined Pill Action */}
        <div className="pt-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick(item.title);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-surface-25 group-hover:border-surface-cream text-caption-standard text-surface-50 group-hover:text-surface-cream transition-all duration-300 font-mori-bold uppercase tracking-wider cursor-pointer"
          >
            Explore mechanics <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    // Elegant GSAP scroll entrance reveal sequence
    const ctx = gsap.context(() => {
      // Target child elements to stagger animate (section container stays fully visible by default)
      const childElements = sectionRef.current.querySelectorAll('.animate-child');
      if (childElements.length === 0) return;
      
      // Animate child elements when entering the viewport
      gsap.fromTo(childElements, 
        {
          opacity: 0,
          y: 40
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.15,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true,
            onComplete: () => {
              gsap.set(childElements, { clearProps: 'all' });
            }
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const featuresData = [
    {
      type: 'scroll',
      tag: '01',
      title: 'ScrollTrigger Engine',
      desc: 'Seamlessly chain animations, trigger custom layouts, freeze timelines, and pin elements directly on scroll coordinates.',
      glowColor: '#fec5fb',
      textColor: 'text-pink',
      meta: 'FPS OPTIMIZED',
      Icon: Zap,
      link: '#scroll',
    },
    {
      type: 'svg',
      tag: '02',
      title: 'Vector Draw & Morph',
      desc: 'Surgically render SVG stroke maps and interpolate high-vertex complex morphing vectors smoothly on any browser platform.',
      glowColor: '#ff8709',
      textColor: 'text-orangey',
      meta: 'VERTEX ADAPTIVE',
      Icon: Target,
      link: '#svg',
    },
    {
      type: 'text',
      tag: '03',
      title: 'Kinetic Typography',
      desc: 'Splits characters, words, and full lines dynamically into clean staggered nodes ready for modular animation.',
      glowColor: '#9d95ff',
      textColor: 'text-lilac',
      meta: 'NODE MATRIX',
      Icon: Sliders,
      link: '#text',
    },
    {
      type: 'ui',
      tag: '04',
      title: 'Flip State Layouts',
      desc: 'Re-parent DOM items smoothly on coordinate transformations and layout nesting without computational stutter.',
      glowColor: '#00bae2',
      textColor: 'text-blue',
      meta: 'DOM MATRICES',
      Icon: Layers,
      link: '#ui',
    }
  ];

  const handleCardClick = (title) => {
    setSelectedFeature(title);
    setIsModalOpen(true);
  };

  return (
    <section
      ref={sectionRef}
      id="features-section"
      className="py-32 px-6 bg-just-black relative z-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Editorial Eyebrow & Headline Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-surface-25/50 pb-10">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="animate-child text-surface-cream font-mori-regular text-body-sm tracking-wide">
              {'{ Creative Toolsets }'}
            </span>
            <h2 className="animate-child text-heading-medium font-mori-bold text-surface-cream leading-tight">
              An Elevated Suite Designed For Modern Canvas Developers
            </h2>
          </div>
          <p className="animate-child text-body text-surface-50 max-w-sm font-mori-regular">
            Harness real-time matrix math, hardware-accelerated transforms, and high-frequency coordinate tracking.
          </p>
        </div>

        {/* 4-column Responsive Grid for Feature Cards */}
        <div
          ref={listRef}
          id="features-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuresData.map((item, index) => (
            <FeatureCard 
              key={item.title} 
              item={item} 
              index={index} 
              onClick={handleCardClick} 
            />
          ))}
        </div>

      </div>

      {/* Real-time Hardware Performance Analyzer Modal Overlay */}
      <PerformanceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        featureName={selectedFeature} 
      />
    </section>
  );
}
