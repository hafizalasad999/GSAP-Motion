import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ currentView, onViewChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Refs for GSAP animations
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const menuItemsRef = useRef([]);
  const ctaRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileBgRef = useRef(null);
  const mobileLinksRef = useRef([]);

  // Magnetic button hook/ref helper for mouse tracking
  const makeMagnetic = (el) => {
    if (!el) return;
    
    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(el, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  };

  // Bind magnetic behavior to CTA and Logo
  const ctaMagneticRef = useRef(null);
  const logoMagneticRef = useRef(null);

  useEffect(() => {
    const cleanupCta = makeMagnetic(ctaMagneticRef.current);
    const cleanupLogo = makeMagnetic(logoMagneticRef.current);
    return () => {
      if (cleanupCta) cleanupCta();
      if (cleanupLogo) cleanupLogo();
    };
  }, []);

  // Initial Entry Animation (Reveal)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const activeMenuItems = (menuItemsRef.current || []).filter(Boolean);
      
      // Set initial state
      if (navRef.current) gsap.set(navRef.current, { y: -100, opacity: 0 });
      if (logoRef.current) gsap.set(logoRef.current, { scale: 0.8, opacity: 0 });
      if (activeMenuItems.length > 0) gsap.set(activeMenuItems, { y: -20, opacity: 0 });
      if (ctaRef.current) gsap.set(ctaRef.current, { scale: 0.9, opacity: 0 });

      // Build timeline
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
      
      if (navRef.current) tl.to(navRef.current, { y: 0, opacity: 1 }, 0.2);
      if (logoRef.current) tl.to(logoRef.current, { scale: 1, opacity: 1, ease: 'back.out(1.7)' }, 0.4);
      if (activeMenuItems.length > 0) tl.to(activeMenuItems, { y: 0, opacity: 1, stagger: 0.08 }, 0.5);
      if (ctaRef.current) tl.to(ctaRef.current, { scale: 1, opacity: 1, ease: 'back.out(1.4)' }, 0.7);
    });

    return () => ctx.revert();
  }, []);

  // Mobile Menu Animation Toggle
  useEffect(() => {
    const activeLinks = (mobileLinksRef.current || []).filter(Boolean);
    const bg = mobileBgRef.current;
    const menu = mobileMenuRef.current;

    if (isOpen) {
      // Animate Mobile Menu In
      if (bg) gsap.killTweensOf(bg);
      if (activeLinks.length > 0) gsap.killTweensOf(activeLinks);
      
      const tl = gsap.timeline();
      if (menu) tl.set(menu, { display: 'flex' });
      if (bg) {
        tl.fromTo(bg, 
          { clipPath: 'circle(0% at 90% 10%)' }, 
          { clipPath: 'circle(150% at 90% 10%)', duration: 0.8, ease: 'power4.inOut' }
        );
      }
      if (activeLinks.length > 0) {
        tl.fromTo(activeLinks,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, ease: 'power3.out' },
          '-=0.3'
        );
      }
    } else {
      // Animate Mobile Menu Out
      if (menu) {
        const tl = gsap.timeline();
        if (activeLinks.length > 0) {
          tl.to(activeLinks, { y: -20, opacity: 0, stagger: 0.04, duration: 0.3, ease: 'power3.in' });
        }
        if (bg) {
          tl.to(bg, { 
            clipPath: 'circle(0% at 90% 10%)', 
            duration: 0.6, 
            ease: 'power4.inOut',
            onComplete: () => {
              if (mobileMenuRef.current) mobileMenuRef.current.style.display = 'none';
            }
          }, '-=0.1');
        }
      }
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Features', color: 'hover:text-shockingly-green text-surface-50', path: '#features-section' },
    { name: 'Gallery', color: 'hover:text-pink text-surface-50', path: '#gallery-section' },
    { name: 'About', color: 'hover:text-lilac text-surface-50', path: '#about-section' },
    { name: 'Reviews', color: 'hover:text-orangey text-surface-50', path: '#testimonials-section' },
    { name: 'Pricing', color: 'hover:text-blue text-surface-50', path: '#pricing-section' },
    { name: 'Contact', color: 'hover:text-shockingly-green text-surface-50', path: '#contact-section' },
  ];

  return (
    <>
      {/* Announcement Banner */}
      <div 
        id="announcement-banner"
        className="w-full h-10 border-b border-surface-25 bg-just-black flex items-center justify-center text-caption-standard font-mori-regular select-none z-50 relative"
      >
        <span>
          GSAP is now completely free. 
          <a href="#explore" className="ml-1.5 text-shockingly-green hover:underline inline-flex items-center gap-0.5 font-mori-bold">
            Read announcement <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </span>
      </div>

      {/* Main Navigation Header */}
      <header
        id="main-header"
        ref={navRef}
        className="sticky top-0 w-full z-40 bg-just-black/60 backdrop-blur-md border-b border-surface-25 transition-gsap"
      >
        <div 
          id="nav-container" 
          className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
        >
          {/* Logo */}
          <div id="nav-logo-wrap" className="flex items-center">
            <a
              id="logo-link"
              href="#home"
              ref={logoRef}
              className="inline-block"
            >
              <div
                id="logo-magnetic"
                ref={logoMagneticRef}
                className="flex items-center gap-2 cursor-pointer py-2 px-1 select-none"
              >
                <span className="text-surface-cream text-body-large font-mori-regular transition-gsap hover:scale-105 inline-block">
                  <span className="text-surface-50">{'{'}</span>
                  <span className="text-shockingly-green font-mori-bold tracking-tight px-1">G</span>
                  <span className="text-surface-50">{'}'}</span>
                </span>
                <span className="text-surface-cream font-mori-bold text-body-sm tracking-widest uppercase opacity-80 mt-0.5">
                  Motion
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav 
            id="desktop-nav" 
            className="hidden md:flex items-center gap-1.5"
          >
            {navLinks.map((link, idx) => (
              <a
                key={link.name}
                id={`desktop-link-${idx}`}
                href={link.path}
                ref={(el) => (menuItemsRef.current[idx] = el)}
                className={`px-4 py-2 text-body-small font-mori-regular transition-all duration-300 relative group overflow-hidden ${link.color}`}
              >
                {/* Visual Label */}
                <span className="relative z-10 block transition-transform duration-300 group-hover:-translate-y-full">
                  {link.name}
                </span>
                <span className="absolute left-4 top-2 z-10 block transition-transform duration-300 translate-y-full group-hover:translate-y-0 text-surface-cream font-mori-bold">
                  {link.name}
                </span>
                
                {/* Bottom line anchor */}
                <span className="absolute bottom-1.5 left-4 right-4 h-[1px] bg-surface-cream transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          {/* CTA & Controls (Desktop) */}
          <div 
            id="desktop-cta-container" 
            className="hidden md:flex items-center gap-4 animate-child"
          >
            <button
              onClick={() => onViewChange && onViewChange(currentView === 'orders' ? 'landing' : 'orders')}
              className="px-5 py-2.5 rounded-full text-body-small font-mori-regular hover:text-shockingly-green text-surface-50 hover:bg-white/5 transition-all duration-300 relative group overflow-hidden cursor-pointer flex items-center gap-2 border border-surface-25/40"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'orders' ? 'bg-shockingly-green animate-pulse' : 'bg-surface-25'}`} />
              {currentView === 'orders' ? 'View Landing' : 'My Orders'}
            </button>
            <div 
              ref={ctaRef}
              className="relative"
            >
              <a
                id="cta-button"
                href="#pricing-section"
                ref={ctaMagneticRef}
                onClick={(e) => {
                  if (currentView === 'orders') {
                    onViewChange && onViewChange('landing');
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-body-small font-mori-bold text-surface-cream transition-gsap gradient-border-green uppercase tracking-wide cursor-pointer"
              >
                Get GSAP 
                <span className="w-1.5 h-1.5 rounded-full bg-light-green animate-pulse" />
              </a>
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <div id="mobile-trigger-container" className="md:hidden flex items-center">
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-surface-cream hover:text-shockingly-green transition-gsap relative z-50 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Overlay Menu */}
      <div
        id="mobile-overlay-menu"
        ref={mobileMenuRef}
        className="fixed inset-0 z-30 hidden flex-col justify-between"
      >
        {/* Animated Slide background */}
        <div
          id="mobile-menu-background"
          ref={mobileBgRef}
          className="absolute inset-0 bg-off-black border-l border-surface-25"
          style={{ clipPath: 'circle(0% at 90% 10%)' }}
        />

        {/* Content Section */}
        <div 
          id="mobile-menu-content" 
          className="relative z-10 flex flex-col justify-center h-full px-8 pt-24 pb-12 gap-8"
        >
          {/* Eyebrow */}
          <div 
            id="mobile-menu-eyebrow" 
            ref={(el) => (mobileLinksRef.current[0] = el)}
            className="text-surface-50 text-caption-standard font-mori-regular border-b border-surface-25/50 pb-2"
          >
            {'{ Navigation Taxonomy }'}
          </div>

          {/* Massive Editorial Links */}
          <nav id="mobile-links" className="flex flex-col gap-6">
            {navLinks.map((link, idx) => (
              <a
                key={link.name}
                id={`mobile-link-${idx}`}
                href={link.path}
                onClick={() => setIsOpen(false)}
                ref={(el) => (mobileLinksRef.current[idx + 1] = el)}
                className="group flex items-baseline justify-between py-2 border-b border-surface-25/30 hover:border-surface-cream transition-gsap"
              >
                <span className={`text-subheading font-mori-bold transition-gsap ${link.color}`}>
                  {link.name}
                </span>
                <span className="text-surface-50 text-caption-standard group-hover:text-surface-cream transition-gsap font-mono">
                  0{idx + 1}
                </span>
              </a>
            ))}
          </nav>

          {/* CTA (Mobile) */}
          <div 
            id="mobile-cta-wrap" 
            ref={(el) => (mobileLinksRef.current[navLinks.length + 1] = el)}
            className="mt-4 flex flex-col gap-3"
          >
            <button
              onClick={() => {
                onViewChange && onViewChange(currentView === 'orders' ? 'landing' : 'orders');
                setIsOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-body-small font-mori-bold text-surface-cream transition-gsap bg-white/5 border border-surface-25/50 hover:border-surface-cream uppercase tracking-wide cursor-pointer"
            >
              {currentView === 'orders' ? 'Return to Landing' : 'My Orders Ledger'}
            </button>
            <a
              id="mobile-cta-button"
              href="#pricing-section"
              onClick={() => {
                setIsOpen(false);
                if (currentView === 'orders') {
                  onViewChange && onViewChange('landing');
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-body-small font-mori-bold text-surface-cream transition-gsap gradient-border-green uppercase tracking-wide cursor-pointer"
            >
              Get GSAP 
              <span className="w-1.5 h-1.5 rounded-full bg-light-green animate-pulse" />
            </a>
          </div>

          {/* Footer of Mobile Menu */}
          <div
            id="mobile-menu-footer"
            ref={(el) => (mobileLinksRef.current[navLinks.length + 2] = el)}
            className="mt-auto flex justify-between text-caption-standard text-surface-50 border-t border-surface-25/50 pt-4"
          >
            <span>© 2026 GSAP®</span>
            <span className="hover:text-surface-cream transition-gsap cursor-pointer">Privacy / Terms</span>
          </div>
        </div>
      </div>
    </>
  );
}
