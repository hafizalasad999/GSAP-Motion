import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, Sparkles, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Alexandra Vance',
    role: 'Creative Director, Studio 9',
    quote: 'Integrating this high-frame-rate motion system completely transformed our studio outputs. The coordinate calculations are buttery smooth, and the rendering lag is virtually non-existent.',
    avatarColor: 'from-pink to-blue',
    accentColor: '#fec5fb',
    rating: 5,
    metrics: '120FPS rendering standard'
  },
  {
    id: 2,
    name: 'Marcus Kaelen',
    role: 'Lead Interaction Developer',
    quote: 'GSAP with custom Three.js integration has allowed us to craft experiences we previously thought impossible on standard web environments. Beautiful glass refraction and flawless timeline orchestration.',
    avatarColor: 'from-orangey to-lipstick-pink',
    accentColor: '#ff8709',
    rating: 5,
    metrics: 'Sub-pixel precise timelines'
  },
  {
    id: 3,
    name: 'Evelyn Sterling',
    role: 'Principal UX Architect, Prism',
    quote: 'The mathematical approach to user emotion and pacing is brilliant. It isn’t just aesthetic clutter—it’s purposeful motion choreography that directs human focus perfectly.',
    avatarColor: 'from-lilac to-pink',
    accentColor: '#9d95ff',
    rating: 5,
    metrics: '0.08ms average loop latency'
  },
  {
    id: 4,
    name: 'Devon Takahashi',
    role: 'Co-Founder, Cyber Canvas',
    quote: 'Absolutely stellar. The performance optimization on responsive layouts is flawless. Drag, scroll, and tilt interactions sync up cleanly without any computational stutter.',
    avatarColor: 'from-blue to-shockingly-green',
    accentColor: '#00bae2',
    rating: 5,
    metrics: 'Multi-matrix layout sync'
  },
  {
    id: 5,
    name: 'Sienna Dubois',
    role: 'Technical Animator, Neon Lab',
    quote: 'The timeline nesting capabilities are a dream for complex spatial choreography. Having strict, deterministic playback control across separate canvas elements is a game-changer.',
    avatarColor: 'from-light-green to-orangey',
    accentColor: '#abff84',
    rating: 5,
    metrics: 'Microsecond playback precision'
  }
];

export default function Testimonials() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  // Infinite horizontal slider animation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let loop;
    let ctx = gsap.context(() => {
      loop = gsap.to(track, {
        x: '-50%',
        ease: 'none',
        duration: 30,
        repeat: -1,
      });
    }, trackRef);

    const handleEnter = () => {
      if (loop) gsap.to(loop, { timeScale: 0.15, duration: 1.2, ease: 'power2.out' });
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

  // 3D Tilting Mouse Interaction on Cards
  const handleCardMouseMove = (e, id) => {
    const card = document.getElementById(`testimonial-card-${id}`);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight glow coordinate update
    const glow = card.querySelector('.card-spotlight');
    if (glow) {
      gsap.to(glow, {
        left: x,
        top: y,
        duration: 0.3,
        ease: 'power2.out',
        opacity: 0.55
      });
    }

    // 3D Tilt calculation
    const tiltX = (y / rect.height - 0.5) * 20; // up to 10 deg tilt
    const tiltY = (x / rect.width - 0.5) * -20;

    gsap.to(card, {
      rotateX: tiltX,
      rotateY: tiltY,
      transformPerspective: 1000,
      scale: 1.02,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleCardMouseLeave = (id) => {
    const card = document.getElementById(`testimonial-card-${id}`);
    if (!card) return;

    const glow = card.querySelector('.card-spotlight');
    if (glow) {
      gsap.to(glow, {
        opacity: 0,
        duration: 0.5
      });
    }

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.8,
      ease: 'elastic.out(1.1, 0.4)'
    });
  };

  const doubledTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      ref={sectionRef}
      id="testimonials-section"
      className="py-32 bg-just-black border-t border-surface-25 relative z-20 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12 mb-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-surface-25/50 pb-10">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="animate-child text-surface-cream font-mori-regular text-body-sm tracking-wide">
              {'{ Peer Alignment }'}
            </span>
            <h2 className="animate-child text-heading-medium font-mori-bold text-surface-cream leading-tight">
              Endorsed By Industry Leading Creative Minds
            </h2>
          </div>
          <p className="animate-child text-body text-surface-50 max-w-sm font-mori-regular">
            See how high-fidelity visual transitions shape digital narrative and command user interest.
          </p>
        </div>
      </div>

      {/* Testimonials horizontal scrolling track */}
      <div className="animate-child w-full relative overflow-hidden py-10">
        <div
          ref={trackRef}
          id="testimonials-track"
          className="flex gap-8 w-max px-6"
          style={{ willChange: 'transform' }}
        >
          {doubledTestimonials.map((t, idx) => {
            const uniqueId = `${t.id}-${idx}`;
            return (
              <div
                key={uniqueId}
                id={`testimonial-card-${uniqueId}`}
                onMouseMove={(e) => handleCardMouseMove(e, uniqueId)}
                onMouseLeave={() => handleCardMouseLeave(uniqueId)}
                className="group relative w-[360px] sm:w-[460px] bg-off-black/40 border border-surface-25/80 rounded-xl p-8 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-surface-cream/40 transition-all duration-300"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Spotlight glow inside card */}
                <div
                  className="card-spotlight pointer-events-none absolute w-60 h-60 rounded-full mix-blend-screen filter blur-[75px] opacity-0 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: `radial-gradient(circle, ${t.accentColor} 0%, transparent 70%)`
                  }}
                />

                {/* Card Header Quote Icon and Star Rating */}
                <div className="flex justify-between items-center relative z-10 mb-6">
                  <div className="w-10 h-10 rounded-full bg-just-black/60 border border-surface-25/50 flex items-center justify-center text-surface-cream">
                    <Quote className="w-4 h-4 opacity-60" />
                  </div>
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-shockingly-green text-shockingly-green" />
                    ))}
                  </div>
                </div>

                {/* Testimonial Quote body */}
                <p className="text-body text-surface-cream leading-relaxed font-mori-regular italic mb-8 relative z-10">
                  “{t.quote}”
                </p>

                {/* Profile Meta info */}
                <div className="flex items-center justify-between border-t border-surface-25/40 pt-6 relative z-10">
                  <div className="flex items-center gap-3">
                    {/* Placeholder decorative custom gradient visual identity avatar */}
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${t.avatarColor} animate-pulse shrink-0`} />
                    <div className="flex flex-col">
                      <span className="text-body-small font-mori-bold text-surface-cream">{t.name}</span>
                      <span className="text-caption-standard text-surface-50 font-mori-regular">{t.role}</span>
                    </div>
                  </div>
                  <span className="text-caption-standard font-mono text-surface-25 uppercase tracking-wider hidden sm:inline-block">
                    {t.metrics}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
