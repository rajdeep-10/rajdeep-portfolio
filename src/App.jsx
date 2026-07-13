import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from "./lib/AuthContext";
import AdminLoginModal from "./components/AdminLoginModal";
import CVButton from "./components/CVButton";
import HoverVideoReveal from "./components/HoverVideoReveal";
import { useSiteContent } from "./lib/useSiteContent";

/* ── GLOBAL STYLES ─────────────────────────────────────────────────────────── */
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800;900&family=Chakra+Petch:wght@700&family=Teko:wght@600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { background: #0C0C0C; font-family: 'Kanit', sans-serif; }
  html { scroll-behavior: smooth; }
  .hero-heading {
    background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .white-heading {
    background: linear-gradient(180deg, #888 0%, #fff 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(120,120,120,0.25); border-radius: 999px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(120,120,120,0.45); }

  /* About section responsive grid */
  @media (max-width: 768px) {
    .about-grid { grid-template-columns: 1fr !important; }
  }

  /* Experience showcase panel — stack sidebar above content on mobile */
  @media (max-width: 760px) {
    .exp-panel-grid { flex-direction: column !important; height: auto !important; }
    .exp-sidebar {
      width: 100% !important;
      flex-direction: row !important;
      overflow-x: auto !important;
      border-right: none !important;
      border-bottom: 1px solid rgba(255,255,255,0.06) !important;
    }
    .exp-sidebar > div {
      flex: 1 0 auto !important;
      min-width: 180px !important;
      height: 90px !important;
    }
  }

  /* ── GLASSMORPHISM UTILITIES ── */
  .glass-dark {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .glass-card {
    background: rgba(13,13,20,0.65);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.10);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07);
  }

  /* ── EXPERIENCE SECTION PERFORMANCE ── */
  #experience {
    transform: translateZ(0);
  }
  .glass-tag {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.13);
  }
  .glass-highlight {
    background: rgba(220,30,30,0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(220,30,30,0.2);
    box-shadow: 0 4px 24px rgba(220,30,30,0.1), inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .glass-green {
    background: rgba(0,200,100,0.07);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0,200,100,0.2);
    box-shadow: 0 4px 16px rgba(0,200,100,0.08);
  }
  .glass-amber {
    background: rgba(255,180,0,0.07);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,180,0,0.2);
    box-shadow: 0 4px 16px rgba(255,180,0,0.08);
  }
  .badge-do-first {
    background: rgba(0,200,100,0.15);
    border: 1px solid rgba(0,200,100,0.35);
    color: #4fffaa;
    backdrop-filter: blur(8px);
  }
  .badge-unique {
    background: rgba(255,100,80,0.15);
    border: 1px solid rgba(255,100,80,0.35);
    color: #ff8070;
    backdrop-filter: blur(8px);
  }
  .badge-jaw {
    background: rgba(255,180,0,0.15);
    border: 1px solid rgba(255,180,0,0.35);
    color: #ffcc44;
    backdrop-filter: blur(8px);
  }
  .week-tag {
    background: rgba(255,200,60,0.1);
    border: 1px solid rgba(255,200,60,0.25);
    color: #ffd060;
    backdrop-filter: blur(8px);
  }

  /* ── CTF REDESIGN KEYFRAMES ── */
  @keyframes ticker-scroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes hud-pulse {
    0%, 100% { opacity: 0.55; box-shadow: 0 0 5px currentColor; }
    50%       { opacity: 1;    box-shadow: 0 0 10px currentColor; }
  }

  /* ── CERT CAROUSEL ── */
  @keyframes cert-ambient-breathe {
    0%, 100% { opacity: 0.55; transform: scale(1); }
    50%       { opacity: 0.8;  transform: scale(1.04); }
  }
  @keyframes cert-shimmer {
    0%   { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%)  skewX(-12deg); }
  }
  @keyframes cert-fan-in {
    0%   { opacity: 0; transform: translateY(60px) scale(0.88); }
    100% { opacity: 1; transform: translateY(0px)  scale(1); }
  }
  @keyframes cert-detail-in {
    0%   { opacity: 0; transform: translateY(14px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .cert-shimmer-line {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    overflow: hidden;
    border-radius: inherit;
    pointer-events: none;
  }
  .cert-shimmer-line::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%);
    animation: cert-shimmer 3.2s ease-in-out infinite;
    animation-delay: var(--shimmer-delay, 0s);
  }

  /* ── SKILLS HUD PANEL ── */
  @keyframes hud-shimmer-sweep {
    0%   { transform: translateX(-120%) skewX(-14deg); }
    100% { transform: translateX(220%)  skewX(-14deg); }
  }
  @keyframes hud-scan-pulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.75; }
  }
  .hud-shimmer-active {
    position: absolute; inset: 0; overflow: hidden; pointer-events: none;
  }
  .hud-shimmer-active::after {
    content: '';
    position: absolute; top: 0; left: 0; width: 45%; height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
    animation: hud-shimmer-sweep 3.6s ease-in-out infinite;
  }
  @media (max-width: 720px) {
    .hud-grid-cols { grid-template-columns: 1fr !important; }
    .hud-corner-mark { display: none !important; }
  }
`;

/* ── FADE IN ────────────────────────────────────────────────────────────────── */
const FadeIn = ({ children, delay = 0, duration = 0.7, x = 0, y = 30, style = {}, className = "" }) => (
  <motion.div
    className={className}
    style={style}
    initial={{ opacity: 0, x, y }}
    whileInView={{ opacity: 1, x: 0, y: 0 }}
    viewport={{ once: false, margin: "50px", amount: 0 }}
    transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
  >
    {children}
  </motion.div>
);

/* ── TOGETHER FILL TEXT ─────────────────────────────────────────────────────── */
/* Sub-component so hooks are always called at the top level of a component */
const TogetherChar = ({ char, scrollYProgress, start, end }) => {
  const op    = useTransform(scrollYProgress, [start, end], [0.08, 1]);
  const grey  = useTransform(scrollYProgress, [start, end], [220, 150]);
  const color = useTransform(grey, v => `rgb(${Math.round(v)},${Math.round(v)},${Math.round(v)})`);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span aria-hidden="true" style={{ color: "transparent" }}>{char}</span>
      <motion.span style={{ position: "absolute", top: 0, left: 0, color, opacity: op }}>
        {char}
      </motion.span>
    </span>
  );
};

const TogetherText = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.3"] });
  const text = "Together";
  const chars = text.split("");
  const total = chars.length;
  return (
    <h2
      ref={ref}
      aria-label={text}
      style={{
        fontFamily: "'Teko', sans-serif", fontWeight: 700, textTransform: "uppercase",
        lineHeight: 1, letterSpacing: "-0.01em",
        fontSize: "clamp(4rem,15.5vw,172px)",
        marginBottom: "clamp(2.5rem,5vw,4rem)",
        position: "relative",
        display: "block",
        userSelect: "none",
      }}
    >
      {chars.map((char, i) => {
        const start = (i / total) * 0.7;
        const end   = start + (1 / total) * 1.4;
        return (
          <TogetherChar
            key={char + i}
            char={char}
            scrollYProgress={scrollYProgress}
            start={start}
            end={end}
          />
        );
      })}
    </h2>
  );
};

/* ── MAGNET ─────────────────────────────────────────────────────────────────── */
const Magnet = ({ children, padding = 150, strength = 3 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fn = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < padding + r.width / 2) { x.set(dx / strength); y.set(dy / strength); }
      else { x.set(0); y.set(0); }
    };
    const reset = () => { x.set(0); y.set(0); };
    window.addEventListener("mousemove", fn);
    window.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("mousemove", fn);
      window.removeEventListener("mouseleave", reset);
    };
  }, [padding, strength, x, y]);
  return <motion.div ref={ref} style={{ x: sx, y: sy, willChange: "transform" }}>{children}</motion.div>;
};

/* ── ANIMATED TEXT ───────────────────────────────────────────────────────────── */
/* Sub-component so hooks are always called at the top level of a component */
const AnimatedChar = ({ char, scrollYProgress, start, end }) => {
  const op = useTransform(scrollYProgress, [start * 0.8, end], [0.15, 1]);
  const display = char === " " ? "\u00A0" : char;
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span aria-hidden="true" style={{ opacity: 0 }}>{display}</span>
      <motion.span style={{ position: "absolute", top: 0, left: 0, opacity: op, color: "#D7E2EA" }}>
        {display}
      </motion.span>
    </span>
  );
};

const AnimatedText = ({ text, style = {} }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });
  const chars = text.split("");
  const total = chars.length;
  return (
    <p ref={ref} style={{ position: "relative", ...style }}>
      {chars.map((char, i) => {
        const start = i / total;
        const end   = (i + 1) / total;
        return (
          <AnimatedChar
            key={char + i}
            char={char}
            scrollYProgress={scrollYProgress}
            start={start}
            end={end}
          />
        );
      })}
    </p>
  );
};

/* ── CONTACT BUTTON ─────────────────────────────────────────────────────────── */
const ContactButton = () => (
  <motion.a
    href="mailto:rajdeepgoswami383@gmail.com"
    whileHover={{ scale: 1.05, boxShadow: "0px 6px 28px rgba(234,67,53,0.45)" }}
    whileTap={{ scale: 0.95 }}
    style={{
      display: "inline-flex", alignItems: "center", gap: "0.45rem",
      background: "linear-gradient(135deg, #EA4335 0%, #FBBC05 35%, #34A853 65%, #4285F4 100%)",
      boxShadow: "0px 4px 18px rgba(234,67,53,0.3)",
      outline: "none",
      borderRadius: "9999px", color: "#fff",
      fontFamily: "Kanit, sans-serif", fontWeight: 600,
      textTransform: "uppercase", letterSpacing: "0.15em",
      border: "none", cursor: "pointer", textDecoration: "none",
      padding: "clamp(10px,1.5vw,16px) clamp(28px,4vw,48px)",
      fontSize: "clamp(0.65rem,1.2vw,0.9rem)",
      transition: "box-shadow 0.2s",
    }}
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="white"/>
    </svg>
    Gmail
  </motion.a>
);

/* ══════════════════════════════════════════════════════════════════════════════
   1. HERO SECTION  —  CyberShield-inspired layout · Black & White aesthetic
══════════════════════════════════════════════════════════════════════════════ */

const CHAR_IMG_B64 = "data:image/jpeg;base64,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";

const LOGO_IMG_B64 = "data:image/png;base64,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jv+jhIKUEtRG3xl+CP7n/N+8L33acLoHAGJqzVn+a+7Wf9OdbJum7krvULz88suHhoa6u7u/e+utkx/ClIt2jm633XZbZ2eXpmkvXbB7kvkzn/mMlPLKK68AgM9+9hYp5Q033OAJksNCCieKaCAoTEcC7577jZ+fMeTXQt4ji8rOfvBSty6yCGASvWWTIyaIAFgYKrrnorGvnf5IUUEZITogAjIg6viFS4AIGApE/3DOwO1rnioL1wEhiKpCQoCkNDjj24vX/9+6TMxX4Y1mdnTlD1btWlx23m/P6PnO2Y8pioZAlpdd9OtliVnh06YpMuhpRoyxfXv3fvOb33zrlVdmMpnq6uoX0Jgm25e//OXu7m5d1733UErLysqqqqoqKipKS0tLy0orKiq8PLOp0oIxBgA/uP32dDr93e9+V0r56U9/GmD88xdob5nz/35+WjKkR7xfF5au/e0Z6ebS1SrTAmqpzvy6GlCoz9OkKFIAuLDuur+eJSsjszxmRSBeCWSvBpsnw+cVrvjR6v3zC98AABNVLcfvDJ4VPuPr83bMDq32emwpPPeRC2VD5MwFhRc/cLa8quHzALCk+KLfnZFtLj4Djl0437EU0V4psmuuvqamtvbWW2/t7+//1re+/alPferGG2/0COydwaFQ6Oabby4sjAkhOBcAEItGr77mmttvv900TcaY67qNDQ2PPf64qiiccyElIcQfCGzcsGHNmjXeSwBASuCcM8be/4EPVNfUfvjDH/7ed7/75S9/WVEUx3E85UVK0Vi0aE3svQqlWTftuiIc8ElOz6284an4X7J2ihLGhatQ5pjKTbPvybljhhpIO8mQW9YuHvzSxism0U2Fl21pb0ukRwiSCdUapXefmRwvzWFAEbULB3PtBIkAd/LGTIIk4/R3iacLlCJvc9o2OTiSUJncMXzvL9o//ZbS/94+9phjqyTnc+1jKZnZMWRfKYWu65/73Od+/JMfezco3PKft3zrW9/6yle+0tXVRQjxjBB/wP++970vn8/39fUBgKqqqVTylltu+c53voOIggsA6Ovvu/F9NwouhBSMMkoJII6MjCiMOc82k1zXXbduXUvLoj179px/wYU/+OEPW1tbKaWcj9f0rQzMazbePZJvjSmmZG45Xagx9Y8Hv3Bv961ccEYoANjcDhQojw3dO5bryfMcZVTn/mH3gFew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";

const HERO_CSS = `
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes pulse-live { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.5)} 50%{box-shadow:0 0 0 6px rgba(255,255,255,0)} }
  @keyframes terminal-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes bar-grow { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }
  @keyframes grid-fade { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
  .cursor-blink { animation: blink 1s step-end infinite; }
  .live-pulse { animation: pulse-live 2.5s ease-in-out infinite; }
  .terminal-cur { animation: terminal-cursor 1s step-end infinite; }
  .hero-nav-link {
    color: rgba(255,255,255,0.5);
    font-size: 0.78rem; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.14em;
    text-decoration: none; transition: color 0.2s;
  }
  .hero-nav-link:hover { color: #fff; }
  .hero-nav-link.active { color: #fff; }
  .service-pill {
    display: flex; align-items: center; gap: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 3px;
    padding: 14px 20px;
    color: rgba(255,255,255,0.7);
    font-size: 0.72rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    transition: all 0.2s; cursor: default; flex: 1;
    background: rgba(255,255,255,0.03);
  }
  .service-pill:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.25);
    color: #fff;
  }
  .follow-link {
    color: rgba(255,255,255,0.4);
    font-size: 0.58rem; letter-spacing: 0.25em; text-transform: uppercase;
    text-decoration: none; writing-mode: vertical-rl;
    transform: rotate(180deg); transition: color 0.2s;
  }
  .follow-link:hover { color: rgba(255,255,255,0.8); }
  .social-icon-link {
    color: rgba(255,255,255,0.4);
    transition: color 0.2s, filter 0.2s;
    display: flex; cursor: pointer; text-decoration: none;
  }
  .social-icon-link:hover {
    color: rgba(255,255,255,0.85);
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.45));
  }
  .hero-tech-bar {
    position: absolute;
    left: clamp(1rem, 2.25vw, 34px);
    right: clamp(1rem, 2.25vw, 34px);
    bottom: clamp(12px, 1.6vw, 16px);
    min-height: clamp(76px, 8vw, 82px);
    z-index: 28;
    display: grid;
    grid-template-columns: minmax(540px, 0.93fr) minmax(650px, 1fr);
    align-items: stretch;
    background: linear-gradient(180deg, rgba(12,13,15,0.74) 0%, rgba(4,5,6,0.84) 100%);
    border: 1px solid rgba(255,255,255,0.25);
    box-shadow: 0 24px 70px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.07);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
  }
  .hero-tech-panel {
    min-width: 0;
    display: flex;
    align-items: center;
  }
  .hero-tech-panel-left {
    gap: clamp(2rem, 3.15vw, 3rem);
    padding: 0 clamp(1.5rem, 2.25vw, 2rem);
  }
  .hero-tech-panel-right {
    gap: clamp(1.55rem, 1.9vw, 1.75rem);
    padding: 0 clamp(1.35rem, 1.7vw, 1.6rem) 0 clamp(1.4rem, 1.9vw, 1.85rem);
    border-left: 1px solid rgba(255,255,255,0.12);
  }
  .hero-tech-label {
    color: rgba(255,255,255,0.52);
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    white-space: nowrap;
    line-height: 1;
    flex: 0 0 auto;
  }
  .hero-tech-icons {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 1.5vw, 1.45rem);
    min-width: 0;
  }
  .hero-tech-icon-cell {
    width: 48px;
    height: 38px;
    display: grid;
    place-items: center;
    color: rgba(255,255,255,0.64);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px;
    background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012));
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
    cursor: default;
    flex: 0 0 auto;
    transition: color 0.2s, border-color 0.2s, background 0.2s, transform 0.2s;
  }
  .hero-tech-icon-cell:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.055);
  }
  .hero-tech-more {
    color: rgba(255,255,255,0.48);
    font-size: 1rem;
    letter-spacing: 0.14em;
    font-weight: 600;
    line-height: 1;
    transform: translateY(-2px);
    margin-left: 1.75rem;
    flex: 0 0 auto;
  }
  .hero-expertise-pills {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  .hero-expertise-pill {
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 4px;
    background: rgba(255,255,255,0.025);
    color: rgba(255,255,255,0.78);
    font-size: 0.67rem;
    font-weight: 400;
    letter-spacing: 0;
    white-space: nowrap;
    cursor: default;
    flex: 0 0 auto;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }
  .hero-expertise-pill:hover {
    color: #fff;
    border-color: rgba(255,255,255,0.42);
    background: rgba(255,255,255,0.065);
  }
  @media (max-width: 1280px) {
    .hero-tech-bar {
      grid-template-columns: 1fr;
      min-height: auto;
    }
    .hero-tech-panel-left,
    .hero-tech-panel-right {
      min-height: 72px;
    }
    .hero-tech-panel-right {
      border-left: 0;
      border-top: 1px solid rgba(255,255,255,0.12);
    }
    .hero-expertise-pills {
      flex-wrap: wrap;
    }
  }
  @media (max-width: 760px) {
    .hero-tech-bar {
      position: relative;
      left: auto;
      right: auto;
      bottom: auto;
      margin: 1.25rem 1rem 1rem;
    }
    .hero-tech-panel-left,
    .hero-tech-panel-right {
      align-items: flex-start;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
    .hero-tech-icons,
    .hero-expertise-pills {
      width: 100%;
      flex-wrap: wrap;
    }
  }
`;

/* Animated terminal card */
const TerminalCard = () => {
  const [lines, setLines] = useState([]);
  const fullLines = [
    { prompt: "> ", cmd: "whoami", delay: 600 },
    { response: "rajdeep", delay: 900 },
    { prompt: "> ", cmd: "role", delay: 1500 },
    { response: "Penetration Tester", delay: 1800 },
    { prompt: "> ", cmd: "status", delay: 2500 },
    { response: "Available for Opportunities", delay: 2800 },
  ];
  useEffect(() => {
    const timers = fullLines.map((line, i) =>
      setTimeout(() => setLines(prev => [...prev, line]), line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <motion.div
      initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
      transition={{ duration:0.6, delay:0.6 }}
      style={{
        background:"rgba(10,10,10,0.95)",
        border:"1px solid rgba(255,255,255,0.12)",
        borderRadius:"10px", backdropFilter:"blur(20px)",
        boxShadow:"0 8px 32px rgba(0,0,0,0.7)",
        overflow:"hidden",
      }}
    >
      {/* Terminal top bar */}
      <div style={{
        display:"flex", alignItems:"center", gap:"6px",
        padding:"9px 14px",
        background:"rgba(255,255,255,0.04)",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
      }}>
        {["#FF5F57","#FEBC2E","#28C840"].map(c=>(
          <div key={c} style={{width:10,height:10,borderRadius:"50%",background:c,opacity:0.85}}/>
        ))}
        <span style={{
          marginLeft:"8px", color:"rgba(255,255,255,0.3)",
          fontSize:"0.62rem", fontFamily:"monospace", letterSpacing:"0.04em",
        }}>root@rajdeep:~#</span>
      </div>
      {/* Terminal body */}
      <div style={{ padding:"12px 14px", minHeight:"120px" }}>
        {lines.map((line, i) => (
          <div key={i} style={{ fontFamily:"monospace", fontSize:"0.7rem", lineHeight:1.9 }}>
            {line.prompt && (
              <span>
                <span style={{ color:"rgba(255,255,255,0.35)" }}>{line.prompt}</span>
                <span style={{ color:"#fff", fontWeight:600 }}>{line.cmd}</span>
              </span>
            )}
            {line.response && (
              <span style={{ color:"rgba(255,255,255,0.55)", display:"block", paddingLeft:"12px" }}>
                {line.response}
              </span>
            )}
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", fontFamily:"monospace", fontSize:"0.7rem", marginTop:"4px" }}>
          <span style={{ color:"rgba(255,255,255,0.35)" }}>&gt; </span>
          <span className="terminal-cur" style={{
            display:"inline-block", width:"7px", height:"13px",
            background:"rgba(255,255,255,0.7)", marginLeft:"2px",
          }}/>
        </div>
      </div>
    </motion.div>
  );
};

/* System status card */
const SystemStatusCard = () => (
  <motion.div
    initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
    transition={{ duration:0.6, delay:0.45 }}
    style={{
      background:"rgba(10,10,10,0.95)",
      border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:"10px", backdropFilter:"blur(20px)",
      padding:"clamp(0.75rem,1.5vw,1.1rem) clamp(0.9rem,1.8vw,1.3rem)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.7)",
    }}
  >
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
      <span style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", fontWeight:700 }}>SYSTEM STATUS</span>
      <div className="live-pulse" style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#fff" }}/>
    </div>
    {[
      { key:"Firewall:", val:"ACTIVE" },
      { key:"Encryption:", val:"ENABLED" },
      { key:"Threat Level:", val:"LOW" },
      { key:"Location:", val:"ONLINE" },
    ].map(({key,val})=>(
      <div key={key} style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.05)",
      }}>
        <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.68rem", fontFamily:"monospace" }}>{key}</span>
        <span style={{ color:"#fff", fontSize:"0.68rem", fontWeight:700, fontFamily:"monospace", letterSpacing:"0.06em" }}>{val}</span>
      </div>
    ))}
  </motion.div>
);

/* Current focus card */
const CurrentFocusCard = () => (
  <motion.div
    initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
    transition={{ duration:0.6, delay:0.75 }}
    style={{
      background:"rgba(10,10,10,0.95)",
      border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:"10px", backdropFilter:"blur(20px)",
      padding:"clamp(0.75rem,1.5vw,1.1rem) clamp(0.9rem,1.8vw,1.3rem)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.7)",
    }}
  >
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
      <span style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.6rem", letterSpacing:"0.22em", textTransform:"uppercase", fontWeight:700 }}>CURRENT FOCUS</span>
      <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
      </svg>
    </div>
    <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
      {["Penetration Testing","Threat Hunting","Vulnerability Assessment","Secure Architecture"].map(t=>(
        <span key={t} style={{
          fontSize:"0.62rem", color:"rgba(255,255,255,0.55)",
          background:"rgba(255,255,255,0.05)",
          border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:"3px", padding:"2px 8px",
        }}>{t}</span>
      ))}
    </div>
  </motion.div>
);

const AdminLoginCTA = () => {
  const { isAdmin, signOut } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (isAdmin) {
    return (
      <motion.button
        onClick={signOut}
        whileHover={{ background:"rgba(168,85,247,0.15)" }}
        style={{
          border:"1.5px solid rgba(168,85,247,0.6)",
          borderRadius:"4px", padding:"10px 24px",
          background:"rgba(168,85,247,0.08)",
          color:"#A855F7", fontWeight:600,
          textTransform:"uppercase", letterSpacing:"0.12em",
          fontSize:"0.75rem", cursor:"pointer",
          display:"flex", alignItems:"center", gap:"8px",
          transition:"all 0.2s",
        }}
      >
        ADMIN MODE — SIGN OUT
      </motion.button>
    );
  }

  return (
    <>
      <motion.button
        onClick={() => setModalOpen(true)}
        whileHover={{ background:"rgba(255,255,255,0.12)" }}
        style={{
          border:"1.5px solid rgba(255,255,255,0.7)",
          borderRadius:"4px", padding:"10px 24px",
          background:"transparent",
          color:"#fff", fontWeight:600,
          textTransform:"uppercase", letterSpacing:"0.12em",
          fontSize:"0.75rem", cursor:"pointer",
          display:"flex", alignItems:"center", gap:"8px",
          transition:"all 0.2s",
        }}
      >
        ADMIN LOGIN
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </motion.button>
      <AdminLoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

const HeroSection = () => {
  const techStack = [
    {
      title: "Bash / Terminal",
      icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.55" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M8 10l3 2.5L8 15M13 15h4"/></svg>)
    },
    {
      title: "Python",
      icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.55" viewBox="0 0 24 24"><path d="M12 2C8.6 2 8 3.4 8 5v2.1h4.2v1H6.1C3.9 8.1 2 9.4 2 12s1.9 4 4.1 4H8v-2.5c0-1.5 1-2.5 2.5-2.5h4c1.5 0 2.5-1 2.5-2.5V5c0-1.6-.8-3-5-3z"/><path d="M12 22c3.4 0 4-1.4 4-3v-2.1h-4.2v-1h6.1c2.2 0 4.1-1.3 4.1-3.9s-1.9-4-4.1-4H16v2.5c0 1.5-1 2.5-2.5 2.5h-4C8 13 7 14 7 15.5V19c0 1.6.8 3 5 3z"/><circle cx="10.5" cy="5.25" r="0.7" fill="currentColor" stroke="none"/><circle cx="13.5" cy="18.75" r="0.7" fill="currentColor" stroke="none"/></svg>)
    },
    {
      title: "Metasploit",
      icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.55" viewBox="0 0 24 24"><path d="M12 21s7-3.5 7-9.4V5.2L12 2.5 5 5.2v6.4C5 17.5 12 21 12 21z"/><path d="M8.6 15V9.2L12 12.5l3.4-3.3V15" strokeLinecap="round" strokeLinejoin="round"/></svg>)
    },
    {
      title: "Nmap",
      icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.55" viewBox="0 0 24 24"><path d="M5 12.4a10.9 10.9 0 0 1 14 0"/><path d="M2 8.9a16 16 0 0 1 20 0"/><path d="M8.5 15.8a6.2 6.2 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none"/></svg>)
    },
    {
      title: "Kali Linux",
      icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.45" viewBox="0 0 24 24"><ellipse cx="12" cy="8" rx="3.7" ry="4.8"/><path d="M8.5 12.8C6.1 13.8 4 15.7 4 19h16c0-3.3-2.1-5.2-4.5-6.2"/><path d="M9.3 18.2v2.3M14.7 18.2v2.3"/><ellipse cx="10.2" cy="7.2" rx="0.45" ry="0.65" fill="currentColor" stroke="none"/><ellipse cx="13.8" cy="7.2" rx="0.45" ry="0.65" fill="currentColor" stroke="none"/></svg>)
    },
    {
      title: "Cloud Security",
      icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.55" viewBox="0 0 24 24"><path d="M18 10.2h-1.1A7.1 7.1 0 0 0 3 12.5 5 5 0 0 0 8 20h10a4.9 4.9 0 0 0 0-9.8z"/></svg>)
    },
    {
      title: "Nessus",
      icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.55" viewBox="0 0 24 24"><path d="M12 2.5l8 4.5v9l-8 4.5L4 16V7l8-4.5z"/><path d="M9 16V8l6 8V8"/></svg>)
    },
  ];

  const expertise = [
    { label: "Penetration Testing", width: "148px" },
    { label: "Web Security", width: "118px" },
    { label: "Network Security", width: "146px" },
    { label: "Incident Response", width: "150px" },
  ];

  const services = [
    {
      icon: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>),
      label: "Ethical Hacking",
      desc: "Identify and exploit vulnerabilities before malicious hackers do."
    },
    {
      icon: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6M11 8v6"/></svg>),
      label: "Threat Analysis",
      desc: "Monitor, detect, and analyze threats to prevent security breaches."
    },
    {
      icon: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
      label: "Security Consulting",
      desc: "Build secure systems and implement industry best security practices."
    },
    {
      icon: (<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
      label: "Incident Response",
      desc: "Rapid response to security incidents and minimize potential damage."
    },
  ];

  return (
    <section style={{
      minHeight: "100vh",
      background: "#0C0C0C",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
      fontFamily: "Kanit, sans-serif",
    }}>
      <style>{HERO_CSS}</style>

      {/* ── SUBTLE GRID OVERLAY ── */}
      <div style={{
        position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize:"60px 60px",
      }}/>

      {/* ── SUBTLE SCANLINE ── */}
      <div style={{
        position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
        background:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)",
      }}/>

      {/* ── CHARACTER IMAGE — covers full background, center-to-right ── */}
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }}
        transition={{ duration:1.2, delay:0.3 }}
        style={{
          position:"absolute",
          left:"28%",
          right:0,
          bottom:0,
          top:0,
          zIndex:5,
          pointerEvents:"none",
        }}
      >
        {/* Radial glow behind character */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse 70% 80% at 50% 90%, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}/>
        <img
          src={CHAR_IMG_B64}
          alt="Rajdeep Goswami"
          style={{
            width:"100%", height:"100%",
            objectFit:"cover", objectPosition:"top center",
            display:"block",
            filter:"brightness(0.9) contrast(1.05)",
          }}
        />
        {/* Left edge fade — blends into left content area */}
        <div style={{
          position:"absolute", top:0, left:0, bottom:0, width:"200px",
          background:"linear-gradient(to right, #0C0C0C 10%, transparent)",
          zIndex:2,
        }}/>
        {/* Bottom fade */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:"130px",
          background:"linear-gradient(to top, #0C0C0C, transparent)",
          zIndex:2,
        }}/>
        {/* Right edge fade */}
        <div style={{
          position:"absolute", top:0, right:0, bottom:0, width:"160px",
          background:"linear-gradient(to left, #0C0C0C, transparent)",
          zIndex:2,
        }}/>
      </motion.div>

      {/* ── LEFT SOCIAL SIDEBAR ── */}
      <div style={{
        position:"absolute", left:"18px", top:"50%", transform:"translateY(-50%)",
        zIndex:20, display:"flex", flexDirection:"column",
        alignItems:"center", gap:"16px",
      }}>
        <a href="https://github.com/rajdeep-10" target="_blank" rel="noopener noreferrer" className="follow-link">FOLLOW ME</a>
        <div style={{ width:"1px", height:"40px", background:"rgba(255,255,255,0.12)" }}/>
        {/* GitHub */}
        <a href="https://github.com/rajdeep-10" target="_blank" rel="noopener noreferrer"
          className="social-icon-link"
          title="GitHub"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        {/* LinkedIn */}
        <a href="https://www.linkedin.com/in/rajdeep-goswami-xd/" target="_blank" rel="noopener noreferrer"
          className="social-icon-link"
          title="LinkedIn"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
        {/* Mail */}
        <a href="mailto:rajdeepgoswami383@gmail.com"
          className="social-icon-link"
          title="Email"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </a>
        {/* Terminal */}
        <a href="#contact"
          className="social-icon-link"
          title="Contact"
          onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
          </svg>
        </a>
      </div>

      {/* ── NAV ── */}
      <motion.nav
        initial={{ opacity:0, y:-20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.6 }}
        style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"clamp(1.2rem,2vw,1.6rem) clamp(3rem,6vw,5rem) clamp(1.2rem,2vw,1.6rem) clamp(3rem,5vw,4rem)",
          position:"relative", zIndex:30,
        }}
      >
        {/* Logo */}
        <HoverVideoReveal src="/Batman.mp4">
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <img
            src={LOGO_IMG_B64}
            alt="ApexRecon"
            style={{
              width:"36px", height:"36px",
              borderRadius:"6px",
              display:"block",
              objectFit:"cover",
            }}
          />
          <div>
            <div style={{ color:"#fff", fontWeight:800, fontSize:"0.95rem", letterSpacing:"0.06em", lineHeight:1 }}>
              RAJDEEP
            </div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"0.52rem", letterSpacing:"0.2em", textTransform:"uppercase" }}>
              SECURE THE FUTURE
            </div>
          </div>
        </div>
        </HoverVideoReveal>

        {/* Nav links */}
        <div style={{ display:"flex", gap:"clamp(1.5rem,4vw,3.5rem)", alignItems:"center" }}>
          {["HOME","ABOUT","SKILLS","PROJECTS","EXPERIENCE","CONTACT"].map((item, i) => (
            <a key={item}
              href={item === "HOME" ? "#" : `#${item.toLowerCase()}`}
              className="hero-nav-link"
              style={{ position:"relative" }}
              onClick={(e) => {
                e.preventDefault();
                const target = item === "HOME" ? document.body : document.getElementById(item.toLowerCase());
                target?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {item}
              {i===0 && (
                <span style={{
                  position:"absolute", bottom:"-4px", left:"0", right:"0",
                  height:"1.5px", background:"#fff", borderRadius:"999px",
                }}/>
              )}
            </a>
          ))}
        </div>

        {/* CTA — Admin Login / Sign out */}
        <AdminLoginCTA />
      </motion.nav>

      {/* ── HERO BODY ── */}
      <div style={{
        flex:1,
        display:"grid",
        gridTemplateColumns:"minmax(0,1fr) minmax(0,320px)",
        position:"relative", zIndex:10,
        padding:"clamp(1rem,2vw,2rem) clamp(3rem,6vw,5rem) 0 clamp(3rem,5vw,4rem)",
        alignItems:"start",
        gap:"clamp(1rem,2vw,2rem)",
        minHeight:"calc(100vh - 200px)",
      }}>

        {/* ── LEFT: Text Content ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:"clamp(1rem,2vw,1.4rem)", zIndex:15 }}>

          {/* Terminal label */}
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.5, delay:0.2 }}
          >
            <span style={{
              fontFamily:"'Share Tech Mono', 'Courier New', monospace",
              color:"rgba(255,255,255,0.35)", fontSize:"clamp(0.62rem,0.9vw,0.78rem)",
              letterSpacing:"0.12em",
            }}>// root@rajdeep ~</span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.7, delay:0.3 }}
            style={{
              fontFamily:"'Chakra Petch', sans-serif",
              color:"#fff", fontWeight:700, textTransform:"uppercase",
              lineHeight:0.95, margin:0,
              fontSize:"clamp(2.4rem,5.5vw,5.8rem)",
              letterSpacing:"0.04em",
            }}
          >
            RAJDEEP GOSWAMI
          </motion.h1>

          {/* Thin divider */}
          <motion.div
            initial={{ scaleX:0 }} animate={{ scaleX:1 }}
            transition={{ duration:0.6, delay:0.45 }}
            style={{ width:"70px", height:"1px", background:"rgba(255,255,255,0.2)", transformOrigin:"left" }}
          />

          {/* Tagline */}
          <motion.div
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.7, delay:0.5 }}
            style={{ lineHeight:0.92, margin:0 }}
          >
            <p style={{
              fontFamily:"'Chakra Petch', sans-serif",
              color:"#fff", fontWeight:700, textTransform:"uppercase",
              fontSize:"clamp(1.8rem,3.8vw,4rem)",
              letterSpacing:"0.04em", margin:0, lineHeight:0.95,
            }}>RECON. EXPLOIT.</p>
            <p style={{
              fontFamily:"'Chakra Petch', sans-serif",
              fontWeight:700, textTransform:"uppercase",
              fontSize:"clamp(1.8rem,3.8vw,4rem)",
              letterSpacing:"0.04em", margin:0, lineHeight:0.95,
              background:"linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.3) 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              backgroundClip:"text",
            }}>REPORT. REPEAT.</p>
          </motion.div>


          {/* Description */}
          <motion.p
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.6 }}
            style={{
              color:"rgba(255,255,255,0.5)", fontWeight:300, lineHeight:1.8,
              maxWidth:"420px", fontSize:"clamp(0.82rem,1.3vw,0.95rem)", margin:0,
            }}
          >
            I help organizations defend against cyber threats, detect vulnerabilities, and build resilient digital systems.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.7 }}
            style={{ display:"flex", gap:"clamp(0.75rem,2vw,1rem)", flexWrap:"wrap" }}
          >
            <motion.a
              href="#projects"
              onClick={(e) => { e.preventDefault(); document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }); }}
              whileHover={{ background:"rgba(255,255,255,0.12)" }}
              style={{
                border:"2px solid rgba(255,255,255,0.9)",
                borderRadius:"3px", padding:"clamp(11px,1.5vw,14px) clamp(24px,2.5vw,32px)",
                color:"#fff", fontWeight:700, textTransform:"uppercase",
                letterSpacing:"0.1em", textDecoration:"none",
                fontSize:"clamp(0.65rem,1vw,0.78rem)",
                display:"flex", alignItems:"center", gap:"8px",
                transition:"all 0.2s",
              }}
            >
              VIEW MY WORK
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.a>
            <CVButton
              style={{
                border:"2px solid rgba(255,255,255,0.2)",
                borderRadius:"3px", padding:"clamp(11px,1.5vw,14px) clamp(24px,2.5vw,32px)",
                background:"transparent",
                color:"rgba(255,255,255,0.7)", fontWeight:600, textTransform:"uppercase",
                letterSpacing:"0.1em",
                fontSize:"clamp(0.65rem,1vw,0.78rem)",
                cursor:"pointer",
                display:"flex", alignItems:"center", gap:"8px",
                transition:"all 0.2s",
              }}
            />
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.85 }}
            style={{
              display:"flex", gap:"clamp(2rem,4vw,4rem)", flexWrap:"wrap",
              padding:"clamp(1rem,2vw,1.5rem) 0 0",
              borderTop:"1px solid rgba(255,255,255,0.08)",
              marginTop:"0.25rem",
            }}
          >
            {[
              { val:"3+", label:"Years in Security" },
              { val:"3", label:"CEH Certifications" },
              { val:"2", label:"Industry Internships" },
              { val:"BCA", label:"Graduate, 2024" },
            ].map(({val,label}) => (
              <div key={label} style={{ display:"flex", flexDirection:"column", gap:"3px" }}>
                <span style={{ color:"#fff", fontFamily:"'Chakra Petch', sans-serif", fontWeight:700, fontSize:"clamp(1.8rem,3.5vw,2.8rem)", lineHeight:1, letterSpacing:"-0.02em" }}>{val}</span>
                <span style={{
                  color:"rgba(255,255,255,0.3)", fontSize:"clamp(0.55rem,0.85vw,0.65rem)",
                  letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:500,
                }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Floating Cards ── */}
        <div style={{
          display:"flex", flexDirection:"column", gap:"clamp(0.6rem,1.2vw,0.9rem)",
          zIndex:15, paddingTop:"clamp(0.5rem,1vw,1rem)",
        }}>
          <SystemStatusCard />
          <TerminalCard />
          <CurrentFocusCard />
        </div>
      </div>

      {/* ── BOTTOM TECH BAR ── */}
      <motion.div
        className="hero-tech-bar"
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.6, delay:1.0 }}
      >
        <div className="hero-tech-panel hero-tech-panel-left">
          <span className="hero-tech-label">TECH STACK</span>

          <div className="hero-tech-icons">
            {techStack.map(({ title, icon }) => (
              <motion.div
                key={title}
                className="hero-tech-icon-cell"
                whileHover={{ scale: 1.08 }}
                title={title}
              >
                {icon}
              </motion.div>
            ))}
            <span className="hero-tech-more">...</span>
          </div>
        </div>

        <div className="hero-tech-panel hero-tech-panel-right">
          <span className="hero-tech-label">EXPERTISE</span>

          <div className="hero-expertise-pills">
            {expertise.map(({ label, width }) => (
              <motion.span
                key={label}
                className="hero-expertise-pill"
                style={{ width }}
              >
                {label}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   2. ABOUT SECTION  — cybersecurity-themed, no background words
══════════════════════════════════════════════════════════════════════════════ */
/* ── ABOUT: Tilt Card Hook ───────────────────────────────────────────────── */
const useTilt = (strength = 12) => {
  const ref = useRef(null);
  const rotX = useMotionValue(0), rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 120, damping: 20, mass: 0.5 });
  const sRotY = useSpring(rotY, { stiffness: 120, damping: 20, mass: 0.5 });
  const glowX = useMotionValue(50), glowY = useMotionValue(50);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rect = null;
    let rafId = null;

    const onEnter = () => { rect = el.getBoundingClientRect(); };
    const onMove = (e) => {
      if (!rect) return;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        rotX.set((0.5 - py) * strength);
        rotY.set((px - 0.5) * strength);
        glowX.set(px * 100);
        glowY.set(py * 100);
      });
    };
    const onLeave = () => {
      rect = null;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      rotX.set(0); rotY.set(0); glowX.set(50); glowY.set(50);
    };

    el.addEventListener("mouseenter", onEnter, { passive: true });
    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [rotX, rotY, glowX, glowY, strength]);

  return { ref, sRotX, sRotY, glowX, glowY };
};

