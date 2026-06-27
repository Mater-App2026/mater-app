{ title: "Semana 4 · Misión", theme: "Fe en el mundo", color: C.sky, bg: "#DFF0F8",
      days: [
        { day: "Lun", title: "Vocación: ¿a qué me llama Dios?", type: "Reflexión" },
        { day: "Mar", title: "San Francisco: la fraternidad universal", type: "Lectura" },
        { day: "Mié", title: "Fe y trabajo: orar con las manos", type: "Práctica" },
        { day: "Jue", title: "Doctrina social: dignidad de la persona", type: "Lectura" },
        { day: "Vie", title: "Servicio: un gesto concreto de amor hoy", type: "Práctica" },
        { day: "Sáb", title: "Examen ignaciano del mes", type: "Examen" },
        { day: "Dom", title: "Misa de cierre — acción de gracias", type: "Misa" },
      ],
    },
  ];function LandingScreen({onEnter}){return(<div style={{flex:1,background:"#EEF2F7",display:"flex",flexDirection:"column",padding:"0 0 40px"}}><div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 32px",textAlign:"center"}}><div style={{width:80,height:80,borderRadius:4,overflow:"hidden",border:"1px solid #C8D5E8",marginBottom:24}}><img src="/logo.jpeg" alt="Mater" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div><h1 style={{fontFamily:"serif",fontSize:38,fontWeight:600,color:"#2C3E6B",margin:"0 0 6px"}}>Mater</h1><p style={{fontSize:11,color:"#7A8FA3",letterSpacing:"0.12em",textTransform:"uppercase",margin:"0 0 32px"}}>Guia de coaching espiritual</p><div style={{background:"#2C3E6B",borderRadius:4,padding:"18px 20px",marginBottom:32,borderLeft:"3px solid #A8864A",textAlign:"left",width:"100%"}}><p style={{fontFamily:"serif",fontSize:15,color:"#F7F4EE",fontStyle:"italic",lineHeight:1.7,margin:"0 0 8px"}}>«Venid a mi todos los que estais fatigados y cargados, y yo os hare descansar.»</p><p style={{fontSize:10,color:"#A8864A",margin:0}}>Mateo 11:28</p></div></div><div style={{padding:"0 32px"}}><button onClick={onEnter} style={{width:"100%",padding:"15px",border:"none",borderRadius:4,background:"#2C3E6B",color:"#F7F4EE",fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:10}}>Entrar a Mater</button></div></div>);}import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ── PALETA VINTAGE MINIMALISTA ── */
const C = {
  // Azules apagados vintage
  navy:       "#2C3E6B",   // azul marino oscuro
  blue:       "#3D5A8A",   // azul medio
  sky:        "#5E7FB3",   // azul cielo apagado
  periwinkle: "#8BA3C7",   // azul lavanda suave
  mist:       "#C8D5E8",   // azul niebla
  iceBlue:    "#EEF2F7",   // fondo principal
  fog:        "#F5F7FA",   // fondo secundario

  // Acento dorado vintage
  gold:       "#A8864A",   // dorado apagado
  goldLight:  "#D4B87A",   // dorado claro

  // Neutros cálidos
  ink:        "#1C2B3A",   // texto principal
  inkMid:     "#3D4F61",   // texto secundario
  inkLight:   "#7A8FA3",   // texto muted
  slate:      "#4A6080",
  slateLight: "#7A95B0",

  // Extras
  teal:       "#3A7A8C",
  white:      "#FAFCFF",
  cream:      "#F7F4EE",   // blanco cálido vintage
};

const gradients = {
  home:    "#EEF2F7",
  chat:    "#EBF0F7",
  plan:    "#EDF1F7",
  diary:   "#EAEff6",
  auth:    "#EEF2F7",
  profile: "#EEF2F7",
};

const phone = {
  width: "100%", maxWidth: 390, minHeight: "100vh",
  margin: "0 auto", fontFamily: "'DM Sans', system-ui, sans-serif",
  position: "relative", overflow: "hidden",
  display: "flex", flexDirection: "column",
  background: C.iceBlue,
};

const pill = (bg, color) => ({
  display: "inline-flex", alignItems: "center", gap: 4,
  background: bg, color, borderRadius: 4, padding: "2px 8px",
  fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
  textTransform: "uppercase",
});

const Icon = ({ name, size = 22, color = "currentColor" }) => {
  const icons = {
    home:    <path d="M3 12L12 3l9 9M5 10v10h4v-6h6v6h4V10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    chat:    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    plan:    <><path d="M9 11l3 3L22 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    diary:   <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    send:    <><line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><polygon points="22,2 15,22 11,13 2,9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    plus:    <><line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    chevron: <polyline points="9,18 15,12 9,6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    moon:    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    book:    <><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
    heart:   <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    edit:    <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    trash:   <><polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
    bell:    <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    lock:    <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="1.8" fill="none"/><path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/></>,
    user:    <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" fill="none"/></>,
    logout:  <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><polyline points="16,17 21,12 16,7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/><line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="1.8" fill="none"/><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" fill="none"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {icons[name]}
    </svg>
  );
};

/* ══════════════════════════════════════════
   AUTH SCREEN
══════════════════════════════════════════ */
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register
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
          await supabase.from("profiles").insert({ id: data.user.id, name });
          setSuccess("¡Cuenta creada! Revisa tu correo para confirmar.");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onAuth();
      }
    } catch (err) {
      setError(err.message === "Invalid login credentials"
        ? "Correo o contraseña incorrectos."
        : err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", border: "none", outline: "none",
    background: "transparent", borderRadius: 0,
    borderBottom: `1px solid ${C.mist}`,
    padding: "12px 4px", fontSize: 14,
    color: C.ink, fontFamily: "'DM Sans', system-ui, sans-serif",
    boxSizing: "border-box",
  };

  return (
    <div style={{ flex: 1, background: gradients.auth, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem 1.5rem" }}>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22, margin: "0 auto 1rem",
          overflow: "hidden",
          boxShadow: `0 8px 28px ${C.navy}44`,
        }}>
          <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: C.navy, margin: "0 0 4px", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.02em" }}>Mater</h1>
        <p style={{ fontSize: 12, color: C.inkLight, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>Guía de coaching espiritual</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${C.mist}`,
        marginBottom: "2rem",
      }}>
        {[["login", "Entrar"], ["register", "Crear cuenta"]].map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
            flex: 1, padding: "10px 4px", border: "none", borderRadius: 0,
            background: "transparent",
            color: mode === m ? C.navy : C.inkLight,
            fontWeight: mode === m ? 600 : 400, fontSize: 13,
            cursor: "pointer",
            borderBottom: mode === m ? `2px solid ${C.navy}` : "2px solid transparent",
            marginBottom: -1,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            letterSpacing: "0.02em",
          }}>{l}</button>
        ))}
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "register" && (
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Tu nombre" style={inputStyle} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Correo electrónico" type="email" style={inputStyle} />
        <div style={{ position: "relative" }}>
          <input value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña" type={showPass ? "text" : "password"}
            style={{ ...inputStyle, paddingRight: 44 }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <button onClick={() => setShowPass(s => !s)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: C.slateLight,
          }}>
            <Icon name="eye" size={18} color={C.slateLight} />
          </button>
        </div>

        {error && <p style={{ color: "#C0392B", fontSize: 12, margin: 0, textAlign: "center" }}>{error}</p>}
        {success && <p style={{ color: C.blue, fontSize: 12, margin: 0, textAlign: "center" }}>{success}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{
          background: C.navy,
          border: "none", borderRadius: 4, padding: "14px",
          color: C.cream, fontWeight: 600, fontSize: 14,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
          fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: 8,
          letterSpacing: "0.04em",
        }}>
          {loading ? "..." : mode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: C.slateLight, marginTop: "2rem", lineHeight: 1.6 }}>
        Al usar Mater aceptas acompañar tu fe con honestidad y apertura. 🕊️
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════
   HOME SCREEN
══════════════════════════════════════════ */
function HomeScreen({ user, profile, onTabChange }) {
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [openCard, setOpenCard] = useState(null);
  const [completedPractices, setCompletedPractices] = useState({});
  const [streakDays, setStreakDays] = useState([false,false,false,false,false,false,false]);
  const [streakCount, setStreakCount] = useState(0);
  const [dailyVerse, setDailyVerse] = useState(null);

  const now = new Date();
  const todayKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  // Versículos rotativos según el día del año
  const verses = [
    { text: "«Venid a mí todos los que estáis fatigados y cargados, y yo os haré descansar.»", ref: "Mateo 11:28" },
    { text: "«El Señor es mi pastor; nada me falta.»", ref: "Salmo 23:1" },
    { text: "«Todo lo puedo en Cristo que me fortalece.»", ref: "Filipenses 4:13" },
    { text: "«El amor es paciente, es servicial; el amor no es envidioso.»", ref: "1 Corintios 13:4" },
    { text: "«Busca primero el Reino de Dios y su justicia, y todo lo demás se te dará por añadidura.»", ref: "Mateo 6:33" },
    { text: "«Confía en el Señor con todo tu corazón y no te apoyes en tu propio entendimiento.»", ref: "Proverbios 3:5" },
    { text: "«No temas, porque yo estoy contigo; no te angusties, porque yo soy tu Dios.»", ref: "Isaías 41:10" },
    { text: "«Yo soy el camino, la verdad y la vida.»", ref: "Juan 14:6" },
    { text: "«Ámense los unos a los otros como yo los he amado.»", ref: "Juan 15:12" },
    { text: "«La paz os dejo, mi paz os doy.»", ref: "Juan 14:27" },
    { text: "«Pidan y se les dará; busquen y encontrarán; llamen y se les abrirá.»", ref: "Mateo 7:7" },
    { text: "«El que permanece en mí y yo en él, ese da mucho fruto.»", ref: "Juan 15:5" },
    { text: "«Sean fuertes y valientes. No teman ni se asusten, porque el Señor su Dios va con ustedes.»", ref: "Deuteronomio 31:6" },
    { text: "«¿Quién nos separará del amor de Cristo?»", ref: "Romanos 8:35" },
  ];

  useEffect(() => {
    // Versículo del día basado en el día del año
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDailyVerse(verses[dayOfYear % verses.length]);

    // Cargar racha real desde Supabase
    async function loadStreak() {
      const { data } = await supabase.from("streaks").select("date").eq("user_id", user.id).order("date", { ascending: false }).limit(60);
      if (!data || data.length === 0) return;
      const dateSet = new Set(data.map(r => r.date));

      // Usar fecha local correcta
      function localDate(offset = 0) {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return d.getFullYear() + "-" +
          String(d.getMonth() + 1).padStart(2, "0") + "-" +
          String(d.getDate()).padStart(2, "0");
      }

      // Marcar semana actual
      const weekStreak = days.map((_, i) => {
        return dateSet.has(localDate(i - todayIdx));
      });
      setStreakDays(weekStreak);

      // Contar días consecutivos hacia atrás desde hoy
      let count = 0;
      let offset = 0;
      while (true) {
        const key = localDate(-offset);
        if (dateSet.has(key)) { count++; offset++; }
        else break;
        if (offset > 365) break;
      }
      setStreakCount(count);
    }

    // Cargar prácticas completadas hoy
    async function loadPractices() {
      const { data } = await supabase.from("daily_practices")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayKey);
      if (data) {
        const map = {};
        data.forEach(r => { map[`${r.practice_index}-${todayKey}`] = true; });
        setCompletedPractices(map);

        // Si las 3 ya están completadas, marcar racha
        const allDone = [0, 1, 2].every(i => map[`${i}-${todayKey}`]);
        if (allDone) {
          await supabase.from("streaks").upsert(
            { user_id: user.id, date: todayKey },
            { onConflict: "user_id,date" }
          );
          setStreakDays(prev => {
            const next = [...prev];
            next[todayIdx] = true;
            return next;
          });
        }
      }
    }

    loadStreak();
    loadPractices();
  }, [user]);

  async function markPracticeDone(index) {
    const key = `${index}-${todayKey}`;
    if (completedPractices[key]) return;

    // Actualizar estado local primero
    const updated = { ...completedPractices, [key]: true };
    setCompletedPractices(updated);

    // Guardar en Supabase
    await supabase.from("daily_practices").upsert({
      user_id: user.id,
      practice_index: index,
      date: todayKey,
      completed: true,
    }, { onConflict: "user_id,practice_index,date" });

    // Verificar si las 3 prácticas (índices 0, 1, 2) están completas
    const p0 = index === 0 || !!completedPractices[`0-${todayKey}`];
    const p1 = index === 1 || !!completedPractices[`1-${todayKey}`];
    const p2 = index === 2 || !!completedPractices[`2-${todayKey}`];
    const allDone = p0 && p1 && p2;

    if (allDone && !streakDays[todayIdx]) {
      await supabase.from("streaks").upsert(
        { user_id: user.id, date: todayKey },
        { onConflict: "user_id,date" }
      );
      setStreakDays(prev => {
        const next = [...prev];
        next[todayIdx] = true;
        return next;
      });
      setStreakCount(prev => prev + 1);
    }
  }


  const practiceContent = [
    {
      icon: "moon", color: C.blue, bg: C.iceBlue,
      label: "Oración de la mañana", sub: "Laudes · 8 min", done: true,
      saint: "San Juan de la Cruz",
      saintQuote: "«En el principio de la mañana, antes de que el alma se ocupe en ninguna cosa, consagre a Dios el primer movimiento del corazón, el primer pensamiento, el primer deseo.»",
      reflection: `Los Laudes — la oración de la mañana de la Iglesia — son mucho más que un hábito devoto. Son una declaración teológica: antes de que el mundo me reclame, yo me pertenezco a Dios. La Liturgia de las Horas, que millones de consagrados y laicos rezan en todo el mundo en este mismo momento, nos une a la oración perpetua de la Iglesia que nunca cesa.

San Benito, padre del monasticismo occidental, enseñaba que la primera obra del monje cada mañana debía ser la oración, no porque Dios la necesite, sino porque el alma la necesita. Sin ese anclaje inicial, el día se convierte en una sucesión de urgencias que nos arrastran lejos de nosotros mismos y lejos de Dios.

¿Qué diferencia hace comenzar el día con Dios? Los maestros espirituales coinciden: la persona que ora en la mañana lleva consigo durante el día una quietud interior que no depende de las circunstancias. No es que los problemas desaparezcan — es que se ven desde otra altura. Santa Teresa de Ávila llamaba a esto "el punto de Arquímedes del alma": ese lugar interior desde donde todo lo demás toma su justa proporción.

Hoy, antes de revisar el teléfono, antes de pensar en el trabajo o en los planes del día, dedica estos minutos a consagrar el día a Dios. No hace falta que salgan palabras perfectas. Una mirada amorosa al cielo ya es oración. San Juan Vianney decía que bastaba con "mirar a Dios y dejar que Dios te mire."`,
      questions: [
        "¿Cómo llego a este nuevo día — con gratitud, con ansiedad, con prisa? ¿Qué me dice eso sobre mi estado interior?",
        "¿Hay algo que quiero entregar específicamente a Dios esta mañana antes de comenzar el día?",
        "¿Qué gracia concreta necesito hoy para vivir bien lo que este día trae?",
      ],
    },
    {
      icon: "book", color: C.navy, bg: "#DDE8F2",
      label: "Lectio Divina", sub: "Lucas 10:38-42 · María y Marta", done: false,
      saint: "San Bernardo de Claraval",
      saintQuote: "«Hay quienes buscan a Dios para saber; son sabios. Hay quienes buscan a Dios para amar; son bienaventurados. Hay quienes buscan a Dios para servir; son fieles. Pero los más sabios son los que buscan a Dios para encontrarle.»",
      reflection: `La escena de Betania es una de las más cargadas de tensión y de gracia en todo el Evangelio. Marta entra apresurada, con las manos llenas y el corazón ocupado. María está sentada a los pies de Jesús, en la postura del discípulo que escucha. Y Jesús, lejos de resolver el conflicto a favor de la actividad, dice algo que ha desconcertado a los cristianos activos durante dos milenios: "María ha elegido la parte mejor."

No se trata de una condena al trabajo ni a la generosidad de Marta. El Evangelio no es una invitación a la pereza espiritual disfrazada de contemplación. Lo que Jesús señala es una prioridad: hay un orden en las cosas. Primero escuchar, luego actuar. Primero ser, luego hacer. La acción que no nace de la contemplación se convierte en activismo vacío, en ruido sin sentido.

San Bernardo de Claraval, doctor de la Iglesia y maestro espiritual del siglo XII, vivía esta tensión a diario como abad de Claraval: hombre de contemplación profunda y al mismo tiempo uno de los hombres más influyentes de su tiempo. Él enseñaba que quien abandona la contemplación para dedicarse enteramente a la acción pierde su fuente. "El río que no regresa a su manantial se seca."

Para nosotros, jóvenes adultos del siglo XXI inmersos en la cultura de la productividad y el logro, esta escena es casi escandalosa. ¿Sentarme sin hacer nada útil? ¿Solo escuchar? Sí. Exactamente eso. La Lectio Divina — leer la Escritura no para extraer información sino para encontrar a una Persona — es el arte de sentarse con María mientras el mundo grita con Marta.`,
      questions: [
        "¿Me identifico más con Marta o con María en este momento de mi vida? ¿Qué me dice esa identificación?",
        "¿Hay alguna 'Palabra' que Dios ha estado queriendo decirme y que el ruido de mi vida no me ha dejado escuchar?",
        "¿Qué pasaría en mi vida si dedicara 15 minutos diarios a sentarme simplemente a escuchar a Dios sin agenda propia?",
      ],
    },
    {
      icon: "heart", color: C.periwinkle, bg: "#E4EDF7",
      label: "Examen de conciencia", sub: "Método ignaciano · 5 pasos", done: false,
      saint: "San Ignacio de Loyola",
      saintQuote: "«El examen de conciencia no es contabilidad espiritual de pecados. Es aprender a leer la vida como Dios la lee: con misericordia, con atención y con amor.»",
      reflection: `San Ignacio de Loyola consideraba el Examen de Conciencia — al que llamaba "el Examen" — la práctica más importante de la vida espiritual. Más importante que la Misa, decía, si hubiera que elegir entre una y otra. Esta afirmación asombrosa revela cuánto valoraba esta práctica aparentemente sencilla de revisar el día.

Pero el Examen ignaciano no es lo que muchos imaginan: no es una lista de pecados, no es una sesión de autoflagelación espiritual, no es cargar con culpas acumuladas. Es algo mucho más hermoso y más humano: es aprender a ver la propia vida con los ojos de Dios. Sus cinco pasos clásicos son: gratitud (dar gracias por el día), petición de luz (pedir ver con claridad), revisión del día (repasarlo como una película con Dios a tu lado), reconocimiento (identificar momentos de amor y de alejamiento) y propósito (mirar el mañana con esperanza renovada).

Lo que hace único al Examen ignaciano es que no separa lo "espiritual" de lo "cotidiano". Dios está en la reunión de trabajo difícil, en la conversación tensa con un familiar, en el momento de generosidad espontánea, en el cansancio del final del día. El Examen nos entrena para reconocer esa presencia donde menos la esperamos.

Los jesuitas tienen una expresión que lo resume todo: "encontrar a Dios en todas las cosas." El Examen es la escuela donde aprendemos eso. No de golpe, sino día a día, con paciencia y con la misericordia de Dios que siempre va delante de nosotros.`,
      questions: [
        "¿Por qué tres momentos o personas de hoy puedo dar gracias sinceramente a Dios?",
        "¿En qué momento del día sentí mayor paz y libertad interior? ¿Y en cuál más tensión o lejanía de Dios?",
        "¿Hay algo que hice o dejé de hacer hoy que mañana quiero vivir de manera diferente? ¿Qué necesito pedirle a Dios para lograrlo?",
      {
icon: "heart", color: C.gold, bg: "#F5EDD8",
label: "Alianza de amor con María", sub: "Espiritualidad Schoenstatt · 8 min", done: false,
saint: "Padre José Kentenich",
saintQuote: "«María no quiere esclavos sino hijos libres que la amen. La alianza de amor es una relación personal, íntima y total con ella como Madre y Reina.»",
reflection: `El Padre José Kentenich fundó Schoenstatt en 1914 con una intuición revolucionaria: María quiere establecer una alianza de amor personal con cada alma. No una devoción externa, sino una relación viva, íntima y transformadora. Como una madre que conoce a cada hijo por su nombre.

La contribución schoenstattiana es el gesto concreto de esa alianza: ofrecemos a María nuestros méritos, sufrimientos y obras — no porque los necesite, sino porque el amor quiere dar. Y Ella, como Madre y Reina, los transforma y devuelve multiplicados en gracia.

El santuario — ese pequeño oratorio que Kentenich consagró en Schoenstatt, Alemania — se convirtió en el hogar espiritual del movimiento. Hoy hay santuarios en todo el mundo. Pero el más importante, enseñaba Kentenich, es el santuario interior del alma: ese espacio íntimo donde María habita cuando la invitamos.

"Instrumento en manos de María" era el lema de Kentenich. No resignación pasiva, sino confianza activa: dejar que María actúe a través de nosotros en el mundo. Es la espiritualidad del fiat vivido cada día.`,
questions: [
"¿Qué significa para ti tener a María como Madre personal, no solo como figura religiosa abstracta?",
"¿Qué puedes ofrecerle hoy a María como contribución — una alegría, un sufrimiento, un logro?",
"¿Cómo sería tu día si lo vivieras conscientemente como instrumento en manos de María?",
],
},],
    },
  ];

  const firstName = profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Amigo";

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.home, paddingBottom: 90 }}>

      {/* Modal de práctica */}
      {openCard !== null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(15,30,50,0.7)",
          display: "flex", alignItems: "flex-end",
        }} onClick={() => setOpenCard(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.white, borderRadius: "24px 24px 0 0",
            padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto",
            maxHeight: "85vh", overflowY: "auto",
          }}>
            {/* Header */}
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

            {/* Cita del santo */}
            <div style={{ background: practiceContent[openCard].bg, borderRadius: 14, padding: "14px 16px", marginBottom: 20, borderLeft: `3px solid ${practiceContent[openCard].color}` }}>
              <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, margin: "0 0 6px", lineHeight: 1.6 }}>{practiceContent[openCard].saintQuote}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: practiceContent[openCard].color, margin: 0 }}>{practiceContent[openCard].saint}</p>
            </div>

            {/* Reflexión */}
            <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 24px", whiteSpace: "pre-line" }}>
              {practiceContent[openCard].reflection}
            </p>

            {/* Preguntas */}
            <p style={{ fontSize: 12, fontWeight: 700, color: practiceContent[openCard].color, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>
              Preguntas para orar
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {practiceContent[openCard].questions.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${practiceContent[openCard].color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: practiceContent[openCard].color, fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                  <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, margin: 0 }}>{q}</p>
                </div>
              ))}
            </div>

            {/* Botón cerrar */}
            <button onClick={() => { markPracticeDone(openCard); setOpenCard(null); }} style={{
              width: "100%", marginTop: 28, padding: "14px",
              background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
              border: "none", borderRadius: 14, color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>Amén ✓ 🕊️</button>
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 11, color: C.inkLight, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>{(() => { const h = new Date().getHours(); return h < 12 ? "Buenos días" : h < 18 ? "Buenas tardes" : "Buenas noches"; })()}</p>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: C.ink, margin: "2px 0 0", lineHeight: 1.15, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.01em" }}>
              {firstName}
            </h1>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 4, overflow: "hidden", border: `1px solid ${C.mist}`, flexShrink: 0 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: C.cream, fontWeight: 600, fontSize: 18 }}>{firstName[0]?.toUpperCase()}</div>
            }
          </div>
        </div>

        {/* Versículo */}
        <div style={{
          marginTop: 20, borderRadius: 4,
          background: C.navy,
          padding: "20px 22px", color: C.cream, position: "relative", overflow: "hidden",
          borderLeft: `3px solid ${C.gold}`,
        }}>
          <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, margin: "0 0 10px", fontFamily: "'DM Sans', sans-serif" }}>Versículo del día</p>
          <p style={{ fontSize: 15, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 10px", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
            {dailyVerse?.text || "«Venid a mí todos los que estáis fatigados y cargados, y yo os haré descansar.»"}
          </p>
          <p style={{ fontSize: 10, opacity: 0.6, margin: 0, letterSpacing: "0.06em" }}>{dailyVerse?.ref || "Mateo 11:28"}</p>
        </div>
      </div>

      {/* Racha */}
      <div style={{ padding: "22px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.inkLight, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>Racha semanal</p>
          <span style={{ fontSize: 11, color: C.gold, fontWeight: 600, letterSpacing: "0.04em" }}>{streakCount} {streakCount === 1 ? "día" : "días"}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%", aspectRatio: "1", borderRadius: 4,
                background: streakDays[i] ? (i === todayIdx ? C.navy : `${C.navy}22`) : C.fog,
                border: `1px solid ${streakDays[i] ? (i === todayIdx ? C.navy : C.mist) : C.mist}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {streakDays[i] && <svg width={10} height={10} viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" stroke={i === todayIdx ? C.cream : C.navy} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </div>
              <p style={{ fontSize: 9, color: i === todayIdx ? C.navy : C.inkLight, fontWeight: i === todayIdx ? 600 : 400, margin: 0, letterSpacing: "0.04em" }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prácticas */}
      <div style={{ padding: "22px 22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: "0 0 12px" }}>Prácticas de hoy</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {practiceContent.map((c, i) => {
            const isDone = completedPractices[`${i}-${todayKey}`] || false;
            return (
            <button key={i} onClick={() => setOpenCard(i)} style={{
              background: isDone ? C.fog : C.cream, borderRadius: 4, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 14,
              border: isDone ? `1px solid ${C.mist}` : `1px solid ${C.mist}`,
              cursor: "pointer", textAlign: "left", width: "100%",
              borderLeft: isDone ? `3px solid ${C.gold}` : `3px solid transparent`,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 4, background: C.iceBlue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${C.mist}` }}>
                <Icon name={c.icon} size={18} color={isDone ? C.gold : C.blue} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: C.ink, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{c.label}</p>
                <p style={{ fontSize: 11, color: C.inkLight, margin: "2px 0 0", letterSpacing: "0.02em" }}>{c.sub}</p>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: 2,
                background: isDone ? C.gold : "transparent",
                border: isDone ? "none" : `1px solid ${C.mist}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {isDone && <svg width={12} height={12} viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" stroke={C.cream} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </div>
            </button>
            );
          })}
        </div>
      </div>

      {/* Acceso rápido a Mater */}
      <div style={{ padding: "22px 22px 0" }}>
        <button onClick={() => onTabChange("chat")} style={{
          width: "100%", borderRadius: 16, cursor: "pointer",
          background: `linear-gradient(135deg, ${C.iceBlue} 0%, #DDE8F4 100%)`,
          border: `1.5px solid ${C.mist}`, padding: "16px 18px",
          display: "flex", alignItems: "center", gap: 14, textAlign: "left",
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, overflow: "hidden",
            flexShrink: 0,
          }}>
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

/* ══════════════════════════════════════════
   CHAT SCREEN
══════════════════════════════════════════ */
function ChatScreen({ user }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hola 🕊️ Soy Mater, tu guía espiritual. Estoy aquí para acompañarte en tu camino de fe. ¿Cómo está tu corazón hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const systemPrompt = `Eres Mater, una guía de coaching espiritual católico para jóvenes adultos de 25 a 35 años. Tu nombre evoca el amor materno de la Virgen María, y tu misión es acompañar a personas que buscan crecer en su fe en medio de una vida adulta exigente: trabajo, relaciones, dudas existenciales, vocación y búsqueda de sentido.

Tu espiritualidad integra varias tradiciones:
- Ignaciana: el discernimiento, el examen de conciencia, "buscar y hallar a Dios en todas las cosas"
- Mariana: la confianza filial, el fiat, la intercesión de María
- Franciscana: la sencillez, el amor a la creación, la fraternidad
- Carmelita: la oración contemplativa, la interioridad, la noche oscura del alma

Cómo respondes:
- Con calidez, profundidad y cercanía — como una amiga sabia, no como un profesor
- Citas versículos bíblicos (especificando libro, capítulo y versículo) y frases de santos (Ignacio, Teresa de Ávila, Francisco de Asís, Juan Pablo II, Thomas Merton, etc.)
- Nunca juzgas ni condenas — acompañas con misericordia
- Haces preguntas que invitan a la reflexión interior
- Propones prácticas concretas y alcanzables para la vida cotidiana
- Hablas en español latinoamericano, natural y cercano
- Tus respuestas tienen máximo 4-5 oraciones para el formato móvil
- En momentos de crisis espiritual, recuerdas que la desolación es parte del camino y no abandono de Dios.
- Schoenstattiana: la alianza de amor con María como Madre y Reina, el santuario como hogar espiritual, el Padre José Kentenich como maestro de vida interior, la contribución como ofrenda de amor, el instrumento en manos de María, la pedagogía del amor como camino de santidad`;


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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "...";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Hubo un error. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: gradients.chat }}>
      <div style={{ padding: "52px 22px 16px", background: C.cream, borderBottom: `1px solid ${C.mist}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            {m.role === "assistant" && (
              <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, overflow: "hidden", marginRight: 8, alignSelf: "flex-end" }}>
              <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            )}
            <div style={{
              maxWidth: "78%",
              background: m.role === "user" ? C.navy : C.cream,
              color: m.role === "user" ? C.cream : C.ink,
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              padding: "11px 14px", fontSize: 13.5, lineHeight: 1.65,
              border: m.role === "user" ? "none" : `1px solid ${C.mist}`,
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ background: C.white, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", boxShadow: "0 2px 12px rgba(30,58,95,0.08)" }}>
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

      <div style={{ padding: "12px 16px 80px", background: C.cream, backdropFilter: "blur(12px)", borderTop: `1px solid ${C.mist}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Escribe lo que llevas en el corazón..."
          style={{ flex: 1, border: `1px solid ${C.mist}`, outline: "none", background: C.fog, borderRadius: 4, padding: "11px 14px", fontSize: 13.5, color: C.ink, fontFamily: "'DM Sans', system-ui, sans-serif" }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ width: 40, height: 40, borderRadius: 4, border: "none", background: input.trim() ? C.navy : C.mist, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", flexShrink: 0 }}>
          <Icon name="send" size={16} color={C.cream} />
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.1)} }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════
   PLAN SCREEN
══════════════════════════════════════════ */
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

  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  async function fetchGospelOfDay() {
    if (gospelOfDay) return;
    setLoadingGospel(true);
    try {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const yy = String(now.getFullYear()).slice(-2);
      const dateCode = `${mm}${dd}${yy}`;
      const usccbUrl = `https://bible.usccb.org/bible/readings/${dateCode}.cfm`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `Eres un asistente litúrgico católico experto en el calendario litúrgico de la USCCB. Conoces con exactitud las lecturas diarias del Leccionario Romano. Respondes SOLO en JSON válido, sin texto adicional, sin bloques de código.`,
          messages: [{
            role: "user",
            content: `Hoy es ${today}. Según el Leccionario Romano usado por la USCCB (${usccbUrl}), dame el evangelio exacto de hoy. 

El tiempo litúrgico actual es Tiempo Ordinario, semana 12.

Responde SOLO con este JSON (sin bloques de código, sin texto extra):
{"referencia":"Evangelio según San X, X:X-X","texto":"Primeras dos líneas del texto del evangelio de hoy","reflexion":"Reflexión de 3 párrafos breves para jóvenes adultos de 25-35 años basada en este evangelio específico","preguntas":["pregunta 1","pregunta 2","pregunta 3"],"santo":"Santo del día si lo hay","tiempo":"Sábado de la Duodécima Semana del Tiempo Ordinario"}`
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      setGospelOfDay(JSON.parse(clean));
    } catch (e) {
      setGospelOfDay({
        referencia: "Mateo 8:5-17",
        texto: "Cuando Jesús entró en Cafarnaúm, se le acercó un centurión que le rogaba: 'Señor, mi criado está en cama en mi casa, paralítico y sufriendo terriblemente.'",
        reflexion: "La fe del centurión nos sorprende porque viene de fuera — no es uno de los 'de casa', y sin embargo su confianza en Jesús supera a la de muchos de Israel. No necesita ver para creer. Le basta la palabra.\n\nHay momentos en nuestra vida adulta donde la fe se vuelve abstracta, teórica. Pero el centurión nos muestra que la fe más viva es la que se apoya en la Palabra de Cristo, sin necesitar más pruebas.\n\n¿Qué necesitas tú hoy que solo Jesús puede darte? ¿Puedes pedírselo con la misma confianza sencilla del centurión?",
        preguntas: ["¿Hay alguien cercano a ti que necesita ser 'sanado' hoy? ¿Cómo puedes interceder por esa persona?", "¿En qué área de tu vida te cuesta confiar en la Palabra de Jesús sin ver resultados?", "¿Qué significaría para ti decirle a Jesús 'solo di una palabra y quedaré sano'?"],
        santo: "San Cirilo de Alejandría",
        tiempo: "Sábado de la Duodécima Semana del Tiempo Ordinario"
      });
    } finally {
      setLoadingGospel(false);
    }
  }

  async function fetchDayContent(day, weekTitle, weekIdx, dayIdx) {
    const cacheKey = `${weekIdx}-${dayIdx}`;
    if (contentCache.current[cacheKey]) {
      setDayContent(contentCache.current[cacheKey]);
      return;
    }
    setLoadingContent(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: `Eres Mater, guía espiritual católica para jóvenes adultos de 25-35 años. 
Integras con profundidad la espiritualidad ignaciana (discernimiento, examen, consolación/desolación), 
mariana (fiat, intercesión, ternura), franciscana (pobreza, hermandad, creación) y carmelita (contemplación, noche oscura, Teresa de Ávila, Juan de la Cruz).
Tus reflexiones son ÚNICAS para cada práctica — nunca repites las mismas frases ni estructuras.
Escribes con profundidad teológica pero lenguaje cercano, como un director espiritual sabio y cálido.
Citas santos, papas, místicos y la Escritura con precisión.
Respondes SOLO en JSON válido, sin bloques de código, sin texto extra.`,
          messages: [{
            role: "user",
            content: `Crea contenido espiritual ÚNICO Y EXCLUSIVO para esta práctica específica:

Semana del plan: ${weekTitle}
Título de la práctica: "${day.title}"
Tipo de práctica: ${day.type}

IMPORTANTE: El contenido debe ser específico para este tema. No uses frases genéricas.
La reflexión debe tener mínimo 4 párrafos ricos en espiritualidad católica.
El santo debe ser relevante directamente a este tema específico.

Responde SOLO con este JSON:
{
  "santo": "Nombre de un santo directamente relacionado con este tema",
  "cita": "Cita auténtica y específica de ese santo sobre este tema exacto",
  "reflexion": "4 párrafos profundos, únicos y específicos para '${day.title}'. Usa referencias bíblicas, tradición de la Iglesia, experiencia espiritual concreta. Mínimo 200 palabras.",
  "preguntas": ["Pregunta profunda y específica para este tema 1", "Pregunta profunda y específica para este tema 2", "Pregunta profunda y específica para este tema 3"]
}`
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      contentCache.current[cacheKey] = parsed;
      setDayContent(parsed);
    } catch {
      const fallback = {
        santo: "San Ignacio de Loyola",
        cita: "«Busca y hallarás a Dios en todas las cosas, en cada momento de tu vida ordinaria.»",
        reflexion: `La práctica espiritual no es un ejercicio más en nuestra agenda. Es el espacio donde Dios nos habla en el silencio de nuestra vida interior, donde el alma aprende a reconocer Su voz entre el ruido del mundo.

San Ignacio de Loyola descubrió esta verdad en su lecho de convalecencia en Loyola. Herido en batalla, tuvo tiempo para leer vidas de santos y, poco a poco, notó algo: ciertos pensamientos le dejaban paz duradera, otros alegría superficial que pronto se convertía en vacío. Así nació el discernimiento de espíritus: aprender a leer los movimientos del alma.

Esta práctica que tienes ante ti hoy es una invitación a ese mismo discernimiento. No se trata de hacer algo perfecto sino de hacerlo con amor. Santa Teresa de Lisieux, la pequeña Teresa, nos enseñó que la santidad no está en las grandes hazañas sino en los pequeños actos realizados con gran amor. Un momento de oración sincera vale más que horas de piedad superficial.

Acércate a esta práctica con libertad interior. Si sientes resistencia, no la huyas — ofécela a Dios. Si sientes consolación, dale gracias. Todo es material para el camino espiritual.`,
        preguntas: [
          "¿Qué resistencias internas encuentras ante esta práctica y qué te dicen sobre tu estado espiritual?",
          "¿En qué momento concreto de tu vida cotidiana puedes integrar lo que aprendes aquí?",
          "¿Qué gracia específica quieres pedirle a Dios al terminar esta práctica hoy?"
        ]
      };
      contentCache.current[cacheKey] = fallback;
      setDayContent(fallback);
    } finally {
      setLoadingContent(false);
    }
  }

  const weeks = [
    { title: "Semana 1 · Encuentro", theme: "Redescubrir a Dios", color: C.navy, bg: "#DDE8F4",
      days: [
        { day: "Lun", title: "¿Quién es Dios para mí hoy?", type: "Reflexión" },
        { day: "Mar", title: "Salmo 139 — Dios me conoce por dentro", type: "Lectio" },
        { day: "Mié", title: "La oración como conversación, no monólogo", type: "Práctica" },
        { day: "Jue", title: "San Agustín: 'Nos hiciste para Ti'", type: "Lectura" },
        { day: "Vie", title: "10 minutos de silencio contemplativo", type: "Silencio" },
        { day: "Sáb", title: "Examen ignaciano: ¿dónde vi a Dios esta semana?", type: "Examen" },
        { day: "Dom", title: "Misa dominical con atención plena", type: "Misa" },
      ],
    },
    { title: "Semana 2 · Interioridad", theme: "La vida interior", color: C.blue, bg: "#E0EBF5",
      days: [
        { day: "Lun", title: "Lectio Divina: Juan 4 — La samaritana", type: "Lectio" },
        { day: "Mar", title: "Santa Teresa de Ávila: el castillo interior", type: "Lectura" },
        { day: "Mié", title: "El Padre Nuestro palabra por palabra", type: "Reflexión" },
        { day: "Jue", title: "Discernimiento: mociones espirituales", type: "Práctica" },
        { day: "Vie", title: "Oración con el cuerpo: posturas y respiración", type: "Práctica" },
        { day: "Sáb", title: "Examen ignaciano semanal", type: "Examen" },
        { day: "Dom", title: "Misa dominical con atención plena", type: "Misa" },
      ],
    },
    { title: "Semana 3 · Sacramentos", theme: "Encuentros con Cristo", color: C.periwinkle, bg: "#E8EFF7",
      days: [
        { day: "Lun", title: "La Eucaristía: presencia real de Jesús", type: "Lectura" },
        { day: "Mar", title: "Preparación para la Confesión — examen de vida", type: "Reflexión" },
        { day: "Mié", title: "La misericordia de Dios — Lucas 15", type: "Lectio" },
        { day: "Jue", title: "Adoración eucarística — guía de 20 minutos", type: "Práctica" },
        { day: "Vie", title: "Los sacramentos como encuentros, no ritos", type: "Lectura" },
        { day: "Sáb", title: "Examen ignaciano semanal", type: "Examen" },
        { day: "Dom", title: "Misa dominical con atención plena", type: "Misa" },
      ],
    },
    { title: "Semana 5 · Schoenstatt", theme: "Alianza de amor", color: "#A8864A", bg: "#F5EDD8", days: [{day:"Lun",title:"El Padre Kentenich y el origen de Schoenstatt",type:"Lectura"},{day:"Mar",title:"La alianza de amor con Maria",type:"Reflexion"},{day:"Mie",title:"El santuario como hogar espiritual",type:"Practica"},{day:"Jue",title:"La contribucion: ofrenda de amor",type:"Practica"},{day:"Vie",title:"Instrumento en manos de Maria",type:"Reflexion"},{day:"Sab",title:"Examen ignaciano semanal",type:"Examen"},{day:"Dom",title:"Misa y consagracion a Maria",type:"Misa"}]},

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
    const { error } = await supabase.from("plan_progress").upsert({
      user_id: user.id, week: weekIdx, day_index: dayIdx, completed: !current,
      completed_at: !current ? new Date().toISOString() : null,
    }, { onConflict: "user_id,week,day_index" });
    if (!error) setProgress(prev => ({ ...prev, [key]: !current }));
    setSaving(null);
  }

  const typeColor = { Lectura: C.blue, Práctica: C.sky, Reflexión: C.periwinkle, Examen: C.gold, Misa: C.navy, Lectio: C.teal, Silencio: C.slate };
  const w = weeks[activeWeek];
  const doneCount = w.days.filter((_, i) => progress[`${activeWeek}-${i}`]).length;
  const pct = Math.round((doneCount / w.days.length) * 100);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.plan, paddingBottom: 90 }}>

      {/* Modal de día */}
      {openDay !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: "flex-end" }}
          onClick={() => { setOpenDay(null); setDayContent(null); }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>{weeks[activeWeek].days[openDay]?.title}</p>
                <span style={pill(`${(typeColor[weeks[activeWeek].days[openDay]?.type]||C.blue)}20`, typeColor[weeks[activeWeek].days[openDay]?.type]||C.blue)}>{weeks[activeWeek].days[openDay]?.type}</span>
              </div>
              <button onClick={() => { setOpenDay(null); setDayContent(null); }} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>

            {loadingContent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: C.slateLight, fontSize: 14 }}>🕊️ Mater está preparando tu reflexión...</p>
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
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                  <button onClick={() => { toggleDay(activeWeek, openDay); setOpenDay(null); setDayContent(null); }} style={{
                    flex: 1, padding: "14px",
                    background: progress[`${activeWeek}-${openDay}`]
                      ? `${C.mist}`
                      : `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
                    border: "none", borderRadius: 14, color: "#fff",
                    fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}>
                    {progress[`${activeWeek}-${openDay}`] ? "✓ Completado" : "Amén ✓ — Marcar como hecho 🕊️"}
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

      {/* Evangelio del día */}
      <div style={{ padding: "0 22px 20px" }}>
        <button onClick={fetchGospelOfDay} style={{
          width: "100%", borderRadius: 16, border: `1.5px solid ${C.mist}`,
          background: gospelOfDay ? C.white : C.iceBlue,
          padding: "16px 18px", cursor: "pointer", textAlign: "left",
        }}>
          {loadingGospel ? (
            <p style={{ color: C.slateLight, fontSize: 13, margin: 0 }}>🕊️ Buscando el evangelio de hoy...</p>
          ) : gospelOfDay ? (
            <>
              <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, margin: "0 0 6px", fontWeight: 700 }}>📖 Evangelio del día · {gospelOfDay.tiempo}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: "0 0 6px" }}>{gospelOfDay.referencia}</p>
              <p style={{ fontSize: 12, fontStyle: "italic", color: C.inkMid, margin: "0 0 10px", lineHeight: 1.6 }}>«{gospelOfDay.texto}»</p>
              <p style={{ fontSize: 12, color: C.inkMid, lineHeight: 1.65, margin: "0 0 12px", whiteSpace: "pre-line" }}>{gospelOfDay.reflexion}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, margin: "0 0 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Preguntas para orar</p>
              {gospelOfDay.preguntas?.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${C.blue}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.blue, fontSize: 10, fontWeight: 700 }}>{i+1}</div>
                  <p style={{ fontSize: 12, color: C.ink, lineHeight: 1.6, margin: 0 }}>{q}</p>
                </div>
              ))}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>📖</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.navy, margin: 0 }}>Evangelio del día</p>
                <p style={{ fontSize: 11, color: C.slateLight, margin: 0 }}>Toca para ver el evangelio de hoy según la USCCB</p>
              </div>
            </div>
          )}
        </button>
      </div>

      <div style={{ padding: "0 22px 20px", display: "flex", gap: 10 }}>
        {weeks.map((wk, i) => (
          <button key={i} onClick={() => setActiveWeek(i)} style={{
            flex: 1, borderRadius: 14, padding: "12px 8px", border: "none",
            background: activeWeek === i ? wk.color : C.white,
            color: activeWeek === i ? "#fff" : C.inkMid,
            fontWeight: 700, fontSize: 11, cursor: "pointer",
            boxShadow: activeWeek === i ? `0 4px 16px ${wk.color}55` : "0 2px 8px rgba(30,58,95,0.07)",
            transition: "all 0.2s", lineHeight: 1.4, whiteSpace: "pre",
          }}>{`Sem.\n${i + 1}`}</button>
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
            <button key={i} onClick={() => {
              setOpenDay(i);
              setDayContent(null);
              fetchDayContent(d, w.title, activeWeek, i);
            }} style={{
              background: done ? w.bg : C.white, borderRadius: 14, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12,
              border: done ? `1.5px solid ${w.color}44` : `1.5px solid ${C.mist}`,
              boxShadow: "0 2px 10px rgba(30,58,95,0.05)",
              cursor: "pointer", textAlign: "left", width: "100%",
              opacity: isSaving ? 0.6 : 1, transition: "all 0.2s",
            }}>
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

/* ══════════════════════════════════════════
   DIARY SCREEN
══════════════════════════════════════════ */
function DiaryScreen({ user }) {
  const [entries, setEntries] = useState([]);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState({ mood: "🌟", title: "", text: "", tag: "Consolación" });
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // entry being edited
  const [editDraft, setEditDraft] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const moods = ["😔", "😐", "🙂", "😊", "🌊", "🙏", "🕊️", "🌟"];
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

  async function saveEntry() {
    if (!draft.title || !draft.text) return;
    setSaving(true);
    const { data, error } = await supabase.from("diary_entries").insert({
      user_id: user.id, title: draft.title, text: draft.text, mood: draft.mood, tag: draft.tag,
    }).select().single();
    if (!error && data) {
      setEntries(prev => [data, ...prev]);
      setDraft({ mood: "🌟", title: "", text: "", tag: "Consolación" });
      setWriting(false);
    }
    setSaving(false);
  }

  async function saveEdit() {
    if (!editDraft.title || !editDraft.text) return;
    setSavingEdit(true);
    const { error } = await supabase.from("diary_entries").update({
      title: editDraft.title, text: editDraft.text, mood: editDraft.mood, tag: editDraft.tag,
    }).eq("id", editingEntry.id).eq("user_id", user.id);
    if (!error) {
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...editDraft } : e));
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
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: gradients.diary }}>

      {/* Modal editar entrada */}
      {editingEntry && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: "flex-end" }}
          onClick={() => setEditingEntry(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.blue, margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Editar entrada</p>
              <button onClick={() => setEditingEntry(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {moods.map(m => (
                <button key={m} onClick={() => setEditDraft(d => ({ ...d, mood: m }))} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: editDraft.mood === m ? `${C.blue}20` : `${C.mist}55`, fontSize: 18, cursor: "pointer", outline: editDraft.mood === m ? `2px solid ${C.blue}` : "none" }}>{m}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {tags.map(t => (
                <button key={t} onClick={() => setEditDraft(d => ({ ...d, tag: t }))} style={{ padding: "4px 10px", borderRadius: 100, border: "none", background: editDraft.tag === t ? `${tagColor[t]}30` : C.iceBlue, color: editDraft.tag === t ? tagColor[t] : C.slateLight, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{t}</button>
              ))}
            </div>
            <input value={editDraft.title} onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))}
              style={{ width: "100%", border: "none", outline: "none", borderBottom: `1.5px solid ${C.mist}`, padding: "8px 0", fontSize: 15, fontWeight: 700, color: C.ink, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif", marginBottom: 10, boxSizing: "border-box" }} />
            <textarea value={editDraft.text} onChange={e => setEditDraft(d => ({ ...d, text: e.target.value }))} rows={5}
              style={{ width: "100%", border: "none", outline: "none", padding: "0", fontSize: 13.5, color: C.inkMid, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.65, resize: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, gap: 10 }}>
              <button onClick={() => setEditingEntry(null)} style={{ background: "transparent", border: `1px solid ${C.mist}`, borderRadius: 10, padding: "8px 16px", fontSize: 12, color: C.slateLight, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Cancelar</button>
              <button onClick={saveEdit} disabled={savingEdit} style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                {savingEdit ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Mi diario</p>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>Diario espiritual</h2>
        </div>
        <button onClick={() => setWriting(!writing)} style={{
          width: 42, height: 42, borderRadius: 14, border: "none",
          background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: `0 4px 14px ${C.navy}44`,
        }}>
          <Icon name="plus" size={20} color="#fff" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 22px", paddingBottom: 90 }}>
        {writing && (
          <div style={{ background: C.white, borderRadius: 20, padding: 18, marginBottom: 16, boxShadow: "0 6px 24px rgba(30,58,95,0.12)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Nueva entrada</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {moods.map(m => (
                <button key={m} onClick={() => setDraft(d => ({ ...d, mood: m }))} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: draft.mood === m ? `${C.blue}20` : `${C.mist}55`, fontSize: 18, cursor: "pointer", outline: draft.mood === m ? `2px solid ${C.blue}` : "none" }}>{m}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {tags.map(t => (
                <button key={t} onClick={() => setDraft(d => ({ ...d, tag: t }))} style={{ padding: "4px 10px", borderRadius: 100, border: "none", background: draft.tag === t ? `${tagColor[t]}30` : C.iceBlue, color: draft.tag === t ? tagColor[t] : C.slateLight, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{t}</button>
              ))}
            </div>
            <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Título..."
              style={{ width: "100%", border: "none", outline: "none", borderBottom: `1.5px solid ${C.mist}`, padding: "8px 0", fontSize: 15, fontWeight: 700, color: C.ink, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif", marginBottom: 10, boxSizing: "border-box" }} />
            <textarea value={draft.text} onChange={e => setDraft(d => ({ ...d, text: e.target.value }))}
              placeholder="¿Qué movimientos espirituales notaste hoy?" rows={4}
              style={{ width: "100%", border: "none", outline: "none", padding: "0", fontSize: 13.5, color: C.inkMid, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.65, resize: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, gap: 10 }}>
              <button onClick={() => setWriting(false)} style={{ background: "transparent", border: `1px solid ${C.mist}`, borderRadius: 10, padding: "8px 16px", fontSize: 12, color: C.slateLight, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Cancelar</button>
              <button onClick={saveEntry} disabled={saving} style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
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
            <div key={i} style={{ background: C.cream, borderRadius: 4, padding: "16px 18px", marginBottom: 10, border: `1px solid ${C.mist}`, borderLeft: `3px solid ${tagColor[e.tag] || C.sky}`, opacity: deletingId === e.id ? 0.5 : 1, transition: "opacity 0.2s" }}>
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
                  <button onClick={() => { setEditingEntry(e); setEditDraft({ mood: e.mood, title: e.title, text: e.text, tag: e.tag }); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: C.inkLight, display: "flex", alignItems: "center" }}>
                    <Icon name="edit" size={14} color={C.inkLight} />
                  </button>
                  <button onClick={() => deleteEntry(e.id)} disabled={deletingId === e.id} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: C.inkLight, display: "flex", alignItems: "center" }}>
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

/* ══════════════════════════════════════════
   PROFILE SCREEN
══════════════════════════════════════════ */
function ProfileScreen({ user, profile, setProfile, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifTime, setNotifTime] = useState("08:00");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if ("Notification" in window) {
      setNotifEnabled(Notification.permission === "granted");
    }
    const savedTime = localStorage.getItem("mater_notif_time");
    if (savedTime) setNotifTime(savedTime);
  }, []);

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
    } catch (err) {
      alert("Error al subir la imagen. Intenta de nuevo.");
    }
    setUploadingAvatar(false);
  }

  async function saveName() {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("profiles").upsert({ id: user.id, name: name.trim() });
    setProfile(prev => ({ ...prev, name: name.trim() }));
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  async function requestNotifications() {
    if (!("Notification" in window)) {
      alert("Tu navegador no soporta notificaciones.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotifEnabled(true);
      localStorage.setItem("mater_notif_time", notifTime);
      new Notification("Mater 🕊️", {
        body: "¡Notificaciones activadas! Te recordaremos cada día a las " + notifTime,
        icon: "/logo.jpeg",
      });
    } else {
      alert("Para activar notificaciones ve a Configuración → Safari → Notificaciones y permite Mater.");
    }
  }

  function saveNotifTime() {
    localStorage.setItem("mater_notif_time", notifTime);
    setActiveModal(null);
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      // Borrar todos los datos del usuario
      await supabase.from("diary_entries").delete().eq("user_id", user.id);
      await supabase.from("plan_progress").delete().eq("user_id", user.id);
      await supabase.from("daily_practices").delete().eq("user_id", user.id);
      await supabase.from("streaks").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
    } catch (e) {
      alert("Error al borrar la cuenta. Intenta de nuevo.");
    }
    setDeleting(false);
  }

  const modalStyle = {
    position: "fixed", inset: 0, zIndex: 300,
    background: "rgba(15,30,50,0.7)",
    display: "flex", alignItems: "flex-end",
  };
  const sheetStyle = {
    background: C.white, borderRadius: "24px 24px 0 0",
    padding: "24px 22px 48px", width: "100%", maxWidth: 390, margin: "0 auto",
    maxHeight: "80vh", overflowY: "auto",
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.home, paddingBottom: 90 }}>

      {/* Modal Notificaciones */}
      {activeModal === "notifications" && (
        <div style={modalStyle} onClick={() => setActiveModal(null)}>
          <div style={sheetStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>🔔 Notificaciones</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.7, marginBottom: 20 }}>
              Recibe un recordatorio diario para tus prácticas espirituales. Las notificaciones funcionan cuando tienes Mater abierta o añadida a tu pantalla de inicio.
            </p>
            <div style={{ background: C.iceBlue, borderRadius: 14, padding: "16px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Hora del recordatorio</p>
              <input type="time" value={notifTime} onChange={e => setNotifTime(e.target.value)}
                style={{ border: "none", outline: "none", background: "transparent", fontSize: 28, fontWeight: 800, color: C.navy, fontFamily: "'DM Sans', system-ui, sans-serif", width: "100%" }} />
            </div>
            <div style={{ background: notifEnabled ? `${C.blue}15` : C.iceBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{notifEnabled ? "✅" : "🔕"}</span>
              <p style={{ fontSize: 13, color: C.inkMid, margin: 0 }}>
                {notifEnabled ? "Notificaciones activadas" : "Notificaciones desactivadas"}
              </p>
            </div>
            <button onClick={notifEnabled ? saveNotifTime : requestNotifications} style={{
              width: "100%", padding: "14px", border: "none", borderRadius: 14,
              background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
              {notifEnabled ? "Guardar horario" : "Activar notificaciones"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Privacidad */}
      {activeModal === "privacy" && (
        <div style={modalStyle} onClick={() => { setActiveModal(null); setDeleteConfirm(false); }}>
          <div style={sheetStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>🔒 Privacidad</h2>
              <button onClick={() => { setActiveModal(null); setDeleteConfirm(false); }} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {[
                { icon: "🔐", title: "Tus datos son privados", desc: "Solo tú puedes ver tu diario, progreso y conversaciones con Mater." },
                { icon: "🛡️", title: "Sin publicidad", desc: "Mater no comparte tus datos con anunciantes ni terceros." },
                { icon: "☁️", title: "Almacenamiento seguro", desc: "Tus datos se guardan en Supabase con cifrado y políticas de acceso estrictas." },
              ].map((item, i) => (
                <div key={i} style={{ background: C.iceBlue, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: "0 0 4px" }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: C.inkMid, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {!deleteConfirm ? (
              <button onClick={() => setDeleteConfirm(true)} style={{
                width: "100%", padding: "14px", border: `1.5px solid #E8A0A0`,
                borderRadius: 14, background: "#FFF0F0", color: "#C0392B",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>Borrar mi cuenta y todos mis datos</button>
            ) : (
              <div style={{ background: "#FFF0F0", borderRadius: 14, padding: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#C0392B", margin: "0 0 8px" }}>⚠️ ¿Estás seguro?</p>
                <p style={{ fontSize: 12, color: C.inkMid, margin: "0 0 14px", lineHeight: 1.5 }}>Esta acción borrará permanentemente tu cuenta, diario, progreso y todos tus datos. No se puede deshacer.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setDeleteConfirm(false)} style={{ flex: 1, padding: "12px", border: `1px solid ${C.mist}`, borderRadius: 10, background: C.white, color: C.inkMid, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Cancelar</button>
                  <button onClick={deleteAccount} disabled={deleting} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 10, background: "#C0392B", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                    {deleting ? "Borrando..." : "Sí, borrar todo"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Acerca de */}
      {activeModal === "about" && (
        <div style={modalStyle} onClick={() => setActiveModal(null)}>
          <div style={sheetStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>🕊️ Acerca de Mater</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, overflow: "hidden", margin: "0 auto 12px", boxShadow: `0 4px 16px ${C.navy}33` }}>
                <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>Mater</h3>
              <p style={{ fontSize: 12, color: C.slateLight, margin: 0 }}>Versión 1.0 · materapp.org</p>
            </div>
            <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.75, marginBottom: 20, textAlign: "center" }}>
              Mater es una plataforma de coaching espiritual católico para jóvenes adultos de 25-35 años. Integra espiritualidad ignaciana, mariana, franciscana y carmelita para acompañar el camino de fe en la vida cotidiana.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Chat con Mater (IA)", icon: "🕊️" },
                { label: "Plan de formación de 30 días", icon: "📋" },
                { label: "Evangelio del día (USCCB)", icon: "📖" },
                { label: "Diario espiritual", icon: "📓" },
                { label: "Racha semanal de prácticas", icon: "⭐" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.iceBlue, borderRadius: 10 }}>
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: C.ink }}>{f.label}</span>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: C.slateLight, marginTop: 20, lineHeight: 1.6 }}>
              Hecho con ❤️ para la Iglesia joven
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "52px 22px 0", textAlign: "center" }}>
        <div style={{ position: "relative", width: 90, margin: "0 auto 16px" }}>
          <div style={{ width: 90, height: 90, borderRadius: 4, overflow: "hidden", border: `1px solid ${C.mist}` }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} style={{
            position: "absolute", bottom: -6, right: -6,
            width: 28, height: 28, borderRadius: 4,
            background: C.navy, border: `2px solid ${C.cream}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
            {uploadingAvatar
              ? <div style={{ width: 10, height: 10, border: `2px solid ${C.cream}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <Icon name="edit" size={12} color={C.cream} />
            }
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadAvatar} style={{ display: "none" }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {editing ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
            <input value={name} onChange={e => setName(e.target.value)}
              style={{ border: "none", outline: "none", borderBottom: `2px solid ${C.blue}`, fontSize: 20, fontWeight: 800, color: C.ink, background: "transparent", textAlign: "center", fontFamily: "'DM Sans', system-ui, sans-serif", width: 200 }}
              autoFocus onKeyDown={e => e.key === "Enter" && saveName()} />
            <button onClick={saveName} disabled={saving} style={{ background: C.blue, border: "none", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              {saving ? "..." : "Guardar"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>
              {profile?.name || user?.email?.split("@")[0]}
            </h1>
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkLight, display: "flex", alignItems: "center" }}>
              <Icon name="edit" size={16} color={C.inkLight} />
            </button>
          </div>
        )}
        {saved && <p style={{ color: C.blue, fontSize: 12, margin: "4px 0 0" }}>✓ Nombre actualizado</p>}
        <p style={{ fontSize: 13, color: C.slateLight, margin: "4px 0 0" }}>{user?.email}</p>
      </div>

      {/* Options */}
      <div style={{ padding: "24px 22px 0" }}>
        <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Configuración</p>
        <div style={{ background: C.cream, borderRadius: 4, overflow: "hidden", border: `1px solid ${C.mist}` }}>
          {[
            { label: "Editar nombre", icon: "edit", action: () => setEditing(true) },
            { label: "Notificaciones", icon: "bell", action: () => setActiveModal("notifications") },
            { label: "Privacidad", icon: "lock", action: () => setActiveModal("privacy") },
            { label: "Acerca de Mater", icon: "heart", action: () => setActiveModal("about") },
          ].map((item, i, arr) => (
            <button key={i} onClick={item.action} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", border: "none", background: "transparent",
              borderBottom: i < arr.length - 1 ? `1px solid ${C.mist}` : "none",
              cursor: "pointer", textAlign: "left",
            }}>
              <Icon name={item.icon} size={15} color={C.inkLight} />
              <span style={{ fontSize: 13, color: C.ink, fontWeight: 400, flex: 1 }}>{item.label}</span>
              <Icon name="chevron" size={14} color={C.mist} />
            </button>
          ))}
        </div>
      </div>

      {/* Compartir */}
      <div style={{ padding: "24px 22px 0" }}>
        <button onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: "Mater — Coaching espiritual",
              text: "Te invito a Mater, una app de coaching espiritual católico para jóvenes. Tiene chat con IA, plan de 30 días, evangelio del día y diario espiritual.",
              url: "https://materapp.org",
            });
          } else {
            navigator.clipboard.writeText("https://materapp.org");
            alert("¡Enlace copiado! Comparte materapp.org con quien quieras.");
          }
        }} style={{
          width: "100%", padding: "14px", border: `1px solid ${C.mist}`,
          borderRadius: 4, background: C.cream, color: C.navy,
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          letterSpacing: "0.02em",
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <circle cx="18" cy="5" r="3" stroke={C.navy} strokeWidth="1.8"/>
            <circle cx="6" cy="12" r="3" stroke={C.navy} strokeWidth="1.8"/>
            <circle cx="18" cy="19" r="3" stroke={C.navy} strokeWidth="1.8"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={C.navy} strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={C.navy} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Compartir Mater
        </button>
      </div>

      {/* Logout */}
      <div style={{ padding: "16px 22px 0" }}>
        <button onClick={onLogout} style={{
          width: "100%", padding: "14px", border: `1px solid #E8A0A0`,
          borderRadius: 4, background: "transparent", color: "#C0392B",
          fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          letterSpacing: "0.02em",
        }}>
          <Icon name="logout" size={15} color="#C0392B" />
          Cerrar sesión
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: C.slateLight, margin: "24px 0 0", lineHeight: 1.6 }}>
        Mater v1.0 · materapp.org
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════
   ONBOARDING SCREEN
