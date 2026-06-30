/* eslint-disable */
import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";

// ─── Design tokens ───────────────────────────────────────────────────────────
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

const DARK = {
  navy: "#4A7AB5",
  blue: "#5A8AC0",
  sky: "#7EA8D8",
  periwinkle: "#8BA3C7",
  mist: "#2A3A4A",
  iceBlue: "#151E2A",
  fog: "#1A2330",
  gold: "#D4A855",
  goldLight: "#E8C870",
  ink: "#E8F0F8",
  inkMid: "#B0C4D8",
  inkLight: "#7A95B0",
  slate: "#7A95B0",
  slateLight: "#5A7890",
  teal: "#5AAABB",
  white: "#1E2A38",
  cream: "#1A2535",
};

const gradients = {
  home: "#EEF2F7",
  chat: "#EBF0F7",
  plan: "#EDF1F7",
  diary: "#EAEff6",
  auth: "#EEF2F7",
  profile: "#EEF2F7",
};

const pill = (bg, color) => ({
  display: "inline-flex", alignItems: "center", gap: 4,
  background: bg, color, borderRadius: 4, padding: "2px 8px",
  fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
  textTransform: "uppercase",
});

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

function shareContent(text, title = "Mater") {
  if (navigator.share) {
    navigator.share({ title, text, url: "https://materapp.org" });
  } else {
    const encoded = encodeURIComponent(text + "\n\nhttps://materapp.org");
    window.open("https://wa.me/?text=" + encoded, "_blank");
  }
}

// ─── Notificaciones de práctica diaria ─────────────────────────────────────
const PRACTICE_NAMES = ["Oración de la mañana", "Lectio Divina", "Examen de conciencia"];
const PRACTICE_MESSAGES = [
  "🙏 Es momento de tu oración de la mañana. Comienza el día con Dios.",
  "📖 Tu Lectio Divina te espera. Deja que la Palabra de hoy te hable.",
  "🌙 Termina el día con el Examen de conciencia. Revisa tu jornada con Dios."
];

async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function scheduleNotifications(times) {
  // Limpiar timers anteriores
  if (window._materNotifTimers) {
    window._materNotifTimers.forEach(t => clearTimeout(t));
  }
  window._materNotifTimers = [];

  if (Notification.permission !== "granted") return;

  times.forEach((time, index) => {
    if (!time) return;
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    const delay = target.getTime() - now.getTime();
    const timer = setTimeout(() => {
      new Notification("Mater 🙏 " + PRACTICE_NAMES[index], {
        body: PRACTICE_MESSAGES[index],
        icon: "/logo.jpeg",
        badge: "/logo.jpeg",
      });
      // Reprogramar para el día siguiente
      scheduleNotifications(times);
    }, delay);
    window._materNotifTimers.push(timer);
  });
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; padding: 0; background: ${C.iceBlue}; }
  @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.1)} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

