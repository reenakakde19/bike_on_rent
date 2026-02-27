import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, PlusCircle, User, ChevronDown, Star, Shield, Zap, Clock } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import scooty from "../assets/scooty.png"; // ← change path if needed

const testimonials = [
  { n: "Rahul Sharma", c: "Mumbai", t: "Found an Activa for ₹399/day — clean, easy handover. Will rent again!", r: 5 },
  { n: "Priya Desai", c: "Pune", t: "Super smooth booking. The owner was professional and the bike was perfect.", r: 5 },
  { n: "Arjun Mehta", c: "Bangalore", t: "Used it for a weekend trip. Saved so much vs taxi. Highly recommend!", r: 5 },
  { n: "Sneha Patil", c: "Nagpur", t: "Loved how easy it was to list my bike and start earning!", r: 4 },
  { n: "Vikram Rao", c: "Hyderabad", t: "Great community, verified riders and owners. Felt safe throughout.", r: 5 },
  { n: "Anjali Nair", c: "Chennai", t: "The app made the whole experience seamless from booking to return.", r: 5 },
];

const Counter = ({ end, suffix, decimal }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = end / (2000 / 16);
    const timer = setInterval(() => {
      cur += step;
      if (cur >= end) { cur = end; clearInterval(timer); }
      setCount(decimal ? parseFloat(cur.toFixed(1)) : Math.floor(cur));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, decimal]);
  return <span ref={ref} className="text-4xl font-extrabold text-[#20B2AA]">{count}{suffix}</span>;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [showLocation, setShowLocation] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const cities = ["Mumbai", "Pune", "Nagpur", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"];
  const filtered = cities.filter(c => c.toLowerCase().includes(searchCity.toLowerCase()));

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const tickerItems = [
    "500+ Active Bikes", "★ 4.9 Rating", "1000+ Happy Riders",
    "24/7 Support", "₹399/day Starting", "Zero Hassle", "Trusted Community"
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #20B2AA; border-radius: 10px; }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes fc1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fc2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fc3 { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-6px)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .float-bike { animation: floatY 5s ease-in-out infinite; }
        .fc-tl { animation: fc1 5s ease-in-out infinite; }
        .fc-tr { animation: fc2 6s ease-in-out infinite 0.6s; }
        .fc-b  { animation: fc3 4.5s ease-in-out infinite 1s; }
        .ticker-track { display:flex; width:max-content; animation:marquee 25s linear infinite; }
        .card-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-lift:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(32,178,170,0.12); }
        .pill-dot { animation: pulse 2s infinite; }
        .avail-dot { animation: pulse 2s infinite; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-[6%] transition-all duration-300 ${
          scrolled
            ? "bg-white/92 backdrop-blur-xl shadow-sm border-b border-slate-100"
            : "bg-white/80 backdrop-blur-md border-b border-slate-100/50"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#20B2AA] rounded-[10px] flex items-center justify-center text-white font-extrabold text-base">
            B
          </div>
          <span className="text-[18px] font-extrabold text-[#0F172A]">
            BIKE<span className="text-[#20B2AA]">ON</span>RENT
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-2">

          {/* Location */}
          <div className="relative">
            <button
              onClick={() => setShowLocation(!showLocation)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-sm font-semibold transition-all ${
                showLocation ? "bg-teal-50 text-[#20B2AA]" : "text-slate-500 hover:bg-teal-50 hover:text-[#20B2AA]"
              }`}
            >
              <MapPin size={14} className="text-[#20B2AA]" />
              <span>{selectedCity || "Select City"}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${showLocation ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showLocation && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 w-52 z-50"
                >
                  <div className="relative">
                    <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchCity}
                      onChange={e => setSearchCity(e.target.value)}
                      placeholder="Search city..."
                      className="w-full pl-7 pr-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 outline-none focus:border-[#20B2AA]"
                      style={{ fontFamily: "inherit" }}
                    />
                  </div>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {filtered.map((city, i) => (
                      <div
                        key={i}
                        onClick={() => { setSelectedCity(city); setShowLocation(false); setSearchCity(""); }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-teal-50 hover:text-[#20B2AA] text-sm font-medium text-slate-600 cursor-pointer transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#20B2AA]" />
                        {city}
                      </div>
                    ))}
                    {filtered.length === 0 && (
                      <p className="text-center text-slate-400 text-xs py-3">No city found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => navigate("/publish-bike")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-sm font-semibold text-slate-500 hover:bg-teal-50 hover:text-[#20B2AA] transition-all"
          >
            <PlusCircle size={14} />
            Publish Bike
          </button>

          <button className="flex items-center gap-1.5 bg-[#20B2AA] text-white px-4 py-2 rounded-[10px] text-sm font-bold hover:bg-[#1a9e97] transition-all shadow-md shadow-teal-200">
            <User size={14} />
            Profile
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex items-center pt-24 pb-16 px-[6%] relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, #f0fdfa 0%, #ffffff 55%)" }}
      >
        {/* Soft blob */}
        <div
          className="absolute -top-32 -right-48 w-[560px] h-[560px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(32,178,170,0.12) 0%, transparent 68%)" }}
        />

        <div className="max-w-[1160px] mx-auto w-full flex flex-col lg:flex-row items-center gap-14 relative z-10">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
            className="flex-1 max-w-[520px]"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 bg-teal-50 border border-[#b2e8e5] px-3.5 py-1.5 rounded-full mb-6"
            >
              <div className="pill-dot w-1.5 h-1.5 bg-[#20B2AA] rounded-full" />
              <span className="text-[11px] font-bold text-[#20B2AA] tracking-wide">India's Trusted Bike Rental Platform</span>
            </motion.div>

            <h1 className="text-[clamp(38px,5vw,62px)] font-extrabold leading-[1.08] tracking-tight text-[#0F172A]">
              Ride Smarter.<br />
              Ride <span className="text-[#20B2AA]">Affordable.</span>
            </h1>

            <p className="mt-5 text-[16px] text-slate-500 leading-[1.7]">
              BIKEONRENT connects riders and bike owners seamlessly.<br />
              <strong className="text-slate-600 font-semibold">Flexible rentals. Trusted community. Zero hassle.</strong>
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(selectedCity ? `/bikes?city=${selectedCity}` : "/bikes")}
                className="group flex items-center gap-2 bg-[#20B2AA] text-white px-6 py-3.5 rounded-xl text-[15px] font-bold shadow-lg shadow-teal-200 hover:bg-[#1a9e97] transition-all"
              >
                Explore Bikes
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-[15px] font-semibold text-slate-600 border-[1.5px] border-slate-200 hover:border-[#20B2AA] hover:text-[#20B2AA] transition-all"
              >
                How It Works
              </motion.button>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-3 mt-7">
              <div className="flex">
                {["#20B2AA", "#178f89", "#0d6e69", "#0a5a56"].map((bg, i) => (
                  <div
                    key={i}
                    className="w-[30px] h-[30px] rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-[11px]"
                    style={{ backgroundColor: bg, marginLeft: i === 0 ? 0 : -8 }}
                  >
                    {["R","P","A","S"][i]}
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-slate-500">
                <strong className="text-slate-700 font-bold">1,000+</strong> happy riders this month
              </p>
            </div>
          </motion.div>

          {/* Right — bike */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.8, 0.25, 1] }}
            className="flex-1 max-w-[480px] w-full relative min-h-[360px] flex justify-center items-center"
          >
            {/* Circle bg */}
            <div className="absolute w-[340px] h-[340px] rounded-full bg-teal-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            {/* Bike image */}
            <img
              src={scooty}
              alt="Honda Activa"
              className="float-bike relative z-10 w-full max-w-[400px] object-contain drop-shadow-2xl"
              style={{ filter: "drop-shadow(0 20px 40px rgba(32,178,170,0.2))" }}
            />

            {/* Floating card — top left */}
            <div className="fc-tl absolute top-4 left-0 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star size={12} fill="#20B2AA" className="text-[#20B2AA]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Top Rated</p>
                  <p className="text-[12px] font-bold text-[#0F172A]">Honda Activa 6G</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mt-1.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={9} fill="#20B2AA" className="text-[#20B2AA]" />)}
                <span className="text-[9px] text-slate-400 ml-1">4.9</span>
              </div>
            </div>

            {/* Floating card — top right */}
            <div className="fc-tr absolute top-12 right-0 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 w-36">
              <p className="text-[10px] text-slate-400 font-medium">Starting From</p>
              <p className="text-[20px] font-extrabold text-[#20B2AA]">₹399</p>
              <p className="text-[10px] text-slate-400">per day</p>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="avail-dot w-[5px] h-[5px] bg-green-400 rounded-full" />
                <span className="text-[10px] text-slate-500">Available now</span>
              </div>
            </div>

            {/* Floating card — bottom */}
            <div className="fc-b absolute bottom-4 left-1/2 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 flex items-center gap-2.5 whitespace-nowrap"
              style={{ transform: "translateX(-50%)" }}
            >
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={14} className="text-[#20B2AA]" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#0F172A]">Fully Verified</p>
                <p className="text-[10px] text-slate-400">Bikes & Riders</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30">
          <span className="text-[11px] text-slate-500">Scroll</span>
          <div className="w-5 h-7 border-2 border-slate-400 rounded-full flex justify-center pt-1">
            <div className="w-1 h-1.5 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="bg-[#20B2AA] py-3 overflow-hidden">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 px-5 whitespace-nowrap">
              <span className="text-[13px] font-semibold text-white/90">{item}</span>
              <span className="text-white/25 text-base">◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-[6%] bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-bold text-[#20B2AA] tracking-[2px] uppercase mb-2">Simple Process</p>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold tracking-tight text-[#0F172A]">How It Works</h2>
          <p className="text-[15px] text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">Three simple steps to start riding or earning</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
          {[
            { icon: "🚲", num: "01", title: "List Your Bike", desc: "Publish your bike details and set your price in minutes. You stay in full control of availability." },
            { icon: "📅", num: "02", title: "Get Bookings", desc: "Riders discover and book your bike instantly. Get notified in real time for every request." },
            { icon: "💰", num: "03", title: "Earn Smartly", desc: "Receive secure payments and track your earnings easily. Money goes directly to your account." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="card-lift relative bg-white border-[1.5px] border-slate-100 rounded-[20px] p-8 hover:border-[#b2e8e5] overflow-hidden"
            >
              <span className="absolute top-4 right-5 text-[52px] font-extrabold text-[#20B2AA]/[0.06] leading-none">{item.num}</span>
              <div className="text-[38px] mb-4">{item.icon}</div>
              <h3 className="text-[17px] font-bold text-[#0F172A] mb-2">{item.title}</h3>
              <p className="text-[14px] text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-24 px-[6%] bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-bold text-[#20B2AA] tracking-[2px] uppercase mb-2">Why Choose Us</p>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold tracking-tight text-[#0F172A]">Why Choose BIKEONRENT?</h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-4 max-w-[1000px] mx-auto">
          {[
            { end: 500, suffix: "+", label: "Active Bikes", hint: "Ready to ride today", icon: <Zap size={20} className="text-[#20B2AA]" /> },
            { end: 1000, suffix: "+", label: "Happy Riders", hint: "And growing fast", icon: <Star size={20} className="text-[#20B2AA]" /> },
            { value: "24/7", label: "Customer Support", hint: "Always here for you", icon: <Clock size={20} className="text-[#20B2AA]" /> },
            { end: 4.9, suffix: " ⭐", decimal: true, label: "Average Rating", hint: "Verified reviews", icon: <Shield size={20} className="text-[#20B2AA]" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-lift bg-white border-[1.5px] border-slate-100 rounded-[18px] p-6 hover:border-[#b2e8e5]"
            >
              <div className="w-10 h-10 bg-teal-50 rounded-[10px] flex items-center justify-center mb-4">{stat.icon}</div>
              <div className="mb-1.5">
                {stat.end
                  ? <Counter end={stat.end} suffix={stat.suffix} decimal={stat.decimal} />
                  : <span className="text-4xl font-extrabold text-[#20B2AA]">{stat.value}</span>
                }
              </div>
              <p className="text-[14px] font-bold text-[#0F172A]">{stat.label}</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{stat.hint}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-3.5 max-w-[1000px] mx-auto mt-4">
          {[
            { icon: "🔒", title: "Secure Payments", desc: "Encrypted & protected" },
            { icon: "📍", title: "8 Cities & Growing", desc: "Mumbai, Pune, Delhi & more" },
            { icon: "⚡", title: "Instant Booking", desc: "Confirmed in under 2 mins" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-lift bg-white border-[1.5px] border-slate-100 rounded-[14px] p-4 flex items-center gap-3 hover:border-[#b2e8e5]"
            >
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-[13px] font-bold text-[#0F172A]">{f.title}</p>
                <p className="text-[12px] text-slate-400 mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-[6%] bg-white overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-bold text-[#20B2AA] tracking-[2px] uppercase mb-2">What Riders Say</p>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold tracking-tight text-[#0F172A]">Real Experiences</h2>
          <p className="text-[15px] text-slate-500 mt-3">From verified riders across India</p>
        </motion.div>

        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div style={{ display: "flex", gap: "16px", animation: "marquee 32s linear infinite", width: "max-content" }}>
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="bg-slate-50 border-[1.5px] border-slate-100 rounded-[18px] p-5" style={{ width: "270px", flexShrink: 0 }}>
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} fill={s <= t.r ? "#20B2AA" : "transparent"} className="text-[#20B2AA]" />
                  ))}
                </div>
                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">"{t.t}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#20B2AA] rounded-[9px] flex items-center justify-center text-white font-extrabold text-[12px] flex-shrink-0">
                    {t.n[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#0F172A]">{t.n}</p>
                    <p className="text-[11px] text-slate-400">{t.c} · Verified Rider</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-[6%] bg-teal-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-[820px] mx-auto bg-[#20B2AA] rounded-[28px] p-14 text-center relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-16 w-60 h-60 bg-white/[0.07] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-8 w-40 h-40 bg-white/[0.05] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-[clamp(26px,3.5vw,42px)] font-extrabold text-white tracking-tight">Ready to Ride?</h2>
            <p className="text-white/80 text-[15px] mt-3 mb-7 max-w-md mx-auto">
              Join 1,000+ riders saving money on daily commutes and weekend adventures.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/bikes")}
                className="bg-white text-[#20B2AA] px-6 py-3.5 rounded-xl font-bold text-[14px] shadow-lg hover:shadow-xl transition-all"
              >
                Browse Bikes Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/publish-bike")}
                className="border-2 border-white/40 text-white px-6 py-3.5 rounded-xl font-bold text-[14px] hover:border-white transition-all"
              >
                List Your Bike
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0F172A] pt-14 pb-7 px-[6%]">
        <div className="grid md:grid-cols-3 gap-12 pb-10 border-b border-white/[0.06] max-w-[1000px] mx-auto">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 bg-[#20B2AA] rounded-[9px] flex items-center justify-center text-white font-extrabold text-sm">B</div>
              <span className="text-[17px] font-extrabold text-white">BIKE<span className="text-[#20B2AA]">ON</span>RENT</span>
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-[200px]">
              India's trusted peer-to-peer bike rental platform. Ride smarter, earn better.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 tracking-[1.5px] uppercase mb-3.5">Cities</p>
            <div className="flex flex-col gap-2.5">
              {["Mumbai", "Pune", "Bangalore", "Delhi", "Hyderabad"].map(c => (
                <span key={c} className="text-[13px] text-slate-500 hover:text-[#20B2AA] cursor-pointer transition-colors">{c}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 tracking-[1.5px] uppercase mb-3.5">Company</p>
            <div className="flex flex-col gap-2.5">
              {["About Us", "Publish Bike", "Support", "Privacy Policy"].map(c => (
                <span key={c} className="text-[13px] text-slate-500 hover:text-[#20B2AA] cursor-pointer transition-colors">{c}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-5 flex-wrap gap-3 max-w-[1000px] mx-auto">
          <span className="text-[13px] text-slate-600">© 2026 BIKEONRENT. Built for modern riders.</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[12px] text-slate-500">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;