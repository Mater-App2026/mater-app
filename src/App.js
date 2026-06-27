import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ── PALETA AZUL SERENA ── */
const C = {
  navy:      "#1E3A5F",
  blue:      "#2D6A9F",
  sky:       "#4A90C4",
  periwinkle:"#7BA7CC",
  mist:      "#B8D4E8",
  iceBlue:   "#E8F2F9",
  slate:     "#4A6080",
  slateLight:"#7A95B0",
  gold:      "#C4A35A",
  goldLight: "#E8D5A0",
  teal:      "#3A7A8C",
  white:     "#FAFCFF",
  inkDark:   "#1A2B3C",
  inkMid:    "#3D5166",
  inkLight:  "#7A95B0",
};

const gradients = {
  home:  "linear-gradient(160deg, #EBF4FB 0%, #D6EAF5 50%, #C2DCEE 100%)",
  chat:  "linear-gradient(160deg, #E8F0F8 0%, #D4E4F2 50%, #C0D8EC 100%)",
  plan:  "linear-gradient(160deg, #ECF3FA 0%, #D8E8F4 50%, #C4DCEE 100%)",
  diary: "linear-gradient(160deg, #E4EEF7 0%, #D0E2F0 50%, #BCD6E9 100%)",
  auth:  "linear-gradient(160deg, #EBF4FB 0%, #D6EAF5 100%)",
};

const phone = {
  width: "100%", maxWidth: 390, minHeight: "100vh",
  margin: "0 auto", fontFamily: "'Segoe UI', system-ui, sans-serif",
  position: "relative", overflow: "hidden",
  display: "flex", flexDirection: "column",
};

