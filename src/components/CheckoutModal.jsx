import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Plus, Minus, CreditCard, ShieldCheck, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, selectedProduct, onViewOrders }) {
  const [step, setStep] = useState(1); // 1 = Details/Quantity, 2 = Checkout Form/Payment, 3 = Success
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Animation Refs
  const modalOverlayRef = useRef(null);
  const modalContentRef = useRef(null);

  const [formError, setFormError] = useState('');

  // Initialize/reset states when selected product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setQuantity(1);
      setFullName('');
      setEmail('');
      setPaymentMethod('');
      setPlacedOrder(null);
      setFormError('');

      // Smooth GSAP Entrance animation
      const tl = gsap.timeline();
      tl.to(modalOverlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
      .fromTo(modalContentRef.current, 
        { y: 50, scale: 0.95, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' },
        '-=0.15'
      );
    }
  }, [isOpen, selectedProduct]);

  if (!isOpen || !selectedProduct) return null;

  const itemPrice = parseFloat(selectedProduct.price);
  const totalPrice = itemPrice * quantity;

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleClose = () => {
    // Elegant exit animation
    const tl = gsap.timeline({
      onComplete: onClose
    });
    tl.to(modalContentRef.current, {
      y: 30,
      scale: 0.95,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    })
    .to(modalOverlayRef.current, {
      opacity: 0,
      duration: 0.2
    }, '-=0.15');
  };

  const handleProceedToCheckout = () => {
    setStep(2);
  };

  const handleBackToDetails = () => {
    setStep(1);
    setFormError('');
  };

  const handleSimulatePayment = (methodName) => {
    if (!fullName.trim() || !email.trim()) {
      setFormError('Please provide your name and email address to continue.');
      return;
    }
    setFormError('');

    setPaymentMethod(methodName);

    // Generate complete fake order details
    const randomId = 'GSAP-' + Math.floor(100000 + Math.random() * 900000) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderDate = new Date().toLocaleString();
    
    const newOrder = {
      orderId: randomId,
      date: orderDate,
      product: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        image: selectedProduct.image,
        description: selectedProduct.description
      },
      quantity: quantity,
      totalPrice: totalPrice,
      paymentMethod: methodName,
      billing: {
        fullName,
        email
      }
    };

    // Save in LocalStorage
    try {
      const existingOrders = JSON.parse(localStorage.getItem('gsap_premium_orders') || '[]');
      existingOrders.unshift(newOrder); // Add to beginning
      localStorage.setItem('gsap_premium_orders', JSON.stringify(existingOrders));
    } catch (e) {
      console.error('Failed to save order in localStorage:', e);
    }

    setPlacedOrder(newOrder);

    // Transition to success screen with subtle animation
    gsap.fromTo('.checkout-panel-body', 
      { opacity: 1 }, 
      { 
        opacity: 0, 
        duration: 0.3, 
        onComplete: () => {
          setStep(3);
          gsap.fromTo('.success-panel-body', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4 });
        }
      }
    );
  };

  return (
    <div 
      ref={modalOverlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-just-black/90 backdrop-blur-md opacity-0"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div 
        ref={modalContentRef}
        className="relative w-full max-w-4xl bg-off-black border border-surface-25/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
      >
        {/* Decorative ambient gradient */}
        <div 
          className="absolute -right-24 -top-24 w-72 h-72 rounded-full filter blur-[100px] opacity-20 pointer-events-none"
          style={{ background: selectedProduct.accentColor || '#abff84' }}
        />

        {/* Left Side: Product Display Card */}
        <div className="w-full md:w-5/12 bg-just-black/50 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-surface-25/30">
          <div>
            <span className="text-caption-standard font-mono text-surface-25 uppercase tracking-widest block mb-4">
              // Selected Package
            </span>
            
            {/* Elegant glass framed image */}
            <div className="relative aspect-video md:aspect-square w-full rounded-xl overflow-hidden border border-surface-25/40 mb-6 group">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div 
                className="absolute inset-0 opacity-20 mix-blend-screen"
                style={{ background: `linear-gradient(135deg, ${selectedProduct.accentColor}, transparent)` }}
              />
            </div>

            <h3 className="text-subheading font-mori-bold text-surface-cream mb-2">
              {selectedProduct.name}
            </h3>
            <p className="text-body-small text-surface-50 font-mori-regular leading-relaxed mb-6">
              {selectedProduct.description}
            </p>
          </div>

          <div className="pt-6 border-t border-surface-25/20">
            <span className="text-caption-standard font-mono text-surface-25 uppercase tracking-wide block mb-1">
              Unit License Price
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-heading-small font-mori-bold text-surface-cream">
                ${selectedProduct.price}
              </span>
              <span className="text-caption-standard font-mono text-surface-50">
                / {selectedProduct.frequency}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Flow Panels */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          {/* Close Trigger Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full border border-surface-25/40 text-surface-50 hover:text-surface-cream hover:border-surface-cream transition-gsap cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Step 1: Details & Quantity Selector */}
          {step === 1 && (
            <div className="flex flex-col justify-between h-full min-h-[350px]">
              <div>
                <h4 className="text-body-large font-mori-bold text-surface-cream mb-2">
                  Configure Your License quantity
                </h4>
                <p className="text-body-small text-surface-50 mb-8 font-mori-regular">
                  Deploy interactive motion layers to unlimited client projects with a single commercial seat. Add extra developer team seats as required.
                </p>

                {/* Interactive Quantity Control Container */}
                <div className="bg-just-black/40 border border-surface-25/30 rounded-xl p-6 flex items-center justify-between mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-caption-standard font-mono text-surface-50 uppercase tracking-wider">
                      Developer Seats
                    </span>
                    <span className="text-body-small text-surface-25 font-mori-regular">
                      (Stagger modules per user)
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className={`w-10 h-10 rounded-full border border-surface-25/40 flex items-center justify-center transition-gsap cursor-pointer ${
                        quantity <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:border-surface-cream text-surface-cream'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-10 text-center font-mono text-body-large text-surface-cream font-bold">
                      {quantity}
                    </span>

                    <button 
                      onClick={handleIncrement}
                      className="w-10 h-10 rounded-full border border-surface-25/40 flex items-center justify-center text-surface-cream hover:border-surface-cream transition-gsap cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal summary display */}
                <div className="flex items-center justify-between py-4 border-t border-b border-surface-25/20 mb-8">
                  <span className="text-body-small font-mori-regular text-surface-50">Subtotal Price:</span>
                  <div className="flex items-baseline gap-1">
                    <span 
                      className="text-heading-small font-mori-bold transition-all duration-300"
                      style={{ color: selectedProduct.accentColor }}
                    >
                      ${totalPrice.toFixed(2)}
                    </span>
                    <span className="text-caption-standard font-mono text-surface-25 uppercase">USD</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-4 mt-auto">
                <button 
                  onClick={handleClose}
                  className="w-1/2 py-4 border border-surface-25 text-surface-50 hover:text-surface-cream hover:border-surface-cream rounded-full text-body-small font-mori-bold uppercase tracking-wider transition-gsap cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProceedToCheckout}
                  className="w-1/2 py-4 bg-surface-cream text-just-black border border-surface-cream hover:bg-transparent hover:text-surface-cream rounded-full text-body-small font-mori-bold uppercase tracking-wider transition-gsap flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Checkout & Payment Options */}
          {step === 2 && (
            <div className="checkout-panel-body flex flex-col justify-between h-full min-h-[350px]">
              <div>
                <h4 className="text-body-large font-mori-bold text-surface-cream mb-1">
                  Billing Details & Payment
                </h4>
                <p className="text-body-small text-surface-50 mb-6 font-mori-regular">
                  Complete billing credentials. Securely simulated gateway checkout with real payment callbacks.
                </p>

                {formError && (
                  <div className="text-caption-standard font-mono text-lipstick-pink bg-lipstick-pink/10 border border-lipstick-pink/25 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-lipstick-pink shadow-[0_0_8px_#f100cb] shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Billing inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-caption-standard font-mono text-surface-25 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Sridoy Rahman"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-just-black/40 border border-surface-25/50 focus:border-surface-cream text-surface-cream rounded-lg px-4 py-3 text-body-small outline-none transition-gsap font-mori-regular"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-caption-standard font-mono text-surface-25 uppercase tracking-wide">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      placeholder="e.g. sridoy@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-just-black/40 border border-surface-25/50 focus:border-surface-cream text-surface-cream rounded-lg px-4 py-3 text-body-small outline-none transition-gsap font-mori-regular"
                      required
                    />
                  </div>
                </div>

                {/* Order Summary banner */}
                <div className="bg-just-black/30 border border-surface-25/20 rounded-xl px-4 py-3 flex justify-between items-center mb-6 text-body-small font-mori-regular">
                  <span className="text-surface-50">
                    Order Total ({quantity} {quantity === 1 ? 'seat' : 'seats'}):
                  </span>
                  <span className="font-mori-bold text-surface-cream text-body-large">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Payment Options (Structured UI only, no real SDK) */}
                <div className="flex flex-col gap-3">
                  <span className="text-caption-standard font-mono text-surface-25 uppercase tracking-widest block mb-1">
                    Select Simulated Payment Option
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* International Credit Card */}
                    <button 
                      onClick={() => handleSimulatePayment('Stripe')}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-25/40 bg-just-black/50 hover:bg-just-black hover:border-surface-cream transition-all duration-300 cursor-pointer text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                        <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-caption-standard font-mori-bold text-surface-cream leading-tight">
                          Stripe Gateway
                        </span>
                        <span className="text-[10px] font-mono text-surface-25 uppercase">
                          International / Card
                        </span>
                      </div>
                    </button>

                    {/* SSLCommerz Local Gateway */}
                    <button 
                      onClick={() => handleSimulatePayment('SSLCommerz')}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-25/40 bg-just-black/50 hover:bg-just-black hover:border-surface-cream transition-all duration-300 cursor-pointer text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 font-mono text-[11px] font-bold">
                        SSL
                      </div>
                      <div className="flex flex-col">
                        <span className="text-caption-standard font-mori-bold text-surface-cream leading-tight">
                          SSLCommerz
                        </span>
                        <span className="text-[10px] font-mono text-surface-25 uppercase">
                          Local Credit Cards / Net
                        </span>
                      </div>
                    </button>

                    {/* bKash Mobile Wallet */}
                    <button 
                      onClick={() => handleSimulatePayment('bKash')}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-25/40 bg-just-black/50 hover:bg-just-black hover:border-surface-cream transition-all duration-300 cursor-pointer text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0 font-bold text-xs">
                        ৳ bK
                      </div>
                      <div className="flex flex-col">
                        <span className="text-caption-standard font-mori-bold text-surface-cream leading-tight">
                          bKash Wallet
                        </span>
                        <span className="text-[10px] font-mono text-surface-25 uppercase">
                          MFS Instant Payment
                        </span>
                      </div>
                    </button>

                    {/* Nagad Mobile Wallet */}
                    <button 
                      onClick={() => handleSimulatePayment('Nagad')}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-25/40 bg-just-black/50 hover:bg-just-black hover:border-surface-cream transition-all duration-300 cursor-pointer text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 font-bold text-xs">
                        ৳ Na
                      </div>
                      <div className="flex flex-col">
                        <span className="text-caption-standard font-mori-bold text-surface-cream leading-tight">
                          Nagad Wallet
                        </span>
                        <span className="text-[10px] font-mono text-surface-25 uppercase">
                          MFS Fast Transfer
                        </span>
                      </div>
                    </button>

                    {/* Rocket Mobile Wallet */}
                    <button 
                      onClick={() => handleSimulatePayment('Rocket')}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-surface-25/40 bg-just-black/50 hover:bg-just-black hover:border-surface-cream transition-all duration-300 cursor-pointer text-left group sm:col-span-2"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 font-bold text-xs">
                        ৳ Ro
                      </div>
                      <div className="flex flex-col">
                        <span className="text-caption-standard font-mori-bold text-surface-cream leading-tight">
                          Rocket Wallet
                        </span>
                        <span className="text-[10px] font-mono text-surface-25 uppercase">
                          DBBL Mobile Financial Service
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-4 mt-8 pt-4 border-t border-surface-25/10">
                <button 
                  onClick={handleBackToDetails}
                  className="w-1/2 py-4 border border-surface-25 text-surface-50 hover:text-surface-cream hover:border-surface-cream rounded-full text-body-small font-mori-bold uppercase tracking-wider transition-gsap cursor-pointer"
                >
                  Back to Details
                </button>
                <button 
                  onClick={handleClose}
                  className="w-1/2 py-4 text-surface-50 hover:text-surface-cream transition-gsap text-body-small font-mori-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success Confirmation Screen */}
          {step === 3 && placedOrder && (
            <div className="success-panel-body flex flex-col justify-center items-center text-center py-6 h-full min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-shockingly-green/20 border border-shockingly-green/50 flex items-center justify-center text-shockingly-green mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="text-[10px] font-mono uppercase tracking-widest text-shockingly-green mb-2">
                Simulated Transaction Approved
              </span>
              
              <h4 className="text-subheading font-mori-bold text-surface-cream mb-4">
                Thank You for Your Order!
              </h4>

              <p className="text-body-small text-surface-50 max-w-md mb-8 font-mori-regular leading-relaxed">
                Your payment of <span className="text-surface-cream font-mori-bold">${placedOrder.totalPrice.toFixed(2)}</span> has been successfully processed via <span className="text-surface-cream font-mori-bold">{placedOrder.paymentMethod}</span>. A developer license transmission is complete.
              </p>

              {/* Order summary table inside card */}
              <div className="w-full bg-just-black/40 border border-surface-25/30 rounded-xl p-5 mb-8 text-left max-w-lg font-mono">
                <div className="flex justify-between border-b border-surface-25/20 pb-3 mb-3 text-caption-standard">
                  <span className="text-surface-25">ORDER ID</span>
                  <span className="text-surface-cream font-bold">{placedOrder.orderId}</span>
                </div>
                <div className="flex justify-between pb-2 text-[11px]">
                  <span className="text-surface-25">Product:</span>
                  <span className="text-surface-cream">{placedOrder.product.name}</span>
                </div>
                <div className="flex justify-between pb-2 text-[11px]">
                  <span className="text-surface-25">Seats:</span>
                  <span className="text-surface-cream">{placedOrder.quantity} developer(s)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-surface-25">Timestamp:</span>
                  <span className="text-surface-cream">{placedOrder.date}</span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
                <button 
                  onClick={() => {
                    handleClose();
                    setTimeout(() => {
                      onViewOrders && onViewOrders();
                    }, 500);
                  }}
                  className="w-full sm:w-1/2 py-4 bg-shockingly-green text-just-black hover:bg-transparent hover:text-shockingly-green border border-shockingly-green rounded-full text-body-small font-mori-bold uppercase tracking-wider transition-gsap flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  View My Orders
                </button>
                <button 
                  onClick={handleClose}
                  className="w-full sm:w-1/2 py-4 border border-surface-25 text-surface-50 hover:text-surface-cream hover:border-surface-cream rounded-full text-body-small font-mori-bold uppercase tracking-wider transition-gsap cursor-pointer"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
