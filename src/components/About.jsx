import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Animated 2D canvas of floating interactive background particles
function ParticlesCanvas({ isAnimating, mousePos }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    const particleCount = 20;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 1,
        alpha: Math.random() * 0.4 + 0.1,
        color: i % 2 === 0 ? '171, 255, 132' : '0, 186, 226', // light green or blue
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Determine movement speed based on active animation state
      const speedFactor = isAnimating ? 2.5 : 0.4;

      particles.forEach((p) => {
        let targetVx = p.vx * speedFactor;
        let targetVy = p.vy * speedFactor;

        if (isAnimating) {
          // Attract/Parallax particles slightly based on normalized mousePos
          const mousePxX = ((mousePos.current.x + 1) / 2) * canvas.width;
          const mousePxY = ((-mousePos.current.y + 1) / 2) * canvas.height;
          const dx = mousePxX - p.x;
          const dy = mousePxY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 0.01) {
            targetVx += (dx / dist) * 0.12;
            targetVy += (dy / dist) * 0.12;
          }
        }

        p.x += targetVx;
        p.y += targetVy;

        // Wrapping boundaries
        if (p.x < 0 || isNaN(p.x) || !isFinite(p.x)) p.x = canvas.width || 300;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0 || isNaN(p.y) || !isFinite(p.y)) p.y = canvas.height || 300;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        const px = isFinite(p.x) ? p.x : 0;
        const py = isFinite(p.y) ? p.y : 0;
        const pr = isFinite(p.radius) ? p.radius : 2;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, pr * 4);
        grad.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.arc(px, py, pr * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ambient breathing glow aura
      const time = performance.now() * 0.001;
      const breathe = Math.sin(time) * 0.04 + 0.96;
      if (isAnimating) {
        const gX = ((mousePos.current.x + 1) / 2) * canvas.width;
        const gY = ((-mousePos.current.y + 1) / 2) * canvas.height;
        
        const safeGX = isFinite(gX) ? gX : 0;
        const safeGY = isFinite(gY) ? gY : 0;
        const safeBreathe = isFinite(breathe) ? breathe : 1;
        const glowRadius = Math.max(1, 150 * safeBreathe);

        ctx.beginPath();
        const glowGrad = ctx.createRadialGradient(safeGX, safeGY, 10, safeGX, safeGY, glowRadius);
        glowGrad.addColorStop(0, 'rgba(171, 255, 132, 0.06)');
        glowGrad.addColorStop(0.5, 'rgba(0, 186, 226, 0.02)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.arc(safeGX, safeGY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [isAnimating]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-80" />;
}

// Custom 3D crystal decoration reacting to scroll, hover, and touch parallax
function About3DDecoration({ isAnimating, mousePos }) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const animProgress = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smoothly interpolate animation progress between idle (0.08) and active (1.0)
    animProgress.current = gsap.utils.interpolate(animProgress.current, isAnimating ? 1 : 0.08, 0.06);

    // Apply rotation based on current smooth progress
    meshRef.current.rotation.x += 0.003 * animProgress.current;
    meshRef.current.rotation.y += 0.005 * animProgress.current;

    // Add continuous slow breathing vibration independent of interaction
    const time = state.clock.getElapsedTime();
    const breathe = Math.sin(time * 1.5) * 0.03;
    
    // Parallax mouse/touch target positions
    const targetX = mousePos.current.x * 0.6;
    const targetY = mousePos.current.y * 0.6;
    meshRef.current.position.x = gsap.utils.interpolate(meshRef.current.position.x, targetX, 0.05);
    meshRef.current.position.y = gsap.utils.interpolate(meshRef.current.position.y, targetY + breathe, 0.05);

    // Animate material properties
    if (materialRef.current) {
      materialRef.current.factor = gsap.utils.interpolate(0.08, 0.55, animProgress.current);
      materialRef.current.speed = gsap.utils.interpolate(0.4, 2.5, animProgress.current);
    }
  });

  return (
    <Float 
      speed={isAnimating ? 3 : 0.4} 
      rotationIntensity={isAnimating ? 1.5 : 0.15} 
      floatIntensity={isAnimating ? 1.5 : 0.15}
    >
      <mesh ref={meshRef}>
        {/* Intricate octahedron shape representing structured motion */}
        <octahedronGeometry args={[1.5, 2]} />
        <MeshWobbleMaterial
          ref={materialRef}
          color="#abff84"
          roughness={0.15}
          metalness={0.9}
          factor={0.08}
          speed={0.4}
        />
      </mesh>
    </Float>
  );
}