/* ── CERT CARD (About section tilt card) ─────────────────────────────────── */
const AboutCertCard = () => {
  const { ref, sRotX, sRotY, glowX, glowY } = useTilt(10);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = "ECC1893504267";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback for non-HTTPS or permission denied
        const el = document.createElement("textarea");
        el.value = text;
        el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: sRotX,
        rotateY: sRotY,
        willChange: "transform",
        position: "relative",
      }}
    >
      {/* Glow layer */}
      <motion.div style={{
        position: "absolute", inset: "-1px", borderRadius: "20px",
        background: useTransform([glowX, glowY], ([x, y]) =>
          `radial-gradient(circle at ${x}% ${y}%, rgba(220,30,30,0.25) 0%, transparent 65%)`
        ),
        pointerEvents: "none", zIndex: 0,
        opacity: 0, transition: "opacity 0.3s",
      }} className="cert-glow" />

      <div
        style={{
          background: "linear-gradient(160deg, rgba(6,4,14,0.99) 0%, rgba(4,3,10,1) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "20px",
          padding: "clamp(1.25rem,2.5vw,1.75rem)",
          width: "100%",
          position: "relative", zIndex: 1,
          cursor: "default",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 0.3s, box-shadow 0.4s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(220,30,30,0.55)";
          e.currentTarget.style.boxShadow = "0 32px 80px rgba(0,0,0,0.8), 0 0 30px rgba(220,30,30,0.07), inset 0 1px 0 rgba(255,255,255,0.07)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
          e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)";
        }}
      >
        {/* Top shimmer line — matches ProjectCard */}
        <div style={{
          position: "absolute", top: 0, left: "8%", right: "8%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(220,30,30,0.45), transparent)",
          pointerEvents: "none",
        }} />
        {/* Header label */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
          <p style={{
            color: "rgba(215,226,234,0.35)", fontFamily: "'Inter', sans-serif", fontWeight: 500, textTransform: "uppercase",
            letterSpacing: "0.14em", fontSize: "0.65rem",
          }}>Certification</p>
          <div style={{ flex: 1, height: "1px", background: "rgba(215,226,234,0.1)" }} />
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(215,226,234,0.25)" }} />
        </div>

        {/* Icon + title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
          {/* Hexagon icon */}
          <div style={{ flexShrink: 0, position: "relative", width: "52px", height: "58px" }}>
            <svg viewBox="0 0 52 58" width="52" height="58" style={{ position: "absolute", top: 0, left: 0 }}>
              <path
                d="M26 2 L50 15.5 L50 42.5 L26 56 L2 42.5 L2 15.5 Z"
                fill="none"
                stroke="rgba(215,226,234,0.2)"
                strokeWidth="1.5"
              />
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="rgba(215,226,234,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M8 8l-4 8 4-1 2 3 2-8"/>
                <path d="M16 8l4 8-4-1-2 3-2-8"/>
              </svg>
            </div>
          </div>

          <div>
            <p style={{
              color: "#D7E2EA", fontFamily: "'Inter', sans-serif", fontWeight: 700,
              fontSize: "clamp(1rem,2vw,1.2rem)", lineHeight: 1.2,
              marginBottom: "0.3rem",
            }}>CEH Master</p>
            <p style={{
              color: "rgba(215,226,234,0.45)", fontFamily: "'Inter', sans-serif", fontWeight: 400,
              fontSize: "clamp(0.75rem,1.3vw,0.85rem)", lineHeight: 1.5,
            }}>Certified Ethical Hacker<br />Master</p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(215,226,234,0.07)", marginBottom: "1rem" }} />

        {/* Credential ID */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <p style={{
            color: "rgba(215,226,234,0.45)", fontFamily: "'Inter', sans-serif", fontWeight: 400,
            fontSize: "clamp(0.7rem,1.2vw,0.8rem)",
          }}>Credential ID: <span style={{ color: "rgba(215,226,234,0.7)", fontWeight: 500 }}>ECC1893504267</span></p>
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "2px",
              color: copied ? "rgba(79,255,170,0.9)" : "rgba(215,226,234,0.4)",
              transition: "color 0.2s", flexShrink: 0,
            }}
            title="Copy credential ID"
          >
            {copied ? (
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8l4 4 8-8"/>
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="5" width="9" height="9" rx="2"/>
                <path d="M11 5V3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ── SKILLS CARD ─────────────────────────────────────────────────────────── */
const skillItems = [
  { icon: "🌐", label: "Web AppSec" },
  { icon: "🛡️", label: "Penetration Testing" },
  { icon: "🔍", label: "OSINT" },
  { icon: "👁️", label: "Threat Intelligence" },
  { icon: "⚡", label: "Burp Suite" },
  { icon: "📡", label: "Nmap" },
  { icon: "🦈", label: "Wireshark" },
  { icon: "🔮", label: "Metasploit" },
  { icon: "🗄️", label: "SQLMap" },
  { icon: "🐧", label: "Linux" },
  { icon: "🐍", label: "Python" },
  { icon: "💻", label: "Bash Scripting" },
];

const SkillsCardAbout = () => {
  const { ref, sRotX, sRotY, glowX, glowY } = useTilt(8);

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX: sRotX,
        rotateY: sRotY,
        willChange: "transform",
      }}
    >
      <div
        style={{
          background: "linear-gradient(160deg, rgba(6,4,14,0.99) 0%, rgba(4,3,10,1) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "20px",
          padding: "clamp(1.25rem,2.5vw,1.75rem)",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          cursor: "default",
          transition: "border-color 0.3s, box-shadow 0.4s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(220,30,30,0.55)";
          e.currentTarget.style.boxShadow = "0 32px 80px rgba(0,0,0,0.8), 0 0 30px rgba(220,30,30,0.07), inset 0 1px 0 rgba(255,255,255,0.07)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
          e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)";
        }}
      >
        {/* Top shimmer line — matches ProjectCard */}
        <div style={{
          position: "absolute", top: 0, left: "8%", right: "8%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(220,30,30,0.45), transparent)",
          pointerEvents: "none",
        }} />
        {/* Header label */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
          <p style={{
            color: "rgba(215,226,234,0.35)", fontFamily: "'Inter', sans-serif", fontWeight: 500, textTransform: "uppercase",
            letterSpacing: "0.14em", fontSize: "0.65rem",
          }}>Skills &amp; Tools</p>
          <div style={{ flex: 1, height: "1px", background: "rgba(215,226,234,0.1)" }} />
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(215,226,234,0.25)" }} />
        </div>

        {/* Pill grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {skillItems.map(({ icon, label }) => (
            <motion.span
              key={label}
              whileHover={{
                background: "rgba(220,30,30,0.12)",
                borderColor: "rgba(220,30,30,0.4)",
                color: "rgba(215,226,234,0.95)",
                scale: 1.04,
              }}
              transition={{ duration: 0.15 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "999px",
                padding: "5px 12px",
                fontSize: "clamp(0.65rem,1.1vw,0.75rem)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                color: "rgba(215,226,234,0.5)",
                background: "rgba(255,255,255,0.04)",
                cursor: "default",
                whiteSpace: "nowrap",
                letterSpacing: "0.04em",
              }}
            >
              <span style={{ fontSize: "0.8em" }}>{icon}</span>{label}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ── ABOUT SECTION ───────────────────────────────────────────────────────── */
const AboutSection = () => (
  <section id="about" style={{
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    flexDirection: "column", position: "relative",
    padding: "clamp(5rem,10vw,10rem) clamp(1.5rem,5vw,4rem)",
    background: "#000", overflow: "hidden",
    transform: "translateZ(0)",
    willChange: "transform",
  }}>

    <div style={{
      position: "relative", zIndex: 1,
      maxWidth: "1100px", width: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(2.5rem,5vw,4rem)",
    }}>

      {/* Heading — outside the card */}
      <FadeIn delay={0} y={40} style={{ width: "100%", textAlign: "center" }}>
        <h2 className="hero-heading" style={{
          fontFamily: "'Teko', sans-serif", fontWeight: 700, textTransform: "uppercase", lineHeight: 1,
          letterSpacing: "-0.01em", fontSize: "clamp(4rem,15.5vw,172px)",
        }}>About me</h2>
      </FadeIn>

      {/* ── Outer HUD card ── */}
      <FadeIn delay={0.12} y={28} style={{ width: "100%" }}>
        <div style={{
          background: "linear-gradient(160deg, rgba(6,4,14,0.98) 0%, rgba(4,3,10,0.99) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)",
          padding: "clamp(2rem,4vw,3.5rem)",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          contain: "layout paint",
          transform: "translateZ(0)",
        }}>
          {/* Top shimmer — matches ProjectCard */}
          <div style={{
            position: "absolute", top: 0, left: "5%", right: "5%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(220,30,30,0.35), transparent)",
            pointerEvents: "none",
          }} />

          {/* Ambient glow blobs */}
          <div style={{ position: "absolute", top: "-30%", left: "0%", width: "35%", height: "70%", background: "rgba(220,30,30,0.04)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-20%", right: "5%", width: "28%", height: "60%", background: "rgba(220,30,30,0.025)", borderRadius: "50%", filter: "blur(55px)", pointerEvents: "none" }} />

          {/* Inner two-column grid */}
          <div className="about-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr clamp(280px,36vw,360px)",
            gap: "clamp(2.5rem,5vw,4rem)",
            alignItems: "start",
          }}>

            {/* ── LEFT: bio text ── */}
            <div style={{ display: "flex", flexDirection: "column" }}>

              {/* Eyebrow */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "clamp(1.25rem,2.5vw,2rem)" }}>
                <div style={{ width: "28px", height: "1px", background: "rgba(220,30,30,0.7)" }} />
                <p style={{
                  color: "rgba(220,30,30,0.85)", fontWeight: 500, textTransform: "uppercase",
                  letterSpacing: "0.18em", fontSize: "0.62rem",
                }}>Who I am</p>
              </div>

              {/* Pull-quote — the signature typographic moment */}
              <div style={{
                borderLeft: "2px solid rgba(220,30,30,0.5)",
                paddingLeft: "clamp(1rem,2vw,1.5rem)",
                marginBottom: "clamp(1.5rem,3vw,2.25rem)",
              }}>
                <p style={{
                  color: "#D7E2EA",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  lineHeight: 1.45,
                  fontSize: "clamp(1.1rem,2.2vw,1.55rem)",
                  letterSpacing: "-0.01em",
                }}>
                  "Security isn't just about defense — it's about understanding how systems fail."
                </p>
              </div>

              {/* Bio paragraphs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(0.85rem,1.5vw,1.1rem)" }}>
                <p style={{
                  color: "rgba(215,226,234,0.75)", fontFamily: "'Inter', sans-serif", fontWeight: 400,
                  lineHeight: 1.9, fontSize: "clamp(0.9rem,1.45vw,1.05rem)",
                }}>
                  I'm <span style={{ color: "#D7E2EA", fontWeight: 600 }}>Rajdeep Goswami</span>, a Penetration Tester
                  passionate about offensive security, vulnerability research, and ethical hacking.
                  I enjoy analyzing applications and networks from an attacker's perspective,
                  uncovering weaknesses, and helping build more resilient systems.
                </p>
                <p style={{
                  color: "rgba(215,226,234,0.5)", fontFamily: "'Inter', sans-serif", fontWeight: 400,
                  lineHeight: 1.9, fontSize: "clamp(0.88rem,1.4vw,1rem)",
                }}>
                  My journey in cybersecurity is driven by curiosity, continuous learning, and a deep
                  interest in understanding how modern threats operate. Through hands-on testing and
                  security research, I aim to turn complexity into actionable security insights.
                </p>
              </div>

              {/* Thin separator + mini stat row */}
              <div style={{
                marginTop: "clamp(1.5rem,3vw,2.5rem)",
                paddingTop: "clamp(1.25rem,2.5vw,2rem)",
                borderTop: "1px solid rgba(255,255,255,0.055)",
                display: "flex", gap: "clamp(1.5rem,3vw,2.5rem)", flexWrap: "wrap",
              }}>
                {[
                  { val: "3", label: "Internships" },
                  { val: "5+", label: "Projects Built" },
                  { val: "CEH", label: "Master Certified" },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <p style={{ color: "#D7E2EA", fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "clamp(1.1rem,2vw,1.4rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{val}</p>
                    <p style={{ color: "rgba(215,226,234,0.3)", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "clamp(0.58rem,1vw,0.68rem)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: "0.25rem" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: stacked cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <AboutCertCard />
              <SkillsCardAbout />
            </div>

          </div>
        </div>
      </FadeIn>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════════════
   3. SKILLS SECTION — Tactical HUD Mission Select
══════════════════════════════════════════════════════════════════════════════ */

const SKILLS = [
  {
    id: "01",
    name: "Penetration Testing",
    tier: 3,
    tierLabel: "HIGH",
    tools: ["Nmap", "Metasploit", "Burp Suite"],
    desc: "I simulate real-world attacks against web applications and network infrastructure to find the gaps automated scanners miss. Engagements run through structured recon, exploitation, and post-exploitation phases — Nmap for port scanning and service fingerprinting, Metasploit for controlled, scoped exploit delivery under rules of engagement, and Burp Suite for probing web app logic. The goal is always the same: surface real risk before an adversary does.",
  },
  {
    id: "02",
    name: "Vulnerability Assessment",
    tier: 2,
    tierLabel: "MED",
    tools: ["Burp Suite", "Nmap"],
    desc: "I run systematic sweeps across web applications and network infrastructure to identify, classify, and rank security weaknesses by real-world exploitability — not just CVSS score. Burp Suite surfaces application-layer flaws while Nmap maps exposed services, and every finding is backed by evidence and folded into a prioritized remediation report.",
  },
  {
    id: "03",
    name: "Threat Intelligence",
    tier: 3,
    tierLabel: "HIGH",
    tools: ["Wireshark", "MITRE ATT&CK"],
    desc: "I dig into raw packet captures to spot the anomalies that signal an active or emerging threat — C2 beaconing, lateral movement, unusual traffic patterns. Findings are correlated against MITRE ATT&CK TTPs and open-source threat feeds to produce structured intelligence that gives defensive teams the context to act before an incident escalates.",
  },
  {
    id: "04",
    name: "Incident Response",
    tier: 2,
    tierLabel: "MED",
    tools: ["Wireshark", "MITRE ATT&CK"],
    desc: "When something goes wrong, speed and precision matter. I support triage and containment by correlating indicators of compromise against known threat feeds, tracing suspicious activity through packet-level evidence in Wireshark, and helping the response team close the gap the same way it opened.",
  },
  {
    id: "05",
    name: "Security Auditing",
    tier: 1,
    tierLabel: "LOW",
    tools: ["Nmap", "Metasploit"],
    desc: "I audit network and application configurations against recognized security baselines to expose structural weaknesses before they become incidents. Every audit closes with a technical findings report and concrete, prioritized remediation guidance — built to strengthen posture, not just check a compliance box.",
  },
];

const ACCENT = "#C11111";
const ACCENT_RGB = "193,17,17";

/* ── Difficulty bars — filled triangles, HUD-style ── */
const TierBars = ({ tier, active }) => (
  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
    {[1, 2, 3].map(n => (
      <div key={n} style={{
        width: "5px", height: "19px",
        clipPath: "polygon(30% 0, 100% 0, 70% 100%, 0 100%)",
        background: n <= tier
          ? (active ? ACCENT : "rgba(245,240,234,0.28)")
          : "rgba(255,255,255,0.07)",
        boxShadow: n <= tier && active ? `0 0 10px rgba(${ACCENT_RGB},0.7)` : "none",
        transition: "background 0.3s, box-shadow 0.3s",
      }} />
    ))}
  </div>
);

/* ── Single mission row (left list) ── */
const MissionRow = ({ skill, isActive, onSelect }) => (
  <motion.div
    onClick={onSelect}
    whileHover={!isActive ? { x: 6, background: "rgba(255,255,255,0.035)" } : {}}
    whileTap={{ scale: 0.985 }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
    style={{
      position: "relative",
      cursor: isActive ? "default" : "pointer",
      clipPath: "polygon(18px 0, 100% 0, 100% 100%, 0 100%, 0 18px)",
      border: isActive ? `1px solid rgba(${ACCENT_RGB},0.55)` : "1px solid rgba(255,255,255,0.07)",
      background: isActive
        ? `linear-gradient(90deg, rgba(${ACCENT_RGB},0.16), rgba(${ACCENT_RGB},0.03))`
        : "rgba(255,255,255,0.015)",
      boxShadow: isActive ? `0 0 24px rgba(${ACCENT_RGB},0.18), inset 0 0 20px rgba(${ACCENT_RGB},0.05)` : "none",
      padding: "clamp(14px,2vw,19px) clamp(16px,2.4vw,24px) clamp(14px,2vw,19px) clamp(20px,3vw,28px)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "14px",
      transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
    }}
  >
    {isActive && (
      <motion.div
        layoutId="activeGlowBar"
        style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
          background: ACCENT, boxShadow: `0 0 12px ${ACCENT}`,
        }}
      />
    )}
    <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px,2vw,16px)", minWidth: 0 }}>
      <span style={{
        fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em",
        color: isActive ? ACCENT : "rgba(245,240,234,0.25)",
        flexShrink: 0, width: "22px", transition: "color 0.3s",
      }}>{skill.id}</span>
      <span style={{
        fontSize: "clamp(0.82rem,1.7vw,1.05rem)", fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.02em",
        color: isActive ? "#F5F0EA" : "rgba(245,240,234,0.5)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        transition: "color 0.3s",
      }}>{skill.name}</span>
    </div>
    <TierBars tier={skill.tier} active={isActive} />
  </motion.div>
);

/* ── Briefing panel (right side detail) ── */
const BriefingPanel = ({ skill }) => (
  <motion.div
    key={skill.id}
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}
  >
    {/* Difficulty readout row */}
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "clamp(16px,2.4vw,22px)" }}>
      <div style={{
        width: "34px", height: "34px", flexShrink: 0,
        clipPath: "polygon(22% 0, 100% 0, 78% 100%, 0 100%)",
        background: `rgba(${ACCENT_RGB},0.16)`,
        border: `1px solid rgba(${ACCENT_RGB},0.45)`,
        boxShadow: `0 0 16px rgba(${ACCENT_RGB},0.15)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="15" height="15" fill="none" stroke={ACCENT} strokeWidth="2.4" viewBox="0 0 24 24">
          <path d="M13 2 L4 14h7l-1 8 9-12h-7z" />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: "0.56rem", color: "rgba(245,240,234,0.45)", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: "3px", fontWeight: 600 }}>Difficulty</p>
        <p style={{ fontSize: "0.88rem", color: "#F5F0EA", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{skill.tierLabel}</p>
      </div>
    </div>

    {/* Name */}
    <p style={{
      fontSize: "clamp(1.35rem,3vw,1.9rem)", fontWeight: 900, color: "#FFFFFF",
      textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1.15,
      marginBottom: "clamp(14px,2.2vw,18px)",
    }}>{skill.name}</p>

    {/* Description */}
    <p style={{
      fontSize: "clamp(0.86rem,1.5vw,1rem)", color: "rgba(245,240,234,0.78)", fontFamily: "'Inter', sans-serif",
      lineHeight: 1.8, fontWeight: 400, flex: 1,
    }}>{skill.desc}</p>

    {/* Tools row */}
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "8px",
      marginTop: "clamp(16px,2.4vw,22px)", paddingTop: "clamp(16px,2.4vw,22px)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
    }}>
      {skill.tools.map(t => (
        <motion.span
          key={t}
          whileHover={{
            borderColor: `rgba(${ACCENT_RGB},0.6)`,
            background: `rgba(${ACCENT_RGB},0.1)`,
            color: "#F5F0EA",
          }}
          style={{
            fontSize: "0.68rem", fontWeight: 700, color: "rgba(245,240,234,0.65)",
            border: "1px solid rgba(255,255,255,0.14)",
            padding: "6px 14px", textTransform: "uppercase", letterSpacing: "0.06em",
            clipPath: "polygon(7px 0, 100% 0, calc(100% - 7px) 100%, 0 100%)",
            transition: "border-color 0.25s, background 0.25s, color 0.25s",
          }}
        >{t}</motion.span>
      ))}
    </div>
  </motion.div>
);

/* ── Tools & OS — inline SVG marks (no external requests) ── */
const Monogram = ({ letter }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="1.5" y="1.5" width="21" height="21" rx="5" stroke="#0C0C0C" strokeWidth="1.4" opacity="0.35" />
    <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0C0C0C" fontFamily="Arial, sans-serif">{letter}</text>
  </svg>
);

const TickerIcon = ({ name }) => {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" };
  switch (name) {
    case "nmap":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="#0C0C0C" strokeWidth="1.4" opacity="0.35" />
          <path d="M12 12 L12 4 A8 8 0 0 1 18.5 8.2 Z" fill="#0C0C0C" opacity="0.85" />
          <circle cx="12" cy="12" r="1.6" fill="#0C0C0C" />
        </svg>
      );
    case "metasploit":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="#0C0C0C" strokeWidth="1.4" opacity="0.35" />
          <path d="M12 3 L12 21 M3 12 L21 12" stroke="#0C0C0C" strokeWidth="1.4" opacity="0.55" />
          <circle cx="12" cy="12" r="2.6" fill="#0C0C0C" />
        </svg>
      );
    case "burp":
      return <Monogram letter="B" />;
    case "wireshark":
      return <Monogram letter="W" />;
    case "mitre":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="#0C0C0C" strokeWidth="1.4" opacity="0.4" />
          <circle cx="12" cy="12" r="5.2" stroke="#0C0C0C" strokeWidth="1.4" opacity="0.6" />
          <circle cx="12" cy="12" r="1.6" fill="#0C0C0C" />
        </svg>
      );
    case "kali":
      return <Monogram letter="K" />;
    case "parrot":
      return <Monogram letter="P" />;
    case "windows":
      return (
        <svg {...common}>
          <path d="M3 5.5 L11 4.3 V11.3 H3 Z" fill="#0C0C0C" opacity="0.85" />
          <path d="M12.2 4.15 L21 3 V11.3 H12.2 Z" fill="#0C0C0C" opacity="0.85" />
          <path d="M3 12.7 H11 V19.7 L3 18.5 Z" fill="#0C0C0C" opacity="0.85" />
          <path d="M12.2 12.7 H21 V21 L12.2 19.85 Z" fill="#0C0C0C" opacity="0.85" />
        </svg>
      );
    case "linux":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="9" rx="3.4" ry="4" fill="#0C0C0C" opacity="0.85" />
          <path d="M8 12.5 C7 15 6.5 18 8.5 20 C10 21.3 14 21.3 15.5 20 C17.5 18 17 15 16 12.5 C14.5 14 9.5 14 8 12.5 Z" fill="#0C0C0C" opacity="0.85" />
          <circle cx="10.5" cy="8.5" r="0.7" fill="#F5F0EA" />
          <circle cx="13.5" cy="8.5" r="0.7" fill="#F5F0EA" />
        </svg>
      );
    case "macos":
      return (
        <svg {...common}>
          <path d="M16.5 12.3c0-2 1.6-3 1.7-3.1-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.2.7-.6 0-1.7-.7-2.8-.7-1.4 0-2.7.8-3.5 2.1-1.5 2.5-.4 6.3 1 8.3.7 1 1.6 2.1 2.7 2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 2-1 2.7-2 .5-.8.8-1.4 1.1-2.2-1.2-.5-2.3-1.8-2.3-3.5Z" fill="#0C0C0C" opacity="0.85" />
          <path d="M14.8 5.8c.6-.7 1-1.7.9-2.8-.9.1-1.9.6-2.5 1.3-.6.6-1.1 1.6-.9 2.6 1 .1 2-.5 2.5-1.1Z" fill="#0C0C0C" opacity="0.85" />
        </svg>
      );
    default:
      return null;
  }
};

const TOOLS_TICKER = [
  { label: "Nmap", key: "nmap" },
  { label: "Metasploit", key: "metasploit" },
  { label: "Burp Suite", key: "burp" },
  { label: "Wireshark", key: "wireshark" },
  { label: "MITRE ATT&CK", key: "mitre" },
];

const OS_TICKER = [
  { label: "Kali Linux", key: "kali" },
  { label: "Parrot OS", key: "parrot" },
  { label: "Windows", key: "windows" },
  { label: "Linux", key: "linux" },
  { label: "macOS", key: "macos" },
];

const TickerRow = ({ items, direction = "left", speed = 28 }) => {
  const loop = [...items, ...items, ...items];
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
    }}>
      <div
        style={{
          display: "flex", gap: "0.75rem", width: "max-content",
          animation: `${direction === "left" ? "tickerLeft" : "tickerRight"} ${speed}s linear infinite`,
        }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex", alignItems: "center", gap: "9px",
              border: "1px solid rgba(12,12,12,0.14)", borderRadius: "999px",
              padding: "8px 20px", fontSize: "clamp(0.75rem,1.3vw,0.9rem)",
              fontWeight: 600, color: "#0C0C0C", whiteSpace: "nowrap",
              background: "rgba(12,12,12,0.02)",
            }}
          >
            <TickerIcon name={item.key} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const ToolTicker = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
    <TickerRow items={TOOLS_TICKER} direction="left" speed={26} />
    <TickerRow items={OS_TICKER} direction="right" speed={32} />
    <style>{`
      @keyframes tickerLeft {
        from { transform: translateX(0); }
        to { transform: translateX(-33.3333%); }
      }
      @keyframes tickerRight {
        from { transform: translateX(-33.3333%); }
        to { transform: translateX(0); }
      }
      @keyframes livePulse {
        0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(193,17,17,0.5); }
        50% { opacity: 0.6; box-shadow: 0 0 0 4px rgba(193,17,17,0); }
      }
    `}</style>
  </div>
);

const SkillsSection = () => {
  const [active, setActive] = useState(0);
  const activeSkill = SKILLS[active];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown") setActive(a => (a + 1) % SKILLS.length);
      if (e.key === "ArrowUp")   setActive(a => (a - 1 + SKILLS.length) % SKILLS.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <section id="skills" style={{
      background: "#fff",
      borderRadius: "clamp(40px,5vw,60px) clamp(40px,5vw,60px) 0 0",
      padding: "clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,4rem)",
    }}>
      <FadeIn delay={0} y={40}>
        <h2 style={{
          color: "#0C0C0C", fontFamily: "'Teko', sans-serif", fontWeight: 700, textTransform: "uppercase",
          textAlign: "center", fontSize: "clamp(4rem,15.5vw,172px)",
          letterSpacing: "-0.02em", lineHeight: 1,
          marginBottom: "0.4rem",
        }}>Skills</h2>
        <p style={{
          textAlign: "center", color: "rgba(12,12,12,0.32)",
          fontSize: "clamp(0.62rem,1.1vw,0.72rem)", fontWeight: 500,
          textTransform: "uppercase", letterSpacing: "0.22em",
          marginBottom: "clamp(3rem,6vw,5.5rem)",
        }}>Tactical Capability Readout</p>
      </FadeIn>

      {/* ── HUD frame ── */}
      <FadeIn delay={0.1} y={30}>
        <div style={{
          position: "relative",
          maxWidth: "1280px", margin: "0 auto",
          clipPath: "polygon(32px 0, 100% 0, 100% calc(100% - 32px), calc(100% - 32px) 100%, 0 100%, 0 32px)",
          background: `linear-gradient(135deg, rgba(${ACCENT_RGB},0.45), rgba(12,12,12,0.08) 40%, rgba(${ACCENT_RGB},0.2))`,
          padding: "1.5px",
          boxShadow: `0 30px 80px -20px rgba(0,0,0,0.5), 0 0 60px -20px rgba(${ACCENT_RGB},0.25)`,
        }}>
          <div
            className="hud-grid-cols"
            style={{
              position: "relative",
              overflow: "hidden",
              clipPath: "polygon(31px 0, 100% 0, 100% calc(100% - 31px), calc(100% - 31px) 100%, 0 100%, 0 31px)",
              background: "radial-gradient(ellipse 120% 100% at 30% 0%, #141414 0%, #0C0C0C 55%)",
              display: "grid",
              gridTemplateColumns: "1.1fr 1.3fr",
              minHeight: "clamp(440px,46vw,520px)",
            }}
          >
            {/* ambient scanline / glow texture */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
              backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)`,
            }} />
            {/* ── Left: mission list ── */}
            <div style={{
              position: "relative",
              padding: "clamp(30px,4vw,42px) clamp(24px,3.5vw,34px)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
              display: "flex", flexDirection: "column",
            }}>
              <div className="hud-corner-mark" style={{
                position: "absolute", top: "12px", left: "12px",
                width: "16px", height: "16px",
                borderTop: `2px solid ${ACCENT}`, borderLeft: `2px solid ${ACCENT}`,
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "clamp(22px,3vw,32px)" }}>
                <span style={{ fontSize: "0.66rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.18em" }}>Loadout</span>
                <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, rgba(${ACCENT_RGB},0.4), transparent)` }} />
                <span style={{ fontSize: "0.6rem", color: "rgba(245,240,234,0.25)", letterSpacing: "0.1em", fontWeight: 600 }}>{String(active + 1).padStart(2, "0")}/{String(SKILLS.length).padStart(2, "0")}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px,1.5vw,14px)" }}>
                {SKILLS.map((s, i) => (
                  <MissionRow
                    key={s.id}
                    skill={s}
                    isActive={i === active}
                    onSelect={() => setActive(i)}
                  />
                ))}
              </div>

              <p style={{
                marginTop: "auto", paddingTop: "clamp(18px,2.5vw,24px)",
                fontSize: "0.62rem", color: "rgba(245,240,234,0.22)",
                letterSpacing: "0.08em", fontWeight: 500,
              }}>Use ↑ / ↓ or select a module to view briefing</p>
            </div>

            {/* ── Right: briefing panel ── */}
            <div style={{
              position: "relative",
              padding: "clamp(30px,4vw,42px) clamp(28px,4vw,44px)",
              display: "flex", flexDirection: "column",
            }}>
              <div className="hud-corner-mark" style={{
                position: "absolute", bottom: "12px", right: "12px",
                width: "16px", height: "16px",
                borderBottom: `2px solid ${ACCENT}`, borderRight: `2px solid ${ACCENT}`,
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "clamp(22px,3vw,32px)" }}>
                <span style={{ fontSize: "0.66rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.18em" }}>Briefing</span>
                <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, rgba(${ACCENT_RGB},0.4), transparent)` }} />
              </div>

              <div style={{ position: "relative", flex: 1, minHeight: "clamp(280px,32vw,340px)" }}>
                <AnimatePresence mode="wait">
                  <BriefingPanel skill={activeSkill} />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Tools & OS ticker ── */}
      <FadeIn delay={0.2} y={20}>
        <div style={{ maxWidth: "1280px", margin: "clamp(3rem,5vw,5rem) auto 0", paddingTop: "clamp(2rem,4vw,3.5rem)", borderTop: "1px solid rgba(12,12,12,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "clamp(1.5rem,3vw,2.5rem)" }}>
            <p style={{ color: "rgba(12,12,12,0.9)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "1.1rem", margin: 0 }}>Tools &amp; OS</p>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "0.6rem", fontWeight: 700, color: ACCENT,
              textTransform: "uppercase", letterSpacing: "0.1em",
              border: `1px solid rgba(${ACCENT_RGB},0.3)`, borderRadius: "999px",
              padding: "3px 10px",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%", background: ACCENT,
                animation: "livePulse 1.6s ease-in-out infinite",
              }} />
              Live Loadout
            </span>
          </div>

          <ToolTicker />
        </div>
      </FadeIn>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   4. CERTIFICATIONS — Premium Fan Carousel
══════════════════════════════════════════════════════════════════════════════ */

/* ── ISSUER LOGO MARKS ── */
const CiscoMark = ({ fill = "currentColor", style = {} }) => (
  <svg viewBox="0 0 216 114" style={ style } xmlns="http://www.w3.org/2000/svg" fill={fill}>
    <path
     d="m 106.48,76.238 c -0.282,-0.077 -4.621,-1.196 -9.232,-1.196 -8.73,0 -13.986,4.714 -13.986,11.734 0,6.214 4.397,9.313 9.674,10.98 0.585,0.193 1.447,0.463 2.021,0.653 2.349,0.739 4.224,1.837 4.224,3.739 0,2.127 -2.167,3.504 -6.878,3.504 -4.14,0 -8.109,-1.184 -8.945,-1.395 v 8.637 c 0.466,0.099 5.183,1.025 10.222,1.025 7.248,0 15.539,-3.167 15.539,-12.595 0,-4.573 -2.8,-8.783 -8.947,-10.737 L 97.559,89.755 C 96,89.263 93.217,88.466 93.217,86.181 c 0,-1.805 2.062,-3.076 5.859,-3.076 3.276,0 7.263,1.101 7.404,1.145 z m 80.041,18.243 c 0,5.461 -4.183,9.879 -9.796,9.879 -5.619,0 -9.791,-4.418 -9.791,-9.879 0,-5.45 4.172,-9.87 9.791,-9.87 5.613,0 9.796,4.42 9.796,9.87 m -9.796,-19.427 c -11.544,0 -19.823,8.707 -19.823,19.427 0,10.737 8.279,19.438 19.823,19.438 11.543,0 19.834,-8.701 19.834,-19.438 0,-10.72 -8.291,-19.427 -19.834,-19.427 M 70.561,113.251 H 61.089 V 75.719 h 9.472"
     id="path10" />
  <path
     d="m 48.07,76.399 c -0.89,-0.264 -4.18,-1.345 -8.636,-1.345 -11.526,0 -19.987,8.218 -19.987,19.427 0,12.093 9.34,19.438 19.987,19.438 4.23,0 7.459,-1.002 8.636,-1.336 v -10.075 c -0.407,0.226 -3.503,1.992 -7.957,1.992 -6.31,0 -10.38,-4.441 -10.38,-10.019 0,-5.748 4.246,-10.011 10.38,-10.011 4.53,0 7.576,1.805 7.957,2.004"
     id="path12" />
  <use
     xlinkHref="#path12"
     transform="translate(98.86)"
     id="use14" />
  <g
     id="g22">
    <path
       d="m 61.061,4.759 c 0,-2.587 -2.113,-4.685 -4.703,-4.685 -2.589,0 -4.702,2.098 -4.702,4.685 v 49.84 c 0,2.602 2.113,4.699 4.702,4.699 2.59,0 4.703,-2.097 4.703,-4.699 z M 35.232,22.451 c 0,-2.586 -2.112,-4.687 -4.702,-4.687 -2.59,0 -4.702,2.101 -4.702,4.687 v 22.785 c 0,2.601 2.112,4.699 4.702,4.699 2.59,0 4.702,-2.098 4.702,-4.699 z M 9.404,35.383 C 9.404,32.796 7.292,30.699 4.702,30.699 2.115,30.699 0,32.796 0,35.383 v 9.853 c 0,2.601 2.115,4.699 4.702,4.699 2.59,0 4.702,-2.098 4.702,-4.699"
       id="path16" />
    <use
       xlinkHref="#path16"
       transform="matrix(-1,0,0,1,112.717,0)"
       id="use18" />
  </g>
  <use
     xlinkHref="#g22"
     transform="matrix(-1,0,0,1,216,0)"
     id="use20" />
  </svg>
);

const ITKraftzMark = ({ color = "currentColor", style = {} }) => (
  <svg viewBox="0 0 220 60" style={ style } xmlns="http://www.w3.org/2000/svg">
    <polygon points="8,10 8,50 34,30" fill={color} />
    <text x="46" y="24" fontFamily="Kanit, sans-serif" fontWeight="800" fontSize="22" fill={color} letterSpacing="0.5">ITKraftz</text>
    <text x="46" y="42" fontFamily="Kanit, sans-serif" fontWeight="500" fontSize="9" fill={color} opacity="0.7" letterSpacing="1">CONNECT, CREATE, COLLABORATE</text>
  </svg>
);

/* ── CEH MARK ──
   Clean vector recreation of the EC-Council C|EH wordmark, built to match the
   crisp single-color treatment used by CiscoMark/ITKraftzMark instead of a
   raster badge. `tier` selects the sub-label ("", "PRACTICAL", "MASTER") and
   `accent` drives both the glyph color and the divider-bar gradient so each
   card's watermark automatically matches its own accent (blue/red/gold). */
const CEHMark = ({ color = "currentColor", accent = "currentColor", style = {} }) => {
  const barGradId = `ceh-bar-${Math.random().toString(36).slice(2,8)}`;
  return (
    <svg viewBox="0 0 400 150" style={ style } xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={barGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
          <stop offset="50%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <g fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fill={color}>
        <text x="0" y="112" fontSize="130" letterSpacing="-4">C</text>
        <text x="168" y="112" fontSize="130" letterSpacing="-4">E</text>
        <text x="270" y="112" fontSize="130" letterSpacing="-4">H</text>
      </g>

      <rect x="122" y="6" width="9" height="128" rx="2" fill={`url(#${barGradId})`} />

      <g fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fill={color} fontSize="21" letterSpacing="0.5">
        <text x="0" y="144">Certified</text>
        <text x="168" y="144">Ethical</text>
        <text x="270" y="144">Hacker</text>
      </g>
    </svg>
  );
};

/* Maps each issuer to its mark + how to render it inside the card watermark slot */
const IssuerMark = ({ issuer, accent, isActive }) => {
  const fade = { transition: "opacity 0.4s ease", pointerEvents: "none" };

  if (issuer === "EC-Council") {
    // Vector wordmark, same treatment as CiscoMark/ITKraftzMark: single-color
    // fill driven by the card's own accent, so it always reads crisp at any
    // size instead of the old blurred raster badge.
    return (
      <CEHMark
        color={accent}
        accent={accent}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-58%)",
          width: "clamp(150px,22vw,210px)",
          height: "auto",
          opacity: isActive ? 0.22 : 0.13,
          ...fade,
        }}
      />
    );
  }

  if (issuer === "Cisco") {
    return (
      <CiscoMark
        fill={accent}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-58%)",
          width: "clamp(78px,12vw,104px)",
          height: "auto",
          opacity: isActive ? 0.16 : 0.09,
          ...fade,
        }}
      />
    );
  }

  if (issuer === "ITKraftz LLC") {
    return (
      <ITKraftzMark
        color={accent}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-58%)",
          width: "clamp(120px,19vw,160px)",
          height: "auto",
          opacity: isActive ? 0.30 : 0.18,
          ...fade,
        }}
      />
    );
  }

  return null;
};