const pill = (bg, color) => ({
  display: "inline-flex", alignItems: "center", gap: 4,
  background: bg, color, borderRadius: 100, padding: "3px 10px",
  fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
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
    background: C.iceBlue, borderRadius: 12,
    padding: "14px 16px", fontSize: 14,
    color: C.inkDark, fontFamily: "inherit",
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
        <h1 style={{ fontSize: 30, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>Mater</h1>
        <p style={{ fontSize: 13, color: C.slateLight, margin: 0 }}>Tu guía de coaching espiritual</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", background: C.iceBlue, borderRadius: 14,
        padding: 4, marginBottom: "1.5rem",
      }}>
        {[["login", "Entrar"], ["register", "Crear cuenta"]].map(([m, l]) => (
          <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
            flex: 1, padding: "10px", border: "none", borderRadius: 10,
            background: mode === m ? C.white : "transparent",
            color: mode === m ? C.navy : C.slateLight,
            fontWeight: mode === m ? 700 : 400, fontSize: 13,
            cursor: "pointer", transition: "all 0.2s",
            boxShadow: mode === m ? `0 2px 8px rgba(30,58,95,0.1)` : "none",
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
          background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
          border: "none", borderRadius: 12, padding: "15px",
          color: "#fff", fontWeight: 700, fontSize: 15,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
          fontFamily: "inherit", marginTop: 4,
          boxShadow: `0 4px 16px ${C.navy}44`,
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

  const todayKey = new Date().toISOString().split("T")[0];

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
      const { data } = await supabase.from("streaks").select("date").eq("user_id", user.id).order("date", { ascending: false }).limit(14);
      if (!data) return;
      const dateSet = new Set(data.map(r => r.date));
      const weekStreak = days.map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (todayIdx - i));
        const key = d.toISOString().split("T")[0];
        return dateSet.has(key);
      });
      setStreakDays(weekStreak);
      let count = 0;
      const today = new Date().toISOString().split("T")[0];
      let check = new Date();
      while (true) {
        const key = check.toISOString().split("T")[0];
        if (dateSet.has(key)) { count++; check.setDate(check.getDate() - 1); }
        else break;
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
      ],
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
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.inkDark, margin: 0 }}>{practiceContent[openCard].label}</p>
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
                  <p style={{ fontSize: 13, color: C.inkDark, lineHeight: 1.6, margin: 0 }}>{q}</p>
                </div>
              ))}
            </div>

            {/* Botón cerrar */}
            <button onClick={() => { markPracticeDone(openCard); setOpenCard(null); }} style={{
              width: "100%", marginTop: 28, padding: "14px",
              background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`,
              border: "none", borderRadius: 14, color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>Amén ✓ 🕊️</button>
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 13, color: C.slateLight, margin: 0 }}>Buenos días ✦</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.inkDark, margin: "2px 0 0", lineHeight: 1.15 }}>
              {firstName}
            </h1>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.navy}, ${C.sky})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 18,
          }}>{firstName[0]?.toUpperCase()}</div>
        </div>

        {/* Versículo */}
        <div style={{
          marginTop: 20, borderRadius: 18,
          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`,
          padding: "18px 20px", color: "#fff", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -18, right: -18, opacity: 0.08, fontSize: 90 }}>✝</div>
          <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.7, margin: "0 0 8px" }}>VERSÍCULO DEL DÍA</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, fontStyle: "italic", margin: "0 0 8px" }}>
            {dailyVerse?.text || "«Venid a mí todos los que estáis fatigados y cargados, y yo os haré descansar.»"}
          </p>
          <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>{dailyVerse?.ref || "Mateo 11:28"}</p>
        </div>
      </div>

      {/* Racha */}
      <div style={{ padding: "22px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.inkDark, margin: 0 }}>⭐ Racha semanal</p>
          <span style={pill(`${C.sky}22`, C.blue)}>{streakCount} {streakCount === 1 ? "día" : "días"} seguidos</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: "100%", aspectRatio: "1", borderRadius: 10,
                background: streakDays[i]
                  ? i === todayIdx ? `linear-gradient(135deg, ${C.blue}, ${C.sky})` : `${C.blue}30`
                  : `${C.slateLight}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: streakDays[i] ? (i === todayIdx ? "#fff" : C.blue) : C.slateLight,
                fontWeight: 700,
              }}>{streakDays[i] ? "✓" : ""}</div>
              <p style={{ fontSize: 10, color: i === todayIdx ? C.blue : C.slateLight, fontWeight: i === todayIdx ? 700 : 400, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prácticas */}
      <div style={{ padding: "22px 22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.inkDark, margin: "0 0 12px" }}>Prácticas de hoy</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {practiceContent.map((c, i) => {
            const isDone = completedPractices[`${i}-${todayKey}`] || false;
            return (
            <button key={i} onClick={() => setOpenCard(i)} style={{
              background: isDone ? c.bg : C.white, borderRadius: 14, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 14,
              border: isDone ? `1.5px solid ${c.color}44` : `1.5px solid ${C.mist}`,
              boxShadow: "0 2px 12px rgba(30,58,95,0.06)",
              cursor: "pointer", textAlign: "left", width: "100%",
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={c.icon} size={20} color={c.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.inkDark, margin: 0 }}>{c.label}</p>
                <p style={{ fontSize: 11, color: C.inkLight, margin: "2px 0 0" }}>{c.sub}</p>
              </div>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: isDone ? c.color : "transparent",
                border: isDone ? "none" : `2px solid ${C.mist}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 12, flexShrink: 0,
              }}>{isDone ? "✓" : "›"}</div>
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
            <p style={{ fontSize: 13, fontWeight: 700, color: C.inkDark, margin: 0 }}>Hablar con Mater</p>
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
- En momentos de crisis espiritual, recuerdas que la desolación es parte del camino y no abandono de Dios`;


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
      <div style={{ padding: "52px 22px 16px", background: "rgba(234,244,252,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.mist}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.inkDark, margin: 0 }}>Mater</p>
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
              maxWidth: "75%",
              background: m.role === "user" ? `linear-gradient(135deg, ${C.navy}, ${C.blue})` : C.white,
              color: m.role === "user" ? "#fff" : C.inkDark,
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 14px", fontSize: 13.5, lineHeight: 1.6,
              boxShadow: "0 2px 12px rgba(30,58,95,0.08)",
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

      <div style={{ padding: "12px 16px 80px", background: "rgba(234,244,252,0.85)", backdropFilter: "blur(12px)", borderTop: `1px solid ${C.mist}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Escribe lo que llevas en el corazón..."
          style={{ flex: 1, border: "none", outline: "none", background: C.white, borderRadius: 20, padding: "12px 16px", fontSize: 13.5, color: C.inkDark, boxShadow: "0 2px 12px rgba(30,58,95,0.07)", fontFamily: "inherit" }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: input.trim() ? `linear-gradient(135deg, ${C.navy}, ${C.blue})` : C.mist, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", transition: "all 0.2s", flexShrink: 0 }}>
          <Icon name="send" size={18} color="#fff" />
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
                <p style={{ fontSize: 15, fontWeight: 800, color: C.inkDark, margin: 0 }}>{weeks[activeWeek].days[openDay]?.title}</p>
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
                      <p style={{ fontSize: 13, color: C.inkDark, lineHeight: 1.6, margin: 0 }}>{q}</p>
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
                    fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
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
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.inkDark, margin: 0 }}>30 días hacia Dios</h2>
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
                  <p style={{ fontSize: 12, color: C.inkDark, lineHeight: 1.6, margin: 0 }}>{q}</p>
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
                <p style={{ fontSize: 13, fontWeight: 700, color: C.inkDark, margin: 0 }}>{d.title}</p>
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

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: gradients.diary }}>
      <div style={{ padding: "52px 22px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Mi diario</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.inkDark, margin: 0 }}>Espiritual</h2>
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
              style={{ width: "100%", border: "none", outline: "none", borderBottom: `1.5px solid ${C.mist}`, padding: "8px 0", fontSize: 15, fontWeight: 700, color: C.inkDark, background: "transparent", fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" }} />
            <textarea value={draft.text} onChange={e => setDraft(d => ({ ...d, text: e.target.value }))}
              placeholder="¿Qué movimientos espirituales notaste hoy?" rows={4}
              style={{ width: "100%", border: "none", outline: "none", padding: "0", fontSize: 13.5, color: C.inkMid, background: "transparent", fontFamily: "inherit", lineHeight: 1.65, resize: "none", boxSizing: "border-box" }} />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, gap: 10 }}>
              <button onClick={() => setWriting(false)} style={{ background: "transparent", border: `1px solid ${C.mist}`, borderRadius: 10, padding: "8px 16px", fontSize: 12, color: C.slateLight, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
              <button onClick={saveEntry} disabled={saving} style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>
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
            <div key={i} style={{ background: C.white, borderRadius: 18, padding: "16px 18px", marginBottom: 12, boxShadow: "0 2px 12px rgba(30,58,95,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{e.mood}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: C.inkDark, margin: 0 }}>{e.title}</p>
                    <p style={{ fontSize: 10, color: C.slateLight, margin: 0 }}>{formatDate(e.created_at)}</p>
                  </div>
                </div>
                <span style={pill(`${(tagColor[e.tag] || C.sky)}22`, tagColor[e.tag] || C.sky)}>{e.tag}</span>
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
   ROOT APP
══════════════════════════════════════════ */
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
    else {
      // Crear perfil vacío si no existe
      const email = (await supabase.auth.getUser()).data?.user?.email || "";
      const name = email.split("@")[0];
      await supabase.from("profiles").upsert({ id: userId, name });
      setProfile({ id: userId, name });
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setTab("home");
  }

  const tabs = [
    { id: "home",  label: "Inicio", icon: "home"  },
    { id: "chat",  label: "Mater",  icon: "chat"  },
    { id: "plan",  label: "Plan",   icon: "plan"  },
    { id: "diary", label: "Diario", icon: "diary" },
  ];
  const tabColor = { home: C.navy, chat: C.blue, plan: C.periwinkle, diary: C.sky };

  if (loading) return (
    <div style={{ ...phone, alignItems: "center", justifyContent: "center", background: gradients.home }}>
      <div style={{ fontSize: 40 }}>🕊️</div>
      <p style={{ color: C.slateLight, marginTop: 12, fontSize: 14 }}>Cargando Mater...</p>
    </div>
  );

  if (!session) return (
    <div style={phone}>
      <AuthScreen onAuth={() => {}} />
    </div>
  );

  const screens = {
    home:  <HomeScreen user={session.user} profile={profile} onTabChange={setTab} />,
    chat:  <ChatScreen user={session.user} />,
    plan:  <PlanScreen user={session.user} />,
    diary: <DiaryScreen user={session.user} />,
  };

  return (
    <div style={{ ...phone, background: gradients[tab] }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {screens[tab]}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 390,
        background: "rgba(234,244,252,0.92)", backdropFilter: "blur(18px)",
        borderTop: `1px solid ${C.mist}`, display: "flex", paddingBottom: 8, zIndex: 50,
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
        <button onClick={handleLogout} style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "10px 4px 4px", border: "none", background: "transparent",
          cursor: "pointer", gap: 4, width: 56,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="logout" size={20} color={C.slateLight} />
          </div>
          <span style={{ fontSize: 10, color: C.slateLight }}>Salir</span>
        </button>
      </div>
    </div>
  );
}