// Interactive dynamic lighting that reacts to hover & mouse position
function InteractiveLights({ isAnimating, mousePos }) {
  const lightRef1 = useRef(null);
  const lightRef2 = useRef(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const breathe = Math.sin(time * 1.8) * 0.2 + 1.0;

    if (lightRef1.current) {
      // Rotate point lights around standard coordinate trajectory combined with mouse input
      lightRef1.current.position.x = 5 * Math.cos(time * 0.4) + mousePos.current.x * 1.5;
      lightRef1.current.position.y = 5 * Math.sin(time * 0.4) + mousePos.current.y * 1.5;
      lightRef1.current.intensity = (isAnimating ? 2.8 : 0.9) * breathe;
    }

    if (lightRef2.current) {
      lightRef2.current.position.x = -5 * Math.cos(time * 0.4) - mousePos.current.x * 1.5;
      lightRef2.current.position.y = -5 * Math.sin(time * 0.4) - mousePos.current.y * 1.5;
      lightRef2.current.intensity = (isAnimating ? 1.2 : 0.4) * breathe;
    }
  });

  return (
    <>
      <pointLight ref={lightRef1} position={[5, 5, 5]} intensity={1.5} color="#abff84" />
      <pointLight ref={lightRef2} position={[-5, -5, -5]} intensity={0.6} color="#00bae2" />
    </>
  );
}