const CERTS = [
  {
    id: "01",
    short: "CEH",
    tier: "KNOWLEDGE",
    name: "Certified Ethical Hacker",
    issuer: "EC-Council",
    desc: "Industry-standard offensive security certification covering penetration testing methodologies, attack vectors, and countermeasures across 20 domains.",
    issued: "Jul 2024",
    exp: "Aug 2027",
    link: "https://aspen.eccouncil.org/VerifyBadge?&type=certification&a=m+O5k4stBr3+uezYrzfLjWSoUMBczqWhz5yXwkwFPik=",
    accent: "#7eb8ff",
    rgb: "80,140,255",
    cardBg: "linear-gradient(145deg, rgba(10,14,28,0.99) 0%, rgba(4,8,20,1) 100%)",
  },
  {
    id: "02",
    short: "CEH-Practical",
    tier: "PRACTICAL",
    name: "Certified Ethical Hacker (Practical)",
    issuer: "EC-Council",
    desc: "Hands-on practical exam requiring real-time exploitation of live machines — no multiple choice, pure applied penetration testing under exam conditions.",
    issued: "Jul 2025",
    exp: "Aug 2028",
    link: "https://aspen.eccouncil.org/VerifyBadge?&type=certification&a=Zj6Iz6KFOooWmvfumfUlzzDzI8cbSBCRP9sPKP8YLtQ=",
    accent: "#ff5c4d",
    rgb: "255,70,55",
    cardBg: "linear-gradient(145deg, rgba(20,5,4,0.99) 0%, rgba(12,2,2,1) 100%)",
  },
  {
    id: "03",
    short: "CEH-Master",
    tier: "MASTER",
    name: "Certified Ethical Hacker (Master)",
    issuer: "EC-Council",
    desc: "EC-Council's highest ethical hacking designation — awarded upon passing both the knowledge exam and the 6-hour practical lab, proving mastery of offensive security.",
    issued: "Jul 2025",
    exp: "Aug 2028",
    link: "https://aspen.eccouncil.org/VerifyBadge?&type=certification&a=Zj6Iz6KFOooWmvfumfUlz44fWkwQQB7fq+zOnekFJxM=",
    accent: "#ffcc44",
    rgb: "255,190,40",
    cardBg: "linear-gradient(145deg, rgba(16,12,2,0.99) 0%, rgba(10,7,1,1) 100%)",
  },
  {
    id: "04",
    short: "CSE",
    tier: "FOUNDATION",
    name: "Cybersecurity Essentials",
    issuer: "Cisco",
    desc: "Foundational coverage of core security principles, CIA triad, cryptography basics, and network defense fundamentals.",
    issued: "2023",
    exp: "—",
    link: null,
    accent: "#d070ff",
    rgb: "180,60,255",
    cardBg: "linear-gradient(145deg, rgba(14,6,20,0.99) 0%, rgba(8,3,12,1) 100%)",
  },
  {
    id: "05",
    short: "ND",
    tier: "FOUNDATION",
    name: "Network Defense",
    issuer: "Cisco",
    desc: "Focused training on network security controls, firewall configuration, IDS/IPS deployment, and traffic analysis techniques.",
    issued: "2023",
    exp: "—",
    link: null,
    accent: "#2dd9c8",
    rgb: "45,215,200",
    cardBg: "linear-gradient(145deg, rgba(3,18,17,0.99) 0%, rgba(1,10,9,1) 100%)",
  },
  {
    id: "06",
    short: "DWA",
    tier: "FOUNDATION",
    name: "Dark Web Analyst",
    issuer: "ITKraftz LLC",
    desc: "Threat intelligence methods for monitoring dark web sources, identifying leaked credentials, and tracking criminal infrastructure.",
    issued: "2023",
    exp: "—",
    link: null,
    accent: "#aab4c2",
    rgb: "150,165,180",
    cardBg: "linear-gradient(145deg, rgba(8,9,12,0.99) 0%, rgba(4,5,8,1) 100%)",
  },
];

/* ── CERT CARD (single card in the fan) ── */
const SPRING = { type: "spring", stiffness: 320, damping: 32, mass: 0.8 };

