import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial, Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, User, MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles as SparklesIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Interactive Floating 3D Object for the contact background
function Contact3DObject() {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3;
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5}>
      <mesh ref={meshRef}>
        {/* Generous refractive torus ring geometry representing connectivity */}
        <torusGeometry args={[1.5, 0.4, 16, 100]} />
        <MeshWobbleMaterial
          color="#00bae2"
          factor={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

export default function Contact() {
  const sectionRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    // GSAP Scroll Reveal
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
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  // Real-time client-side validation rules
  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Identitary label (name) is required.';
    }
    if (!formData.email.trim()) {
      tempErrors.email = 'An operational email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = 'Please provide a mathematically valid email format.';
    }
    if (!formData.message.trim()) {
      tempErrors.message = 'Please input details describing your motion project.';
    } else if (formData.message.trim().length < 10) {
      tempErrors.message = 'Details should contain at least 10 characters.';
    }
    return tempErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Stagger shake animation on fields with errors
      gsap.to('.contact-input-wrap', {
        x: (i) => [10, -10, 6, -6, 0][i % 5],
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.05
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate high-fidelity network transport layer transmission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });

      // Animate success node pop in
      gsap.fromTo('.success-banner-node',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }, 1200);
  };

  return (
    <section
      ref={sectionRef}
      id="contact-section"
      className="py-32 px-6 bg-just-black border-t border-surface-25 relative z-20 overflow-hidden"
    >
      {/* 3D Immersive Spatial background for visual engagement */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color="#00bae2" />
          <pointLight position={[-5, -5, -5]} intensity={0.6} color="#fec5fb" />
          <Sparkles count={40} scale={8} size={1.5} speed={0.5} color="#00bae2" />
          <Suspense fallback={null}>
            <Contact3DObject />
          </Suspense>
        </Canvas>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
                {/* Left Side: Editorial context header & quick credentials */}
        <div 
          ref={infoRef}
          className="lg:col-span-5 flex flex-col gap-8"
        >
          <div className="animate-child flex items-center gap-2">
            <span className="text-surface-cream font-mori-regular text-body-sm tracking-wide">
              {'{ Project Initiation }'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
          </div>

          <h2 className="animate-child text-heading font-mori-bold text-surface-cream leading-[1.1] tracking-[-0.012em] uppercase">
            Let's Orchestrate High-Impact Motion Together
          </h2>

          <p className="animate-child text-body text-surface-50 font-mori-regular leading-relaxed max-w-md">
            Whether building interactive physical models, multi-nested scroll pipelines, or tactile layout transforms, our digital mechanics are calibrated to perform flawlessly.
          </p>

          <div className="animate-child flex flex-col gap-6 border-t border-surface-25/40 pt-8 mt-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full border border-surface-25 flex items-center justify-center text-surface-cream bg-off-black/60">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-caption-standard font-mono text-surface-25 uppercase">Communication Channel</span>
                <a href="mailto:initiations@gsapmotion.com" className="text-body-small font-mori-bold text-surface-cream hover:text-blue transition-gsap">
                  initiations@gsapmotion.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full border border-surface-25 flex items-center justify-center text-surface-cream bg-off-black/60">
                <SparklesIcon className="w-4 h-4 text-light-green" />
              </div>
              <div className="flex flex-col">
                <span className="text-caption-standard font-mono text-surface-25 uppercase">Spatial Location</span>
                <span className="text-body-small font-mori-bold text-surface-cream">
                  120 Frame Rate Boulevard, Matrix Suite 8
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Animated Glassmorphic Form Column */}
        <div 
          ref={formRef}
          className="lg:col-span-7"
        >
          <div className="animate-child bg-off-black/50 border border-surface-25/80 backdrop-blur-xl rounded-2xl p-8 sm:p-12 relative overflow-hidden">
            {/* Spotlight glow matching form layout */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue/5 filter blur-3xl pointer-events-none" />

            {isSuccess ? (
              <div className="success-banner-node flex flex-col items-center text-center py-16 gap-6">
                <div className="w-16 h-16 rounded-full bg-light-green/10 border border-light-green/40 flex items-center justify-center text-light-green">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-subheading font-mori-bold text-surface-cream">Payload Transmitted Safely</h3>
                  <p className="text-body-small text-surface-50 max-w-sm mx-auto font-mori-regular leading-relaxed">
                    Our motion mechanics team has logged your operational request. Expect a tailored response layout in your inbox within 24 hours.
                  </p>
                </div>
                <button
                  id="contact-btn-reset"
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-3 border border-surface-25 hover:border-surface-cream rounded-full text-caption-standard font-mono text-surface-cream uppercase tracking-wider transition-gsap cursor-pointer mt-4"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                {/* Full Name input block */}
                <div className="contact-input-wrap flex flex-col gap-2">
                  <label htmlFor="contact-name" className="text-caption-standard font-mono text-surface-50 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Identity Label
                  </label>
                  <div className={`relative flex items-center transition-all duration-300 rounded-lg ${errors.name ? 'border border-lipstick-pink bg-lipstick-pink/5' : 'border border-surface-25/60 bg-just-black/30 focus-within:border-surface-cream'}`}>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="w-full bg-transparent px-5 py-4 text-body-small text-surface-cream placeholder-surface-25/70 outline-none font-mori-regular"
                    />
                  </div>
                  {errors.name && (
                    <span className="text-caption-standard font-mono text-lipstick-pink flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                    </span>
                  )}
                </div>

                {/* Email input block */}
                <div className="contact-input-wrap flex flex-col gap-2">
                  <label htmlFor="contact-email" className="text-caption-standard font-mono text-surface-50 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Operational Email Address
                  </label>
                  <div className={`relative flex items-center transition-all duration-300 rounded-lg ${errors.email ? 'border border-lipstick-pink bg-lipstick-pink/5' : 'border border-surface-25/60 bg-just-black/30 focus-within:border-surface-cream'}`}>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. john@matrix.io"
                      className="w-full bg-transparent px-5 py-4 text-body-small text-surface-cream placeholder-surface-25/70 outline-none font-mori-regular"
                    />
                  </div>
                  {errors.email && (
                    <span className="text-caption-standard font-mono text-lipstick-pink flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                    </span>
                  )}
                </div>

                {/* Message input block */}
                <div className="contact-input-wrap flex flex-col gap-2">
                  <label htmlFor="contact-message" className="text-caption-standard font-mono text-surface-50 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Project Mechanics Brief
                  </label>
                  <div className={`relative flex items-center transition-all duration-300 rounded-lg ${errors.message ? 'border border-lipstick-pink bg-lipstick-pink/5' : 'border border-surface-25/60 bg-just-black/30 focus-within:border-surface-cream'}`}>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Briefly describe what coordinates, timelines or physical states we are crafting..."
                      className="w-full bg-transparent px-5 py-4 text-body-small text-surface-cream placeholder-surface-25/70 outline-none font-mori-regular resize-none"
                    />
                  </div>
                  {errors.message && (
                    <span className="text-caption-standard font-mono text-lipstick-pink flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.message}
                    </span>
                  )}
                </div>

                {/* Submit trigger button */}
                <button
                  id="contact-btn-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-4 bg-surface-cream hover:bg-white text-just-black font-mori-bold text-body-small uppercase tracking-wider rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-just-black border-t-transparent rounded-full animate-spin" />
                      Transporting Coordinates...
                    </>
                  ) : (
                    <>
                      Transmit Request <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
