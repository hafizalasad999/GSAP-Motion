import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Maximize2, X, Sparkles, MoveLeft, MoveRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Curated high-performance artistic motion projects
const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Superconductor Fluid',
    discipline: 'SVG Morph',
    color: '#ff8709',
    bgGradient: 'from-orangey to-lipstick-pink',
    description: 'A study of magnetic liquid fluidics morphing synchronously at 120 FPS. Inspired by fluid dynamics and non-Newtonian viscosity simulation models.',
    resolution: '8K Vector Render',
    delay: '0.04ms'
  },
  {
    id: 2,
    title: 'Elastic Spring-back',
    discipline: 'UI Motion',
    color: '#00bae2',
    bgGradient: 'from-blue to-shockingly-green',
    description: 'Dynamic user interface states changing layout coordinates on the fly. Leverages physical matrix calculation to maintain continuous visual momentum.',
    resolution: 'Adaptive Layout Map',
    delay: '0.12ms'
  },
  {
    id: 3,
    title: 'Kinetic Monospace',
    discipline: 'SplitText',
    color: '#9d95ff',
    bgGradient: 'from-lilac to-pink',
    description: 'Expressive typographic choreography breaking strings into separate characters and staggering their entrance with sinusoidal acceleration curves.',
    resolution: 'Sub-pixel Font Matrix',
    delay: '0.02ms'
  },
  {
    id: 4,
    title: 'Atmospheric Physics',
    discipline: 'Scroll Trigger',
    color: '#fec5fb',
    bgGradient: 'from-pink to-blue',
    description: 'A three-dimensional landscape of interactive particles that drift and react to the user scrolling momentum and mouse acceleration coordinates.',
    resolution: 'Spatial Point Cloud',
    delay: '0.08ms'
  },
  {
    id: 5,
    title: 'Hyper-stretching Grid',
    discipline: 'Flip Layout',
    color: '#abff84',
    bgGradient: 'from-light-green to-orangey',
    description: 'A responsive grid that dynamically resizes and shifts coordinates depending on container queries, ensuring uninterrupted visual transitions.',
    resolution: 'Vector State Grid',
    delay: '0.10ms'
  },
  {
    id: 6,
    title: 'Chronos Clockwork',
    discipline: 'Timeline Engine',
    color: '#f100cb',
    bgGradient: 'from-lipstick-pink to-lilac',
    description: 'Perfect timing synchronization across nested canvas groups. Demonstrates deterministic timeline playheads with granular scrubbing precision.',
    resolution: 'Microsecond Clock',
    delay: '0.01ms'
  }
];