const CertCard = ({ cert, offset, onClick }) => {
  const isActive = offset === 0;
  const absOff   = Math.abs(offset);

  const rotate  = offset * 11;
  const tx      = offset * 158;
  const ty      = absOff * 18;
  const scale   = isActive ? 1 : 0.80 - absOff * 0.03;
  const zIndex  = 10 - absOff;
  const opacity = isActive ? 1 : absOff === 1 ? 0.72 : 0.42;

  return (
    <motion.div
      onClick={onClick}
      animate={{ rotate, x: tx, y: ty, scale, opacity }}
      transition={SPRING}
      whileHover={!isActive ? { scale: scale + 0.03, y: ty - 5 } : {}}
      style={{
        position: "absolute",
        width: "clamp(190px,26vw,260px)",
        height: "clamp(270px,38vw,368px)",
        borderRadius: "clamp(18px,2.2vw,24px)",
        cursor: isActive ? "default" : "pointer",
        transformOrigin: "center bottom",
        willChange: "transform, opacity",
        zIndex,
        userSelect: "none",
      }}
    >
      {/* Shadow ring — pure box-shadow, no motion */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
        boxShadow: isActive
          ? `0 28px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(${cert.rgb},0.22), 0 0 40px rgba(${cert.rgb},0.1)`
          : `0 12px 36px rgba(0,0,0,0.55)`,
        transition: "box-shadow 0.45s ease",
        zIndex: 1,
      }} />

      {/* Card body */}
      <div style={{
        width: "100%", height: "100%",
        background: cert.cardBg,
        borderRadius: "inherit",
        border: isActive
          ? `1px solid rgba(${cert.rgb},0.28)`
          : "1px solid rgba(255,255,255,0.07)",
        position: "relative",
        overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "clamp(12px,2vw,18px)",
        transition: "border-color 0.4s",
      }}>

        {/* Top edge glow bar */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
          background: `linear-gradient(90deg, transparent, rgba(${cert.rgb},${isActive ? "0.9" : "0.25"}), transparent)`,
          transition: "opacity 0.4s",
          pointerEvents: "none",
        }} />

        {/* Ambient radial glow — opacity transition only, no filter */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(ellipse 90% 55% at 50% 105%, rgba(${cert.rgb},0.18) 0%, transparent 70%)`,
          opacity: isActive ? 1 : 0.3,
          transition: "opacity 0.45s ease",
        }} />

        {/* Shimmer sweep — CSS only, active card only */}
        {isActive && <div className="cert-shimmer-line" />}

        {/* Issuer watermark — fills the empty middle zone */}
        <IssuerMark issuer={cert.issuer} accent={cert.accent} isActive={isActive} />

        {/* Ghost number */}
        <div style={{
          position: "absolute", top: "12px", right: "16px",
          fontWeight: 900, fontSize: "clamp(1.9rem,5vw,2.9rem)",
          lineHeight: 1, letterSpacing: "-0.02em",
          color: "#fff", opacity: isActive ? 0.55 : 0.3,
          textShadow: isActive ? `0 0 6px rgba(255,255,255,0.5), 0 0 1px rgba(255,255,255,0.9)` : "none",
          fontFamily: "Kanit, sans-serif",
          pointerEvents: "none",
          transition: "opacity 0.4s, text-shadow 0.4s",
        }}>{cert.id}</div>

        {/* Tier badge */}
        <div style={{ position: "absolute", top: "clamp(10px,1.5vw,14px)", left: "clamp(10px,1.5vw,14px)" }}>
          <span style={{
            fontSize: "clamp(0.42rem,0.8vw,0.5rem)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em",
            padding: "3px 8px", borderRadius: "999px",
            background: `rgba(${cert.rgb},0.12)`,
            border: `1px solid rgba(${cert.rgb},0.28)`,
            color: cert.accent,
          }}>{cert.tier}</span>
        </div>

        {/* Short name badge */}
        <div style={{ marginBottom: "clamp(6px,1vw,9px)" }}>
          <span style={{
            fontSize: "clamp(0.5rem,0.9vw,0.6rem)", fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "4px 10px", borderRadius: "999px",
            background: `rgba(${cert.rgb},0.14)`,
            border: `1px solid rgba(${cert.rgb},0.32)`,
            color: cert.accent,
          }}>{cert.short}</span>
        </div>

        {/* Issuer */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "clamp(5px,0.8vw,7px)" }}>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: cert.accent, flexShrink: 0 }} />
          <span style={{
            fontSize: "clamp(0.52rem,0.85vw,0.62rem)", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em",
            color: "rgba(215,226,234,0.62)",
          }}>{cert.issuer}</span>
        </div>

        {/* Name */}
        <p style={{
          color: "#EAF1F6", fontFamily: "'Inter', sans-serif", fontWeight: 700,
          fontSize: "clamp(0.82rem,1.5vw,1.02rem)",
          lineHeight: 1.32, letterSpacing: "-0.01em",
          marginBottom: "clamp(4px,0.6vw,6px)",
        }}>{cert.name}</p>

        {/* Date */}
        <p style={{
          fontSize: "clamp(0.48rem,0.8vw,0.58rem)",
          fontFamily: "'Inter', sans-serif",
          color: "rgba(215,226,234,0.42)",
          textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500,
        }}>Issued {cert.issued}</p>

      </div>
    </motion.div>
  );
};

/* ── CERT DETAIL PANEL — fixed height, no layout shift ── */
const CertDetail = ({ cert }) => (
  <motion.div
    key={cert.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
    style={{
      position: "absolute", inset: 0,
      textAlign: "center", padding: "0 1rem",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}
  >
    <p style={{
      color: "#F1F6F9", fontFamily: "'Inter', sans-serif", fontWeight: 800,
      fontSize: "clamp(1.05rem,2.4vw,1.35rem)",
      letterSpacing: "-0.01em", marginBottom: "5px",
      lineHeight: 1.25,
    }}>{cert.name}</p>

    <p style={{
      fontSize: "0.64rem", fontFamily: "'Inter', sans-serif", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.18em", color: cert.accent,
      marginBottom: "clamp(10px,1.4vw,14px)",
    }}>{cert.issuer}</p>

    <p style={{
      color: "rgba(215,226,234,0.78)", fontFamily: "'Inter', sans-serif", fontWeight: 400,
      lineHeight: 1.75, fontSize: "clamp(0.85rem,1.4vw,0.98rem)",
      marginBottom: "clamp(12px,1.8vw,18px)",
      maxWidth: "540px",
    }}>{cert.desc}</p>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(14px,2.5vw,24px)", flexWrap: "wrap" }}>
      <div>
        <p style={{ color: "rgba(215,226,234,0.42)", fontFamily: "'Inter', sans-serif", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "3px" }}>Issued</p>
        <p style={{ color: "rgba(215,226,234,0.85)", fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", fontWeight: 600 }}>{cert.issued}</p>
      </div>

      {cert.exp !== "—" && <>
        <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
        <div>
          <p style={{ color: "rgba(215,226,234,0.42)", fontFamily: "'Inter', sans-serif", fontSize: "0.56rem", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "3px" }}>Valid until</p>
          <p style={{ color: cert.accent, fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", fontWeight: 700 }}>{cert.exp}</p>
        </div>
      </>}

      {cert.link && <>
        <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
        <motion.a
          href={cert.link} target="_blank" rel="noopener noreferrer"
          whileHover={{ background: `rgba(${cert.rgb},0.12)`, borderColor: `rgba(${cert.rgb},0.45)`, color: cert.accent }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            border: "1px solid rgba(215,226,234,0.18)", borderRadius: "999px",
            padding: "7px 18px", color: "rgba(215,226,234,0.65)",
            fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.12em", textDecoration: "none",
            fontFamily: "Kanit, sans-serif", transition: "all 0.22s",
          }}
        >
          Verify credential
          <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </motion.a>
      </>}
    </div>
  </motion.div>
);

/* ── CERTS SECTION ── */
const CertsSection = () => {
  const [active, setActive] = useState(2); /* default: CEH Master centred */
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  /* Intersection observer — triggers fan-in animation */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Keyboard nav */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft")  setActive(a => (a - 1 + CERTS.length) % CERTS.length);
      if (e.key === "ArrowRight") setActive(a => (a + 1) % CERTS.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Touch swipe */
  const touchStart = useRef(0);

  const activeCert = CERTS[active];

  return (
    <section
      id="certs"
      ref={sectionRef}
      style={{
        background: "#000",
        borderRadius: "clamp(40px,5vw,60px) clamp(40px,5vw,60px) 0 0",
        marginTop: "clamp(-2.5rem,-3vw,-3.5rem)",
        padding: "clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,4rem) clamp(5rem,9vw,9rem)",
        position: "relative", zIndex: 2,
        overflow: "hidden",
      }}
    >

      {/* ── Ambient background glow — shifts with active cert ── */}
      <motion.div
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        }}
      >
        <motion.div
          key={activeCert.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          style={{
            position: "absolute",
            top: "30%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(400px,70vw,800px)",
            height: "clamp(300px,50vw,600px)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(${activeCert.rgb},0.09) 0%, transparent 70%)`,
            animation: "cert-ambient-breathe 4s ease-in-out infinite",
          }}
        />
      </motion.div>

      {/* ── Section header ── */}
      <FadeIn delay={0} y={40} style={{ position: "relative", zIndex: 1 }}>
        <h2
          className="hero-heading"
          style={{
            fontFamily: "'Teko', sans-serif", fontWeight: 700, textTransform: "uppercase", lineHeight: 1,
            letterSpacing: "-0.01em", fontSize: "clamp(4rem,15.5vw,172px)",
            marginBottom: "0.3rem", textAlign: "center",
          }}
        >Certs</h2>
        <p style={{
          color: "rgba(215,226,234,0.2)", textAlign: "center",
          fontSize: "clamp(0.62rem,1.1vw,0.72rem)", fontWeight: 500,
          textTransform: "uppercase", letterSpacing: "0.22em",
          marginBottom: "clamp(3.5rem,7vw,6rem)",
        }}>Verified Credentials</p>
      </FadeIn>

      {/* ── Fan carousel stage ── */}
      <div
        style={{
          position: "relative", zIndex: 1,
          height: "clamp(320px,46vw,440px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "clamp(2.5rem,5vw,4rem)",
          perspective: "1000px",
        }}
        onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 40) {
            setActive(a => dx < 0
              ? (a + 1) % CERTS.length
              : (a - 1 + CERTS.length) % CERTS.length
            );
          }
        }}
      >
        {CERTS.map((cert, i) => {
          const offset = i - active;
          /* hide cards more than 2 away */
          if (Math.abs(offset) > 2) return null;
          return (
            <CertCard
              key={cert.id}
              cert={cert}
              offset={offset}
              onClick={() => offset !== 0 && setActive(i)}
            />
          );
        })}
      </div>

      {/* ── Detail panel — fixed height prevents layout shift ── */}
      <div style={{ position: "relative", zIndex: 1, height: "clamp(190px,25vw,230px)" }}>
        <CertDetail cert={activeCert} />
      </div>

      {/* ── Nav controls ── */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: "clamp(8px,1.5vw,12px)",
        marginTop: "clamp(2rem,4vw,3rem)",
      }}>
        {/* Prev arrow */}
        <motion.button
          onClick={() => setActive(a => (a - 1 + CERTS.length) % CERTS.length)}
          whileHover={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.25)", color: "#D7E2EA" }}
          whileTap={{ scale: 0.93 }}
          aria-label="Previous certificate"
          style={{
            width: "34px", height: "34px", borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(215,226,234,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </motion.button>

        {/* Dots */}
        {CERTS.map((cert, i) => (
          <motion.button
            key={cert.id}
            onClick={() => setActive(i)}
            animate={{
              width: i === active ? 24 : 6,
              background: i === active ? activeCert.accent : "rgba(255,255,255,0.15)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            whileHover={{ background: i === active ? activeCert.accent : "rgba(255,255,255,0.35)" }}
            aria-label={`Go to cert ${i + 1}`}
            style={{
              height: "6px", borderRadius: "999px",
              border: "none", cursor: "pointer", padding: 0,
            }}
          />
        ))}

        {/* Next arrow */}
        <motion.button
          onClick={() => setActive(a => (a + 1) % CERTS.length)}
          whileHover={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.25)", color: "#D7E2EA" }}
          whileTap={{ scale: 0.93 }}
          aria-label="Next certificate"
          style={{
            width: "34px", height: "34px", borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(215,226,234,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </motion.button>
      </div>

      {/* ── Count label ── */}
      <p style={{
        position: "relative", zIndex: 1,
        textAlign: "center", marginTop: "clamp(0.75rem,1.5vw,1.2rem)",
        fontSize: "0.55rem", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.2em",
        color: "rgba(215,226,234,0.2)",
      }}>
        {String(active + 1).padStart(2, "0")} / {String(CERTS.length).padStart(2, "0")}
      </p>

    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   5. PROJECTS — sticky-stack scroll with light glass treatment on dark cards
══════════════════════════════════════════════════════════════════════════════ */

const projects = [
  {
    num: "01",
    cat: "Recon / OSINT",
    badge: "RECON",
    badgeColor: "#4fffaa",
    badgeBg: "rgba(0,200,100,0.12)",
    badgeBorder: "rgba(0,200,100,0.3)",
    name: "ThreatMapper",
    tags: ["Python", "OSINT", "Multi-API", "CLI Tool"],
    tagline: '"Automated attack surface mapping — six OSINT sources chained into a single recon pipeline."',
    desc: "A Python CLI that orchestrates a full passive recon workflow: subdomain enumeration via subfinder, open port discovery through Shodan, service fingerprinting, leaked credential checks against HIBP, exposed S3 bucket detection, and GitHub dork scanning. Outputs a structured HTML report with per-finding severity ratings and remediation notes.",
    highlight: {
      label: "Impact:",
      text: "Compressed a manual 4-hour recon phase down to under 3 minutes. Report format is modelled on real-world penetration testing deliverables — structured for direct handoff to a client or security team.",
      accent: "rgba(220,30,30,0.18)",
      border: "rgba(220,30,30,0.25)",
      labelColor: "#d070ff",
    },
    techTags: ["Shodan API", "HIBP API", "subfinder", "dnspython", "Jinja2"],
  },
  {
    num: "02",
    cat: "Network Security / Blue Team",
    badge: "REAL-TIME",
    badgeColor: "#7eb8ff",
    badgeBg: "rgba(80,140,255,0.12)",
    badgeBorder: "rgba(80,140,255,0.3)",
    name: "PacketHound",
    tags: ["Python", "Scapy", "Flask", "Intrusion Detection"],
    tagline: '"A custom-built NIDS that detects port scans, ARP spoofing, and brute-force attacks in real time — validated against real malware traffic."',
    desc: "PacketHound is a network intrusion detection system built entirely from scratch using Scapy for live packet capture and analysis. It identifies port scanning behavior, ARP spoofing attempts, brute-force login patterns, and DNS tunneling anomalies as they happen — no external IDS engine, no managed cloud service. A companion PCAP analysis mode replays real-world malware traffic samples sourced from malware-traffic-analysis.net, letting the detection logic be validated against genuine attack captures rather than synthetic test data. Findings surface through a Flask-based dashboard modelled on live SOC alerting consoles.",
    highlight: {
      label: "Technical depth:",
      text: "Runs entirely on-host with zero infrastructure cost — no VPS, no third-party feed dependency. Detection logic was tuned and validated against packet captures of documented real-world attacks, giving the alerting behavior a grounding in actual adversary traffic rather than idealized lab conditions.",
      accent: "rgba(80,140,255,0.08)",
      border: "rgba(80,140,255,0.2)",
      labelColor: "#7eb8ff",
    },
    techTags: ["Scapy", "Flask", "PCAP Analysis", "ARP Spoofing Detection", "Socket Programming"],
  },
  {
    num: "03",
    cat: "Malware Research / C2",
    badge: "RED TEAM",
    badgeColor: "#ffcc44",
    badgeBg: "rgba(255,180,0,0.12)",
    badgeBorder: "rgba(255,180,0,0.3)",
    name: "ShadowShell",
    tags: ["Python", "Sockets", "Encryption", "C2 Research"],
    tagline: '"A documented C2 framework built from scratch to understand post-exploitation at the protocol level."',
    desc: "ShadowShell implements a minimal Command & Control architecture entirely in Python: an operator server that manages encrypted beacon sessions, and a lightweight agent that demonstrates core RAT capabilities — host enumeration, file system traversal, screenshot capture, and reverse shell establishment. All inter-process communication uses AES-encrypted channels over raw sockets. Every component is annotated with explanations of the underlying technique and its real-world malware equivalent.",
    highlight: {
      label: "Research value:",
      text: "Built to understand attacker tradecraft at the implementation level — how beaconing intervals evade detection, how staged payloads reduce footprint, and why AES-CBC with a static IV is a common malware mistake. Directly applicable to threat hunting and detection engineering work.",
      accent: "rgba(0,200,100,0.08)",
      border: "rgba(0,200,100,0.2)",
      labelColor: "#4fffaa",
    },
    techTags: ["sockets", "cryptography", "threading", "subprocess", "struct"],
  },
  {
    num: "04",
    cat: "SOC / Automation",
    badge: "CVE MONITOR",
    badgeColor: "#ffcc44",
    badgeBg: "rgba(255,180,0,0.12)",
    badgeBorder: "rgba(255,180,0,0.3)",
    name: "VulnWatch",
    tags: ["Python", "NVD API", "Automation", "SOC Tooling"],
    tagline: '"Continuous CVE monitoring pipeline — NVD feed ingestion, PoC cross-reference, network scan, and Slack alert in one workflow."',
    desc: "VulnWatch runs on an hourly schedule: it ingests the latest CVE entries from the NVD API, cross-references each against ExploitDB for public proof-of-concept availability, then runs a targeted python-nmap scan against a configured network range to identify hosts running vulnerable service versions. Findings are prioritised by CVSS score and dispatched as formatted Slack or Discord alerts with CVE ID, severity, affected host, and PoC availability flag.",
    highlight: {
      label: "Operational relevance:",
      text: "Mirrors the core detection loop of a real SOC vulnerability management workflow — ingest, correlate, validate, alert. The PoC availability flag reduces triage time by surfacing which CVEs carry immediate exploitation risk versus theoretical exposure.",
      accent: "rgba(255,160,0,0.12)",
      border: "rgba(255,160,0,0.25)",
      labelColor: "#ffcc44",
    },
    techTags: ["NVD API", "python-nmap", "APScheduler", "Slack webhooks", "ExploitDB"],
  },
];

/* ── TERMINAL LINE COLOR HELPER ─────────────────────────────────────────────── */
const termColor = (line) => {
  if (line.startsWith("  [✓]")) return "#4fffaa";
  if (line.startsWith("  [✗]")) return "#ff6b6b";
  if (line.startsWith("  [!]")) return "#ffcc44";
  if (line.startsWith("  [ALERT]")) return "#ff8070";
  if (line.startsWith("  [CVE")) return "#ff8070";
  if (line.startsWith("  [+]")) return "#7dd3a8";
  if (line.startsWith("  [*]") || line.startsWith("  [LOG]") || line.startsWith("  [STAT]") || line.startsWith("  [LIVE]")) return "rgba(215,226,234,0.45)";
  if (line.startsWith("  C2>")) return "#d070ff";
  if (line.startsWith("$")) return "#D7E2EA";
  return "rgba(215,226,234,0.55)";
};

/* Terminal-style code preview — animated typewriter line-by-line + blinking cursor */
const TerminalPreview = ({ project, active }) => {
  const lines = {
    "01": [
      "$ threatmapper --target acmecorp.com",
      "  [*] Starting OSINT pipeline...",
      "  [+] Subdomains found: 47",
      "  [+] Open ports: 22, 80, 443, 8080",
      "  [+] Shodan services: 12 exposed",
      "  [+] Leaked creds (HIBP): 3 hits",
      "  [+] Exposed S3 buckets: 2",
      "  [!] GitHub dork match: api_key leaked",
      "  [✓] Report: acmecorp_report.html",
    ],
    "02": [
      "$ packethound --interface eth0 --live",
      "  [*] Sniffing live traffic with Scapy...",
      "  [ALERT] Port scan detected: 10.0.0.15",
      "  [ALERT] ARP spoofing: 10.0.0.1 forged",
      "  [!] Brute-force login attempt: SSH",
      "  [!] DNS tunneling anomaly flagged",
      "  [*] Loaded PCAP: malware_sample_04.pcap",
      "  [✓] Malicious traffic pattern matched",
      "  [LIVE] Dashboard: 4 active alerts",
    ],
    "03": [
      "$ python c2_server.py --port 4444",
      "  [*] AES-CBC channel initialised",
      "  [*] Listening for beacons...",
      "  [+] Agent connected: 192.168.1.50",
      "  C2> sysinfo",
      "  [<] OS: Windows 10 · User: victim",
      "  C2> screenshot",
      "  [<] screenshot_1701.png (218 KB)",
      "  C2> reverse_shell",
    ],
    "04": [
      "$ vulnwatch --network 192.168.1.0/24",
      "  [*] Ingesting NVD feed...",
      "  [CVE-2024-1234] CVSS 9.8 — OpenSSH",
      "  [+] PoC found on ExploitDB #52841",
      "  [+] Running nmap on 192.168.1.0/24...",
      "  [+] Host 192.168.1.12 — vulnerable",
      "  [+] Host 192.168.1.34 — vulnerable",
      "  [✓] Slack alert dispatched",
      "  [*] Next scan in: 60 minutes",
    ],
  };

  const allLines = lines[project.num] || [];
  const [visibleCount, setVisibleCount] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const timerRef = useRef(null);
  const cursorRef = useRef(null);

  // Reset + replay animation whenever this card becomes active
  useEffect(() => {
    setVisibleCount(0);
    // Clear any running timers from a previous activation
    clearTimeout(timerRef.current);
    clearInterval(cursorRef.current);
    timerRef.current = null;
    cursorRef.current = null;
    if (!active) return;

    // Stagger lines: first line appears after 300ms, then one every 420ms
    let count = 0;
    const delay = 300;
    const interval = 420;
    timerRef.current = setTimeout(() => {
      count = 1;
      setVisibleCount(1);
      const ticker = setInterval(() => {
        count += 1;
        setVisibleCount(count);
        if (count >= allLines.length) clearInterval(ticker);
      }, interval);
      // Store the interval id so cleanup can clear it
      timerRef.current = ticker;
    }, delay);

    // Cursor blink
    cursorRef.current = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(timerRef.current);
      clearInterval(cursorRef.current);
    };
  }, [active, project.num]);

  return (
    <div style={{
      borderRadius: "clamp(14px,2vw,20px)",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.09)",
      background: "rgba(0,0,0,0.62)",
    }}>
      {/* Mac-style title bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "10px 16px",
        background: "rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {["#FF5F57","#FEBC2E","#28C840"].map(c => (
          <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.9 }} />
        ))}
        <span style={{
          marginLeft: "8px", color: "rgba(215,226,234,0.28)",
          fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.05em",
          fontFamily: "monospace",
        }}>~/projects/{project.name.toLowerCase()}</span>
      </div>

      {/* Terminal body — fixed height so card doesn't resize as lines appear */}
      <div style={{
        padding: "clamp(0.9rem,1.8vw,1.4rem)",
        height: "clamp(200px,22vw,280px)",
        overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "flex-start",
      }}>
        {allLines.slice(0, visibleCount).map((line, i) => (
          <motion.div
            key={`${project.num}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              fontFamily: "monospace",
              fontSize: "clamp(0.65rem,1.05vw,0.8rem)",
              lineHeight: 2,
              color: termColor(line),
              whiteSpace: "pre",
            }}
          >{line}</motion.div>
        ))}

        {/* Blinking block cursor — shows after last visible line */}
        {visibleCount > 0 && (
          <div style={{
            fontFamily: "monospace",
            fontSize: "clamp(0.65rem,1.05vw,0.8rem)",
            lineHeight: 2,
            color: "#D7E2EA",
            opacity: cursorVisible ? 0.75 : 0,
            transition: "opacity 0.08s",
            userSelect: "none",
          }}>█</div>
        )}
      </div>
    </div>
  );
};

/* Single sticky-stack project card — performance-fixed + scroll animations */
const ProjectCard = ({ project, index, total }) => {
  const ref = useRef(null);
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.95"] });
  const targetScale = 1 - (total - 1 - index) * 0.025;

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 150, damping: 32, mass: 0.5 });
  const scale = useTransform(smoothProgress, [0, 1], [0.93, targetScale]);
  const entryY = useTransform(smoothProgress, [0, 0.25], [52, 0]);
  const entryOpacity = useTransform(smoothProgress, [0, 0.18], [0, 1]);

  const [tagsVisible, setTagsVisible] = useState(false);
  const [cardActive, setCardActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setTagsVisible(true); setCardActive(true); }
        else { setCardActive(false); }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ height: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          scale, y: entryY, opacity: entryOpacity,
          position: "sticky",
          top: `${88 + index * 22}px`,
          width: "100%", maxWidth: "1100px",
          borderRadius: "clamp(28px,4vw,44px)",
          background: "linear-gradient(160deg,rgba(6,4,14,0.99) 0%,rgba(4,3,10,1) 100%)",
          border: `1px solid ${hovered ? "rgba(220,30,30,0.7)" : "rgba(255,255,255,0.1)"}`,
          boxShadow: hovered
            ? "0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)"
            : "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          padding: "clamp(1.75rem,3vw,2.75rem)",
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          transition: "border-color 0.3s, box-shadow 0.4s",
          position: "relative", overflow: "hidden",
        }}
      >


        {/* Top shimmer — brighter on hover */}
        <div style={{
          position: "absolute", top: 0, left: "8%", right: "8%", height: "1px",
          background: `linear-gradient(90deg, transparent, ${hovered ? "rgba(220,30,30,0.8)" : "rgba(220,30,30,0.35)"}, transparent)`,
          pointerEvents: "none", transition: "opacity 0.3s",
        }} />

        {/* ── Card header ── */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.1rem",
          flexWrap: "wrap", gap: "0.75rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.75rem,1.5vw,1.4rem)" }}>
            {/* Big dim index number */}
            <span style={{
              fontWeight: 900, fontSize: "clamp(3rem,7vw,5.5rem)",
              lineHeight: 1, color: "rgba(220,30,30,0.14)",
              fontFamily: "Kanit, sans-serif", letterSpacing: "0.02em",
              userSelect: "none", display: "inline-block",
            }}>{project.num}</span>
            <div>
              {/* index line above cat */}
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"4px" }}>
                <span style={{ fontFamily:"monospace", fontSize:"0.58rem", color:"rgba(220,30,30,0.5)", letterSpacing:"0.04em" }}>{project.num}</span>
                <div style={{ height:"1px", width:"18px", background:"rgba(220,30,30,0.25)" }}/>
                <span style={{ color:"rgba(215,226,234,0.28)", textTransform:"uppercase", letterSpacing:"0.18em", fontSize:"0.5rem", fontWeight:700 }}>{project.cat}</span>
              </div>
              <span style={{ color: "#D7E2EA", fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "clamp(1rem,2vw,1.5rem)", letterSpacing:"-0.02em" }}>
                {project.name}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            {project.badge && (
              <span style={{
                background: project.badgeBg,
                border: `1px solid ${project.badgeBorder}`,
                color: project.badgeColor,
                fontSize: "0.56rem", fontWeight: 700, padding: "4px 11px",
                borderRadius: "999px", letterSpacing: "0.1em", textTransform: "uppercase",
              }}>{project.badge}</span>
            )}
            {/* GitHub button — brand color on hover */}
            <motion.a
              href={project.github || "https://github.com/rajdeep-10"}
              target="_blank" rel="noopener noreferrer"
              whileHover={{ background:"#24292e", color:"#fff", borderColor:"#24292e", boxShadow:"0 4px 20px rgba(36,41,46,0.55)" }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                borderRadius: "999px",
                border: "1px solid rgba(215,226,234,0.18)",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(215,226,234,0.65)", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                textDecoration: "none", padding: "0.48rem 1.2rem",
                fontSize: "0.6rem", fontFamily: "Kanit, sans-serif",
                transition: "all 0.22s",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub ↗
            </motion.a>
          </div>
        </div>

        {/* ── Tags ── */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
          {project.tags.map((tag, ti) => (
            <span key={tag} style={{
              border: `1px solid ${ti === project.tags.length - 1 ? "rgba(255,200,60,0.28)" : "rgba(255,255,255,0.09)"}`,
              borderRadius: "999px", padding: "3px 13px",
              fontSize: "0.58rem", fontWeight: 600,
              color: ti === project.tags.length - 1 ? "#ffd060" : "rgba(215,226,234,0.38)",
              letterSpacing: "0.06em", textTransform: "uppercase",
              background: ti === project.tags.length - 1 ? "rgba(255,200,60,0.08)" : "rgba(255,255,255,0.03)",
            }}>{tag}</span>
          ))}
        </div>

        {/* ── Tagline ── */}
        <p style={{
          color: "rgba(215,226,234,0.55)", fontStyle: "italic", fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(0.78rem,1.3vw,0.92rem)", lineHeight: 1.65,
          marginBottom: "0.85rem",
        }}>{project.tagline}</p>

        {/* ── Two-column: desc + terminal ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr clamp(260px,42%,460px)",
          gap: "clamp(0.75rem,2vw,1.5rem)",
          alignItems: "start",
          marginBottom: "1rem",
        }}>
          <div>
            <p style={{
              color: "rgba(215,226,234,0.68)", fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.8,
              fontSize: "clamp(0.75rem,1.2vw,0.88rem)",
              marginBottom: "0.85rem",
            }}>{project.desc}</p>

            {/* Highlight box */}
            <div style={{
              borderRadius: "14px",
              padding: "clamp(0.65rem,1.2vw,1rem)",
              background: project.highlight.accent,
              border: `1px solid ${project.highlight.border}`,
            }}>
              <p style={{
                color: "rgba(215,226,234,0.75)", fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(0.7rem,1.1vw,0.82rem)", lineHeight: 1.7, margin: 0,
              }}>
                <span style={{ color: project.highlight.labelColor, fontWeight: 700, marginRight: "5px" }}>
                  {project.highlight.label}
                </span>
                {project.highlight.text}
              </p>
            </div>
          </div>

          {/* Terminal preview */}
          <TerminalPreview project={project} active={cardActive} />
        </div>

        {/* ── Tech stack footer ── */}
        <div style={{
          paddingTop: "0.85rem",
          borderTop: "1px solid rgba(255,255,255,0.055)",
          display: "flex", gap: "0.4rem", flexWrap: "wrap",
          alignItems: "center",
        }}>
          <span style={{ color:"rgba(215,226,234,0.18)", fontSize:"0.48rem", textTransform:"uppercase", letterSpacing:"0.16em", fontWeight:700, marginRight:"0.3rem" }}>Stack</span>
          <div style={{ width:"1px", height:"12px", background:"rgba(255,255,255,0.08)", marginRight:"0.3rem" }}/>
          {project.techTags.map((tag, ti) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.75, y: 5 }}
              animate={tagsVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: "spring", stiffness: 260, damping: 22, delay: ti * 0.055 }}
              style={{
                fontSize: "0.56rem", fontWeight: 600, padding: "3px 10px",
                borderRadius: "999px",
                color: "rgba(215,226,234,0.38)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                letterSpacing: "0.05em", display: "inline-block",
              }}
            >{tag}</motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

/* Animation C: vertical progress bar that fills as you scroll through all projects */
const ProjectsProgressBar = ({ sectionRef }) => {
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 0.1", "end 0.9"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.8 });

  return (
    <div style={{
      position: "absolute",
      left: "clamp(0.6rem,1.5vw,1.2rem)",
      top: "clamp(4rem,8vw,8rem)",
      bottom: "clamp(2rem,4vw,4rem)",
      width: "2px",
      borderRadius: "999px",
      background: "rgba(12,12,12,0.08)",
      overflow: "hidden",
      zIndex: 10,
    }}>
      <motion.div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "100%",
        scaleY,
        originY: 0,
        borderRadius: "999px",
        background: "linear-gradient(180deg, rgba(182,0,168,0.6) 0%, rgba(118,33,176,0.8) 60%, rgba(190,76,0,0.5) 100%)",
        boxShadow: "0 0 8px rgba(182,0,168,0.3)",
      }} />
      {/* Dot markers for each project */}
      {projects.map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: "50%",
          top: `${(i / (projects.length - 1)) * 100}%`,
          transform: "translate(-50%, -50%)",
          width: "5px", height: "5px",
          borderRadius: "50%",
          background: "rgba(12,12,12,0.25)",
          border: "1px solid rgba(12,12,12,0.15)",
        }} />
      ))}
    </div>
  );
};

const ProjectsSection = () => {
  const sectionRef = useRef(null);
  return (
    <section ref={sectionRef} id="projects" style={{
      background: "#fff",
      borderRadius: "clamp(40px,5vw,60px) clamp(40px,5vw,60px) 0 0",
      marginTop: "clamp(-2.5rem,-3vw,-3.5rem)",
      padding: "clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,4rem)",
      position: "relative", zIndex: 3,
    }}>
      {/* Animation C: progress bar */}
      <ProjectsProgressBar sectionRef={sectionRef} />

      <FadeIn delay={0} y={40}>
        <div style={{ marginBottom: "clamp(3rem,6vw,6rem)" }}>
          <h2 style={{
            color: "#0C0C0C", fontFamily: "'Teko', sans-serif", fontWeight: 700, textTransform: "uppercase",
            lineHeight: 1, letterSpacing: "-0.01em",
            fontSize: "clamp(4rem,15.5vw,172px)",
            marginBottom: "clamp(1rem,2vw,1.5rem)",
          }}>Projects</h2>
          <p style={{
              color: "rgba(12,12,12,0.65)", fontWeight: 400,
              fontSize: "clamp(0.82rem,1.4vw,1rem)", lineHeight: 1.6,
              maxWidth: "560px",
            }}>
              Five hands-on security tools — built from scratch to learn how attacks work at the code level. Each one solves a real problem in offensive or defensive security.
            </p>
        </div>
      </FadeIn>
      {projects.map((p, i) => (
        <ProjectCard key={p.num} project={p} index={i} total={projects.length} />
      ))}
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   6. EXPERIENCE
══════════════════════════════════════════════════════════════════════════════ */
const exp = [
  {
    num: "01", role: "Penetration Tester Intern",
    company: "Hacktify Cyber Security", period: "Feb 2024 – Mar 2024",
    tags: ["Nmap", "Metasploit", "SQL Injection", "Web App Testing"],
    points: [
      "Executed black-box and grey-box penetration tests against client web applications and internal network infrastructure — using Nmap for reconnaissance and Metasploit for controlled, scoped exploit delivery.",
      "Identified critical SQL Injection vulnerabilities and privilege-escalating misconfigurations, delivering CVSS-scored remediation reports to client security teams.",
    ],
  },
  {
    num: "02", role: "Threat Intelligence Analyst Intern",
    company: "ITKraftz Cyber Cell", period: "May 2023 – Nov 2023",
    tags: ["Wireshark", "MITRE ATT&CK", "IOC Correlation", "Incident Response"],
    points: [
      "Monitored and analysed network packet captures using Wireshark to identify anomalous traffic patterns, C2 beaconing behaviour, and suspicious lateral movement indicators.",
      "Correlated IOCs against threat feeds and MITRE ATT&CK TTPs to produce structured intelligence reports, supporting incident response and detection hardening.",
    ],
  },
  {
    num: "03", role: "Cyber Security Trainee",
    company: "Asparrow Tech", period: "Jun 2022 – Jun 2023",
    tags: ["Burp Suite", "Nmap", "Wireshark", "Metasploit"],
    points: [
      "Completed a 12-month structured security training programme covering web app pentesting, network vulnerability assessment, exploit development fundamentals, and defensive architecture.",
      "Built practical proficiency with Burp Suite, Nmap, Wireshark and Metasploit through guided labs and simulated real-world attack scenarios.",
    ],
  },
];

const EXP_ACCENT = "#ff3b3b";
const EXP_ACCENT_DARK = "#8a0f18";

/* ── EXPERIENCE SIDEBAR ITEM ─────────────────────────────────────────────── */
const ExpSideItem = ({ e, index, active, onSelect }) => (
  <div
    onClick={() => onSelect(index)}
    style={{
      position: "relative", cursor: "pointer", overflow: "hidden",
      display: "flex", alignItems: "center", flex: 1,
      padding: "0 56px 0 18px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      background: active ? "linear-gradient(90deg, rgba(255,59,59,0.07), transparent 70%)" : "transparent",
      transition: "background 0.3s ease",
    }}
  >
    <span style={{
      position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
      fontSize: "26px", fontWeight: 900, letterSpacing: "-0.02em", zIndex: 1,
      color: active ? "rgba(255,80,70,0.55)" : "rgba(255,255,255,0.05)",
      textShadow: active ? `0 0 6px ${EXP_ACCENT}88, 0 0 1px ${EXP_ACCENT}` : "none",
      transition: "color 0.3s ease, text-shadow 0.3s ease",
      pointerEvents: "none",
    }}>{e.num}</span>

    {active && (
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
        background: `linear-gradient(180deg, ${EXP_ACCENT}, ${EXP_ACCENT_DARK})`,
        boxShadow: `0 0 12px ${EXP_ACCENT}aa`,
      }} />
    )}

    <div style={{ position: "relative", zIndex: 2, maxWidth: "150px" }}>
      <p style={{
        fontSize: "12.5px", fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.06em",
        textTransform: "uppercase", lineHeight: 1.3,
        color: active ? "#fff" : "rgba(215,226,234,0.55)",
      }}>{e.company}</p>
      <p style={{
        fontSize: "9.5px", fontFamily: "'Inter', sans-serif", color: "rgba(215,226,234,0.3)",
        letterSpacing: "0.05em", marginTop: "4px", textTransform: "uppercase",
        lineHeight: 1.3,
      }}>{e.role}</p>
    </div>
  </div>
);


/* ── EXPERIENCE SHOWCASE PANEL ─────────────────────────────────────────── */
const ExpShowcase = ({ e }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={e.num}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        flex: 1, padding: "48px 64px", display: "flex", flexDirection: "column",
        justifyContent: "center", position: "relative", zIndex: 2, maxWidth: "720px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
        <span style={{ fontSize: "12px", letterSpacing: "0.2em", color: EXP_ACCENT, fontWeight: 700, textTransform: "uppercase" }}>
          Log Entry — {e.num}
        </span>
        <span style={{
          background: "rgba(255,255,255,0.04)", border: `1px solid ${EXP_ACCENT}40`,
          padding: "7px 16px", borderRadius: "999px",
          fontSize: "10.5px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.65)",
          fontWeight: 500, whiteSpace: "nowrap",
        }}>{e.period}</span>
      </div>

      <h3 style={{
        fontSize: "clamp(2.4rem, 4vw, 3.6rem)", fontFamily: "'Inter', sans-serif", fontWeight: 900,
        textTransform: "uppercase", letterSpacing: "-0.01em",
        color: "#fff", lineHeight: 1, marginBottom: "8px",
      }}>{e.role}</h3>

      <div style={{
        fontSize: "13px", fontFamily: "'Inter', sans-serif", color: "rgba(215,226,234,0.45)",
        letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
        marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px",
      }}>
        <span style={{ width: "28px", height: "2px", background: `linear-gradient(90deg, ${EXP_ACCENT}, ${EXP_ACCENT_DARK})`, display: "inline-block" }} />
        {e.company}
      </div>

      {e.points.map((pt, pi) => (
        <p key={pi} style={{
          color: "rgba(215,226,234,0.78)", fontFamily: "'Inter', sans-serif", fontSize: "14.5px", lineHeight: 1.85,
          maxWidth: "560px", marginBottom: "14px", fontWeight: 400,
        }}>{pt}</p>
      ))}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "26px", maxWidth: "560px" }}>
        {e.tags.map((tag) => (
          <span key={tag} style={{
            border: `1px solid ${EXP_ACCENT}40`, background: `${EXP_ACCENT}0f`,
            color: "rgba(255,180,170,0.9)", fontFamily: "'Inter', sans-serif", fontSize: "10.5px", letterSpacing: "0.05em",
            fontWeight: 500, padding: "6px 14px", borderRadius: "999px", textTransform: "uppercase",
          }}>{tag}</span>
        ))}
      </div>
    </motion.div>
  </AnimatePresence>
);

const ExperienceSection = () => {
  const [active, setActive] = useState(0);
  const current = exp[active];

  return (
    <section id="experience" style={{
      background: "#000",
      borderRadius: "clamp(40px,5vw,60px) clamp(40px,5vw,60px) 0 0",
      marginTop: "clamp(-2.5rem,-3vw,-3.5rem)",
      padding: "clamp(5rem,10vw,10rem) clamp(1.5rem,5vw,4rem)",
      position: "relative", zIndex: 4,
    }}>
      <FadeIn delay={0} y={40}>
        <h2 className="hero-heading" style={{
          fontFamily: "'Teko', sans-serif", fontWeight: 700, textTransform: "uppercase", lineHeight: 1,
          letterSpacing: "-0.01em", fontSize: "clamp(4rem,15.5vw,172px)",
          marginBottom: "0.4rem", textAlign: "center",
        }}>Experience</h2>
        <p style={{
          color: "rgba(215,226,234,0.25)", textAlign: "center", fontWeight: 400,
          fontSize: "clamp(0.82rem,1.4vw,0.95rem)", letterSpacing: "0.1em",
          textTransform: "uppercase", marginBottom: "clamp(3rem,6vw,5rem)",
        }}>Internships · Training · Hands-On Security Work</p>
      </FadeIn>

      <FadeIn delay={0.1} y={30}>
        <div className="exp-stage" style={{
          maxWidth: "1180px", margin: "0 auto", background: "#0a0a0d",
          borderRadius: "20px", overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
          position: "relative",
        }}>
          {/* top status bar — terminal/session style, fits the security theme */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: EXP_ACCENT, boxShadow: `0 0 10px ${EXP_ACCENT}cc`,
                display: "inline-block", flexShrink: 0,
              }} />
              <span style={{
                fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase",
                fontWeight: 600, color: "rgba(215,226,234,0.55)",
              }}>Career Timeline</span>
            </div>
            <span style={{
              fontSize: "11px", letterSpacing: "0.1em", color: "rgba(215,226,234,0.3)",
              fontFamily: "monospace",
            }}>
              {String(active + 1).padStart(2, "0")} / {String(exp.length).padStart(2, "0")}
            </span>
          </div>

          <div className="exp-panel-grid" style={{ display: "flex", height: "clamp(540px, 62vw, 640px)" }}>
            {/* sidebar */}
            <div className="exp-sidebar" style={{
              width: "230px", flexShrink: 0, display: "flex", flexDirection: "column",
              borderRight: "1px solid rgba(255,255,255,0.05)",
            }}>
              {exp.map((e, i) => (
                <ExpSideItem key={e.num} e={e} index={i} active={i === active} onSelect={setActive} />
              ))}
            </div>

            {/* showcase */}
            <div style={{
              flex: 1, position: "relative", display: "flex", alignItems: "stretch",
              background: "radial-gradient(circle at 15% 30%, rgba(255,59,59,0.05), transparent 60%)",
            }}>
              <ExpShowcase e={current} />
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   7. CTF SECTION  —  white bg, follows black Experience  [REVAMPED v6 — PREMIUM]
══════════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────────
   THM STATS  ─  Edit directly on the website (hover card → settings icon)
   or update defaults here. Saved to Supabase (site_content table), live for all visitors.
───────────────────────────────────────────────────────────────────────────── */
const THM_DEFAULTS = {
  rank:       "Seeker",
  points:     "1200",
  roomsDone:  "42",
  streak:     "14",
  topPercent: "8",
  profileUrl: "https://tryhackme.com/p/VoidxD",
};

/* ─────────────────────────────────────────────────────────────────────────────
   HTB STATS  ─  Edit directly on the website (hover card → settings icon)
   or update defaults here. Saved to Supabase (site_content table), live for all visitors.
───────────────────────────────────────────────────────────────────────────── */
const HTB_DEFAULTS = {
  rank:       "Beginner",        // Beginner → Apprentice → Skilled → Professional → Master → Prodigy → Grandmaster
  level:      "11",
  xpCurrent:  "294",
  xpNeeded:   "347",
  machinesDone:   "0",
  machinesTotal:  "543",
  sherlocksDone:  "0",
  sherlocksTotal: "158",
  challengesDone:  "0",
  challengesTotal: "837",
  profileUrl: "https://app.hackthebox.com/profile/",
};

/* ─────────────────────────────────────────────────────────────────────────────
   CTF ACTIVITY TIMELINE  ─  Pre-populated with example entries.
   Each entry: { platform, name, type, difficulty, date, note? }
   platform: "HTB" | "THM" | "VulnHub"
   type: "Machine" | "Challenge" | "Event"
   difficulty: "Easy" | "Medium" | "Hard"
───────────────────────────────────────────────────────────────────────────── */
const CTF_TIMELINE_DEFAULTS = [
  { platform: "HTB",     name: "Lame",          type: "Machine",   difficulty: "Easy",   date: "Jan 2025", note: "Classic Samba exploit — CVE-2007-2447" },
  { platform: "THM",     name: "RootMe",        type: "Machine",   difficulty: "Easy",   date: "Feb 2025", note: "File upload bypass → SUID escalation" },
  { platform: "HTB",     name: "Blue",          type: "Machine",   difficulty: "Easy",   date: "Mar 2025", note: "EternalBlue MS17-010 exploitation" },
  { platform: "VulnHub", name: "Basic Pentesting 1", type: "Machine", difficulty: "Easy", date: "Apr 2025", note: "Enumeration and brute force basics" },
  { platform: "THM",     name: "Pickle Rick",   type: "Machine",   difficulty: "Easy",   date: "May 2025", note: "Web source recon + command injection" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CTF EVENTS / COMPETITIONS  ─  Add competitions here.
   Each entry: { name, organiser, date, placement?, team?, note?, tags[] }
───────────────────────────────────────────────────────────────────────────── */
const CTF_EVENTS = [
  { name: "picoCTF 2025",          organiser: "CMU",          date: "Mar 2025", placement: "Top 15%", team: "Solo",  tags: ["Web","Forensics","Crypto"],   note: "1240 pts — strong forensics run" },
  { name: "HTB University CTF",    organiser: "HackTheBox",   date: "Dec 2024", placement: null,      team: "Solo",  tags: ["Web","Pwn","Rev"],           note: "First 24hr competitive event" },
  { name: "TryHackMe Advent 2024", organiser: "TryHackMe",    date: "Dec 2024", placement: null,      team: "Solo",  tags: ["Misc","Crypto","OSINT"],     note: "Completed all 24 daily challenges" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   WRITE-UPS  ─  Add your writeups here. Cards auto-appear.
   Each entry: { title, platform, difficulty, tags[], medium?, github?, date }
   platform: "HTB" | "THM" | "CTF"
   difficulty: "Easy" | "Medium" | "Hard"
   Leave medium/github as null if you haven't published yet —
   the button will be hidden automatically.
───────────────────────────────────────────────────────────────────────────── */
const WRITEUPS = [
  /* ← Add writeup objects here when you publish them. Example:
  {
    title:      "Lame",
    platform:   "HTB",
    difficulty: "Easy",
    tags:       ["Linux", "Samba", "CVE-2007-2447"],
    medium:     "https://medium.com/@VoidxD/...",
    github:     null,
    date:       "Jan 2025",
  },
  */
];

/* ── PLATFORM CONFIG (colours, labels) ─────────────────────────────────────── */
const PLATFORM = {
  HTB:     { color: "#9fef00", bg: "rgba(159,239,0,0.08)",  border: "rgba(159,239,0,0.25)",  label: "Hack The Box" },
  THM:     { color: "#ff4444", bg: "rgba(255,68,68,0.08)",  border: "rgba(255,68,68,0.25)",  label: "TryHackMe"    },
  VulnHub: { color: "#ff9500", bg: "rgba(255,149,0,0.08)",  border: "rgba(255,149,0,0.25)",  label: "VulnHub"      },
  CTF:     { color: "#7c6af7", bg: "rgba(124,106,247,0.08)",border: "rgba(124,106,247,0.25)",label: "CTF Event"    },
};

const DIFF = {
  Easy:   { color: "#4fffaa", bg: "rgba(79,255,170,0.1)",  border: "rgba(79,255,170,0.28)"  },
  Medium: { color: "#ffcc44", bg: "rgba(255,204,68,0.1)",  border: "rgba(255,204,68,0.28)"  },
  Hard:   { color: "#ff6060", bg: "rgba(255,96,96,0.1)",   border: "rgba(255,96,96,0.28)"   },
};

const THM_RANKS     = ["Noob","Script Kiddie","Hacker","Pro Hacker","Elite Hacker","Master","God"];
const HTB_RANKS     = ["Noob","Script Kiddie","Hacker","Pro Hacker","Elite Hacker","Guru","Omniscient"];

/* ─── THM OFFICIAL LOGO ─────────────────────────────────────────────────────
   Exact Simple Icons path (CC0) — the real THM brand mark:
   a cloud shape with two network-node dots dangling below it,
   representing the platform's browser-based hands-on hacking cloud.
   Brand colour: #212C42 (dark navy) on white, or white on #C11111.
   We render it white on a #C11111 (THM red) rounded-square background.
─────────────────────────────────────────────────────────────────────────── */
const THMOfficialLogo = ({ size = 44 }) => (
  <div style={{
    width: size, height: size, borderRadius: Math.round(size * 0.2),
    background: "#C11111",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 10px rgba(193,17,17,0.5)",
  }}>
    {/* Official Simple Icons TryHackMe path — viewBox 0 0 24 24, scaled to ~70% of container */}
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={Math.round(size * 0.62)}
      height={Math.round(size * 0.62)}
      fill="white"
    >
      <path d="M10.705 0C7.54 0 4.902 2.285 4.349 5.291a4.525 4.525 0 0 0-4.107 4.5 4.525 4.525 0 0 0 4.52 4.52h6.761a.625.625 0 1 0 0-1.25H4.761a3.273 3.273 0 0 1-3.27-3.27A3.273 3.273 0 0 1 6.59 7.08a.625.625 0 0 0 .7-1.035 4.488 4.488 0 0 0-1.68-.69 5.223 5.223 0 0 1 5.096-4.104 5.221 5.221 0 0 1 5.174 4.57 4.489 4.489 0 0 0-.488.305.625.625 0 1 0 .731 1.013 3.245 3.245 0 0 1 1.912-.616 3.278 3.278 0 0 1 3.203 2.61.625.625 0 0 0 1.225-.251 4.533 4.533 0 0 0-4.428-3.61 4.54 4.54 0 0 0-.958.105C16.556 2.328 13.9 0 10.705 0zm5.192 10.64a.925.925 0 0 0-.462.108.913.913 0 0 0-.313.29 1.27 1.27 0 0 0-.175.427 2.39 2.39 0 0 0-.054.514c0 .181.018.353.054.517.036.164.095.307.175.43a.899.899 0 0 0 .313.297c.127.073.281.11.462.11.18 0 .334-.037.46-.11a.897.897 0 0 0 .309-.296c.08-.124.137-.267.173-.431.036-.164.054-.336.054-.517 0-.18-.018-.352-.054-.514a1.271 1.271 0 0 0-.173-.426.901.901 0 0 0-.309-.291.917.917 0 0 0-.46-.108zm6.486 0a.925.925 0 0 0-.462.108.913.913 0 0 0-.313.29 1.27 1.27 0 0 0-.175.427 2.39 2.39 0 0 0-.053.514c0 .181.017.353.053.517.036.164.095.307.175.43a.899.899 0 0 0 .313.297c.127.073.281.11.462.11.18 0 .334-.037.46-.11a.897.897 0 0 0 .31-.296c.078-.124.136-.267.172-.431.036-.164.054-.336.054-.517 0-.18-.018-.352-.054-.514a1.271 1.271 0 0 0-.173-.426.901.901 0 0 0-.308-.291.916.916 0 0 0-.461-.108zm-8.537.068l-.84.618.313.43.476-.368v1.877h.603v-2.557zm6.486 0l-.841.618.314.43.477-.368v1.877h.603v-2.557zm-4.435.445c.08 0 .143.028.193.084.05.057.087.127.114.21.026.083.044.173.054.269a2.541 2.541 0 0 1 0 .533c-.01.097-.028.187-.054.27a.584.584 0 0 1-.114.209.265.265 0 0 1-.193.083.265.265 0 0 1-.192-.083.578.578 0 0 1-.114-.21 1.48 1.48 0 0 1-.054-.269 2.541 2.541 0 0 1 0-.533c.01-.096.028-.186.054-.268a.586.586 0 0 1 .114-.21.264.264 0 0 1 .192-.085zm6.485 0c.08 0 .144.028.194.084a.576.576 0 0 1 .113.21c.026.082.044.172.054.268a2.541 2.541 0 0 1 0 .533 1.484 1.484 0 0 1-.054.27.584.584 0 0 1-.113.208.264.264 0 0 1-.194.083.264.264 0 0 1-.192-.083.578.578 0 0 1-.114-.21 1.48 1.48 0 0 1-.053-.268 2.541 2.541 0 0 1 0-.533c.009-.096.027-.186.053-.268a.586.586 0 0 1 .114-.21.264.264 0 0 1 .192-.084z"/>
    </svg>
  </div>
);

/* ─── HTB OFFICIAL LOGO ─────────────────────────────────────────────────────
   Exact Simple Icons path (CC0) — the real HTB brand mark:
   a 3-D isometric box / hexagonal prism shape seen from above-front,
   made of three rhombus faces forming a cube.
   Brand colour: #9FEF00 (acid green) on #141D2B (dark navy).
   We render it #9FEF00 on a #141D2B rounded-square background.
─────────────────────────────────────────────────────────────────────────── */
const HTBOfficialLogo = ({ size = 44 }) => (
  <div style={{
    width: size, height: size, borderRadius: Math.round(size * 0.2),
    background: "#141D2B",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 10px rgba(20,29,43,0.7)",
  }}>
    {/* Official Simple Icons HackTheBox path — viewBox 0 0 24 24 */}
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={Math.round(size * 0.65)}
      height={Math.round(size * 0.65)}
      fill="#9FEF00"
    >
      <path d="M11.9959.0008a1.1187 1.1187 0 00-.057.002.8993.8993 0 00-.2358.0498.9067.9067 0 00-.1652.079L1.9357 5.675a.889.889 0 00-.4444.7699c0 .006.0004.0128.0006.0192-.0002.007 0 .014 0 .0212V17.556a.889.889 0 00.469.7837l9.5983 5.5416c.018.0102.036.0197.054.0287v.002a.8568.8568 0 00.083.0348c0 .001.01.003.012.004.028.01.056.0177.085.0245.01.001.011.003.016.004.028.006.057.0112.086.0146 0 .0005.01.0009.014.001.03.003.061.005.091.005s.061-.002.091-.005c0-.0005.01-.0009.014-.001a.6831.6831 0 00.086-.0146c.01-.001.011-.002.016-.004a.9404.9404 0 00.085-.0245c0-.001.01-.003.012-.004a.8818.8818 0 00.083-.0347v-.002a1.086 1.086 0 00.054-.0287l9.5986-5.5416a.889.889 0 00.4689-.7837V6.4786c0-.009-.0006-.0172-.0008-.0258h.0003v-.008a.8886.8886 0 00-.3117-.6755c-.01-.008-.019-.0162-.029-.0241 0-.002-.01-.005-.01-.007a.8988.8988 0 00-.1074-.0705L12.4533.1267a.8872.8872 0 00-.4646-.1266zm.01 2.2523c.072 0 .1443.0187.209.056l6.5366 3.774c.2789.161.2789.5633 0 .7243l-6.5367 3.774a.4182.4182 0 01-.4182 0L5.26 6.8074c-.2788-.1609-.2789-.5633 0-.7243l6.5368-3.774a.4193.4193 0 01.209-.056zm-8.0801 6.458a.4145.4145 0 01.215.0565l6.524 3.7666a.417.417 0 01.2086.3612v7.5326c0 .3212-.3477.522-.626.3613l-6.5237-3.7666a.4172.4172 0 01-.2086-.3613V9.1288c0-.2408.1955-.414.4107-.4177zm16.1599 0c.215.004.4107.1768.4107.4177v7.5325c0 .149-.08.2868-.2087.3614l-6.5239 3.7666c-.278.1606-.6258-.0401-.6258-.3614v-7.5325c0-.149.08-.2867.2086-.3613l6.5238-3.7666a.415.415 0 01.2152-.0565z"/>
    </svg>
  </div>
);

/* ─── VulnHub LOGO ──────────────────────────────────────────────────────────── */
const VulnHubLogo = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#1a1a1a"/>
    {/* V shape */}
    <path d="M20 28 L50 72 L80 28" stroke="#ff9500" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Hub dot */}
    <circle cx="50" cy="72" r="5" fill="#ff9500"/>
    {/* Top corners glow dots */}
    <circle cx="20" cy="28" r="4" fill="#ff9500" opacity="0.6"/>
    <circle cx="80" cy="28" r="4" fill="#ff9500" opacity="0.6"/>
  </svg>
);

/* ─── MEDIUM ICON ───────────────────────────────────────────────────────────── */
const MediumBrandBtn = ({ href }) => (
  <motion.a
    href={href} target="_blank" rel="noopener noreferrer"
    whileHover={{ scale: 1.05, background: "#000", color: "#fff", borderColor: "#000", boxShadow: "0 4px 18px rgba(0,0,0,0.35)" }}
    whileTap={{ scale: 0.96 }}
    style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      background: "#fff", color: "#000", border: "1.5px solid #000",
      borderRadius: "999px", padding: "6px 14px",
      fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", textDecoration: "none",
      fontFamily: "Kanit, sans-serif", transition: "all 0.2s",
    }}
  >
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
    </svg>
    Medium
  </motion.a>
);

/* ─── GITHUB ICON ───────────────────────────────────────────────────────────── */
const GitHubBrandBtn = ({ href }) => (
  <motion.a
    href={href} target="_blank" rel="noopener noreferrer"
    whileHover={{ scale: 1.05, background: "#24292e", color: "#fff", borderColor: "#24292e", boxShadow: "0 4px 18px rgba(36,41,46,0.4)" }}
    whileTap={{ scale: 0.96 }}
    style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      background: "rgba(36,41,46,0.08)", color: "#24292e", border: "1.5px solid rgba(36,41,46,0.35)",
      borderRadius: "999px", padding: "6px 14px",
      fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", textDecoration: "none",
      fontFamily: "Kanit, sans-serif", transition: "all 0.2s",
    }}
  >
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
    GitHub
  </motion.a>
);

/* ─── SETTINGS ICON ─────────────────────────────────────────────────────────── */
const SettingsIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════════════════════
/* ══════════════════════════════════════════════════════════════════════════════
   PLATFORM HUD  —  THM + HTB merged into one big unified glass card
══════════════════════════════════════════════════════════════════════════════ */
const THM_RANK_ORDER = ["Neophyte","Apprentice","Pathfinder","Seeker","Visionary","Voyager","Adept","Hacker","Mage","Wizard","Master","Guru","Legend","Guardian","TITAN","SAGE","VANGUARD","SHOGUN","ASCENDED","MYTHIC","GRANDMASTER"];
const THM_RANK_THRESHOLDS = [0,200,500,1000,1500,2000,3000,4000,8000,12000,15000,17000,20000,35000,50000,65000,80000,95000,110000,130000,150000];
const HTB_RANK_ORDER = ["Beginner","Apprentice","Skilled","Professional","Master","Prodigy","Grandmaster"];

const PlatformHUD = () => {
  const { isAdmin } = useAuth();

  /* ── THM state (Supabase-backed, live for all visitors) ── */
  const { value: thmStats, setValue: setThmStats } = useSiteContent("thm_stats", THM_DEFAULTS);
  const [thmDraft,   setThmDraft]   = useState({ ...THM_DEFAULTS });
  const [thmEditing, setThmEditing] = useState(false);

  /* ── HTB state (Supabase-backed, live for all visitors) ── */
  const { value: htbStats, setValue: setHtbStats } = useSiteContent("htb_stats", HTB_DEFAULTS);
  const [htbDraft,   setHtbDraft]   = useState({ ...HTB_DEFAULTS });
  const [htbEditing, setHtbEditing] = useState(false);

  const [hovered, setHovered] = useState(false);

  const saveTHM = async () => { await setThmStats({ ...thmDraft }); setThmEditing(false); };
  const saveHTB = async () => { await setHtbStats({ ...htbDraft }); setHtbEditing(false); };

  const thmRankIdx = THM_RANK_ORDER.indexOf(thmStats.rank);
  const thmPointsNum = parseInt(String(thmStats.points).replace(/[^0-9]/g, ""), 10) || 0;
  const thmFill    = Math.max(0, Math.min(100, Math.round((thmPointsNum / THM_RANK_THRESHOLDS[THM_RANK_THRESHOLDS.length - 1]) * 100)));
  const htbXpCur   = parseInt(String(htbStats.xpCurrent).replace(/[^0-9]/g, ""), 10) || 0;
  const htbXpNeed  = parseInt(String(htbStats.xpNeeded).replace(/[^0-9]/g, ""), 10) || 1;
  const htbFill    = Math.max(0, Math.min(100, Math.round((htbXpCur / htbXpNeed) * 100)));

  const iStyle = (accent) => ({
    width: "100%", background: `${accent}0f`, border: `1px solid ${accent}30`,
    borderRadius: "10px", padding: "0.6rem 0.85rem", color: "#D7E2EA",
    fontFamily: "Kanit,sans-serif", fontSize: "0.82rem", outline: "none",
  });

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          maxWidth: "1100px", margin: "0 auto",
          background: "linear-gradient(160deg,rgba(4,4,12,0.99) 0%,rgba(2,2,8,0.995) 100%)",
          border: `1px solid ${hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)"}`,
          borderRadius: "clamp(28px,4vw,44px)",
          position: "relative", overflow: "hidden",
          boxShadow: hovered
            ? "0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)"
            : "0 28px 70px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
          transition: "border-color 0.35s, box-shadow 0.4s",
        }}
      >
        {/* Ambient glow blobs */}
        <div style={{ position:"absolute", top:"-30%", left:"15%", width:"35%", height:"70%", background:"rgba(193,17,17,0.06)", borderRadius:"50%", filter:"blur(60px)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"-30%", right:"15%", width:"35%", height:"70%", background:"rgba(159,239,0,0.04)", borderRadius:"50%", filter:"blur(60px)", pointerEvents:"none" }}/>

        {/* Top HUD bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "clamp(0.75rem,1.5vw,1rem) clamp(1.5rem,3.5vw,2.75rem)",
          borderBottom: "1px solid rgba(255,255,255,0.055)",
          background: "rgba(255,255,255,0.018)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#9fef00", boxShadow:"0 0 8px #9fef0080", animation:"hud-pulse 1.8s ease-in-out infinite" }}/>
            <span style={{ color:"rgba(215,226,234,0.3)", fontSize:"0.5rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em" }}>CTF Platforms</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"6px", background:"rgba(159,239,0,0.08)", border:"1px solid rgba(159,239,0,0.28)", borderRadius:"999px", padding:"4px 14px 4px 10px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#9fef00", boxShadow:"0 0 7px rgba(159,239,0,0.9)", animation:"hud-pulse 2s ease-in-out infinite", flexShrink:0 }}/>
            <span style={{ color:"#9fef00", fontSize:"0.5rem", fontWeight:800, letterSpacing:"0.16em", textTransform:"uppercase" }}>2 Platforms Active</span>
          </div>
        </div>

        {/* Two-column grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1px 1fr" }}>

          {/* ═══ LEFT: TryHackMe ═══ */}
          <div style={{ padding:"clamp(1.75rem,3.5vw,2.75rem)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:"10%", right:"50%", height:"1px", background:"linear-gradient(90deg,transparent,rgba(193,17,17,0.55),transparent)", pointerEvents:"none" }}/>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.6rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.9rem" }}>
                <THMOfficialLogo size={42} />
                <div>
                  <p style={{ color:"rgba(193,17,17,0.55)", fontSize:"0.5rem", textTransform:"uppercase", letterSpacing:"0.2em", fontWeight:700, margin:0 }}>CTF Platform</p>
                  <p style={{ color:"#D7E2EA", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"clamp(1rem,2vw,1.35rem)", letterSpacing:"-0.01em", margin:"2px 0 0" }}>TryHackMe</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:"0.4rem", alignItems:"center" }}>
                <motion.a href={thmStats.profileUrl} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale:1.05, background:"rgba(193,17,17,0.18)" }}
                  style={{ display:"inline-flex", alignItems:"center", gap:"0.35rem", border:"1px solid rgba(193,17,17,0.3)", borderRadius:"999px", color:"#C11111", padding:"0.42rem 1rem", fontSize:"0.58rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", textDecoration:"none", fontFamily:"Kanit,sans-serif", background:"rgba(193,17,17,0.07)", transition:"all 0.2s" }}>
                  @VoidxD
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </motion.a>
                {isAdmin && (
                  <motion.button
                    onClick={() => { setThmDraft({...thmStats}); setThmEditing(true); }}
                    initial={{ opacity:0, scale:0.8 }}
                    animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
                    transition={{ duration:0.2 }}
                    whileHover={{ background:"rgba(193,17,17,0.18)" }}
                    style={{ width:30, height:30, borderRadius:"50%", border:"1px solid rgba(193,17,17,0.25)", background:"rgba(193,17,17,0.07)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}>
                    <SettingsIcon size={13} color="#C11111" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Rank bar */}
            <div style={{ marginBottom:"1.4rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.45rem" }}>
                <span style={{ color:"rgba(215,226,234,0.4)", fontSize:"0.56rem", textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:600 }}>Rank</span>
                <span style={{ color:"#C11111", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"0.84rem" }}>{thmStats.rank}</span>
              </div>
              <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"999px", overflow:"hidden" }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${thmFill}%` }} transition={{ duration:1.2, ease:[0.22,1,0.36,1], delay:0.3 }}
                  style={{ height:"100%", borderRadius:"999px", background:"linear-gradient(90deg,rgba(193,17,17,0.5),#C11111,#ff4444)", boxShadow:"0 0 8px rgba(193,17,17,0.5)" }}/>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.5rem", marginBottom:"1.2rem" }}>
              {[
                { label:"Points",  value: thmStats.points    },
                { label:"Rooms",   value: thmStats.roomsDone },
                { label:"Streak",  value: `🔥${thmStats.streak}d` },
                { label:"Top",     value: `${thmStats.topPercent}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background:"rgba(193,17,17,0.05)", border:"1px solid rgba(193,17,17,0.12)", borderRadius:"12px", padding:"0.75rem 0.4rem", textAlign:"center" }}>
                  <span style={{ display:"block", color:"#D7E2EA", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"clamp(0.85rem,1.8vw,1.1rem)", lineHeight:1 }}>{value}</span>
                  <span style={{ display:"block", color:"rgba(215,226,234,0.28)", fontSize:"0.46rem", textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:600, marginTop:"3px" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Badge */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.6rem 0.85rem", background:"rgba(193,17,17,0.05)", border:"1px solid rgba(193,17,17,0.1)", borderRadius:"10px" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#C11111", boxShadow:"0 0 6px rgba(193,17,17,0.8)", flexShrink:0 }}/>
              <span style={{ color:"rgba(215,226,234,0.4)", fontSize:"0.6rem", letterSpacing:"0.04em" }}>
                Top <span style={{ color:"#C11111", fontWeight:700 }}>{thmStats.topPercent}%</span> of all TryHackMe players
              </span>
            </div>

            {/* THM edit overlay */}
            {thmEditing && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ position:"absolute", inset:0, background:"rgba(8,2,2,0.97)", backdropFilter:"blur(14px)", padding:"clamp(1.5rem,3vw,2.25rem)", display:"flex", flexDirection:"column", gap:"0.85rem", zIndex:10, overflowY:"auto", borderRadius:"inherit" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <SettingsIcon size={14} color="#C11111" />
                    <span style={{ color:"#D7E2EA", fontWeight:700, fontSize:"0.85rem" }}>Edit THM Stats</span>
                  </div>
                  <motion.button onClick={() => setThmEditing(false)} whileHover={{ scale:1.1 }} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(215,226,234,0.4)", fontSize:"1.2rem", lineHeight:1 }}>✕</motion.button>
                </div>
                {[
                  { key:"points",     label:"Points",        placeholder:"1200"  },
                  { key:"roomsDone",  label:"Rooms Done",    placeholder:"42"    },
                  { key:"streak",     label:"Streak (days)", placeholder:"14"    },
                  { key:"topPercent", label:"Top %",         placeholder:"8"     },
                  { key:"profileUrl", label:"Profile URL",   placeholder:"https://tryhackme.com/p/..." },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ display:"block", color:"rgba(215,226,234,0.35)", fontSize:"0.55rem", textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, marginBottom:"0.3rem" }}>{label}</label>
                    <input type="text" value={thmDraft[key] || ""} placeholder={placeholder}
                      onChange={e => setThmDraft(d => ({ ...d, [key]: e.target.value }))} style={iStyle("#C11111")} />
                  </div>
                ))}
                <div>
                  <label style={{ display:"block", color:"rgba(215,226,234,0.35)", fontSize:"0.55rem", textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, marginBottom:"0.3rem" }}>Rank</label>
                  <select value={thmDraft.rank} onChange={e => setThmDraft(d => ({ ...d, rank: e.target.value }))} style={{ ...iStyle("#C11111"), cursor:"pointer" }}>
                    {THM_RANK_ORDER.map(r => <option key={r} value={r} style={{ background:"#140202" }}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex", gap:"0.5rem", marginTop:"0.25rem" }}>
                  <motion.button onClick={saveTHM} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    style={{ flex:1, background:"#C11111", border:"none", borderRadius:"10px", color:"#fff", padding:"0.65rem", fontFamily:"Kanit,sans-serif", fontWeight:800, fontSize:"0.75rem", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>Save</motion.button>
                  <motion.button onClick={() => setThmEditing(false)} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"rgba(215,226,234,0.5)", padding:"0.65rem", fontFamily:"Kanit,sans-serif", fontWeight:600, fontSize:"0.75rem", cursor:"pointer" }}>Cancel</motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Centre divider */}
          <div style={{ background:"rgba(255,255,255,0.055)", position:"relative" }}>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:8, height:8, borderRadius:"50%", background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.1)" }}/>
          </div>

          {/* ═══ RIGHT: Hack The Box ═══ */}
          <div style={{ padding:"clamp(1.75rem,3.5vw,2.75rem)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:"50%", right:"10%", height:"1px", background:"linear-gradient(90deg,transparent,rgba(159,239,0,0.55),transparent)", pointerEvents:"none" }}/>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.6rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.9rem" }}>
                <HTBOfficialLogo size={42} />
                <div>
                  <p style={{ color:"rgba(159,239,0,0.55)", fontSize:"0.5rem", textTransform:"uppercase", letterSpacing:"0.2em", fontWeight:700, margin:0 }}>CTF Platform</p>
                  <p style={{ color:"#D7E2EA", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"clamp(1rem,2vw,1.35rem)", letterSpacing:"-0.01em", margin:"2px 0 0" }}>Hack The Box</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:"0.4rem", alignItems:"center" }}>
                <motion.a href={htbStats.profileUrl} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale:1.05, background:"rgba(159,239,0,0.18)" }}
                  style={{ display:"inline-flex", alignItems:"center", gap:"0.35rem", border:"1px solid rgba(159,239,0,0.3)", borderRadius:"999px", color:"#9fef00", padding:"0.42rem 1rem", fontSize:"0.58rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", textDecoration:"none", fontFamily:"Kanit,sans-serif", background:"rgba(159,239,0,0.07)", transition:"all 0.2s" }}>
                  Profile
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </motion.a>
                {isAdmin && (
                  <motion.button
                    onClick={() => { setHtbDraft({...htbStats}); setHtbEditing(true); }}
                    initial={{ opacity:0, scale:0.8 }}
                    animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
                    transition={{ duration:0.2 }}
                    whileHover={{ background:"rgba(159,239,0,0.18)" }}
                    style={{ width:30, height:30, borderRadius:"50%", border:"1px solid rgba(159,239,0,0.25)", background:"rgba(159,239,0,0.07)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}>
                    <SettingsIcon size={13} color="#9fef00" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Rank bar */}
            <div style={{ marginBottom:"1.4rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.45rem" }}>
                <span style={{ color:"rgba(215,226,234,0.4)", fontSize:"0.56rem", textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:600 }}>Rank · Lvl {htbStats.level}</span>
                <span style={{ color:"#9fef00", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"0.84rem" }}>{htbStats.rank}</span>
              </div>
              <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"999px", overflow:"hidden" }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${htbFill}%` }} transition={{ duration:1.2, ease:[0.22,1,0.36,1], delay:0.45 }}
                  style={{ height:"100%", borderRadius:"999px", background:"linear-gradient(90deg,rgba(159,239,0,0.5),#9fef00,#c8ff40)", boxShadow:"0 0 8px rgba(159,239,0,0.5)" }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"0.3rem" }}>
                <span style={{ color:"rgba(159,239,0,0.5)", fontSize:"0.52rem", fontWeight:600, letterSpacing:"0.04em" }}>{htbStats.xpCurrent} / {htbStats.xpNeeded} XP</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.5rem", marginBottom:"1.2rem" }}>
              {[
                { label:"Machines",   done: htbStats.machinesDone,   total: htbStats.machinesTotal   },
                { label:"Sherlocks",  done: htbStats.sherlocksDone,  total: htbStats.sherlocksTotal  },
                { label:"Challenges", done: htbStats.challengesDone, total: htbStats.challengesTotal },
              ].map(({ label, done, total }) => (
                <div key={label} style={{ background:"rgba(159,239,0,0.05)", border:"1px solid rgba(159,239,0,0.11)", borderRadius:"12px", padding:"0.75rem 0.4rem", textAlign:"center" }}>
                  <span style={{ display:"block", color:"#D7E2EA", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"clamp(0.78rem,1.6vw,1rem)", lineHeight:1 }}>{done}<span style={{ color:"rgba(215,226,234,0.35)", fontWeight:600 }}>/{total}</span></span>
                  <span style={{ display:"block", color:"rgba(215,226,234,0.28)", fontSize:"0.46rem", textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:600, marginTop:"3px" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Badge */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.6rem 0.85rem", background:"rgba(159,239,0,0.05)", border:"1px solid rgba(159,239,0,0.1)", borderRadius:"10px" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#9fef00", boxShadow:"0 0 6px rgba(159,239,0,0.8)", flexShrink:0 }}/>
              <span style={{ color:"rgba(215,226,234,0.4)", fontSize:"0.6rem", letterSpacing:"0.04em" }}>
                <span style={{ color:"#9fef00", fontWeight:700 }}>Lvl {htbStats.level}</span> · {htbStats.rank} rank on Hack The Box
              </span>
            </div>

            {/* HTB edit overlay */}
            {htbEditing && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                style={{ position:"absolute", inset:0, background:"rgba(2,8,2,0.97)", backdropFilter:"blur(14px)", padding:"clamp(1.5rem,3vw,2.25rem)", display:"flex", flexDirection:"column", gap:"0.85rem", zIndex:10, overflowY:"auto", borderRadius:"inherit" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <SettingsIcon size={14} color="#9fef00" />
                    <span style={{ color:"#D7E2EA", fontWeight:700, fontSize:"0.85rem" }}>Edit HTB Stats</span>
                  </div>
                  <motion.button onClick={() => setHtbEditing(false)} whileHover={{ scale:1.1 }} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(215,226,234,0.4)", fontSize:"1.2rem", lineHeight:1 }}>✕</motion.button>
                </div>
                {[
                  { key:"level",       label:"Level",         placeholder:"11"    },
                  { key:"xpCurrent",   label:"XP Current",    placeholder:"294"   },
                  { key:"xpNeeded",    label:"XP Needed",     placeholder:"347"   },
                  { key:"machinesDone",    label:"Machines Done",    placeholder:"0"   },
                  { key:"machinesTotal",   label:"Machines Total",   placeholder:"543" },
                  { key:"sherlocksDone",   label:"Sherlocks Done",   placeholder:"0"   },
                  { key:"sherlocksTotal",  label:"Sherlocks Total",  placeholder:"158" },
                  { key:"challengesDone",  label:"Challenges Done",  placeholder:"0"   },
                  { key:"challengesTotal", label:"Challenges Total", placeholder:"837" },
                  { key:"profileUrl", label:"Profile URL",  placeholder:"https://app.hackthebox.com/profile/..." },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label style={{ display:"block", color:"rgba(215,226,234,0.35)", fontSize:"0.55rem", textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, marginBottom:"0.3rem" }}>{label}</label>
                    <input type="text" value={htbDraft[key] || ""} placeholder={placeholder}
                      onChange={e => setHtbDraft(d => ({ ...d, [key]: e.target.value }))} style={iStyle("#9fef00")} />
                  </div>
                ))}
                <div>
                  <label style={{ display:"block", color:"rgba(215,226,234,0.35)", fontSize:"0.55rem", textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, marginBottom:"0.3rem" }}>Rank</label>
                  <select value={htbDraft.rank} onChange={e => setHtbDraft(d => ({ ...d, rank: e.target.value }))} style={{ ...iStyle("#9fef00"), cursor:"pointer" }}>
                    {HTB_RANK_ORDER.map(r => <option key={r} value={r} style={{ background:"#020c02" }}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex", gap:"0.5rem", marginTop:"0.25rem" }}>
                  <motion.button onClick={saveHTB} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    style={{ flex:1, background:"#9fef00", border:"none", borderRadius:"10px", color:"#0a1a0a", padding:"0.65rem", fontFamily:"Kanit,sans-serif", fontWeight:800, fontSize:"0.75rem", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>Save</motion.button>
                  <motion.button onClick={() => setHtbEditing(false)} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"rgba(215,226,234,0.5)", padding:"0.65rem", fontFamily:"Kanit,sans-serif", fontWeight:600, fontSize:"0.75rem", cursor:"pointer" }}>Cancel</motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom HUD bar */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0.65rem clamp(1.5rem,3.5vw,2.75rem)",
          borderTop:"1px solid rgba(255,255,255,0.04)",
          background:"rgba(255,255,255,0.01)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
            {[
              { label:"THM Rooms",  value: thmStats.roomsDone,  color:"#C11111"  },
              { label:"HTB Level",  value: htbStats.level,      color:"#9fef00" },
              { label:"THM Streak", value: `${thmStats.streak}d`, color:"#ff9500" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:"0.45rem" }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:color, boxShadow:`0 0 5px ${color}80` }}/>
                <span style={{ color:"rgba(215,226,234,0.22)", fontSize:"0.5rem", textTransform:"uppercase", letterSpacing:"0.12em" }}>
                  {label}: <span style={{ color:`${color}cc`, fontWeight:700 }}>{value}</span>
                </span>
              </div>
            ))}
          </div>
          {isAdmin && (
            <span style={{ color:"rgba(215,226,234,0.1)", fontSize:"0.46rem", textTransform:"uppercase", letterSpacing:"0.18em" }}>Hover to edit</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   OFFENSIVE TICKER  —  Infinite scrolling skills bar (replaces SkillRadarStrip)
══════════════════════════════════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  { label: "Privilege Escalation", color: "#ff4444" },
  { label: "Web App Pentesting",   color: "#ff4444" },
  { label: "Active Directory",     color: "#ff4444" },
  { label: "Exploit Development",  color: "#ff4444" },
  { label: "SQL Injection",        color: "#ff9500" },
  { label: "XSS / CSRF",          color: "#ff9500" },
  { label: "Command Injection",    color: "#ff9500" },
  { label: "File Upload Bypass",   color: "#ff9500" },
  { label: "SSRF",                 color: "#ff9500" },
  { label: "IDOR",                 color: "#ff9500" },
  { label: "Lateral Movement",     color: "#9fef00" },
  { label: "Password Cracking",    color: "#9fef00" },
  { label: "Persistence",          color: "#9fef00" },
  { label: "SUID Abuse",           color: "#9fef00" },
  { label: "Port Scanning",        color: "#7c6af7" },
  { label: "OSINT",                color: "#7c6af7" },
  { label: "Service Fingerprinting", color: "#7c6af7" },
  { label: "Directory Fuzzing",    color: "#7c6af7" },
  { label: "Subdomain Enum",       color: "#7c6af7" },
  { label: "Metasploit",           color: "#4fffaa" },
  { label: "Burp Suite",           color: "#4fffaa" },
  { label: "Nmap",                 color: "#4fffaa" },
  { label: "Wireshark",            color: "#4fffaa" },
  { label: "Gobuster",             color: "#4fffaa" },
  { label: "Hydra",                color: "#4fffaa" },
];
const TICKER_FULL = [...TICKER_ITEMS, ...TICKER_ITEMS];

const OffensiveTicker = () => (
  <div style={{
    maxWidth:"1100px", margin:"clamp(1.2rem,2.5vw,2rem) auto 0",
      background:"linear-gradient(135deg,rgba(6,4,14,0.98) 0%,rgba(4,3,10,0.99) 100%)",
      border:"1px solid rgba(255,255,255,0.07)",
      borderRadius:"clamp(14px,2vw,18px)",
      overflow:"hidden", position:"relative",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(255,68,68,0.5),rgba(159,239,0,0.5),rgba(124,106,247,0.5),transparent)", pointerEvents:"none" }}/>
      <div style={{ display:"flex", alignItems:"stretch" }}>
        {/* Left label */}
        <div style={{ flexShrink:0, padding:"0.8rem 1.2rem", borderRight:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:"0.6rem", background:"rgba(255,255,255,0.02)" }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#ff4444", boxShadow:"0 0 7px #ff444490", animation:"hud-pulse 2s ease-in-out infinite" }}/>
          <div>
            <p style={{ color:"rgba(255,68,68,0.5)", fontSize:"0.44rem", textTransform:"uppercase", letterSpacing:"0.2em", fontWeight:700, margin:0 }}>Penetration Testing</p>
            <p style={{ color:"#D7E2EA", fontWeight:800, fontSize:"0.72rem", letterSpacing:"-0.01em", margin:"1px 0 0", whiteSpace:"nowrap" }}>Offensive Expertise</p>
          </div>
        </div>
        {/* Scrolling track */}
        <div style={{
          flex:1, overflow:"hidden", position:"relative",
          maskImage:"linear-gradient(90deg,transparent 0%,#000 50px,#000 calc(100% - 50px),transparent 100%)",
          WebkitMaskImage:"linear-gradient(90deg,transparent 0%,#000 50px,#000 calc(100% - 50px),transparent 100%)",
        }}>
          <div style={{ display:"flex", alignItems:"center", animation:"ticker-scroll 30s linear infinite", width:"max-content", padding:"0.8rem 0" }}>
            {TICKER_FULL.map((item, i) => (
              <div key={i} style={{ display:"inline-flex", alignItems:"center", gap:"1.2rem", paddingRight:"clamp(1.2rem,2.5vw,2rem)" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:item.color, boxShadow:`0 0 6px ${item.color}90`, flexShrink:0 }}/>
                <span style={{ color:"rgba(215,226,234,0.55)", fontSize:"0.68rem", fontWeight:600, letterSpacing:"0.04em", whiteSpace:"nowrap", fontFamily:"Kanit,sans-serif" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Right badge */}
        <div style={{ flexShrink:0, padding:"0.8rem 1rem", borderLeft:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", background:"rgba(255,255,255,0.02)" }}>
          <span style={{ background:"rgba(255,68,68,0.1)", border:"1px solid rgba(255,68,68,0.22)", color:"#ff4444", fontSize:"0.48rem", fontWeight:700, padding:"4px 10px", borderRadius:"999px", letterSpacing:"0.1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>Offensive Focus</span>
        </div>
      </div>
    </div>
);

/* ══════════════════════════════════════════════════════════════════════════════
   CTF ACTIVITY TIMELINE  —  Reference-style HUD card (dark glass, mono indexed)
══════════════════════════════════════════════════════════════════════════════ */
const PLATFORM_LOGO = { HTB: HTBOfficialLogo, THM: THMOfficialLogo, VulnHub: VulnHubLogo };
const PLATFORMS_LIST = ["HTB","THM","VulnHub"];
const DIFF_LIST      = ["Easy","Medium","Hard"];
const TYPE_LIST      = ["Machine","Challenge","Event"];

const CTFTimeline = () => {
  const { isAdmin } = useAuth();
  const { value: entries, setValue: setEntries } = useSiteContent("ctf_timeline", CTF_TIMELINE_DEFAULTS);
  const [hovered,  setHovered]  = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [editList, setEditList] = useState([]);

  const openEditor = () => { setEditList(entries.map((e,i) => ({ ...e, _id: i }))); setEditing(true); };
  const saveEditor = async () => {
    const cleaned = editList.filter(e => e.name.trim()).map(({ _id, ...rest }) => rest);
    await setEntries(cleaned);
    setEditing(false);
  };
  const addEntry    = () => setEditList(l => [...l, { _id: Date.now(), platform:"HTB", name:"", type:"Machine", difficulty:"Easy", date:"", note:"" }]);
  const removeEntry = (id) => setEditList(l => l.filter(e => e._id !== id));
  const updateField = (id, key, val) => setEditList(l => l.map(e => e._id === id ? { ...e, [key]: val } : e));

  const inputStyle = {
    background:"rgba(159,239,0,0.06)", border:"1px solid rgba(159,239,0,0.18)",
    borderRadius:"8px", padding:"0.45rem 0.7rem", color:"#D7E2EA",
    fontFamily:"Kanit,sans-serif", fontSize:"0.75rem", outline:"none", width:"100%",
  };

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          maxWidth:"1100px", margin:"clamp(1.2rem,2.5vw,2rem) auto 0",
          background:"linear-gradient(170deg,rgba(3,6,14,0.99) 0%,rgba(2,4,10,0.995) 100%)",
          border:`1px solid ${hovered ? "rgba(159,239,0,0.35)" : "rgba(255,255,255,0.08)"}`,
          borderRadius:"clamp(22px,3vw,32px)",
          padding:"clamp(1.75rem,3.5vw,2.75rem)",
          boxShadow: hovered
            ? "0 28px 80px rgba(0,0,0,0.7), 0 0 40px rgba(159,239,0,0.04), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
          position:"relative", overflow:"hidden",
          transition:"border-color 0.3s, box-shadow 0.35s",
        }}
      >
        <div style={{ position:"absolute", top:0, left:"8%", right:"8%", height:"1px", pointerEvents:"none", background:"linear-gradient(90deg,transparent,rgba(159,239,0,0.4),transparent)" }}/>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.6rem", gap:"0.75rem" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.5rem" }}>
              <span style={{ fontFamily:"monospace", fontSize:"0.68rem", color:"rgba(159,239,0,0.45)", letterSpacing:"0.04em" }}>02</span>
              <div style={{ height:"1px", width:"22px", background:"rgba(159,239,0,0.2)" }}/>
              <span style={{ fontSize:"0.46rem", textTransform:"uppercase", letterSpacing:"0.2em", fontWeight:700, color:"rgba(159,239,0,0.45)" }}>Activity Log</span>
            </div>
            <p style={{ color:"#D7E2EA", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"clamp(1.05rem,2vw,1.35rem)", letterSpacing:"-0.01em", margin:0 }}>CTF Timeline</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
              {PLATFORMS_LIST.map(p => { const L = PLATFORM_LOGO[p]; return <L key={p} size={24}/>; })}
            </div>
            {isAdmin && (
              <motion.button onClick={openEditor}
                initial={{ opacity:0, scale:0.8 }}
                animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
                transition={{ duration:0.2 }}
                whileHover={{ background:"rgba(159,239,0,0.18)" }}
                style={{ width:32, height:32, borderRadius:"50%", border:"1px solid rgba(159,239,0,0.22)", background:"rgba(159,239,0,0.07)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s", flexShrink:0 }}>
                <SettingsIcon size={13} color="#9fef00" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Entries */}
        <div style={{ maxHeight:"clamp(260px,30vw,360px)", overflowY:"auto", paddingRight:"4px", scrollbarWidth:"thin", scrollbarColor:"rgba(159,239,0,0.18) transparent" }}>
          {entries.length === 0 ? (
            <div style={{ textAlign:"center", padding:"2rem 0", color:"rgba(215,226,234,0.2)", fontSize:"0.78rem" }}>No entries yet — click ⚙ to add your first pwn</div>
          ) : entries.map((e, i) => {
            const P = PLATFORM[e.platform] || PLATFORM.HTB;
            const D = DIFF[e.difficulty]   || DIFF.Easy;
            return (
              <div key={`${e.platform}-${e.name}-${i}`} style={{ display:"grid", gridTemplateColumns:"2rem 1fr auto", alignItems:"start", gap:"0.75rem", padding:"0.85rem 0", borderBottom:"1px solid rgba(255,255,255,0.042)" }}>
                  <span style={{ fontFamily:"monospace", fontSize:"0.62rem", color:"rgba(255,255,255,0.14)", paddingTop:"2px", textAlign:"right" }}>{String(i + 1).padStart(2,"0")}</span>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", flexWrap:"wrap", marginBottom:"0.28rem" }}>
                      <span style={{ color:"#D7E2EA", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"0.88rem", letterSpacing:"-0.01em" }}>{e.name}</span>
                      <span style={{ background:P.bg, border:`1px solid ${P.border}`, color:P.color, fontSize:"0.46rem", fontWeight:700, padding:"2px 7px", borderRadius:"999px", letterSpacing:"0.1em", textTransform:"uppercase" }}>{e.platform}</span>
                      <span style={{ background:D.bg, border:`1px solid ${D.border}`, color:D.color, fontSize:"0.46rem", fontWeight:700, padding:"2px 7px", borderRadius:"999px", letterSpacing:"0.1em", textTransform:"uppercase" }}>{e.difficulty}</span>
                    </div>
                    {e.note && <p style={{ color:"rgba(215,226,234,0.3)", fontFamily:"'Inter', sans-serif", fontSize:"0.65rem", lineHeight:1.5, margin:0 }}>{e.note}</p>}
                  </div>
                  <span style={{ color:"rgba(215,226,234,0.18)", fontSize:"0.55rem", letterSpacing:"0.04em", whiteSpace:"nowrap", paddingTop:"3px" }}>{e.date}</span>
                </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop:"1.2rem", paddingTop:"1rem", borderTop:"1px solid rgba(159,239,0,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.65rem" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#9fef00", boxShadow:"0 0 6px rgba(159,239,0,0.9)" }}/>
            <span style={{ color:"rgba(215,226,234,0.28)", fontSize:"0.58rem", letterSpacing:"0.08em" }}>
              <span style={{ color:"#9fef00", fontWeight:700 }}>{entries.length}</span> machines / challenges
            </span>
          </div>
          <span style={{ fontFamily:"monospace", fontSize:"0.54rem", color:"rgba(255,255,255,0.08)", letterSpacing:"0.08em" }}>CTF-LOG</span>
        </div>

        {/* Editor overlay */}
        {editing && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ position:"absolute", inset:0, borderRadius:"inherit", background:"rgba(2,4,10,0.97)", backdropFilter:"blur(14px)", padding:"clamp(1.25rem,2.5vw,2rem)", display:"flex", flexDirection:"column", gap:"0.85rem", zIndex:10, overflowY:"auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                <SettingsIcon size={14} color="#9fef00" />
                <span style={{ color:"#D7E2EA", fontWeight:700, fontSize:"0.85rem" }}>Edit Timeline</span>
              </div>
              <motion.button onClick={() => setEditing(false)} whileHover={{ scale:1.1 }} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(215,226,234,0.4)", fontSize:"1.2rem", lineHeight:1 }}>✕</motion.button>
            </div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              {editList.map((entry) => (
                <div key={entry._id} style={{ background:"rgba(159,239,0,0.03)", border:"1px solid rgba(159,239,0,0.1)", borderRadius:"14px", padding:"0.9rem", display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.4rem" }}>
                    {[{ key:"platform", options: PLATFORMS_LIST }, { key:"type", options: TYPE_LIST }, { key:"difficulty", options: DIFF_LIST }].map(({ key, options }) => (
                      <select key={key} value={entry[key]} onChange={e => updateField(entry._id, key, e.target.value)} style={{ ...inputStyle, background:"rgba(0,0,0,0.4)", cursor:"pointer" }}>
                        {options.map(o => <option key={o} value={o} style={{ background:"#040c04" }}>{o}</option>)}
                      </select>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"0.4rem" }}>
                    <input value={entry.name} placeholder="Machine / Challenge name" onChange={e => updateField(entry._id, "name", e.target.value)} style={inputStyle} />
                    <input value={entry.date} placeholder="Jun 2025" onChange={e => updateField(entry._id, "date", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ display:"flex", gap:"0.4rem" }}>
                    <input value={entry.note || ""} placeholder="Short note (optional)" onChange={e => updateField(entry._id, "note", e.target.value)} style={{ ...inputStyle, flex:1 }} />
                    <motion.button onClick={() => removeEntry(entry._id)} whileHover={{ scale:1.1, background:"rgba(255,60,60,0.2)" }}
                      style={{ width:32, height:32, borderRadius:"8px", border:"1px solid rgba(255,60,60,0.25)", background:"rgba(255,60,60,0.07)", color:"#ff6060", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"0.5rem", paddingTop:"0.25rem" }}>
              <motion.button onClick={addEntry} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                style={{ flex:"0 0 auto", background:"rgba(159,239,0,0.1)", border:"1px solid rgba(159,239,0,0.3)", borderRadius:"10px", color:"#9fef00", padding:"0.6rem 1rem", fontFamily:"Kanit,sans-serif", fontWeight:700, fontSize:"0.7rem", letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.35rem" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>Add
              </motion.button>
              <motion.button onClick={saveEditor} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                style={{ flex:1, background:"#9fef00", border:"none", borderRadius:"10px", color:"#0a1a0a", padding:"0.6rem", fontFamily:"Kanit,sans-serif", fontWeight:800, fontSize:"0.76rem", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>Save</motion.button>
              <motion.button onClick={() => setEditing(false)} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                style={{ flex:"0 0 auto", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"10px", color:"rgba(215,226,234,0.4)", padding:"0.6rem 1rem", fontFamily:"Kanit,sans-serif", fontWeight:600, fontSize:"0.7rem", cursor:"pointer" }}>Cancel</motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   WRITE-UP CARD  —  Dark glass, numbered, editorial. Same size as before.
══════════════════════════════════════════════════════════════════════════════ */
const WriteupCard = ({ w, index }) => {
  const P = PLATFORM[w.platform] || PLATFORM.HTB;
  const D = DIFF[w.difficulty]   || DIFF.Easy;
  const [hov, setHov] = useState(false);
  return (
    <div>
      <motion.div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        whileHover={{ y: -6 }}
        transition={{ type:"spring", stiffness:300, damping:24 }}
        style={{
          background: hov
            ? `linear-gradient(160deg,rgba(6,4,14,0.99) 0%,rgba(4,3,10,1) 100%)`
            : `linear-gradient(160deg,rgba(8,6,16,0.97) 0%,rgba(5,4,12,0.98) 100%)`,
          border: `1px solid ${hov ? P.border : "rgba(255,255,255,0.08)"}`,
          borderLeft: `3px solid ${P.color}`,
          borderRadius: "18px",
          padding: "clamp(1.1rem,2vw,1.5rem)",
          display: "flex", flexDirection: "column", gap: "0.8rem",
          boxShadow: hov
            ? `0 24px 60px rgba(0,0,0,0.5), 0 0 30px ${P.color}12`
            : "0 8px 28px rgba(0,0,0,0.35)",
          transition: "border-color 0.25s, box-shadow 0.3s, background 0.3s",
          cursor: "default", position: "relative", overflow: "hidden",
        }}
      >
        {/* Subtle top shimmer in platform colour */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
          background: `linear-gradient(90deg,transparent,${P.color}55,transparent)`,
          pointerEvents: "none",
          opacity: hov ? 1 : 0, transition: "opacity 0.3s",
        }}/>

        {/* Top row: index · platform · difficulty · date */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.45rem", flexWrap:"wrap" }}>
          <span style={{ fontFamily:"monospace", fontSize:"0.6rem", color:"rgba(255,255,255,0.14)", marginRight:"0.15rem" }}>
            {String(index + 1).padStart(2,"0")}
          </span>
          <span style={{
            background: P.bg, border: `1px solid ${P.border}`, color: P.color,
            fontSize: "0.5rem", fontWeight: 800, padding: "3px 9px",
            borderRadius: "999px", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>{w.platform}</span>
          <span style={{
            background: D.bg, border: `1px solid ${D.border}`, color: D.color,
            fontSize: "0.5rem", fontWeight: 700, padding: "3px 9px",
            borderRadius: "999px", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>{w.difficulty}</span>
          <span style={{ marginLeft:"auto", color:"rgba(215,226,234,0.22)", fontSize:"0.58rem", fontWeight:500, letterSpacing:"0.04em" }}>{w.date}</span>
        </div>

        {/* Title */}
        <p style={{ color:"#D7E2EA", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"clamp(0.95rem,1.6vw,1.15rem)", lineHeight:1.3, letterSpacing:"-0.02em", margin:0 }}>{w.title}</p>

        {/* Tags */}
        <div style={{ display:"flex", gap:"0.35rem", flexWrap:"wrap" }}>
          {w.tags.map(tag => (
            <span key={tag} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(215,226,234,0.38)", fontSize: "0.54rem", fontWeight: 600,
              padding: "2px 9px", borderRadius: "999px", letterSpacing: "0.06em", textTransform: "uppercase",
            }}>{tag}</span>
          ))}
        </div>

        {/* CTA buttons */}
        {(w.medium || w.github) && (
          <div style={{ display:"flex", gap:"0.5rem", marginTop:"0.1rem", flexWrap:"wrap" }}>
            {w.medium && <MediumBrandBtn href={w.medium} />}
            {w.github && <GitHubBrandBtn href={w.github} />}
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   CTF EVENTS CARD  —  Reference glass aesthetic, same layout / width
══════════════════════════════════════════════════════════════════════════════ */
const CTF_BRAND = {
  picoCTF: {
    bg:     "linear-gradient(135deg,rgba(0,100,200,0.18) 0%,rgba(0,50,120,0.22) 100%)",
    border: "rgba(0,120,255,0.35)",
    glow:   "rgba(0,120,255,0.12)",
    accent: "#3b9eff",
    badge:  { bg:"rgba(0,120,255,0.15)", border:"rgba(0,120,255,0.35)", color:"#3b9eff" },
    logo: (<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="7" fill="rgba(0,120,255,0.2)"/><text x="14" y="19" textAnchor="middle" fontSize="11" fontWeight="900" fill="#3b9eff" fontFamily="monospace">pico</text></svg>),
  },
  HTB: {
    bg:     "linear-gradient(135deg,rgba(5,20,5,0.98) 0%,rgba(3,14,3,0.99) 100%)",
    border: "rgba(159,239,0,0.35)",
    glow:   "rgba(159,239,0,0.1)",
    accent: "#9fef00",
    badge:  { bg:"rgba(159,239,0,0.12)", border:"rgba(159,239,0,0.3)", color:"#9fef00" },
    logo: <HTBOfficialLogo size={28} />,
  },
  THM: {
    bg:     "linear-gradient(135deg,rgba(20,4,4,0.98) 0%,rgba(14,3,3,0.99) 100%)",
    border: "rgba(193,17,17,0.35)",
    glow:   "rgba(193,17,17,0.1)",
    accent: "#C11111",
    badge:  { bg:"rgba(193,17,17,0.12)", border:"rgba(193,17,17,0.3)", color:"#C11111" },
    logo: <THMOfficialLogo size={28} />,
  },
  default: {
    bg:     "linear-gradient(135deg,rgba(8,4,18,0.98) 0%,rgba(5,3,14,0.99) 100%)",
    border: "rgba(124,106,247,0.3)",
    glow:   "rgba(124,106,247,0.08)",
    accent: "#7c6af7",
    badge:  { bg:"rgba(124,106,247,0.12)", border:"rgba(124,106,247,0.3)", color:"#7c6af7" },
    logo: (<div style={{ width:28, height:28, borderRadius:"7px", background:"rgba(124,106,247,0.15)", border:"1px solid rgba(124,106,247,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c6af7" strokeWidth="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg></div>),
  },
};

const getBrand = (name = "", organiser = "") => {
  const combined = (name + " " + organiser).toLowerCase();
  if (combined.includes("pico")) return CTF_BRAND.picoCTF;
  if (combined.includes("hackthebox") || combined.includes("hack the box") || combined.includes("htb")) return CTF_BRAND.HTB;
  if (combined.includes("tryhackme") || combined.includes("thm")) return CTF_BRAND.THM;
  return CTF_BRAND.default;
};

const EVENT_DEFAULTS_STORED = "ctf_events_v1";

const CTFEventsCard = () => {
  const { isAdmin } = useAuth();
  const { value: events, setValue: setEvents } = useSiteContent(
    "ctf_events",
    CTF_EVENTS.map((e, i) => ({ ...e, _id: i }))
  );
  const [hovered,  setHovered]  = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [editList, setEditList] = useState([]);

  const openEditor = () => { setEditList(events.map(e => ({ ...e }))); setEditing(true); };
  const saveEditor = async () => {
    const cleaned = editList.filter(e => e.name.trim());
    await setEvents(cleaned);
    setEditing(false);
  };
  const addEvent  = () => setEditList(l => [...l, { _id: Date.now(), name:"", organiser:"", date:"", placement:"", team:"Solo", note:"", tags:[] }]);
  const removeEv  = (id) => setEditList(l => l.filter(e => e._id !== id));
  const updateEv  = (id, key, val) => setEditList(l => l.map(e => e._id === id ? { ...e, [key]: val } : e));

  const inputStyle = {
    background:"rgba(124,106,247,0.07)", border:"1px solid rgba(124,106,247,0.2)",
    borderRadius:"8px", padding:"0.45rem 0.7rem", color:"#D7E2EA",
    fontFamily:"Kanit,sans-serif", fontSize:"0.75rem", outline:"none", width:"100%",
  };

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          maxWidth:"1100px", margin:"clamp(1.2rem,2.5vw,2rem) auto 0",
          background:"linear-gradient(170deg,rgba(5,3,14,0.99) 0%,rgba(3,2,10,0.995) 100%)",
          border:`1px solid ${hovered ? "rgba(124,106,247,0.38)" : "rgba(255,255,255,0.08)"}`,
          borderRadius:"clamp(22px,3vw,32px)",
          padding:"clamp(1.75rem,3.5vw,2.75rem)",
          boxShadow:"0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
          position:"relative", overflow:"visible",
          transition:"border-color 0.3s",
        }}
      >
        <div style={{ position:"absolute", top:0, left:"8%", right:"8%", height:"1px", pointerEvents:"none", background:"linear-gradient(90deg,transparent,rgba(124,106,247,0.5),transparent)", borderRadius:"inherit", overflow:"hidden" }}/>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"clamp(1.5rem,3vw,2.25rem)", flexWrap:"wrap", gap:"0.75rem" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.5rem" }}>
              <span style={{ fontFamily:"monospace", fontSize:"0.68rem", color:"rgba(124,106,247,0.45)", letterSpacing:"0.04em" }}>03</span>
              <div style={{ height:"1px", width:"22px", background:"rgba(124,106,247,0.2)" }}/>
              <span style={{ fontSize:"0.46rem", textTransform:"uppercase", letterSpacing:"0.2em", fontWeight:700, color:"rgba(124,106,247,0.45)" }}>Competitions</span>
            </div>
            <p style={{ color:"#D7E2EA", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"clamp(1.05rem,2vw,1.35rem)", letterSpacing:"-0.01em", margin:0 }}>CTF Events</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
            <span style={{ background:"rgba(124,106,247,0.1)", border:"1px solid rgba(124,106,247,0.22)", color:"#7c6af7", fontSize:"0.58rem", fontWeight:700, padding:"5px 14px", borderRadius:"999px", letterSpacing:"0.1em", textTransform:"uppercase" }}>{events.length} events</span>
            {isAdmin && (
              <motion.button onClick={openEditor}
                initial={{ opacity:0, scale:0.8 }}
                animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
                transition={{ duration:0.2 }}
                whileHover={{ background:"rgba(124,106,247,0.2)" }}
                style={{ width:32, height:32, borderRadius:"50%", border:"1px solid rgba(124,106,247,0.25)", background:"rgba(124,106,247,0.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all 0.2s" }}>
                <SettingsIcon size={13} color="#7c6af7" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Event cards horizontal scroll */}
        <div style={{ overflowX:"auto", overflowY:"visible", paddingBottom:"6px", scrollbarWidth:"thin", scrollbarColor:"rgba(124,106,247,0.22) transparent", margin:"0 -4px", padding:"10px 4px 12px" }}>
          <div style={{ display:"flex", flexDirection:"row", gap:"clamp(0.85rem,1.5vw,1.1rem)", width:"max-content" }}>
            {events.map((ev, i) => {
              const brand = getBrand(ev.name, ev.organiser);
              return (
                <motion.div
                  key={ev._id ?? i}
                  whileHover={{ y:-4, borderColor: brand.border, boxShadow:`0 20px 50px rgba(0,0,0,0.55), 0 0 30px ${brand.glow}` }}
                  transition={{ type:"spring", stiffness:280, damping:24 }}
                  style={{
                    background:"linear-gradient(160deg,rgba(8,6,18,0.98) 0%,rgba(5,4,12,0.99) 100%)",
                    border:`1px solid rgba(255,255,255,0.07)`,
                    borderRadius:"18px",
                    padding:"clamp(1rem,2vw,1.4rem)",
                    display:"flex", flexDirection:"column", gap:"0.65rem",
                    boxShadow:"0 12px 32px rgba(0,0,0,0.45)",
                    transition:"border-color 0.25s, box-shadow 0.25s",
                    position:"relative", overflow:"hidden",
                    width:"clamp(240px,28vw,300px)", flexShrink:0,
                  }}
                >
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,${brand.accent}00,${brand.accent},${brand.accent}00)`, pointerEvents:"none" }}/>

                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"monospace", fontSize:"0.62rem", color:"rgba(255,255,255,0.12)", letterSpacing:"0.06em" }}>{String(i+1).padStart(2,"0")}</span>
                    {brand.logo}
                  </div>

                  <div>
                    <p style={{ color:"#D7E2EA", fontFamily:"'Inter', sans-serif", fontWeight:800, fontSize:"clamp(0.88rem,1.5vw,1rem)", lineHeight:1.25, letterSpacing:"-0.01em", margin:0 }}>{ev.name}</p>
                    <p style={{ color:`${brand.accent}75`, fontFamily:"'Inter', sans-serif", fontSize:"0.6rem", fontWeight:600, margin:"2px 0 0" }}>by {ev.organiser} · {ev.date}</p>
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", flexWrap:"wrap" }}>
                    <span style={{ background:brand.badge.bg, border:`1px solid ${brand.badge.border}`, color:brand.badge.color, fontSize:"0.5rem", fontWeight:800, padding:"3px 9px", borderRadius:"999px", letterSpacing:"0.1em", textTransform:"uppercase" }}>CTF</span>
                    {ev.placement && <span style={{ background:"rgba(255,204,68,0.1)", border:"1px solid rgba(255,204,68,0.28)", color:"#ffcc44", fontSize:"0.5rem", fontWeight:700, padding:"3px 9px", borderRadius:"999px", letterSpacing:"0.1em", textTransform:"uppercase" }}>{ev.placement}</span>}
                    {ev.team && <span style={{ marginLeft:"auto", color:"rgba(215,226,234,0.18)", fontSize:"0.52rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>{ev.team}</span>}
                  </div>

                  {ev.note && <p style={{ color:"rgba(215,226,234,0.32)", fontFamily:"'Inter', sans-serif", fontSize:"0.66rem", lineHeight:1.6, margin:0 }}>{ev.note}</p>}

                  {ev.tags && ev.tags.length > 0 && (
                    <div style={{ display:"flex", gap:"0.35rem", flexWrap:"wrap" }}>
                      {ev.tags.map(tag => (
                        <span key={tag} style={{ background:`${brand.accent}10`, border:`1px solid ${brand.accent}28`, color:`${brand.accent}bb`, fontSize:"0.48rem", fontWeight:700, padding:"2px 8px", borderRadius:"999px", letterSpacing:"0.08em", textTransform:"uppercase" }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop:"1.2rem", paddingTop:"1rem", borderTop:"1px solid rgba(124,106,247,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.7rem" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#7c6af7", boxShadow:"0 0 6px rgba(124,106,247,0.9)" }}/>
            <span style={{ color:"rgba(215,226,234,0.28)", fontSize:"0.58rem", letterSpacing:"0.08em" }}>
              <span style={{ color:"#7c6af7", fontWeight:700 }}>{events.length}</span> events competed
            </span>
          </div>
          <span style={{ fontFamily:"monospace", fontSize:"0.54rem", color:"rgba(255,255,255,0.08)", letterSpacing:"0.08em" }}>CTF-EVT</span>
        </div>

        {/* Edit overlay */}
        {editing && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"absolute", inset:0, borderRadius:"inherit", background:"rgba(3,2,10,0.97)", backdropFilter:"blur(14px)", padding:"clamp(1.5rem,3vw,2.5rem)", display:"flex", flexDirection:"column", gap:"0.85rem", zIndex:10, overflowY:"auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.25rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                <SettingsIcon size={15} color="#7c6af7" />
                <span style={{ color:"#D7E2EA", fontWeight:700, fontSize:"0.9rem", letterSpacing:"0.04em" }}>Edit CTF Events</span>
              </div>
              <motion.button onClick={() => setEditing(false)} whileHover={{ scale:1.1 }} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(215,226,234,0.4)", fontSize:"1.2rem", lineHeight:1 }}>✕</motion.button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem", overflowY:"auto", maxHeight:"55vh", paddingRight:"0.25rem" }}>
              {editList.map((ev) => (
                <div key={ev._id} style={{ background:"rgba(124,106,247,0.04)", border:"1px solid rgba(124,106,247,0.12)", borderRadius:"14px", padding:"1rem", display:"flex", flexDirection:"column", gap:"0.55rem" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" }}>
                    {[{ key:"name", label:"Event Name", ph:"picoCTF 2025" },{ key:"organiser", label:"Organiser", ph:"CMU / HackTheBox…" }].map(({ key, label, ph }) => (
                      <div key={key}>
                        <label style={{ display:"block", color:"rgba(215,226,234,0.35)", fontSize:"0.52rem", textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:600, marginBottom:"0.3rem" }}>{label}</label>
                        <input value={ev[key]} placeholder={ph} onChange={e => updateEv(ev._id,key,e.target.value)} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.5rem" }}>
                    {[{ key:"date", label:"Date", ph:"Mar 2025" },{ key:"placement", label:"Placement", ph:"Top 15% (opt)" },{ key:"team", label:"Team", ph:"Solo / Team" }].map(({ key, label, ph }) => (
                      <div key={key}>
                        <label style={{ display:"block", color:"rgba(215,226,234,0.35)", fontSize:"0.52rem", textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:600, marginBottom:"0.3rem" }}>{label}</label>
                        <input value={ev[key] || ""} placeholder={ph} onChange={e => updateEv(ev._id,key,e.target.value)} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:"0.5rem" }}>
                    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                      <input value={ev.note || ""} placeholder="Short note (optional)" onChange={e => updateEv(ev._id,"note",e.target.value)} style={inputStyle} />
                      <input value={(ev.tags||[]).join(",")} placeholder="Tags: Web,Pwn,Crypto" onChange={e => updateEv(ev._id,"tags",e.target.value.split(",").map(t=>t.trim()).filter(Boolean))} style={inputStyle} />
                    </div>
                    <motion.button onClick={() => removeEv(ev._id)} whileHover={{ scale:1.1, background:"rgba(255,60,60,0.2)" }}
                      style={{ width:32, height:32, borderRadius:"8px", border:"1px solid rgba(255,60,60,0.25)", background:"rgba(255,60,60,0.07)", color:"#ff6060", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, alignSelf:"center" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"0.55rem", paddingTop:"0.25rem" }}>
              <motion.button onClick={addEvent} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                style={{ flex:"0 0 auto", background:"rgba(124,106,247,0.1)", border:"1px solid rgba(124,106,247,0.3)", borderRadius:"10px", color:"#7c6af7", padding:"0.6rem 1rem", fontFamily:"Kanit,sans-serif", fontWeight:700, fontSize:"0.7rem", letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", gap:"0.35rem" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>Add Event
              </motion.button>
              <motion.button onClick={saveEditor} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                style={{ flex:1, background:"#7c6af7", border:"none", borderRadius:"10px", color:"#fff", padding:"0.6rem", fontFamily:"Kanit,sans-serif", fontWeight:800, fontSize:"0.76rem", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>Save</motion.button>
              <motion.button onClick={() => setEditing(false)} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                style={{ flex:"0 0 auto", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"10px", color:"rgba(215,226,234,0.4)", padding:"0.6rem 1rem", fontFamily:"Kanit,sans-serif", fontWeight:600, fontSize:"0.7rem", cursor:"pointer" }}>Cancel</motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   WRITE-UPS SUBSECTION  —  unchanged (placeholder + grid when populated)
══════════════════════════════════════════════════════════════════════════════ */
const WriteupsPlaceholder = () => {
  const [hovered, setHovered] = useState(false);
  return (
  <div>
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:"linear-gradient(160deg,rgba(4,4,12,0.99) 0%,rgba(2,2,8,0.995) 100%)",
        border:`1px solid ${hovered ? "rgba(124,106,247,0.38)" : "rgba(255,255,255,0.07)"}`,
        borderRadius:"clamp(22px,3vw,32px)",
        position:"relative", overflow:"hidden",
        boxShadow: hovered
          ? "0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(124,106,247,0.06), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)",
        transition:"border-color 0.3s, box-shadow 0.4s",
      }}
    >
      {/* Ambient glow */}
      <div style={{ position:"absolute", top:"-40%", left:"5%", width:"30%", height:"80%", background:"rgba(124,106,247,0.05)", borderRadius:"50%", filter:"blur(55px)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"-40%", right:"5%", width:"25%", height:"80%", background:"rgba(79,255,170,0.03)", borderRadius:"50%", filter:"blur(55px)", pointerEvents:"none" }}/>

      {/* Top shimmer in purple */}
      <div style={{ position:"absolute", top:0, left:"8%", right:"8%", height:"1px", pointerEvents:"none", background:`linear-gradient(90deg,transparent,${hovered ? "rgba(124,106,247,0.6)" : "rgba(124,106,247,0.25)"},transparent)`, transition:"opacity 0.3s" }}/>

      {/* HUD top bar */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"clamp(0.75rem,1.5vw,1rem) clamp(1.5rem,3.5vw,2.75rem)",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        background:"rgba(255,255,255,0.015)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#7c6af7", boxShadow:"0 0 8px rgba(124,106,247,0.8)", animation:"hud-pulse 2.2s ease-in-out infinite" }}/>
          <span style={{ color:"rgba(215,226,234,0.25)", fontSize:"0.48rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.2em" }}>Published Research</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <span style={{ fontFamily:"monospace", fontSize:"0.62rem", color:"rgba(124,106,247,0.4)", letterSpacing:"0.04em" }}>04</span>
          <div style={{ height:"1px", width:"20px", background:"rgba(124,106,247,0.2)" }}/>
          <span style={{ fontSize:"0.44rem", textTransform:"uppercase", letterSpacing:"0.2em", fontWeight:700, color:"rgba(124,106,247,0.4)" }}>Write-ups</span>
        </div>
      </div>

      {/* Main content — two column on wide, stacked on narrow */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr auto",
        gap:"clamp(1.5rem,3vw,3rem)",
        alignItems:"center",
        padding:"clamp(1.75rem,3.5vw,2.75rem) clamp(1.5rem,3.5vw,2.75rem)",
        flexWrap:"wrap",
      }}>
        {/* Left: title + description */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <h3 style={{ color:"#D7E2EA", fontWeight:900, fontSize:"clamp(1.4rem,3.5vw,2.1rem)", letterSpacing:"-0.03em", lineHeight:1, margin:0 }}>Write-ups</h3>
          <p style={{ color:"rgba(215,226,234,0.35)", fontSize:"clamp(0.78rem,1.3vw,0.88rem)", lineHeight:1.8, fontWeight:300, maxWidth:"520px", margin:0 }}>
            Detailed breakdowns of machines, challenges &amp; CTF events — covering methodology, exploit chains, and lessons learned. Published on Medium with source notes on GitHub.
          </p>
          {/* Buttons */}
          <div style={{ display:"flex", gap:"0.65rem", flexWrap:"wrap", paddingTop:"0.25rem" }}>
            <motion.a
              href="https://medium.com/@VoidxD"
              target="_blank" rel="noopener noreferrer"
              whileHover={{ scale:1.05, background:"#000", color:"#fff", borderColor:"#000", boxShadow:"0 4px 22px rgba(0,0,0,0.6)" }}
              whileTap={{ scale:0.96 }}
              style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                background:"rgba(255,255,255,0.07)", color:"#D7E2EA",
                border:"1px solid rgba(255,255,255,0.15)",
                borderRadius:"999px", padding:"10px 22px",
                fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.1em",
                textTransform:"uppercase", textDecoration:"none",
                fontFamily:"Kanit, sans-serif", transition:"all 0.22s",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
              </svg>
              Medium
            </motion.a>
            <motion.a
              href="https://github.com/rajdeepsingh"
              target="_blank" rel="noopener noreferrer"
              whileHover={{ scale:1.05, background:"#24292e", color:"#fff", borderColor:"#24292e", boxShadow:"0 4px 22px rgba(36,41,46,0.6)" }}
              whileTap={{ scale:0.96 }}
              style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                background:"rgba(255,255,255,0.04)", color:"rgba(215,226,234,0.6)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"999px", padding:"10px 22px",
                fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.1em",
                textTransform:"uppercase", textDecoration:"none",
                fontFamily:"Kanit, sans-serif", transition:"all 0.22s",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </motion.a>
          </div>
        </div>

        {/* Right: decorative stat block */}
        <div style={{
          display:"flex", flexDirection:"column", gap:"0.5rem", flexShrink:0,
          borderLeft:"1px solid rgba(255,255,255,0.06)",
          paddingLeft:"clamp(1.5rem,3vw,2.75rem)",
        }}>
          {[
            { label:"Format",    value:"Write-up",  color:"#7c6af7" },
            { label:"Platforms", value:"HTB · THM", color:"#9fef00" },
            { label:"Published", value:"Medium",    color:"#4fffaa" },
            { label:"Source",    value:"GitHub",    color:"rgba(215,226,234,0.4)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display:"flex", flexDirection:"column", gap:"2px", minWidth:"110px" }}>
              <span style={{ color:"rgba(215,226,234,0.22)", fontSize:"0.44rem", textTransform:"uppercase", letterSpacing:"0.18em", fontWeight:700 }}>{label}</span>
              <span style={{ color, fontSize:"0.78rem", fontWeight:800, letterSpacing:"-0.01em" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HUD bottom bar */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0.6rem clamp(1.5rem,3.5vw,2.75rem)",
        borderTop:"1px solid rgba(255,255,255,0.04)",
        background:"rgba(255,255,255,0.01)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:"#7c6af7", boxShadow:"0 0 5px rgba(124,106,247,0.8)" }}/>
          <span style={{ color:"rgba(215,226,234,0.18)", fontSize:"0.48rem", textTransform:"uppercase", letterSpacing:"0.14em" }}>Walkthroughs · Methodology · Exploit Chains</span>
        </div>
        <span style={{ fontFamily:"monospace", fontSize:"0.5rem", color:"rgba(255,255,255,0.08)", letterSpacing:"0.1em" }}>WU-PUB</span>
      </div>
    </motion.div>
  </div>
  );
};

const WriteupsSubsection = () => (
  <div style={{ maxWidth:"1100px", margin:"clamp(3.5rem,7vw,6rem) auto 0" }}>
    {/* Divider header */}
    <div style={{ display:"flex", alignItems:"center", gap:"1.5rem", marginBottom:"clamp(2rem,4vw,3rem)" }}>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,transparent,rgba(12,12,12,0.12))" }}/>
        <div style={{ display:"flex", alignItems:"center", gap:"0.7rem", flexShrink:0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(12,12,12,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span style={{ color:"rgba(12,12,12,0.4)", fontSize:"0.58rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.22em" }}>Write-ups</span>
        </div>
        <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,rgba(12,12,12,0.12),transparent)" }}/>
      </div>


    {/* Cards grid (only when entries exist) */}
    {WRITEUPS.length > 0 && (
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill, minmax(min(100%,310px),1fr))",
        gap:"clamp(1rem,2vw,1.5rem)",
        marginBottom:"clamp(2rem,4vw,3rem)",
      }}>
        {WRITEUPS.map((w, i) => <WriteupCard key={w.title ?? i} w={w} index={i} />)}
      </div>
    )}

    {/* Big dark card — always visible */}
    <WriteupsPlaceholder />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════
   CTF SECTION ROOT  —  New layout: HUD → Ticker → Timeline → Events → Writeups
══════════════════════════════════════════════════════════════════════════════ */
const CTFSection = () => (
  <section id="ctf" style={{
    background:"#fff",
    borderRadius:"clamp(40px,5vw,60px) clamp(40px,5vw,60px) 0 0",
    marginTop:"clamp(-2.5rem,-3vw,-3.5rem)",
    padding:"clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,4rem)",
    position:"relative", zIndex:5,
  }}>
    {/* Section header */}
    <div>
      <h2 style={{
        color:"#0C0C0C", fontFamily:"'Teko', sans-serif", fontWeight:700, textTransform:"uppercase", lineHeight:1,
        letterSpacing:"-0.01em", fontSize:"clamp(4rem,15.5vw,172px)",
        marginBottom:"0.4rem", textAlign:"center",
      }}>CTF Arena</h2>
      <p style={{
        color:"rgba(12,12,12,0.3)", textAlign:"center", fontWeight:400,
        fontSize:"clamp(0.82rem,1.4vw,0.95rem)", letterSpacing:"0.1em",
        textTransform:"uppercase", marginBottom:"clamp(3rem,6vw,5rem)",
      }}>Platforms · Machines · Challenges · Events</p>
    </div>

    {/* 1. Big unified platform HUD (THM + HTB) */}
    <PlatformHUD />

    {/* 2. Offensive Expertise rolling ticker */}
    <OffensiveTicker />

    {/* 3. CTF Timeline */}
    <CTFTimeline />

    {/* 4. CTF Events */}
    <CTFEventsCard />

    {/* 5. Write-ups */}
    <WriteupsSubsection />
  </section>
);

/* ── STICKY NAV ─────────────────────────────────────────────────────────────── */
/* Sections listed in DOM order. bg: "dark" = black section, "light" = white section */
const NAV_ITEMS = [
  { id: "hero",       label: "Home",       bg: "dark"  },
  { id: "about",      label: "About",      bg: "dark"  },
  { id: "skills",     label: "Skills",     bg: "light" },
  { id: "certs",      label: "Certs",      bg: "dark"  },
  { id: "projects",   label: "Projects",   bg: "light" },
  { id: "experience", label: "Experience", bg: "dark"  },
  { id: "ctf",        label: "CTF",        bg: "light" },
  { id: "bugbounty",  label: "Bug Bounty", bg: "dark"  },
  { id: "contact",    label: "Contact",    bg: "light" },
];

const StickyNav = () => {
  const [active, setActive]     = useState("hero");
  const [visible, setVisible]   = useState(false);   // show on scroll, hide after idle
  const hideTimer                = useRef(null);

  /* ── which section is currently filling the viewport center ── */
  useEffect(() => {
    const getActive = () => {
      const mid = window.innerHeight / 2;
      let current = NAV_ITEMS[0].id;
      for (const { id } of NAV_ITEMS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        if (top <= mid) current = id;
      }
      return current;
    };

    const onScroll = () => {
      setActive(getActive());
      setVisible(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 1800);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(hideTimer.current); };
  }, []);

  const currentBg = NAV_ITEMS.find(n => n.id === active)?.bg ?? "dark";
  const isDark     = currentBg === "dark";

  /* dot/pill colours adapt to section background */
  const dotActive   = isDark ? "rgba(215,226,234,0.9)"  : "rgba(12,12,12,0.75)";
  const dotInactive = isDark ? "rgba(215,226,234,0.2)"  : "rgba(12,12,12,0.2)";
  const labelColor  = isDark ? "rgba(215,226,234,0.75)" : "rgba(12,12,12,0.65)";

  return (
    <motion.nav
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 14 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      style={{
        position: "fixed", right: "clamp(12px,2vw,24px)", top: "50%",
        transform: "translateY(-50%)", zIndex: 200,
        display: "flex", flexDirection: "column", gap: "9px",
        alignItems: "flex-end", pointerEvents: visible ? "auto" : "none",
      }}
    >
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <motion.button
            key={id}
            onClick={() => {
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
              setVisible(true);
              clearTimeout(hideTimer.current);
              hideTimer.current = setTimeout(() => setVisible(false), 1800);
            }}
            whileHover={{ scale: 1.08 }}
            style={{ background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "7px",
              padding: 0, fontFamily: "Kanit, sans-serif" }}
          >
            {/* Section label — only shown for active item */}
            <motion.span
              animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 8 }}
              transition={{ duration: 0.22 }}
              style={{
                color: labelColor, fontSize: "0.56rem", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.14em",
                userSelect: "none", whiteSpace: "nowrap",
                textShadow: isDark ? "0 1px 4px rgba(0,0,0,0.6)" : "0 1px 4px rgba(255,255,255,0.7)",
              }}
            >{label}</motion.span>

            {/* Dot / pill */}
            <motion.div
              animate={{ width: isActive ? 20 : 5, background: isActive ? dotActive : dotInactive }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              style={{ height: 5, borderRadius: 999, flexShrink: 0 }}
            />
          </motion.button>
        );
      })}
    </motion.nav>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   8. BUG BOUNTY SECTION  —  black bg, follows white CTF
══════════════════════════════════════════════════════════════════════════════ */

/* ─── HOW TO ADD A REPORT ─────────────────────────────────────────────────────
   When you get your first finding, add an object to the BUG_REPORTS array below.
   Leave the array empty ([]) to show the "Actively Hunting" placeholder.

   Each report object shape:
   {
     title: "Short finding title",           e.g. "Stored XSS in Comment Field"
     type: "XSS",                            e.g. XSS / IDOR / SSRF / SQLi / RCE / Recon
     severity: "High",                       Critical / High / Medium / Low / Informational
     platform: "HackerOne",                  HackerOne / BugCrowd / Intigriti / Private
     program: "Program / Company Name",
     status: "Resolved",                     Triaged / Resolved / Duplicate / N/A
     summary: "One sentence description of the finding.",
     impact: "What an attacker could have done with this.",
     disclosed: true,                        true = show card, false = redact details
   }
─────────────────────────────────────────────────────────────────────────────── */
const BUG_REPORTS = [
  /* ← Add your reports here when you have them. Keep empty until then. */
];

/* Severity → colour mapping */
const SEV = {
  Critical:      { color: "#ff4444", bg: "rgba(255,68,68,0.1)",    border: "rgba(255,68,68,0.28)" },
  High:          { color: "#ff8070", bg: "rgba(255,128,112,0.1)",  border: "rgba(255,128,112,0.28)" },
  Medium:        { color: "#ffcc44", bg: "rgba(255,204,68,0.1)",   border: "rgba(255,204,68,0.28)" },
  Low:           { color: "#7dd3a8", bg: "rgba(125,211,168,0.1)",  border: "rgba(125,211,168,0.28)" },
  Informational: { color: "#8ab4c9", bg: "rgba(138,180,201,0.08)", border: "rgba(138,180,201,0.22)" },
};

/* Platform accent colours */
const PLATFORM_COLOR = {
  HackerOne: "#36c88e",
  BugCrowd:  "#f26822",
  Intigriti: "#5c4aff",
  Private:   "rgba(215,226,234,0.5)",
};

/* Single report card */
const BugReportCard = ({ report, index }) => {
  const sev = SEV[report.severity] || SEV.Informational;
  const platColor = PLATFORM_COLOR[report.platform] || "rgba(215,226,234,0.5)";

  return (
    <FadeIn delay={index * 0.1} x={-20}>
      <motion.div
        whileHover={{ x: 6 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "clamp(0.9rem,2vw,1.75rem)",
          padding: "clamp(1.25rem,2.5vw,2rem) 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          alignItems: "start",
        }}
      >
        {/* Index number */}
        <span style={{
          color: "rgba(215,226,234,0.07)", fontWeight: 900,
          fontSize: "clamp(2rem,6vw,4rem)", lineHeight: 1, flexShrink: 0,
          userSelect: "none",
        }}>0{index + 1}</span>

        <div>
          {/* Badge row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.55rem" }}>
            <span style={{
              background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color,
              fontSize: "0.58rem", fontWeight: 700, padding: "3px 10px",
              borderRadius: "999px", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>{report.severity}</span>
            <span style={{
              background: "rgba(215,226,234,0.05)", border: "1px solid rgba(215,226,234,0.12)",
              color: "rgba(215,226,234,0.5)", fontSize: "0.58rem", fontWeight: 600,
              padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>{report.type}</span>
            <span style={{
              color: platColor, fontSize: "0.6rem", fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>{report.platform}</span>
            <span style={{
              background: "rgba(79,255,170,0.08)", border: "1px solid rgba(79,255,170,0.2)",
              color: "#4fffaa", fontSize: "0.58rem", fontWeight: 700,
              padding: "3px 10px", borderRadius: "999px", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>{report.status}</span>
          </div>

          <p style={{ color: "#D7E2EA", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "clamp(0.9rem,1.6vw,1.1rem)", marginBottom: "0.4rem" }}>
            {report.title}
          </p>
          <p style={{ color: "rgba(215,226,234,0.45)", fontFamily: "'Inter', sans-serif", fontSize: "clamp(0.75rem,1.2vw,0.87rem)", lineHeight: 1.75, marginBottom: "0.5rem" }}>
            {report.summary}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(182,0,168,0.55)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <p style={{ color: "rgba(182,0,168,0.6)", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 500 }}>{report.impact}</p>
          </div>
        </div>
      </motion.div>
    </FadeIn>
  );
};

/* Shown when BUG_REPORTS is empty — "Actively Hunting" state */
const BountyHuntingState = () => (
  <FadeIn delay={0.15} y={24}>
    <div style={{
      maxWidth: "900px", margin: "0 auto",
      border: "1px dashed rgba(255,255,255,0.12)",
      borderRadius: "clamp(20px,3vw,28px)",
      padding: "clamp(2.5rem,5vw,4rem) clamp(1.5rem,3vw,3rem)",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      gap: "1.5rem",
    }}>
      {/* Animated pulse dot */}
      <div style={{ position: "relative", width: 48, height: 48 }}>
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(182,0,168,0.3)",
          }}
        />
        <div style={{
          position: "absolute", inset: 10, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(182,0,168,0.5), rgba(182,0,168,0.2))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(215,226,234,0.85)" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
      </div>

      <div>
        <p style={{
          color: "#D7E2EA", fontFamily: "'Inter', sans-serif", fontWeight: 700,
          fontSize: "clamp(1rem,2vw,1.3rem)", marginBottom: "0.4rem",
        }}>Actively Hunting</p>
        <p style={{
          color: "rgba(215,226,234,0.38)", fontFamily: "'Inter', sans-serif", fontWeight: 300, lineHeight: 1.75,
          maxWidth: "440px", fontSize: "clamp(0.82rem,1.3vw,0.92rem)",
        }}>
          No public disclosures yet — working through recon and target scoping.
          First findings will appear here once triaged and responsibly disclosed.
        </p>
      </div>

      {/* Platform pills */}
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { name: "HackerOne",  color: "#36c88e" },
          { name: "BugCrowd",   color: "#f26822" },
          { name: "Intigriti",  color: "#5c4aff" },
        ].map(({ name, color }) => (
          <motion.span
            key={name}
            whileHover={{ y: -2 }}
            style={{
              border: `1px solid ${color}44`,
              borderRadius: "999px", padding: "5px 16px",
              fontSize: "0.68rem", fontWeight: 600,
              color, background: `${color}0d`,
              fontFamily: "Kanit, sans-serif", letterSpacing: "0.05em",
            }}
          >{name}</motion.span>
        ))}
      </div>
    </div>
  </FadeIn>
);

/* Focus area tags row */
const BountyFocusTags = () => (
  <FadeIn delay={0.25} y={16}>
    <div style={{
      maxWidth: "900px", margin: "clamp(2rem,4vw,3.5rem) auto 0",
      paddingTop: "clamp(1.5rem,3vw,2.5rem)",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
    }}>
      <p style={{
        color: "rgba(215,226,234,0.2)", fontSize: "0.6rem",
        textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 600, flexShrink: 0,
      }}>Focus</p>
      {["Web App Testing", "API Security", "Network / Infra"].map(tag => (
        <span key={tag} style={{
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "999px", padding: "5px 16px",
          fontSize: "0.68rem", fontWeight: 500,
          color: "rgba(215,226,234,0.45)",
          background: "rgba(255,255,255,0.03)",
          letterSpacing: "0.04em",
        }}>{tag}</span>
      ))}
    </div>
  </FadeIn>
);

const BugBountySection = () => (
  <section id="bugbounty" style={{
    background: "#000",
    borderRadius: "clamp(40px,5vw,60px) clamp(40px,5vw,60px) 0 0",
    marginTop: "clamp(-2.5rem,-3vw,-3.5rem)",
    padding: "clamp(4rem,8vw,8rem) clamp(1.5rem,5vw,4rem)",
    position: "relative", zIndex: 6,
  }}>
    <FadeIn delay={0} y={40}>
      <h2 className="hero-heading" style={{
        fontFamily: "'Teko', sans-serif", fontWeight: 700, textTransform: "uppercase", lineHeight: 1,
        letterSpacing: "-0.01em", fontSize: "clamp(4rem,15.5vw,172px)",
        marginBottom: "0.4rem", textAlign: "center",
      }}>Bug Bounty</h2>
      <p style={{
        color: "rgba(215,226,234,0.25)", textAlign: "center", fontWeight: 400,
        fontSize: "clamp(0.82rem,1.4vw,0.95rem)", letterSpacing: "0.1em",
        textTransform: "uppercase", marginBottom: "clamp(3rem,6vw,5rem)",
      }}>Responsible Disclosure · Real-World Vulnerability Research</p>
    </FadeIn>

    {BUG_REPORTS.length > 0 ? (
      /* Reports exist — render them */
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {BUG_REPORTS.map((r, i) => <BugReportCard key={r.title ?? i} report={r} index={i} />)}
      </div>
    ) : (
      /* No reports yet — show hunting state */
      <BountyHuntingState />
    )}

    <BountyFocusTags />
  </section>
);


/* ══════════════════════════════════════════════════════════════════════════════
   9. CONTACT FOOTER
══════════════════════════════════════════════════════════════════════════════ */
const ContactSection = () => (
  <section id="contact" style={{
    background: "#fff",
    borderRadius: "clamp(40px,5vw,60px) clamp(40px,5vw,60px) 0 0",
    marginTop: "clamp(-2.5rem,-3vw,-3.5rem)",
    padding: "clamp(5rem,10vw,10rem) clamp(1.5rem,5vw,4rem)",
    position: "relative", zIndex: 7,
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
  }}>
    <FadeIn delay={0} y={40}>
      <h2 style={{
        color: "#0C0C0C", fontFamily: "'Teko', sans-serif", fontWeight: 700, textTransform: "uppercase",
        lineHeight: 1, letterSpacing: "-0.01em",
        fontSize: "clamp(4rem,15.5vw,172px)", marginBottom: "1.5rem",
      }}>Let&apos;s work</h2>
    </FadeIn>
    <TogetherText />

    <FadeIn delay={0.2} y={20}>
      <p style={{
        color: "rgba(12,12,12,0.5)", fontWeight: 300, lineHeight: 1.8,
        maxWidth: "460px", fontSize: "clamp(0.9rem,1.6vw,1.1rem)",
        marginBottom: "clamp(2rem,4vw,3rem)",
      }}>
        Want to strengthen your security posture or work together on a project? Reach out — I&apos;m always open.
      </p>
    </FadeIn>

    <FadeIn delay={0.3} y={20}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <ContactButton />
        <motion.a
          href="https://www.linkedin.com/in/rajdeep-goswami-xd/"
          target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.05, background: "#0A66C2", color: "#fff", borderColor: "#0A66C2", boxShadow: "0px 6px 24px rgba(10,102,194,0.4)" }}
          whileTap={{ scale: 0.95 }}
          style={{
            borderRadius: "9999px", border: "2px solid #0A66C2",
            color: "#0A66C2", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.12em", textDecoration: "none",
            padding: "clamp(10px,1.5vw,16px) clamp(28px,4vw,48px)",
            fontSize: "clamp(0.65rem,1.2vw,0.9rem)",
            fontFamily: "Kanit, sans-serif", transition: "all 0.2s",
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </motion.a>
        <motion.a
          href="https://github.com/rajdeep-10"
          target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.05, background: "#24292e", color: "#fff", borderColor: "#24292e", boxShadow: "0px 6px 24px rgba(36,41,46,0.35)" }}
          whileTap={{ scale: 0.95 }}
          style={{
            borderRadius: "9999px", border: "2px solid #24292e",
            color: "#24292e", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.12em", textDecoration: "none",
            padding: "clamp(10px,1.5vw,16px) clamp(28px,4vw,48px)",
            fontSize: "clamp(0.65rem,1.2vw,0.9rem)",
            fontFamily: "Kanit, sans-serif", transition: "all 0.2s",
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          GitHub
        </motion.a>
        <motion.a
          href="https://wa.me/916261737947"
          target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.05, background: "#25D366", color: "#fff", borderColor: "#25D366", boxShadow: "0px 6px 24px rgba(37,211,102,0.4)" }}
          whileTap={{ scale: 0.95 }}
          style={{
            borderRadius: "9999px", border: "2px solid #25D366",
            color: "#25D366", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.12em", textDecoration: "none",
            padding: "clamp(10px,1.5vw,16px) clamp(28px,4vw,48px)",
            fontSize: "clamp(0.65rem,1.2vw,0.9rem)",
            fontFamily: "Kanit, sans-serif", transition: "all 0.2s",
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </motion.a>
      </div>
    </FadeIn>

    <FadeIn delay={0.5} y={10}>
      <p style={{
        marginTop: "clamp(4rem,8vw,8rem)", color: "rgba(12,12,12,0.5)",
        fontSize: "0.9rem", fontWeight: 400, letterSpacing: "0.06em",
      }}>
        © 2026 Rajdeep Goswami · rajdeepgoswami383@gmail.com
      </p>
    </FadeIn>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════════════════════ */
function PortfolioApp() {
  return (
    <>
      <style>{G}</style>
      <StickyNav />
      <main style={{ background: "#0C0C0C", overflowX: "clip" }}>
        {/* id="hero" added here so StickyNav can detect the home section */}
        <div id="hero"><HeroSection /></div>
        <AboutSection />
        <SkillsSection />
        <CertsSection />
        <ProjectsSection />
        <ExperienceSection />
        <CTFSection />
        <BugBountySection />
        <ContactSection />
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PortfolioApp />
          <Analytics />
    </AuthProvider>
  );
}