function LandingScreen({ onEnter }) {
  return (
    <div style={{ flex: 1, background: C.iceBlue, display: "flex", flexDirection: "column", padding: "0 0 40px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, overflow: "hidden", border: "1px solid " + C.mist, marginBottom: 24 }}>
          <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 600, color: C.navy, margin: "0 0 6px" }}>Mater</h1>
        <p style={{ fontSize: 11, color: C.inkLight, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 32px" }}>Guía de coaching espiritual</p>
        <div style={{ background: C.navy, borderRadius: 12, padding: "18px 20px", marginBottom: 32, borderLeft: `3px solid ${C.gold}`, textAlign: "left", width: "100%" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.cream, fontStyle: "italic", lineHeight: 1.7, margin: "0 0 8px" }}>«Venid a mí todos los que estáis fatigados y cargados, y yo os haré descansar.»</p>
          <p style={{ fontSize: 10, color: C.gold, letterSpacing: "0.08em", margin: 0 }}>Mateo 11:28</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginBottom: 32 }}>
          {[
            ["🕊️", "Chat con Mater", "Tu guía espiritual personal con IA"],
            ["📖", "Evangelio del día", "Lecturas diarias según la USCCB"],
            ["📋", "Plan de 30 días", "Formación espiritual estructurada"],
            ["📓", "Diario espiritual", "Registra tus movimientos interiores"],
          ].map(([icon, title, sub], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: C.cream, border: "1px solid " + C.mist, borderLeft: `3px solid ${C.navy}`, borderRadius: 12, padding: "12px 14px" }}>
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
        <button onClick={onEnter} style={{ width: "100%", padding: "15px", border: "none", borderRadius: 12, background: C.navy, color: C.cream, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: "0.04em", marginBottom: 10 }}>
          Entrar a Mater
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: C.inkLight, lineHeight: 1.6 }}>En Safari toca Compartir → Añadir a pantalla de inicio para instalarla</p>
      </div>
    </div>
  );
}

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  const steps = [
    { title: "Bienvenido a Mater", subtitle: "Tu guía de coaching espiritual católico", body: "Mater te acompaña en tu camino de fe con reflexiones diarias, el evangelio de cada día, un diario espiritual y Mater, tu guía con IA.", cta: "Comenzar" },

    { title: "Las 3 prácticas del día", subtitle: "Tu rutina espiritual diaria", body: "Cada día encontrarás 3 prácticas — Oración de la mañana, Lectio Divina y Examen de conciencia. Al completarlas construyes tu ritmo semanal.", cta: "Siguiente" },
    { title: "Habla con Mater", subtitle: "Tu guía espiritual personal", body: "Mater está disponible para acompañarte en momentos de duda, discernimiento o simplemente para rezar juntos.", cta: "Entrar a Mater", last: true },
  ];

  const s = steps[step];

  function handleNext() {
    if (s.last) {
      onComplete("Amigo");
    } else {
      setStep(prev => prev + 1);
    }
  }

  return (
    <div style={{ flex: 1, background: C.iceBlue, display: "flex", flexDirection: "column", padding: "0 0 40px" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "60px 0 0" }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? C.navy : C.mist, transition: "all 0.3s" }} />
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, overflow: "hidden", border: "1px solid " + C.mist, marginBottom: 32 }}>
          <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <p style={{ fontSize: 11, color: C.inkLight, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 8px" }}>{s.subtitle}</p>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: C.ink, margin: "0 0 20px", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 }}>{s.title}</h2>
        {s.body && <p style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.75, margin: "0 0 32px" }}>{s.body}</p>}
        {s.input && (
          <div style={{ width: "100%", marginBottom: 32 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre"
              onKeyDown={e => e.key === "Enter" && handleNext()}
              autoFocus
              style={{ width: "100%", border: "none", outline: "none", borderBottom: `1px solid ${C.mist}`, padding: "12px 4px", fontSize: 20, fontWeight: 600, color: C.ink, background: "transparent", textAlign: "center", fontFamily: "'Cormorant Garamond', serif", boxSizing: "border-box" }}
            />
          </div>
        )}
      </div>
      <div style={{ padding: "0 32px" }}>
        <button onClick={handleNext} style={{ width: "100%", padding: "15px", border: "none", borderRadius: 12, background: C.navy, color: C.cream, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", opacity: s.input && !name.trim() ? 0.5 : 1 }}>
          {s.cta}
        </button>
        {step > 0 && (
          <button onClick={() => setStep(prev => prev - 1)} style={{ width: "100%", padding: "12px", border: "none", background: "transparent", color: C.inkLight, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: 8 }}>
            Atrás
          </button>
        )}
      </div>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError(""); setSuccess("");
    if (!email || !password) { setError("Completa todos los campos."); return; }
    setLoading(true);
    try {
      if (mode === "register") {
        if (!name) { setError("Ingresa tu nombre."); setLoading(false); return; }
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        if (data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, name: name.trim() });
        }
        setSuccess("¡Cuenta creada! Bienvenido a Mater.");
        setTimeout(() => onAuth(), 1000);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onAuth();
      }
    } catch (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : err.message === "User already registered"
          ? "Este correo ya está registrado. Intenta iniciar sesión."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", border: "none", outline: "none",
    background: "transparent", borderBottom: `1px solid ${C.mist}`,
    padding: "12px 4px", fontSize: 14, color: C.ink,
    fontFamily: "'DM Sans', system-ui, sans-serif", boxSizing: "border-box",
  };

  return (
    <div style={{ flex: 1, background: gradients.auth, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, margin: "0 auto 1rem", overflow: "hidden", boxShadow: `0 8px 28px ${C.navy}44` }}>
          <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: C.navy, margin: "0 0 4px", fontFamily: "'Cormorant Garamond', serif" }}>Mater</h1>
        <p style={{ fontSize: 12, color: C.inkLight, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Guía de coaching espiritual</p>
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.mist}`, marginBottom: "2rem" }}>
        {[["login", "Entrar"], ["register", "Crear cuenta"]].map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
            flex: 1, padding: "10px 4px", border: "none", background: "transparent",
            color: mode === m ? C.navy : C.inkLight, fontWeight: mode === m ? 600 : 400,
            fontSize: 13, cursor: "pointer",
            borderBottom: mode === m ? `2px solid ${C.navy}` : "2px solid transparent",
            marginBottom: -1, fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "register" && (
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" style={inputStyle} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" type="email" style={inputStyle} />
        <div style={{ position: "relative" }}>
          <input
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña" type={showPass ? "text" : "password"}
            style={{ ...inputStyle, paddingRight: 44 }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="eye" size={18} color={C.slateLight} />
          </button>
        </div>
        {error && <p style={{ color: "#C0392B", fontSize: 12, margin: 0, textAlign: "center" }}>{error}</p>}
        {success && <p style={{ color: C.blue, fontSize: 12, margin: 0, textAlign: "center" }}>{success}</p>}
        <button onClick={handleSubmit} disabled={loading} style={{ background: C.navy, border: "none", borderRadius: 12, padding: "14px", color: C.cream, fontWeight: 600, fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: 8 }}>
          {loading ? "..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: C.slateLight, marginTop: "2rem", lineHeight: 1.6 }}>Al usar Mater aceptas acompañar tu fe con honestidad y apertura. 🙏</p>
    </div>
  );
}

function NavBar({ active, onChange, darkMode }) {
  const T = darkMode ? DARK : C;
  const tabs = [
    { id: "home", icon: "home", label: "Inicio" },
    { id: "chat", icon: "chat", label: "Mater" },
    { id: "plan", icon: "plan", label: "Plan" },
    { id: "diary", icon: "diary", label: "Diario" },
    { id: "profile", icon: "user", label: "Perfil" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 390,
      background: T.white, borderTop: `1px solid ${T.mist}`,
      display: "flex", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          gap: 3, padding: "10px 4px 8px", border: "none", background: "transparent",
          color: active === t.id ? T.navy : T.inkLight, cursor: "pointer",
          transition: "color 0.15s",
        }}>
          <Icon name={t.icon} size={20} color={active === t.id ? T.navy : T.inkLight} />
          <span style={{ fontSize: 9, fontWeight: active === t.id ? 700 : 400, letterSpacing: "0.04em", fontFamily: "'DM Sans', system-ui, sans-serif" }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function HomeScreen({ user, profile, onTabChange }) {
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [openCard, setOpenCard] = useState(null);
  const [completedPractices, setCompletedPractices] = useState({});
  const [streakDays, setStreakDays] = useState([false, false, false, false, false, false, false]);
  const [streakCount, setStreakCount] = useState(0);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [saintOfDay, setSaintOfDay] = useState(null);
  const [loadingSaint, setLoadingSaint] = useState(false);
  const [saintOpen, setSaintOpen] = useState(false);
  const [worldIntention, setWorldIntention] = useState(null);
  const [intentionOpen, setIntentionOpen] = useState(false);
  const [practiceAIContent, setPracticeAIContent] = useState({});
  const [loadingPractice, setLoadingPractice] = useState(false);
  const practiceCache = useRef({});

  const now = new Date();
  const todayKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  const verses = [
    { text: "«Venid a mí todos los que estáis fatigados y cargados, y yo os haré descansar.»", ref: "Mateo 11:28" },
    { text: "«El Señor es mi pastor; nada me falta.»", ref: "Salmo 23:1" },
    { text: "«Todo lo puedo en Cristo que me fortalece.»", ref: "Filipenses 4:13" },
    { text: "«Confía en el Señor con todo tu corazón y no te apoyes en tu propio entendimiento.»", ref: "Proverbios 3:5" },
    { text: "«No temas, porque yo estoy contigo; no te angusties, porque yo soy tu Dios.»", ref: "Isaías 41:10" },
    { text: "«Yo soy el camino, la verdad y la vida.»", ref: "Juan 14:6" },
    { text: "«Ámense los unos a los otros como yo los he amado.»", ref: "Juan 15:12" },
    { text: "«La paz os dejo, mi paz os doy.»", ref: "Juan 14:27" },
    { text: "«Pidan y se les dará; busquen y encontrarán.»", ref: "Mateo 7:7" },
    { text: "«El que permanece en mí y yo en él, ese da mucho fruto.»", ref: "Juan 15:5" },
    { text: "«Sean fuertes y valientes. No teman ni se asusten.»", ref: "Deuteronomio 31:6" },
    { text: "«Busca primero el Reino de Dios y su justicia.»", ref: "Mateo 6:33" },
    { text: "«El Señor es mi luz y mi salvación; ¿a quién temeré?»", ref: "Salmo 27:1" },
    { text: "«Porque tanto amó Dios al mundo que dio a su Hijo único.»", ref: "Juan 3:16" },
    { text: "«Soy yo quien borro tus transgresiones y no me acuerdo de tus pecados.»", ref: "Isaías 43:25" },
    { text: "«El amor es paciente, es amable; el amor no tiene envidia.»", ref: "1 Corintios 13:4" },
    { text: "«Estén siempre alegres, oren sin cesar, den gracias en toda ocasión.»", ref: "1 Tesalonicenses 5:16-18" },
    { text: "«Yo soy la resurrección y la vida; el que cree en mí, aunque muera, vivirá.»", ref: "Juan 11:25" },
    { text: "«No se amolden al mundo actual, sino sean transformados mediante la renovación de su mente.»", ref: "Romanos 12:2" },
    { text: "«El Señor te guarda; el Señor es tu sombra protectora a tu mano derecha.»", ref: "Salmo 121:5" },
    { text: "«Miercordia quiero y no sacrificio, conocimiento de Dios más que holocaustos.»", ref: "Oseas 6:6" },
    { text: "«Dichosos los limpios de corazón, porque ellos verán a Dios.»", ref: "Mateo 5:8" },
    { text: "«El Señor está cerca de los que tienen el corazón quebrantado.»", ref: "Salmo 34:19" },
    { text: "«Dios es amor, y el que permanece en el amor permanece en Dios.»", ref: "1 Juan 4:16" },
    { text: "«Gracia a vosotros y paz de parte de Dios nuestro Padre.»", ref: "Romanos 1:7" },
    { text: "«Fíate del Señor con todo tu corazón, y él allanará tus senderos.»", ref: "Proverbios 3:6" },
    { text: "«Dichosos los que lloran, porque ellos serán consolados.»", ref: "Mateo 5:4" },
    { text: "«El Espíritu del Señor está sobre mí, porque me ha ungido para anunciar la Buena Noticia.»", ref: "Lucas 4:18" },
    { text: "«¿Acaso puede una madre olvidar a su criatura? Pues aunque ella se olvidara, yo no te olvidaré.»", ref: "Isaías 49:15" },
    { text: "«Mi gracia te basta, que mi fuerza se muestra perfecta en la flaqueza.»", ref: "2 Corintios 12:9" },
    { text: "«Alaba al Señor, alma mía, y no olvides ninguno de sus beneficios.»", ref: "Salmo 103:2" },
    { text: "«Yo he venido para que tengan vida y la tengan en abundancia.»", ref: "Juan 10:10" },
    { text: "«Nada podrá separarnos del amor de Dios manifestado en Cristo Jesús.»", ref: "Romanos 8:39" },
    { text: "«Él sana a los de corazón quebrantado y venda sus heridas.»", ref: "Salmo 147:3" },
    { text: "«El que comenzó en vosotros la buena obra la irá perfeccionando hasta el día de Cristo Jesús.»", ref: "Filipenses 1:6" },
    { text: "«Señor, tú me sondeas y me conoces; sabes cuándo me siento y cuándo me levanto.»", ref: "Salmo 139:1-2" },
    { text: "«Dios secará toda lágrima de sus ojos, y no habrá más muerte ni llanto.»", ref: "Apocalipsis 21:4" },
    { text: "«Dichosos los misericordiosos, porque ellos alcanzarán misericordia.»", ref: "Mateo 5:7" },
    { text: "«En Dios está mi salvación y mi gloria; la roca de mi fortaleza.»", ref: "Salmo 62:7" },
    { text: "«Yo estaré con vosotros todos los días hasta el fin del mundo.»", ref: "Mateo 28:20" },
  ];

  useEffect(() => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDailyVerse(verses[dayOfYear % verses.length]);

    async function loadStreak() {
      const { data } = await supabase.from("streaks").select("date").eq("user_id", user.id).order("date", { ascending: false }).limit(60);
      if (!data || data.length === 0) return;
      const dateSet = new Set(data.map(r => r.date));
      function localDate(offset = 0) {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      }
      const weekStreak = days.map((_, i) => dateSet.has(localDate(i - todayIdx)));
      setStreakDays(weekStreak);
      // Contar solo los días completados en la semana actual (Lun-Dom)
      let count = 0;
      for (let i = 0; i < 7; i++) {
        if (weekStreak[i]) count++;
      }
      setStreakCount(count);
    }

    async function loadPractices() {
      const { data } = await supabase.from("daily_practices").select("*").eq("user_id", user.id).eq("date", todayKey);
      if (data) {
        const map = {};
        data.forEach(r => { map[`${r.practice_index}-${todayKey}`] = true; });
        setCompletedPractices(map);
      }
    }

    loadStreak();
    loadPractices();
    fetchSaintOfDay();
    fetchWorldIntention();
  }, [user]);

  async function fetchSaintOfDay() {
    const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const cacheKey = "saint-" + new Date().toDateString();
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setSaintOfDay(JSON.parse(cached)); return; }
    setLoadingSaint(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system: "Eres un experto en hagiografia catolica con rigor academico. Tu fuente de referencia es el Martirologio Romano y el calendario oficial de la Conferencia Episcopal, asi como sitios catolicos reconocidos como vatican.va, catholic.org, aciprensa.com y franciscanmedia.org. SOLO incluyes datos historicos verificables y ampliamente documentados sobre la vida de los santos. Si no estas completamente seguro de un dato especifico (fechas exactas, citas textuales, detalles menores), omites ese dato en lugar de inventarlo. Nunca inventas citas textuales que no esten bien documentadas. Respondes SOLO en JSON valido sin bloques de codigo.",
          messages: [{ role: "user", content: "Hoy es " + today + " segun el calendario gregoriano. Dame el santo o beato principal que la Iglesia Catolica celebra hoy segun el Martirologio Romano. Usa SOLO informacion historica verificada y ampliamente documentada — no inventes detalles. Si hay incertidumbre historica sobre algun aspecto de su vida, menciona esa incertidumbre en lugar de inventar certeza. Responde SOLO con JSON: {nombre: 'nombre completo y titulo oficial del santo', fecha: 'dia y mes de su fiesta liturgica', siglo: 'siglo o periodo historico en que vivio', historia: 'historia verificada de 3 parrafos sobre su vida, basada en hechos historicos documentados y su significado para la Iglesia', oracion: 'oracion tradicional o composicion respetuosa de intercesion de 3-4 lineas', dato: 'un dato historico verificable y bien documentado sobre este santo, no una curiosidad inventada'}" }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
      setSaintOfDay(parsed);
    } catch {
      setSaintOfDay({
        nombre: "Santa María, Madre de Dios",
        fecha: "1 de enero",
        historia: "Maria, la Madre de Jesus, es la figura mas venerada en la Iglesia Catolica. Su vida entera fue un si a Dios, desde la Anunciacion hasta el pie de la Cruz.\n\nSu maternidad divina es un don para toda la humanidad. Al ser Madre de Cristo, es tambien Madre de todos los miembros de su Cuerpo, la Iglesia.\n\nLa devocion a Maria lleva a Cristo. Ella siempre apunta hacia su Hijo: Haced lo que El os diga.",
        oracion: "Santa María, Madre de Dios y Madre nuestra, intercede por nosotros ante tu Hijo Jesús. Ayúdanos a decir sí a Dios en cada momento de nuestra vida. Amén.",
        dato: "El título 'Madre de Dios' (Theotokos) fue declarado dogma en el Concilio de Éfeso en el año 431."
      });
    } finally {
      setLoadingSaint(false);
    }
  }

  async function markPracticeDone(index) {
    const key = `${index}-${todayKey}`;
    if (completedPractices[key]) return;
    const updated = { ...completedPractices, [key]: true };
    setCompletedPractices(updated);
    await supabase.from("daily_practices").upsert(
      { user_id: user.id, practice_index: index, date: todayKey, completed: true },
      { onConflict: "user_id,practice_index,date" }
    );
    const allDone = [0, 1, 2].every(i => updated[`${i}-${todayKey}`]);
    if (allDone) {
      await supabase.from("streaks").upsert({ user_id: user.id, date: todayKey }, { onConflict: "user_id,date" });
      setStreakDays(prev => { const next = [...prev]; next[todayIdx] = true; return next; });
      setStreakCount(prev => prev + 1);
    }
  }

  function getStaticPracticeContent(index) {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const month = new Date().getMonth();
    const day = new Date().getDate();

    // Contenido para Oración de la mañana (index 0) — 30 variaciones
    const laudesContent = [
      {
        santo: "Lunes · Oración de fortaleza",
        cita: "«Todo lo puedo en Cristo que me fortalece.» — Filipenses 4:13",
        reflexion: `Señor y Dios mío,\n\nAquí estoy, al comienzo de este día, con todo lo que soy y todo lo que tengo.\n\nTe doy gracias por este amanecer que no merecía — por el aire que respiro, por la vida que corre en mis venas, por el regalo inmenso de un día nuevo.\n\nHoy me levanto sabiendo que no estoy solo. Tú vas delante de mí. Tú caminas a mi lado. Tú me sostienes por detrás. Nada de lo que encuentre hoy podrá separarte de mí.\n\nDame fortaleza para enfrentar lo difícil sin huir. Dame claridad para tomar las decisiones que me tocan. Dame amor para dar lo mejor de mí a las personas que encontraré.\n\nQue este día sea tuyo, Señor. Que todo lo que haga, lo diga y lo piense lleve tu sello.\n\nAmén. 🙏`,
        preguntas: ["¿Qué desafío específico de hoy quieres poner en manos de Dios?", "¿Hay alguien a quien quieres amar mejor hoy — y cómo lo harás?", "¿Con qué actitud quieres arrancar este día?"]
      },
      {
        santo: "Martes · Oración de confianza",
        cita: "«No temas, porque yo estoy contigo; no te angusties, porque yo soy tu Dios.» — Isaías 41:10",
        reflexion: `Padre bueno,\n\nAntes de que el ruido del día me alcance, me detengo aquí contigo.\n\nReconozco que a veces el miedo me paraliza, que la incertidumbre me pesa, que hay momentos en que no sé hacia dónde voy. Pero hoy elijo la confianza. Elijo creer que Tú tienes el control de lo que yo no puedo controlar.\n\nDame el ánimo de quien sabe que está acompañado. La fuerza de quien ha encontrado su fuente. La alegría de quien vive como hijo y no como huérfano.\n\nQue hoy no me rinda ante la primera dificultad. Que cada obstáculo sea una oportunidad de verte actuar. Que al final del día pueda decir: confié, y Tú no me fallaste.\n\nGracias, Señor, por este nuevo día. Soy tuyo.\n\nAmén. 🙏`,
        preguntas: ["¿Qué miedo o preocupación específica quieres entregarle a Dios esta mañana?", "¿Cómo sería tu día si vivieras desde la confianza en lugar del miedo?", "¿Hay algo que Dios te pide soltar hoy para poder avanzar?"]
      },
      {
        santo: "Miércoles · Oración de presencia",
        cita: "«Busca primero el Reino de Dios y su justicia, y todo lo demás se te dará por añadidura.» — Mateo 6:33",
        reflexion: `Jesús,\n\nHoy quiero vivir contigo, no solo junto a ti.\n\nNo quiero un día de carreras donde te olvido hasta la noche. Quiero un día donde tu presencia sea el hilo que une cada momento — la reunión de la mañana, el almuerzo apresurado, la conversación difícil, el trayecto de vuelta a casa.\n\nAyúdame a estar presente. Presente en lo que hago, presente en quien tengo delante, presente en ti.\n\nQue hoy no me pierda en lo urgente y olvide lo importante. Que sepa distinguir lo que merece mi atención de lo que solo roba mi energía.\n\nTe ofrezco este miércoles — con sus tareas, sus encuentros y sus sorpresas — como una ofrenda de amor.\n\nQuédate conmigo, Señor. Eso es todo lo que necesito.\n\nAmén. 🙏`,
        preguntas: ["¿Cómo puedes mantener la conciencia de la presencia de Dios en los momentos más ocupados del día?", "¿Qué es lo 'importante' que no quieres olvidar hoy a pesar de lo urgente?", "¿A quién vas a dar tu mejor presencia hoy?"]
      },
      {
        santo: "Jueves · Oración de gratitud",
        cita: "«Den gracias en toda ocasión, porque esta es la voluntad de Dios para ustedes.» — 1 Tesalonicenses 5:18",
        reflexion: `Dios mío,\n\nAntes de pedir, antes de preocuparme, antes de planificar — quiero dar gracias.\n\nGracias por la noche que pasó y el día que comienza. Gracias por las personas que me aman y a quienes amo. Gracias por la salud que tengo, por el trabajo que me espera, por los pequeños placeres que me regalas sin que los pida.\n\nSé que habrá cosas difíciles hoy. Sé que no todo saldrá como planeo. Pero hoy elijo mirar primero lo que tengo, no lo que me falta.\n\nDame corazón agradecido. El tipo de gratitud que no depende de las circunstancias sino de la certeza de que Tú eres bueno — siempre, en todo, incluso cuando no lo veo.\n\nQue la gratitud sea el tono de este jueves. Que contagie a quienes me rodean.\n\nAmén. 🙏`,
        preguntas: ["¿Por qué tres cosas concretas puedes dar gracias esta mañana?", "¿Hay una persona en tu vida a quien deberías agradecerle algo — y puedes hacerlo hoy?", "¿Cómo cambia tu perspectiva del día cuando lo comienzas con gratitud?"]
      },
      {
        santo: "Viernes · Oración de entrega",
        cita: "«No mi voluntad, sino la tuya.» — Lucas 22:42",
        reflexion: `Señor,\n\nHoy es viernes — el día en que recuerdo que el amor más grande se expresó en la entrega total.\n\nYo también quiero entregarme hoy. No de manera heroica ni dramática — en lo pequeño. En la paciencia con quien me irrita. En la honestidad cuando me conviene mentir. En el servicio cuando preferiría descansar.\n\nToma este día, Señor. Toma mis planes y ajústalos a los tuyos. Toma mis fuerzas y úsalas para el bien. Toma mis limitaciones y muéstrate fuerte en ellas.\n\nNo tengo miedo de entregarme porque sé a quién me entrego. A alguien que me conoce por completo y me ama por completo. Eso es suficiente.\n\nHoy, como María en la Anunciación: 'Hágase en mí según tu palabra.'\n\nAmén. 🙏`,
        preguntas: ["¿Hay algo en tu día de hoy que te cuesta entregar a Dios — y por qué?", "¿En qué área de tu vida necesitas decir 'no mi voluntad sino la tuya'?", "¿Cómo sería tu viernes si lo vivieras con la actitud de entrega total?"]
      },
      {
        santo: "Sábado · Oración de renovación",
        cita: "«El Señor es mi pastor; nada me falta. En verdes praderas me hace reposar.» — Salmo 23:1-2",
        reflexion: `Padre,\n\nEl sábado es el día del descanso — pero también el día de la renovación. Hoy quiero dejar que Tú me repares por dentro.\n\nVengo con el cansancio de la semana. Con lo que salió bien y lo que no. Con las conversaciones pendientes y los proyectos sin terminar. Con la alegría de los momentos buenos y el peso de los difíciles.\n\nTómalo todo. Y devuélveme renovado.\n\nDame hoy descanso real — no solo de actividad sino de ansiedad. Dame la capacidad de estar sin hacer, de ser sin producir, de amar sin mérito.\n\nQue este sábado sea un anticipo del descanso eterno que Tú has prometido. Un día donde aprenda a recibir en lugar de solo dar.\n\nGracias por ser mi pastor. Gracias porque nada me falta cuando estoy contigo.\n\nAmén. 🙏`,
        preguntas: ["¿Qué necesitas dejar descansar hoy — no solo el cuerpo sino el alma?", "¿Cómo puedes hacer del descanso de hoy un acto espiritual y no solo físico?", "¿Qué quieres recuperar este sábado para la semana que viene?"]
      },
      {
        santo: "Domingo · Oración de consagración",
        cita: "«Este es el día que hizo el Señor: regocijémonos y alegrémonos en él.» — Salmo 118:24",
        reflexion: `Señor resucitado,\n\nHoy es domingo — el primer día de la nueva creación. El día en que la muerte perdió y el amor ganó.\n\nMe levanto con esa alegría en el corazón. No porque todo esté perfecto en mi vida — sino porque Tú venciste lo que parecía invencible. Y esa victoria es también la mía.\n\nHoy me consagro a ti de nuevo. Te doy esta semana que comienza. Te doy mis proyectos, mis relaciones, mis miedos y mis esperanzas. Ponlos en el altar junto con el pan y el vino de la Misa de hoy.\n\nQue este domingo me recargue para la semana. Que la Eucaristía de hoy sea el combustible de los días que vienen.\n\nSoy tuyo, Señor. Completamente tuyo. Haz conmigo lo que quieras — porque sé que todo lo que quieres para mí es amor.\n\nAmén. 🙏`,
        preguntas: ["¿Con qué actitud llegas a la Misa de hoy — qué quieres que Dios haga en ti?", "¿Qué quieres consagrar a Dios al comienzo de esta nueva semana?", "¿Cómo quieres que la alegría del domingo se extienda a los días que vienen?"]
      },
    ];

    // Contenido para Lectio Divina (index 1) — 30 variaciones
    const lectioContent = [
      { santo: "San Bernardo de Claraval", cita: "«El río que no regresa a su manantial se seca.»", reflexion: "La escena de Betania es una de las más cargadas de tensión y de gracia en todo el Evangelio. Marta entra apresurada, con las manos llenas y el corazón ocupado. María está sentada a los pies de Jesús.\n\nJesús dice algo que ha desconcertado a los cristianos activos durante dos milenios: 'María ha elegido la parte mejor.' No se trata de una condena al trabajo. Lo que Jesús señala es una prioridad: primero escuchar, luego actuar. Primero ser, luego hacer.\n\nSan Bernardo entendía la Lectio Divina como el acto de volver al manantial. La vida activa nos seca — la contemplación nos repone. No como escape de la realidad sino como la fuente que hace posible volver a ella con más amor.\n\nHoy, siéntate con María mientras el mundo grita con Marta. Lee un pasaje del Evangelio despacio — no para entenderlo sino para dejarte hablar por él.", preguntas: ["¿Me identifico más con Marta o con María en este momento de mi vida?", "¿Hay alguna Palabra que Dios ha estado queriendo decirme y yo no he tenido tiempo de escuchar?", "¿Qué pasaría si dedicara 15 minutos diarios a escuchar a Dios en su Palabra?"] },
      { santo: "San Gregorio Magno", cita: "«La Sagrada Escritura crece con quien la lee.»", reflexion: "San Gregorio Magno fue el papa que sistematizó la Lectio Divina como práctica espiritual. Para él, la Escritura no era un texto del pasado sino una Palabra viva que habla al presente de quien la lee con fe.\n\n'La Escritura crece con quien la lee' — esta frase paradójica señala algo profundo: el mismo texto que leíste hace diez años te dirá algo diferente hoy, porque tú eres diferente. La Palabra de Dios se adapta al estado de tu alma.\n\nLa Lectio Divina tiene cuatro momentos clásicos: lectio (leer), meditatio (rumiar), oratio (responder), contemplatio (descansar). No son pasos mecánicos — son movimientos naturales del alma que encuentra a Dios en el texto.\n\nHoy, lee un pasaje tres veces. La primera para entender. La segunda para sentir. La tercera para recibir lo que Dios quiere decirte a ti, hoy, en este momento de tu vida.", preguntas: ["¿Hay una palabra o frase del Evangelio que te persigue últimamente — y por qué?", "¿Cómo ha cambiado tu lectura de la Escritura a lo largo de los años?", "¿Qué te impide hacer de la Lectio Divina una práctica más regular?"] },
      { santo: "Origen de Alejandría", cita: "«Cuando lees la Escritura, Cristo mismo te habla.»", reflexion: "Origen de Alejandría, uno de los grandes teólogos de los primeros siglos, tenía una convicción radical: la Escritura no es un libro sobre Dios — es el lugar donde Dios habla ahora. Leer la Biblia con fe es una forma de encuentro personal con Cristo.\n\nEsta convicción transforma radicalmente la lectura bíblica. No se trata de adquirir información religiosa ni de cumplir un deber piadoso. Se trata de sentarse a escuchar a alguien que te ama y quiere comunicarse contigo.\n\nLa Lectio Divina nos enseña a leer 'de rodillas' — con una actitud de recepción, de humildad, de disponibilidad. No yo domino el texto — el texto me interpela a mí.\n\nHoy, antes de leer, haz una oración breve: 'Señor, habla. Tu siervo escucha.' Y luego abre el Evangelio con esa actitud.", preguntas: ["¿Lees la Biblia más como un deber o como un encuentro — y qué diferencia hace?", "¿Cuándo fue la última vez que una frase del Evangelio te detuvo y te habló directamente?", "¿Qué pasaje bíblico ha marcado más profundamente tu vida — y por qué?"] },
      { santo: "San Jerónimo", cita: "«Ignorar la Escritura es ignorar a Cristo.»", reflexion: "San Jerónimo dedicó décadas de su vida a traducir la Biblia al latín — la versión que conocemos como la Vulgata. No era un proyecto académico: era un acto de amor apasionado por la Palabra de Dios.\n\n'Ignorar la Escritura es ignorar a Cristo' — esta frase provocadora de Jerónimo nos sacude de la comodidad de una fe sin Palabra. No podemos conocer profundamente a Cristo si no lo encontramos en los textos que él mismo reconoció como sagrados.\n\nLa Lectio Divina nos propone algo diferente a la lectura académica: no estudiar la Biblia sino dejarse estudiar por ella. No analizar el texto sino dejar que el texto nos analice.\n\nHoy, elige un pasaje corto — tres o cuatro versículos — y quédate con él durante toda la oración. Deja que las palabras resuenen en tu interior como la música de un instrumento.", preguntas: ["¿Cuánto tiempo le dedicas a la Palabra de Dios en tu vida cotidiana?", "¿Hay algún pasaje bíblico que te resulta difícil o que evitas — y por qué?", "¿Cómo podrías integrar la Lectio Divina en tu rutina semanal de manera concreta?"] },
      { santo: "Santa Teresa de Ávila", cita: "«Un libro espiritual fue muchas veces el único amigo que me acompañó en los años difíciles.»", reflexion: "Santa Teresa de Ávila confiesa en su autobiografía que durante muchos años de oración árida, los libros espirituales fueron su salvavidas. No podía rezar sin ellos — eran el puente que la llevaba de la superficie de su mente al corazón de la oración.\n\nHay temporadas en que la Lectio Divina fluye naturalmente — las palabras aterrizan con facilidad, la oración surge espontánea. Y hay otras en que el texto parece cerrado y la mente no se detiene. Teresa nos enseña que en ambos casos, el gesto de sentarse con la Palabra tiene valor.\n\nLa fidelidad a la Lectio Divina no se mide en experiencias espirituales sino en constancia amorosa. Como en cualquier relación profunda, hay días de conversación fluida y días de silencio compartido. Ambos son formas de amor.\n\nHoy, si la lectura no 'fluye', no te desanimes. Quédate con una sola frase. Repítela despacio. Deja que se asiente. Eso es suficiente.", preguntas: ["¿Cómo reaccionas cuando la oración o la lectura bíblica 'no fluye'?", "¿Qué haces para mantener la fidelidad a la Palabra en los momentos de sequía espiritual?", "¿Hay algún libro espiritual que te haya acompañado en momentos difíciles?"] },
      { santo: "Padre José Kentenich", cita: "«La Palabra de Dios es la voz de la Madre que nos habla a través de la Escritura.»", reflexion: "El Padre José Kentenich tenía una manera particular de acercarse a la Escritura: la leía buscando en ella la presencia maternal de María. Para él, la Palabra de Dios no solo nos revela al Padre y al Hijo — nos revela también a la Madre.\n\nEn el Evangelio de Juan, María aparece en los momentos clave: en Caná (el primer milagro) y al pie de la Cruz (el último). No es casualidad — es teología. María está presente cuando la vida y la muerte se cruzan con la gracia.\n\nLeer la Escritura con María no es añadir algo ajeno al texto — es descubrir una dimensión que siempre estuvo ahí. La ternura de Dios, su cercanía, su manera de salir al encuentro de la debilidad humana — todo eso tiene un rostro materno.\n\nHoy, lee el pasaje de Caná (Juan 2:1-11) y observa cómo actúa María: ve la necesidad antes que nadie, intercede sin pedir nada para sí, y apunta siempre hacia Jesús.", preguntas: ["¿Cómo encuentras a María en la Escritura — en qué pasajes la ves más claramente?", "¿Qué te enseña la actitud de María en Caná sobre la intercesión?", "¿Cómo enriquece tu lectura bíblica la presencia de María?"] },
      { santo: "San Agustín de Hipona", cita: "«Nuestro corazón está inquieto hasta que descanse en Ti — y la Escritura es el camino hacia ese descanso.»", reflexion: "San Agustín encontró en la Escritura el espejo que le mostró su propio alma. En las Confesiones, narra cómo una frase de la carta a los Romanos cambió su vida: 'Revestíos del Señor Jesucristo y no os preocupéis de satisfacer los deseos de la carne.'\n\nUna sola frase. Leída en el momento justo. Con el corazón dispuesto. Eso fue suficiente para que treinta y tres años de búsqueda llegaran a su destino.\n\nLa Lectio Divina nos prepara para ese tipo de encuentro. No podemos forzarlo — pero sí podemos disponernos. Podemos crear las condiciones — el silencio, la atención, la apertura — para que cuando Dios hable, lo escuchemos.\n\nHoy, lee con la expectativa de que Dios puede decirte algo que cambie algo en ti. Esa expectativa ya es una forma de fe.", preguntas: ["¿Hay alguna frase de la Escritura que haya cambiado algo en ti — un momento de gracia a través de la Palabra?", "¿Lees la Biblia con expectativa de que Dios te hable, o más como un hábito automático?", "¿Qué actitud interior necesitas cultivar para que la Lectio Divina sea más fructífera?"] },
    ];

    // Contenido para Examen de conciencia (index 2) — 30 variaciones
    const examenContent = [
      {
        santo: "Padre José Kentenich",
        cita: "«El amor de Dios nos sale al encuentro en cada acontecimiento del día — aprender a verlo es el arte de la vida espiritual.»",
        reflexion: `Al final de este día, detente un momento y recorre lo vivido con los ojos del corazón.\n\nEl Padre Kentenich nos enseñó a hacer el examen de la jornada a partir de tres preguntas esenciales — no para juzgarnos, sino para aprender a leer la vida como Dios la escribe.\n\nNo busques perfección en tus respuestas. Busca honestidad y amor. El Señor no pide cuentas como un juez — las pide como un Padre que quiere saber cómo estuvo el día de su hijo.\n\nResponde despacio. Con calma. Deja que cada pregunta haga su trabajo en el interior.`,
        preguntas: [
          "🙏 VÍNCULO CON DIOS: ¿He descubierto hoy la mano amorosa de Dios en los acontecimientos de mi jornada? ¿Dediqué tiempo a la oración o me dejé llevar por el activismo?",
          "💙 ALIANZA DE AMOR: ¿He actuado hoy como un instrumento dócil en manos de María? ¿Visité el Santuario — espiritual o físicamente — en mis pensamientos o con una oración?",
          "🤝 PRÓJIMO: ¿He sido paciente, comprensivo y caritativo con las personas que me rodean? ¿Juzgué a los demás o busqué ayudarles?"
        ]
      },
      {
        santo: "Padre José Kentenich",
        cita: "«El que sabe leer la providencia en lo cotidiano, ha encontrado el secreto de la paz interior.»",
        reflexion: `Cierra los ojos un momento. Deja que el día pase ante ti como una película — sin pausa, sin edición, tal como fue.\n\nVerás momentos luminosos que quizás dejaste pasar sin agradecerlos. Verás momentos oscuros que cargaste solo sin necesidad. Verás personas que te dieron algo y personas a quienes tú diste.\n\nEl Padre Kentenich creía que Dios habla en el lenguaje de los acontecimientos. No solo en la oración formal — en la llamada inesperada, en el contratiempo del mediodía, en la conversación que no tenías planeada.\n\nAhora, con esa película del día en la mente, responde las tres preguntas con libertad y amor.`,
        preguntas: [
          "🙏 VÍNCULO CON DIOS: ¿He descubierto hoy la mano amorosa de Dios en los acontecimientos de mi jornada? ¿Dediqué tiempo a la oración o me dejé llevar por el activismo?",
          "💙 ALIANZA DE AMOR: ¿He actuado hoy como un instrumento dócil en manos de María? ¿Visité el Santuario — espiritual o físicamente — en mis pensamientos o con una oración?",
          "🤝 PRÓJIMO: ¿He sido paciente, comprensivo y caritativo con las personas que me rodean? ¿Juzgué a los demás o busqué ayudarles?"
        ]
      },
      {
        santo: "Padre José Kentenich",
        cita: "«Dios nos habla a través de los pequeños acontecimientos de cada día — solo necesitamos aprender su idioma.»",
        reflexion: `El día que termina estuvo lleno de momentos pequeños. La mayoría los dejamos pasar sin advertir que eran mensajes de amor.\n\nUna palabra amable en el momento justo. Una dificultad que te obligó a confiar. Una alegría que llegó sin que la buscaras. Una persona que necesitaba algo que solo tú podías darle.\n\nEl Padre Kentenich nos enseñó que la santidad se teje en la trama ordinaria de los días fieles. La fidelidad en lo pequeño es la puerta a la grandeza interior.\n\nHoy, en este examen, busca los hilos dorados que Dios tejió en tu jornada. Están ahí, aunque no los hayas visto en su momento.`,
        preguntas: [
          "🙏 VÍNCULO CON DIOS: ¿He descubierto hoy la mano amorosa de Dios en los acontecimientos de mi jornada? ¿Dediqué tiempo a la oración o me dejé llevar por el activismo?",
          "💙 ALIANZA DE AMOR: ¿He actuado hoy como un instrumento dócil en manos de María? ¿Visité el Santuario — espiritual o físicamente — en mis pensamientos o con una oración?",
          "🤝 PRÓJIMO: ¿He sido paciente, comprensivo y caritativo con las personas que me rodean? ¿Juzgué a los demás o busqué ayudarles?"
        ]
      },
      {
        santo: "Padre José Kentenich",
        cita: "«María recoge nuestras contribuciones — las pequeñas fidelidades del día — y las transforma en capital de gracias para el mundo.»",
        reflexion: `Cada día es una oportunidad de contribuir al capital de gracias del Santuario. No con gestos heroicos, sino con la moneda pequeña de la vida cotidiana: la paciencia que costó, el servicio que nadie vio, la oración que rezaste sin ganas pero la rezaste.\n\nEl Padre Kentenich creía que nada de lo que vivimos con amor se pierde. Todo — absolutamente todo — que se ofrece a María con intención de amor, es recibido por ella y transformado en gracia para el mundo.\n\nEsto le da un peso inmenso a lo ordinario. El día de hoy, con sus rutinas y sus sorpresas, sus logros y sus fracasos, es material de santidad si lo ofreces con amor.\n\nAl responder las tres preguntas de hoy, recuerda: no te examinas para condenarte sino para crecer en amor.`,
        preguntas: [
          "🙏 VÍNCULO CON DIOS: ¿He descubierto hoy la mano amorosa de Dios en los acontecimientos de mi jornada? ¿Dediqué tiempo a la oración o me dejé llevar por el activismo?",
          "💙 ALIANZA DE AMOR: ¿He actuado hoy como un instrumento dócil en manos de María? ¿Visité el Santuario — espiritual o físicamente — en mis pensamientos o con una oración?",
          "🤝 PRÓJIMO: ¿He sido paciente, comprensivo y caritativo con las personas que me rodean? ¿Juzgué a los demás o busqué ayudarles?"
        ]
      },
      {
        santo: "Padre José Kentenich",
        cita: "«El instrumento perfecto no es el que nunca falla — es el que siempre vuelve a ponerse en manos de María.»",
        reflexion: `Nadie termina el día habiendo sido perfecto. Nadie. Ni los santos, ni los místicos, ni los más fieles miembros del Movimiento.\n\nLo que distingue al alma que crece no es la ausencia de fallos sino la velocidad con que vuelve. Vuelve a la oración. Vuelve a María. Vuelve al amor.\n\nEl Padre Kentenich entendía la vida espiritual como un proceso dinámico, no como un estado estático. Cada día es un nuevo comienzo. Cada examen es una nueva oportunidad de ajustar el rumbo.\n\nSi hoy fallaste en alguna de las tres dimensiones — no te condenes. Reconócelo con sencillez, ofrécelo a María y proponte una cosa concreta para mañana. Solo una. Eso es suficiente.`,
        preguntas: [
          "🙏 VÍNCULO CON DIOS: ¿He descubierto hoy la mano amorosa de Dios en los acontecimientos de mi jornada? ¿Dediqué tiempo a la oración o me dejé llevar por el activismo?",
          "💙 ALIANZA DE AMOR: ¿He actuado hoy como un instrumento dócil en manos de María? ¿Visité el Santuario — espiritual o físicamente — en mis pensamientos o con una oración?",
          "🤝 PRÓJIMO: ¿He sido paciente, comprensivo y caritativo con las personas que me rodean? ¿Juzgué a los demás o busqué ayudarles?"
        ]
      },
      {
        santo: "Padre José Kentenich",
        cita: "«La vida interior no es una fuga del mundo — es aprender a encontrar a Dios en el corazón del mundo.»",
        reflexion: `El Padre Kentenich no formó contemplativos que huyeran del mundo. Formó personas que aprendieran a encontrar a Dios en el corazón del mundo — en el trabajo, en la familia, en la ciudad, en las tensiones y alegrías de la vida moderna.\n\nEste examen que haces al final del día es precisamente eso: aprender a leer el mundo con ojos de fe. No como una carga religiosa más, sino como el gesto del hijo que al volver a casa le cuenta al Padre cómo le fue.\n\nEl Señor quiere saber de tu día. Le interesa la reunión que fue difícil, la conversación que te alegró, el momento en que sentiste su presencia y el momento en que lo olvidaste.\n\nCuéntaselo. Sin ornamentos. Con la confianza de un hijo que sabe que es amado.`,
        preguntas: [
          "🙏 VÍNCULO CON DIOS: ¿He descubierto hoy la mano amorosa de Dios en los acontecimientos de mi jornada? ¿Dediqué tiempo a la oración o me dejé llevar por el activismo?",
          "💙 ALIANZA DE AMOR: ¿He actuado hoy como un instrumento dócil en manos de María? ¿Visité el Santuario — espiritual o físicamente — en mis pensamientos o con una oración?",
          "🤝 PRÓJIMO: ¿He sido paciente, comprensivo y caritativo con las personas que me rodean? ¿Juzgué a los demás o busqué ayudarles?"
        ]
      },
      {
        santo: "Padre José Kentenich",
        cita: "«Al final del día, lo que importa no es cuánto hiciste sino con cuánto amor lo hiciste.»",
        reflexion: `Domingo. El día del Señor llega a su fin. Ha sido un día para descansar, para celebrar, para estar con las personas que amas, para encontrarte con Dios en la Eucaristía.\n\n¿Cómo fue? ¿Fue realmente un día de descanso interior o estuvo lleno de agitación disfrazada de ocio? ¿Encontraste a Dios en la Misa, en la familia, en el silencio de la tarde?\n\nEl Padre Kentenich creía que el domingo bien vivido carga las baterías de toda la semana — no como recarga de energía física sino como renovación del espíritu.\n\nAl hacer el examen de este domingo, además de las tres preguntas habituales, añade una cuarta para ti: ¿Descansé de verdad — descansé en Dios?`,
        preguntas: [
          "🙏 VÍNCULO CON DIOS: ¿He descubierto hoy la mano amorosa de Dios en los acontecimientos de mi jornada? ¿Dediqué tiempo a la oración o me dejé llevar por el activismo?",
          "💙 ALIANZA DE AMOR: ¿He actuado hoy como un instrumento dócil en manos de María? ¿Visité el Santuario — espiritual o físicamente — en mis pensamientos o con una oración?",
          "🤝 PRÓJIMO: ¿He sido paciente, comprensivo y caritativo con las personas que me rodean? ¿Juzgué a los demás o busqué ayudarles?"
        ]
      },
    ];
        const practiceArrays = [laudesContent, lectioContent, examenContent];
    const arr = practiceArrays[index] || laudesContent;
    // Laudes rota por día de la semana
    // getDay(): 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
    // Array: 0=Lun, 1=Mar, 2=Mié, 3=Jue, 4=Vie, 5=Sáb, 6=Dom
    const weekDay = new Date().getDay(); // 0=Dom...6=Sáb
    const laudesIdx = weekDay === 0 ? 6 : weekDay - 1; // convertir a índice del array
    const rotationIdx = (index === 0 || index === 2) ? laudesIdx : dayOfYear % arr.length;
    return arr[rotationIdx % arr.length];
  }

  function fetchWorldIntention() {
    // Las intenciones duran una semana — se actualiza manualmente cada semana
    const weeklyIntentions = [
      {
        titulo: "Terremoto en Venezuela",
        lugar: "Venezuela",
        descripcion: "Un terremoto de magnitud 7.3 sacudió el norte de Venezuela, afectando a miles de familias que perdieron sus hogares y seres queridos. Las comunidades más vulnerables enfrentan escasez de agua, alimentos y atención médica en medio de la tragedia.",
        oracion: "Señor de la vida, te pedimos por las víctimas del terremoto en Venezuela. Consuela a quienes lloran a sus seres queridos, fortalece a los equipos de rescate y auxilio, y abre los corazones de quienes pueden ayudar. Que la Virgen del Valle, Patrona de Venezuela, interceda por su pueblo sufriente. Amén.",
        emoji: "🙏",
        color1: "#6b2c2c",
        color2: "#8f4a2d"
      },
    ];

    // Usar la primera intención de la lista (se actualiza manualmente cada semana)
    setWorldIntention(weeklyIntentions[0]);
  }

  async function fetchPracticeContent(index, practiceLabel, practiceSub) {
    const today = new Date().toDateString();
    const cacheKey = index + "-" + today;
    if (practiceCache.current[cacheKey]) {
      setPracticeAIContent(prev => ({ ...prev, [index]: practiceCache.current[cacheKey] }));
      return;
    }

    if (index === 1) {
      setLoadingPractice(true);
      try {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const yy = String(now.getFullYear()).slice(-2);
        const usccbUrl = "https://bible.usccb.org/es/bible/lecturas/" + mm + dd + yy + ".cfm";

        let textoEvangelio = "";
        let referenciaEvangelio = "Evangelio del día";
        try {
          const gospelRes = await fetch("/api/gospel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: usccbUrl }),
          });
          const gospelData = await gospelRes.json();
          if (gospelData && gospelData.textoCompleto) {
            textoEvangelio = gospelData.textoCompleto;
            referenciaEvangelio = gospelData.referencia || "Evangelio del día";
          }
        } catch(e) { console.log("Gospel fetch failed", e); }

        const todayStr = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
        const userMsg = textoEvangelio
          ? "Hoy es " + todayStr + ". Evangelio: " + referenciaEvangelio + ". Texto: " + textoEvangelio.substring(0, 500) + ". Crea una Lectio Divina completa con 4 pasos (lectio, meditatio, oratio, contemplatio) basada en este evangelio. Responde SOLO con JSON valido: {referencia, lectio, meditatio, oratio, contemplatio, palabra_clave}"
          : "Hoy es " + todayStr + ". Ciclo A. Crea una Lectio Divina del evangelio de hoy con 4 pasos. Responde SOLO con JSON: {referencia, lectio, meditatio, oratio, contemplatio, palabra_clave}";

        const aiRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1500,
            system: "Eres Mater, guia espiritual catolica experta en Lectio Divina, fiel a la tradicion benedictina y a la ensenanza oficial de la Iglesia sobre la lectura orante de la Escritura (Verbum Domini de Benedicto XVI). Tu interpretacion del texto biblico se basa en la exegesis catolica tradicional, no en interpretaciones especulativas o ajenas a la fe catolica. Citas biblicas precisas. No inventas doctrinas. Respondes SOLO en JSON valido sin bloques de codigo.",
            messages: [{ role: "user", content: userMsg }],
          }),
        });
        const aiData = await aiRes.json();
        const aiText = aiData.content?.map(b => b.text || "").join("") || "{}";
        const cleaned = aiText.replace(/```[\s\S]*?```/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        const lectioContent = {
          santo: "Lectio Divina - " + (parsed.referencia || referenciaEvangelio),
          cita: "«" + (parsed.palabra_clave || "Permaneced en mi") + "» — Palabra para llevar hoy",
          reflexion: ["📖 LECTIO — Leer", (parsed.lectio || "Lee el evangelio de hoy despacio, dos veces."), "🤔 MEDITATIO — Rumiar", (parsed.meditatio || "¿Que palabra resuena en tu corazon?"), "🙏 ORATIO — Responder", (parsed.oratio || "Señor, habla que tu siervo escucha."), "✨ CONTEMPLATIO — Descansar", (parsed.contemplatio || "Quedate en silencio con la Palabra recibida.")].join("\n\n"),
          preguntas: [
            "¿Qué palabra del evangelio de hoy (" + (parsed.referencia || referenciaEvangelio) + ") te llamo mas la atencion?",
            "¿Que te dice Dios personalmente a traves de este texto hoy?",
            "¿Como puedes llevar la palabra «" + (parsed.palabra_clave || "amor") + "» a tu vida concreta hoy?"
          ]
        };
        practiceCache.current[cacheKey] = lectioContent;
        setPracticeAIContent(prev => ({ ...prev, [index]: lectioContent }));
      } catch(e) {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const fallbacks = [
          {
            santo: "San Bernardo de Claraval",
            cita: "«El que bebe de Mí tendrá en sí mismo un manantial que salta hasta la vida eterna.»",
            reflexion: ["📖 LECTIO — Leer", "Lee el evangelio de hoy despacio, dos veces. La primera para entender. La segunda para sentir. Deja que las palabras aterricen en tu interior sin prisa.", "🤔 MEDITATIO — Rumiar", "¿Hay una palabra o frase que te llamó la atención? Quédate con ella. Repítela como quien saborea algo bueno. No necesitas entenderlo todo — necesitas dejarte tocar.", "🙏 ORATIO — Responder", "Señor, gracias por hablarme hoy a través de tu Palabra. Que no quede solo en mi mente, sino que baje a mis manos y a mis decisiones. Amén.", "✨ CONTEMPLATIO — Descansar", "Cierra los ojos un momento. No hagas nada. Solo recibe. La Palabra ya fue sembrada — ahora deja que germine en el silencio."].join("\n\n"),
            preguntas: ["¿Qué palabra del evangelio de hoy te quedó resonando?", "¿Qué te dice Dios personalmente a través de este texto?", "¿Cómo puedes llevar esta Palabra a tu vida concreta hoy?"]
          },
          {
            santo: "San Gregorio Magno",
            cita: "«La Sagrada Escritura crece con quien la lee.»",
            reflexion: ["📖 LECTIO — Leer", "Abre el evangelio de hoy y léelo con calma. Si puedes, léelo en voz alta — escuchar las palabras con los oídos ayuda a recibirlas de manera diferente.", "🤔 MEDITATIO — Rumiar", "¿Qué personaje del evangelio de hoy te llama más la atención? ¿Con cuál te identificas? Ponte en su lugar y observa qué sientes desde ahí.", "🙏 ORATIO — Responder", "Señor, tu Palabra es viva y activa. Haz que lo que leí hoy no se quede en el papel sino que cambie algo en mí. Habla, que te escucho.", "✨ CONTEMPLATIO — Descansar", "Quédate un momento en silencio con Jesús. Sin palabras. Solo presencia. Él está aquí."].join("\n\n"),
            preguntas: ["¿Con qué personaje del evangelio de hoy te identificas más — y por qué?", "¿Qué acción concreta te inspira el texto de hoy?", "¿Qué cambiaría en tu día si vivieras lo que el evangelio propone?"]
          },
          {
            santo: "San Jerónimo",
            cita: "«Ignorar la Escritura es ignorar a Cristo.»",
            reflexion: ["📖 LECTIO — Leer", "Lee el evangelio de hoy tres veces. La primera rápido. La segunda despacio. La tercera deteniéndote en la frase que más te llame la atención.", "🤔 MEDITATIO — Rumiar", "¿Qué te sorprende de este texto? ¿Hay algo que no esperabas encontrar? La sorpresa es señal de que Dios está hablando donde menos lo esperabas.", "🙏 ORATIO — Responder", "Jesús, el mismo que habla en este evangelio está aquí conmigo ahora. Quiero escucharte. Quiero que tu Palabra cambie lo que necesita cambiar en mi vida. Confío en ti.", "✨ CONTEMPLATIO — Descansar", "Elige una sola palabra del evangelio de hoy y llévala contigo durante el día. Que sea como una semilla que sigue creciendo mientras vives."].join("\n\n"),
            preguntas: ["¿Qué te sorprendió del evangelio de hoy?", "¿Hay algo en el texto que te incomoda — y qué te dice esa incomodidad?", "¿Cuál es la palabra que llevarás contigo el resto del día?"]
          },
          {
            santo: "Padre José Kentenich",
            cita: "«La Palabra de Dios es la voz de la Madre que nos habla a través de la Escritura.»",
            reflexion: ["📖 LECTIO — Leer", "Lee el evangelio de hoy con María a tu lado. Ella fue la primera en recibir la Palabra — en el corazón antes que en los oídos. Pídele que te ayude a escuchar como ella.", "🤔 MEDITATIO — Rumiar", "¿Dónde aparece el amor en este evangelio? ¿Cómo ama Jesús en este pasaje? ¿A quién? ¿De qué manera? Quédate con esa imagen de amor.", "🙏 ORATIO — Responder", "María, ayúdame a recibir esta Palabra como tú la recibiste: con el corazón abierto, sin resistencia, con un sí total. Que el Fiat de tu vida sea también el mío hoy.", "✨ CONTEMPLATIO — Descansar", "Imagina que estás sentado junto a María escuchando a Jesús. Estás en buena compañía. Descansa ahí un momento."].join("\n\n"),
            preguntas: ["¿Cómo ama Jesús en el evangelio de hoy — qué gesto de amor ves?", "¿Qué te enseña María sobre cómo recibir la Palabra de Dios?", "¿Cómo puedes imitar ese amor hoy en tu vida concreta?"]
          },
          {
            santo: "San Agustín de Hipona",
            cita: "«Nuestro corazón está inquieto hasta que descanse en Ti.»",
            reflexion: ["📖 LECTIO — Leer", "Lee el evangelio de hoy sin prisa. Si te distraes, vuelve al texto sin juzgarte. La fidelidad en la Lectio no es concentración perfecta — es el deseo de volver siempre.", "🤔 MEDITATIO — Rumiar", "¿Hay alguna pregunta que el evangelio de hoy despierta en ti? ¿Algo que no entiendes, algo que te provoca, algo que quisieras preguntarle a Jesús directamente?", "🙏 ORATIO — Responder", "Señor, traigo al evangelio de hoy mis preguntas, mis dudas y mi fe imperfecta. No necesito entender todo. Solo necesito confiar en que tú estás aquí y que tu Palabra es buena.", "✨ CONTEMPLATIO — Descansar", "San Agustín tardó décadas en encontrar el descanso en Dios. Tú lo tienes disponible ahora mismo. Descansa un momento en el Señor que te habló hoy."].join("\n\n"),
            preguntas: ["¿Qué pregunta te despierta el evangelio de hoy?", "¿Hay algo en el texto con lo que luchas — algo difícil de aceptar o de creer?", "¿Qué necesitas pedirle a Dios después de leer este evangelio?"]
          },
          {
            santo: "Santa Teresa de Ávila",
            cita: "«La oración no es otra cosa que un trato de amistad íntimo con quien sabemos que nos ama.»",
            reflexion: ["📖 LECTIO — Leer", "Lee el evangelio de hoy como si fuera la primera vez que lo escuchas. Deja de lado lo que ya sabes. Llega al texto con ojos nuevos y corazón limpio.", "🤔 MEDITATIO — Rumiar", "¿Qué dice este evangelio sobre quién es Dios? ¿Cómo se revela a sí mismo en este pasaje? ¿Cómo te cambia esa imagen de Dios?", "🙏 ORATIO — Responder", "Señor, gracias por revelarme hoy algo más de quién eres. Quiero conocerte más. Quiero que nuestra amistad crezca. Que esta Palabra sea un paso más en ese camino.", "✨ CONTEMPLATIO — Descansar", "Quédate en silencio con la imagen de Dios que el evangelio de hoy te regaló. Deja que esa imagen se asiente en tu corazón."].join("\n\n"),
            preguntas: ["¿Qué revela el evangelio de hoy sobre quién es Dios?", "¿Esa imagen de Dios coincide con la que llevas en tu corazón — o te desafía?", "¿Cómo quieres que cambie tu relación con Dios a partir de lo que leíste hoy?"]
          },
          {
            santo: "San Francisco de Asís",
            cita: "«Predica el Evangelio siempre; si es necesario, usa palabras.»",
            reflexion: ["📖 LECTIO — Leer", "Lee el evangelio de hoy lentamente. Después de leerlo, cierra los ojos e imagina la escena. ¿Dónde está Jesús? ¿Qué hay alrededor? ¿Qué se escucha, qué se siente?", "🤔 MEDITATIO — Rumiar", "¿Cuál es el gesto más pequeño de amor en este evangelio? Francisco decía que la santidad vive en los detalles. ¿Qué detalle pequeño del texto te habla hoy?", "🙏 ORATIO — Responder", "Señor, haz de mí un instrumento de tu paz. Que lo que leí hoy en el evangelio no quede solo en mi oración sino que salga a las calles en mis acciones. Amén.", "✨ CONTEMPLATIO — Descansar", "Imagina que eres el pájaro al que Francisco predicó. Recibe la Buena Noticia sin análisis, sin juicio — solo con la confianza simple de quien sabe que es amado."].join("\n\n"),
            preguntas: ["¿Cuál es el gesto más pequeño y concreto de amor en el evangelio de hoy?", "¿Cómo puedes llevar ese gesto a tu vida hoy — en una acción específica?", "¿Hay alguien concreto a quien llevarle la Buena Noticia hoy?"]
          },
        ];
        const fallback = fallbacks[dayOfYear % fallbacks.length];
        practiceCache.current[cacheKey] = fallback;
        setPracticeAIContent(prev => ({ ...prev, [index]: fallback }));
      } finally {
        setLoadingPractice(false);
      }
      return;
    }

    const staticContent = getStaticPracticeContent(index);
    practiceCache.current[cacheKey] = staticContent;
    setPracticeAIContent(prev => ({ ...prev, [index]: staticContent }));
  }

  const practiceContent = [
    {
      icon: "moon", color: C.blue, bg: C.iceBlue,
      label: "Oración de la mañana", sub: "Oración para arrancar el día · 5 min",
      saint: "San Juan de la Cruz",
      saintQuote: "«En el principio de la mañana, antes de que el alma se ocupe en ninguna cosa, consagre a Dios el primer movimiento del corazón.»",
      reflection: `Los Laudes — la oración de la mañana de la Iglesia — son una declaración teológica: antes de que el mundo me reclame, yo me pertenezco a Dios.\n\nSan Benito enseñaba que la primera obra del monje cada mañana debía ser la oración, no porque Dios la necesite, sino porque el alma la necesita.\n\nLa persona que ora en la mañana lleva consigo durante el día una quietud interior que no depende de las circunstancias. Santa Teresa de Ávila llamaba a esto "el punto de Arquímedes del alma".\n\nHoy, antes de revisar el teléfono, dedica estos minutos a consagrar el día a Dios. San Juan Vianney decía que bastaba con "mirar a Dios y dejar que Dios te mire."`,
      questions: ["¿Cómo llego a este nuevo día — con gratitud, con ansiedad, con prisa?", "¿Hay algo que quiero entregar específicamente a Dios esta mañana?", "¿Qué gracia concreta necesito hoy?"],
    },
    {
      icon: "book", color: C.navy, bg: "#DDE8F2",
      label: "Lectio Divina", sub: "Lectio divina diaria",
      saint: "San Bernardo de Claraval",
      saintQuote: "«El río que no regresa a su manantial se seca.»",
      reflection: `La escena de Betania es una de las más cargadas de tensión y de gracia en todo el Evangelio. Marta entra apresurada, con las manos llenas y el corazón ocupado. María está sentada a los pies de Jesús.\n\nJesús dice algo que ha desconcertado a los cristianos activos durante dos milenios: "María ha elegido la parte mejor."\n\nNo se trata de una condena al trabajo. Lo que Jesús señala es una prioridad: primero escuchar, luego actuar. Primero ser, luego hacer.\n\nLa Lectio Divina es el arte de sentarse con María mientras el mundo grita con Marta.`,
      questions: ["¿Me identifico más con Marta o con María en este momento?", "¿Hay alguna Palabra que Dios ha estado queriendo decirme?", "¿Qué pasaría si dedicara 15 minutos diarios a escuchar a Dios?"],
    },
    {
      icon: "heart", color: C.periwinkle, bg: "#E4EDF7",
      label: "Examen de conciencia", sub: "Examen de conciencia",
      saint: "San Ignacio de Loyola",
      saintQuote: "«El examen de conciencia no es contabilidad espiritual de pecados. Es aprender a leer la vida como Dios la lee.»",
      reflection: `San Ignacio consideraba el Examen la práctica más importante de la vida espiritual. No es una lista de pecados — es aprender a ver la propia vida con los ojos de Dios.\n\nSus cinco pasos: gratitud, petición de luz, revisión del día, reconocimiento y propósito.\n\nLo que hace único al Examen ignaciano es que no separa lo "espiritual" de lo "cotidiano". Dios está en la reunión difícil, en la conversación tensa, en el cansancio del final del día.\n\nEl Examen nos entrena para reconocer esa presencia donde menos la esperamos.`,
      questions: ["¿Por qué tres momentos de hoy puedo dar gracias a Dios?", "¿En qué momento sentí mayor paz interior? ¿Y en cuál más lejanía de Dios?", "¿Hay algo que mañana quiero vivir de manera diferente?"],
    },
  ];

  const firstName = profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Amigo";

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.home, paddingBottom: 90 }}>
      {openCard !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: "flex-end" }} onClick={() => setOpenCard(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: practiceContent[openCard].bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={practiceContent[openCard].icon} size={20} color={practiceContent[openCard].color} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>{practiceContent[openCard].label}</p>
                  <p style={{ fontSize: 11, color: C.slateLight, margin: 0 }}>{practiceContent[openCard].sub}</p>
                </div>
              </div>
              <button onClick={() => setOpenCard(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            {loadingPractice ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: C.slateLight, fontSize: 14 }}>✨ Mater está preparando tu reflexión...</p>
              </div>
            ) : (
              <>
                <div style={{ background: practiceContent[openCard].bg, borderRadius: 14, padding: "14px 16px", marginBottom: 20, borderLeft: `3px solid ${practiceContent[openCard].color}` }}>
                  <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, margin: "0 0 6px", lineHeight: 1.6 }}>{practiceAIContent[openCard]?.cita || practiceContent[openCard].saintQuote}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: practiceContent[openCard].color, margin: 0 }}>{practiceAIContent[openCard]?.santo || practiceContent[openCard].saint}</p>
                </div>
                <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 24px", whiteSpace: "pre-line" }}>{practiceAIContent[openCard]?.reflexion || practiceContent[openCard].reflection}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: practiceContent[openCard].color, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>Preguntas para orar</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(practiceAIContent[openCard]?.preguntas || practiceContent[openCard].questions).map((q, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${practiceContent[openCard].color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: practiceContent[openCard].color, fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                      <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, margin: 0 }}>{q}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button
                onClick={() => shareContent(practiceAIContent[openCard]?.cita || practiceContent[openCard]?.saintQuote || "", "Reflexión de Mater 🙏")}
                style={{ padding: "14px", background: C.iceBlue, border: "none", borderRadius: 14, color: C.navy, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", gap: 6 }}
              >
                📤
              </button>
              <button
                onClick={() => { markPracticeDone(openCard); setOpenCard(null); }}
                style={{ flex: 1, padding: "14px", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, border: "none", borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                Amén ✓
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 11, color: C.inkLight, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {(() => { const h = new Date().getHours(); return h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches"; })()}
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: C.ink, margin: "2px 0 0", lineHeight: 1.15, fontFamily: "'Cormorant Garamond', serif" }}>{firstName}</h1>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", border: "1px solid " + C.mist, flexShrink: 0 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: C.cream, fontWeight: 600, fontSize: 18 }}>{firstName[0]?.toUpperCase()}</div>
            }
          </div>
        </div>

        <div style={{ marginTop: 20, borderRadius: 12, background: C.navy, padding: "20px 22px", color: C.cream, borderLeft: `3px solid ${C.gold}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, margin: 0 }}>Versículo del día</p>
            <button onClick={() => shareContent(dailyVerse?.text + " — " + dailyVerse?.ref + "\n\nCompartido desde Mater 🙏")} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "4px 10px", color: C.cream, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <span>📤</span> Compartir
            </button>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 10px", fontFamily: "'Cormorant Garamond', serif" }}>{dailyVerse?.text}</p>
          <p style={{ fontSize: 10, opacity: 0.6, margin: 0, letterSpacing: "0.06em" }}>{dailyVerse?.ref}</p>
        </div>

        {/* Santo del día */}
        {saintOpen && saintOfDay && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: "flex-end" }} onClick={() => setSaintOpen(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>✨ Santo del día</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{saintOfDay.nombre}</p>
                  {saintOfDay.siglo && <p style={{ fontSize: 11, color: C.slateLight, margin: "2px 0 0" }}>{saintOfDay.siglo}</p>}
                </div>
                <button onClick={() => setSaintOpen(false)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
              </div>
              <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 20px", whiteSpace: "pre-line" }}>{saintOfDay.historia}</p>
              <div style={{ background: C.iceBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 16, borderLeft: `3px solid ${C.gold}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, margin: "0 0 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>🙏 Oración</p>
                <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, lineHeight: 1.7, margin: 0 }}>{saintOfDay.oracion}</p>
              </div>
              <div style={{ background: C.fog, borderRadius: 12, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, margin: "0 0 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>💡 ¿Sabías que...?</p>
                <p style={{ fontSize: 12, color: C.inkMid, lineHeight: 1.65, margin: 0 }}>{saintOfDay.dato}</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => setSaintOpen(true)} style={{ marginTop: 12, width: "100%", borderRadius: 12, background: C.cream, border: `1px solid ${C.mist}`, borderLeft: `3px solid ${C.gold}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
          <span style={{ fontSize: 24 }}>✨</span>
          <div style={{ flex: 1 }}>
            {loadingSaint ? (
              <p style={{ fontSize: 13, color: C.slateLight, margin: 0 }}>Cargando santo del día...</p>
            ) : saintOfDay ? (
              <>
                <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 2px" }}>Santo del día</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>{saintOfDay.nombre}</p>
              </>
            ) : (
              <p style={{ fontSize: 13, color: C.slateLight, margin: 0 }}>Santo del día</p>
            )}
          </div>
          <Icon name="chevron" size={16} color={C.gold} />
        </button>
      </div>

      <div style={{ padding: "22px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.inkLight, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>Ritmo semanal</p>
          <span style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>{streakCount} {streakCount === 1 ? "día esta semana" : "días esta semana"}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", aspectRatio: "1", borderRadius: 8, background: streakDays[i] ? (i === todayIdx ? C.navy : `${C.navy}22`) : C.fog, border: `1px solid ${streakDays[i] ? (i === todayIdx ? C.navy : C.mist) : C.mist}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {streakDays[i] && <svg width={10} height={10} viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" stroke={i === todayIdx ? C.cream : C.navy} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
              </div>
              <p style={{ fontSize: 9, color: i === todayIdx ? C.navy : C.inkLight, fontWeight: i === todayIdx ? 600 : 400, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "22px 22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: "0 0 12px" }}>Prácticas de hoy</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {practiceContent.map((c, i) => {
            const isDone = completedPractices[`${i}-${todayKey}`] || false;
            return (
              <button key={i} onClick={() => { setOpenCard(i); fetchPracticeContent(i, c.label, c.sub); }} style={{ background: isDone ? C.fog : C.cream, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, border: "1px solid " + C.mist, borderLeft: isDone ? `3px solid ${C.gold}` : `3px solid transparent`, cursor: "pointer", textAlign: "left", width: "100%" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.iceBlue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid " + C.mist }}>
                  <Icon name={c.icon} size={18} color={isDone ? C.gold : C.blue} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.ink, margin: 0 }}>{c.label}</p>
                  <p style={{ fontSize: 11, color: C.inkLight, margin: "2px 0 0" }}>{c.sub}</p>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: isDone ? C.gold : "transparent", border: isDone ? "none" : `1px solid ${C.mist}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isDone && <svg width={12} height={12} viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" stroke={C.cream} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Intención del mundo */}
      <div style={{ padding: "22px 22px 0" }}>
        {intentionOpen && worldIntention && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: "flex-end" }} onClick={() => setIntentionOpen(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ borderRadius: 16, background: "linear-gradient(135deg, " + (worldIntention.color1 || "#1a3a5c") + ", " + (worldIntention.color2 || "#2d6a8f") + ")", padding: "20px", marginBottom: 20, textAlign: "center" }}>
                <p style={{ fontSize: 40, margin: "0 0 8px" }}>{worldIntention.emoji}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>{worldIntention.lugar}</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{worldIntention.titulo}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Intencion del mundo</p>
                <button onClick={() => setIntentionOpen(false)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>x</button>
              </div>
              <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 20px" }}>{worldIntention.descripcion}</p>
              <div style={{ background: C.iceBlue, borderRadius: 14, padding: "16px", borderLeft: "3px solid " + (worldIntention.color1 || C.navy) }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: worldIntention.color1 || C.navy, margin: "0 0 10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Oracion de intercesion</p>
                <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, lineHeight: 1.8, margin: 0 }}>{worldIntention.oracion}</p>
              </div>
            </div>
          </div>
        )}
        <button onClick={() => setIntentionOpen(true)} style={{ width: "100%", borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "none", padding: 0, textAlign: "left" }}>
          <div style={{ background: "linear-gradient(135deg, " + (worldIntention && worldIntention.color1 ? worldIntention.color1 : "#1a3a5c") + ", " + (worldIntention && worldIntention.color2 ? worldIntention.color2 : "#2d6a8f") + ")", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{worldIntention ? worldIntention.emoji : "🌍"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 2px" }}>Intencion del mundo</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{worldIntention ? worldIntention.titulo : "Cargando..."}</p>
              {worldIntention && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>{worldIntention.lugar}</p>}
            </div>
            <Icon name="chevron" size={18} color="rgba(255,255,255,0.7)" />
          </div>
        </button>
      </div>

      <div style={{ padding: "22px 22px 0" }}>
        <button onClick={() => onTabChange("chat")} style={{ width: "100%", borderRadius: 16, cursor: "pointer", background: `linear-gradient(135deg, ${C.iceBlue} 0%, #DDE8F4 100%)`, border: `1.5px solid ${C.mist}`, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
            <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>Hablar con Mater</p>
            <p style={{ fontSize: 11, color: C.inkLight, margin: "2px 0 0" }}>¿Tienes algo en el corazón hoy?</p>
          </div>
          <Icon name="chevron" size={18} color={C.blue} />
        </button>
      </div>
    </div>
  );
}

const SYSTEM_PROMPT = `Eres Mater, una guía de coaching espiritual católico para jóvenes adultos de 25 a 35 años. Tu nombre evoca el amor materno de la Virgen María.

Tu espiritualidad integra varias tradiciones:
- Ignaciana: el discernimiento, el examen de conciencia, "buscar y hallar a Dios en todas las cosas"
- Mariana: la confianza filial, el fiat, la intercesión de María
- Franciscana: la sencillez, el amor a la creación, la fraternidad
- Carmelita: la oración contemplativa, la interioridad
- Schoenstattiana: la alianza de amor con María como Madre y Reina, el santuario como hogar espiritual, el Padre José Kentenich como maestro de vida interior, la contribución como ofrenda de amor

Cómo respondes:
- Con calidez, profundidad y cercanía — como una amiga sabia
- Hablas en español latinoamericano, natural y cercano
- Nunca juzgas ni condenas — acompañas con misericordia
- Haces preguntas que invitan a la reflexión interior
- Tus respuestas tienen máximo 4-5 oraciones para el formato móvil

RIGOR DOCTRINAL Y TEOLÓGICO:
- Te apegas estrictamente a la doctrina católica oficial según el Catecismo de la Iglesia Católica
- Toda cita bíblica que uses debe ser precisa, con la referencia correcta (libro, capítulo, versículo)
- Toda cita de un santo debe ser auténtica y verificable — si no estás seguro de la exactitud de una cita, no la atribuyas directamente, habla del concepto sin comillas
- No inventas doctrinas, apariciones marianas, ni enseñanzas que no estén respaldadas por el Magisterio de la Iglesia
- Si una pregunta toca un tema doctrinal complejo o controvertido, respondes con la enseñanza oficial de la Iglesia, citando el Catecismo cuando sea posible, y reconoces cuando un tema requiere la guía de un sacerdote o director espiritual
- Nunca presentas opiniones personales como si fueran doctrina de la Iglesia`;

function ChatScreen({ user }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hola 🙏 Soy Mater, tu guía espiritual. Estoy aquí para acompañarte en tu camino de fe. ¿Cómo está tu corazón hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.map(b => b.text || "").join("") || "...";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Hubo un error al conectar. Por favor intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: gradients.chat }}>
      <div style={{ padding: "52px 22px 16px", background: C.cream, borderBottom: `1px solid ${C.mist}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, overflow: "hidden" }}>
            <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}>Mater</p>
            <p style={{ fontSize: 11, color: C.sky, margin: 0, fontWeight: 600 }}>● Guía espiritual</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12, animation: "fadeIn 0.2s ease" }}>
            {m.role === "assistant" && (
              <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, overflow: "hidden", marginRight: 8, alignSelf: "flex-end" }}>
                <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <div style={{ maxWidth: "78%", background: m.role === "user" ? C.navy : C.cream, color: m.role === "user" ? C.cream : C.ink, borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "11px 14px", fontSize: 13.5, lineHeight: 1.65, border: m.role === "user" ? "none" : `1px solid ${C.mist}` }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, overflow: "hidden" }}>
              <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ background: C.white, borderRadius: "18px 18px 18px 4px", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: C.blue, opacity: 0.4, animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length < 3 && (
        <div style={{ padding: "0 16px 8px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["No sé cuál es mi vocación", "Me cuesta orar en el día a día", "Siento que Dios está lejos"].map((s, i) => (
            <button key={i} onClick={() => setInput(s)} style={{ background: C.white, border: `1.5px solid ${C.mist}`, borderRadius: 100, padding: "6px 12px", fontSize: 11, color: C.blue, fontWeight: 600, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 16px 80px", background: C.cream, borderTop: `1px solid ${C.mist}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Escribe lo que llevas en el corazón..."
          style={{ flex: 1, border: "1px solid " + C.mist, outline: "none", background: C.fog, borderRadius: 12, padding: "11px 14px", fontSize: 13.5, color: C.ink, fontFamily: "'DM Sans', system-ui, sans-serif" }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: input.trim() ? C.navy : C.mist, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", flexShrink: 0 }}>
          <Icon name="send" size={16} color={C.cream} />
        </button>
      </div>
    </div>
  );
}

function PlanScreen({ user }) {
  const [activeWeek, setActiveWeek] = useState(0);
  const [progress, setProgress] = useState({});
  const [saving, setSaving] = useState(null);
  const [openDay, setOpenDay] = useState(null);
  const [dayContent, setDayContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [gospelOfDay, setGospelOfDay] = useState(null);
  const [loadingGospel, setLoadingGospel] = useState(false);
  const contentCache = useRef({});

  async function callAI(systemPrompt, userMessage) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.content?.map(b => b.text || "").join("") || "{}";
    return text.replace(/```json|```/g, "").trim();
  }

  async function fetchGospelOfDay() {
    if (gospelOfDay) return;
    setLoadingGospel(true);
    try {
      // Construir URL de USCCB para hoy — formato MMDDYY Ciclo A
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const yy = String(now.getFullYear()).slice(-2);
      const usccbUrl = `https://bible.usccb.org/es/bible/lecturas/${mm}${dd}${yy}.cfm`;

      // Pasar por nuestro proxy para evitar CORS
      const res = await fetch("/api/gospel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: usccbUrl }),
      });
      const data = await res.json();
      if (data && data.referencia) {
        setGospelOfDay(data);
      } else {
        throw new Error("Sin datos");
      }
    } catch {
      // Fallback IA
      try {
        const today = new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        const text = await callAI(
          "Eres un experto en liturgia catolica con acceso preciso al Leccionario Romano oficial. Tu prioridad absoluta es la EXACTITUD: el texto biblico debe ser textual, tal como aparece en una traduccion catolica aprobada. NUNCA parafraseas ni alteras el texto biblico. Respondes SOLO en JSON valido sin bloques de codigo.",
          "Hoy es " + today + ". Estamos en el Ciclo A del leccionario. Dame el TEXTO BIBLICO TEXTUAL Y COMPLETO del evangelio que corresponde exactamente a hoy. No resumas ni parafrasees. SOLO el texto del evangelio, no otras lecturas. Responde SOLO con: {referencia: 'Evangelio segun San X, X:X-X', tiempo: 'Tiempo liturgico', textoCompleto: 'Texto biblico textual completo en español'}"
        );
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        setGospelOfDay(parsed);
      } catch {
        setGospelOfDay({
          referencia: "Juan 15:1-8",
          tiempo: "Tiempo Ordinario",
          textoCompleto: "En aquel tiempo, dijo Jesús a sus discípulos:\n\n«Yo soy la vid verdadera y mi Padre es el viñador. Todo sarmiento que en mí no da fruto, lo arranca, y todo el que da fruto, lo poda para que dé más fruto.\n\nVosotros ya estáis limpios gracias a la palabra que os he hablado. Permaneced en mí y yo en vosotros. Como el sarmiento no puede dar fruto por sí mismo si no permanece en la vid, así tampoco vosotros si no permanecéis en mí.\n\nYo soy la vid; vosotros los sarmientos. El que permanece en mí y yo en él, ese da mucho fruto; porque sin mí no podéis hacer nada.\n\nSi permanecéis en mí y mis palabras permanecen en vosotros, pedid lo que queráis y se os dará.»",
        });
      }
    } finally {
      setLoadingGospel(false);
    }
  }


  function getStaticDayContent(weekIdx, dayIdx) {
    const allContent = [
      [
        { santo: "San Agustín de Hipona", cita: "«Nos hiciste para Ti, Señor, y nuestro corazón está inquieto hasta que descanse en Ti.»", reflexion: "¿Quién es Dios para ti hoy — no el Dios de tu infancia ni el de los libros, sino el Dios que te busca en este momento preciso de tu vida?\n\nSan Agustín pasó décadas buscando en los lugares equivocados: en la filosofía, en el placer, en el poder intelectual. Y cuando finalmente se rindió, descubrió que Dios no era el final de un camino largo sino el suelo mismo que siempre había pisado.\n\nEsta pregunta no tiene respuesta fácil, y eso es precisamente su valor. La vida espiritual comienza cuando dejamos de describir a Dios y empezamos a escucharle.\n\nNo necesitas tener todo claro. Necesitas estar dispuesto a ser sorprendido por un Dios que es siempre más grande, más cercano y más amoroso de lo que imaginas.", preguntas: ["¿Qué imagen de Dios llevas contigo hoy — y de dónde viene esa imagen?", "¿En qué área de tu vida sientes que Dios está llamando a la puerta?", "¿Qué necesitarías soltar para encontrarte con Dios de una manera más real?"] },
        { santo: "Santa Teresa de Ávila", cita: "«Que nada te turbe, que nada te espante. Todo se pasa. Dios no se muda.»", reflexion: "El Salmo 139 es una de las oraciones más íntimas de toda la Escritura. No es un himno de alabanza distante — es el asombro de alguien que descubre que ha sido conocido antes de conocerse a sí mismo.\n\n'Me sondeas y me conoces... Conoces mis pensamientos desde lejos.' Hay algo que puede asustar en estas palabras: no hay dónde esconderse. Pero hay también algo profundamente liberador: no necesitas fingir ante Dios.\n\nSanta Teresa de Ávila pasó años rezando con miedo de que Dios viera su interior. Hasta que un día comprendió que Dios ya lo había visto todo — y la amaba exactamente así.\n\nHoy, el Salmo 139 te invita a dejar de presentarle a Dios la versión editada de ti mismo. Él ya conoce los borradores. Y los ama todos.", preguntas: ["¿Hay alguna parte de ti que sientes que no puedes mostrarle a Dios?", "¿Cómo cambia tu oración cuando sabes que Dios ya te conoce completamente?", "¿Qué significa para ti ser conocido y amado al mismo tiempo?"] },
        { santo: "San Juan de la Cruz", cita: "«El que sabe morir a todo, tendrá vida en todo.»", reflexion: "La oración no es un monólogo espiritual. No es hablarle a un techo vacío ni repetir fórmulas que alguna vez tuvieron vida. La oración es, en su esencia más profunda, una conversación entre dos que se aman.\n\nSan Juan de la Cruz enseñaba que el mayor obstáculo para la oración no es la distracción — es la ilusión de que tenemos que producir algo en el silencio.\n\nEn la tradición carmelita, la oración se entiende como un trato de amistad. No necesitas vocabulario especial ni estados místicos. Necesitas lo mismo que en cualquier amistad profunda: presencia honesta y tiempo real.\n\nHoy, antes de hablar con Dios, siéntate un momento en silencio y permite que Él hable primero. La conversación más transformadora que puedas tener hoy no será con ningún ser humano.", preguntas: ["¿Cuándo fue la última vez que sentiste que tu oración era realmente una conversación?", "¿Qué te cuesta más en la oración: hablar o escuchar?", "¿Qué le dirías a Dios hoy si supieras que te está escuchando completamente?"] },
        { santo: "San Agustín de Hipona", cita: "«Tarde te amé, hermosura tan antigua y tan nueva, tarde te amé.»", reflexion: "Las Confesiones de San Agustín son el primer gran libro de psicología espiritual de la historia. En ellas, Agustín no solo narra su conversión — narra el mapa interior de un alma que busca a Dios sin saber que lo está buscando.\n\nLo que hace único a Agustín es su honestidad radical. No edita sus pecados ni suaviza sus fracasos. Los expone con la misma precisión con que expone la gracia de Dios. Y en ese contraste nace una teología del amor que sigue siendo revolucionaria.\n\n'Nos hiciste para Ti' — esta frase no es solo una declaración teológica. Es el diagnóstico de toda la inquietud humana. El deseo que no termina de llenarse, la búsqueda que no termina en ninguna conquista humana — todo eso es el rastro de Dios en el alma.\n\nHoy, encuentra en Agustín tu propia historia. Él escribió para ti, aunque no te conociera.", preguntas: ["¿En qué lugares has buscado llenar un vacío que solo Dios puede llenar?", "¿Qué frase de San Agustín resuena más con tu experiencia actual?", "¿Cómo describirías tu propia 'búsqueda' espiritual hasta hoy?"] },
        { santo: "San Juan de la Cruz", cita: "«En el silencio habló Dios a mi alma cosas que no se pueden decir.»", reflexion: "Vivimos en una civilización que tiene terror al silencio. Llenamos cada pausa con música, con notificaciones, con ruido de fondo. Como si el silencio fuera una amenaza en lugar de una invitación.\n\nSan Juan de la Cruz pasó meses en una celda oscura en Toledo, prisionero de su propia orden. Y fue en ese silencio forzado donde escribió algunos de los poemas más luminosos de la literatura española. El silencio no lo aplastó — lo purificó.\n\nDiez minutos de silencio contemplativo no es meditación new age. Es volver al origen. Es recordar quién eres cuando nadie te está mirando y no tienes nada que demostrar.\n\nHoy, busca un lugar sin pantallas y sin ruido. Siéntate. Respira. No intentes pensar en Dios — simplemente permite que Dios piense en ti.", preguntas: ["¿Qué sientes cuando estás en silencio — paz, ansiedad, aburrimiento?", "¿Qué crees que encontrarías si te quedaras en silencio con Dios durante diez minutos?", "¿Qué ruido de tu vida interior necesitas apagar antes de poder escuchar?"] },
        { santo: "San Ignacio de Loyola", cita: "«No el saber mucho, sino el sentir y gustar las cosas interiormente, satisface y sacia el alma.»", reflexion: "El Examen ignaciano no es un inventario de pecados. San Ignacio lo diseñó como una práctica de reconocimiento — aprender a ver la mano de Dios en la textura ordinaria de los días.\n\nLa semana que termina hoy fue un tapiz de momentos. Algunos brillantes, algunos oscuros, algunos tan cotidianos que los dejamos pasar sin mirarlos. El Examen te invita a volver atrás con ojos nuevos.\n\n¿Dónde estaba Dios en esa conversación difícil? ¿Qué quería decirte en ese momento de alegría inesperada? ¿Qué movimiento interior notaste cuando tomaste aquella decisión?\n\nEl Examen semanal no busca perfección — busca conciencia. Un alma consciente es un alma libre. Y un alma libre puede amar sin miedo.", preguntas: ["¿En qué momento de esta semana sentiste mayor consolación — paz, alegría, amor?", "¿En qué momento sentiste mayor desolación — vacío, ansiedad, lejanía de Dios?", "¿Qué patrón notas en tu vida interior cuando miras la semana completa?"] },
        { santo: "San Pío X", cita: "«La Misa es la oración más perfecta que existe porque en ella Jesús mismo ora con nosotros y por nosotros.»", reflexion: "La Misa dominical no es una obligación religiosa que cumplir — es una cita de amor que Dios ha puesto en el corazón de la semana. Un momento donde el tiempo ordinario se rompe y entra la eternidad.\n\nSan Pío X entendía la Misa como el acto más revolucionario que puede hacer un ser humano: participar en el ofrecimiento que Cristo hace de sí mismo al Padre. No como espectador, sino como parte del Cuerpo.\n\nHoy, entra a la Misa con una sola intención: estar presente de verdad. Presente en el Kyrie, en la Palabra, en el silencio después de la comunión.\n\nLa Misa te cambia cuando la dejas entrar. Y la deja entrar quien viene con el corazón abierto y las manos vacías.", preguntas: ["¿Qué parte de la Misa de hoy te habló más directamente?", "¿Qué ofreces tú en esta Misa — qué pones en el altar junto con el pan y el vino?", "¿Cómo quieres que esta Misa cambie tu semana que comienza?"] },
      ],
      [
        { santo: "San Bernardo de Claraval", cita: "«El que bebe de Mí tendrá en sí mismo un manantial que salta hasta la vida eterna.»", reflexion: "La mujer samaritana llegó al pozo de Jacob a mediodía — la hora en que nadie iba, para no cruzarse con nadie. Llevaba una historia que prefería cargar sola. Y fue ahí, en su momento de mayor soledad, donde encontró a Jesús.\n\nJesús le pide agua, pero le ofrece otra cosa: 'Si conocieras el don de Dios.' La conversación más importante de su vida comenzó con un gesto ordinario y terminó con una revelación que cambió una ciudad entera.\n\nSan Bernardo meditó profundamente sobre este pasaje. Lo que más le asombraba era la delicadeza de Jesús: no juzga a la mujer, no enumera sus pecados. La seduce con una promesa: hay un agua que sacia de verdad.\n\nHoy, ¿de qué pozos estás bebiendo tú? ¿Cuáles te sacian realmente y cuáles te dejan con más sed?", preguntas: ["¿Con qué aspectos de la samaritana te identificas más?", "¿Qué 'pozos' visitas cuando tienes sed interior — trabajo, relaciones, pantallas?", "¿Qué sería para ti el 'agua viva' que Jesús te ofrece hoy?"] },
        { santo: "Santa Teresa de Ávila", cita: "«El alma es como un castillo hecho de un solo diamante, en el cual hay muchos aposentos.»", reflexion: "Santa Teresa de Ávila escribió Las Moradas en un estado de oración tan profundo que, según sus contemporáneos, apenas tocaba el suelo mientras escribía. No era exageración: Teresa había aprendido a vivir desde adentro hacia afuera.\n\nEl castillo interior es una metáfora audaz: el alma humana no es una sala pequeña sino un palacio con siete moradas. La mayoría de las personas viven en el vestíbulo, sin saber la riqueza que hay adentro.\n\nTeresa enseña que la vida interior no es para contemplativos con tiempo libre — es para cualquiera que decida tomarse en serio la pregunta de quién es.\n\nHoy, ¿en qué morada de tu castillo interior estás viviendo? ¿Hay puertas que no te has atrevido a abrir?", preguntas: ["¿Qué descubres cuando te quedas en silencio y miras hacia adentro?", "¿Qué 'aposento' de tu interior sientes que Dios quiere explorar contigo?", "¿Qué te impide entrar más profundo en tu vida interior?"] },
        { santo: "Santa Teresa de Ávila", cita: "«Quien a Dios tiene, nada le falta. Solo Dios basta.»", reflexion: "El Padre Nuestro es la oración más rezada de la historia humana. Y también, paradójicamente, una de las menos comprendidas. La repetimos tan seguido que dejamos de escucharla.\n\nJesús no dio esta oración para que la recitáramos — la dio para que la habitáramos. 'Padre' — ya en la primera palabra hay una revolución. No 'Rey', no 'Juez'. Alguien cercano, que conoce tus necesidades antes de que las digas.\n\n'Hágase tu voluntad' — tres palabras que resumen toda la espiritualidad cristiana. No resignación, sino la libertad más grande: confiar en que la voluntad de Dios es más buena que la mía.\n\n'El pan de cada día' — Dios no te pide que planifiques para cinco años. Te pide que confíes para hoy. Solo para hoy. Eso ya es suficiente.", preguntas: ["¿Qué frase del Padre Nuestro te resulta más difícil de rezar con sinceridad?", "¿Qué significa para ti llamar 'Padre' a Dios — qué evoca esa palabra?", "¿Cómo cambiaría tu día si rezaras el Padre Nuestro una frase a la vez, en silencio?"] },
        { santo: "San Ignacio de Loyola", cita: "«En tiempo de desolación, no hacer mudanza; en tiempo de consolación, prepararse para la desolación futura.»", reflexion: "El discernimiento ignaciano es uno de los regalos más prácticos que la Iglesia ha dado a la vida espiritual. No es misticismo reservado para contemplativos — es una herramienta para cualquiera que quiera tomar decisiones desde Dios.\n\nLas mociones espirituales son los movimientos interiores del alma: pensamientos, sentimientos, impulsos, resistencias. Ignacio enseñaba a leer estos movimientos como un texto sagrado.\n\nConsolación no significa sentirse bien — significa moverse hacia Dios, hacia el amor, hacia la paz profunda. Desolación no significa sentirse mal — significa alejarse de Dios, aunque sea con sonrisa en el rostro.\n\nAprender a distinguir estas mociones es aprender el idioma en que Dios te habla. Y como todo idioma, requiere práctica, paciencia y un buen maestro.", preguntas: ["¿Qué decisión importante tienes por delante y cómo te sientes interiormente al pensarla?", "¿Puedes identificar una consolación y una desolación de esta semana?", "¿Qué 'espíritu' crees que está detrás de los impulsos más fuertes que sientes ahora?"] },
        { santo: "San Francisco de Asís", cita: "«Predica el Evangelio siempre; si es necesario, usa palabras.»", reflexion: "El cuerpo no es un obstáculo para la oración — es un aliado. Las grandes tradiciones espirituales lo han sabido siempre: la postura que adoptas en la oración no es indiferente, porque somos seres encarnados y oramos con todo lo que somos.\n\nSan Francisco rezaba al aire libre, con los brazos en cruz, hincado en la tierra húmeda. Su oración era física porque su fe era física — encarnada, concreta, real.\n\nHoy, experimenta con la postura en la oración. Pon una mano sobre el corazón y siente tu propio latido. Respira conscientemente: al inhalar, recibe el amor de Dios; al exhalar, suelta lo que no necesitas cargar.\n\nEl cuerpo recuerda lo que la mente olvida. Una rodilla en tierra puede decirle a Dios lo que las palabras no alcanzan.", preguntas: ["¿Qué postura corporal te ayuda más a entrar en oración?", "¿Cómo influye el entorno físico en tu capacidad de orar?", "¿Qué le diría tu cuerpo a Dios hoy si pudiera hablar?"] },
        { santo: "San Ignacio de Loyola", cita: "«Pocas personas sospechan cuánto Dios haría por ellas si se abandonaran completamente a Él.»", reflexion: "La segunda semana ha sido una inmersión en la vida interior. Has contemplado el pozo de la samaritana, has explorado el castillo de Teresa, has aprendido el idioma de las mociones espirituales.\n\nEl Examen semanal de hoy no busca evaluar tu 'rendimiento' espiritual. Busca algo más delicado: reconocer el movimiento de Dios en los detalles de la semana.\n\n¿Hubo un momento en que sentiste que algo se abría dentro de ti? ¿Una conversación, una pausa inesperada? ¿Hubo un momento en que sentiste resistencia a algo que Dios te pedía?\n\nLa vida interior no se mide en experiencias extraordinarias. Se mide en la calidad de la atención que le prestas a lo ordinario.", preguntas: ["¿Qué práctica de esta semana tocó más profundamente tu vida interior?", "¿Qué resistencia espiritual encontraste esta semana — y qué te dice eso?", "¿Qué quiere Dios que lleves de esta semana a la siguiente?"] },
        { santo: "San Juan Pablo II", cita: "«No tengan miedo de ser santos. Tengan la ambición de ser grandes santos.»", reflexion: "La Misa de hoy cierra una semana de interioridad. Y hay algo profundamente bello en eso: la vida interior no termina en sí misma — desemboca en la comunidad, en la Eucaristía, en el Cuerpo de Cristo reunido.\n\nSan Juan Pablo II celebraba la Misa con una concentración que asombraba a quienes lo conocían. Era el fruto de décadas de vida interior llevadas al altar.\n\nHoy, lleva a la Misa todo lo que has explorado esta semana. Lleva las preguntas sin respuesta, las consolaciones que recibiste, las resistencias que encontraste. Pon todo eso en el ofertorio.\n\nLa Eucaristía no es el final de la vida interior — es su corazón. Aquí, en este pan partido, está el mismo Dios que encontraste en el silencio de tu semana.", preguntas: ["¿Qué llevas hoy al altar como ofrenda personal?", "¿Cómo ha cambiado tu manera de participar en la Misa después de esta semana?", "¿Qué gracia específica quieres pedirle a Dios en la comunión de hoy?"] },
      ],
      [
        { santo: "Padre José Kentenich", cita: "«Dios quiere que seamos instrumentos en manos de María para la renovación del mundo.»", reflexion: "El 18 de octubre de 1914, un grupo de jóvenes seminaristas se reunió en una pequeña capilla en Schoenstatt, Alemania. El Padre José Kentenich los invitó a hacer algo audaz: ofrecerse a María como instrumentos para la renovación de la Iglesia y del mundo.\n\nNadie imaginaba ese día que aquel gesto pequeño daría origen a un movimiento que llegaría a todos los continentes. Pero Kentenich entendía algo que los grandes estrategas espirituales han sabido siempre: Dios trabaja desde lo pequeño.\n\nEl carisma schoenstattiano no es una devoción mariana más — es una pedagogía de vida. Kentenich quería formar 'hombres y mujeres nuevos para un mundo nuevo': personas con una personalidad tan enraizada en Dios que pudieran transformar su entorno desde adentro.\n\nHoy, conoce los orígenes de Schoenstatt no como historia sino como invitación. ¿Qué significa para ti ser instrumento de María en tu propio tiempo y lugar?", preguntas: ["¿Qué te atrae del carisma de Schoenstatt — qué resuena en ti?", "¿En qué 'capilla pequeña' de tu vida está Dios haciendo algo grande?", "¿Cómo entiendes la idea de ser 'instrumento' — no herramienta sino colaborador libre?"] },
        { santo: "Padre José Kentenich", cita: "«La alianza de amor es un sí total dado con toda libertad, no una vez sino cada día.»", reflexion: "La alianza de amor con María es el corazón del carisma de Schoenstatt. No es una consagración que se hace una vez y se olvida — es una relación viva que se renueva cada día.\n\nKentenich entendía la relación con María como una verdadera relación de amor filial. María no es un canal de gracias ni una máquina de milagros — es una Madre real que se involucra personalmente en la vida de sus hijos.\n\nLa alianza tiene dos movimientos: la contribución — lo que tú llevas al santuario, tus luchas, tus talentos, tu amor — y el capital de gracias — lo que María aporta desde su plenitud.\n\nHoy, renueva tu alianza de amor con María. Un corazón que dice 'sí' con libertad y amor es toda la oración que María necesita.", preguntas: ["¿Qué significa para ti tener a María como Madre en tu vida espiritual?", "¿Qué llevas tú a la alianza — qué es tu 'contribución' hoy?", "¿En qué área de tu vida necesitas especialmente la maternidad de María?"] },
        { santo: "Padre José Kentenich", cita: "«El santuario es el hogar del alma, el lugar donde María nos espera como Madre.»", reflexion: "Cada santuario de Schoenstatt en el mundo es una réplica de la pequeña capilla original en Alemania. No por nostalgia arquitectónica, sino por una convicción teológica: María eligió ese lugar para hacer su hogar, y donde ella habita, transforma.\n\nKentenich hablaba del santuario como 'hogar espiritual' — un concepto que toca algo muy profundo en el corazón humano. Todos necesitamos un lugar donde ser recibidos sin condiciones, donde no tengamos que fingir.\n\nEl santuario no es magia geográfica. Es el punto de encuentro entre la fidelidad de María y la libertad del alma.\n\nHoy, si puedes, visita un santuario. Si no, crea en tu interior un espacio sagrado donde María pueda encontrarte. El verdadero santuario está primero en el corazón.", preguntas: ["¿Tienes un 'lugar sagrado' donde te encuentres con Dios — físico o interior?", "¿Qué significaría para ti tener un hogar espiritual al que volver cada día?", "¿Qué llevas hoy al santuario — qué necesitas dejar en manos de María?"] },
        { santo: "Padre José Kentenich", cita: "«La contribución no es un pago — es un gesto de amor de un hijo a su Madre.»", reflexion: "La contribución es uno de los conceptos más originales de la espiritualidad schoenstattiana. Kentenich propuso que los miembros del Movimiento 'contribuyeran' al capital de gracias del santuario — no con dinero sino con amor vivido.\n\nCada oración fiel, cada sacrificio pequeño, cada acto de amor cotidiano que se ofrece conscientemente a María se convierte en capital espiritual que ella administra con sabiduría materna.\n\nLo revolucionario de esta idea es que nada de tu vida queda afuera. El momento difícil en el trabajo, la paciencia con alguien que te irrita, la alegría que compartes — todo puede ser contribución si lo ofreces con amor.\n\nHoy, elige un momento ordinario de tu día y ofrécelo conscientemente a María. Ese gesto pequeño tiene un peso espiritual que no alcanzas a ver todavía.", preguntas: ["¿Qué momento de tu día de hoy puedes convertir en una contribución a María?", "¿Cómo cambia tu perspectiva de las dificultades cuando las ofreces como contribución?", "¿Qué te cuesta más contribuir — los momentos difíciles o los de alegría?"] },
        { santo: "Padre José Kentenich", cita: "«Ser instrumento no significa perder la personalidad sino encontrarla plenamente.»", reflexion: "La imagen del instrumento puede sonar pasiva, incluso alienante. Pero Kentenich entendía exactamente lo contrario: el instrumento en manos de María es alguien que ha encontrado su vocación más profunda y la vive con mayor libertad.\n\nUn violín no pierde su ser cuando está en manos de un gran músico — lo realiza plenamente. Sus resonancias más profundas florecen en la colaboración con el intérprete.\n\nSer instrumento de María significa dejar que ella trabaje a través de tus dones, tu carácter, tu historia — todo lo que eres. No te pide que te borres sino que te pongas a disposición.\n\nHoy, pregúntate: ¿en qué área de tu vida quiere María ser Madre y guía? ¿Dónde necesitas su sabiduría materna para ser más plenamente quien Dios quiso que fueras?", preguntas: ["¿En qué áreas de tu vida sientes que María quiere ser tu guía?", "¿Qué talentos tuyos podrían ser instrumentos en sus manos?", "¿Qué significaría 'rendirte' a María — no pasivamente sino con amor activo?"] },
        { santo: "Padre José Kentenich", cita: "«El Movimiento de Schoenstatt es un movimiento del Espíritu Santo a través de María.»", reflexion: "La tercera semana ha sido una inmersión en la espiritualidad mariana de Schoenstatt. Has conocido a Kentenich, has renovado la alianza, has visitado el santuario en el corazón, has aprendido la lógica de la contribución.\n\nAhora es momento de hacer el examen con ojos marianos: ¿dónde has sentido la presencia y el amor de María esta semana?\n\nKentenich decía que el 'sello de María' en el alma no se ve de afuera — se siente desde adentro. Es una cierta ternura hacia las personas, una paz que no depende de las circunstancias, una libertad interior que crece.\n\nHoy, revisa tu semana buscando ese sello. Y si no lo encuentras fácilmente, pídele a María que te enseñe a verlo.", preguntas: ["¿Dónde sentiste la presencia de María esta semana — aunque fuera de manera sutil?", "¿Qué aspecto del carisma de Schoenstatt quieres llevar a tu vida cotidiana?", "¿Cómo ha cambiado tu relación con María después de esta semana?"] },
        { santo: "Beata Emilia Engel", cita: "«Todo para María, con María, en María y por María hacia Dios.»", reflexion: "La Misa de hoy es la culminación de una semana mariana. Y hay algo profundamente bello en eso: María siempre lleva a Jesús. En Caná, en Belén, en el Calvario — María apunta siempre hacia su Hijo.\n\nLa consagración a María no desvía la mirada de Cristo — la enfoca. María es el camino más seguro hacia Jesús porque ella lo conoce mejor que nadie. Fue la primera en recibirlo, la primera en contemplarlo, la primera en seguirlo hasta la cruz.\n\nBeata Emilia Engel, una de las primeras mujeres en recibir el carisma de Schoenstatt, decía que la consagración a María era como poner las manos de Jesús en las manos de su Madre.\n\nHoy, al recibir la Eucaristía, dile a María: 'Recíbelo tú, que sabes recibirlo mejor que yo.'", preguntas: ["¿Cómo ha enriquecido tu relación con Jesús esta semana de espiritualidad mariana?", "¿Qué quieres consagrar a María hoy — qué área de tu vida pones en sus manos?", "¿Qué gracia específica le pides a María para la semana que comienza?"] },
      ],
      [
        { santo: "San Francisco Javier", cita: "«Daría mil vidas por salvar una sola alma.»", reflexion: "La vocación no es un cargo — es un llamado. Y el llamado de Dios rara vez llega con instrucciones detalladas y garantías de éxito. Llega como una inquietud que no desaparece, como un deseo que persiste a pesar de todo.\n\nSan Francisco Javier era un joven brillante con un futuro académico prometedor cuando Ignacio de Loyola le preguntó: '¿De qué le sirve al hombre ganar el mundo entero si pierde su alma?' Esa pregunta cambió todo.\n\nLa vocación no siempre es dramática. Para la mayoría de las personas, el llamado de Dios llega a través de lo que más aman, lo que más les duele en el mundo, y lo que les da más vida cuando lo hacen.\n\nHoy, no busques certezas — busca pistas. ¿Qué te da vida? ¿Qué injusticia no puedes ignorar? ¿En qué momentos sientes que eres más plenamente tú mismo?", preguntas: ["¿Qué te da más vida cuando lo haces — qué actividad, qué servicio, qué relación?", "¿Hay un llamado que sientes pero al que le has estado diciendo 'no' por miedo?", "¿Cómo describirías tu vocación en este momento de tu vida — aunque sea con incertidumbre?"] },
        { santo: "San Francisco de Asís", cita: "«Empieza haciendo lo necesario, luego lo posible, y de repente estarás haciendo lo imposible.»", reflexion: "San Francisco de Asís no salió a cambiar el mundo con un plan estratégico. Salió a abrazar un leproso, a reparar una capilla en ruinas, a predicar a los pájaros. Y de esa sencillez radical nació un movimiento que renovó la Iglesia del siglo XIII.\n\nLa fraternidad universal de Francisco no era una idea abstracta — era una práctica concreta de ver a Cristo en cada persona. El leproso que abrazó era Cristo. Los pájaros a los que predicaba eran hermanos. Esta visión franciscana no es romanticismo ecológico — es teología encarnada.\n\nSi todo viene de Dios y todo tiene una dignidad dada por Dios, entonces nada puede ser tratado con desprecio o indiferencia.\n\nHoy, mira tu entorno con ojos franciscanos. ¿A quién o qué estás ignorando que merece tu atención? ¿Dónde puedes hacer un gesto pequeño de fraternidad universal?", preguntas: ["¿Con quién te cuesta más ver a Cristo — quién es tu 'leproso'?", "¿Cómo vives la fraternidad en tu entorno cotidiano — trabajo, familia, ciudad?", "¿Qué gesto concreto de fraternidad universal puedes hacer esta semana?"] },
        { santo: "San Josemaría Escrivá", cita: "«No hay nada pequeño si se hace por Dios y con Dios.»", reflexion: "San Josemaría Escrivá dedicó su vida a proclamar una verdad que parece simple y es revolucionaria: el trabajo ordinario puede ser oración. No 'además' de la oración — el trabajo mismo, hecho con amor, es un camino de santificación.\n\nOrar con las manos significa llevar la presencia de Dios al escritorio, a la cocina, al quirófano, al aula. No con gestos religiosos superficiales sino con la calidad de la atención, el cuidado en los detalles, la caridad con los colegas.\n\nEsta visión transforma radicalmente el significado de la jornada laboral. El lunes ya no es el fin del fin de semana — es el comienzo de una semana de ofrenda.\n\nHoy, elige una tarea de tu trabajo y hazla conscientemente como ofrenda a Dios. Sin prisa, sin mediocridad, con la misma atención que pondrías si Dios mismo fuera tu cliente.", preguntas: ["¿Cómo cambiaría tu actitud en el trabajo si lo vieras como oración?", "¿En qué momentos de tu jornada laboral sientes mayor presencia de Dios?", "¿Hay algún aspecto de tu trabajo que te cuesta ofrecer a Dios — y por qué?"] },
        { santo: "San Juan XXIII", cita: "«Ver todo, omitir mucho, corregir algo.»", reflexion: "La doctrina social de la Iglesia no es un conjunto de normas políticas — es el desarrollo de una convicción teológica fundamental: cada persona humana tiene una dignidad inalienable porque lleva en sí la imagen de Dios.\n\nSan Juan XXIII proclamó que la dignidad de la persona no depende de su utilidad económica, su origen étnico, su salud o su fe. Depende únicamente de que es humana — y eso es suficiente.\n\nEsta convicción tiene consecuencias prácticas enormes. Implica que el inmigrante en la frontera tiene la misma dignidad que el ejecutivo. Que el anciano con demencia tiene la misma dignidad que el atleta en su mejor momento.\n\nHoy, ¿cómo tratas a las personas que el mundo considera 'menos'? ¿Dónde necesitas crecer en el reconocimiento de la dignidad del otro?", preguntas: ["¿A quién le niegas —aunque sea inconscientemente— la dignidad que merece?", "¿Cómo influye tu fe en tu posición ante las injusticias sociales?", "¿Qué cambio concreto puedes hacer en tu vida para honrar mejor la dignidad de los demás?"] },
        { santo: "Santa Madre Teresa de Calcuta", cita: "«No hacemos grandes cosas, solo pequeñas cosas con grande amor.»", reflexion: "La Madre Teresa recogía a los moribundos de las calles de Calcuta no porque tuviera un plan para resolver la pobreza global. Lo hacía porque frente a ella había un ser humano que merecía morir con dignidad. Un gesto a la vez. Una persona a la vez.\n\nEl servicio cristiano no espera las condiciones perfectas. Empieza con el gesto concreto que tienes delante ahora mismo: escuchar al compañero que está pasando un momento difícil, llamar al familiar que lleva semanas sin noticias.\n\nEsta semana de misión culmina hoy con una invitación práctica: haz un gesto concreto de amor. No mañana. No cuando tengas más tiempo. Hoy.\n\nLa Madre Teresa decía que Calcuta está en todas partes. La pregunta no es '¿dónde voy a servir?' sino '¿a quién tengo delante ahora mismo?'", preguntas: ["¿A quién tienes 'delante' hoy — quién necesita un gesto concreto de amor?", "¿Qué te impide servir más — el tiempo, el miedo, la incomodidad, la indiferencia?", "¿Cuál es el gesto concreto de amor que harás hoy, antes de que termine el día?"] },
        { santo: "San Ignacio de Loyola", cita: "«El amor se debe poner más en las obras que en las palabras.»", reflexion: "Treinta días. Cuatro semanas. Un camino que comenzó con la pregunta '¿quién es Dios para mí?' y llega hoy a su primer gran examen de conciencia mensual.\n\nMirar un mes de vida espiritual no es fácil. Hay días en que fuiste fiel y días en que dejaste pasar la gracia. Hay momentos de consolación que no esperabas y momentos de desolación que no supiste leer.\n\nSan Ignacio enseñaba que el Examen mensual busca ver el movimiento de fondo: no qué pasó cada día, sino hacia dónde te está llevando este camino en conjunto. ¿Estás más libre? ¿Más capaz de amar? ¿Más disponible para Dios?\n\nHoy, no hagas un inventario de fallas. Haz una lectura de movimiento: ¿hacia dónde vas? Eso es lo que importa.", preguntas: ["¿Cuál es el movimiento de fondo de tu vida espiritual en este último mes?", "¿Qué gracia recibiste este mes que no esperabas?", "¿Qué quieres que sea diferente en el próximo mes — qué cambio específico te propones?"] },
        { santo: "San Francisco de Asís", cita: "«Comienza haciendo lo que es necesario, después lo que es posible, y de repente te encontrarás haciendo lo imposible.»", reflexion: "La Misa de cierre de este mes no es el final — es un umbral. Todo lo que has vivido, rezado, contemplado y ofrecido en estas cuatro semanas desemboca aquí, en este altar, en este pan y este vino.\n\nLa acción de gracias es el gesto más honesto que un ser humano puede hacer ante Dios. No porque todo haya salido bien — sino porque en todo, lo bueno y lo difícil, la mano de Dios estuvo presente.\n\nSan Francisco, al final de su vida, cuando estaba ciego y sufriendo, compuso el Cántico de las Creaturas — un himno de gratitud total. No porque no sufriera, sino porque había aprendido a ver la bondad de Dios incluso en el sufrimiento.\n\nHoy, entra a esta Misa con la gratitud de alguien que ha recorrido un camino. Y sal de ella listo para el próximo tramo — que será nuevo, diferente y lleno de gracia también.", preguntas: ["¿Por qué tres cosas concretas de este mes quieres darle gracias a Dios hoy?", "¿Qué llevas de este mes al siguiente — qué fruto quieres conservar?", "¿Cómo quieres comenzar el próximo ciclo de treinta días?"] },
      ],
    ];

    const weekContent = allContent[weekIdx] || allContent[0];
    return weekContent[dayIdx] || weekContent[0];
  }

  async function fetchDayContent(day, weekTitle, weekIdx, dayIdx) {
    const cacheKey = `${weekIdx}-${dayIdx}`;
    if (contentCache.current[cacheKey]) { setDayContent(contentCache.current[cacheKey]); return; }
    setLoadingContent(true);
    const staticContent = getStaticDayContent(weekIdx, dayIdx);
    contentCache.current[cacheKey] = staticContent;
    setDayContent(staticContent);
    setLoadingContent(false);
  }

  const weeks = [
    { title: "Semana 1 · Encuentro", theme: "Redescubrir a Dios", color: C.navy, bg: "#DDE8F4", days: [
      { day: "Lun", title: "¿Quién es Dios para mí hoy?", type: "Reflexión" },
      { day: "Mar", title: "Salmo 139 — Dios me conoce por dentro", type: "Lectio" },
      { day: "Mié", title: "La oración como conversación, no monólogo", type: "Práctica" },
      { day: "Jue", title: "San Agustín: 'Nos hiciste para Ti'", type: "Lectura" },
      { day: "Vie", title: "10 minutos de silencio contemplativo", type: "Silencio" },
      { day: "Sáb", title: "Examen ignaciano: ¿dónde vi a Dios esta semana?", type: "Examen" },
      { day: "Dom", title: "Misa dominical con atención plena", type: "Misa" },
    ]},
    { title: "Semana 2 · Interioridad", theme: "La vida interior", color: C.blue, bg: "#E0EBF5", days: [
      { day: "Lun", title: "Lectio Divina: Juan 4 — La samaritana", type: "Lectio" },
      { day: "Mar", title: "Santa Teresa de Ávila: el castillo interior", type: "Lectura" },
      { day: "Mié", title: "El Padre Nuestro palabra por palabra", type: "Reflexión" },
      { day: "Jue", title: "Discernimiento: mociones espirituales", type: "Práctica" },
      { day: "Vie", title: "Oración con el cuerpo: posturas y respiración", type: "Práctica" },
      { day: "Sáb", title: "Examen ignaciano semanal", type: "Examen" },
      { day: "Dom", title: "Misa dominical con atención plena", type: "Misa" },
    ]},
    { title: "Semana 3 · Schoenstatt", theme: "Alianza de amor con María", color: C.gold, bg: "#F5EDD8", days: [
      { day: "Lun", title: "El Padre Kentenich y el origen de Schoenstatt", type: "Lectura" },
      { day: "Mar", title: "La alianza de amor con María", type: "Reflexión" },
      { day: "Mié", title: "El santuario como hogar espiritual", type: "Práctica" },
      { day: "Jue", title: "La contribución: ofrenda de amor", type: "Práctica" },
      { day: "Vie", title: "Instrumento en manos de María", type: "Reflexión" },
      { day: "Sáb", title: "Examen ignaciano semanal", type: "Examen" },
      { day: "Dom", title: "Misa y consagración a María", type: "Misa" },
    ]},
    { title: "Semana 4 · Misión", theme: "Fe en el mundo", color: C.sky, bg: "#DFF0F8", days: [
      { day: "Lun", title: "Vocación: ¿a qué me llama Dios?", type: "Reflexión" },
      { day: "Mar", title: "San Francisco: la fraternidad universal", type: "Lectura" },
      { day: "Mié", title: "Fe y trabajo: orar con las manos", type: "Práctica" },
      { day: "Jue", title: "Doctrina social: dignidad de la persona", type: "Lectura" },
      { day: "Vie", title: "Servicio: un gesto concreto de amor hoy", type: "Práctica" },
      { day: "Sáb", title: "Examen ignaciano del mes", type: "Examen" },
      { day: "Dom", title: "Misa de cierre — acción de gracias", type: "Misa" },
    ]},
  ];

  useEffect(() => {
    async function loadProgress() {
      const { data } = await supabase.from("plan_progress").select("*").eq("user_id", user.id);
      if (data) {
        const map = {};
        data.forEach(r => { map[`${r.week}-${r.day_index}`] = r.completed; });
        setProgress(map);
      }
    }
    loadProgress();
  }, [user]);

  async function toggleDay(weekIdx, dayIdx) {
    const key = `${weekIdx}-${dayIdx}`;
    const current = progress[key] || false;
    setSaving(key);
    const { error } = await supabase.from("plan_progress").upsert(
      { user_id: user.id, week: weekIdx, day_index: dayIdx, completed: !current, completed_at: !current ? new Date().toISOString() : null },
      { onConflict: "user_id,week,day_index" }
    );
    if (!error) setProgress(prev => ({ ...prev, [key]: !current }));
    setSaving(null);
  }

  const typeColor = { Lectura: C.blue, Práctica: C.sky, Reflexión: C.periwinkle, Examen: C.gold, Misa: C.navy, Lectio: C.teal, Silencio: C.slate };
  const w = weeks[activeWeek];
  const doneCount = w.days.filter((_, i) => progress[`${activeWeek}-${i}`]).length;
  const pct = Math.round((doneCount / w.days.length) * 100);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.plan, paddingBottom: 90 }}>
      {openDay !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: "flex-end" }} onClick={() => { setOpenDay(null); setDayContent(null); }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>{weeks[activeWeek].days[openDay]?.title}</p>
                <span style={pill(`${(typeColor[weeks[activeWeek].days[openDay]?.type] || C.blue)}20`, typeColor[weeks[activeWeek].days[openDay]?.type] || C.blue)}>{weeks[activeWeek].days[openDay]?.type}</span>
              </div>
              <button onClick={() => { setOpenDay(null); setDayContent(null); }} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            {loadingContent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: C.slateLight, fontSize: 14 }}>✨ Mater está preparando tu reflexión...</p>
              </div>
            ) : dayContent ? (
              <>
                <div style={{ background: C.iceBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 20, borderLeft: `3px solid ${C.blue}` }}>
                  <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, margin: "0 0 6px", lineHeight: 1.6 }}>{dayContent.cita}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, margin: 0 }}>{dayContent.santo}</p>
                </div>
                <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 24px", whiteSpace: "pre-line" }}>{dayContent.reflexion}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>Preguntas para orar</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {dayContent.preguntas?.map((q, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${C.blue}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.blue, fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                      <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, margin: 0 }}>{q}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => shareContent(dayContent?.cita + "\n\n" + dayContent?.santo + "\n\nCompartido desde Mater 🙏", "Reflexión de Mater")}
                    style={{ padding: "14px", background: C.iceBlue, border: "none", borderRadius: 14, color: C.navy, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    📤
                  </button>
                  <button
                    onClick={() => { toggleDay(activeWeek, openDay); setOpenDay(null); setDayContent(null); }}
                    style={{ flex: 1, padding: "14px", background: progress[`${activeWeek}-${openDay}`] ? C.mist : `linear-gradient(135deg, ${C.navy}, ${C.blue})`, border: "none", borderRadius: 14, color: progress[`${activeWeek}-${openDay}`] ? C.inkMid : "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                    {progress[`${activeWeek}-${openDay}`] ? "✓ Completado" : "Amén ✓ — Marcar como hecho"}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 20px" }}>
        <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Plan de formación</p>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>30 días hacia Dios</h2>
      </div>

      <div style={{ padding: "0 22px 20px" }}>
        <button onClick={fetchGospelOfDay} style={{ width: "100%", borderRadius: 16, border: `1.5px solid ${C.mist}`, background: gospelOfDay ? C.white : C.iceBlue, padding: "16px 18px", cursor: "pointer", textAlign: "left" }}>
          {loadingGospel ? (
            <p style={{ color: C.slateLight, fontSize: 13, margin: 0 }}>✨ Buscando el evangelio de hoy...</p>
          ) : gospelOfDay ? (
            <>
              <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, margin: "0 0 6px", fontWeight: 700 }}>📖 Evangelio del día · {gospelOfDay.tiempo}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: "0 0 12px" }}>{gospelOfDay.referencia}</p>
              <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.85, margin: 0, whiteSpace: "pre-line", fontStyle: "italic", borderLeft: `3px solid ${C.gold}`, paddingLeft: 14 }}>{gospelOfDay.textoCompleto}</p>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>📖</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.navy, margin: 0 }}>Evangelio del día</p>
                <p style={{ fontSize: 11, color: C.slateLight, margin: 0 }}>Toca para ver el evangelio de hoy</p>
              </div>
            </div>
          )}
        </button>
      </div>

      <div style={{ padding: "0 22px 20px", display: "flex", gap: 10 }}>
        {weeks.map((wk, i) => (
          <button key={i} onClick={() => setActiveWeek(i)} style={{ flex: 1, borderRadius: 14, padding: "12px 8px", border: "none", background: activeWeek === i ? wk.color : C.white, color: activeWeek === i ? "#fff" : C.inkMid, fontWeight: 700, fontSize: 11, cursor: "pointer", boxShadow: activeWeek === i ? `0 4px 16px ${wk.color}55` : "0 2px 8px rgba(30,58,95,0.07)", transition: "all 0.2s", lineHeight: 1.4 }}>{`Sem.\n${i + 1}`}</button>
        ))}
      </div>

      <div style={{ padding: "0 22px 20px" }}>
        <div style={{ borderRadius: 20, background: `linear-gradient(135deg, ${w.color} 0%, ${w.color}CC 100%)`, padding: "18px 20px", color: "#fff" }}>
          <p style={{ fontSize: 11, opacity: 0.8, margin: "0 0 4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{w.theme}</p>
          <p style={{ fontSize: 17, fontWeight: 800, margin: "0 0 14px" }}>{w.title}</p>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 100, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "#fff", borderRadius: 100, transition: "width 0.4s" }} />
          </div>
          <p style={{ fontSize: 11, opacity: 0.85, margin: "8px 0 0" }}>{doneCount} de {w.days.length} completados · {pct}%</p>
        </div>
      </div>

      <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        {w.days.map((d, i) => {
          const key = `${activeWeek}-${i}`;
          const done = progress[key] || false;
          const isSaving = saving === key;
          return (
            <button key={i} onClick={() => { setOpenDay(i); setDayContent(null); fetchDayContent(d, w.title, activeWeek, i); }} style={{ background: done ? w.bg : C.white, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, border: done ? `1.5px solid ${w.color}44` : `1.5px solid ${C.mist}`, boxShadow: "0 2px 10px rgba(30,58,95,0.05)", cursor: "pointer", textAlign: "left", width: "100%", opacity: isSaving ? 0.6 : 1, transition: "all 0.2s" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: done ? w.color : `${w.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: done ? "#fff" : w.color, fontWeight: 800, fontSize: 11 }}>
                {isSaving ? "..." : done ? "✓" : d.day}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>{d.title}</p>
                <span style={pill(`${typeColor[d.type]}20`, typeColor[d.type])}>{d.type}</span>
              </div>
              <Icon name="chevron" size={16} color={w.color} />
            </button>
          );
        })}
      </div>
    </div>
  );
}




function DiaryScreen({ user }) {
  const [entries, setEntries] = useState([]);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState({ mood: "", title: "", text: "", tag: "Consolación" });
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const moods = ["😊", "🙏", "😔", "😌", "🥹", "😤", "🤔", "❤️"];
  const tags = ["Consolación", "Discernimiento", "Acción de gracias", "Desolación"];
  const tagColor = { "Consolación": C.sky, "Discernimiento": C.blue, "Acción de gracias": C.gold, "Desolación": C.periwinkle };

  useEffect(() => {
    async function loadEntries() {
      const { data } = await supabase.from("diary_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setEntries(data);
      setLoadingEntries(false);
    }
    loadEntries();
  }, [user]);

  async function saveEntry(formData) {
    const entryData = formData || draft;
    if (!entryData.title || !entryData.text) return;
    setSaving(true);
    const { data, error } = await supabase.from("diary_entries").insert({ user_id: user.id, title: entryData.title, text: entryData.text, mood: entryData.mood, tag: entryData.tag }).select().single();
    if (!error && data) {
      setEntries(prev => [data, ...prev]);
      setDraft({ mood: "", title: "", text: "", tag: "Consolación" });
      setWriting(false);
    }
    setSaving(false);
  }

  async function saveEdit(formData) {
    const entryData = formData || editDraft;
    if (!entryData.title || !entryData.text) return;
    setSavingEdit(true);
    const { error } = await supabase.from("diary_entries").update({ title: entryData.title, text: entryData.text, mood: entryData.mood, tag: entryData.tag }).eq("id", editingEntry.id).eq("user_id", user.id);
    if (!error) {
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...entryData } : e));
      setEditingEntry(null);
    }
    setSavingEdit(false);
  }

  async function deleteEntry(id) {
    setDeletingId(id);
    await supabase.from("diary_entries").delete().eq("id", id).eq("user_id", user.id);
    setEntries(prev => prev.filter(e => e.id !== id));
    setDeletingId(null);
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }

  function EntryForm({ data, onChange, onSave, onCancel, saving: isSaving, title }) {
    const titleRef = useRef(null);
    const textRef = useRef(null);

    function handleSave() {
      const titleVal = titleRef.current ? titleRef.current.value : data.title;
      const textVal = textRef.current ? textRef.current.value : data.text;
      onSave({ ...data, title: titleVal, text: textVal });
    }

    return (
      <div style={{ background: C.white, borderRadius: 20, padding: 18, marginBottom: 16, boxShadow: "0 6px 24px rgba(30,58,95,0.12)" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {moods.map(m => (
            <button key={m} onClick={() => onChange({ ...data, mood: m })} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: data.mood === m ? C.blue + "20" : C.mist + "55", fontSize: 18, cursor: "pointer", outline: data.mood === m ? "2px solid " + C.blue : "none" }}>{m}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {tags.map(t => (
            <button key={t} onClick={() => onChange({ ...data, tag: t })} style={{ padding: "4px 10px", borderRadius: 100, border: "none", background: data.tag === t ? tagColor[t] + "30" : C.iceBlue, color: data.tag === t ? tagColor[t] : C.slateLight, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{t}</button>
          ))}
        </div>
        <input
          ref={titleRef}
          defaultValue={data.title}
          placeholder="Título..."
          style={{ width: "100%", border: "none", outline: "none", borderBottom: "1.5px solid " + C.mist, padding: "8px 0", fontSize: 15, fontWeight: 700, color: C.ink, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif", marginBottom: 10, boxSizing: "border-box" }}
        />
        <textarea
          ref={textRef}
          defaultValue={data.text}
          placeholder="¿Qué movimientos espirituales notaste hoy?"
          rows={4}
          style={{ width: "100%", border: "none", outline: "none", padding: "0", fontSize: 13.5, color: C.inkMid, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.65, resize: "none", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, gap: 10 }}>
          <button onClick={onCancel} style={{ background: "transparent", border: "1px solid " + C.mist, borderRadius: 10, padding: "8px 16px", fontSize: 12, color: C.slateLight, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Cancelar</button>
          <button onClick={handleSave} disabled={isSaving} style={{ background: "linear-gradient(135deg, " + C.navy + ", " + C.blue + ")", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", opacity: isSaving ? 0.5 : 1 }}>
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: gradients.diary }}>
      {editingEntry && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: "flex-end" }} onClick={() => setEditingEntry(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "80vh", overflowY: "auto" }}>
            <EntryForm data={editDraft} onChange={setEditDraft} onSave={saveEdit} onCancel={() => setEditingEntry(null)} saving={savingEdit} title="Editar entrada" />
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Mi diario</p>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>Diario espiritual</h2>
        </div>
        <button onClick={() => setWriting(!writing)} style={{ width: 42, height: 42, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="plus" size={20} color="#fff" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 22px", paddingBottom: 90 }}>
        {writing && (
          <EntryForm data={draft} onChange={setDraft} onSave={saveEntry} onCancel={() => setWriting(false)} saving={saving} title="Nueva entrada" />
        )}
        {loadingEntries ? (
          <p style={{ textAlign: "center", color: C.slateLight, fontSize: 13, marginTop: 32 }}>Cargando entradas...</p>
        ) : entries.length === 0 && !writing ? (
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📓</p>
            <p style={{ fontSize: 14, color: C.slateLight }}>Aún no tienes entradas.</p>
            <p style={{ fontSize: 12, color: C.slateLight }}>Toca + para escribir tu primera reflexión.</p>
          </div>
        ) : (
          entries.map((e, i) => (
            <div key={e.id || i} style={{ background: C.cream, borderRadius: 12, padding: "16px 18px", marginBottom: 10, border: "1px solid " + C.mist, borderLeft: `3px solid ${tagColor[e.tag] || C.sky}`, opacity: deletingId === e.id ? 0.5 : 1, transition: "opacity 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{e.mood}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: C.ink, margin: 0 }}>{e.title}</p>
                    <p style={{ fontSize: 10, color: C.slateLight, margin: 0 }}>{formatDate(e.created_at)}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={pill(`${(tagColor[e.tag] || C.sky)}22`, tagColor[e.tag] || C.sky)}>{e.tag}</span>
                  <button onClick={() => { setEditingEntry(e); setEditDraft({ mood: e.mood, title: e.title, text: e.text, tag: e.tag }); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                    <Icon name="edit" size={14} color={C.inkLight} />
                  </button>
                  <button onClick={() => deleteEntry(e.id)} disabled={deletingId === e.id} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                    <Icon name="trash" size={14} color={C.inkLight} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: C.inkMid, lineHeight: 1.65, margin: 0 }}>{e.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ProfileScreen({ user, profile, setProfile, onLogout, darkMode, toggleDarkMode }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const [notifTimes, setNotifTimes] = useState(() => {
    const saved = localStorage.getItem("mater_notif_times");
    return saved ? JSON.parse(saved) : ["07:00", "12:00", "21:00"];
  });
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem("mater_notif_enabled") === "true");
  const [notifStatus, setNotifStatus] = useState("");

  async function toggleNotifications() {
    if (!notifEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotifEnabled(true);
        localStorage.setItem("mater_notif_enabled", "true");
        scheduleNotifications(notifTimes);
        setNotifStatus("✓ Notificaciones activadas");
        setTimeout(() => setNotifStatus(""), 3000);
      } else {
        setNotifStatus("Permiso denegado. Actívalo en la configuración del navegador.");
        setTimeout(() => setNotifStatus(""), 4000);
      }
    } else {
      setNotifEnabled(false);
      localStorage.setItem("mater_notif_enabled", "false");
      if (window._materNotifTimers) window._materNotifTimers.forEach(t => clearTimeout(t));
    }
  }

  function updateNotifTime(index, value) {
    const newTimes = [...notifTimes];
    newTimes[index] = value;
    setNotifTimes(newTimes);
    localStorage.setItem("mater_notif_times", JSON.stringify(newTimes));
    if (notifEnabled) scheduleNotifications(newTimes);
  }

  async function uploadAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl + "?t=" + Date.now();
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: url });
      setAvatarUrl(url);
      setProfile(prev => ({ ...prev, avatar_url: url }));
    } catch { alert("Error al subir la imagen."); }
    setUploadingAvatar(false);
  }

  async function saveName() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("profiles").upsert({ id: user.id, name: name.trim() });
    setProfile(prev => ({ ...prev, name: name.trim() }));
    setSaving(false); setSaved(true); setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.profile, paddingBottom: 90 }}>
      {activeModal === "about" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: "flex-end" }} onClick={() => setActiveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>🌿 Acerca de Mater</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, overflow: "hidden", margin: "0 auto 12px" }}>
                <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>Mater</h3>
              <p style={{ fontSize: 12, color: C.slateLight, margin: 0 }}>Versión 1.0 · materapp.org</p>
            </div>
            <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.75, marginBottom: 20, textAlign: "center" }}>
              Mater es una plataforma de coaching espiritual católico para jóvenes adultos de 25-35 años. Integra espiritualidad ignaciana, mariana, franciscana, carmelita y schoenstattiana.
            </p>
            <p style={{ textAlign: "center", fontSize: 11, color: C.slateLight, marginTop: 20 }}>Hecho con ❤️ para la Iglesia joven</p>
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 0", textAlign: "center" }}>
        <div style={{ position: "relative", width: 90, margin: "0 auto 16px" }}>
          <div style={{ width: 90, height: 90, borderRadius: 24, overflow: "hidden", border: `2px solid ${C.mist}` }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: C.cream, fontWeight: 700, fontSize: 32 }}>
                  {(profile?.name || user?.email || "M")[0]?.toUpperCase()}
                </div>
            }
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} style={{ position: "absolute", bottom: -4, right: -4, width: 28, height: 28, borderRadius: 8, background: C.navy, border: `2px solid ${C.cream}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {uploadingAvatar
              ? <div style={{ width: 10, height: 10, border: `2px solid ${C.cream}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <Icon name="edit" size={12} color={C.cream} />
            }
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} style={{ display: "none" }} />
        </div>

        {editing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
            <input value={name} onChange={e => setName(e.target.value)} style={{ border: "none", outline: "none", borderBottom: `2px solid ${C.blue}`, fontSize: 20, fontWeight: 800, color: C.ink, background: "transparent", textAlign: "center", fontFamily: "'DM Sans', system-ui, sans-serif", width: 200 }} autoFocus onKeyDown={e => e.key === "Enter" && saveName()} />
            <button onClick={saveName} disabled={saving} style={{ background: C.blue, border: "none", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{saving ? "..." : "Guardar"}</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>{profile?.name || user?.email?.split("@")[0]}</h1>
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Icon name="edit" size={16} color={C.inkLight} />
            </button>
          </div>
        )}
        {saved && <p style={{ color: C.blue, fontSize: 12, margin: "4px 0 0" }}>✓ Nombre actualizado</p>}
        <p style={{ fontSize: 13, color: C.slateLight, margin: "4px 0 0" }}>{user?.email}</p>
      </div>

      <div style={{ padding: "24px 22px 0" }}>
        <div style={{ background: C.cream, borderRadius: 16, overflow: "hidden", border: "1px solid " + C.mist }}>
          {[
            { label: "Editar nombre", icon: "edit", action: () => setEditing(true) },
            { label: "Acerca de Mater", icon: "heart", action: () => setActiveModal("about") },
          ].map((item, i, arr) => (
            <button key={i} onClick={item.action} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "none", background: "transparent", borderBottom: "1px solid " + C.mist, cursor: "pointer", textAlign: "left" }}>
              <Icon name={item.icon} size={15} color={C.inkLight} />
              <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{item.label}</span>
              <Icon name="chevron" size={14} color={C.mist} />
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid " + C.mist }}>
            <Icon name="moon" size={15} color={C.inkLight} />
            <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>Modo oscuro</span>
            <button onClick={toggleDarkMode} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: darkMode ? C.navy : C.mist, cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: darkMode ? 21 : 3, transition: "left 0.3s" }} />
            </button>
          </div>
          <button onClick={() => setActiveModal("notifications")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}>
            <Icon name="bell" size={15} color={C.inkLight} />
            <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>Recordatorios diarios</span>
            <Icon name="chevron" size={14} color={C.mist} />
          </button>
        </div>
      </div>

      {/* Notifications modal */}
      {activeModal === "notifications" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: "flex-end" }} onClick={() => setActiveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>🔔 Recordatorios diarios</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.iceBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>Activar notificaciones</p>
                <p style={{ fontSize: 11, color: C.slateLight, margin: "2px 0 0" }}>Recibe avisos para tus 3 prácticas</p>
              </div>
              <button onClick={toggleNotifications} style={{ width: 48, height: 28, borderRadius: 14, border: "none", background: notifEnabled ? C.navy : C.mist, cursor: "pointer", position: "relative", flexShrink: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: notifEnabled ? 23 : 3, transition: "left 0.3s" }} />
              </button>
            </div>

            {notifStatus && <p style={{ fontSize: 12, color: notifStatus.includes("✓") ? C.blue : "#C0392B", textAlign: "center", marginBottom: 16 }}>{notifStatus}</p>}

            <p style={{ fontSize: 11, fontWeight: 700, color: C.slateLight, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>Elige tus horarios</p>

            {PRACTICE_NAMES.map((name, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid " + C.mist : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name={i === 0 ? "moon" : i === 1 ? "book" : "heart"} size={16} color={C.blue} />
                  <span style={{ fontSize: 13, color: C.ink }}>{name}</span>
                </div>
                <input
                  type="time"
                  value={notifTimes[i]}
                  onChange={e => updateNotifTime(i, e.target.value)}
                  style={{ border: "1px solid " + C.mist, borderRadius: 8, padding: "6px 10px", fontSize: 13, color: C.ink, background: C.fog, fontFamily: "'DM Sans', system-ui, sans-serif" }}
                />
              </div>
            ))}

            <p style={{ fontSize: 11, color: C.slateLight, marginTop: 20, lineHeight: 1.6, textAlign: "center" }}>
              En iPhone, instala Mater en tu pantalla de inicio (Compartir → Añadir a inicio) para recibir notificaciones.
            </p>
          </div>
        </div>
      )}

      <div style={{ padding: "16px 22px 0" }}>
        <button onClick={() => {
          if (navigator.share) {
            navigator.share({ title: "Mater — Coaching espiritual", text: "Te invito a Mater, una app de coaching espiritual católico.", url: "https://materapp.org" });
          } else {
            navigator.clipboard.writeText("https://materapp.org");
            alert("¡Enlace copiado!");
          }
        }} style={{ width: "100%", padding: "14px", border: "1px solid " + C.mist, borderRadius: 12, background: C.cream, color: C.navy, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Compartir Mater 🔗
        </button>
      </div>

      <div style={{ padding: "12px 22px 0" }}>
        <button onClick={onLogout} style={{ width: "100%", padding: "14px", border: "1px solid #E8A0A0", borderRadius: 12, background: "transparent", color: "#C0392B", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="logout" size={15} color="#C0392B" />
          Cerrar sesión
        </button>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: C.slateLight, margin: "20px 0 0" }}>Mater v1.0 · materapp.org</p>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("auth");
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mater_dark_mode") === "true");

  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("mater_dark_mode", String(next));
      return next;
    });
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        setScreen("app");
      } else {
        // Siempre ir directo al login si no hay sesión activa
        setScreen("auth");
      }
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        setScreen("app");
      } else {
        setUser(null);
        setProfile(null);
        setScreen("auth");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Reprogramar notificaciones si ya estaban activadas
  useEffect(() => {
    if (localStorage.getItem("mater_notif_enabled") === "true" && Notification.permission === "granted") {
      const times = JSON.parse(localStorage.getItem("mater_notif_times") || '["07:00","12:00","21:00"]');
      scheduleNotifications(times);
    }
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  }

  async function handleOnboardingComplete(name) {
    // Marcar que el onboarding ya fue completado
    localStorage.setItem("mater_onboarding_done", "true");
    if (user) {
      await supabase.from("profiles").upsert({ id: user.id, name });
      setProfile(prev => ({ ...prev, name }));
    }
    setScreen("auth");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setScreen("landing");
    setActiveTab("home");
  }

  if (loadingAuth) {
    return (
      <div style={{ minHeight: "100vh", background: C.iceBlue, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, overflow: "hidden", margin: "0 auto 16px" }}>
            <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ width: 24, height: 24, border: "3px solid " + C.navy + ",", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  const phone = {
    width: "100%", maxWidth: 390, minHeight: "100vh",
    margin: "0 auto",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    position: "relative",
    display: "flex", flexDirection: "column",
    background: C.iceBlue,
    filter: darkMode ? "invert(1) hue-rotate(180deg)" : "none",
  };

  const imgFix = darkMode ? `
    .phone-dark img, .phone-dark video { filter: invert(1) hue-rotate(180deg); }
  ` : "";

  return (
    <>
      <style>{globalStyles}</style>
      <style>{imgFix}</style>
      <div style={phone} className={darkMode ? "phone-dark" : ""}>
        {screen === "landing" && <LandingScreen onEnter={() => setScreen("onboarding")} />}
        {screen === "onboarding" && <OnboardingScreen onComplete={handleOnboardingComplete} />}
        {screen === "auth" && <AuthScreen onAuth={() => setScreen("app")} />}
        {screen === "app" && user && (
          <>
            {activeTab === "home" && <HomeScreen user={user} profile={profile} onTabChange={setActiveTab} darkMode={darkMode} />}
            {activeTab === "chat" && <ChatScreen user={user} darkMode={darkMode} />}
            {activeTab === "plan" && <PlanScreen user={user} darkMode={darkMode} />}
            {activeTab === "diary" && <DiaryScreen user={user} darkMode={darkMode} />}
            {activeTab === "profile" && <ProfileScreen user={user} profile={profile} setProfile={setProfile} onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
            <NavBar active={activeTab} onChange={setActiveTab} darkMode={darkMode} />
          </>
        )}
      </div>
    </>
  );
}