export default function Gallery() {
  const [selectedItem, setSelectedItem] = useState(null);
  const trackRef = useRef(null);
  const sectionRef = useRef(null);

  // Infinite horizontal scroll logic
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let loop;
    let ctx = gsap.context(() => {
      // Loop scroll animation
      loop = gsap.to(track, {
        x: `-50%`,
        ease: 'none',
        duration: 35,
        repeat: -1,
      });
    }, trackRef);

    const handleEnter = () => {
      if (loop) gsap.to(loop, { timeScale: 0.12, duration: 1.2, ease: 'power2.out' });
    };

    const handleLeave = () => {
      if (loop) gsap.to(loop, { timeScale: 1.0, duration: 1.8, ease: 'power2.out' });
    };

    track.addEventListener('mouseenter', handleEnter);
    track.addEventListener('mouseleave', handleLeave);

    return () => {
      ctx.revert();
      track.removeEventListener('mouseenter', handleEnter);
      track.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  // Elegant ScrollTrigger entrance reveal sequence
  useEffect(() => {
    if (!sectionRef.current) return;
    let ctx = gsap.context(() => {
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

  // Mouse Parallax movement tracking inside individual cards
  const handleCardMouseMove = (e, cardId) => {
    const card = document.getElementById(`gallery-card-${cardId}`);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Parallax animate the abstract inner graphic
    gsap.to(card.querySelector('.parallax-art'), {
      x: x * 25,
      y: y * 25,
      rotation: x * 8,
      duration: 0.4,
      ease: 'power2.out'
    });

    // Parallax animate the text content slightly less
    gsap.to(card.querySelector('.parallax-content'), {
      x: x * 8,
      y: y * 8,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (cardId) => {
    const card = document.getElementById(`gallery-card-${cardId}`);
    if (!card) return;

    gsap.to(card.querySelector('.parallax-art'), {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
    });

    gsap.to(card.querySelector('.parallax-content'), {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  // Double array to create enough items to loop seamlessly
  const doubledItems = [...GALLERY_ITEMS, ...GALLERY_ITEMS];

  return (
    <section
      ref={sectionRef}
      id="gallery-section"
      className="py-32 bg-just-black border-t border-surface-25 relative z-20 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12 mb-16">
        {/* Eyebrow & Headers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-surface-25/50 pb-10">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="animate-child text-surface-cream font-mori-regular text-body-sm tracking-wide">
              {'{ Interactive Showcases }'}
            </span>
            <h2 className="animate-child text-heading-medium font-mori-bold text-surface-cream leading-tight">
              A Continuous Stream Of Spatial Choreography
            </h2>
          </div>
          <div className="animate-child flex flex-col items-start md:items-end gap-2 text-surface-50 font-mori-regular">
            <p className="text-body-small">Hover tracks to slow down velocity.</p>
            <div className="flex items-center gap-4 text-caption-standard font-mono text-surface-25">
              <span className="flex items-center gap-1"><MoveLeft className="w-4 h-4" /> AUTO SCROLL</span>
              <span>●</span>
              <span className="flex items-center gap-1">HOVER ZOOM <MoveRight className="w-4 h-4" /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Infinite Horizontal Carousel track container */}
      <div className="animate-child w-full relative overflow-hidden py-6">
        <div 
          ref={trackRef}
          id="gallery-track" 
          className="flex gap-6 w-max px-6"
          style={{ willChange: 'transform' }}
        >
          {doubledItems.map((item, idx) => {
            const uniqueId = `${item.id}-${idx}`;
            return (
              <div
                key={uniqueId}
                id={`gallery-card-${uniqueId}`}
                onMouseMove={(e) => handleCardMouseMove(e, uniqueId)}
                onMouseLeave={() => handleCardMouseLeave(uniqueId)}
                onClick={() => setSelectedItem(item)}
                className="group relative w-[320px] sm:w-[420px] aspect-[4/5] bg-off-black border border-surface-25/60 rounded-xl p-8 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-surface-cream transition-all duration-500"
              >
                {/* Header info */}
                <div className="parallax-content flex justify-between items-center relative z-10">
                  <span className="text-caption-standard font-mono text-surface-50 tracking-wider uppercase">
                    // SHOWCASE {item.id}
                  </span>
                  <span 
                    className="text-caption-standard font-mono px-3 py-1 bg-just-black border border-surface-25/50 rounded-full"
                    style={{ color: item.color }}
                  >
                    {item.discipline}
                  </span>
                </div>

                {/* Aesthetic Organic Abstract Artwork container (No broken external link imagery) */}
                <div className="relative flex-1 my-6 flex items-center justify-center rounded-lg bg-just-black/30 border border-surface-25/30 overflow-hidden">
                  {/* Subtle blur backdrop of parent item accent */}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${item.bgGradient} opacity-5 filter blur-2xl`} />

                  {/* Intersecting floating geometric vectors simulating physical depth */}
                  <div className="parallax-art relative w-40 h-40 flex items-center justify-center">
                    <div className={`absolute inset-4 rounded-full bg-gradient-to-tr ${item.bgGradient} opacity-40 filter blur-xl animate-pulse`} />
                    <div className="absolute inset-8 rounded-lg border-2 border-dashed border-surface-cream/20 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-12 rounded-full border border-surface-cream/30 group-hover:-rotate-45 group-hover:scale-90 transition-transform duration-700" />
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${item.bgGradient} opacity-80 shadow-inner group-hover:scale-125 transition-transform duration-500`} />
                  </div>

                  <div className="absolute bottom-4 right-4 bg-just-black/80 px-2 py-1 rounded text-[10px] font-mono text-surface-50">
                    {item.resolution}
                  </div>
                </div>

                {/* Footer labels */}
                <div className="parallax-content relative z-10 flex flex-col gap-2">
                  <h3 className="text-body-large font-mori-bold text-surface-cream group-hover:text-shockingly-green transition-colors duration-300">
                    {item.title}
                  </h3>
                  <div className="flex justify-between items-center text-caption-standard text-surface-50 border-t border-surface-25/30 pt-3">
                    <span className="font-mono">Choreography Lag</span>
                    <span className="font-mono text-surface-cream">{item.delay}</span>
                  </div>
                </div>

                {/* Zoom corner indicator */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Maximize2 className="w-5 h-5 text-surface-cream" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox / Details Modal (Aesthetic presentation, no broken logic) */}
      {selectedItem && (
        <div
          id="gallery-lightbox"
          className="fixed inset-0 z-50 bg-just-black/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          {/* Animated Overlay Frame */}
          <div 
            id="lightbox-card"
            className="relative w-full max-w-4xl bg-off-black border border-surface-25 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:grid md:grid-cols-12 max-h-[90vh] md:max-h-none"
          >
            {/* Close button */}
            <button
              id="close-lightbox-btn"
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 p-2 rounded-full border border-surface-25 text-surface-cream hover:bg-surface-cream hover:text-just-black transition-gsap z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Col: Creative Graphic display */}
            <div className="col-span-12 md:col-span-7 bg-just-black p-12 flex flex-col justify-center items-center min-h-[300px] relative border-b md:border-b-0 md:border-r border-surface-25">
              <div className="absolute top-4 left-4 text-caption-standard font-mono text-surface-25">PREVIEW // MOTION_DYNAMICS</div>
              
              <div className={`absolute w-72 h-72 rounded-full bg-gradient-to-tr ${selectedItem.bgGradient} opacity-10 filter blur-3xl`} />
              
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${selectedItem.bgGradient} opacity-20 filter blur-2xl animate-ambient-float`} />
                <div className="absolute inset-4 rounded-lg border border-dashed border-surface-cream/30 animate-spin" style={{ animationDuration: '20s' }} />
                <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${selectedItem.bgGradient} opacity-95`} />
              </div>

              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-caption-standard font-mono text-surface-50">
                <Sparkles className="w-3.5 h-3.5 text-light-green" /> 120 FPS CALIBRATION CONNECTED
              </div>
            </div>

            {/* Right Col: Metadata and details */}
            <div className="col-span-12 md:col-span-5 p-12 flex flex-col justify-between gap-8 bg-off-black">
              <div className="flex flex-col gap-4">
                <span 
                  className="text-caption-standard font-mono tracking-widest uppercase"
                  style={{ color: selectedItem.color }}
                >
                  // DISCIPLINE / {selectedItem.discipline}
                </span>
                <h2 className="text-subheading font-mori-bold text-surface-cream">
                  {selectedItem.title}
                </h2>
                <p className="text-body-small text-surface-50 leading-relaxed font-mori-regular">
                  {selectedItem.description}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-caption-standard font-mono border-b border-surface-25 pb-3">
                  <span className="text-surface-50">Resolution Map</span>
                  <span className="text-surface-cream">{selectedItem.resolution}</span>
                </div>
                <div className="flex justify-between items-center text-caption-standard font-mono border-b border-surface-25 pb-3">
                  <span className="text-surface-50">Matrix Interpolation</span>
                  <span className="text-surface-cream">{selectedItem.delay}</span>
                </div>
                
                <button
                  id="lightbox-cta"
                  onClick={() => setSelectedItem(null)}
                  className="w-full mt-2 py-4 rounded-full border border-surface-cream text-body-small font-mori-bold text-surface-cream hover:bg-surface-cream hover:text-just-black transition-gsap uppercase tracking-wider cursor-pointer"
                >
                  Close Showcase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