// Premium FPS and Telemetry HUD sub-component to eliminate high-frequency parent re-renders
function FpsTelemetry({ isAnimating }) {
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const [isRafSupported, setIsRafSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.requestAnimationFrame) {
      setIsRafSupported(false);
      return;
    }

    let rId;
    let lastTime = performance.now();
    const frameTimes = [];

    const tick = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      // Calculate FPS safely
      const currentFps = delta > 0 ? 1000 / delta : 60;
      const roundedFps = Math.round(currentFps);
      
      setFps(prev => prev !== roundedFps ? roundedFps : prev);

      // Calculate rolling average FPS over 100 frames
      frameTimes.push(currentFps);
      if (frameTimes.length > 100) {
        frameTimes.shift();
      }
      const sum = frameTimes.reduce((a, b) => a + b, 0);
      const avg = sum / frameTimes.length;
      const roundedAvg = Math.round(avg);
      setAvgFps(prev => prev !== roundedAvg ? roundedAvg : prev);

      rId = window.requestAnimationFrame(tick);
    };

    rId = window.requestAnimationFrame(tick);
    return () => {
      if (rId) window.cancelAnimationFrame(rId);
    };
  }, []);

  const getBadgeSpecs = (currentFps) => {
    if (currentFps >= 120) {
      return { label: 'Excellent', color: 'text-[#abff84]', bg: 'bg-[#abff84]/15', border: 'border-[#abff84]/30', stroke: '#abff84' };
    }
    if (currentFps >= 90) {
      return { label: 'Very Good', color: 'text-[#0ae448]', bg: 'bg-[#0ae448]/15', border: 'border-[#0ae448]/30', stroke: '#0ae448' };
    }
    if (currentFps >= 60) {
      return { label: 'Good', color: 'text-[#00bae2]', bg: 'bg-[#00bae2]/15', border: 'border-[#00bae2]/30', stroke: '#00bae2' };
    }
    if (currentFps >= 30) {
      return { label: 'Average', color: 'text-[#ff8709]', bg: 'bg-[#ff8709]/15', border: 'border-[#ff8709]/30', stroke: '#ff8709' };
    }
    return { label: 'Low', color: 'text-[#f100cb]', bg: 'bg-[#f100cb]/15', border: 'border-[#f100cb]/30', stroke: '#f100cb' };
  };

  const badge = getBadgeSpecs(isRafSupported ? fps : 60);

  return (
    <>
      {/* Premium FPS Badge in Top-Right Corner */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-just-black/70 border border-surface-25/30 backdrop-blur-md text-[10px] font-mono text-surface-cream shadow-md transition-gsap select-none">
        <span 
          className="w-2 h-2 rounded-full animate-pulse transition-all duration-300" 
          style={{ 
            backgroundColor: badge.stroke, 
            boxShadow: `0 0 10px ${badge.stroke}` 
          }} 
        />
        <span>{isRafSupported ? `${fps} FPS` : 'FPS Not Available'}</span>
        <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider ${badge.bg} ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Premium Glassmorphic Telemetry Hud Panel (Bottom-Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-3.5 p-3 rounded-xl bg-just-black/75 border border-surface-25/30 backdrop-blur-md transition-all duration-500 shadow-xl select-none max-w-[200px]">
        {/* Animated Circular FPS Indicator Gauge */}
        <div className="relative w-11 h-11 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle 
              cx="22" cy="22" r="18" 
              className="stroke-surface-25/20" 
              strokeWidth="2.5" 
              fill="none" 
            />
            <circle 
              cx="22" cy="22" r="18" 
              stroke={badge.stroke} 
              strokeWidth="2.5" 
              fill="none" 
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={(2 * Math.PI * 18) - (Math.min(120, fps) / 120) * (2 * Math.PI * 18)}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-surface-cream font-bold">
            {isRafSupported ? fps : '—'}
          </div>
        </div>

        {/* Live Stats */}
        <div className="flex flex-col gap-0.5 font-mono text-[9px] min-w-[70px]">
          <div className="text-surface-50 uppercase tracking-widest flex items-center gap-1.5">
            <span>SYSTEM</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isAnimating ? 'bg-[#abff84] shadow-[0_0_6px_#abff84]' : 'bg-surface-25'}`} />
          </div>
          <div className="text-body-small text-surface-cream font-bold leading-none py-0.5">
            {isAnimating ? 'RUNNING' : 'PAUSED'}
          </div>
          <div className="text-surface-50 leading-none">
            AVG: <span className="text-surface-cream font-bold">{avgFps} FPS</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function About() {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);
  const para1Ref = useRef(null);
  const para2Ref = useRef(null);
  const para3Ref = useRef(null);
  const bgBlob1Ref = useRef(null);
  const bgBlob2Ref = useRef(null);
  const block3DRef = useRef(null);

  // Interaction State
  const [isAnimating, setIsAnimating] = useState(false);

  // Parallax Coordinates & Ref
  const mousePos = useRef({ x: 0, y: 0 });
  const cardRect = useRef(null);

  // Mouse Handlers
  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setIsAnimating(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setIsAnimating(false);
      mousePos.current = { x: 0, y: 0 };
    }
  };

  const handleMouseMove = (e) => {
    if (!block3DRef.current) return;
    if (!cardRect.current) {
      cardRect.current = block3DRef.current.getBoundingClientRect();
    }
    const rect = cardRect.current;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    
    // Smooth coordinate dampening
    mousePos.current.x = x;
    mousePos.current.y = y;
  };

  const handleTouchStart = () => {
    // Reset bounding rect cache for accuracy
    if (block3DRef.current) {
      cardRect.current = block3DRef.current.getBoundingClientRect();
    }
  };

  const handleTouchMove = (e) => {
    if (!block3DRef.current || e.touches.length === 0) return;
    const rect = cardRect.current || block3DRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
    
    mousePos.current.x = x;
    mousePos.current.y = y;
  };

  const handleCardClick = () => {
    // Mobile & Tablet: Toggle animation state on click
    if (!window.matchMedia('(hover: hover)').matches) {
      setIsAnimating(prev => !prev);
    }
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      // Target child elements with .animate-child (section container stays fully visible by default)
      const childElements = sectionRef.current.querySelectorAll('.animate-child');

      if (childElements.length > 0) {
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
                gsap.set(childElements, { clearProps: 'opacity,y' });
              }
            }
          }
        );
      }

      // 2. Parallax effect for Background Blobs
      if (bgBlob1Ref.current) {
        gsap.to(bgBlob1Ref.current, {
          y: -120,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      }

      if (bgBlob2Ref.current) {
        gsap.to(bgBlob2Ref.current, {
          y: 80,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2.0
          }
        });
      }

      // 3. Subtle Parallax for the 3D Canvas element
      if (block3DRef.current) {
        gsap.to(block3DRef.current, {
          y: -40,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.0
          }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-section"
      className="py-32 px-6 bg-just-black relative z-20 overflow-hidden"
    >
      {/* Parallax Floating Gradients */}
      <div
        ref={bgBlob1Ref}
        className="absolute left-[-10%] top-[20%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-lilac to-blue organic-glow-blob"
      />
      <div
        ref={bgBlob2Ref}
        className="absolute right-[-5%] bottom-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-orangey to-lipstick-pink organic-glow-blob"
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* Left Column: Premium 3D Scene Decorative Block */}
        <div 
          ref={block3DRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onClick={handleCardClick}
          className={`animate-child lg:col-span-5 h-[450px] sm:h-[550px] rounded-xl bg-off-black/50 border relative overflow-hidden flex items-center justify-center select-none transition-all duration-500 cursor-pointer ${
            isAnimating 
              ? 'border-light-green/40 shadow-[0_0_40px_rgba(171,255,132,0.12)] bg-off-black/60' 
              : 'border-surface-25/50'
          }`}
        >
          {/* Subtle Stage indicators */}
          <div className="absolute top-4 left-4 text-caption-standard font-mono text-surface-25 z-10 select-none">
            DECORATION // 02
          </div>

          {/* Premium FPS Badge & HUD isolated component */}
          <FpsTelemetry isAnimating={isAnimating} />

          <div className="absolute bottom-4 left-4 text-caption-standard font-mono text-surface-25 z-10 select-none uppercase tracking-wide">
            AMBIENT INTERPOLATION
          </div>

          {/* 2D Floating Interactive Particles Canvas */}
          <ParticlesCanvas isAnimating={isAnimating} mousePos={mousePos} />

          {/* ThreeJS R3F Interactive Scene Canvas */}
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 4.0] }}>
              <ambientLight intensity={0.5} />
              <Suspense fallback={null}>
                <InteractiveLights isAnimating={isAnimating} mousePos={mousePos} />
                <About3DDecoration isAnimating={isAnimating} mousePos={mousePos} />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* Right Column: Storytelling Narrative & Text Reveal */}
        <div 
          ref={triggerRef}
          className="lg:col-span-7 flex flex-col gap-8 items-start"
        >
          {/* Section Eyebrow */}
          <div className="animate-child flex items-center gap-2">
            <span className="text-surface-cream font-mori-regular text-body-sm tracking-wide">
              {'{ The Narrative }'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-light-green animate-pulse" />
          </div>

          <h2 className="animate-child text-heading font-mori-bold text-surface-cream leading-[1.1] tracking-[-0.011em] uppercase">
            A Story Written In High-Frame-Rate Motion
          </h2>

          {/* Chronological Story Paragraphs */}
          <div className="flex flex-col gap-6 text-body-large text-surface-50 font-mori-regular leading-relaxed max-w-2xl">
            <p ref={para1Ref} className="animate-child">
              <strong className="text-surface-cream">01 // The Philosophy.</strong> We believe animation isn't an afterthought or a secondary decorative layer. It is the core architecture of user emotion and attention. Every pixel shift must carry weight, purpose, and deliberate choreography.
            </p>
            <p ref={para2Ref} className="animate-child">
              <strong className="text-surface-cream">02 // The Engineering.</strong> GSAP delivers the raw mathematical engine required to orchestrate this logic at 120 frames per second. By bypassing traditional CSS limitations, we unlock complex state timelines, high-frequency vector morphing, and physical coordinate interpolation.
            </p>
            <p ref={para3Ref} className="animate-child">
              <strong className="text-surface-cream">03 // The Vision.</strong> From micro-interactions in a responsive interface to immersive glassmorphic 3D spatial simulations, we craft visual journeys that translate mathematical models into tactile digital experiences.
            </p>
          </div>

          {/* Metric Row */}
          <div className="animate-child grid grid-cols-2 gap-8 border-t border-surface-25/50 pt-8 mt-4 w-full">
            <div className="flex flex-col gap-1">
              <span className="text-heading-sm font-mori-bold text-shockingly-green font-mono">120 FPS</span>
              <span className="text-caption-standard text-surface-50 font-mono uppercase tracking-wider">Rendering Target</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-heading-sm font-mori-bold text-blue font-mono">0.08ms</span>
              <span className="text-caption-standard text-surface-50 font-mono uppercase tracking-wider">Average Interpolation Lag</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