══════════════════════════════════════════ */
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  const steps = [
    {
      icon: null,
      title: "Bienvenido a Mater",
      subtitle: "Tu guía de coaching espiritual católico",
      body: "Mater te acompaña en tu camino de fe con reflexiones diarias, el evangelio de cada día, un diario espiritual y Mater, tu guía con IA.",
      cta: "Comenzar",
    },
    {
      icon: null,
      title: "¿Cómo te llamas?",
      subtitle: "Para personalizar tu experiencia",
      body: null,
      cta: "Continuar",
      input: true,
    },
    {
      icon: null,
      title: "Las 3 prácticas del día",
      subtitle: "Tu rutina espiritual diaria",
      body: "Cada día encontrarás 3 prácticas — Oración de la mañana, Lectio Divina y Examen de conciencia. Al completarlas construyes tu racha semanal.",
      cta: "Siguiente",
    },
    {
      icon: null,
      title: "Habla con Mater",
      subtitle: "Tu guía espiritual personal",
      body: "Mater está disponible para acompañarte en momentos de duda, discernimiento o simplemente para rezar juntos. Es confidencial y siempre disponible.",
      cta: "Entrar a Mater",
      last: true,
    },
  ];

  const s = steps[step];

  function handleNext() {
    if (s.last) {
      onComplete(name || "Amigo");
    } else if (step === 1 && !name.trim()) {
      return;
    } else {
      setStep(prev => prev + 1);
    }
  }

  return (
    <div style={{ flex: 1, background: C.iceBlue, display: "flex", flexDirection: "column", padding: "0 0 40px" }}>

      {/* Progress dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "60px 0 0" }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i === step ? C.navy : C.mist,
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", textAlign: "center" }}>

        {/* Logo */}
        <div style={{ width: 80, height: 80, borderRadius: 4, overflow: "hidden", border: `1px solid ${C.mist}`, marginBottom: 32 }}>
          <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <p style={{ fontSize: 11, color: C.inkLight, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 8px" }}>{s.subtitle}</p>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: C.ink, margin: "0 0 20px", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 }}>{s.title}</h2>

        {s.body && (
          <p style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.75, margin: "0 0 32px" }}>{s.body}</p>
        )}

        {s.input && (
          <div style={{ width: "100%", marginBottom: 32 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre"
              onKeyDown={e => e.key === "Enter" && handleNext()}
              autoFocus
              style={{
                width: "100%", border: "none", outline: "none",
                borderBottom: `1px solid ${C.mist}`,
                padding: "12px 4px", fontSize: 20, fontWeight: 600,
                color: C.ink, background: "transparent", textAlign: "center",
                fontFamily: "'Cormorant Garamond', serif",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: "0 32px" }}>
        <button onClick={handleNext} style={{
          width: "100%", padding: "15px", border: "none", borderRadius: 4,
          background: C.navy, color: C.cream,
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          letterSpacing: "0.04em",
          opacity: s.input && !name.trim() ? 0.5 : 1,
        }}>
          {s.cta}
        </button>

        {step > 0 && (
          <button onClick={() => setStep(prev => prev - 1)} style={{
            width: "100%", padding: "12px", border: "none", background: "transparent",
            color: C.inkLight, fontSize: 13, cursor: "pointer",
            fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: 8,
          }}>
            Atrás
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════ */
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [showOnboarding, setShowOnboarding] = useState(false);
 const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id, _event === "SIGNED_IN");
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId, isNewLogin = false) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) {
      setProfile(data);
      // Mostrar onboarding si es primera vez (no tiene nombre real)
      if (isNewLogin && !data.onboarded) setShowOnboarding(true);
    } else {
      const email = (await supabase.auth.getUser()).data?.user?.email || "";
      const name = email.split("@")[0];
      await supabase.from("profiles").upsert({ id: userId, name });
      setProfile({ id: userId, name });
      setShowOnboarding(true);
    }
    setLoading(false);
  }

  async function handleLogout() {
 await supabase.auth.signOut();
 setProfile(null);
 setSession(null);
 setTab("home");
 }

 async function completeOnboarding(name) {
    if (session) {
      await supabase.from("profiles").upsert({ id: session.user.id, name, onboarded: true });
      setProfile(prev => ({ ...prev, name, onboarded: true }));
    }
    setShowOnboarding(false);
  }

  const tabs = [
    { id: "home",    label: "Inicio",  icon: "home"  },
    { id: "chat",    label: "Mater",   icon: "chat"  },
    { id: "plan",    label: "Plan",    icon: "plan"  },
    { id: "diary",   label: "Diario",  icon: "diary" },
    { id: "profile", label: "Perfil",  icon: "heart" },
  ];
  const tabColor = { home: C.navy, chat: C.blue, plan: C.blue, diary: C.blue, profile: C.gold };

  if (loading) return (
    <div style={{ ...phone, alignItems: "center", justifyContent: "center", background: gradients.home }}>
      <div style={{ fontSize: 40 }}>🕊️</div>
      <p style={{ color: C.slateLight, marginTop: 12, fontSize: 14 }}>Cargando Mater...</p>
    </div>
  );

  if (!session) return (
    <div style={phone}>
      {showLanding ? <LandingScreen onEnter={() => setShowLanding(false)} /> : <AuthScreen onAuth={() => {}} />}
    </div>
  );

  if (showOnboarding) return (
    <div style={phone}>
      <OnboardingScreen onComplete={completeOnboarding} />
    </div>
  );

  const screens = {
    home:    <HomeScreen user={session.user} profile={profile} onTabChange={setTab} />,
    chat:    <ChatScreen user={session.user} />,
    plan:    <PlanScreen user={session.user} />,
    diary:   <DiaryScreen user={session.user} />,
    profile: <ProfileScreen user={session.user} profile={profile} setProfile={setProfile} onLogout={handleLogout} />,
  };

  return (
    <div style={{ ...phone, background: gradients[tab] || gradients.home }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {screens[tab]}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 390,
        background: C.cream,
        borderTop: `1px solid ${C.mist}`,
        display: "flex", paddingBottom: 8, zIndex: 50,
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          const col = tabColor[t.id];
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "10px 4px 4px", border: "none", background: "transparent",
              cursor: "pointer", gap: 4, transition: "all 0.2s",
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: active ? `${col}18` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                <Icon name={t.icon} size={20} color={active ? col : C.slateLight} />
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? col : C.slateLight, letterSpacing: "0.02em" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
