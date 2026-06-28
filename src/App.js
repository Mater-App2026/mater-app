import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";

const C = {
  navy: "#2C3E6B",
  blue: "#3D5A8A",
  sky: "#5E7FB3",
  periwinkle: "#8BA3C7",
  mist: "#C8D5E8",
  iceBlue: "#EEF2F7",
  fog: "#F5F7FA",
  gold: "#A8864A",
  goldLight: "#D4B87A",
  ink: "#1C2B3A",
  inkMid: "#3D4F61",
  inkLight: "#7A8FA3",
  slate: "#4A6080",
  slateLight: "#7A95B0",
  teal: "#3A7A8C",
  white: "#FAFCFF",
  cream: "#F7F4EE",
};

const gradients = {
  home: "#EEF2F7",
  chat: "#EBF0F7",
  plan: "#EDF1F7",
  diary: "#EAEff6",
  auth: "#EEF2F7",
  profile: "#EEF2F7",
};

const Icon = ({ name, size = 22, color = "currentColor" }) => {
  const icons = {
    home: <path d="M3 12L12 3l9 9M5 10v10h4v-6h6v6h4V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    plan: <><path d="M9 11l3 3L22 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
    diary: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="1.8" strokeLinecap="round" /><polygon points="22,2 15,22 11,13 2,9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" /></>,
    chevron: <polyline points="9,18 15,12 9,6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    book: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" /></>,
    heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
    trash: <><polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" /></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="1.8" fill="none" /><path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" /></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" fill="none" /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><polyline points="16,17 21,12 16,7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /><line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="1.8" fill="none" /><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" fill="none" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {icons[name]}
    </svg>
  );
};

function LandingScreen({ onEnter }) {
  return (
    <div style={{ flex: 1, background: C.iceBlue, display: "flex", flexDirection: "column", padding: "0 0 40px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 4, overflow: "hidden", border: `1px solid ${C.mist}`, marginBottom: 24 }}>
          <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 600, color: C.navy, margin: "0 0 6px" }}>Mater</h1>
        <p style={{ fontSize: 11, color: C.inkLight, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 32px" }}>Guía de coaching espiritual</p>
        <div style={{ background: C.navy, borderRadius: 4, padding: "18px 20px", marginBottom: 32, borderLeft: `3px solid ${C.gold}`, textAlign: "left", width: "100%" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.cream, fontStyle: "italic", lineHeight: 1.7, margin: "0 0 8px" }}>«Venid a mí todos los que estáis fatigados y cargados, y yo os haré descansar.»</p>
          <p style={{ fontSize: 10, color: C.gold, letterSpacing: "0.08em", margin: 0 }}>Mateo 11:28</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginBottom: 32 }}>
          {[["!🕊️","Chat con Mater","Tu guía espiritual personal con IA"],["!📖","Evangelio del día","Lecturas diarias según la USCCB"],["!📋","Plan de 30 días","Formación espiritual estructurada"],["!📓","Diario espiritual","Registra tus movimientos interiores"]].map(([icon, title, sub], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: C.cream, border: `1px solid ${C.mist}`, borderLeft: `3px solid ${C.navy}`, borderRadius: 4, padding: "12px 14px" }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, margin: 0 }}>{title}</p>
                <p style={{ fontSize: 11, color: C.inkLight, margin: 0 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 32px" }}>
        <button onClick={onEnter} style={{ width: "100%", padding: "15px", border: "none", borderRadius: 4, background: C.navy, color: C.cream, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: "0.04em", marginBottom: 10 }}>
          Entrar a Mater
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: C.inkLight, lineHeight: 1.6 }}>En Safari toca Compartir → Añadir a pantalla de inicio para instalarla</p>
      </div>
    </div>
  );
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const shellRef = useRef(null);

  useEffect(() => {
    shellRef.current?.focus();
  }, []);

  return (
    <div ref={shellRef} tabIndex={-1} style={{ minHeight: "100vh", background: C.iceBlue }}>
      {!hasEntered ? (
        <LandingScreen onEnter={() => setHasEntered(true)} />
      ) : (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.iceBlue, padding: 24 }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 28, color: C.navy }}>Bienvenido a Mater</h2>
            <p style={{ margin: 0, color: C.inkLight }}>Pronto estará disponible la experiencia completa.</p>
          </div>
        </div>
      )}
    </div>
  );
}
