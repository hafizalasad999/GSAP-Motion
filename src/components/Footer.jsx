import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Github, Twitter, Dribbble, Instagram, ArrowUp, Cpu, Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  const footerRef = useRef(null);
  const logoRef = useRef(null);
  const backToTopRef = useRef(null);

  // Smooth scroll back to top function
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Elegant reveal of logo on hover / entry
    if (logoRef.current) {
      const letters = logoRef.current.querySelectorAll('.logo-letter');
      
      logoRef.current.addEventListener('mouseenter', () => {
        gsap.to(letters, {
          y: -4,
          color: '#abff84',
          stagger: 0.03,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      logoRef.current.addEventListener('mouseleave', () => {
        gsap.to(letters, {
          y: 0,
          color: '#fffce1',
          stagger: 0.02,
          duration: 0.4,
          ease: 'power2.inOut'
        });
      });
    }

    // Dynamic hover wiggle animation for the Back to top action
    if (backToTopRef.current) {
      backToTopRef.current.addEventListener('mouseenter', () => {
        const arrow = backToTopRef.current?.querySelector('.arrow-node');
        if (arrow) {
          gsap.to(arrow, {
            y: -4,
            repeat: -1,
            yoyo: true,
            duration: 0.4,
            ease: 'power1.inOut'
          });
        }
      });

      backToTopRef.current.addEventListener('mouseleave', () => {
        const arrow = backToTopRef.current?.querySelector('.arrow-node');
        if (arrow) {
          gsap.killTweensOf(arrow);
          gsap.to(arrow, {
            y: 0,
            duration: 0.3
          });
        }
      });
    }
  }, []);

  // Elegant ScrollTrigger entrance reveal sequence
  useEffect(() => {
    if (!footerRef.current) return;
    let ctx = gsap.context(() => {
      // Target child elements to stagger animate (footer container stays fully visible by default)
      const childElements = footerRef.current.querySelectorAll('.animate-child');
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
            trigger: footerRef.current,
            start: 'top 95%', // Trigger slightly later since it's at the very bottom
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

  const footerLinks = [
    {
      title: 'CREATIVE ENGINES',
      links: [
        { name: 'ScrollTrigger mechanics', href: '#features-section' },
        { name: 'Vector draw & morph', href: '#features-section' },
        { name: 'Kinetic typography', href: '#features-section' },
        { name: 'Flip state system', href: '#features-section' }
      ]
    },
    {
      title: 'MOTION STUDIO',
      links: [
        { name: 'Showcase gallery', href: '#gallery-section' },
        { name: 'Brand narrative', href: '#about-section' },
        { name: 'Peer reviews & ratings', href: '#testimonials-section' },
        { name: 'Commercial licensing', href: '#pricing-section' }
      ]
    },
    {
      title: 'RESOURCES & ECOSYSTEM',
      links: [
        { name: 'Developer workspace', href: '#' },
        { name: 'Performance metrics', href: '#' },
        { name: 'GreenSock core docs', href: '#' },
        { name: 'Community showcases', href: '#' }
      ]
    },
    {
      title: 'PLATFORM SPEC',
      links: [
        { name: 'Matrix calculations', href: '#' },
        { name: 'Sub-pixel rendering', href: '#' },
        { name: '120FPS synchronization', href: '#' },
        { name: 'Hardware acceleration', href: '#' }
      ]
    }
  ];

  return (
    <footer
      ref={footerRef}
      id="apple-premium-footer"
      className="bg-just-black border-t border-surface-25/80 pt-24 pb-12 px-6 sm:px-12 relative z-20 overflow-hidden"
    >
      {/* Soft abstract brand background gradient glow */}
      <div className="absolute left-[15%] bottom-[-10%] w-[500px] h-[350px] rounded-full bg-gradient-to-tr from-lilac/5 to-blue/5 filter blur-[100px] pointer-events-none" />
      <div className="absolute right-[10%] bottom-0 w-[400px] h-[300px] rounded-full bg-gradient-to-tr from-shockingly-green/5 to-transparent filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16 relative z-10">
        
        {/* Top Header Row with Premium Branding & Back To Top */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 border-b border-surface-25/40 pb-12">
          {/* Brand Logo with dynamic interactive hover stagger */}
          <div className="animate-child flex flex-col gap-2">
            <div
              ref={logoRef}
              className="text-body-large sm:text-subheading font-mori-bold text-surface-cream tracking-widest cursor-pointer select-none uppercase flex items-center gap-0.5"
            >
              {'{ '}
              {['G', 'S', 'A', 'P', ' ', 'M', 'O', 'T', 'I', 'O', 'N'].map((char, index) => (
                <span key={index} className="logo-letter inline-block transition-transform duration-300">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
              {' }'}
            </div>
            <span className="text-caption-standard font-mono text-surface-25 uppercase tracking-wider">
              ESTABLISHED IN 2026 // MOTION PARADIGM
            </span>
          </div>

          {/* Social icons + Scroll to top action */}
          <div className="animate-child flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-surface-25/50 flex items-center justify-center text-surface-50 hover:text-surface-cream hover:border-surface-cream transition-all duration-300">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-surface-25/50 flex items-center justify-center text-surface-50 hover:text-surface-cream hover:border-surface-cream transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-surface-25/50 flex items-center justify-center text-surface-50 hover:text-surface-cream hover:border-surface-cream transition-all duration-300">
                <Dribbble className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-surface-25/50 flex items-center justify-center text-surface-50 hover:text-surface-cream hover:border-surface-cream transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            <button
              ref={backToTopRef}
              onClick={handleScrollToTop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-surface-25 text-caption-standard font-mono text-surface-cream hover:border-surface-cream hover:bg-off-black transition-all duration-300 cursor-pointer"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="arrow-node w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Apple-style Multi-column Link Hierarchy */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
          {footerLinks.map((section, idx) => (
            <div key={idx} className="animate-child flex flex-col gap-5">
              <span className="text-[10px] font-mono font-semibold tracking-widest text-surface-25 uppercase">
                // {section.title}
              </span>
              <ul className="flex flex-col gap-3">
                {section.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.href}
                      className="text-caption-standard font-mori-regular text-surface-50 hover:text-surface-cream hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer, Trademark and Credit Row */}
        <div className="animate-child border-t border-surface-25/40 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-mono text-surface-25">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <span>© 2026 GSAP® MOTION DESIGN HAFIZ AL ASAD Inc. All Rights Reserved.</span>
            <span>All spatial calculations and timeline choreographies are proprietary trademarks of HAFIZ AL ASAD & GreenSock.</span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end">
            <span className="hover:text-surface-50 transition-gsap cursor-pointer uppercase">Privacy Agreement</span>
            <span className="hover:text-surface-50 transition-gsap cursor-pointer uppercase">Licensing rules</span>
            <span className="hover:text-surface-50 transition-gsap cursor-pointer uppercase">System status: operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
