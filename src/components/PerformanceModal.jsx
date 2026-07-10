import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Cpu, Activity, Database, CheckCircle2, AlertTriangle, XCircle, 
  Monitor, Smartphone, Tablet, Laptop, Zap, Wifi, Battery, Moon, 
  RefreshCw, Layers, Award, Gauge
} from 'lucide-react';
import gsap from 'gsap';

export default function PerformanceModal({ isOpen, onClose, featureName }) {
  const [liveFps, setLiveFps] = useState(0);
  const [averageFps, setAverageFps] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [isMeasuring, setIsMeasuring] = useState(true);
  
  // Hardware & API diagnostics state
  const [diagnostics, setDiagnostics] = useState({
    deviceType: 'Desktop',
    resolution: 'Loading...',
    pixelRatio: 1,
    browserName: 'Loading...',
    osName: 'Loading...',
    webglSupported: 'Checking...',
    webglVersion: 'Not Available',
    gpuRenderer: 'Not Available',
    hardwareConcurrency: 'Not Available',
    deviceMemory: 'Not Available',
    touchSupport: 'Not Available',
    darkMode: 'Not Available',
    networkStatus: 'Online',
    connectionType: 'Not Available',
    batteryLevel: 'Not Available',
    hardwareAcceleration: 'Checking...'
  });

  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const framesRef = useRef([]);
  const requestRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastFrameTimeRef = useRef(null);

  // 1. Initial diagnostics fetching (mount-only or safe run)
  useEffect(() => {
    if (!isOpen) return;

    // Detect Device Type based on viewport and touch
    const width = window.innerWidth;
    const hasTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    let devType = 'Desktop';
    if (width < 768) {
      devType = hasTouch ? 'Mobile' : 'Laptop';
    } else if (width >= 768 && width <= 1024) {
      devType = hasTouch ? 'Tablet' : 'Laptop';
    } else if (width > 1024 && width <= 1440) {
      devType = 'Laptop';
    }

    // Resolution & DPR
    const res = `${window.screen.width} x ${window.screen.height}`;
    const dpr = window.devicePixelRatio || 1;

    // Browser & OS Detection
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident')) browser = 'Microsoft Internet Explorer';
    else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome')) browser = 'Google Chrome';
    else if (ua.includes('Safari')) browser = 'Apple Safari';

    let os = 'Unknown OS';
    if (ua.includes('Windows NT 10.0')) os = 'Windows 10 / 11';
    else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
    else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android OS';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    // WebGL support and renderer
    let webgl = false;
    let webglVer = 'Not Available';
    let gpu = 'Not Available';
    let hardwareAccel = 'Active';

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const gl2 = canvas.getContext('webgl2');

      if (gl) {
        webgl = true;
        webglVer = gl2 ? 'WebGL 2.0 (Core)' : 'WebGL 1.0';
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          
          // Heuristic: check if hardware accelerated
          if (gpu.includes('SwiftShader') || gpu.includes('llvmpipe') || gpu.includes('Software') || gpu.includes('Microsoft Basic Render')) {
            hardwareAccel = 'Disabled / Software Emulated';
          }
        }
      } else {
        hardwareAccel = 'Inactive / No WebGL';
      }
    } catch (e) {
      console.warn('WebGL detection error:', e);
    }

    // Touch support, dark mode, network
    const touch = hasTouch ? 'Supported' : 'Not Supported';
    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const dMode = darkMedia.matches ? 'Dark Mode Active' : 'Light Mode Active';
    const network = navigator.onLine ? 'Online' : 'Offline';

    // Network connection type
    let connType = 'Not Available';
    if (navigator.connection) {
      connType = navigator.connection.effectiveType || navigator.connection.type || 'Connected';
    }

    setDiagnostics(prev => ({
      ...prev,
      deviceType: devType,
      resolution: res,
      pixelRatio: dpr,
      browserName: browser,
      osName: os,
      webglSupported: webgl ? 'Fully Supported' : 'Unsupported',
      webglVersion: webglVer,
      gpuRenderer: gpu,
      hardwareConcurrency: navigator.hardwareConcurrency || 'Not Available',
      deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Not Available',
      touchSupport: touch,
      darkMode: dMode,
      networkStatus: network,
      connectionType: connType,
      hardwareAcceleration: hardwareAccel
    }));

    // Battery Level
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        setDiagnostics(prev => ({
          ...prev,
          batteryLevel: `${Math.round(battery.level * 100)}%`
        }));
      }).catch(() => {});
    } else {
      setDiagnostics(prev => ({ ...prev, batteryLevel: 'Not Available' }));
    }

  }, [isOpen]);

  // 2. High Precision FPS Measuring using requestAnimationFrame
  useEffect(() => {
    if (!isOpen) return;

    // Reset states
    setLiveFps(0);
    setAverageFps(null);
    setCountdown(3);
    setIsMeasuring(true);
    framesRef.current = [];
    startTimeRef.current = performance.now();
    lastFrameTimeRef.current = performance.now();

    // Smooth entry GSAP animations
    gsap.fromTo(overlayRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    gsap.fromTo(modalRef.current,
      { scale: 0.9, y: 30, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.2)', delay: 0.1 }
    );

    // RAF Loop
    const tick = (now) => {
      // Calculate instantaneous FPS
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      
      const currentInstantFps = delta > 0 ? 1000 / delta : 60;
      framesRef.current.push(currentInstantFps);

      // Render throttled live FPS to state every 10 frames to avoid state-update choking
      if (framesRef.current.length % 10 === 0) {
        const roundedInstantFps = Math.round(currentInstantFps);
        setLiveFps(prev => prev !== roundedInstantFps ? roundedInstantFps : prev);
      }

      // Calculate countdown and lock-in average
      const elapsed = now - startTimeRef.current;
      const secondsLeft = Math.max(0, 3 - elapsed / 1000);
      const ceilSeconds = Math.ceil(secondsLeft);
      setCountdown(prev => prev !== ceilSeconds ? ceilSeconds : prev);

      if (elapsed < 3000) {
        requestRef.current = requestAnimationFrame(tick);
      } else {
        // Complete 3-second diagnostic
        setIsMeasuring(false);
        const validFrames = framesRef.current.filter(f => f > 0 && f < 500); // Filter anomalies
        const avg = validFrames.length > 0 
          ? validFrames.reduce((acc, f) => acc + f, 0) / validFrames.length 
          : 60;
        setAverageFps(Math.round(avg));
      }
    };

    requestRef.current = requestAnimationFrame(tick);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute stats and performance indicators
  const activeFps = isMeasuring ? liveFps : (averageFps || liveFps || 60);

  // Performance status ranges
  let fpsStatus = 'Good';
  let fpsColor = 'text-shockingly-green';
  let fpsBg = 'bg-shockingly-green/10';
  let strokeColor = '#0ae448';

  if (activeFps >= 120) {
    fpsStatus = 'Excellent';
    fpsColor = 'text-light-green';
    fpsBg = 'bg-light-green/10';
    strokeColor = '#abff84';
  } else if (activeFps >= 90) {
    fpsStatus = 'Very Good';
    fpsColor = 'text-shockingly-green';
    fpsBg = 'bg-shockingly-green/10';
    strokeColor = '#0ae448';
  } else if (activeFps >= 60) {
    fpsStatus = 'Good';
    fpsColor = 'text-blue';
    fpsBg = 'bg-blue/10';
    strokeColor = '#00bae2';
  } else if (activeFps >= 30) {
    fpsStatus = 'Average';
    fpsColor = 'text-orangey';
    fpsBg = 'bg-orangey/10';
    strokeColor = '#ff8709';
  } else {
    fpsStatus = 'Low Performance';
    fpsColor = 'text-lipstick-pink';
    fpsBg = 'bg-lipstick-pink/10';
    strokeColor = '#f100cb';
  }

  // Calculate Performance Score (0-100)
  // FPS yields up to 50pts
  const fpsPoints = Math.min(50, Math.round((activeFps / 120) * 50));
  // CPU cores yields up to 15pts
  const cores = diagnostics.hardwareConcurrency === 'Not Available' ? 4 : Number(diagnostics.hardwareConcurrency);
  const cpuPoints = Math.min(15, cores >= 12 ? 15 : cores >= 8 ? 12 : cores >= 4 ? 9 : 6);
  // Memory yields up to 15pts
  const memoryGB = diagnostics.deviceMemory === 'Not Available' ? 8 : parseFloat(diagnostics.deviceMemory);
  const ramPoints = Math.min(15, memoryGB >= 16 ? 15 : memoryGB >= 8 ? 12 : memoryGB >= 4 ? 8 : 4);
  // WebGL capabilities yields up to 20pts
  const isGPUAccelerated = diagnostics.hardwareAcceleration === 'Active';
  const gpuPoints = isGPUAccelerated ? 20 : 5;

  const totalScore = fpsPoints + cpuPoints + ramPoints + gpuPoints;

  // Performance Grade
  let grade = 'B';
  let gradeColor = 'text-blue';
  if (totalScore >= 95) {
    grade = 'A+';
    gradeColor = 'text-light-green';
  } else if (totalScore >= 85) {
    grade = 'A';
    gradeColor = 'text-shockingly-green';
  } else if (totalScore >= 70) {
    grade = 'B';
    gradeColor = 'text-blue';
  } else if (totalScore >= 50) {
    grade = 'C';
    gradeColor = 'text-orangey';
  } else {
    grade = 'D';
    gradeColor = 'text-lipstick-pink';
  }

  // Estimate performance progress bar percentages
  const cpuLoadEst = Math.min(100, Math.round((cores / 16) * 100));
  const gpuPerfEst = isGPUAccelerated ? (diagnostics.gpuRenderer.toLowerCase().includes('nvidia') || diagnostics.gpuRenderer.toLowerCase().includes('amd') || diagnostics.gpuRenderer.toLowerCase().includes('apple') ? 98 : 75) : 25;
  const memUsageEst = memoryGB >= 16 ? 40 : memoryGB >= 8 ? 65 : 85;
  const renderPerfEst = Math.min(100, Math.round((activeFps / 144) * 100));

  // Circle visual helper values
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const fpsOffset = circumference - (Math.min(120, activeFps) / 120) * circumference;
  const scoreOffset = circumference - (totalScore / 100) * circumference;

  const handleClose = () => {
    // Elegant slide down exit
    gsap.to(modalRef.current, {
      scale: 0.95,
      y: 30,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: onClose
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    });
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-just-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-4xl bg-off-black/80 border border-surface-25 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] select-none"
      >
        {/* Modal Glow Accent */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[150px] pointer-events-none rounded-full filter blur-[100px] opacity-25"
          style={{ background: `radial-gradient(circle, ${strokeColor} 0%, transparent 80%)` }}
        />

        {/* Modal Header */}
        <div className="relative z-10 px-6 py-5 border-b border-surface-25/50 flex items-center justify-between bg-just-black/40">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${fpsBg} ${fpsColor}`}>
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-body-large font-mori-bold text-surface-cream tracking-tight flex items-center gap-2">
                Performance Telemetry Desk
              </h2>
              <p className="text-[11px] font-mono text-surface-50 uppercase tracking-widest">
                Testing Module: {featureName || "Core Motion Matrix"}
              </p>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="p-2 bg-white/5 border border-surface-25 rounded-full text-surface-50 hover:text-surface-cream hover:bg-white/10 transition-gsap cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="relative z-10 overflow-y-auto p-6 sm:p-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Primary Performance Dashboards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Real-time FPS Meter Alert */}
            {isMeasuring && (
              <div className="flex items-center gap-3 bg-blue/10 border border-blue/30 rounded-xl px-4 py-3 text-body-small text-blue font-mori-regular">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>Calibrating stable performance metrics... Lock-in finalized in <strong className="font-mono text-white">{countdown}s</strong>.</span>
              </div>
            )}

            {!isMeasuring && (
              <div className="flex items-center gap-3 bg-shockingly-green/10 border border-shockingly-green/30 rounded-xl px-4 py-3 text-body-small text-shockingly-green font-mori-regular">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Device performance benchmarking fully finalized. Stable benchmark recorded.</span>
              </div>
            )}

            {/* Dashboard Hero Grid: Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Gauge 1: Live FPS Gauge */}
              <div className="bg-just-black/40 border border-surface-25/40 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-surface-50 uppercase tracking-wider flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5" /> Live Frame Rate
                  </span>
                  <span className={`text-[38px] font-mori-bold leading-none ${fpsColor}`}>
                    {activeFps} <span className="text-body-small font-mono text-surface-50">FPS</span>
                  </span>
                  <span className="text-body-small text-surface-cream/80 font-mori-regular flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-light-green animate-ping" />
                    Status: <strong className={fpsColor}>{fpsStatus}</strong>
                  </span>
                </div>

                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="48" cy="48" r={radius}
                      className="stroke-surface-25" strokeWidth="6" fill="none"
                    />
                    <circle 
                      cx="48" cy="48" r={radius}
                      stroke={strokeColor} strokeWidth="6" fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={fpsOffset}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-surface-cream">
                    {Math.round((activeFps / 120) * 100)}%
                  </div>
                </div>
              </div>

              {/* Gauge 2: Performance Score Gauge */}
              <div className="bg-just-black/40 border border-surface-25/40 rounded-xl p-5 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-surface-50 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Performance Score
                  </span>
                  <span className="text-[38px] font-mori-bold leading-none text-surface-cream">
                    {totalScore}<span className="text-body-small font-mono text-surface-50">/100</span>
                  </span>
                  <span className="text-body-small text-surface-cream/80 font-mori-regular flex items-center gap-1.5 mt-1">
                    System Grade: <strong className={`font-mori-bold ${gradeColor} text-sm`}>{grade}</strong>
                  </span>
                </div>

                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="48" cy="48" r={radius}
                      className="stroke-surface-25" strokeWidth="6" fill="none"
                    />
                    <circle 
                      cx="48" cy="48" r={radius}
                      stroke={gradeColor === 'text-light-green' ? '#abff84' : gradeColor === 'text-shockingly-green' ? '#0ae448' : gradeColor === 'text-blue' ? '#00bae2' : gradeColor === 'text-orangey' ? '#ff8709' : '#f100cb'} 
                      strokeWidth="6" fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={scoreOffset}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-base font-bold text-surface-cream">
                    {grade}
                  </div>
                </div>
              </div>

            </div>

            {/* Estimated System Load & Capability Bars */}
            <div className="bg-just-black/40 border border-surface-25/40 rounded-xl p-6 flex flex-col gap-5">
              <h3 className="text-caption-standard font-mono text-surface-cream uppercase tracking-wider border-b border-surface-25/30 pb-2.5">
                Motion Pipeline Performance Estimates
              </h3>

              {/* Progress Bar 1: CPU Estimate */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-body-small font-mori-regular">
                  <span className="text-surface-50 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-surface-cream" /> Hardware CPU Core Distribution
                  </span>
                  <span className="text-surface-cream font-mono font-bold">{cpuLoadEst}%</span>
                </div>
                <div className="w-full bg-surface-25/50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue to-lilac h-full rounded-full transition-all duration-1000"
                    style={{ width: `${cpuLoadEst}%` }}
                  />
                </div>
              </div>

              {/* Progress Bar 2: GPU Performance */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-body-small font-mori-regular">
                  <span className="text-surface-50 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-surface-cream" /> WebGL Hardware Acceleration Capacity
                  </span>
                  <span className="text-surface-cream font-mono font-bold">{gpuPerfEst}%</span>
                </div>
                <div className="w-full bg-surface-25/50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orangey to-shockingly-green h-full rounded-full transition-all duration-1000"
                    style={{ width: `${gpuPerfEst}%` }}
                  />
                </div>
              </div>

              {/* Progress Bar 3: Memory Allocation */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-body-small font-mori-regular">
                  <span className="text-surface-50 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-surface-cream" /> Diagnostic Memory Available
                  </span>
                  <span className="text-surface-cream font-mono font-bold">{memUsageEst}%</span>
                </div>
                <div className="w-full bg-surface-25/50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-pink to-lilac h-full rounded-full transition-all duration-1000"
                    style={{ width: `${memUsageEst}%` }}
                  />
                </div>
              </div>

              {/* Progress Bar 4: Rendering Frame Performance */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-body-small font-mori-regular">
                  <span className="text-surface-50 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-surface-cream" /> Graphic Pipeline Delivery Speed
                  </span>
                  <span className="text-surface-cream font-mono font-bold">{renderPerfEst}%</span>
                </div>
                <div className="w-full bg-surface-25/50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-light-green to-blue h-full rounded-full transition-all duration-1000"
                    style={{ width: `${renderPerfEst}%` }}
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Column 3: Full Diagnostics Specifications Desk */}
          <div className="flex flex-col gap-5 bg-just-black/60 border border-surface-25/40 rounded-xl p-5 sm:p-6 overflow-hidden">
            <h3 className="text-caption-standard font-mono text-surface-cream uppercase tracking-wider border-b border-surface-25/30 pb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-shockingly-green" /> Specifications Log
            </h3>

            {/* List of diagnosed keys and values */}
            <div className="flex flex-col gap-3.5 text-body-small overflow-y-auto pr-1">
              
              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 shrink-0" /> Device Type:
                </span>
                <span className="text-surface-cream font-mori-bold text-right truncate pl-2">{diagnostics.deviceType}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 shrink-0" /> WebGL Context:
                </span>
                <span className="text-surface-cream font-mori-bold text-right truncate pl-2">{diagnostics.webglSupported}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 shrink-0" /> WebGL Version:
                </span>
                <span className="text-surface-cream font-mono text-xs text-right truncate pl-2">{diagnostics.webglVersion}</span>
              </div>

              <div className="flex flex-col gap-1 border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 shrink-0" /> GPU Renderer:
                </span>
                <span className="text-surface-cream font-mono text-[11px] text-left truncate block max-w-full" title={diagnostics.gpuRenderer}>
                  {diagnostics.gpuRenderer}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 shrink-0" /> HW Acceleration:
                </span>
                <span className="text-surface-cream font-mori-bold text-right truncate pl-2 text-shockingly-green">{diagnostics.hardwareAcceleration}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 shrink-0" /> Logical Cores:
                </span>
                <span className="text-surface-cream font-mono text-right pl-2">{diagnostics.hardwareConcurrency}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 shrink-0" /> Memory Estimate:
                </span>
                <span className="text-surface-cream font-mono text-right pl-2">{diagnostics.deviceMemory}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 shrink-0" /> Resolution:
                </span>
                <span className="text-surface-cream font-mono text-right pl-2">{diagnostics.resolution}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 shrink-0" /> Device Pixel Ratio:
                </span>
                <span className="text-surface-cream font-mono text-right pl-2">{diagnostics.pixelRatio}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 shrink-0" /> Platform OS:
                </span>
                <span className="text-surface-cream font-mori-bold text-right truncate pl-2">{diagnostics.osName}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 shrink-0" /> Browser Host:
                </span>
                <span className="text-surface-cream font-mori-bold text-right truncate pl-2">{diagnostics.browserName}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 shrink-0" /> Dark Mode Pref:
                </span>
                <span className="text-surface-cream font-mori-bold text-right truncate pl-2">{diagnostics.darkMode}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 shrink-0" /> Connection Type:
                </span>
                <span className="text-surface-cream font-mori-bold text-right truncate pl-2">{diagnostics.connectionType}</span>
              </div>

              <div className="flex justify-between items-center border-b border-surface-25/15 pb-2">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 shrink-0" /> Battery Level:
                </span>
                <span className="text-surface-cream font-mori-bold text-right truncate pl-2">{diagnostics.batteryLevel}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-surface-50 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 shrink-0" /> Network Status:
                </span>
                <span className={`font-mori-bold text-right truncate pl-2 ${diagnostics.networkStatus === 'Online' ? 'text-shockingly-green' : 'text-lipstick-pink'}`}>
                  {diagnostics.networkStatus}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="relative z-10 px-6 py-4 border-t border-surface-25/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-just-black/40">
          <span className="text-[10px] font-mono text-surface-25 uppercase tracking-wide text-center sm:text-left">
            OFFLINE-FIRST WEBGL DIAGNOSTICS DEPLOYMENT // SYSTEM READY
          </span>
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-surface-cream text-just-black hover:bg-transparent hover:text-surface-cream border border-surface-cream rounded-full text-body-small font-mori-bold uppercase tracking-wider transition-gsap cursor-pointer text-center"
          >
            Acknowledge Stats
          </button>
        </div>

      </div>
    </div>
  );
}
