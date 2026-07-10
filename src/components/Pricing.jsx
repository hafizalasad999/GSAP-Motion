import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Sparkles, ArrowRight, Star, Cpu, Globe, Infinity as InfinityIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Core Suite',
    price: '0',
    frequency: 'Forever Free',
    description: 'Perfect for independent designers, hobbyists, and developers crafting simple static layouts.',
    features: [
      'Access to core GSAP engine',
      'Standard easing & interpolation',
      'Community forums support',
      'Continuous offline performance'
    ],
    accentColor: '#00bae2',
    borderColor: 'border-surface-25/50',
    popular: false,
    icon: Cpu,
    buttonText: 'Start Building',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'studio',
    name: 'Studio Pro',
    price: '99',
    frequency: 'per developer / yr',
    description: 'For professional creators requiring complete scroll, vector morphing, and interactive layouts.',
    features: [
      'Unrestricted ScrollTrigger access',
      'Advanced DrawSVG & MorphSVG',
      'SplitText kinetic typography engine',
      'GSAP Flip state orchestrator',
      'Priority developers forums assistance',
      'Premium UI template layouts'
    ],
    accentColor: '#abff84',
    borderColor: 'border-shockingly-green/30',
    popular: true,
    icon: Star,
    buttonText: 'Acquire Studio license',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '249',
    frequency: 'per developer / yr',
    description: 'Unrestricted enterprise capabilities with commercial distribution licenses for high-traffic products.',
    features: [
      'All Premium plugins included',
      'Commercial distribution authorization',
      'Direct email/slack engineer support',
      'Unlimited domain deployments',
      'Custom matrix math consulting',
      'Advanced Live API sandbox access'
    ],
    accentColor: '#fec5fb',
    borderColor: 'border-surface-25/50',
    popular: false,
    icon: Globe,
    buttonText: 'Get Enterprise',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80'
  }
];

export default function Pricing({ onBuy }) {
  const sectionRef = useRef(null);
  const cardContainerRef = useRef(null);

  // Scroll trigger reveal for the pricing grid
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

  // Mouse Spotlight dynamic lighting and 3D Tilt calculation
  const handleCardMouseMove = (e, id) => {
    const card = document.getElementById(`pricing-card-${id}`);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight glow coordinates updating
    const glow = card.querySelector('.pricing-glow');
    if (glow) {
      gsap.to(glow, {
        left: x,
        top: y,
        duration: 0.3,
        ease: 'power2.out',
        opacity: 0.6
      });
    }

    // 3D Tilt calculations
    const tiltX = (y / rect.height - 0.5) * 15;
    const tiltY = (x / rect.width - 0.5) * -15;

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
    const card = document.getElementById(`pricing-card-${id}`);
    if (!card) return;

    const glow = card.querySelector('.pricing-glow');
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

  return (
    <section
      ref={sectionRef}
      id="pricing-section"
      className="py-32 px-6 bg-just-black border-t border-surface-25 relative z-20 overflow-hidden select-none"
    >
      {/* Background soft ambient backdrops */}
      <div className="absolute right-[-10%] top-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue to-shockingly-green organic-glow-blob opacity-5 filter blur-3xl pointer-events-none" />
      <div className="absolute left-[-5%] bottom-[5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-pink to-lilac organic-glow-blob opacity-5 filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-surface-25/50 pb-10">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="animate-child text-surface-cream font-mori-regular text-body-sm tracking-wide">
              {'{ Commercial Licensing }'}
            </span>
            <h2 className="animate-child text-heading-medium font-mori-bold text-surface-cream leading-tight">
              Honest Plans Calibrated For Continuous Growth
            </h2>
          </div>
          <p className="animate-child text-body text-surface-50 max-w-sm font-mori-regular">
            Upgrade your interactive capabilities with complete access to advanced SVG, scroll, layout matrices, and direct engineer consultations.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div
          ref={cardContainerRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-stretch"
        >
          {PRICING_PLANS.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <div
                key={plan.id}
                className="animate-child relative z-1 hover:z-10 transition-[z-index] duration-300 h-full p-4 md:p-6"
                style={{ perspective: 1000 }}
              >
                <div
                  id={`pricing-card-${plan.id}`}
                  onMouseMove={(e) => handleCardMouseMove(e, plan.id)}
                  onMouseLeave={() => handleCardMouseLeave(plan.id)}
                  className={`group relative bg-off-black/40 border ${plan.borderColor} rounded-2xl p-8 flex flex-col justify-between overflow-hidden cursor-pointer transition-colors duration-300 min-h-[640px] h-full`}
                  style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
                >
                {/* Spotlight glow following the cursor */}
                <div
                  className="pricing-glow pointer-events-none absolute w-72 h-72 rounded-full mix-blend-screen filter blur-[80px] opacity-0 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: `radial-gradient(circle, ${plan.accentColor} 0%, transparent 70%)`
                  }}
                />

                {/* Card Top Block */}
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-caption-standard font-mono text-surface-50 uppercase tracking-widest">
                        // PLATFORM tier
                      </span>
                      <h3 className="text-subheading font-mori-bold text-surface-cream group-hover:text-surface-cream transition-colors">
                        {plan.name}
                      </h3>
                    </div>
                    {/* Floating Tier Icon */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-surface-25/50 bg-just-black/60"
                      style={{ color: plan.accentColor }}
                    >
                      <PlanIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-body-small text-surface-50 font-mori-regular mb-8 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Pricing Rate Display */}
                  <div className="flex items-baseline gap-2 mb-10 border-b border-surface-25/30 pb-6">
                    <span className="text-heading font-mori-bold text-surface-cream leading-none tracking-tight">
                      ${plan.price}
                    </span>
                    <span className="text-caption-standard font-mono text-surface-50 uppercase tracking-wide">
                      / {plan.frequency}
                    </span>
                  </div>

                  {/* Dynamic checklist of items */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-surface-25 mb-1">
                      Platform Capabilities
                    </span>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div 
                          className="w-5 h-5 rounded-full border border-surface-25/50 flex items-center justify-center shrink-0 mt-0.5"
                          style={{ color: plan.accentColor }}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-body-small text-surface-cream/80 font-mori-regular">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outlined Action Trigger bottom */}
                <div className="mt-12 relative z-10">
                  <button
                    id={`pricing-btn-${plan.id}`}
                    onClick={() => onBuy && onBuy(plan)}
                    className={`w-full py-4 rounded-full text-body-small font-mori-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-gsap cursor-pointer ${
                      plan.popular
                        ? 'bg-surface-cream text-just-black border border-surface-cream hover:bg-transparent hover:text-surface-cream'
                        : 'border border-surface-25 group-hover:border-surface-cream text-surface-50 group-hover:text-surface-cream'
                    }`}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {plan.popular && (
                    <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 flex items-center gap-1 bg-shockingly-green/20 border border-shockingly-green/40 text-shockingly-green text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                      <Sparkles className="w-3 h-3" /> Highly Recommended Plan
                    </div>
                  )}
                </div>

              </div>
            </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
