import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Trash2, Calendar, CreditCard, ShieldCheck, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import gsap from 'gsap';

export default function OrdersPage({ onBackToHome }) {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);

  // Load orders from localStorage
  const loadOrders = () => {
    try {
      const stored = localStorage.getItem('gsap_premium_orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Failed to parse orders from localStorage:', e);
      setOrders([]);
    }
  };

  useEffect(() => {
    loadOrders();
    
    // Smooth GSAP reveal for orders page
    gsap.fromTo('.orders-reveal-container', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out', stagger: 0.08 }
    );
  }, []);

  const handleClearHistory = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    localStorage.removeItem('gsap_premium_orders');
    setOrders([]);
    setConfirmClear(false);
  };

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.billing?.fullName && order.billing.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterMethod === 'all' || order.paymentMethod.toLowerCase() === filterMethod.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-just-black text-surface-cream py-24 px-6 relative overflow-hidden select-none">
      {/* Absolute background blurred blobs */}
      <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink/5 to-lilac/5 filter blur-3xl pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue/5 to-shockingly-green/5 filter blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Navigation / Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-surface-25/50 pb-8 mb-12">
          <div className="orders-reveal-container flex flex-col gap-2">
            <button 
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-caption-standard font-mono text-surface-50 hover:text-shockingly-green transition-gsap cursor-pointer mb-2 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Platform Home
            </button>
            <h1 className="text-heading-medium font-mori-bold text-surface-cream tracking-tight leading-none">
              Client License Ledger
            </h1>
            <p className="text-body-small text-surface-50 font-mori-regular">
              Securely synchronized commercial licenses and offline-first product subscriptions.
            </p>
          </div>

          <div className="orders-reveal-container flex items-center gap-4">
            {orders.length > 0 && (
              <button 
                onClick={handleClearHistory}
                onMouseLeave={() => setConfirmClear(false)}
                className={`px-5 py-3 border rounded-full text-body-small font-mori-bold uppercase tracking-wide flex items-center gap-2 transition-gsap cursor-pointer ${
                  confirmClear 
                    ? 'border-lipstick-pink bg-lipstick-pink/25 text-lipstick-pink font-extrabold' 
                    : 'border-red-500/30 hover:bg-red-500/10 text-red-400'
                }`}
                title="Reset local simulated orders database"
              >
                <Trash2 className="w-4 h-4" />
                {confirmClear ? 'Click again to confirm' : 'Clear Ledger'}
              </button>
            )}
            <button 
              onClick={onBackToHome}
              className="px-6 py-3 bg-surface-cream text-just-black hover:bg-transparent hover:text-surface-cream border border-surface-cream rounded-full text-body-small font-mori-bold uppercase tracking-wide transition-gsap cursor-pointer"
            >
              Browse Pricing
            </button>
          </div>
        </div>

        {/* Dashboard Grid / Stats overview */}
        {orders.length > 0 && (
          <div className="orders-reveal-container grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-off-black/40 border border-surface-25/30 rounded-xl p-5 flex flex-col justify-between">
              <span className="text-caption-standard font-mono text-surface-25 uppercase tracking-wider">
                Total Orders Placed
              </span>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-heading-small font-mori-bold text-surface-cream">
                  {orders.length}
                </span>
                <span className="text-caption-standard font-mono text-surface-25">transmissions</span>
              </div>
            </div>

            <div className="bg-off-black/40 border border-surface-25/30 rounded-xl p-5 flex flex-col justify-between">
              <span className="text-caption-standard font-mono text-surface-25 uppercase tracking-wider">
                Total Invested Capital
              </span>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-heading-small font-mori-bold text-shockingly-green">
                  ${orders.reduce((acc, order) => acc + order.totalPrice, 0).toFixed(2)}
                </span>
                <span className="text-caption-standard font-mono text-surface-25">USD</span>
              </div>
            </div>

            <div className="bg-off-black/40 border border-surface-25/30 rounded-xl p-5 flex flex-col justify-between">
              <span className="text-caption-standard font-mono text-surface-25 uppercase tracking-wider">
                Active Seats Deployed
              </span>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-heading-small font-mori-bold text-blue">
                  {orders.reduce((acc, order) => acc + order.quantity, 0)}
                </span>
                <span className="text-caption-standard font-mono text-surface-25">developers</span>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters Section */}
        {orders.length > 0 && (
          <div className="orders-reveal-container bg-off-black/20 border border-surface-25/30 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-25" />
              <input 
                type="text" 
                placeholder="Search orders by ID, plan name, or developer name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-just-black/40 border border-surface-25/40 focus:border-surface-cream text-surface-cream rounded-full pl-11 pr-5 py-3 text-body-small outline-none transition-gsap font-mori-regular"
              />
            </div>

            {/* Payment Method Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
              <span className="text-caption-standard font-mono text-surface-25 uppercase flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter:
              </span>
              
              <div className="flex items-center gap-1.5 bg-just-black/60 rounded-full p-1 border border-surface-25/20">
                {['all', 'stripe', 'sslcommerz', 'bkash', 'nagad', 'rocket'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setFilterMethod(method)}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wide transition-gsap cursor-pointer ${
                      filterMethod === method
                        ? 'bg-surface-cream text-just-black font-bold'
                        : 'text-surface-50 hover:text-surface-cream hover:bg-white/5'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders List Container */}
        <div className="flex flex-col gap-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => (
              <div 
                key={order.orderId}
                className="orders-reveal-container bg-off-black/40 border border-surface-25/40 hover:border-surface-cream/30 rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden"
              >
                {/* Decorative mini ambient light accent */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-surface-cream/5 rounded-full filter blur-xl pointer-events-none" />

                {/* Card Top Row: Order ID, Date & Payment Method */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-25/20 pb-4 mb-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-caption-standard font-mono text-surface-25 uppercase">
                      Order Ledger
                    </span>
                    <span className="font-mono text-body-small text-surface-cream font-bold px-2.5 py-1 bg-just-black/60 rounded border border-surface-25/50">
                      {order.orderId}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-shockingly-green/10 border border-shockingly-green/30 text-shockingly-green text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> Transmitted
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-caption-standard font-mono text-surface-50">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.date}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-surface-25/10">
                      <CreditCard className="w-3.5 h-3.5" />
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Card Body: Product image, Details & Price breakdown */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex items-center gap-5">
                    {/* Glassmorphism Product Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-surface-25/40 shrink-0 bg-just-black">
                      <img 
                        src={order.product?.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80'} 
                        alt={order.product?.name || 'Package'} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="text-body-large font-mori-bold text-surface-cream">
                        {order.product?.name} License Key
                      </h3>
                      <p className="text-body-small text-surface-50 max-w-md font-mori-regular line-clamp-1">
                        {order.product?.description}
                      </p>
                      
                      {/* Developer Details */}
                      {order.billing && (
                        <span className="text-[11px] font-mono text-surface-25">
                          Assigned to: <span className="text-surface-50 font-bold">{order.billing.fullName}</span> ({order.billing.email})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline md:items-end flex-col sm:flex-row md:flex-col gap-2 sm:gap-6 md:gap-1.5 w-full md:w-auto border-t md:border-t-0 border-surface-25/10 pt-4 md:pt-0">
                    <div className="flex flex-col text-left md:text-right font-mono text-caption-standard">
                      <span className="text-surface-25">DELETABLE SEATS</span>
                      <span className="text-surface-cream">{order.quantity} x Developer Seat(s)</span>
                    </div>

                    <div className="flex items-baseline gap-1 bg-just-black/40 border border-surface-25/20 rounded-lg px-4 py-2">
                      <span className="text-body-small font-mori-regular text-surface-50">Total Paid:</span>
                      <span className="text-body-large font-mori-bold text-shockingly-green">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-mono text-surface-25 uppercase">USD</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Gateway Info Hook for Devs */}
                <div className="mt-4 pt-4 border-t border-surface-25/10 flex items-center justify-between text-[10px] font-mono text-surface-25">
                  <span>SYSTEM_GATEWAY_CALLBACK_CODE: 200_SUCCESS_STATE</span>
                  <span>PRE-INTEGRATED UI MODULE READY FOR REAL ENDPOINT PROXY</span>
                </div>

              </div>
            ))
          ) : (
            /* Beautiful empty state */
            <div className="orders-reveal-container bg-off-black/10 border border-dashed border-surface-25/50 rounded-2xl p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-surface-25/30 flex items-center justify-center text-surface-50 mb-6">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h2 className="text-subheading font-mori-bold text-surface-cream mb-3">
                No Simulated Purchases Found
              </h2>
              <p className="text-body-small text-surface-50 mb-8 font-mori-regular max-w-md leading-relaxed">
                Your sandbox transmission ledger is currently empty. Complete any license acquisition inside the Pricing section to view transactions.
              </p>
              <button 
                onClick={onBackToHome}
                className="px-6 py-3.5 bg-surface-cream text-just-black hover:bg-transparent hover:text-surface-cream border border-surface-cream rounded-full text-body-small font-mori-bold uppercase tracking-wider transition-gsap cursor-pointer inline-flex items-center gap-2"
              >
                Go to Pricing Plans
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
