/* eslint-disable */
import { useState, useRef, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

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

// ─── Colores litúrgicos ─────────────────────────────────────────────────────
const LITURGICAL_COLORS = {
  green: { hex: "#3F7D4F", key: "liturgical_color_green" },
  red: { hex: "#A8342E", key: "liturgical_color_red" },
  violet: { hex: "#5B3A87", key: "liturgical_color_violet" },
  white: { hex: "#FFFFFF", key: "liturgical_color_white", border: true },
  gold: { hex: "#D4AF37", key: "liturgical_color_gold" },
};

// El calendario litúrgico oficial no distingue "blanco" de "dorado" (son el mismo
// color, con el dorado como opción festiva). Usamos dorado brillante para las
// solemnidades de mayor rango (rank_num bajo = Triduo Pascual, Navidad, etc.)
// y blanco liso para el resto de celebraciones en color blanco.
function getLiturgicalColor(colour, rankNum) {
  const key = colour === "white" && typeof rankNum === "number" && rankNum <= 1.3 ? "gold" : (colour || "green");
  return LITURGICAL_COLORS[key] || LITURGICAL_COLORS.green;
}

// ─── Traducciones (i18n) ────────────────────────────────────────────────────
const translations = {
  es: {
    nav_home: "Inicio", nav_chat: "Sofía", nav_plan: "Plan", nav_diary: "Diario", nav_more: "Más", nav_profile: "Perfil",

    landing_tagline: "Guía de coaching espiritual",
    landing_feature_chat_title: "Chat con Mater", landing_feature_chat_sub: "Tu guía espiritual personal con IA",
    landing_feature_lectio_title: "Lectio Divina diaria", landing_feature_lectio_sub: "Lectura orante guiada por IA",
    landing_feature_plan_title: "Plan de 30 días", landing_feature_plan_sub: "Formación espiritual estructurada",
    landing_feature_diary_title: "Diario espiritual", landing_feature_diary_sub: "Registra tus movimientos interiores",
    landing_enter: "Entrar a Mater",
    landing_safari_hint: "En Safari toca Compartir → Añadir a pantalla de inicio para instalarla",

    onb_title_1: "Bienvenido a Mater", onb_subtitle_1: "Tu guía de coaching espiritual católico",
    onb_body_1: "Mater te acompaña en tu camino de fe con reflexiones diarias, el evangelio de cada día, un diario espiritual y Mater, tu guía con IA.", onb_cta_1: "Comenzar",
    onb_title_2: "Las 3 prácticas del día", onb_subtitle_2: "Tu rutina espiritual diaria",
    onb_body_2: "Cada día encontrarás 3 prácticas — Oración de la mañana, Lectio Divina y Examen de conciencia. Al completarlas construyes tu ritmo semanal.", onb_cta_2: "Siguiente",
    onb_title_3: "Habla con Mater", onb_subtitle_3: "Tu guía espiritual personal",
    onb_body_3: "Mater está disponible para acompañarte en momentos de duda, discernimiento o simplemente para rezar juntos.", onb_cta_3: "Entrar a Mater",
    onb_back: "Atrás",

    auth_tagline: "Guía de coaching espiritual",
    auth_login: "Entrar", auth_register: "Crear cuenta",
    auth_name_placeholder: "Tu nombre", auth_email_placeholder: "Correo electrónico", auth_password_placeholder: "Contraseña",
    auth_error_fields: "Completa todos los campos.", auth_error_name: "Ingresa tu nombre.",
    auth_error_email: "Ingresa tu correo electrónico.",
    auth_error_invalid_login: "Correo o contraseña incorrectos.",
    auth_error_already_registered: "Este correo ya está registrado. Intenta iniciar sesión.",
    auth_error_reset: "No pudimos enviar el correo. Verifica tu email.",
    auth_success_register: "¡Cuenta creada! Bienvenido a Mater.",
    auth_send_reset: "Enviar correo de recuperación",
    auth_reset_sent: "✓ Revisa tu correo — te enviamos un enlace para restablecer tu contraseña.",
    auth_back_to_login: "Volver al inicio de sesión",
    auth_forgot_password: "¿Olvidaste tu contraseña?",
    auth_disclaimer: "Al usar Mater aceptas acompañar tu fe con honestidad y apertura. 🙏",
    auth_saving: "...",

    home_greeting_morning: "Buenos días", home_greeting_afternoon: "Buenas tardes", home_greeting_evening: "Buenas noches",
    home_verse_of_day: "Versículo del día", home_share: "Compartir",
    home_saint_of_day: "Santo del día", home_saint_loading: "Cargando santo del día...",
    home_saint_prayer: "🙏 Oración", home_saint_fact: "💡 ¿Sabías que...?",
    liturgical_color_green: "Verde", liturgical_color_white: "Blanco", liturgical_color_gold: "Dorado",
    liturgical_color_red: "Rojo", liturgical_color_violet: "Morado",
    home_weekly_rhythm: "Ritmo semanal", home_day_singular: "día esta semana", home_days_plural: "días esta semana",
    home_today_practices: "Prácticas de hoy",
    home_world_intention: "Intención del mundo", home_loading: "Cargando...",
    home_world_intention_prayer: "Oración de intercesión", home_world_intention_source: "Fuente",
    home_world_intention_read_more: "Leer noticia completa →",
    home_talk_to_sofia: "Hablar con Sofía", home_talk_to_sofia_sub: "¿Tienes algo en el corazón hoy?",
    home_questions_to_pray: "Preguntas para orar", home_amen_done: "Amén ✓",
    home_preparing_reflection: "✨ Mater está preparando tu reflexión...",
    home_lectio_step_lectio: "📖 LECTIO — Leer", home_lectio_step_meditatio: "🤔 MEDITATIO — Rumiar",
    home_lectio_step_oratio: "🙏 ORATIO — Responder", home_lectio_step_contemplatio: "✨ CONTEMPLATIO — Descansar",

    chat_status: "● Guía espiritual",
    chat_greeting: "Hola 🙏 Soy Sofía, tu guía espiritual. Estoy aquí para acompañarte en tu camino de fe. ¿Cómo está tu corazón hoy?",
    chat_placeholder: "Escribe lo que llevas en el corazón...",
    chat_error: "Hubo un error al conectar. Por favor intenta de nuevo.",
    chat_suggestion_1: "No sé cuál es mi vocación", chat_suggestion_2: "Me cuesta orar en el día a día", chat_suggestion_3: "Siento que Dios está lejos",

    plan_header_label: "Plan de formación", plan_title: "30 días hacia Dios",
    plan_questions_to_pray: "Preguntas para orar", plan_preparing: "✨ Mater está preparando tu reflexión...",
    plan_completed: "✓ Completado", plan_mark_done: "Amén ✓ — Marcar como hecho",
    plan_of_days_completed: "de", plan_days_completed_suffix: "completados",
    plan_week_short: "Sem.",

    diary_header_label: "Mi diario", diary_title: "Diario espiritual",
    diary_loading: "Cargando entradas...", diary_empty_1: "Aún no tienes entradas.", diary_empty_2: "Toca + para escribir tu primera reflexión.",
    diary_new_entry: "Nueva entrada", diary_edit_entry: "Editar entrada",
    diary_title_placeholder: "Título...", diary_text_placeholder: "¿Qué movimientos espirituales notaste hoy?",
    diary_cancel: "Cancelar", diary_save: "Guardar", diary_saving: "Guardando...",
    diary_tag_consolacion: "Consolación", diary_tag_discernimiento: "Discernimiento", diary_tag_gracias: "Acción de gracias", diary_tag_desolacion: "Desolación",

    profile_edit_name: "Editar nombre", profile_about: "Acerca de Mater",
    profile_about_title: "🌿 Acerca de Mater", profile_about_version: "Versión 1.0 · materapp.org",
    profile_about_body: "Mater es una plataforma de coaching espiritual católico para jóvenes adultos de 25-35 años. Integra espiritualidad ignaciana, mariana, franciscana, carmelita y schoenstattiana.",
    profile_about_footer: "Hecho con ❤️ para la Iglesia joven",
    profile_dark_mode: "Modo oscuro",
    profile_language: "Idioma", profile_language_es: "Español", profile_language_en: "English",
    profile_reminders: "Recordatorios diarios",
    profile_name_updated: "✓ Nombre actualizado",
    profile_save: "Guardar",
    profile_notifications_title: "🔔 Recordatorios diarios",
    profile_notifications_enable: "Activar notificaciones", profile_notifications_enable_sub: "Recibe avisos para tus 3 prácticas",
    profile_notifications_granted: "✓ Notificaciones activadas",
    profile_notifications_denied: "Permiso denegado. Actívalo en la configuración del navegador.",
    profile_notifications_choose_times: "Elige tus horarios",
    profile_notifications_iphone_hint: "En iPhone, instala Mater en tu pantalla de inicio (Compartir → Añadir a inicio) para recibir notificaciones.",
    profile_share: "Compartir Mater 🔗", profile_share_copied: "¡Enlace copiado!",
    profile_share_title: "Mater — Coaching espiritual", profile_share_text: "Te invito a Mater, una app de coaching espiritual católico.",
    profile_logout: "Cerrar sesión",
    profile_delete_account: "Eliminar cuenta",
    profile_delete_title: "Eliminar cuenta",
    profile_delete_body: "Esta acción es",
    profile_delete_permanent: "permanente",
    profile_delete_body_2: "y no se puede deshacer. Se eliminarán para siempre:",
    profile_delete_item_1: "Tu perfil y foto", profile_delete_item_2: "Todas tus entradas del diario espiritual",
    profile_delete_item_3: "Tu progreso en el plan de 30 días", profile_delete_item_4: "Tu racha y prácticas completadas",
    profile_delete_confirm_label: "Escribe", profile_delete_confirm_word: "ELIMINAR", profile_delete_confirm_label_2: "para confirmar:",
    profile_delete_cancel: "Cancelar", profile_delete_confirm_button: "Eliminar para siempre", profile_delete_deleting: "Eliminando...",
    profile_delete_error_session: "Sesión no válida. Vuelve a iniciar sesión e inténtalo de nuevo.",
    profile_delete_error_generic: "No se pudo eliminar la cuenta.",
    profile_delete_error_fallback: "Ocurrió un error. Intenta de nuevo o escribe a soporte@materapp.org.",
    profile_avatar_error: "Error al subir la imagen.",
    profile_footer: "Mater v1.0 · materapp.org",

    more_explore: "Explorar", more_title: "Más de Mater",
    more_miracles_title: "Milagros Eucarísticos", more_miracles_sub: "12 casos documentados a través de la historia",
    more_rosary_title: "Santo Rosario", more_rosary_sub: "Guía interactiva cuenta por cuenta",
    more_horario_title: "Horario Espiritual", more_horario_sub: "Lleva el control de tus prácticas del mes",
    more_back: "Más",

    miracles_title: "Milagros Eucarísticos",
    miracles_intro: "Casos documentados a lo largo de la historia de la Iglesia. Cada uno señala con distinto grado de reconocimiento oficial — lo indicamos en cada ficha.",
    miracles_fact: "💡 ¿Sabías que...?", miracles_recognition: "📜 Reconocimiento", miracles_share: "📤 Compartir",

    rosary_title: "Santo Rosario", rosary_mysteries_today: "Misterios de hoy", rosary_five_mysteries: "Los 5 misterios",
    rosary_fruit: "Fruto", rosary_begin: "Comenzar el Rosario 🙏", rosary_exit: "Salir",
    rosary_decade: "Decena", rosary_of_5: "de 5", rosary_fruit_of_mystery: "Fruto del misterio",
    rosary_previous: "‹ Anterior", rosary_next: "Siguiente ›", rosary_finish: "Terminar 🙏",

    horario_title: "Horario Espiritual", horario_loading: "Cargando tu Horario...",
    horario_particular_purpose: "Propósito particular", horario_purposes: "Propósitos",
    horario_add_purpose: "Añadir propósito", horario_new_category: "Nueva categoría",
    horario_monthly_goals: "Metas mensuales", horario_purpose_placeholder: "Escribe tu propósito...",
    horario_reminder_title: "🔔 Recordatorio diario", horario_reminder_enable: "Activar recordatorio",
    horario_reminder_enable_sub: "Un aviso al día para revisar tu Horario",
    horario_reminder_time: "Hora del recordatorio",
    horario_reminder_granted: "✓ Recordatorio activado",
    horario_reminder_denied: "Permiso denegado. Actívalo en la configuración del navegador.",
    horario_iphone_hint: "En iPhone, instala Mater en tu pantalla de inicio para recibir notificaciones.",
    horario_category_prompt: "Nombre de la nueva categoría:",
  },
  en: {
    nav_home: "Home", nav_chat: "Sofía", nav_plan: "Plan", nav_diary: "Diary", nav_more: "More", nav_profile: "Profile",

    landing_tagline: "Spiritual coaching guide",
    landing_feature_chat_title: "Chat with Mater", landing_feature_chat_sub: "Your personal AI spiritual guide",
    landing_feature_lectio_title: "Daily Lectio Divina", landing_feature_lectio_sub: "AI-guided prayerful reading",
    landing_feature_plan_title: "30-day plan", landing_feature_plan_sub: "Structured spiritual formation",
    landing_feature_diary_title: "Spiritual journal", landing_feature_diary_sub: "Record your inner movements",
    landing_enter: "Enter Mater",
    landing_safari_hint: "In Safari tap Share → Add to Home Screen to install it",

    onb_title_1: "Welcome to Mater", onb_subtitle_1: "Your Catholic spiritual coaching guide",
    onb_body_1: "Mater walks with you on your journey of faith with daily reflections, the Gospel of each day, a spiritual journal, and Mater, your AI guide.", onb_cta_1: "Get started",
    onb_title_2: "The 3 daily practices", onb_subtitle_2: "Your daily spiritual routine",
    onb_body_2: "Each day you'll find 3 practices — Morning prayer, Lectio Divina, and Examination of conscience. Completing them builds your weekly rhythm.", onb_cta_2: "Next",
    onb_title_3: "Talk with Mater", onb_subtitle_3: "Your personal spiritual guide",
    onb_body_3: "Mater is available to walk with you through moments of doubt, discernment, or simply to pray together.", onb_cta_3: "Enter Mater",
    onb_back: "Back",

    auth_tagline: "Spiritual coaching guide",
    auth_login: "Log in", auth_register: "Sign up",
    auth_name_placeholder: "Your name", auth_email_placeholder: "Email", auth_password_placeholder: "Password",
    auth_error_fields: "Please fill in all fields.", auth_error_name: "Enter your name.",
    auth_error_email: "Enter your email address.",
    auth_error_invalid_login: "Incorrect email or password.",
    auth_error_already_registered: "This email is already registered. Try logging in.",
    auth_error_reset: "We couldn't send the email. Check your address.",
    auth_success_register: "Account created! Welcome to Mater.",
    auth_send_reset: "Send recovery email",
    auth_reset_sent: "✓ Check your email — we sent you a link to reset your password.",
    auth_back_to_login: "Back to login",
    auth_forgot_password: "Forgot your password?",
    auth_disclaimer: "By using Mater you agree to walk your faith with honesty and openness. 🙏",
    auth_saving: "...",

    home_greeting_morning: "Good morning", home_greeting_afternoon: "Good afternoon", home_greeting_evening: "Good evening",
    home_verse_of_day: "Verse of the day", home_share: "Share",
    home_saint_of_day: "Saint of the day", home_saint_loading: "Loading saint of the day...",
    home_saint_prayer: "🙏 Prayer", home_saint_fact: "💡 Did you know?",
    liturgical_color_green: "Green", liturgical_color_white: "White", liturgical_color_gold: "Gold",
    liturgical_color_red: "Red", liturgical_color_violet: "Violet",
    home_weekly_rhythm: "Weekly rhythm", home_day_singular: "day this week", home_days_plural: "days this week",
    home_today_practices: "Today's practices",
    home_world_intention: "World intention", home_loading: "Loading...",
    home_world_intention_prayer: "Prayer of intercession", home_world_intention_source: "Source",
    home_world_intention_read_more: "Read the full story →",
    home_talk_to_sofia: "Talk with Sofía", home_talk_to_sofia_sub: "Do you have something on your heart today?",
    home_questions_to_pray: "Questions to pray with", home_amen_done: "Amen ✓",
    home_preparing_reflection: "✨ Mater is preparing your reflection...",
    home_lectio_step_lectio: "📖 LECTIO — Read", home_lectio_step_meditatio: "🤔 MEDITATIO — Reflect",
    home_lectio_step_oratio: "🙏 ORATIO — Respond", home_lectio_step_contemplatio: "✨ CONTEMPLATIO — Rest",

    chat_status: "● Spiritual guide",
    chat_greeting: "Hi 🙏 I'm Sofía, your spiritual guide. I'm here to walk with you on your journey of faith. How is your heart today?",
    chat_placeholder: "Write what's on your heart...",
    chat_error: "There was a connection error. Please try again.",
    chat_suggestion_1: "I don't know what my vocation is", chat_suggestion_2: "I struggle to pray day to day", chat_suggestion_3: "I feel like God is far away",

    plan_header_label: "Formation plan", plan_title: "30 days toward God",
    plan_questions_to_pray: "Questions to pray with", plan_preparing: "✨ Mater is preparing your reflection...",
    plan_completed: "✓ Completed", plan_mark_done: "Amen ✓ — Mark as done",
    plan_of_days_completed: "of", plan_days_completed_suffix: "completed",
    plan_week_short: "Wk.",

    diary_header_label: "My journal", diary_title: "Spiritual journal",
    diary_loading: "Loading entries...", diary_empty_1: "You don't have any entries yet.", diary_empty_2: "Tap + to write your first reflection.",
    diary_new_entry: "New entry", diary_edit_entry: "Edit entry",
    diary_title_placeholder: "Title...", diary_text_placeholder: "What spiritual movements did you notice today?",
    diary_cancel: "Cancel", diary_save: "Save", diary_saving: "Saving...",
    diary_tag_consolacion: "Consolation", diary_tag_discernimiento: "Discernment", diary_tag_gracias: "Thanksgiving", diary_tag_desolacion: "Desolation",

    profile_edit_name: "Edit name", profile_about: "About Mater",
    profile_about_title: "🌿 About Mater", profile_about_version: "Version 1.0 · materapp.org",
    profile_about_body: "Mater is a Catholic spiritual coaching platform for young adults aged 25-35. It integrates Ignatian, Marian, Franciscan, Carmelite, and Schoenstatt spirituality.",
    profile_about_footer: "Made with ❤️ for the young Church",
    profile_dark_mode: "Dark mode",
    profile_language: "Language", profile_language_es: "Español", profile_language_en: "English",
    profile_reminders: "Daily reminders",
    profile_name_updated: "✓ Name updated",
    profile_save: "Save",
    profile_notifications_title: "🔔 Daily reminders",
    profile_notifications_enable: "Enable notifications", profile_notifications_enable_sub: "Get reminders for your 3 practices",
    profile_notifications_granted: "✓ Notifications enabled",
    profile_notifications_denied: "Permission denied. Enable it in your browser settings.",
    profile_notifications_choose_times: "Choose your times",
    profile_notifications_iphone_hint: "On iPhone, install Mater on your home screen (Share → Add to Home Screen) to receive notifications.",
    profile_share: "Share Mater 🔗", profile_share_copied: "Link copied!",
    profile_share_title: "Mater — Spiritual coaching", profile_share_text: "I'm inviting you to Mater, a Catholic spiritual coaching app.",
    profile_logout: "Log out",
    profile_delete_account: "Delete account",
    profile_delete_title: "Delete account",
    profile_delete_body: "This action is",
    profile_delete_permanent: "permanent",
    profile_delete_body_2: "and cannot be undone. The following will be deleted forever:",
    profile_delete_item_1: "Your profile and photo", profile_delete_item_2: "All your spiritual journal entries",
    profile_delete_item_3: "Your progress in the 30-day plan", profile_delete_item_4: "Your streak and completed practices",
    profile_delete_confirm_label: "Type", profile_delete_confirm_word: "DELETE", profile_delete_confirm_label_2: "to confirm:",
    profile_delete_cancel: "Cancel", profile_delete_confirm_button: "Delete forever", profile_delete_deleting: "Deleting...",
    profile_delete_error_session: "Invalid session. Please log in again and try again.",
    profile_delete_error_generic: "Could not delete the account.",
    profile_delete_error_fallback: "An error occurred. Try again or write to support@materapp.org.",
    profile_avatar_error: "Error uploading the image.",
    profile_footer: "Mater v1.0 · materapp.org",

    more_explore: "Explore", more_title: "More from Mater",
    more_miracles_title: "Eucharistic Miracles", more_miracles_sub: "12 documented cases throughout history",
    more_rosary_title: "Holy Rosary", more_rosary_sub: "Interactive bead-by-bead guide",
    more_horario_title: "Spiritual Schedule", more_horario_sub: "Keep track of your practices for the month",
    more_back: "More",

    miracles_title: "Eucharistic Miracles",
    miracles_intro: "Documented cases throughout the Church's history. Each one is marked with a different degree of official recognition — we note it on each card.",
    miracles_fact: "💡 Did you know?", miracles_recognition: "📜 Recognition", miracles_share: "📤 Share",

    rosary_title: "Holy Rosary", rosary_mysteries_today: "Today's mysteries", rosary_five_mysteries: "The 5 mysteries",
    rosary_fruit: "Fruit", rosary_begin: "Begin the Rosary 🙏", rosary_exit: "Exit",
    rosary_decade: "Decade", rosary_of_5: "of 5", rosary_fruit_of_mystery: "Fruit of the mystery",
    rosary_previous: "‹ Previous", rosary_next: "Next ›", rosary_finish: "Finish 🙏",

    horario_title: "Spiritual Schedule", horario_loading: "Loading your Schedule...",
    horario_particular_purpose: "Personal resolution", horario_purposes: "Resolutions",
    horario_add_purpose: "Add resolution", horario_new_category: "New category",
    horario_monthly_goals: "Monthly goals", horario_purpose_placeholder: "Write your resolution...",
    horario_reminder_title: "🔔 Daily reminder", horario_reminder_enable: "Enable reminder",
    horario_reminder_enable_sub: "One reminder a day to review your Schedule",
    horario_reminder_time: "Reminder time",
    horario_reminder_granted: "✓ Reminder enabled",
    horario_reminder_denied: "Permission denied. Enable it in your browser settings.",
    horario_iphone_hint: "On iPhone, install Mater on your home screen to receive notifications.",
    horario_category_prompt: "Name of the new category:",
  },
};

function t(language, key) {
  return translations[language]?.[key] ?? translations.es[key] ?? key;
}

// ─── Viewport responsivo (reactivo a resize / rotación) ────────────────────
function useViewportInfo() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? window.innerHeight : 844,
  });
  const [visualHeight, setVisualHeight] = useState(
    typeof window !== "undefined" && window.visualViewport ? window.visualViewport.height : (typeof window !== "undefined" ? window.innerHeight : 844)
  );

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    function handleVisualViewportResize() {
      if (window.visualViewport) setVisualHeight(window.visualViewport.height);
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleVisualViewportResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleVisualViewportResize);
      }
    };
  }, []);

  const { width, height } = size;
  const isTablet = width >= 768;
  const isDesktop = width >= 1200;
  const contentMaxWidth = width < 480 ? width : Math.min(560, width - 64);
  const columns = width >= 700 ? 2 : 1;
  const keyboardOpen = height - visualHeight > 150;
  const keyboardHeight = keyboardOpen ? Math.round(height - visualHeight) : 0;

  return { width, height, isTablet, isDesktop, contentMaxWidth, columns, keyboardOpen, keyboardHeight, visualHeight };
}

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
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" fill="none" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" fill="none" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" fill="none" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" fill="none" /></>,
    rosary: <><circle cx="12" cy="4" r="1.6" stroke={color} strokeWidth="1.6" fill="none" /><circle cx="18" cy="8" r="1.6" stroke={color} strokeWidth="1.6" fill="none" /><circle cx="19" cy="15" r="1.6" stroke={color} strokeWidth="1.6" fill="none" /><circle cx="14" cy="20" r="1.6" stroke={color} strokeWidth="1.6" fill="none" /><circle cx="7" cy="19" r="1.6" stroke={color} strokeWidth="1.6" fill="none" /><circle cx="4" cy="13" r="1.6" stroke={color} strokeWidth="1.6" fill="none" /><circle cx="6" cy="6" r="1.6" stroke={color} strokeWidth="1.6" fill="none" /><path d="M12 12v9" stroke={color} strokeWidth="1.8" strokeLinecap="round" /></>,
    host: <><circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.8" fill="none" /><path d="M12 7.5v9M8 12h8" stroke={color} strokeWidth="1.6" strokeLinecap="round" /></>,
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
const PRACTICE_NAMES_EN = ["Morning prayer", "Lectio Divina", "Examination of conscience"];
const PRACTICE_MESSAGES = [
  "🙏 Es momento de tu oración de la mañana. Comienza el día con Dios.",
  "📖 Tu Lectio Divina te espera. Deja que la Palabra de hoy te hable.",
  "🌙 Termina el día con el Examen de conciencia. Revisa tu jornada con Dios."
];
const PRACTICE_MESSAGES_EN = [
  "🙏 It's time for your morning prayer. Start the day with God.",
  "📖 Your Lectio Divina awaits. Let today's Word speak to you.",
  "🌙 End the day with the Examination of conscience. Review your day with God."
];

async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function scheduleNotifications(times) {
  if (window._materNotifTimers) {
    window._materNotifTimers.forEach(t => clearTimeout(t));
  }
  window._materNotifTimers = [];

  if (Notification.permission !== "granted") return;

  const isEn = localStorage.getItem("mater_language") === "en";
  const names = isEn ? PRACTICE_NAMES_EN : PRACTICE_NAMES;
  const messages = isEn ? PRACTICE_MESSAGES_EN : PRACTICE_MESSAGES;

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
      new Notification("Mater 🙏 " + names[index], {
        body: messages[index],
        icon: "/logo.jpeg",
        badge: "/logo.jpeg",
      });
      scheduleNotifications(times);
    }, delay);
    window._materNotifTimers.push(timer);
  });
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; padding: 0; background: ${C.iceBlue}; overflow: hidden; height: 100%; overscroll-behavior: none; }
  #root { height: 100%; }
  img { max-width: 100%; }
  @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.1)} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

function LandingScreen({ onEnter, language }) {
  const verse = language === "en"
    ? { text: "«Come to me, all who labor and are heavy laden, and I will give you rest.»", ref: "Matthew 11:28" }
    : { text: "«Venid a mí todos los que estáis fatigados y cargados, y yo os haré descansar.»", ref: "Mateo 11:28" };
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.iceBlue, display: "flex", flexDirection: "column", padding: "0 0 40px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, overflow: "hidden", border: "1px solid " + C.mist, marginBottom: 24 }}>
          <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 600, color: C.navy, margin: "0 0 6px" }}>Mater</h1>
        <p style={{ fontSize: 11, color: C.inkLight, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 32px" }}>{t(language, "landing_tagline")}</p>
        <div style={{ background: C.navy, borderRadius: 12, padding: "18px 20px", marginBottom: 32, borderLeft: `3px solid ${C.gold}`, textAlign: "left", width: "100%" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: C.cream, fontStyle: "italic", lineHeight: 1.7, margin: "0 0 8px" }}>{verse.text}</p>
          <p style={{ fontSize: 10, color: C.gold, letterSpacing: "0.08em", margin: 0 }}>{verse.ref}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginBottom: 32 }}>
          {[
            ["🕊️", t(language, "landing_feature_chat_title"), t(language, "landing_feature_chat_sub")],
            ["📖", t(language, "landing_feature_lectio_title"), t(language, "landing_feature_lectio_sub")],
            ["📋", t(language, "landing_feature_plan_title"), t(language, "landing_feature_plan_sub")],
            ["📓", t(language, "landing_feature_diary_title"), t(language, "landing_feature_diary_sub")],
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
          {t(language, "landing_enter")}
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: C.inkLight, lineHeight: 1.6 }}>{t(language, "landing_safari_hint")}</p>
      </div>
    </div>
  );
}

function OnboardingScreen({ onComplete, language }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  const steps = [
    { title: t(language, "onb_title_1"), subtitle: t(language, "onb_subtitle_1"), body: t(language, "onb_body_1"), cta: t(language, "onb_cta_1") },
    { title: t(language, "onb_title_2"), subtitle: t(language, "onb_subtitle_2"), body: t(language, "onb_body_2"), cta: t(language, "onb_cta_2") },
    { title: t(language, "onb_title_3"), subtitle: t(language, "onb_subtitle_3"), body: t(language, "onb_body_3"), cta: t(language, "onb_cta_3"), last: true },
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
    <div style={{ flex: 1, overflowY: "auto", background: C.iceBlue, display: "flex", flexDirection: "column", padding: "0 0 40px" }}>
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
            {t(language, "onb_back")}
          </button>
        )}
      </div>
    </div>
  );
}

function AuthScreen({ onAuth, language }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleReset() {
    if (!email) { setError(t(language, "auth_error_email")); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://materapp.org",
      });
      if (err) throw err;
      setResetSent(true);
      setError("");
    } catch(err) {
      setError(t(language, "auth_error_reset"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError(""); setSuccess("");
    if (!email || !password) { setError(t(language, "auth_error_fields")); return; }
    setLoading(true);
    try {
      if (mode === "register") {
        if (!name) { setError(t(language, "auth_error_name")); setLoading(false); return; }
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        if (data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, name: name.trim() });
        }
        setSuccess(t(language, "auth_success_register"));
        setTimeout(() => onAuth(), 1000);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onAuth();
      }
    } catch (err) {
      setError(
        err.message === "Invalid login credentials"
          ? t(language, "auth_error_invalid_login")
          : err.message === "User already registered"
          ? t(language, "auth_error_already_registered")
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", border: "none", outline: "none",
    background: "transparent", borderBottom: `1px solid ${C.mist}`,
    padding: "12px 4px", fontSize: 16, color: C.ink,
    fontFamily: "'DM Sans', system-ui, sans-serif", boxSizing: "border-box",
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.auth, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, margin: "0 auto 1rem", overflow: "hidden", boxShadow: `0 8px 28px ${C.navy}44` }}>
          <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: C.navy, margin: "0 0 4px", fontFamily: "'Cormorant Garamond', serif" }}>Mater</h1>
        <p style={{ fontSize: 12, color: C.inkLight, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "auth_tagline")}</p>
      </div>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.mist}`, marginBottom: "2rem" }}>
        {[["login", t(language, "auth_login")], ["register", t(language, "auth_register")]].map(([m, l]) => (
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
          <input value={name} onChange={e => setName(e.target.value)} placeholder={t(language, "auth_name_placeholder")} style={inputStyle} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder={t(language, "auth_email_placeholder")} type="email" style={inputStyle} />
        <div style={{ position: "relative" }}>
          <input
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder={t(language, "auth_password_placeholder")} type={showPass ? "text" : "password"}
            style={{ ...inputStyle, paddingRight: 44 }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
            <Icon name="eye" size={18} color={C.slateLight} />
          </button>
        </div>
        {error && <p style={{ color: "#C0392B", fontSize: 12, margin: 0, textAlign: "center" }}>{error}</p>}
        {success && <p style={{ color: C.blue, fontSize: 12, margin: 0, textAlign: "center" }}>{success}</p>}
        {resetMode ? (
          <>
            <button onClick={handleReset} disabled={loading} style={{ background: C.navy, border: "none", borderRadius: 12, padding: "14px", color: C.cream, fontWeight: 600, fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: 8 }}>
              {loading ? t(language, "auth_saving") : t(language, "auth_send_reset")}
            </button>
            {resetSent && <p style={{ color: C.blue, fontSize: 12, margin: "8px 0 0", textAlign: "center" }}>{t(language, "auth_reset_sent")}</p>}
            <button onClick={() => { setResetMode(false); setResetSent(false); setError(""); }} style={{ background: "transparent", border: "none", color: C.slateLight, fontSize: 12, cursor: "pointer", marginTop: 8, width: "100%" }}>
              {t(language, "auth_back_to_login")}
            </button>
          </>
        ) : (
          <>
            <button onClick={handleSubmit} disabled={loading} style={{ background: C.navy, border: "none", borderRadius: 12, padding: "14px", color: C.cream, fontWeight: 600, fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'DM Sans', system-ui, sans-serif", marginTop: 8 }}>
              {loading ? t(language, "auth_saving") : mode === "login" ? t(language, "auth_login") : t(language, "auth_register")}
            </button>
            {mode === "login" && (
              <button onClick={() => { setResetMode(true); setError(""); }} style={{ background: "transparent", border: "none", color: C.slateLight, fontSize: 12, cursor: "pointer", marginTop: 8, width: "100%", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                {t(language, "auth_forgot_password")}
              </button>
            )}
          </>
        )}
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: C.slateLight, marginTop: "2rem", lineHeight: 1.6 }}>{t(language, "auth_disclaimer")}</p>
    </div>
  );
}

function NavBar({ active, onChange, darkMode, language }) {
  const T = darkMode ? DARK : C;
  const tabs = [
    { id: "home", icon: "home", label: t(language, "nav_home") },
    { id: "chat", icon: "chat", label: t(language, "nav_chat") },
    { id: "plan", icon: "plan", label: t(language, "nav_plan") },
    { id: "diary", icon: "diary", label: t(language, "nav_diary") },
    { id: "more", icon: "grid", label: t(language, "nav_more") },
    { id: "profile", icon: "user", label: t(language, "nav_profile") },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      width: "100%",
      background: T.white, borderTop: `1px solid ${T.mist}`,
      display: "flex", zIndex: 100, flexShrink: 0,
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

function HomeScreen({ user, profile, onTabChange, language }) {
  const { isTablet, columns } = useViewportInfo();
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

  const sheetOverlay = { position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: isTablet ? "center" : "flex-end", justifyContent: "center", padding: isTablet ? 24 : 0 };
  const sheetCard = (extra = {}) => ({ background: C.white, borderRadius: isTablet ? 24 : "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: isTablet ? 480 : 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto", ...extra });

  const now = new Date();
  const todayKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  const versesByLang = {
    es: [
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
    ],
    en: [
      { text: "«Come to me, all who labor and are heavy laden, and I will give you rest.»", ref: "Matthew 11:28" },
      { text: "«The Lord is my shepherd; I shall not want.»", ref: "Psalm 23:1" },
      { text: "«I can do all things through him who strengthens me.»", ref: "Philippians 4:13" },
      { text: "«Trust in the Lord with all your heart, and do not lean on your own understanding.»", ref: "Proverbs 3:5" },
      { text: "«Fear not, for I am with you; be not dismayed, for I am your God.»", ref: "Isaiah 41:10" },
      { text: "«I am the way, and the truth, and the life.»", ref: "John 14:6" },
      { text: "«Love one another as I have loved you.»", ref: "John 15:12" },
      { text: "«Peace I leave with you; my peace I give to you.»", ref: "John 14:27" },
      { text: "«Ask, and it will be given to you; seek, and you will find.»", ref: "Matthew 7:7" },
      { text: "«Whoever abides in me and I in him, he it is that bears much fruit.»", ref: "John 15:5" },
      { text: "«Be strong and courageous. Do not fear or be in dread.»", ref: "Deuteronomy 31:6" },
      { text: "«Seek first the kingdom of God and his righteousness.»", ref: "Matthew 6:33" },
      { text: "«The Lord is my light and my salvation; whom shall I fear?»", ref: "Psalm 27:1" },
      { text: "«For God so loved the world that he gave his only Son.»", ref: "John 3:16" },
      { text: "«I, I am he who blots out your transgressions, and I will not remember your sins.»", ref: "Isaiah 43:25" },
      { text: "«Love is patient and kind; love does not envy.»", ref: "1 Corinthians 13:4" },
      { text: "«Rejoice always, pray without ceasing, give thanks in all circumstances.»", ref: "1 Thessalonians 5:16-18" },
      { text: "«I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live.»", ref: "John 11:25" },
      { text: "«Do not be conformed to this world, but be transformed by the renewal of your mind.»", ref: "Romans 12:2" },
      { text: "«The Lord is your keeper; the Lord is your shade on your right hand.»", ref: "Psalm 121:5" },
      { text: "«For I desire mercy, and not sacrifice, the knowledge of God rather than burnt offerings.»", ref: "Hosea 6:6" },
      { text: "«Blessed are the pure in heart, for they shall see God.»", ref: "Matthew 5:8" },
      { text: "«The Lord is near to the brokenhearted.»", ref: "Psalm 34:19" },
      { text: "«God is love, and whoever abides in love abides in God.»", ref: "1 John 4:16" },
      { text: "«Grace to you and peace from God our Father.»", ref: "Romans 1:7" },
      { text: "«Trust in the Lord with all your heart, and he will make your paths straight.»", ref: "Proverbs 3:6" },
      { text: "«Blessed are those who mourn, for they shall be comforted.»", ref: "Matthew 5:4" },
      { text: "«The Spirit of the Lord is upon me, because he has anointed me to proclaim good news.»", ref: "Luke 4:18" },
      { text: "«Can a mother forget her nursing child? Even these may forget, yet I will not forget you.»", ref: "Isaiah 49:15" },
      { text: "«My grace is sufficient for you, for my power is made perfect in weakness.»", ref: "2 Corinthians 12:9" },
      { text: "«Bless the Lord, O my soul, and forget not all his benefits.»", ref: "Psalm 103:2" },
      { text: "«I came that they may have life and have it abundantly.»", ref: "John 10:10" },
      { text: "«Nothing will be able to separate us from the love of God in Christ Jesus our Lord.»", ref: "Romans 8:39" },
      { text: "«He heals the brokenhearted and binds up their wounds.»", ref: "Psalm 147:3" },
      { text: "«He who began a good work in you will bring it to completion at the day of Jesus Christ.»", ref: "Philippians 1:6" },
      { text: "«O Lord, you have searched me and known me; you know when I sit down and when I rise up.»", ref: "Psalm 139:1-2" },
      { text: "«God will wipe away every tear from their eyes, and death shall be no more.»", ref: "Revelation 21:4" },
      { text: "«Blessed are the merciful, for they shall receive mercy.»", ref: "Matthew 5:7" },
      { text: "«On God rests my salvation and my glory; my mighty rock, my refuge is God.»", ref: "Psalm 62:7" },
      { text: "«I am with you always, to the end of the age.»", ref: "Matthew 28:20" },
    ],
  };
  const verses = versesByLang[language] || versesByLang.es;

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
  }, [user, language]);

  async function fetchSaintOfDay() {
    const cacheKey = "saint-" + language + "-" + new Date().toDateString();
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setSaintOfDay(JSON.parse(cached)); return; }
    setLoadingSaint(true);
    try {
      // 1. Obtenemos el nombre VERIFICADO del santo de hoy (fuente real, no memoria del modelo)
      // Mandamos la fecha LOCAL del usuario para evitar desfases por el huso horario del servidor
      const localNow = new Date();
      const calRes = await fetch(`/api/santo-del-dia?year=${localNow.getFullYear()}&month=${localNow.getMonth() + 1}&day=${localNow.getDate()}`);
      const calData = await calRes.json();

      if (!calData.titulo_en) {
        // Día ferial sin santo fijo — no inventamos ninguno
        setSaintOfDay(language === "en" ? {
          nombre: "Ordinary time feria",
          historia: "Today the Church does not celebrate the fixed memorial of any particular saint; it is a feria within the liturgical calendar. It's an opportunity for free prayer and personal devotion.",
          oracion: "Lord, on this ordinary day, help me find you in the everyday. Amen.",
          dato: "'Ferial' days — without an obligatory memorial — leave room for optional devotions, such as local optional memorials.",
          color: calData.color, rankNum: calData.rank_num
        } : {
          nombre: "Feria del tiempo ordinario",
          historia: "Hoy la Iglesia no celebra la memoria fija de ningún santo particular; es un día ferial dentro del calendario litúrgico. Es una oportunidad para la oración libre y la devoción personal.",
          oracion: "Señor, en este día ordinario, ayúdame a encontrarte en lo cotidiano. Amén.",
          dato: "Los días 'feriales' —sin memoria obligatoria— dejan espacio para devociones libres, como memorias opcionales locales.",
          color: calData.color, rankNum: calData.rank_num
        });
        setLoadingSaint(false);
        return;
      }

      // 2. Le pedimos a Claude SOLO que redacte, dándole el nombre exacto ya verificado
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system: language === "en"
            ? "You are an expert in Catholic hagiography. You will be given the EXACT and VERIFIED name (in English) of today's saint or celebration from the official liturgical calendar. You must NOT change, substitute, or question that identity — just develop content about that specific person, in English. If you are not sure of a specific biographical fact, omit it rather than invent it. Respond ONLY in valid JSON with no code blocks."
            : "Eres un experto en hagiografia catolica. Se te dara el nombre EXACTO y VERIFICADO (en ingles) del santo o celebracion del calendario liturgico oficial de hoy. NO debes cambiar, sustituir ni cuestionar esa identidad — solo traducir el nombre correctamente al espanol y desarrollar contenido sobre esa persona especifica. Si no estas seguro de un dato biografico especifico, omitelo en lugar de inventarlo. Respondes SOLO en JSON valido sin bloques de codigo.",
          messages: [{
            role: "user",
            content: language === "en"
              ? `The official liturgical calendar (Calendarium Romanum Generale) indicates that today's celebration is: "${calData.titulo_en}". Keep that exact name (do not change the saint) and respond ONLY with JSON: {nombre: 'full name and official title in English, EXACTLY this person', siglo: 'century or historical period', historia: 'verified 3-paragraph history of their life', oracion: 'traditional or intercessory prayer of 3-4 lines', dato: 'a verifiable historical fact about this saint'}`
              : `El calendario liturgico oficial (Calendarium Romanum Generale) indica que hoy se celebra: "${calData.titulo_en}". Traduce el nombre correctamente al espanol (sin cambiar de santo) y responde SOLO con JSON: {nombre: 'nombre completo en español y titulo oficial, EXACTAMENTE esta persona', siglo: 'siglo o periodo historico', historia: 'historia verificada de 3 parrafos sobre su vida', oracion: 'oracion tradicional o de intercesion de 3-4 lineas', dato: 'un dato historico verificable sobre este santo'}`
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      parsed.color = calData.color;
      parsed.rankNum = calData.rank_num;
      sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
      setSaintOfDay(parsed);
    } catch {
      setSaintOfDay(language === "en" ? {
        nombre: "Holy Mary, Mother of God",
        fecha: "January 1",
        historia: "Mary, the Mother of Jesus, is the most venerated figure in the Catholic Church...",
        oracion: "Holy Mary, Mother of God and our Mother, pray for us...",
        dato: "The title 'Mother of God' (Theotokos) was declared dogma at the Council of Ephesus in the year 431.",
        color: "white", rankNum: 1.2
      } : {
        nombre: "Santa María, Madre de Dios",
        fecha: "1 de enero",
        historia: "Maria, la Madre de Jesus, es la figura mas venerada en la Iglesia Catolica...",
        oracion: "Santa María, Madre de Dios y Madre nuestra, intercede por nosotros...",
        dato: "El título 'Madre de Dios' (Theotokos) fue declarado dogma en el Concilio de Éfeso en el año 431.",
        color: "white", rankNum: 1.2
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

    const examenQuestionsEs = [
      "🙏 VÍNCULO CON DIOS: ¿He descubierto hoy la mano amorosa de Dios en los acontecimientos de mi jornada? ¿Dediqué tiempo a la oración o me dejé llevar por el activismo?",
      "💙 ALIANZA DE AMOR: ¿He actuado hoy como un instrumento dócil en manos de María? ¿Visité el Santuario — espiritual o físicamente — en mis pensamientos o con una oración?",
      "🤝 PRÓJIMO: ¿He sido paciente, comprensivo y caritativo con las personas que me rodean? ¿Juzgué a los demás o busqué ayudarles?"
    ];
    const examenQuestionsEn = [
      "🙏 BOND WITH GOD: Have I discovered God's loving hand today in the events of my day? Did I devote time to prayer, or did I get swept up in activism?",
      "💙 COVENANT OF LOVE: Have I acted today as a docile instrument in Mary's hands? Did I visit the Shrine — spiritually or physically — in my thoughts or with a prayer?",
      "🤝 NEIGHBOR: Have I been patient, understanding, and charitable with the people around me? Did I judge others or seek to help them?"
    ];

    const laudesContent = language === "en" ? [
      {
        santo: "Monday · Prayer of strength",
        cita: "«I can do all things through him who strengthens me.» — Philippians 4:13",
        reflexion: `Lord and my God,\n\nHere I am, at the start of this day, with all that I am and all that I have.\n\nI thank you for this dawn I did not deserve — for the air I breathe, for the life running through my veins, for the immense gift of a new day.\n\nToday I rise knowing I am not alone. You go before me. You walk beside me. You hold me up from behind. Nothing I encounter today can separate you from me.\n\nGive me strength to face what is difficult without running away. Give me clarity to make the decisions that are mine to make. Give me love to give the best of myself to the people I meet.\n\nMay this day be yours, Lord. May everything I do, say, and think bear your mark.\n\nAmen. 🙏`,
        preguntas: ["What specific challenge of today do you want to place in God's hands?", "Is there someone you want to love better today — and how will you do it?", "With what attitude do you want to begin this day?"]
      },
      {
        santo: "Tuesday · Prayer of trust",
        cita: "«Fear not, for I am with you; be not dismayed, for I am your God.» — Isaiah 41:10",
        reflexion: `Good Father,\n\nBefore the noise of the day reaches me, I stop here with you.\n\nI recognize that fear sometimes paralyzes me, that uncertainty weighs on me, that there are moments when I don't know where I'm going. But today I choose trust. I choose to believe that You are in control of what I cannot control.\n\nGive me the courage of one who knows they are accompanied. The strength of one who has found their source. The joy of one who lives as a child and not as an orphan.\n\nMay I not give up today at the first difficulty. May every obstacle be an opportunity to see you act. May I be able to say at the end of the day: I trusted, and You did not fail me.\n\nThank you, Lord, for this new day. I am yours.\n\nAmen. 🙏`,
        preguntas: ["What specific fear or worry do you want to hand over to God this morning?", "What would your day look like if you lived from trust instead of fear?", "Is there something God is asking you to let go of today so you can move forward?"]
      },
      {
        santo: "Wednesday · Prayer of presence",
        cita: "«But seek first the kingdom of God and his righteousness, and all these things will be added to you.» — Matthew 6:33",
        reflexion: `Jesus,\n\nToday I want to live with you, not just alongside you.\n\nI don't want a day of rushing where I forget you until nightfall. I want a day where your presence is the thread that binds every moment — the morning meeting, the hurried lunch, the difficult conversation, the trip back home.\n\nHelp me to be present. Present in what I do, present to whoever is in front of me, present in you.\n\nMay I not lose myself today in the urgent and forget the important. May I know how to distinguish what deserves my attention from what only drains my energy.\n\nI offer you this Wednesday — with its tasks, its encounters, and its surprises — as an offering of love.\n\nStay with me, Lord. That is all I need.\n\nAmen. 🙏`,
        preguntas: ["How can you keep the awareness of God's presence in the busiest moments of the day?", "What is the 'important' thing you don't want to forget today despite the urgent?", "To whom will you give your best presence today?"]
      },
      {
        santo: "Thursday · Prayer of gratitude",
        cita: "«Give thanks in all circumstances, for this is the will of God for you.» — 1 Thessalonians 5:18",
        reflexion: `My God,\n\nBefore asking, before worrying, before planning — I want to give thanks.\n\nThank you for the night that passed and the day that begins. Thank you for the people who love me and whom I love. Thank you for the health I have, for the work waiting for me, for the small pleasures you give me without my asking.\n\nI know there will be difficult things today. I know not everything will go as I plan. But today I choose to look first at what I have, not at what I lack.\n\nGive me a grateful heart. The kind of gratitude that doesn't depend on circumstances but on the certainty that You are good — always, in everything, even when I don't see it.\n\nMay gratitude be the tone of this Thursday. May it be contagious to those around me.\n\nAmen. 🙏`,
        preguntas: ["What three specific things can you thank God for this morning?", "Is there a person in your life you should thank for something — and can you do it today?", "How does your perspective on the day change when you begin it with gratitude?"]
      },
      {
        santo: "Friday · Prayer of surrender",
        cita: "«Not my will, but yours be done.» — Luke 22:42",
        reflexion: `Lord,\n\nToday is Friday — the day I remember that the greatest love was expressed in total surrender.\n\nI too want to give myself today. Not heroically or dramatically — in small things. In patience with whoever irritates me. In honesty when it would be convenient to lie. In service when I would rather rest.\n\nTake this day, Lord. Take my plans and align them with yours. Take my strength and use it for good. Take my limitations and show yourself strong in them.\n\nI am not afraid to surrender because I know to whom I surrender. To someone who knows me completely and loves me completely. That is enough.\n\nToday, like Mary at the Annunciation: 'Let it be done to me according to your word.'\n\nAmen. 🙏`,
        preguntas: ["Is there something in your day today that is hard for you to surrender to God — and why?", "In what area of your life do you need to say 'not my will but yours'?", "What would your Friday look like if you lived it with an attitude of total surrender?"]
      },
      {
        santo: "Saturday · Prayer of renewal",
        cita: "«The Lord is my shepherd; I shall not want. He makes me lie down in green pastures.» — Psalm 23:1-2",
        reflexion: `Father,\n\nSaturday is the day of rest — but also the day of renewal. Today I want to let You repair me from within.\n\nI come with the weariness of the week. With what went well and what didn't. With pending conversations and unfinished projects. With the joy of the good moments and the weight of the difficult ones.\n\nTake it all. And give me back renewed.\n\nGive me real rest today — not just from activity but from anxiety. Give me the ability to be without doing, to be without producing, to love without merit.\n\nMay this Saturday be a foretaste of the eternal rest You have promised. A day where I learn to receive instead of only giving.\n\nThank you for being my shepherd. Thank you that I lack nothing when I am with you.\n\nAmen. 🙏`,
        preguntas: ["What do you need to let rest today — not just the body but the soul?", "How can you make today's rest a spiritual act and not just a physical one?", "What do you want to recover this Saturday for the week ahead?"]
      },
      {
        santo: "Sunday · Prayer of consecration",
        cita: "«This is the day that the Lord has made; let us rejoice and be glad in it.» — Psalm 118:24",
        reflexion: `Risen Lord,\n\nToday is Sunday — the first day of the new creation. The day death lost and love won.\n\nI rise with that joy in my heart. Not because everything is perfect in my life — but because You conquered what seemed unconquerable. And that victory is mine too.\n\nToday I consecrate myself to you again. I give you this week that begins. I give you my projects, my relationships, my fears, and my hopes. Place them on the altar together with the bread and wine of today's Mass.\n\nMay this Sunday recharge me for the week. May today's Eucharist be the fuel for the days ahead.\n\nI am yours, Lord. Completely yours. Do with me what you will — because I know that all you want for me is love.\n\nAmen. 🙏`,
        preguntas: ["With what attitude do you come to Mass today — what do you want God to do in you?", "What do you want to consecrate to God at the start of this new week?", "How do you want the joy of Sunday to extend into the days ahead?"]
      },
    ] : [
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

    const lectioContent = language === "en" ? [
      { santo: "St. Bernard of Clairvaux", cita: "«The river that does not return to its spring dries up.»", reflexion: "The scene at Bethany is one of the most charged with tension and grace in the whole Gospel. Martha rushes in, her hands full and her heart preoccupied. Mary is sitting at Jesus's feet.\n\nJesus says something that has unsettled active Christians for two millennia: 'Mary has chosen the better part.' This is not a condemnation of work. What Jesus points to is a priority: listen first, then act. Be first, then do.\n\nSaint Bernard understood Lectio Divina as the act of returning to the spring. Active life dries us out — contemplation replenishes us. Not as an escape from reality but as the source that makes it possible to return to it with more love.\n\nToday, sit with Mary while the world shouts with Martha. Read a passage of the Gospel slowly — not to understand it but to let yourself be spoken to by it.", preguntas: ["Do I identify more with Martha or with Mary at this moment of my life?", "Is there a Word God has been wanting to tell me that I haven't had time to listen to?", "What would happen if I dedicated 15 minutes a day to listening to God in his Word?"] },
      { santo: "St. Gregory the Great", cita: "«Sacred Scripture grows with the one who reads it.»", reflexion: "Saint Gregory the Great was the pope who systematized Lectio Divina as a spiritual practice. For him, Scripture was not a text from the past but a living Word that speaks to the present of whoever reads it with faith.\n\n'Scripture grows with the one who reads it' — this paradoxical phrase points to something profound: the same text you read ten years ago will tell you something different today, because you are different. The Word of God adapts to the state of your soul.\n\nLectio Divina has four classic moments: lectio (reading), meditatio (pondering), oratio (responding), contemplatio (resting). They are not mechanical steps — they are natural movements of the soul that encounters God in the text.\n\nToday, read a passage three times. The first to understand. The second to feel. The third to receive what God wants to tell you, today, at this moment of your life.", preguntas: ["Is there a word or phrase from the Gospel that has been following you lately — and why?", "How has your reading of Scripture changed over the years?", "What keeps you from making Lectio Divina a more regular practice?"] },
      { santo: "Origen of Alexandria", cita: "«When you read Scripture, Christ himself speaks to you.»", reflexion: "Origen of Alexandria, one of the great theologians of the early centuries, held a radical conviction: Scripture is not a book about God — it is the place where God speaks now. Reading the Bible with faith is a form of personal encounter with Christ.\n\nThis conviction radically transforms biblical reading. It is not about acquiring religious information or fulfilling a pious duty. It is about sitting down to listen to someone who loves you and wants to communicate with you.\n\nLectio Divina teaches us to read 'on our knees' — with an attitude of reception, humility, and availability. I do not master the text — the text addresses me.\n\nToday, before reading, say a brief prayer: 'Speak, Lord, your servant is listening.' Then open the Gospel with that attitude.", preguntas: ["Do you read the Bible more as a duty or as an encounter — and what difference does it make?", "When was the last time a phrase from the Gospel stopped you and spoke to you directly?", "Which biblical passage has most deeply marked your life — and why?"] },
      { santo: "St. Jerome", cita: "«To ignore Scripture is to ignore Christ.»", reflexion: "Saint Jerome devoted decades of his life to translating the Bible into Latin — the version we know as the Vulgate. It was not an academic project: it was an act of passionate love for the Word of God.\n\n'To ignore Scripture is to ignore Christ' — this provocative phrase of Jerome's shakes us out of the comfort of a faith without the Word. We cannot deeply know Christ if we do not encounter him in the texts he himself recognized as sacred.\n\nLectio Divina offers us something different from academic reading: not to study the Bible but to let ourselves be studied by it. Not to analyze the text but to let the text analyze us.\n\nToday, choose a short passage — three or four verses — and stay with it throughout your prayer. Let the words resonate within you like the music of an instrument.", preguntas: ["How much time do you devote to the Word of God in your daily life?", "Is there a biblical passage you find difficult or that you avoid — and why?", "How could you concretely integrate Lectio Divina into your weekly routine?"] },
      { santo: "St. Teresa of Ávila", cita: "«A spiritual book was many times the only friend that accompanied me in difficult years.»", reflexion: "Saint Teresa of Ávila confesses in her autobiography that during many years of arid prayer, spiritual books were her lifeline. She could not pray without them — they were the bridge that carried her from the surface of her mind to the heart of prayer.\n\nThere are seasons when Lectio Divina flows naturally — the words land easily, prayer arises spontaneously. And there are others when the text seems closed and the mind won't settle. Teresa teaches us that in both cases, the gesture of sitting with the Word has value.\n\nFaithfulness to Lectio Divina is not measured by spiritual experiences but by loving constancy. As in any deep relationship, there are days of fluent conversation and days of shared silence. Both are forms of love.\n\nToday, if the reading doesn't 'flow,' don't be discouraged. Stay with a single phrase. Repeat it slowly. Let it settle. That is enough.", preguntas: ["How do you react when prayer or biblical reading 'doesn't flow'?", "What do you do to remain faithful to the Word in moments of spiritual dryness?", "Is there a spiritual book that has accompanied you in difficult moments?"] },
      { santo: "Father Joseph Kentenich", cita: "«The Word of God is the voice of the Mother who speaks to us through Scripture.»", reflexion: "Father Joseph Kentenich had a particular way of approaching Scripture: he read it looking for Mary's maternal presence within it. For him, the Word of God not only reveals the Father and the Son to us — it also reveals the Mother.\n\nIn John's Gospel, Mary appears at key moments: at Cana (the first miracle) and at the foot of the Cross (the last). It is no coincidence — it is theology. Mary is present when life and death intersect with grace.\n\nReading Scripture with Mary is not adding something foreign to the text — it is discovering a dimension that was always there. God's tenderness, his closeness, his way of going out to meet human weakness — all of that has a maternal face.\n\nToday, read the passage of Cana (John 2:1-11) and observe how Mary acts: she sees the need before anyone else, intercedes without asking anything for herself, and always points toward Jesus.", preguntas: ["How do you find Mary in Scripture — in which passages do you see her most clearly?", "What does Mary's attitude at Cana teach you about intercession?", "How does Mary's presence enrich your biblical reading?"] },
      { santo: "St. Augustine of Hippo", cita: "«Our heart is restless until it rests in You — and Scripture is the path to that rest.»", reflexion: "Saint Augustine found in Scripture the mirror that showed him his own soul. In the Confessions, he narrates how a phrase from the letter to the Romans changed his life: 'Put on the Lord Jesus Christ, and make no provision for the flesh, to gratify its desires.'\n\nA single phrase. Read at just the right moment. With a willing heart. That was enough for thirty-three years of searching to reach their destination.\n\nLectio Divina prepares us for that kind of encounter. We cannot force it — but we can dispose ourselves for it. We can create the conditions — silence, attention, openness — so that when God speaks, we hear him.\n\nToday, read with the expectation that God can tell you something that changes something in you. That expectation is already a form of faith.", preguntas: ["Is there a phrase from Scripture that has changed something in you — a moment of grace through the Word?", "Do you read the Bible expecting God to speak to you, or more as an automatic habit?", "What inner attitude do you need to cultivate for Lectio Divina to be more fruitful?"] },
    ] : [
      { santo: "San Bernardo de Claraval", cita: "«El río que no regresa a su manantial se seca.»", reflexion: "La escena de Betania es una de las más cargadas de tensión y de gracia en todo el Evangelio. Marta entra apresurada, con las manos llenas y el corazón ocupado. María está sentada a los pies de Jesús.\n\nJesús dice algo que ha desconcertado a los cristianos activos durante dos milenios: 'María ha elegido la parte mejor.' No se trata de una condena al trabajo. Lo que Jesús señala es una prioridad: primero escuchar, luego actuar. Primero ser, luego hacer.\n\nSan Bernardo entendía la Lectio Divina como el acto de volver al manantial. La vida activa nos seca — la contemplación nos repone. No como escape de la realidad sino como la fuente que hace posible volver a ella con más amor.\n\nHoy, siéntate con María mientras el mundo grita con Marta. Lee un pasaje del Evangelio despacio — no para entenderlo sino para dejarte hablar por él.", preguntas: ["¿Me identifico más con Marta o con María en este momento de mi vida?", "¿Hay alguna Palabra que Dios ha estado queriendo decirme y yo no he tenido tiempo de escuchar?", "¿Qué pasaría si dedicara 15 minutos diarios a escuchar a Dios en su Palabra?"] },
      { santo: "San Gregorio Magno", cita: "«La Sagrada Escritura crece con quien la lee.»", reflexion: "San Gregorio Magno fue el papa que sistematizó la Lectio Divina como práctica espiritual. Para él, la Escritura no era un texto del pasado sino una Palabra viva que habla al presente de quien la lee con fe.\n\n'La Escritura crece con quien la lee' — esta frase paradójica señala algo profundo: el mismo texto que leíste hace diez años te dirá algo diferente hoy, porque tú eres diferente. La Palabra de Dios se adapta al estado de tu alma.\n\nLa Lectio Divina tiene cuatro momentos clásicos: lectio (leer), meditatio (rumiar), oratio (responder), contemplatio (descansar). No son pasos mecánicos — son movimientos naturales del alma que encuentra a Dios en el texto.\n\nHoy, lee un pasaje tres veces. La primera para entender. La segunda para sentir. La tercera para recibir lo que Dios quiere decirte a ti, hoy, en este momento de tu vida.", preguntas: ["¿Hay una palabra o frase del Evangelio que te persigue últimamente — y por qué?", "¿Cómo ha cambiado tu lectura de la Escritura a lo largo de los años?", "¿Qué te impide hacer de la Lectio Divina una práctica más regular?"] },
      { santo: "Origen de Alejandría", cita: "«Cuando lees la Escritura, Cristo mismo te habla.»", reflexion: "Origen de Alejandría, uno de los grandes teólogos de los primeros siglos, tenía una convicción radical: la Escritura no es un libro sobre Dios — es el lugar donde Dios habla ahora. Leer la Biblia con fe es una forma de encuentro personal con Cristo.\n\nEsta convicción transforma radicalmente la lectura bíblica. No se trata de adquirir información religiosa ni de cumplir un deber piadoso. Se trata de sentarse a escuchar a alguien que te ama y quiere comunicarse contigo.\n\nLa Lectio Divina nos enseña a leer 'de rodillas' — con una actitud de recepción, de humildad, de disponibilidad. No yo domino el texto — el texto me interpela a mí.\n\nHoy, antes de leer, haz una oración breve: 'Señor, habla. Tu siervo escucha.' Y luego abre el Evangelio con esa actitud.", preguntas: ["¿Lees la Biblia más como un deber o como un encuentro — y qué diferencia hace?", "¿Cuándo fue la última vez que una frase del Evangelio te detuvo y te habló directamente?", "¿Qué pasaje bíblico ha marcado más profundamente tu vida — y por qué?"] },
      { santo: "San Jerónimo", cita: "«Ignorar la Escritura es ignorar a Cristo.»", reflexion: "San Jerónimo dedicó décadas de su vida a traducir la Biblia al latín — la versión que conocemos como la Vulgata. No era un proyecto académico: era un acto de amor apasionado por la Palabra de Dios.\n\n'Ignorar la Escritura es ignorar a Cristo' — esta frase provocadora de Jerónimo nos sacude de la comodidad de una fe sin Palabra. No podemos conocer profundamente a Cristo si no lo encontramos en los textos que él mismo reconoció como sagrados.\n\nLa Lectio Divina nos propone algo diferente a la lectura académica: no estudiar la Biblia sino dejarse estudiar por ella. No analizar el texto sino dejar que el texto nos analice.\n\nHoy, elige un pasaje corto — tres o cuatro versículos — y quédate con él durante toda la oración. Deja que las palabras resuenen en tu interior como la música de un instrumento.", preguntas: ["¿Cuánto tiempo le dedicas a la Palabra de Dios en tu vida cotidiana?", "¿Hay algún pasaje bíblico que te resulta difícil o que evitas — y por qué?", "¿Cómo podrías integrar la Lectio Divina en tu rutina semanal de manera concreta?"] },
      { santo: "Santa Teresa de Ávila", cita: "«Un libro espiritual fue muchas veces el único amigo que me acompañó en los años difíciles.»", reflexion: "Santa Teresa de Ávila confiesa en su autobiografía que durante muchos años de oración árida, los libros espirituales fueron su salvavidas. No podía rezar sin ellos — eran el puente que la llevaba de la superficie de su mente al corazón de la oración.\n\nHay temporadas en que la Lectio Divina fluye naturalmente — las palabras aterrizan con facilidad, la oración surge espontánea. Y hay otras en que el texto parece cerrado y la mente no se detiene. Teresa nos enseña que en ambos casos, el gesto de sentarse con la Palabra tiene valor.\n\nLa fidelidad a la Lectio Divina no se mide en experiencias espirituales sino en constancia amorosa. Como en cualquier relación profunda, hay días de conversación fluida y días de silencio compartido. Ambos son formas de amor.\n\nHoy, si la lectura no 'fluye', no te desanimes. Quédate con una sola frase. Repítela despacio. Deja que se asiente. Eso es suficiente.", preguntas: ["¿Cómo reaccionas cuando la oración o la lectura bíblica 'no fluye'?", "¿Qué haces para mantener la fidelidad a la Palabra en los momentos de sequía espiritual?", "¿Hay algún libro espiritual que te haya acompañado en momentos difíciles?"] },
      { santo: "Padre José Kentenich", cita: "«La Palabra de Dios es la voz de la Madre que nos habla a través de la Escritura.»", reflexion: "El Padre José Kentenich tenía una manera particular de acercarse a la Escritura: la leía buscando en ella la presencia maternal de María. Para él, la Palabra de Dios no solo nos revela al Padre y al Hijo — nos revela también a la Madre.\n\nEn el Evangelio de Juan, María aparece en los momentos clave: en Caná (el primer milagro) y al pie de la Cruz (el último). No es casualidad — es teología. María está presente cuando la vida y la muerte se cruzan con la gracia.\n\nLeer la Escritura con María no es añadir algo ajeno al texto — es descubrir una dimensión que siempre estuvo ahí. La ternura de Dios, su cercanía, su manera de salir al encuentro de la debilidad humana — todo eso tiene un rostro materno.\n\nHoy, lee el pasaje de Caná (Juan 2:1-11) y observa cómo actúa María: ve la necesidad antes que nadie, intercede sin pedir nada para sí, y apunta siempre hacia Jesús.", preguntas: ["¿Cómo encuentras a María en la Escritura — en qué pasajes la ves más claramente?", "¿Qué te enseña la actitud de María en Caná sobre la intercesión?", "¿Cómo enriquece tu lectura bíblica la presencia de María?"] },
      { santo: "San Agustín de Hipona", cita: "«Nuestro corazón está inquieto hasta que descanse en Ti — y la Escritura es el camino hacia ese descanso.»", reflexion: "San Agustín encontró en la Escritura el espejo que le mostró su propio alma. En las Confesiones, narra cómo una frase de la carta a los Romanos cambió su vida: 'Revestíos del Señor Jesucristo y no os preocupéis de satisfacer los deseos de la carne.'\n\nUna sola frase. Leída en el momento justo. Con el corazón dispuesto. Eso fue suficiente para que treinta y tres años de búsqueda llegaran a su destino.\n\nLa Lectio Divina nos prepara para ese tipo de encuentro. No podemos forzarlo — pero sí podemos disponernos. Podemos crear las condiciones — el silencio, la atención, la apertura — para que cuando Dios hable, lo escuchemos.\n\nHoy, lee con la expectativa de que Dios puede decirte algo que cambie algo en ti. Esa expectativa ya es una forma de fe.", preguntas: ["¿Hay alguna frase de la Escritura que haya cambiado algo en ti — un momento de gracia a través de la Palabra?", "¿Lees la Biblia con expectativa de que Dios te hable, o más como un hábito automático?", "¿Qué actitud interior necesitas cultivar para que la Lectio Divina sea más fructífera?"] },
    ];

    const examenContent = language === "en" ? [
      {
        santo: "Father Joseph Kentenich",
        cita: "«God's love comes to meet us in every event of the day — learning to see it is the art of the spiritual life.»",
        reflexion: `At the end of this day, stop for a moment and go over what you've lived with the eyes of the heart.\n\nFather Kentenich taught us to examine the day through three essential questions — not to judge ourselves, but to learn to read life the way God writes it.\n\nDon't look for perfection in your answers. Look for honesty and love. The Lord does not call us to account like a judge — he asks like a Father who wants to know how his child's day went.\n\nAnswer slowly. Calmly. Let each question do its work within.`,
        preguntas: examenQuestionsEn
      },
      {
        santo: "Father Joseph Kentenich",
        cita: "«Whoever knows how to read providence in the everyday has found the secret of inner peace.»",
        reflexion: `Close your eyes for a moment. Let the day pass before you like a film — without pause, without editing, just as it was.\n\nYou will see bright moments you may have let pass without giving thanks. You will see dark moments you carried alone without needing to. You will see people who gave you something and people to whom you gave.\n\nFather Kentenich believed that God speaks in the language of events. Not only in formal prayer — in the unexpected call, in the midday setback, in the conversation you hadn't planned.\n\nNow, with that film of the day in mind, answer the three questions with freedom and love.`,
        preguntas: examenQuestionsEn
      },
      {
        santo: "Father Joseph Kentenich",
        cita: "«God speaks to us through the small events of each day — we only need to learn his language.»",
        reflexion: `The day that is ending was full of small moments. Most we let pass without noticing they were messages of love.\n\nA kind word at just the right time. A difficulty that forced you to trust. A joy that arrived without your seeking it. A person who needed something only you could give them.\n\nFather Kentenich taught us that holiness is woven into the ordinary fabric of faithful days. Faithfulness in small things is the door to inner greatness.\n\nToday, in this examen, look for the golden threads God wove into your day. They are there, even if you didn't see them at the time.`,
        preguntas: examenQuestionsEn
      },
      {
        santo: "Father Joseph Kentenich",
        cita: "«Mary gathers our contributions — the small faithful acts of the day — and transforms them into a capital of graces for the world.»",
        reflexion: `Every day is an opportunity to contribute to the Shrine's capital of graces. Not with heroic gestures, but with the small currency of daily life: the patience it cost you, the service no one saw, the prayer you said without feeling like it but said anyway.\n\nFather Kentenich believed that nothing we live with love is lost. Everything — absolutely everything — offered to Mary with the intention of love is received by her and transformed into grace for the world.\n\nThis gives immense weight to the ordinary. Today, with its routines and surprises, its achievements and failures, is material for holiness if you offer it with love.\n\nAs you answer today's three questions, remember: you examine yourself not to condemn yourself but to grow in love.`,
        preguntas: examenQuestionsEn
      },
      {
        santo: "Father Joseph Kentenich",
        cita: "«The perfect instrument is not the one who never fails — it is the one who always returns to Mary's hands.»",
        reflexion: `No one ends the day having been perfect. No one. Not the saints, not the mystics, not the most faithful members of the Movement.\n\nWhat distinguishes a soul that grows is not the absence of failures but the speed with which it returns. It returns to prayer. It returns to Mary. It returns to love.\n\nFather Kentenich understood the spiritual life as a dynamic process, not a static state. Every day is a new beginning. Every examen is a new opportunity to adjust course.\n\nIf you failed today in any of the three dimensions — don't condemn yourself. Acknowledge it simply, offer it to Mary, and set one concrete intention for tomorrow. Just one. That is enough.`,
        preguntas: examenQuestionsEn
      },
      {
        santo: "Father Joseph Kentenich",
        cita: "«Inner life is not an escape from the world — it is learning to find God in the heart of the world.»",
        reflexion: `Father Kentenich did not form contemplatives who fled the world. He formed people who learned to find God in the heart of the world — in work, in family, in the city, in the tensions and joys of modern life.\n\nThis examen you do at the end of the day is precisely that: learning to read the world with eyes of faith. Not as one more religious burden, but as the gesture of a child who, coming home, tells the Father how their day went.\n\nThe Lord wants to know about your day. He is interested in the meeting that was difficult, the conversation that made you happy, the moment you felt his presence, and the moment you forgot him.\n\nTell him. Without embellishment. With the trust of a child who knows they are loved.`,
        preguntas: examenQuestionsEn
      },
      {
        santo: "Father Joseph Kentenich",
        cita: "«At the end of the day, what matters is not how much you did but how much love you did it with.»",
        reflexion: `Sunday. The Lord's day comes to an end. It has been a day to rest, to celebrate, to be with the people you love, to meet God in the Eucharist.\n\nHow was it? Was it truly a day of inner rest, or was it full of agitation disguised as leisure? Did you find God at Mass, in your family, in the silence of the afternoon?\n\nFather Kentenich believed that a Sunday well lived recharges the whole week — not as a recharge of physical energy but as a renewal of the spirit.\n\nAs you examine this Sunday, besides the usual three questions, add a fourth for yourself: Did I truly rest — did I rest in God?`,
        preguntas: examenQuestionsEn
      },
    ] : [
      {
        santo: "Padre José Kentenich",
        cita: "«El amor de Dios nos sale al encuentro en cada acontecimiento del día — aprender a verlo es el arte de la vida espiritual.»",
        reflexion: `Al final de este día, detente un momento y recorre lo vivido con los ojos del corazón.\n\nEl Padre Kentenich nos enseñó a hacer el examen de la jornada a partir de tres preguntas esenciales — no para juzgarnos, sino para aprender a leer la vida como Dios la escribe.\n\nNo busques perfección en tus respuestas. Busca honestidad y amor. El Señor no pide cuentas como un juez — las pide como un Padre que quiere saber cómo estuvo el día de su hijo.\n\nResponde despacio. Con calma. Deja que cada pregunta haga su trabajo en el interior.`,
        preguntas: examenQuestionsEs
      },
      {
        santo: "Padre José Kentenich",
        cita: "«El que sabe leer la providencia en lo cotidiano, ha encontrado el secreto de la paz interior.»",
        reflexion: `Cierra los ojos un momento. Deja que el día pase ante ti como una película — sin pausa, sin edición, tal como fue.\n\nVerás momentos luminosos que quizás dejaste pasar sin agradecerlos. Verás momentos oscuros que cargaste solo sin necesidad. Verás personas que te dieron algo y personas a quienes tú diste.\n\nEl Padre Kentenich creía que Dios habla en el lenguaje de los acontecimientos. No solo en la oración formal — en la llamada inesperada, en el contratiempo del mediodía, en la conversación que no tenías planeada.\n\nAhora, con esa película del día en la mente, responde las tres preguntas con libertad y amor.`,
        preguntas: examenQuestionsEs
      },
      {
        santo: "Padre José Kentenich",
        cita: "«Dios nos habla a través de los pequeños acontecimientos de cada día — solo necesitamos aprender su idioma.»",
        reflexion: `El día que termina estuvo lleno de momentos pequeños. La mayoría los dejamos pasar sin advertir que eran mensajes de amor.\n\nUna palabra amable en el momento justo. Una dificultad que te obligó a confiar. Una alegría que llegó sin que la buscaras. Una persona que necesitaba algo que solo tú podías darle.\n\nEl Padre Kentenich nos enseñó que la santidad se teje en la trama ordinaria de los días fieles. La fidelidad en lo pequeño es la puerta a la grandeza interior.\n\nHoy, en este examen, busca los hilos dorados que Dios tejió en tu jornada. Están ahí, aunque no los hayas visto en su momento.`,
        preguntas: examenQuestionsEs
      },
      {
        santo: "Padre José Kentenich",
        cita: "«María recoge nuestras contribuciones — las pequeñas fidelidades del día — y las transforma en capital de gracias para el mundo.»",
        reflexion: `Cada día es una oportunidad de contribuir al capital de gracias del Santuario. No con gestos heroicos, sino con la moneda pequeña de la vida cotidiana: la paciencia que costó, el servicio que nadie vio, la oración que rezaste sin ganas pero la rezaste.\n\nEl Padre Kentenich creía que nada de lo que vivimos con amor se pierde. Todo — absolutamente todo — que se ofrece a María con intención de amor, es recibido por ella y transformado en gracia para el mundo.\n\nEsto le da un peso inmenso a lo ordinario. El día de hoy, con sus rutinas y sus sorpresas, sus logros y sus fracasos, es material de santidad si lo ofreces con amor.\n\nAl responder las tres preguntas de hoy, recuerda: no te examinas para condenarte sino para crecer en amor.`,
        preguntas: examenQuestionsEs
      },
      {
        santo: "Padre José Kentenich",
        cita: "«El instrumento perfecto no es el que nunca falla — es el que siempre vuelve a ponerse en manos de María.»",
        reflexion: `Nadie termina el día habiendo sido perfecto. Nadie. Ni los santos, ni los místicos, ni los más fieles miembros del Movimiento.\n\nLo que distingue al alma que crece no es la ausencia de fallos sino la velocidad con que vuelve. Vuelve a la oración. Vuelve a María. Vuelve al amor.\n\nEl Padre Kentenich entendía la vida espiritual como un proceso dinámico, no como un estado estático. Cada día es un nuevo comienzo. Cada examen es una nueva oportunidad de ajustar el rumbo.\n\nSi hoy fallaste en alguna de las tres dimensiones — no te condenes. Reconócelo con sencillez, ofrécelo a María y proponte una cosa concreta para mañana. Solo una. Eso es suficiente.`,
        preguntas: examenQuestionsEs
      },
      {
        santo: "Padre José Kentenich",
        cita: "«La vida interior no es una fuga del mundo — es aprender a encontrar a Dios en el corazón del mundo.»",
        reflexion: `El Padre Kentenich no formó contemplativos que huyeran del mundo. Formó personas que aprendieran a encontrar a Dios en el corazón del mundo — en el trabajo, en la familia, en la ciudad, en las tensiones y alegrías de la vida moderna.\n\nEste examen que haces al final del día es precisamente eso: aprender a leer el mundo con ojos de fe. No como una carga religiosa más, sino como el gesto del hijo que al volver a casa le cuenta al Padre cómo le fue.\n\nEl Señor quiere saber de tu día. Le interesa la reunión que fue difícil, la conversación que te alegró, el momento en que sentiste su presencia y el momento en que lo olvidaste.\n\nCuéntaselo. Sin ornamentos. Con la confianza de un hijo que sabe que es amado.`,
        preguntas: examenQuestionsEs
      },
      {
        santo: "Padre José Kentenich",
        cita: "«Al final del día, lo que importa no es cuánto hiciste sino con cuánto amor lo hiciste.»",
        reflexion: `Domingo. El día del Señor llega a su fin. Ha sido un día para descansar, para celebrar, para estar con las personas que amas, para encontrarte con Dios en la Eucaristía.\n\n¿Cómo fue? ¿Fue realmente un día de descanso interior o estuvo lleno de agitación disfrazada de ocio? ¿Encontraste a Dios en la Misa, en la familia, en el silencio de la tarde?\n\nEl Padre Kentenich creía que el domingo bien vivido carga las baterías de toda la semana — no como recarga de energía física sino como renovación del espíritu.\n\nAl hacer el examen de este domingo, además de las tres preguntas habituales, añade una cuarta para ti: ¿Descansé de verdad — descansé en Dios?`,
        preguntas: examenQuestionsEs
      },
    ];
        const practiceArrays = [laudesContent, lectioContent, examenContent];
    const arr = practiceArrays[index] || laudesContent;
    const weekDay = new Date().getDay();
    const laudesIdx = weekDay === 0 ? 6 : weekDay - 1;
    const rotationIdx = index === 0 ? laudesIdx : dayOfYear % arr.length;
    return arr[rotationIdx % arr.length];
  }

  async function fetchWorldIntention() {
    const cacheKey = "world-intention-" + language + "-" + new Date().toDateString();
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setWorldIntention(JSON.parse(cached)); return; }

    const palette = [
      { color1: "#6b2c2c", color2: "#8f4a2d" },
      { color1: "#1a3a5c", color2: "#2d6a8f" },
      { color1: "#3a2c5c", color2: "#5a4a8f" },
      { color1: "#2c4a3a", color2: "#4a8f6a" },
      { color1: "#5c2c4a", color2: "#8f4a6a" },
    ];
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const colors = palette[dayOfYear % palette.length];

    try {
      // 1. Obtenemos un titular REAL y VERIFICADO de una API de noticias (no inventado)
      const newsRes = await fetch("/api/world-intention?lang=" + language);
      const newsData = await newsRes.json();
      if (!newsData.found) throw new Error("No hay noticia disponible hoy");

      // 2. Le pedimos a Claude que redacte SOLO a partir de ese titular verificado
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          system: language === "en"
            ? "You are a Catholic writer preparing a daily world prayer intention based on general world news (politics, economy, international relations, society, disasters, etc. — not only tragedies). You will be given a VERIFIED real news headline and summary from a news API. Do NOT invent additional facts, numbers, or details — base your writing strictly and only on the given headline and summary. Write a prayer intention appropriate to whatever the topic actually is: if it describes suffering, pray for those affected; if it's about a decision, negotiation, election, or event, pray for wisdom, justice, and the common good of those involved instead of assuming victims. Respond ONLY with valid JSON, in English, no code blocks: {lugar: 'country or region mentioned in the headline', descripcion: 'a respectful, factual 2-3 sentence summary of what is happening, based only on the given headline/summary', oracion: 'a 3-4 line Catholic intercessory prayer appropriate to the topic', emoji: 'one appropriate emoji'}"
            : "Eres un redactor católico que prepara una intención diaria de oración por el mundo, basada en noticias generales de actualidad (política, economía, relaciones internacionales, sociedad, desastres, etc. — no solo tragedias). Se te dará un titular de noticia REAL y VERIFICADO junto con su resumen, obtenidos de una API de noticias. NO inventes datos, cifras ni detalles adicionales — basa tu redacción estricta y únicamente en el titular y resumen dados. Escribe una intención de oración apropiada al tema real: si describe sufrimiento, ora por los afectados; si es sobre una decisión, negociación, elección o evento, ora por sabiduría, justicia y el bien común de los involucrados en vez de asumir víctimas. Responde SOLO con JSON válido, en español, sin bloques de código: {lugar: 'país o región mencionado en el titular', descripcion: 'un resumen respetuoso y factual de 2-3 frases sobre lo que está pasando, basado solo en el titular/resumen dado', oracion: 'una oración católica de intercesión de 3-4 líneas apropiada al tema', emoji: 'un emoji apropiado'}",
          messages: [{
            role: "user",
            content: `Titular verificado: "${newsData.titulo}". Resumen: "${newsData.resumen_original || ""}". Fuente: ${newsData.fuente || "desconocida"}.`
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      const intention = {
        titulo: newsData.titulo,
        lugar: parsed.lugar || "",
        descripcion: parsed.descripcion,
        oracion: parsed.oracion,
        emoji: parsed.emoji || "🙏",
        fuente: newsData.fuente || "",
        url: newsData.url || "",
        ...colors,
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(intention));
      setWorldIntention(intention);
    } catch {
      setWorldIntention(language === "en" ? {
        titulo: "A world in need of prayer",
        lugar: "",
        descripcion: "Today we couldn't reach the latest world news, but there is always a part of the world quietly suffering — waiting for someone to remember it in prayer.",
        oracion: "Lord of the nations, we lift up to you all who suffer today from war, disaster, hunger, or injustice, even those whose stories haven't reached us. Open our hearts to the suffering of the world and use us as instruments of your peace. Amen.",
        emoji: "🙏",
        fuente: "", url: "",
        ...colors,
      } : {
        titulo: "Un mundo que necesita oración",
        lugar: "",
        descripcion: "Hoy no pudimos obtener las últimas noticias del mundo, pero siempre hay una parte del mundo sufriendo en silencio — esperando que alguien la recuerde en oración.",
        oracion: "Señor de las naciones, te presentamos a todos los que hoy sufren por la guerra, el desastre, el hambre o la injusticia, incluso a quienes su historia no ha llegado hasta nosotros. Abre nuestro corazón al sufrimiento del mundo y úsanos como instrumentos de tu paz. Amén.",
        emoji: "🙏",
        fuente: "", url: "",
        ...colors,
      });
    }
  }

  async function fetchPracticeContent(index, practiceLabel, practiceSub) {
    const today = new Date().toDateString();
    const cacheKey = index + "-" + language + "-" + today;
    if (practiceCache.current[cacheKey]) {
      setPracticeAIContent(prev => ({ ...prev, [index]: practiceCache.current[cacheKey] }));
      return;
    }

    if (index === 1) {
      setLoadingPractice(true);
      try {
        let textoEvangelio = "";
        let referenciaEvangelio = language === "en" ? "Gospel of the day" : "Evangelio del día";

        const todayStr = new Date().toLocaleDateString(language === "en" ? "en-US" : "es-ES", { weekday: "long", day: "numeric", month: "long" });
        const userMsg = language === "en"
          ? (textoEvangelio
            ? "Today is " + todayStr + ". Gospel: " + referenciaEvangelio + ". Text: " + textoEvangelio.substring(0, 500) + ". Create a complete Lectio Divina with 4 steps (lectio, meditatio, oratio, contemplatio) based on this Gospel. Respond ONLY with valid JSON: {referencia, lectio, meditatio, oratio, contemplatio, palabra_clave}"
            : "Today is " + todayStr + ". Cycle A. Create a Lectio Divina of today's Gospel with 4 steps, in English. Respond ONLY with JSON: {referencia, lectio, meditatio, oratio, contemplatio, palabra_clave}")
          : (textoEvangelio
            ? "Hoy es " + todayStr + ". Evangelio: " + referenciaEvangelio + ". Texto: " + textoEvangelio.substring(0, 500) + ". Crea una Lectio Divina completa con 4 pasos (lectio, meditatio, oratio, contemplatio) basada en este evangelio. Responde SOLO con JSON valido: {referencia, lectio, meditatio, oratio, contemplatio, palabra_clave}"
            : "Hoy es " + todayStr + ". Ciclo A. Crea una Lectio Divina del evangelio de hoy con 4 pasos. Responde SOLO con JSON: {referencia, lectio, meditatio, oratio, contemplatio, palabra_clave}");

        const aiRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1500,
            system: language === "en"
              ? "You are Mater, a Catholic spiritual guide expert in Lectio Divina, faithful to the Benedictine tradition and to the Church's official teaching on the prayerful reading of Scripture (Verbum Domini by Benedict XVI). Your interpretation of the biblical text is based on traditional Catholic exegesis, not on speculative interpretations foreign to the Catholic faith. Precise Bible citations. You do not invent doctrines. Respond ONLY in valid JSON, in English, with no code blocks."
              : "Eres Mater, guia espiritual catolica experta en Lectio Divina, fiel a la tradicion benedictina y a la ensenanza oficial de la Iglesia sobre la lectura orante de la Escritura (Verbum Domini de Benedicto XVI). Tu interpretacion del texto biblico se basa en la exegesis catolica tradicional, no en interpretaciones especulativas o ajenas a la fe catolica. Citas biblicas precisas. No inventas doctrinas. Respondes SOLO en JSON valido sin bloques de codigo.",
            messages: [{ role: "user", content: userMsg }],
          }),
        });
        const aiData = await aiRes.json();
        const aiText = aiData.content?.map(b => b.text || "").join("") || "{}";
        const cleaned = aiText.replace(/```[\s\S]*?```/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        const lectioContentAI = language === "en" ? {
          santo: "Lectio Divina - " + (parsed.referencia || referenciaEvangelio),
          cita: "«" + (parsed.palabra_clave || "Abide in me") + "» — Word to carry with you today",
          reflexion: [t(language, "home_lectio_step_lectio"), (parsed.lectio || "Read today's Gospel slowly, twice."), t(language, "home_lectio_step_meditatio"), (parsed.meditatio || "What word resonates in your heart?"), t(language, "home_lectio_step_oratio"), (parsed.oratio || "Speak, Lord, your servant is listening."), t(language, "home_lectio_step_contemplatio"), (parsed.contemplatio || "Rest in silence with the Word you received.")].join("\n\n"),
          preguntas: [
            "What word from today's Gospel (" + (parsed.referencia || referenciaEvangelio) + ") caught your attention the most?",
            "What is God personally telling you through this text today?",
            "How can you bring the word «" + (parsed.palabra_clave || "love") + "» into your concrete life today?"
          ]
        } : {
          santo: "Lectio Divina - " + (parsed.referencia || referenciaEvangelio),
          cita: "«" + (parsed.palabra_clave || "Permaneced en mi") + "» — Palabra para llevar hoy",
          reflexion: [t(language, "home_lectio_step_lectio"), (parsed.lectio || "Lee el evangelio de hoy despacio, dos veces."), t(language, "home_lectio_step_meditatio"), (parsed.meditatio || "¿Que palabra resuena en tu corazon?"), t(language, "home_lectio_step_oratio"), (parsed.oratio || "Señor, habla que tu siervo escucha."), t(language, "home_lectio_step_contemplatio"), (parsed.contemplatio || "Quedate en silencio con la Palabra recibida.")].join("\n\n"),
          preguntas: [
            "¿Qué palabra del evangelio de hoy (" + (parsed.referencia || referenciaEvangelio) + ") te llamo mas la atencion?",
            "¿Que te dice Dios personalmente a traves de este texto hoy?",
            "¿Como puedes llevar la palabra «" + (parsed.palabra_clave || "amor") + "» a tu vida concreta hoy?"
          ]
        };
        practiceCache.current[cacheKey] = lectioContentAI;
        setPracticeAIContent(prev => ({ ...prev, [index]: lectioContentAI }));
      } catch(e) {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const stepLabels = [t(language, "home_lectio_step_lectio"), t(language, "home_lectio_step_meditatio"), t(language, "home_lectio_step_oratio"), t(language, "home_lectio_step_contemplatio")];
        const fallbacks = language === "en" ? [
          {
            santo: "St. Bernard of Clairvaux",
            cita: "«Whoever drinks of me will have within them a spring welling up to eternal life.»",
            reflexion: [stepLabels[0], "Read today's Gospel slowly, twice. The first time to understand. The second to feel. Let the words land within you unhurried.", stepLabels[1], "Is there a word or phrase that caught your attention? Stay with it. Repeat it like someone savoring something good. You don't need to understand it all — you need to let yourself be touched.", stepLabels[2], "Lord, thank you for speaking to me today through your Word. May it not stay only in my mind, but reach my hands and my decisions. Amen.", stepLabels[3], "Close your eyes for a moment. Do nothing. Just receive. The Word has already been sown — now let it germinate in silence."].join("\n\n"),
            preguntas: ["What word from today's Gospel stayed with you?", "What is God personally telling you through this text?", "How can you bring this Word into your concrete life today?"]
          },
          {
            santo: "St. Gregory the Great",
            cita: "«Sacred Scripture grows with the one who reads it.»",
            reflexion: [stepLabels[0], "Open today's Gospel and read it calmly. If you can, read it aloud — hearing the words with your ears helps receive them differently.", stepLabels[1], "Which character in today's Gospel draws your attention most? Which one do you identify with? Put yourself in their place and notice what you feel from there.", stepLabels[2], "Lord, your Word is living and active. Let what I read today not stay on the page but change something in me. Speak, I am listening.", stepLabels[3], "Stay a moment in silence with Jesus. No words. Just presence. He is here."].join("\n\n"),
            preguntas: ["Which character in today's Gospel do you identify with most — and why?", "What concrete action does today's text inspire in you?", "What would change in your day if you lived out what the Gospel proposes?"]
          },
          {
            santo: "St. Jerome",
            cita: "«To ignore Scripture is to ignore Christ.»",
            reflexion: [stepLabels[0], "Read today's Gospel three times. The first quickly. The second slowly. The third pausing on the phrase that catches your attention most.", stepLabels[1], "What surprises you about this text? Is there something you weren't expecting to find? Surprise is a sign that God is speaking where you least expected.", stepLabels[2], "Jesus, the same one who speaks in this Gospel is here with me now. I want to listen to you. I want your Word to change what needs to change in my life. I trust in you.", stepLabels[3], "Choose a single word from today's Gospel and carry it with you through the day. Let it be like a seed that keeps growing as you live."].join("\n\n"),
            preguntas: ["What surprised you about today's Gospel?", "Is there something in the text that troubles you — and what does that discomfort tell you?", "What is the word you will carry with you for the rest of the day?"]
          },
          {
            santo: "Father Joseph Kentenich",
            cita: "«The Word of God is the voice of the Mother who speaks to us through Scripture.»",
            reflexion: [stepLabels[0], "Read today's Gospel with Mary at your side. She was the first to receive the Word — in her heart before her ears. Ask her to help you listen as she did.", stepLabels[1], "Where does love appear in this Gospel? How does Jesus love in this passage? Whom does he love, and how? Stay with that image of love.", stepLabels[2], "Mary, help me receive this Word as you received it: with an open heart, without resistance, with a total yes. May your Fiat be mine too today.", stepLabels[3], "Imagine you are sitting next to Mary listening to Jesus. You are in good company. Rest there for a moment."].join("\n\n"),
            preguntas: ["How does Jesus love in today's Gospel — what gesture of love do you see?", "What does Mary teach you about how to receive the Word of God?", "How can you imitate that love today in your concrete life?"]
          },
          {
            santo: "St. Augustine of Hippo",
            cita: "«Our heart is restless until it rests in You.»",
            reflexion: [stepLabels[0], "Read today's Gospel unhurried. If you get distracted, return to the text without judging yourself. Faithfulness in Lectio is not perfect concentration — it is the desire to always come back.", stepLabels[1], "Is there a question today's Gospel awakens in you? Something you don't understand, something that provokes you, something you'd like to ask Jesus directly?", stepLabels[2], "Lord, I bring to today's Gospel my questions, my doubts, and my imperfect faith. I don't need to understand everything. I only need to trust that you are here and that your Word is good.", stepLabels[3], "Saint Augustine took decades to find rest in God. You have it available right now. Rest for a moment in the Lord who spoke to you today."].join("\n\n"),
            preguntas: ["What question does today's Gospel awaken in you?", "Is there something in the text you struggle with — something hard to accept or believe?", "What do you need to ask God after reading this Gospel?"]
          },
          {
            santo: "St. Teresa of Ávila",
            cita: "«Prayer is nothing but an intimate sharing between friends; it means taking time frequently to be alone with him who we know loves us.»",
            reflexion: [stepLabels[0], "Read today's Gospel as if it were the first time you're hearing it. Set aside what you already know. Come to the text with new eyes and a clean heart.", stepLabels[1], "What does this Gospel say about who God is? How does he reveal himself in this passage? How does that image of God change you?", stepLabels[2], "Lord, thank you for revealing to me today a little more of who you are. I want to know you more. I want our friendship to grow. May this Word be one more step on that path.", stepLabels[3], "Stay in silence with the image of God that today's Gospel gave you. Let that image settle into your heart."].join("\n\n"),
            preguntas: ["What does today's Gospel reveal about who God is?", "Does that image of God match the one you carry in your heart — or does it challenge you?", "How do you want your relationship with God to change based on what you read today?"]
          },
          {
            santo: "St. Francis of Assisi",
            cita: "«Preach the Gospel at all times; if necessary, use words.»",
            reflexion: [stepLabels[0], "Read today's Gospel slowly. After reading it, close your eyes and imagine the scene. Where is Jesus? What surrounds him? What do you hear, what do you feel?", stepLabels[1], "What is the smallest gesture of love in this Gospel? Francis said holiness lives in the details. What small detail of the text speaks to you today?", stepLabels[2], "Lord, make me an instrument of your peace. May what I read today in the Gospel not stay only in my prayer but go out into the streets in my actions. Amen.", stepLabels[3], "Imagine you are the bird Francis preached to. Receive the Good News without analysis, without judgment — only with the simple trust of one who knows they are loved."].join("\n\n"),
            preguntas: ["What is the smallest, most concrete gesture of love in today's Gospel?", "How can you bring that gesture into your life today — in a specific action?", "Is there someone specific to whom you can bring the Good News today?"]
          },
        ] : [
          {
            santo: "San Bernardo de Claraval",
            cita: "«El que bebe de Mí tendrá en sí mismo un manantial que salta hasta la vida eterna.»",
            reflexion: [stepLabels[0], "Lee el evangelio de hoy despacio, dos veces. La primera para entender. La segunda para sentir. Deja que las palabras aterricen en tu interior sin prisa.", stepLabels[1], "¿Hay una palabra o frase que te llamó la atención? Quédate con ella. Repítela como quien saborea algo bueno. No necesitas entenderlo todo — necesitas dejarte tocar.", stepLabels[2], "Señor, gracias por hablarme hoy a través de tu Palabra. Que no quede solo en mi mente, sino que baje a mis manos y a mis decisiones. Amén.", stepLabels[3], "Cierra los ojos un momento. No hagas nada. Solo recibe. La Palabra ya fue sembrada — ahora deja que germine en el silencio."].join("\n\n"),
            preguntas: ["¿Qué palabra del evangelio de hoy te quedó resonando?", "¿Qué te dice Dios personalmente a través de este texto?", "¿Cómo puedes llevar esta Palabra a tu vida concreta hoy?"]
          },
          {
            santo: "San Gregorio Magno",
            cita: "«La Sagrada Escritura crece con quien la lee.»",
            reflexion: [stepLabels[0], "Abre el evangelio de hoy y léelo con calma. Si puedes, léelo en voz alta — escuchar las palabras con los oídos ayuda a recibirlas de manera diferente.", stepLabels[1], "¿Qué personaje del evangelio de hoy te llama más la atención? ¿Con cuál te identificas? Ponte en su lugar y observa qué sientes desde ahí.", stepLabels[2], "Señor, tu Palabra es viva y activa. Haz que lo que leí hoy no se quede en el papel sino que cambie algo en mí. Habla, que te escucho.", stepLabels[3], "Quédate un momento en silencio con Jesús. Sin palabras. Solo presencia. Él está aquí."].join("\n\n"),
            preguntas: ["¿Con qué personaje del evangelio de hoy te identificas más — y por qué?", "¿Qué acción concreta te inspira el texto de hoy?", "¿Qué cambiaría en tu día si vivieras lo que el evangelio propone?"]
          },
          {
            santo: "San Jerónimo",
            cita: "«Ignorar la Escritura es ignorar a Cristo.»",
            reflexion: [stepLabels[0], "Lee el evangelio de hoy tres veces. La primera rápido. La segunda despacio. La tercera deteniéndote en la frase que más te llame la atención.", stepLabels[1], "¿Qué te sorprende de este texto? ¿Hay algo que no esperabas encontrar? La sorpresa es señal de que Dios está hablando donde menos lo esperabas.", stepLabels[2], "Jesús, el mismo que habla en este evangelio está aquí conmigo ahora. Quiero escucharte. Quiero que tu Palabra cambie lo que necesita cambiar en mi vida. Confío en ti.", stepLabels[3], "Elige una sola palabra del evangelio de hoy y llévala contigo durante el día. Que sea como una semilla que sigue creciendo mientras vives."].join("\n\n"),
            preguntas: ["¿Qué te sorprendió del evangelio de hoy?", "¿Hay algo en el texto que te incomoda — y qué te dice esa incomodidad?", "¿Cuál es la palabra que llevarás contigo el resto del día?"]
          },
          {
            santo: "Padre José Kentenich",
            cita: "«La Palabra de Dios es la voz de la Madre que nos habla a través de la Escritura.»",
            reflexion: [stepLabels[0], "Lee el evangelio de hoy con María a tu lado. Ella fue la primera en recibir la Palabra — en el corazón antes que en los oídos. Pídele que te ayude a escuchar como ella.", stepLabels[1], "¿Dónde aparece el amor en este evangelio? ¿Cómo ama Jesús en este pasaje? ¿A quién? ¿De qué manera? Quédate con esa imagen de amor.", stepLabels[2], "María, ayúdame a recibir esta Palabra como tú la recibiste: con el corazón abierto, sin resistencia, con un sí total. Que el Fiat de tu vida sea también el mío hoy.", stepLabels[3], "Imagina que estás sentado junto a María escuchando a Jesús. Estás en buena compañía. Descansa ahí un momento."].join("\n\n"),
            preguntas: ["¿Cómo ama Jesús en el evangelio de hoy — qué gesto de amor ves?", "¿Qué te enseña María sobre cómo recibir la Palabra de Dios?", "¿Cómo puedes imitar ese amor hoy en tu vida concreta?"]
          },
          {
            santo: "San Agustín de Hipona",
            cita: "«Nuestro corazón está inquieto hasta que descanse en Ti.»",
            reflexion: [stepLabels[0], "Lee el evangelio de hoy sin prisa. Si te distraes, vuelve al texto sin juzgarte. La fidelidad en la Lectio no es concentración perfecta — es el deseo de volver siempre.", stepLabels[1], "¿Hay alguna pregunta que el evangelio de hoy despierta en ti? ¿Algo que no entiendes, algo que te provoca, algo que quisieras preguntarle a Jesús directamente?", stepLabels[2], "Señor, traigo al evangelio de hoy mis preguntas, mis dudas y mi fe imperfecta. No necesito entender todo. Solo necesito confiar en que tú estás aquí y que tu Palabra es buena.", stepLabels[3], "San Agustín tardó décadas en encontrar el descanso en Dios. Tú lo tienes disponible ahora mismo. Descansa un momento en el Señor que te habló hoy."].join("\n\n"),
            preguntas: ["¿Qué pregunta te despierta el evangelio de hoy?", "¿Hay algo en el texto con lo que luchas — algo difícil de aceptar o de creer?", "¿Qué necesitas pedirle a Dios después de leer este evangelio?"]
          },
          {
            santo: "Santa Teresa de Ávila",
            cita: "«La oración no es otra cosa que un trato de amistad íntimo con quien sabemos que nos ama.»",
            reflexion: [stepLabels[0], "Lee el evangelio de hoy como si fuera la primera vez que lo escuchas. Deja de lado lo que ya sabes. Llega al texto con ojos nuevos y corazón limpio.", stepLabels[1], "¿Qué dice este evangelio sobre quién es Dios? ¿Cómo se revela a sí mismo en este pasaje? ¿Cómo te cambia esa imagen de Dios?", stepLabels[2], "Señor, gracias por revelarme hoy algo más de quién eres. Quiero conocerte más. Quiero que nuestra amistad crezca. Que esta Palabra sea un paso más en ese camino.", stepLabels[3], "Quédate en silencio con la imagen de Dios que el evangelio de hoy te regaló. Deja que esa imagen se asiente en tu corazón."].join("\n\n"),
            preguntas: ["¿Qué revela el evangelio de hoy sobre quién es Dios?", "¿Esa imagen de Dios coincide con la que llevas en tu corazón — o te desafía?", "¿Cómo quieres que cambie tu relación con Dios a partir de lo que leíste hoy?"]
          },
          {
            santo: "San Francisco de Asís",
            cita: "«Predica el Evangelio siempre; si es necesario, usa palabras.»",
            reflexion: [stepLabels[0], "Lee el evangelio de hoy lentamente. Después de leerlo, cierra los ojos e imagina la escena. ¿Dónde está Jesús? ¿Qué hay alrededor? ¿Qué se escucha, qué se siente?", stepLabels[1], "¿Cuál es el gesto más pequeño de amor en este evangelio? Francisco decía que la santidad vive en los detalles. ¿Qué detalle pequeño del texto te habla hoy?", stepLabels[2], "Señor, haz de mí un instrumento de tu paz. Que lo que leí hoy en el evangelio no quede solo en mi oración sino que salga a las calles en mis acciones. Amén.", stepLabels[3], "Imagina que eres el pájaro al que Francisco predicó. Recibe la Buena Noticia sin análisis, sin juicio — solo con la confianza simple de quien sabe que es amado."].join("\n\n"),
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

  const practiceContent = language === "en" ? [
    {
      icon: "moon", color: C.blue, bg: C.iceBlue,
      label: "Morning Prayer", sub: "Prayer to start the day · 5 min",
      saint: "St. John of the Cross",
      saintQuote: "«At the beginning of the morning, before the soul occupies itself with anything, let it consecrate to God the first movement of the heart.»",
      reflection: `Lauds — the Church's morning prayer — is a theological statement: before the world claims me, I belong to God.\n\nSaint Benedict taught that the monk's first work each morning should be prayer, not because God needs it, but because the soul needs it.\n\nThe person who prays in the morning carries throughout the day an inner stillness that doesn't depend on circumstances. Saint Teresa of Ávila called this "the soul's Archimedean point."\n\nToday, before checking your phone, dedicate these minutes to consecrating the day to God. Saint John Vianney said it was enough to "look at God and let God look at you."`,
      questions: ["How do I arrive at this new day — with gratitude, with anxiety, in a rush?", "Is there something I want to specifically hand over to God this morning?", "What concrete grace do I need today?"],
    },
    {
      icon: "book", color: C.navy, bg: "#DDE8F2",
      label: "Lectio Divina", sub: "Daily Lectio Divina",
      saint: "St. Bernard of Clairvaux",
      saintQuote: "«The river that does not return to its spring dries up.»",
      reflection: `The scene at Bethany is one of the most charged with tension and grace in the whole Gospel. Martha rushes in, her hands full and her heart preoccupied. Mary is sitting at Jesus's feet.\n\nJesus says something that has unsettled active Christians for two millennia: "Mary has chosen the better part."\n\nThis is not a condemnation of work. What Jesus points to is a priority: listen first, then act. Be first, then do.\n\nLectio Divina is the art of sitting with Mary while the world shouts with Martha.`,
      questions: ["Do I identify more with Martha or with Mary at this moment?", "Is there a Word God has been wanting to tell me?", "What would happen if I dedicated 15 minutes a day to listening to God?"],
    },
    {
      icon: "heart", color: C.periwinkle, bg: "#E4EDF7",
      label: "Examination of Conscience", sub: "Examination of conscience",
      saint: "St. Ignatius of Loyola",
      saintQuote: "«The examination of conscience is not a spiritual accounting of sins. It is learning to read life as God reads it.»",
      reflection: `Saint Ignatius considered the Examen the most important practice of the spiritual life. It is not a list of sins — it is learning to see one's own life through God's eyes.\n\nIts five steps: gratitude, asking for light, reviewing the day, acknowledgment, and resolve.\n\nWhat makes the Ignatian Examen unique is that it doesn't separate the "spiritual" from the "everyday." God is in the difficult meeting, in the tense conversation, in the tiredness at the end of the day.\n\nThe Examen trains us to recognize that presence where we least expect it.`,
      questions: ["For what three moments of today can I give thanks to God?", "When did I feel the greatest inner peace? And when the greatest distance from God?", "Is there something I want to live differently tomorrow?"],
    },
  ] : [
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
  const saintColor = getLiturgicalColor(saintOfDay?.color, saintOfDay?.rankNum);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.home, paddingBottom: 90 }}>
      {openCard !== null && (
        <div style={sheetOverlay} onClick={() => setOpenCard(null)}>
          <div onClick={e => e.stopPropagation()} style={sheetCard()}>
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
                <p style={{ color: C.slateLight, fontSize: 14 }}>{t(language, "home_preparing_reflection")}</p>
              </div>
            ) : (
              <>
                <div style={{ background: practiceContent[openCard].bg, borderRadius: 14, padding: "14px 16px", marginBottom: 20, borderLeft: `3px solid ${practiceContent[openCard].color}` }}>
                  <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, margin: "0 0 6px", lineHeight: 1.6 }}>{practiceAIContent[openCard]?.cita || practiceContent[openCard].saintQuote}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: practiceContent[openCard].color, margin: 0 }}>{practiceAIContent[openCard]?.santo || practiceContent[openCard].saint}</p>
                </div>
                <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 24px", whiteSpace: "pre-line" }}>{practiceAIContent[openCard]?.reflexion || practiceContent[openCard].reflection}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: practiceContent[openCard].color, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>{t(language, "home_questions_to_pray")}</p>
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
                {t(language, "home_amen_done")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 11, color: C.inkLight, margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {(() => { const h = new Date().getHours(); return h < 12 ? t(language, "home_greeting_morning") : h < 18 ? t(language, "home_greeting_afternoon") : t(language, "home_greeting_evening"); })()}
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
            <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, margin: 0 }}>{t(language, "home_verse_of_day")}</p>
            <button onClick={() => shareContent(dailyVerse?.text + " — " + dailyVerse?.ref + "\n\nCompartido desde Mater 🙏")} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "4px 10px", color: C.cream, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <span>📤</span> {t(language, "home_share")}
            </button>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 10px", fontFamily: "'Cormorant Garamond', serif" }}>{dailyVerse?.text}</p>
          <p style={{ fontSize: 10, opacity: 0.6, margin: 0, letterSpacing: "0.06em" }}>{dailyVerse?.ref}</p>
        </div>

        {saintOpen && saintOfDay && (
          <div style={sheetOverlay} onClick={() => setSaintOpen(false)}>
            <div onClick={e => e.stopPropagation()} style={sheetCard()}>
              <div style={{ height: 5, borderRadius: 4, background: saintColor.hex, border: saintColor.border ? `1px solid ${C.mist}` : "none", marginBottom: 16 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>✨ {t(language, "home_saint_of_day")}</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, color: C.inkMid, background: C.fog, borderRadius: 20, padding: "2px 8px" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: saintColor.hex, border: saintColor.border ? `1px solid ${C.mist}` : "none", flexShrink: 0 }} />
                      {t(language, saintColor.key)}
                    </span>
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{saintOfDay.nombre}</p>
                  {saintOfDay.siglo && <p style={{ fontSize: 11, color: C.slateLight, margin: "2px 0 0" }}>{saintOfDay.siglo}</p>}
                </div>
                <button onClick={() => setSaintOpen(false)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
              </div>
              <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 20px", whiteSpace: "pre-line" }}>{saintOfDay.historia}</p>
              <div style={{ background: C.iceBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 16, borderLeft: `3px solid ${saintColor.hex}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, margin: "0 0 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "home_saint_prayer")}</p>
                <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, lineHeight: 1.7, margin: 0 }}>{saintOfDay.oracion}</p>
              </div>
              <div style={{ background: C.fog, borderRadius: 12, padding: "12px 14px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, margin: "0 0 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "home_saint_fact")}</p>
                <p style={{ fontSize: 12, color: C.inkMid, lineHeight: 1.65, margin: 0 }}>{saintOfDay.dato}</p>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => setSaintOpen(true)} style={{ marginTop: 12, width: "100%", borderRadius: 12, background: C.cream, border: `1px solid ${C.mist}`, borderLeft: `3px solid ${saintColor.hex}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
          <span style={{ fontSize: 24 }}>✨</span>
          <div style={{ flex: 1 }}>
            {loadingSaint ? (
              <p style={{ fontSize: 13, color: C.slateLight, margin: 0 }}>{t(language, "home_saint_loading")}</p>
            ) : saintOfDay ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 2px" }}>
                  <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{t(language, "home_saint_of_day")}</p>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: saintColor.hex, border: saintColor.border ? `1px solid ${C.mist}` : "none", flexShrink: 0 }} title={t(language, saintColor.key)} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>{saintOfDay.nombre}</p>
              </>
            ) : (
              <p style={{ fontSize: 13, color: C.slateLight, margin: 0 }}>{t(language, "home_saint_of_day")}</p>
            )}
          </div>
          <Icon name="chevron" size={16} color={C.gold} />
        </button>
      </div>

      <div style={{ padding: "22px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.inkLight, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t(language, "home_weekly_rhythm")}</p>
          <span style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>{streakCount} {streakCount === 1 ? t(language, "home_day_singular") : t(language, "home_days_plural")}</span>
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
        <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: "0 0 12px" }}>{t(language, "home_today_practices")}</p>
        <div style={{ display: "grid", gridTemplateColumns: columns > 1 ? "1fr 1fr" : "1fr", gap: 10 }}>
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

      <div style={{ padding: "22px 22px 0" }}>
        {intentionOpen && worldIntention && (
          <div style={sheetOverlay} onClick={() => setIntentionOpen(false)}>
            <div onClick={e => e.stopPropagation()} style={sheetCard()}>
              <div style={{ borderRadius: 16, background: "linear-gradient(135deg, " + (worldIntention.color1 || "#1a3a5c") + ", " + (worldIntention.color2 || "#2d6a8f") + ")", padding: "20px", marginBottom: 20, textAlign: "center" }}>
                <p style={{ fontSize: 40, margin: "0 0 8px" }}>{worldIntention.emoji}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>{worldIntention.lugar}</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{worldIntention.titulo}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>{t(language, "home_world_intention")}</p>
                <button onClick={() => setIntentionOpen(false)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>x</button>
              </div>
              <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 20px" }}>{worldIntention.descripcion}</p>
              <div style={{ background: C.iceBlue, borderRadius: 14, padding: "16px", borderLeft: "3px solid " + (worldIntention.color1 || C.navy) }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: worldIntention.color1 || C.navy, margin: "0 0 10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "home_world_intention_prayer")}</p>
                <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, lineHeight: 1.8, margin: 0 }}>{worldIntention.oracion}</p>
              </div>
              {worldIntention.fuente && (
                <p style={{ fontSize: 10, color: C.slateLight, margin: "12px 0 0", textAlign: "right" }}>
                  {t(language, "home_world_intention_source")}: {worldIntention.fuente}
                  {worldIntention.url && (
                    <> · <a href={worldIntention.url} target="_blank" rel="noopener noreferrer" style={{ color: C.slateLight }}>{t(language, "home_world_intention_read_more")}</a></>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
        <button onClick={() => setIntentionOpen(true)} style={{ width: "100%", borderRadius: 16, overflow: "hidden", cursor: "pointer", border: "none", padding: 0, textAlign: "left" }}>
          <div style={{ background: "linear-gradient(135deg, " + (worldIntention && worldIntention.color1 ? worldIntention.color1 : "#1a3a5c") + ", " + (worldIntention && worldIntention.color2 ? worldIntention.color2 : "#2d6a8f") + ")", padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{worldIntention ? worldIntention.emoji : "🌍"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 2px" }}>{t(language, "home_world_intention")}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{worldIntention ? worldIntention.titulo : t(language, "home_loading")}</p>
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
            <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>{t(language, "home_talk_to_sofia")}</p>
            <p style={{ fontSize: 11, color: C.inkLight, margin: "2px 0 0" }}>{t(language, "home_talk_to_sofia_sub")}</p>
          </div>
          <Icon name="chevron" size={18} color={C.blue} />
        </button>
      </div>
    </div>
  );
}

const SYSTEM_PROMPT = `Eres Sofía, una guía de coaching espiritual católico para jóvenes y adultos católicos. Tu nombre evoca la sabiduría (del griego "sophia") iluminada por la fe..

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

function ChatScreen({ user, language }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: t(language, "chat_greeting") },
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
      const languageInstruction = language === "en" ? "\n\nAlways respond in English." : "\n\nResponde siempre en español.";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + languageInstruction,
          messages: newMessages.map(m => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.map(b => b.text || "").join("") || "...";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: t(language, "chat_error") }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: gradients.chat }}>
      <div style={{ padding: "52px 22px 16px", background: C.cream, borderBottom: `1px solid ${C.mist}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, overflow: "hidden" }}>
            <img src="/logo.jpeg" alt="Sofía" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}>Sofía</p>
            <p style={{ fontSize: 11, color: C.sky, margin: 0, fontWeight: 600 }}>{t(language, "chat_status")}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12, animation: "fadeIn 0.2s ease" }}>
            {m.role === "assistant" && (
              <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, overflow: "hidden", marginRight: 8, alignSelf: "flex-end" }}>
                <img src="/logo.jpeg" alt="Sofía" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
          {[t(language, "chat_suggestion_1"), t(language, "chat_suggestion_2"), t(language, "chat_suggestion_3")].map((s, i) => (
            <button key={i} onClick={() => setInput(s)} style={{ background: C.white, border: `1.5px solid ${C.mist}`, borderRadius: 100, padding: "6px 12px", fontSize: 11, color: C.blue, fontWeight: 600, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 16px 80px", background: C.cream, borderTop: `1px solid ${C.mist}`, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={t(language, "chat_placeholder")}
          style={{ flex: 1, border: "1px solid " + C.mist, outline: "none", background: C.fog, borderRadius: 12, padding: "11px 14px", fontSize: 16, color: C.ink, fontFamily: "'DM Sans', system-ui, sans-serif" }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: input.trim() ? C.navy : C.mist, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", flexShrink: 0 }}>
          <Icon name="send" size={16} color={C.cream} />
        </button>
      </div>
    </div>
  );
}

function PlanScreen({ user, language }) {
  const { isTablet, columns } = useViewportInfo();
  const sheetOverlay = { position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: isTablet ? "center" : "flex-end", justifyContent: "center", padding: isTablet ? 24 : 0 };
  const sheetCard = (extra = {}) => ({ background: C.white, borderRadius: isTablet ? 24 : "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: isTablet ? 480 : 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto", ...extra });
  const [activeWeek, setActiveWeek] = useState(0);
  const [progress, setProgress] = useState({});
  const [saving, setSaving] = useState(null);
  const [openDay, setOpenDay] = useState(null);
  const [dayContent, setDayContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const contentCache = useRef({});

  function getStaticDayContent(weekIdx, dayIdx) {
    const allContentEs = [
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
    const allContentEn = [
      [
        { santo: "St. Augustine of Hippo", cita: "«You made us for Yourself, Lord, and our heart is restless until it rests in You.»", reflexion: "Who is God for you today — not the God of your childhood or of books, but the God who seeks you at this precise moment of your life?\n\nSaint Augustine spent decades searching in the wrong places: in philosophy, in pleasure, in intellectual power. And when he finally surrendered, he discovered that God was not the end of a long road but the very ground he had always walked on.\n\nThis question has no easy answer, and that is precisely its value. The spiritual life begins when we stop describing God and start listening to him.\n\nYou don't need to have everything figured out. You need to be willing to be surprised by a God who is always bigger, closer, and more loving than you imagine.", preguntas: ["What image of God do you carry with you today — and where does that image come from?", "In what area of your life do you feel God is knocking at the door?", "What would you need to let go of to meet God in a more real way?"] },
        { santo: "St. Teresa of Ávila", cita: "«Let nothing disturb you, let nothing frighten you. All things are passing. God never changes.»", reflexion: "Psalm 139 is one of the most intimate prayers in all of Scripture. It is not a hymn of distant praise — it is the wonder of someone who discovers they were known before they knew themselves.\n\n'You search me and you know me... You perceive my thoughts from afar.' There is something in these words that can frighten: there is nowhere to hide. But there is also something profoundly liberating: you don't need to pretend before God.\n\nSaint Teresa of Ávila spent years praying in fear that God would see her inner self. Until one day she understood that God had already seen it all — and loved her exactly as she was.\n\nToday, Psalm 139 invites you to stop presenting God with the edited version of yourself. He already knows the drafts. And he loves them all.", preguntas: ["Is there a part of you that you feel you cannot show God?", "How does your prayer change when you know God already knows you completely?", "What does it mean to you to be known and loved at the same time?"] },
        { santo: "St. John of the Cross", cita: "«Whoever knows how to die to everything will have life in everything.»", reflexion: "Prayer is not a spiritual monologue. It is not talking to an empty ceiling or repeating formulas that once had life. Prayer, at its deepest essence, is a conversation between two who love each other.\n\nSaint John of the Cross taught that the greatest obstacle to prayer is not distraction — it is the illusion that we have to produce something in the silence.\n\nIn the Carmelite tradition, prayer is understood as an exchange of friendship. You don't need special vocabulary or mystical states. You need the same thing as in any deep friendship: honest presence and real time.\n\nToday, before speaking to God, sit in silence for a moment and let Him speak first. The most transformative conversation you can have today won't be with any human being.", preguntas: ["When was the last time you felt your prayer was truly a conversation?", "What is harder for you in prayer: speaking or listening?", "What would you say to God today if you knew he was listening to you completely?"] },
        { santo: "St. Augustine of Hippo", cita: "«Late have I loved you, beauty so old and so new, late have I loved you.»", reflexion: "Saint Augustine's Confessions is the first great book of spiritual psychology in history. In it, Augustine not only narrates his conversion — he narrates the inner map of a soul seeking God without knowing it is seeking him.\n\nWhat makes Augustine unique is his radical honesty. He does not edit his sins or soften his failures. He exposes them with the same precision with which he exposes God's grace. And from that contrast is born a theology of love that remains revolutionary.\n\n'You made us for Yourself' — this phrase is not just a theological statement. It is the diagnosis of all human restlessness. The desire that is never fully satisfied, the search that ends in no human conquest — all of that is the trace of God in the soul.\n\nToday, find your own story in Augustine. He wrote for you, even though he didn't know you.", preguntas: ["Where have you sought to fill a void that only God can fill?", "Which phrase of Saint Augustine's resonates most with your current experience?", "How would you describe your own spiritual 'search' up to today?"] },
        { santo: "St. John of the Cross", cita: "«In the silence God spoke to my soul things that cannot be said.»", reflexion: "We live in a civilization terrified of silence. We fill every pause with music, notifications, background noise. As if silence were a threat instead of an invitation.\n\nSaint John of the Cross spent months in a dark cell in Toledo, a prisoner of his own order. And it was in that forced silence that he wrote some of the most luminous poems in Spanish literature. Silence did not crush him — it purified him.\n\nTen minutes of contemplative silence is not new age meditation. It is returning to the source. It is remembering who you are when no one is watching and you have nothing to prove.\n\nToday, find a place without screens and without noise. Sit down. Breathe. Don't try to think about God — simply let God think about you.", preguntas: ["What do you feel when you are in silence — peace, anxiety, boredom?", "What do you think you would find if you stayed in silence with God for ten minutes?", "What noise in your inner life do you need to turn off before you can listen?"] },
        { santo: "St. Ignatius of Loyola", cita: "«It is not knowing much, but feeling and relishing things interiorly, that contents and satisfies the soul.»", reflexion: "The Ignatian Examen is not an inventory of sins. Saint Ignatius designed it as a practice of recognition — learning to see God's hand in the ordinary texture of the days.\n\nThe week ending today was a tapestry of moments. Some bright, some dark, some so ordinary that we let them pass without looking at them. The Examen invites you to look back with new eyes.\n\nWhere was God in that difficult conversation? What did he want to tell you in that moment of unexpected joy? What inner movement did you notice when you made that decision?\n\nThe weekly Examen doesn't seek perfection — it seeks awareness. An aware soul is a free soul. And a free soul can love without fear.", preguntas: ["At what moment this week did you feel the greatest consolation — peace, joy, love?", "At what moment did you feel the greatest desolation — emptiness, anxiety, distance from God?", "What pattern do you notice in your inner life when you look at the whole week?"] },
        { santo: "St. Pius X", cita: "«The Mass is the most perfect prayer there is, because in it Jesus himself prays with us and for us.»", reflexion: "Sunday Mass is not a religious obligation to fulfill — it is a date of love that God has placed at the heart of the week. A moment where ordinary time breaks open and eternity enters.\n\nSaint Pius X understood the Mass as the most revolutionary act a human being can perform: participating in the offering Christ makes of himself to the Father. Not as a spectator, but as part of the Body.\n\nToday, enter the Mass with a single intention: to be truly present. Present in the Kyrie, in the Word, in the silence after Communion.\n\nThe Mass changes you when you let it in. And it is let in by whoever comes with an open heart and empty hands.", preguntas: ["What part of today's Mass spoke to you most directly?", "What do you offer at this Mass — what do you place on the altar together with the bread and wine?", "How do you want this Mass to change the week that begins?"] },
      ],
      [
        { santo: "St. Bernard of Clairvaux", cita: "«Whoever drinks of me will have within them a spring welling up to eternal life.»", reflexion: "The Samaritan woman came to Jacob's well at midday — the hour when no one went, so as not to run into anyone. She carried a story she preferred to carry alone. And it was there, in her moment of greatest loneliness, that she found Jesus.\n\nJesus asks her for water, but offers her something else: 'If you knew the gift of God.' The most important conversation of her life began with an ordinary gesture and ended with a revelation that changed an entire city.\n\nSaint Bernard meditated deeply on this passage. What amazed him most was Jesus's tenderness: he does not judge the woman, does not list her sins. He woos her with a promise: there is a water that truly satisfies.\n\nToday, what wells are you drinking from? Which ones truly satisfy you, and which ones leave you thirstier?", preguntas: ["Which aspects of the Samaritan woman do you identify with most?", "What 'wells' do you visit when you have an inner thirst — work, relationships, screens?", "What would the 'living water' Jesus offers you today be for you?"] },
        { santo: "St. Teresa of Ávila", cita: "«The soul is like a castle made of a single diamond, in which there are many dwelling places.»", reflexion: "Saint Teresa of Ávila wrote The Interior Castle in a state of prayer so deep that, according to her contemporaries, she barely touched the ground while writing. It was no exaggeration: Teresa had learned to live from the inside out.\n\nThe interior castle is a bold metaphor: the human soul is not a small room but a palace with seven dwelling places. Most people live in the entryway, unaware of the richness inside.\n\nTeresa teaches that the interior life is not for contemplatives with free time — it is for anyone who decides to take seriously the question of who they are.\n\nToday, which dwelling place of your interior castle are you living in? Are there doors you haven't dared to open?", preguntas: ["What do you discover when you stay in silence and look within?", "Which 'room' of your interior do you feel God wants to explore with you?", "What keeps you from going deeper into your interior life?"] },
        { santo: "St. Teresa of Ávila", cita: "«Whoever has God lacks nothing. God alone suffices.»", reflexion: "The Our Father is the most prayed prayer in human history. And also, paradoxically, one of the least understood. We repeat it so often that we stop listening to it.\n\nJesus did not give this prayer for us to recite — he gave it for us to inhabit. 'Father' — already in the first word there is a revolution. Not 'King,' not 'Judge.' Someone close, who knows your needs before you say them.\n\n'Your will be done' — three words that sum up all of Christian spirituality. Not resignation, but the greatest freedom: trusting that God's will is better than mine.\n\n'Our daily bread' — God doesn't ask you to plan for five years. He asks you to trust for today. Only for today. That is already enough.", preguntas: ["Which phrase of the Our Father do you find hardest to pray sincerely?", "What does it mean to you to call God 'Father' — what does that word evoke?", "How would your day change if you prayed the Our Father one phrase at a time, in silence?"] },
        { santo: "St. Ignatius of Loyola", cita: "«In time of desolation, never make a change; in time of consolation, prepare for future desolation.»", reflexion: "Ignatian discernment is one of the most practical gifts the Church has given to the spiritual life. It is not mysticism reserved for contemplatives — it is a tool for anyone who wants to make decisions from God.\n\nSpiritual movements are the inner motions of the soul: thoughts, feelings, impulses, resistances. Ignatius taught us to read these movements like a sacred text.\n\nConsolation does not mean feeling good — it means moving toward God, toward love, toward deep peace. Desolation does not mean feeling bad — it means moving away from God, even with a smile on your face.\n\nLearning to distinguish these movements is learning the language in which God speaks to you. And like any language, it requires practice, patience, and a good teacher.", preguntas: ["What important decision do you have ahead of you, and how do you feel inwardly when you think about it?", "Can you identify a consolation and a desolation from this week?", "What 'spirit' do you think is behind the strongest impulses you feel right now?"] },
        { santo: "St. Francis of Assisi", cita: "«Preach the Gospel at all times; if necessary, use words.»", reflexion: "The body is not an obstacle to prayer — it is an ally. The great spiritual traditions have always known this: the posture you take in prayer is not indifferent, because we are embodied beings and we pray with all that we are.\n\nSaint Francis prayed outdoors, arms outstretched in a cross, kneeling on the damp earth. His prayer was physical because his faith was physical — embodied, concrete, real.\n\nToday, experiment with posture in prayer. Place a hand over your heart and feel your own heartbeat. Breathe consciously: as you inhale, receive God's love; as you exhale, release what you don't need to carry.\n\nThe body remembers what the mind forgets. A knee on the ground can tell God what words cannot reach.", preguntas: ["What bodily posture helps you most to enter into prayer?", "How does your physical environment affect your ability to pray?", "What would your body say to God today if it could speak?"] },
        { santo: "St. Ignatius of Loyola", cita: "«Few people realize what God would make of them if they abandoned themselves entirely into his hands.»", reflexion: "The second week has been an immersion into the interior life. You have contemplated the Samaritan woman's well, explored Teresa's castle, learned the language of spiritual movements.\n\nToday's weekly Examen doesn't seek to evaluate your spiritual 'performance.' It seeks something more delicate: recognizing God's movement in the details of the week.\n\nWas there a moment when you felt something opening inside you? A conversation, an unexpected pause? Was there a moment when you felt resistance to something God was asking of you?\n\nThe interior life is not measured in extraordinary experiences. It is measured in the quality of attention you give to the ordinary.", preguntas: ["Which practice this week touched your interior life most deeply?", "What spiritual resistance did you encounter this week — and what does that tell you?", "What does God want you to carry from this week into the next?"] },
        { santo: "St. John Paul II", cita: "«Be not afraid to be saints. Have the ambition to be great saints.»", reflexion: "Today's Mass closes a week of interiority. And there is something profoundly beautiful in that: the interior life does not end in itself — it flows into community, into the Eucharist, into the gathered Body of Christ.\n\nSaint John Paul II celebrated Mass with a concentration that amazed those who knew him. It was the fruit of decades of interior life brought to the altar.\n\nToday, bring to Mass everything you have explored this week. Bring the unanswered questions, the consolations you received, the resistances you encountered. Place it all in the offertory.\n\nThe Eucharist is not the end of the interior life — it is its heart. Here, in this broken bread, is the same God you found in the silence of your week.", preguntas: ["What do you bring to the altar today as a personal offering?", "How has your way of participating in Mass changed after this week?", "What specific grace do you want to ask God for in today's Communion?"] },
      ],
      [
        { santo: "Father Joseph Kentenich", cita: "«God wants us to be instruments in Mary's hands for the renewal of the world.»", reflexion: "On October 18, 1914, a group of young seminarians gathered in a small chapel in Schoenstatt, Germany. Father Joseph Kentenich invited them to do something bold: offer themselves to Mary as instruments for the renewal of the Church and the world.\n\nNo one that day imagined that such a small gesture would give rise to a movement that would reach every continent. But Kentenich understood something the great spiritual strategists have always known: God works from the small.\n\nThe Schoenstatt charism is not just another Marian devotion — it is a pedagogy of life. Kentenich wanted to form 'new men and women for a new world': people with a personality so rooted in God that they could transform their surroundings from within.\n\nToday, get to know the origins of Schoenstatt not as history but as invitation. What does it mean for you to be Mary's instrument in your own time and place?", preguntas: ["What draws you to the Schoenstatt charism — what resonates with you?", "In what 'small chapel' of your life is God doing something great?", "How do you understand the idea of being an 'instrument' — not a tool but a free collaborator?"] },
        { santo: "Father Joseph Kentenich", cita: "«The covenant of love is a total yes given in complete freedom, not once but every day.»", reflexion: "The covenant of love with Mary is the heart of the Schoenstatt charism. It is not a consecration made once and forgotten — it is a living relationship renewed every day.\n\nKentenich understood the relationship with Mary as a true relationship of filial love. Mary is not a channel of graces or a miracle machine — she is a real Mother who is personally involved in the lives of her children.\n\nThe covenant has two movements: the contribution — what you bring to the shrine, your struggles, your talents, your love — and the capital of graces — what Mary contributes from her fullness.\n\nToday, renew your covenant of love with Mary. A heart that says 'yes' with freedom and love is all the prayer Mary needs.", preguntas: ["What does it mean to you to have Mary as Mother in your spiritual life?", "What do you bring to the covenant — what is your 'contribution' today?", "In what area of your life do you especially need Mary's motherhood?"] },
        { santo: "Father Joseph Kentenich", cita: "«The shrine is the home of the soul, the place where Mary awaits us as Mother.»", reflexion: "Every Schoenstatt shrine in the world is a replica of the original small chapel in Germany. Not out of architectural nostalgia, but out of theological conviction: Mary chose that place to make her home, and where she dwells, she transforms.\n\nKentenich spoke of the shrine as a 'spiritual home' — a concept that touches something very deep in the human heart. We all need a place where we are received without conditions, where we don't have to pretend.\n\nThe shrine is not geographic magic. It is the meeting point between Mary's faithfulness and the soul's freedom.\n\nToday, if you can, visit a shrine. If not, create a sacred space within you where Mary can find you. The true shrine is first in the heart.", preguntas: ["Do you have a 'sacred place' where you meet God — physical or interior?", "What would it mean to you to have a spiritual home to return to every day?", "What do you bring to the shrine today — what do you need to leave in Mary's hands?"] },
        { santo: "Father Joseph Kentenich", cita: "«The contribution is not a payment — it is a gesture of love from a child to their Mother.»", reflexion: "The contribution is one of the most original concepts of Schoenstatt spirituality. Kentenich proposed that members of the Movement 'contribute' to the shrine's capital of graces — not with money but with lived love.\n\nEvery faithful prayer, every small sacrifice, every act of daily love consciously offered to Mary becomes spiritual capital that she administers with maternal wisdom.\n\nWhat is revolutionary about this idea is that nothing in your life is left out. The difficult moment at work, the patience with someone who irritates you, the joy you share — all of it can be a contribution if you offer it with love.\n\nToday, choose an ordinary moment of your day and consciously offer it to Mary. That small gesture has a spiritual weight you cannot yet see.", preguntas: ["What moment of your day today can you turn into a contribution to Mary?", "How does your perspective on difficulties change when you offer them as a contribution?", "What is harder for you to contribute — the difficult moments or the joyful ones?"] },
        { santo: "Father Joseph Kentenich", cita: "«To be an instrument does not mean losing your personality but finding it fully.»", reflexion: "The image of the instrument can sound passive, even alienating. But Kentenich understood exactly the opposite: the instrument in Mary's hands is someone who has found their deepest vocation and lives it with greater freedom.\n\nA violin does not lose its being when it is in the hands of a great musician — it fulfills itself fully. Its deepest resonances flourish in collaboration with the performer.\n\nTo be Mary's instrument means letting her work through your gifts, your character, your history — all that you are. She does not ask you to erase yourself but to make yourself available.\n\nToday, ask yourself: in what area of your life does Mary want to be Mother and guide? Where do you need her maternal wisdom to be more fully who God intended you to be?", preguntas: ["In what areas of your life do you feel Mary wants to be your guide?", "What talents of yours could be instruments in her hands?", "What would it mean to 'surrender' to Mary — not passively but with active love?"] },
        { santo: "Father Joseph Kentenich", cita: "«The Schoenstatt Movement is a movement of the Holy Spirit through Mary.»", reflexion: "The third week has been an immersion into Schoenstatt's Marian spirituality. You have gotten to know Kentenich, renewed the covenant, visited the shrine in your heart, learned the logic of the contribution.\n\nNow is the time to make the examen with Marian eyes: where have you felt Mary's presence and love this week?\n\nKentenich said that Mary's 'seal' on the soul is not seen from outside — it is felt from within. It is a certain tenderness toward people, a peace that doesn't depend on circumstances, a growing inner freedom.\n\nToday, review your week looking for that seal. And if you don't find it easily, ask Mary to teach you to see it.", preguntas: ["Where did you feel Mary's presence this week — even if subtly?", "What aspect of the Schoenstatt charism do you want to bring into your daily life?", "How has your relationship with Mary changed after this week?"] },
        { santo: "Blessed Emilia Engel", cita: "«Everything for Mary, with Mary, in Mary, and through Mary toward God.»", reflexion: "Today's Mass is the culmination of a Marian week. And there is something profoundly beautiful in that: Mary always leads to Jesus. At Cana, at Bethlehem, at Calvary — Mary always points toward her Son.\n\nConsecration to Mary does not turn our gaze away from Christ — it focuses it. Mary is the surest path to Jesus because she knows him better than anyone. She was the first to receive him, the first to contemplate him, the first to follow him to the cross.\n\nBlessed Emilia Engel, one of the first women to receive the Schoenstatt charism, said that consecration to Mary was like placing Jesus's hands in his Mother's hands.\n\nToday, as you receive the Eucharist, tell Mary: 'You receive him, for you know how to receive him better than I do.'", preguntas: ["How has this week of Marian spirituality enriched your relationship with Jesus?", "What do you want to consecrate to Mary today — what area of your life do you place in her hands?", "What specific grace do you ask Mary for the coming week?"] },
      ],
      [
        { santo: "St. Francis Xavier", cita: "«I would give a thousand lives to save a single soul.»", reflexion: "Vocation is not a position — it is a calling. And God's call rarely comes with detailed instructions and guarantees of success. It comes as a restlessness that doesn't go away, as a desire that persists despite everything.\n\nSaint Francis Xavier was a brilliant young man with a promising academic future when Ignatius of Loyola asked him: 'What does it profit a man to gain the whole world if he loses his soul?' That question changed everything.\n\nVocation is not always dramatic. For most people, God's call comes through what they love most, what pains them most in the world, and what gives them the most life when they do it.\n\nToday, don't look for certainties — look for clues. What gives you life? What injustice can you not ignore? In what moments do you feel most fully yourself?", preguntas: ["What gives you the most life when you do it — what activity, what service, what relationship?", "Is there a call you feel but have been saying 'no' to out of fear?", "How would you describe your vocation at this moment in your life — even with uncertainty?"] },
        { santo: "St. Francis of Assisi", cita: "«Start by doing what's necessary, then what's possible, and suddenly you are doing the impossible.»", reflexion: "Saint Francis of Assisi didn't set out to change the world with a strategic plan. He went out to embrace a leper, repair a ruined chapel, preach to the birds. And from that radical simplicity was born a movement that renewed the 13th-century Church.\n\nFrancis's universal fraternity was not an abstract idea — it was a concrete practice of seeing Christ in every person. The leper he embraced was Christ. The birds he preached to were brothers. This Franciscan vision is not ecological romanticism — it is embodied theology.\n\nIf everything comes from God and everything has a dignity given by God, then nothing can be treated with contempt or indifference.\n\nToday, look at your surroundings with Franciscan eyes. Who or what are you ignoring that deserves your attention? Where can you make a small gesture of universal fraternity?", preguntas: ["Who is hardest for you to see Christ in — who is your 'leper'?", "How do you live fraternity in your daily surroundings — work, family, city?", "What concrete gesture of universal fraternity can you make this week?"] },
        { santo: "St. Josemaría Escrivá", cita: "«There is no small thing if it is done for God and with God.»", reflexion: "Saint Josemaría Escrivá devoted his life to proclaiming a truth that seems simple and is revolutionary: ordinary work can be prayer. Not 'in addition to' prayer — the work itself, done with love, is a path to holiness.\n\nPraying with your hands means bringing God's presence to the desk, the kitchen, the operating room, the classroom. Not with superficial religious gestures but with quality of attention, care in the details, charity with colleagues.\n\nThis vision radically transforms the meaning of the workday. Monday is no longer the end of the weekend — it is the beginning of a week of offering.\n\nToday, choose a task from your work and do it consciously as an offering to God. Without haste, without mediocrity, with the same attention you would give if God himself were your client.", preguntas: ["How would your attitude at work change if you saw it as prayer?", "In which moments of your workday do you feel God's presence most?", "Is there an aspect of your work you find hard to offer to God — and why?"] },
        { santo: "St. John XXIII", cita: "«See everything, overlook much, correct little.»", reflexion: "The Church's social doctrine is not a set of political rules — it is the development of a fundamental theological conviction: every human person has an inalienable dignity because they bear the image of God within them.\n\nSaint John XXIII proclaimed that a person's dignity does not depend on their economic usefulness, ethnic origin, health, or faith. It depends solely on their being human — and that is enough.\n\nThis conviction has enormous practical consequences. It means the immigrant at the border has the same dignity as the executive. That the elderly person with dementia has the same dignity as the athlete at their peak.\n\nToday, how do you treat people the world considers 'lesser'? Where do you need to grow in recognizing the dignity of the other?", preguntas: ["To whom do you deny — even unconsciously — the dignity they deserve?", "How does your faith influence your stance on social injustices?", "What concrete change can you make in your life to better honor others' dignity?"] },
        { santo: "St. Mother Teresa of Calcutta", cita: "«We do not do great things, only small things with great love.»", reflexion: "Mother Teresa gathered the dying from the streets of Calcutta not because she had a plan to solve global poverty. She did it because in front of her was a human being who deserved to die with dignity. One gesture at a time. One person at a time.\n\nChristian service doesn't wait for perfect conditions. It begins with the concrete gesture right in front of you now: listening to the coworker going through a hard time, calling the relative who has gone weeks without news.\n\nThis week of mission culminates today with a practical invitation: make a concrete gesture of love. Not tomorrow. Not when you have more time. Today.\n\nMother Teresa said Calcutta is everywhere. The question is not 'where am I going to serve?' but 'who is in front of me right now?'", preguntas: ["Who is 'in front of you' today — who needs a concrete gesture of love?", "What keeps you from serving more — time, fear, discomfort, indifference?", "What is the concrete gesture of love you will do today, before the day ends?"] },
        { santo: "St. Ignatius of Loyola", cita: "«Love ought to show itself in deeds more than in words.»", reflexion: "Thirty days. Four weeks. A journey that began with the question 'who is God for me?' and today reaches its first great monthly examination of conscience.\n\nLooking back at a month of spiritual life is not easy. There are days you were faithful and days you let grace pass by. There are moments of consolation you didn't expect and moments of desolation you didn't know how to read.\n\nSaint Ignatius taught that the monthly Examen seeks to see the underlying movement: not what happened each day, but where this journey as a whole is taking you. Are you freer? More able to love? More available to God?\n\nToday, don't make an inventory of failures. Take a reading of movement: where are you headed? That is what matters.", preguntas: ["What is the underlying movement of your spiritual life this past month?", "What grace did you receive this month that you didn't expect?", "What do you want to be different next month — what specific change do you propose for yourself?"] },
        { santo: "St. Francis of Assisi", cita: "«Start by doing what is necessary, then what is possible, and suddenly you will find yourself doing the impossible.»", reflexion: "This month's closing Mass is not the end — it is a threshold. Everything you have lived, prayed, contemplated, and offered in these four weeks flows here, to this altar, to this bread and this wine.\n\nThanksgiving is the most honest gesture a human being can make before God. Not because everything went well — but because in everything, the good and the difficult, God's hand was present.\n\nSaint Francis, at the end of his life, when he was blind and suffering, composed the Canticle of the Creatures — a hymn of total gratitude. Not because he wasn't suffering, but because he had learned to see God's goodness even in suffering.\n\nToday, enter this Mass with the gratitude of someone who has walked a path. And leave it ready for the next stretch — which will be new, different, and full of grace too.", preguntas: ["What three specific things from this month do you want to thank God for today?", "What do you carry from this month into the next — what fruit do you want to keep?", "How do you want to begin the next thirty-day cycle?"] },
      ],
    ];
    const allContent = language === "en" ? allContentEn : allContentEs;
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

  const weeksEs = [
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
  const weeksEn = [
    { title: "Week 1 · Encounter", theme: "Rediscovering God", color: C.navy, bg: "#DDE8F4", days: [
      { day: "Mon", title: "Who is God for me today?", type: "Reflection" },
      { day: "Tue", title: "Psalm 139 — God knows me from within", type: "Lectio" },
      { day: "Wed", title: "Prayer as conversation, not monologue", type: "Practice" },
      { day: "Thu", title: "St. Augustine: 'You made us for Yourself'", type: "Reading" },
      { day: "Fri", title: "10 minutes of contemplative silence", type: "Silence" },
      { day: "Sat", title: "Ignatian Examen: where did I see God this week?", type: "Examen" },
      { day: "Sun", title: "Sunday Mass with full attention", type: "Mass" },
    ]},
    { title: "Week 2 · Interiority", theme: "The inner life", color: C.blue, bg: "#E0EBF5", days: [
      { day: "Mon", title: "Lectio Divina: John 4 — The Samaritan woman", type: "Lectio" },
      { day: "Tue", title: "St. Teresa of Ávila: the interior castle", type: "Reading" },
      { day: "Wed", title: "The Our Father word by word", type: "Reflection" },
      { day: "Thu", title: "Discernment: spiritual movements", type: "Practice" },
      { day: "Fri", title: "Prayer with the body: posture and breathing", type: "Practice" },
      { day: "Sat", title: "Weekly Ignatian Examen", type: "Examen" },
      { day: "Sun", title: "Sunday Mass with full attention", type: "Mass" },
    ]},
    { title: "Week 3 · Schoenstatt", theme: "Covenant of love with Mary", color: C.gold, bg: "#F5EDD8", days: [
      { day: "Mon", title: "Father Kentenich and the origins of Schoenstatt", type: "Reading" },
      { day: "Tue", title: "The covenant of love with Mary", type: "Reflection" },
      { day: "Wed", title: "The shrine as a spiritual home", type: "Practice" },
      { day: "Thu", title: "The contribution: an offering of love", type: "Practice" },
      { day: "Fri", title: "An instrument in Mary's hands", type: "Reflection" },
      { day: "Sat", title: "Weekly Ignatian Examen", type: "Examen" },
      { day: "Sun", title: "Mass and consecration to Mary", type: "Mass" },
    ]},
    { title: "Week 4 · Mission", theme: "Faith in the world", color: C.sky, bg: "#DFF0F8", days: [
      { day: "Mon", title: "Vocation: what is God calling me to?", type: "Reflection" },
      { day: "Tue", title: "St. Francis: universal fraternity", type: "Reading" },
      { day: "Wed", title: "Faith and work: praying with your hands", type: "Practice" },
      { day: "Thu", title: "Social doctrine: the dignity of the person", type: "Reading" },
      { day: "Fri", title: "Service: a concrete gesture of love today", type: "Practice" },
      { day: "Sat", title: "Monthly Ignatian Examen", type: "Examen" },
      { day: "Sun", title: "Closing Mass — thanksgiving", type: "Mass" },
    ]},
  ];
  const weeks = language === "en" ? weeksEn : weeksEs;

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

  const typeColor = { Lectura: C.blue, Práctica: C.sky, Reflexión: C.periwinkle, Examen: C.gold, Misa: C.navy, Lectio: C.teal, Silencio: C.slate, Reading: C.blue, Practice: C.sky, Reflection: C.periwinkle, Mass: C.navy, Silence: C.slate };
  const w = weeks[activeWeek];
  const doneCount = w.days.filter((_, i) => progress[`${activeWeek}-${i}`]).length;
  const pct = Math.round((doneCount / w.days.length) * 100);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.plan, paddingBottom: 90 }}>
      {openDay !== null && (
        <div style={sheetOverlay} onClick={() => { setOpenDay(null); setDayContent(null); }}>
          <div onClick={e => e.stopPropagation()} style={sheetCard()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: 0 }}>{weeks[activeWeek].days[openDay]?.title}</p>
                <span style={pill(`${(typeColor[weeks[activeWeek].days[openDay]?.type] || C.blue)}20`, typeColor[weeks[activeWeek].days[openDay]?.type] || C.blue)}>{weeks[activeWeek].days[openDay]?.type}</span>
              </div>
              <button onClick={() => { setOpenDay(null); setDayContent(null); }} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            {loadingContent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: C.slateLight, fontSize: 14 }}>{t(language, "plan_preparing")}</p>
              </div>
            ) : dayContent ? (
              <>
                <div style={{ background: C.iceBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 20, borderLeft: `3px solid ${C.blue}` }}>
                  <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, margin: "0 0 6px", lineHeight: 1.6 }}>{dayContent.cita}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, margin: 0 }}>{dayContent.santo}</p>
                </div>
                <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 24px", whiteSpace: "pre-line" }}>{dayContent.reflexion}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>{t(language, "plan_questions_to_pray")}</p>
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
                    {progress[`${activeWeek}-${openDay}`] ? t(language, "plan_completed") : t(language, "plan_mark_done")}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 20px" }}>
        <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "plan_header_label")}</p>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{t(language, "plan_title")}</h2>
      </div>

      <div style={{ padding: "0 22px 20px", display: "flex", gap: 10 }}>
        {weeks.map((wk, i) => (
          <button key={i} onClick={() => setActiveWeek(i)} style={{ flex: 1, borderRadius: 14, padding: "12px 8px", border: "none", background: activeWeek === i ? wk.color : C.white, color: activeWeek === i ? "#fff" : C.inkMid, fontWeight: 700, fontSize: 11, cursor: "pointer", boxShadow: activeWeek === i ? `0 4px 16px ${wk.color}55` : "0 2px 8px rgba(30,58,95,0.07)", transition: "all 0.2s", lineHeight: 1.4 }}>{`${t(language, "plan_week_short")}\n${i + 1}`}</button>
        ))}
      </div>

      <div style={{ padding: "0 22px 20px" }}>
        <div style={{ borderRadius: 20, background: `linear-gradient(135deg, ${w.color} 0%, ${w.color}CC 100%)`, padding: "18px 20px", color: "#fff" }}>
          <p style={{ fontSize: 11, opacity: 0.8, margin: "0 0 4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{w.theme}</p>
          <p style={{ fontSize: 17, fontWeight: 800, margin: "0 0 14px" }}>{w.title}</p>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 100, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "#fff", borderRadius: 100, transition: "width 0.4s" }} />
          </div>
          <p style={{ fontSize: 11, opacity: 0.85, margin: "8px 0 0" }}>{doneCount} {t(language, "plan_of_days_completed")} {w.days.length} {t(language, "plan_days_completed_suffix")} · {pct}%</p>
        </div>
      </div>

      <div style={{ padding: "0 22px", display: "grid", gridTemplateColumns: columns > 1 ? "1fr 1fr" : "1fr", gap: 10 }}>
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

const DIARY_MOODS = ["😊", "🙏", "😔", "😌", "🥹", "😤", "🤔", "❤️"];
const DIARY_TAGS = ["Consolación", "Discernimiento", "Acción de gracias", "Desolación"];
const DIARY_TAG_COLOR = { "Consolación": C.sky, "Discernimiento": C.blue, "Acción de gracias": C.gold, "Desolación": C.periwinkle };
const DIARY_TAG_I18N_KEY = { "Consolación": "diary_tag_consolacion", "Discernimiento": "diary_tag_discernimiento", "Acción de gracias": "diary_tag_gracias", "Desolación": "diary_tag_desolacion" };
function diaryTagLabel(language, tag) {
  const key = DIARY_TAG_I18N_KEY[tag];
  return key ? t(language, key) : tag;
}

function EntryForm({ data, onChange, onSave, onCancel, saving: isSaving, title, language }) {
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
        {DIARY_MOODS.map(m => (
          <button key={m} onClick={() => onChange({ ...data, mood: m })} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: data.mood === m ? C.blue + "20" : C.mist + "55", fontSize: 18, cursor: "pointer", outline: data.mood === m ? "2px solid " + C.blue : "none" }}>{m}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {DIARY_TAGS.map(tag => (
          <button key={tag} onClick={() => onChange({ ...data, tag })} style={{ padding: "4px 10px", borderRadius: 100, border: "none", background: data.tag === tag ? DIARY_TAG_COLOR[tag] + "30" : C.iceBlue, color: data.tag === tag ? DIARY_TAG_COLOR[tag] : C.slateLight, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{diaryTagLabel(language, tag)}</button>
        ))}
      </div>
      <input
        ref={titleRef}
        defaultValue={data.title}
        placeholder={t(language, "diary_title_placeholder")}
        autoFocus
        style={{ width: "100%", border: "none", outline: "none", borderBottom: "1.5px solid " + C.mist, padding: "8px 0", fontSize: 16, fontWeight: 700, color: C.ink, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif", marginBottom: 10, boxSizing: "border-box" }}
      />
      <textarea
        ref={textRef}
        defaultValue={data.text}
        placeholder={t(language, "diary_text_placeholder")}
        rows={4}
        style={{ width: "100%", border: "none", outline: "none", padding: "0", fontSize: 16, color: C.inkMid, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.65, resize: "none", boxSizing: "border-box" }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, gap: 10 }}>
        <button onClick={onCancel} style={{ background: "transparent", border: "1px solid " + C.mist, borderRadius: 10, padding: "8px 16px", fontSize: 12, color: C.slateLight, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>{t(language, "diary_cancel")}</button>
        <button onClick={handleSave} disabled={isSaving} style={{ background: "linear-gradient(135deg, " + C.navy + ", " + C.blue + ")", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", opacity: isSaving ? 0.5 : 1 }}>
          {isSaving ? t(language, "diary_saving") : t(language, "diary_save")}
        </button>
      </div>
    </div>
  );
}

function DiaryScreen({ user, language }) {
  const { isTablet, columns, keyboardOpen, keyboardHeight } = useViewportInfo();
  const [entries, setEntries] = useState([]);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState({ mood: "", title: "", text: "", tag: "Consolación" });
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const moods = DIARY_MOODS;
  const tags = DIARY_TAGS;
  const tagColor = DIARY_TAG_COLOR;

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

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: gradients.diary }}>
      {editingEntry && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: keyboardOpen ? "flex-start" : (isTablet ? "center" : "flex-end"), justifyContent: "center", padding: isTablet ? 24 : 0, paddingTop: keyboardOpen ? "max(16px, env(safe-area-inset-top))" : undefined }} onClick={() => setEditingEntry(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: keyboardOpen ? 20 : (isTablet ? 24 : "24px 24px 0 0"), padding: "24px 22px 48px", width: "100%", maxWidth: isTablet ? 480 : 390, margin: "0 auto", maxHeight: keyboardOpen ? `calc(100vh - ${keyboardHeight}px - 32px)` : "80vh", overflowY: "auto" }}>
            <EntryForm data={editDraft} onChange={setEditDraft} onSave={saveEdit} onCancel={() => setEditingEntry(null)} saving={savingEdit} title={t(language, "diary_edit_entry")} language={language} />
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "diary_header_label")}</p>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{t(language, "diary_title")}</h2>
        </div>
        <button onClick={() => setWriting(!writing)} style={{ width: 42, height: 42, borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Icon name="plus" size={20} color="#fff" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 22px", paddingBottom: keyboardOpen ? keyboardHeight + 40 : 90 }}>
        {writing && (
          <EntryForm data={draft} onChange={setDraft} onSave={saveEntry} onCancel={() => setWriting(false)} saving={saving} title={t(language, "diary_new_entry")} language={language} />
        )}
        {loadingEntries ? (
          <p style={{ textAlign: "center", color: C.slateLight, fontSize: 13, marginTop: 32 }}>{t(language, "diary_loading")}</p>
        ) : entries.length === 0 && !writing ? (
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📓</p>
            <p style={{ fontSize: 14, color: C.slateLight }}>{t(language, "diary_empty_1")}</p>
            <p style={{ fontSize: 12, color: C.slateLight }}>{t(language, "diary_empty_2")}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: columns > 1 ? "1fr 1fr" : "1fr", gap: 10 }}>
          {entries.map((e, i) => (
            <div key={e.id || i} style={{ background: C.cream, borderRadius: 12, padding: "16px 18px", border: "1px solid " + C.mist, borderLeft: `3px solid ${tagColor[e.tag] || C.sky}`, opacity: deletingId === e.id ? 0.5 : 1, transition: "opacity 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{e.mood}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: C.ink, margin: 0 }}>{e.title}</p>
                    <p style={{ fontSize: 10, color: C.slateLight, margin: 0 }}>{formatDate(e.created_at)}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={pill(`${(tagColor[e.tag] || C.sky)}22`, tagColor[e.tag] || C.sky)}>{diaryTagLabel(language, e.tag)}</span>
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
          ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileScreen({ user, profile, setProfile, onLogout, darkMode, toggleDarkMode, language, changeLanguage }) {
  const { isTablet } = useViewportInfo();
  const sheetOverlay = { position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: isTablet ? "center" : "flex-end", justifyContent: "center", padding: isTablet ? 24 : 0 };
  const sheetCard = (extra = {}) => ({ background: C.white, borderRadius: isTablet ? 24 : "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: isTablet ? 480 : 390, margin: "0 auto", maxHeight: "80vh", overflowY: "auto", ...extra });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
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
        setNotifStatus(t(language, "profile_notifications_granted"));
        setTimeout(() => setNotifStatus(""), 3000);
      } else {
        setNotifStatus(t(language, "profile_notifications_denied"));
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
    } catch { alert(t(language, "profile_avatar_error")); }
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

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error(t(language, "profile_delete_error_session"));

      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, accessToken }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || t(language, "profile_delete_error_generic"));

      await supabase.auth.signOut();
      onLogout();
    } catch (e) {
      setDeleteError(e.message || t(language, "profile_delete_error_fallback"));
      setDeletingAccount(false);
    }
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.profile, paddingBottom: 90 }}>
      {activeModal === "about" && (
        <div style={sheetOverlay} onClick={() => setActiveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={sheetCard()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>{t(language, "profile_about_title")}</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, overflow: "hidden", margin: "0 auto 12px" }}>
                <img src="/logo.jpeg" alt="Mater" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 4px" }}>Mater</h3>
              <p style={{ fontSize: 12, color: C.slateLight, margin: 0 }}>{t(language, "profile_about_version")}</p>
            </div>
            <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.75, marginBottom: 20, textAlign: "center" }}>
              {t(language, "profile_about_body")}
            </p>
            <p style={{ textAlign: "center", fontSize: 11, color: C.slateLight, marginTop: 20 }}>{t(language, "profile_about_footer")}</p>
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
            <button onClick={saveName} disabled={saving} style={{ background: C.blue, border: "none", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{saving ? "..." : t(language, "profile_save")}</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>{profile?.name || user?.email?.split("@")[0]}</h1>
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Icon name="edit" size={16} color={C.inkLight} />
            </button>
          </div>
        )}
        {saved && <p style={{ color: C.blue, fontSize: 12, margin: "4px 0 0" }}>{t(language, "profile_name_updated")}</p>}
        <p style={{ fontSize: 13, color: C.slateLight, margin: "4px 0 0" }}>{user?.email}</p>
      </div>

      <div style={{ padding: "24px 22px 0" }}>
        <div style={{ background: C.cream, borderRadius: 16, overflow: "hidden", border: "1px solid " + C.mist }}>
          {[
            { label: t(language, "profile_edit_name"), icon: "edit", action: () => setEditing(true) },
            { label: t(language, "profile_about"), icon: "heart", action: () => setActiveModal("about") },
          ].map((item, i, arr) => (
            <button key={i} onClick={item.action} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "none", background: "transparent", borderBottom: "1px solid " + C.mist, cursor: "pointer", textAlign: "left" }}>
              <Icon name={item.icon} size={15} color={C.inkLight} />
              <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{item.label}</span>
              <Icon name="chevron" size={14} color={C.mist} />
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid " + C.mist }}>
            <Icon name="moon" size={15} color={C.inkLight} />
            <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{t(language, "profile_dark_mode")}</span>
            <button onClick={toggleDarkMode} style={{ width: 44, height: 26, borderRadius: 13, border: "none", background: darkMode ? C.navy : C.mist, cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: darkMode ? 21 : 3, transition: "left 0.3s" }} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid " + C.mist }}>
            <Icon name="grid" size={15} color={C.inkLight} />
            <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{t(language, "profile_language")}</span>
            <div style={{ display: "flex", background: C.iceBlue, borderRadius: 10, padding: 2, gap: 2 }}>
              <button onClick={() => changeLanguage("es")} style={{ border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", background: language === "es" ? C.navy : "transparent", color: language === "es" ? C.cream : C.inkLight, fontFamily: "'DM Sans', system-ui, sans-serif" }}>{t(language, "profile_language_es")}</button>
              <button onClick={() => changeLanguage("en")} style={{ border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", background: language === "en" ? C.navy : "transparent", color: language === "en" ? C.cream : C.inkLight, fontFamily: "'DM Sans', system-ui, sans-serif" }}>{t(language, "profile_language_en")}</button>
            </div>
          </div>
          <button onClick={() => setActiveModal("notifications")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}>
            <Icon name="bell" size={15} color={C.inkLight} />
            <span style={{ fontSize: 13, color: C.ink, flex: 1 }}>{t(language, "profile_reminders")}</span>
            <Icon name="chevron" size={14} color={C.mist} />
          </button>
        </div>
      </div>

      {activeModal === "notifications" && (
        <div style={sheetOverlay} onClick={() => setActiveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={sheetCard()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>{t(language, "profile_notifications_title")}</h2>
              <button onClick={() => setActiveModal(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.iceBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>{t(language, "profile_notifications_enable")}</p>
                <p style={{ fontSize: 11, color: C.slateLight, margin: "2px 0 0" }}>{t(language, "profile_notifications_enable_sub")}</p>
              </div>
              <button onClick={toggleNotifications} style={{ width: 48, height: 28, borderRadius: 14, border: "none", background: notifEnabled ? C.navy : C.mist, cursor: "pointer", position: "relative", flexShrink: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: notifEnabled ? 23 : 3, transition: "left 0.3s" }} />
              </button>
            </div>

            {notifStatus && <p style={{ fontSize: 12, color: notifStatus.includes("✓") ? C.blue : "#C0392B", textAlign: "center", marginBottom: 16 }}>{notifStatus}</p>}

            <p style={{ fontSize: 11, fontWeight: 700, color: C.slateLight, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>{t(language, "profile_notifications_choose_times")}</p>

            {(language === "en" ? PRACTICE_NAMES_EN : PRACTICE_NAMES).map((name, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid " + C.mist : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name={i === 0 ? "moon" : i === 1 ? "book" : "heart"} size={16} color={C.blue} />
                  <span style={{ fontSize: 13, color: C.ink }}>{name}</span>
                </div>
                <input
                  type="time"
                  value={notifTimes[i]}
                  onChange={e => updateNotifTime(i, e.target.value)}
                  style={{ border: "1px solid " + C.mist, borderRadius: 8, padding: "6px 10px", fontSize: 16, color: C.ink, background: C.fog, fontFamily: "'DM Sans', system-ui, sans-serif" }}
                />
              </div>
            ))}

            <p style={{ fontSize: 11, color: C.slateLight, marginTop: 20, lineHeight: 1.6, textAlign: "center" }}>
              {t(language, "profile_notifications_iphone_hint")}
            </p>
          </div>
        </div>
      )}

      <div style={{ padding: "16px 22px 0" }}>
        <button onClick={() => {
          if (navigator.share) {
            navigator.share({ title: t(language, "profile_share_title"), text: t(language, "profile_share_text"), url: "https://materapp.org" });
          } else {
            navigator.clipboard.writeText("https://materapp.org");
            alert(t(language, "profile_share_copied"));
          }
        }} style={{ width: "100%", padding: "14px", border: "1px solid " + C.mist, borderRadius: 12, background: C.cream, color: C.navy, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {t(language, "profile_share")}
        </button>
      </div>

      <div style={{ padding: "12px 22px 0" }}>
        <button onClick={onLogout} style={{ width: "100%", padding: "14px", border: "1px solid #E8A0A0", borderRadius: 12, background: "transparent", color: "#C0392B", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="logout" size={15} color="#C0392B" />
          {t(language, "profile_logout")}
        </button>
      </div>

      <div style={{ padding: "12px 22px 0" }}>
        <button onClick={() => { setDeleteConfirmText(""); setDeleteError(""); setActiveModal("delete"); }} style={{ width: "100%", padding: "14px", border: "none", background: "transparent", color: C.slateLight, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif", textDecoration: "underline" }}>
          {t(language, "profile_delete_account")}
        </button>
      </div>

      {activeModal === "delete" && (
        <div style={sheetOverlay} onClick={() => !deletingAccount && setActiveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={sheetCard()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#C0392B", margin: 0 }}>{t(language, "profile_delete_title")}</h2>
              {!deletingAccount && (
                <button onClick={() => setActiveModal(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
              )}
            </div>
            <p style={{ fontSize: 13.5, color: C.inkMid, lineHeight: 1.7, marginBottom: 14 }}>
              {t(language, "profile_delete_body")} <strong>{t(language, "profile_delete_permanent")}</strong> {t(language, "profile_delete_body_2")}
            </p>
            <ul style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.9, marginBottom: 20, paddingLeft: 20 }}>
              <li>{t(language, "profile_delete_item_1")}</li>
              <li>{t(language, "profile_delete_item_2")}</li>
              <li>{t(language, "profile_delete_item_3")}</li>
              <li>{t(language, "profile_delete_item_4")}</li>
            </ul>
            <p style={{ fontSize: 13, color: C.inkMid, marginBottom: 8 }}>
              {t(language, "profile_delete_confirm_label")} <strong>{t(language, "profile_delete_confirm_word")}</strong> {t(language, "profile_delete_confirm_label_2")}
            </p>
            <input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              disabled={deletingAccount}
              placeholder={t(language, "profile_delete_confirm_word")}
              style={{ width: "100%", border: "1.5px solid " + C.mist, outline: "none", borderRadius: 10, padding: "12px 14px", fontSize: 16, color: C.ink, background: C.fog, fontFamily: "'DM Sans', system-ui, sans-serif", marginBottom: 14, boxSizing: "border-box" }}
            />
            {deleteError && <p style={{ color: "#C0392B", fontSize: 12, marginBottom: 14 }}>{deleteError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setActiveModal(null)} disabled={deletingAccount} style={{ flex: 1, padding: "14px", background: C.iceBlue, border: "none", borderRadius: 12, color: C.inkMid, fontSize: 13.5, fontWeight: 600, cursor: deletingAccount ? "default" : "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                {t(language, "profile_delete_cancel")}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== t(language, "profile_delete_confirm_word") || deletingAccount}
                style={{ flex: 1, padding: "14px", background: "#C0392B", border: "none", borderRadius: 12, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: (deleteConfirmText.trim().toUpperCase() !== t(language, "profile_delete_confirm_word") || deletingAccount) ? "default" : "pointer", opacity: (deleteConfirmText.trim().toUpperCase() !== t(language, "profile_delete_confirm_word") || deletingAccount) ? 0.5 : 1, fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                {deletingAccount ? t(language, "profile_delete_deleting") : t(language, "profile_delete_confirm_button")}
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 11, color: C.slateLight, margin: "20px 0 0" }}>{t(language, "profile_footer")}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECCIONES NUEVAS: MILAGROS EUCARÍSTICOS + SANTO ROSARIO (menú "Más")
// ═══════════════════════════════════════════════════════════════════════

const EUCHARISTIC_MIRACLES = [
  {
    id: "lanciano",
    titulo: "El Milagro de Lanciano",
    lugar: "Lanciano, Italia",
    anio: "Siglo VIII (según la tradición, hacia el año 750)",
    resumen: "Según la tradición, un monje basiliano que dudaba de la presencia real de Cristo en la Eucaristía celebraba la Misa cuando, en el momento de la consagración, la hostia se transformó visiblemente en carne y el vino en sangre.\n\nLos restos se conservan hasta hoy en Lanciano. En 1970-71, con autorización del Vaticano, fueron analizados científicamente por el profesor Odoardo Linoli, quien concluyó que se trataba de tejido cardíaco humano. Estudios posteriores han señalado también objeciones metodológicas a ese análisis, que conviene mencionar con honestidad.\n\nEl papa Pablo VI reconoció el milagro con ocasión del Año Santo de 1975. Es, junto al de Santarém, uno de los más citados por la Iglesia como testimonio de la fe en la Presencia Real.",
    dato: "Las reliquias llevan más de 1.200 años expuestas sin el uso de conservantes, lo que los custodios franciscanos señalan como parte de lo inexplicado del caso.",
    estado: "Reconocido por la Iglesia; venerado desde la Edad Media. Confirmado por Pablo VI en 1975.",
  },
  {
    id: "bolsena",
    titulo: "El Milagro de Bolsena-Orvieto",
    lugar: "Bolsena, Italia",
    anio: "1263",
    resumen: "Un sacerdote bohemio, de nombre tradicional Pedro de Praga, dudaba de la transubstanciación. Durante una peregrinación a Roma, se detuvo a celebrar Misa junto a la tumba de Santa Cristina en Bolsena. Al pronunciar las palabras de la consagración, la hostia comenzó a sangrar sobre el corporal.\n\nEl sacerdote llevó el corporal manchado a Orvieto, donde se encontraba el papa Urbano IV. El Papa ordenó una investigación y, al confirmarla, instituyó al año siguiente (1264) la fiesta del Corpus Christi para toda la Iglesia, encargando a Santo Tomás de Aquino la composición de los himnos litúrgicos.\n\nEl corporal se conserva hoy en la Catedral de Orvieto, y el episodio fue inmortalizado por Rafael en su fresco 'La Misa de Bolsena' en el Vaticano.",
    dato: "De este milagro nació directamente la fiesta universal del Corpus Christi, que la Iglesia sigue celebrando cada año.",
    estado: "Reconocido oficialmente; dio origen a una fiesta litúrgica universal.",
  },
  {
    id: "santarem",
    titulo: "El Milagro de Santarém",
    lugar: "Santarém, Portugal",
    anio: "Siglo XIII (hacia 1247)",
    resumen: "Según la tradición local, una mujer angustiada por problemas en su matrimonio acudió a una hechicera, quien le pidió, a cambio de ayuda, una hostia consagrada. La mujer la tomó durante la Misa y la guardó en un paño; camino a casa, la hostia comenzó a sangrar de forma visible.\n\nAsustada, escondió el paño en un arca. Esa noche, según el relato, una luz brillante salía del arca. Al abrirla se encontró la hostia convertida en carne sangrante. El hecho fue comunicado al párroco y, tras la investigación correspondiente, la reliquia fue trasladada a la iglesia, donde se venera hasta hoy.\n\nLa Iglesia reconoce este milagro, junto al de Lanciano, como uno de los más significativos por su antigüedad y continuidad de culto.",
    dato: "La reliquia se conserva en la Iglesia de San Esteban de Santarém, en un relicario que se abre solo en ocasiones especiales.",
    estado: "Reconocido oficialmente por la Iglesia; venerado desde el siglo XIII.",
  },
  {
    id: "amsterdam",
    titulo: "El Milagro de Ámsterdam",
    lugar: "Ámsterdam, Países Bajos",
    anio: "1345",
    resumen: "Según la tradición, un enfermo recibió la comunión y, poco después, la vomitó. La sirvienta de la casa arrojó los restos al fuego de la chimenea, como era costumbre, para tratarlos con respeto. Al día siguiente, la hostia fue hallada intacta entre las cenizas, sin haberse quemado.\n\nEl hecho se comunicó al párroco, y la hostia fue llevada en procesión a la iglesia. El culto que nació de este episodio convirtió a Ámsterdam, durante siglos, en un importante centro de peregrinación conocido como la 'Stille Omgang' (procesión silenciosa), que algunos grupos católicos siguen realizando cada año.\n\nEs uno de los pocos milagros eucarísticos documentados en el norte de Europa antes de la Reforma protestante.",
    dato: "La procesión silenciosa en memoria de este milagro se sigue celebrando cada año en marzo, más de 675 años después.",
    estado: "De devoción popular sostenida durante siglos; su reconocimiento canónico formal es menos documentado que el de Lanciano o Bolsena.",
  },
  {
    id: "siena",
    titulo: "Las Hostias Incorruptas de Siena",
    lugar: "Siena, Italia",
    anio: "1730",
    resumen: "En la noche del 14 de agosto de 1730, ladrones robaron un copón con cientos de hostias consagradas de la Basílica de San Francisco en Siena. Tres días después, las hostias fueron halladas en una caja de limosnas de otra iglesia, sucias pero intactas.\n\nLos frailes las lavaron con reverencia y las conservaron para consumo normal, pero notaron que no se corrompían con el paso del tiempo, algo inusual para hostias de trigo y agua expuestas al ambiente. Casi tres siglos después continúan conservándose sin signos de descomposición.\n\nAnálisis químicos realizados en 1922 y nuevamente en 1980 no encontraron agentes conservantes, lo que la comunidad franciscana y numerosos peregrinos consideran parte del prodigio.",
    dato: "Las hostias se conservan hoy, casi 300 años después, en la Basílica de San Francisco de Siena, sin signos de descomposición.",
    estado: "De devoción reconocida por la Iglesia local; estudiada científicamente en dos ocasiones documentadas.",
  },
  {
    id: "ocebreiro",
    titulo: "El Milagro de O Cebreiro",
    lugar: "O Cebreiro, España (Galicia)",
    anio: "Hacia 1300",
    resumen: "Según la tradición ligada al Camino de Santiago, un monje de este pequeño santuario de montaña celebraba Misa en un día de fuerte tormenta. Un campesino local, Juan Santín, subió con gran esfuerzo desde su pueblo pese al mal tiempo para no faltar a la Eucaristía.\n\nEl monje, que dudaba de que valiera la pena tanto sacrificio por 'un poco de pan y vino', vio cómo, en el momento de la consagración, el pan y el vino se transformaban visiblemente en carne y sangre ante el campesino y ante él mismo.\n\nEl cáliz y la patena de este episodio, de origen medieval, se conservan en el santuario de O Cebreiro y, según la tradición, habrían inspirado más tarde el diseño del Grial en algunas representaciones del Camino de Santiago.",
    dato: "El cáliz y la patena del milagro se conservan hoy en el mismo santuario de O Cebreiro, punto de paso del Camino de Santiago.",
    estado: "De arraigada tradición local y peregrina desde la Edad Media.",
  },
  {
    id: "betania",
    titulo: "El fenómeno eucarístico de Betania",
    lugar: "Betania (Los Teques), Venezuela",
    anio: "1991",
    resumen: "Betania es reconocido principalmente como lugar de apariciones marianas aprobadas por el obispo local Mons. Pío Bello Ricardo en 1987. En 1991, durante una Misa multitudinaria, numerosos testigos afirmaron haber presenciado un fenómeno relacionado con una hostia consagrada de tamaño y apariencia inusual.\n\nA diferencia de Lanciano o Bolsena, este caso no cuenta con el mismo nivel de análisis científico ni de reconocimiento formal específico como 'milagro eucarístico' independiente; se sitúa dentro del reconocimiento más amplio del santuario mariano de Betania.\n\nSe incluye aquí con esa distinción clara, para no presentarlo con el mismo grado de certeza histórica que los casos medievales documentados por siglos de estudio.",
    dato: "Betania es uno de los pocos santuarios marianos con apariciones aprobadas oficialmente por un obispo en América Latina.",
    estado: "Vinculado a apariciones marianas aprobadas localmente (1987); el fenómeno eucarístico específico tiene un reconocimiento más limitado.",
  },
  {
    id: "buenosaires",
    titulo: "El Milagro de Buenos Aires",
    lugar: "Buenos Aires, Argentina",
    anio: "1996",
    resumen: "El 15 de agosto de 1996, en la parroquia Santa María de Almagro, el sacerdote Alejandro Pezet encontró una hostia consagrada descartada en un candelabro. Siguiendo la práctica habitual, la colocó en un recipiente con agua para que se disolviera.\n\nDías después, al revisar el recipiente, encontró que la hostia se había transformado en un fragmento de tejido de aspecto sanguinolento, en lugar de disolverse. El entonces arzobispo de Buenos Aires, Mons. Jorge Mario Bergoglio —más tarde el papa Francisco— pidió que se conservara y, años después, autorizó un análisis científico.\n\nEl cardiólogo estadounidense Frederick Zugibe concluyó, sin conocer el origen de la muestra, que se trataba de tejido de miocardio humano vivo, inflamado, similar en tipo al hallado en Lanciano. El grupo sanguíneo reportado fue AB, coincidente con otros casos similares.",
    dato: "El arzobispo que autorizó la investigación de este caso, Jorge Mario Bergoglio, sería elegido papa Francisco en 2013.",
    estado: "Estudiado científicamente; ampliamente difundido por la Iglesia como testimonio contemporáneo.",
  },
  {
    id: "tixtla",
    titulo: "El Milagro de Tixtla",
    lugar: "Tixtla, México",
    anio: "2006",
    resumen: "Durante una Misa en octubre de 2006, una hostia consagrada comenzó a mostrar manchas de aspecto sanguinolento poco después de la comunión. El caso fue puesto en conocimiento del obispo local, quien autorizó su conservación y posterior estudio.\n\nEl investigador boliviano Ricardo Castañón Gómez reportó hallazgos de tejido con actividad biológica reciente, incluyendo glóbulos blancos, lo que a su juicio indicaría un origen distinto al de una simple contaminación.\n\nComo en otros casos modernos, conviene señalar que estos análisis han sido cuestionados por científicos independientes, que apuntan a posibles contaminaciones bacterianas como explicación natural alternativa.",
    dato: "Es uno de los pocos casos de milagro eucarístico documentados en México en tiempos recientes.",
    estado: "De devoción y estudio local; sin declaración canónica formal ampliamente publicitada.",
  },
  {
    id: "sokolka",
    titulo: "El Milagro de Sokółka",
    lugar: "Sokółka, Polonia",
    anio: "2008",
    resumen: "En octubre de 2008, una hostia consagrada cayó al suelo durante la comunión en la parroquia de San Antonio. Siguiendo la norma litúrgica, un sacerdote la colocó en un recipiente con agua (el 'vasculum') para que se disolviera.\n\nUna semana después, una religiosa que revisaba el recipiente encontró que, en lugar de disolverse, había aparecido una mancha de color rojo en el centro del fragmento de hostia. El caso fue comunicado al arzobispo de Białystok, quien nombró una comisión de investigación.\n\nEl análisis histopatológico, realizado por especialistas de la Universidad Médica de Bialystok, identificó tejido muscular cardíaco humano, con características de tejido en agonía. La diócesis reconoció el hecho como un signo digno de veneración.",
    dato: "El fragmento de hostia se conserva hoy en la iglesia de Sokółka, junto a documentación del análisis científico realizado.",
    estado: "Reconocido por la diócesis de Białystok como signo extraordinario digno de veneración (2011).",
  },
  {
    id: "legnica",
    titulo: "El Milagro de Legnica",
    lugar: "Legnica, Polonia",
    anio: "2013",
    resumen: "El día de Navidad de 2013, durante la comunión en la parroquia del Espíritu Santo, una hostia consagrada cayó al suelo. Siguiendo el procedimiento habitual, fue colocada en agua para su disolución.\n\nSemanas después se observó que, al igual que en Sokółka, había aparecido una mancha rojiza dentro del fragmento. El obispo de Legnica encargó un estudio independiente a especialistas forenses de la Universidad de Breslavia.\n\nEl informe, hecho público por la diócesis, señaló la presencia de tejido de miocardio humano con signos compatibles con sufrimiento agónico, en un patrón muy similar al reportado en Sokółka y Buenos Aires.",
    dato: "Es el caso más reciente entre los que cuentan con un estudio forense universitario público y con reconocimiento episcopal formal.",
    estado: "Reconocido oficialmente por el obispo de Legnica en 2016, tras el estudio de la Universidad de Wrocław.",
  },
];

const EUCHARISTIC_MIRACLES_EN = [
  {
    id: "lanciano",
    titulo: "The Miracle of Lanciano",
    lugar: "Lanciano, Italy",
    anio: "8th century (according to tradition, around the year 750)",
    resumen: "According to tradition, a Basilian monk who doubted the real presence of Christ in the Eucharist was celebrating Mass when, at the moment of consecration, the host visibly turned into flesh and the wine into blood.\n\nThe remains are preserved to this day in Lanciano. In 1970-71, with Vatican authorization, they were scientifically analyzed by Professor Odoardo Linoli, who concluded it was human cardiac tissue. Later studies have also raised methodological objections to that analysis, which should be mentioned honestly.\n\nPope Paul VI recognized the miracle on the occasion of the Holy Year of 1975. Along with Santarém, it is one of the most cited by the Church as a testimony of faith in the Real Presence.",
    dato: "The relics have been on display for more than 1,200 years without the use of preservatives, which the Franciscan custodians point to as part of the case's unexplained nature.",
    estado: "Recognized by the Church; venerated since the Middle Ages. Confirmed by Paul VI in 1975.",
  },
  {
    id: "bolsena",
    titulo: "The Miracle of Bolsena-Orvieto",
    lugar: "Bolsena, Italy",
    anio: "1263",
    resumen: "A Bohemian priest, traditionally named Peter of Prague, doubted transubstantiation. During a pilgrimage to Rome, he stopped to celebrate Mass at the tomb of Saint Christina in Bolsena. As he spoke the words of consecration, the host began to bleed onto the corporal.\n\nThe priest brought the stained corporal to Orvieto, where Pope Urban IV was staying. The Pope ordered an investigation and, upon confirming it, instituted the feast of Corpus Christi for the whole Church the following year (1264), commissioning Saint Thomas Aquinas to compose the liturgical hymns.\n\nThe corporal is preserved today in the Cathedral of Orvieto, and the episode was immortalized by Raphael in his fresco 'The Mass at Bolsena' in the Vatican.",
    dato: "This miracle directly gave rise to the universal feast of Corpus Christi, which the Church still celebrates every year.",
    estado: "Officially recognized; gave rise to a universal liturgical feast.",
  },
  {
    id: "santarem",
    titulo: "The Miracle of Santarém",
    lugar: "Santarém, Portugal",
    anio: "13th century (around 1247)",
    resumen: "According to local tradition, a woman distressed over problems in her marriage went to a sorceress, who asked her, in exchange for help, for a consecrated host. The woman took it during Mass and kept it in a cloth; on the way home, the host visibly began to bleed.\n\nFrightened, she hid the cloth in a chest. That night, according to the account, a bright light came from the chest. When she opened it, she found the host had turned into bleeding flesh. The matter was reported to the parish priest and, after the corresponding investigation, the relic was moved to the church, where it is venerated to this day.\n\nThe Church recognizes this miracle, together with that of Lanciano, as one of the most significant for its antiquity and continuity of devotion.",
    dato: "The relic is kept in the Church of Saint Stephen in Santarém, in a reliquary that is opened only on special occasions.",
    estado: "Officially recognized by the Church; venerated since the 13th century.",
  },
  {
    id: "amsterdam",
    titulo: "The Miracle of Amsterdam",
    lugar: "Amsterdam, Netherlands",
    anio: "1345",
    resumen: "According to tradition, a sick man received Communion and, shortly after, vomited it up. The household servant threw the remains into the fireplace, as was customary, to treat them with respect. The next day, the host was found intact among the ashes, unburned.\n\nThe matter was reported to the parish priest, and the host was carried in procession to the church. The devotion born from this episode made Amsterdam, for centuries, an important pilgrimage center known as the 'Stille Omgang' (silent procession), which some Catholic groups still hold every year.\n\nIt is one of the few Eucharistic miracles documented in northern Europe before the Protestant Reformation.",
    dato: "The silent procession in memory of this miracle is still held every year in March, more than 675 years later.",
    estado: "Sustained popular devotion for centuries; its formal canonical recognition is less documented than Lanciano's or Bolsena's.",
  },
  {
    id: "siena",
    titulo: "The Incorrupt Hosts of Siena",
    lugar: "Siena, Italy",
    anio: "1730",
    resumen: "On the night of August 14, 1730, thieves stole a ciborium containing hundreds of consecrated hosts from the Basilica of St. Francis in Siena. Three days later, the hosts were found in an alms box of another church, dirty but intact.\n\nThe friars washed them with reverence and kept them for ordinary consumption, but noticed they did not decay over time, something unusual for wheat-and-water hosts exposed to the environment. Almost three centuries later, they remain preserved without signs of decomposition.\n\nChemical analyses conducted in 1922 and again in 1980 found no preservative agents, which the Franciscan community and numerous pilgrims consider part of the wonder.",
    dato: "The hosts are preserved today, almost 300 years later, in the Basilica of St. Francis in Siena, showing no signs of decomposition.",
    estado: "A devotion recognized by the local Church; scientifically studied on two documented occasions.",
  },
  {
    id: "ocebreiro",
    titulo: "The Miracle of O Cebreiro",
    lugar: "O Cebreiro, Spain (Galicia)",
    anio: "Around 1300",
    resumen: "According to tradition tied to the Camino de Santiago, a monk at this small mountain shrine was celebrating Mass on a day of a fierce storm. A local farmer, Juan Santín, climbed with great effort from his village despite the bad weather so as not to miss the Eucharist.\n\nThe monk, who doubted whether such sacrifice was worth it for 'a bit of bread and wine,' saw how, at the moment of consecration, the bread and wine visibly turned into flesh and blood before the farmer and before himself.\n\nThe chalice and paten from this episode, of medieval origin, are preserved at the shrine of O Cebreiro and, according to tradition, would later inspire the design of the Grail in some depictions of the Camino de Santiago.",
    dato: "The chalice and paten of the miracle are preserved today at the same shrine of O Cebreiro, a stop along the Camino de Santiago.",
    estado: "A deeply rooted local and pilgrim tradition since the Middle Ages.",
  },
  {
    id: "betania",
    titulo: "The Eucharistic Phenomenon of Betania",
    lugar: "Betania (Los Teques), Venezuela",
    anio: "1991",
    resumen: "Betania is recognized primarily as a site of Marian apparitions approved by the local bishop, Msgr. Pío Bello Ricardo, in 1987. In 1991, during a large public Mass, numerous witnesses claimed to have witnessed a phenomenon related to a consecrated host of unusual size and appearance.\n\nUnlike Lanciano or Bolsena, this case does not have the same level of scientific analysis or specific formal recognition as an independent 'Eucharistic miracle'; it falls within the broader recognition of the Marian shrine of Betania.\n\nIt is included here with that clear distinction, so as not to present it with the same degree of historical certainty as the medieval cases documented over centuries of study.",
    dato: "Betania is one of the few Marian shrines with apparitions officially approved by a bishop in Latin America.",
    estado: "Linked to Marian apparitions approved locally (1987); the specific Eucharistic phenomenon has more limited recognition.",
  },
  {
    id: "buenosaires",
    titulo: "The Miracle of Buenos Aires",
    lugar: "Buenos Aires, Argentina",
    anio: "1996",
    resumen: "On August 15, 1996, at the parish of Santa María de Almagro, Father Alejandro Pezet found a discarded consecrated host in a candle holder. Following usual practice, he placed it in a container of water so it would dissolve.\n\nDays later, checking the container, he found that instead of dissolving, the host had turned into a fragment of bloodlike tissue. The then-archbishop of Buenos Aires, Msgr. Jorge Mario Bergoglio — later Pope Francis — asked that it be preserved and, years later, authorized a scientific analysis.\n\nThe American cardiologist Frederick Zugibe concluded, without knowing the origin of the sample, that it was living, inflamed human myocardial tissue, similar in type to that found in Lanciano. The reported blood type was AB, matching other similar cases.",
    dato: "The archbishop who authorized the investigation of this case, Jorge Mario Bergoglio, would be elected Pope Francis in 2013.",
    estado: "Scientifically studied; widely publicized by the Church as a contemporary testimony.",
  },
  {
    id: "tixtla",
    titulo: "The Miracle of Tixtla",
    lugar: "Tixtla, Mexico",
    anio: "2006",
    resumen: "During a Mass in October 2006, a consecrated host began to show bloodlike stains shortly after Communion. The case was brought to the attention of the local bishop, who authorized its preservation and subsequent study.\n\nBolivian researcher Ricardo Castañón Gómez reported findings of tissue with recent biological activity, including white blood cells, which in his judgment would indicate an origin other than simple contamination.\n\nAs in other modern cases, it should be noted that these analyses have been questioned by independent scientists, who point to possible bacterial contamination as an alternative natural explanation.",
    dato: "It is one of the few Eucharistic miracle cases documented in Mexico in recent times.",
    estado: "A matter of local devotion and study; without a widely publicized formal canonical declaration.",
  },
  {
    id: "sokolka",
    titulo: "The Miracle of Sokółka",
    lugar: "Sokółka, Poland",
    anio: "2008",
    resumen: "In October 2008, a consecrated host fell to the floor during Communion at the parish of St. Anthony. Following liturgical norms, a priest placed it in a container of water (the 'vasculum') so it would dissolve.\n\nA week later, a nun checking the container found that, instead of dissolving, a red-colored stain had appeared in the center of the host fragment. The case was reported to the Archbishop of Białystok, who appointed an investigative commission.\n\nThe histopathological analysis, carried out by specialists at the Medical University of Białystok, identified human cardiac muscle tissue, with characteristics of tissue in agony. The diocese recognized the event as a sign worthy of veneration.",
    dato: "The host fragment is preserved today in the church of Sokółka, along with documentation of the scientific analysis performed.",
    estado: "Recognized by the Diocese of Białystok as an extraordinary sign worthy of veneration (2011).",
  },
  {
    id: "legnica",
    titulo: "The Miracle of Legnica",
    lugar: "Legnica, Poland",
    anio: "2013",
    resumen: "On Christmas Day 2013, during Communion at the parish of the Holy Spirit, a consecrated host fell to the floor. Following the usual procedure, it was placed in water to dissolve.\n\nWeeks later it was observed that, as in Sokółka, a reddish stain had appeared within the fragment. The Bishop of Legnica commissioned an independent study by forensic specialists at the University of Wrocław.\n\nThe report, made public by the diocese, noted the presence of human myocardial tissue with signs consistent with agonal suffering, in a pattern very similar to that reported in Sokółka and Buenos Aires.",
    dato: "It is the most recent case among those with a public university forensic study and formal episcopal recognition.",
    estado: "Officially recognized by the Bishop of Legnica in 2016, following the study by the University of Wrocław.",
  },
];

function MoreScreen({ onOpenSection, language }) {
  const items = [
    { id: "miracles", icon: "host", color: C.gold, bg: "#F5EDD8", title: t(language, "more_miracles_title"), sub: t(language, "more_miracles_sub") },
    { id: "rosary", icon: "rosary", color: C.periwinkle, bg: "#E4EDF7", title: t(language, "more_rosary_title"), sub: t(language, "more_rosary_sub") },
    { id: "horario", icon: "grid", color: C.blue, bg: "#DDE8F4", title: t(language, "more_horario_title"), sub: t(language, "more_horario_sub") },
  ];
  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.home, paddingBottom: 90 }}>
      <div style={{ padding: "52px 22px 20px" }}>
        <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "more_explore")}</p>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{t(language, "more_title")}</h2>
      </div>
      <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map(it => (
          <button key={it.id} onClick={() => onOpenSection(it.id)} style={{ display: "flex", alignItems: "center", gap: 14, background: C.cream, border: "1px solid " + C.mist, borderLeft: `3px solid ${it.color}`, borderRadius: 14, padding: "16px 16px", cursor: "pointer", textAlign: "left", width: "100%" }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: it.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={it.icon} size={22} color={it.color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>{it.title}</p>
              <p style={{ fontSize: 11, color: C.inkLight, margin: "2px 0 0" }}>{it.sub}</p>
            </div>
            <Icon name="chevron" size={18} color={it.color} />
          </button>
        ))}
      </div>
    </div>
  );
}

function MiraclesScreen({ onBack, language }) {
  const { isTablet, columns } = useViewportInfo();
  const [openId, setOpenId] = useState(null);
  const sheetOverlay = { position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: isTablet ? "center" : "flex-end", justifyContent: "center", padding: isTablet ? 24 : 0 };
  const sheetCard = (extra = {}) => ({ background: C.white, borderRadius: isTablet ? 24 : "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: isTablet ? 480 : 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto", ...extra });
  const miracles = language === "en" ? EUCHARISTIC_MIRACLES_EN : EUCHARISTIC_MIRACLES;
  const active = miracles.find(m => m.id === openId);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.home, paddingBottom: 90 }}>
      {active && (
        <div style={sheetOverlay} onClick={() => setOpenId(null)}>
          <div onClick={e => e.stopPropagation()} style={sheetCard()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>✨ {active.lugar}</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{active.titulo}</p>
                <p style={{ fontSize: 11, color: C.slateLight, margin: "2px 0 0" }}>{active.anio}</p>
              </div>
              <button onClick={() => setOpenId(null)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8, margin: "0 0 20px", whiteSpace: "pre-line" }}>{active.resumen}</p>
            <div style={{ background: C.iceBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 16, borderLeft: `3px solid ${C.gold}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, margin: "0 0 8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "miracles_fact")}</p>
              <p style={{ fontSize: 13, fontStyle: "italic", color: C.inkMid, lineHeight: 1.7, margin: 0 }}>{active.dato}</p>
            </div>
            <div style={{ background: C.fog, borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, margin: "0 0 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "miracles_recognition")}</p>
              <p style={{ fontSize: 12, color: C.inkMid, lineHeight: 1.65, margin: 0 }}>{active.estado}</p>
            </div>
            <button
              onClick={() => shareContent(active.titulo + " (" + active.lugar + ", " + active.anio + ")\n\n" + active.dato + "\n\nCompartido desde Mater 🙏", "Milagro Eucarístico — Mater")}
              style={{ width: "100%", padding: "14px", background: C.iceBlue, border: "none", borderRadius: 14, color: C.navy, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              {t(language, "miracles_share")}
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 8px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
          <Icon name="chevron" size={20} color={C.inkLight} />
        </button>
        <div>
          <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 2px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "more_back")}</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{t(language, "miracles_title")}</h2>
        </div>
      </div>
      <p style={{ fontSize: 12, color: C.inkLight, lineHeight: 1.6, margin: "8px 22px 20px" }}>
        {t(language, "miracles_intro")}
      </p>

      <div style={{ padding: "0 22px", display: "grid", gridTemplateColumns: columns > 1 ? "1fr 1fr" : "1fr", gap: 10 }}>
        {miracles.map(m => (
          <button key={m.id} onClick={() => setOpenId(m.id)} style={{ background: C.cream, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, border: "1px solid " + C.mist, borderLeft: `3px solid ${C.gold}`, cursor: "pointer", textAlign: "left", width: "100%" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.iceBlue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid " + C.mist }}>
              <Icon name="host" size={18} color={C.gold} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>{m.titulo}</p>
              <p style={{ fontSize: 11, color: C.inkLight, margin: "2px 0 0" }}>{m.lugar} · {m.anio}</p>
            </div>
            <Icon name="chevron" size={16} color={C.gold} />
          </button>
        ))}
      </div>
    </div>
  );
}

const MISTERIOS_GOZOSOS = [
  { titulo: "La Anunciación del Ángel a María", texto: "María dice sí sin condiciones, y ese sí la convierte en instrumento dócil en las manos de Dios. Pido hoy esa misma disponibilidad: que mi voluntad no ponga condiciones a lo que Dios quiera hacer conmigo.", fruto: "Disponibilidad" },
  { titulo: "La Visitación de María a su prima Isabel", texto: "María no se guarda para sí el don recibido — corre a servir. Un instrumento fiel no retiene la gracia: la lleva a quien la necesita, con manos y tiempo concretos.", fruto: "Servicio generoso" },
  { titulo: "El Nacimiento de Jesús en Belén", texto: "Dios elige nacer en la pobreza de un pesebre, sin exigir condiciones dignas. Pido la sencillez de quien no necesita brillar para ser útil, sino solo estar disponible.", fruto: "Sencillez" },
  { titulo: "La Presentación de Jesús en el Templo", texto: "María entrega al Niño en el Templo sin retenerlo para sí. Ofrezco hoy lo que más me cuesta soltar, confiando en que Dios lo recibe y lo hace fecundo.", fruto: "Entrega confiada" },
  { titulo: "El Niño Jesús perdido y hallado en el Templo", texto: "Cuando el instrumento se distrae o se aleja, la respuesta no es la culpa sino la búsqueda perseverante. Vuelvo hoy, sin miedo, a buscar a Dios en lo que se me haya extraviado.", fruto: "Perseverancia" },
];
const MISTERIOS_DOLOROSOS = [
  { titulo: "La Oración de Jesús en el Huerto", texto: "Jesús no huye del sufrimiento que su misión exige. Pido la fortaleza de quien no se retira cuando el precio de servir se vuelve alto.", fruto: "Fortaleza" },
  { titulo: "La Flagelación del Señor", texto: "El cuerpo de Cristo se entrega sin resistencia por amor a otros. Uno mis pequeños sacrificios e incomodidades de hoy a ese mismo amor que redime.", fruto: "Sacrificio con amor" },
  { titulo: "La Coronación de espinas", texto: "Jesús es humillado y no responde con desprecio. Pido la humildad de servir aunque no se me reconozca, aunque se burlen de lo que hago por amor.", fruto: "Humildad ante la burla" },
  { titulo: "Jesús con la cruz a cuestas camino al Calvario", texto: "Cristo carga la cruz con la ayuda de Simón — no la lleva completamente solo. Aprendo a dejarme ayudar y a ayudar a quien carga su propia cruz junto a mí.", fruto: "Aceptar y dar ayuda" },
  { titulo: "La Crucifixión y muerte de Jesús", texto: "En la cruz, Jesús se entrega hasta el final sin condiciones. Pido la valentía de no guardarme nada para mí cuando llega el momento de la entrega total.", fruto: "Entrega total" },
];
const MISTERIOS_GLORIOSOS = [
  { titulo: "La Resurrección del Señor", texto: "La muerte no tiene la última palabra sobre quien se entrega con amor. Confío en que lo que hoy ofrezco, por pequeño que parezca, no se pierde sino que da fruto.", fruto: "Confianza" },
  { titulo: "La Ascensión del Señor a los cielos", texto: "Jesús asciende, pero no abandona su misión: la confía a manos humanas. Pido la paz de saber que puedo continuar su obra aunque no vea todos los resultados.", fruto: "Paz en la misión" },
  { titulo: "La Venida del Espíritu Santo", texto: "El Espíritu transforma el miedo de los discípulos en valentía para salir. Pido ese mismo impulso para no quedarme encerrado en mi propia comodidad.", fruto: "Valentía apostólica" },
  { titulo: "La Asunción de María a los cielos", texto: "María, entregada por entero, es llevada por entero a la gloria. Su vida muestra que nada de lo ofrecido con amor queda sin fruto duradero.", fruto: "Esperanza en el fruto" },
  { titulo: "La Coronación de María como Reina", texto: "María reina sirviendo, no dominando. Pido aprender que la verdadera grandeza está en cuánto se ama, no en cuánto se hace notar.", fruto: "Grandeza en el servicio" },
];
const MISTERIOS_LUMINOSOS = [
  { titulo: "El Bautismo de Jesús en el Jordán", texto: "Jesús se coloca entre los pecadores antes de comenzar su misión pública. Pido la humildad de servir desde la cercanía y no desde la distancia.", fruto: "Cercanía humilde" },
  { titulo: "Las Bodas de Caná", texto: "María nota la necesidad antes que nadie y actúa sin protagonismo: «Hagan lo que Él les diga.» Pido esa misma atención discreta a las necesidades que tengo alrededor hoy.", fruto: "Atención discreta" },
  { titulo: "El anuncio del Reino de Dios", texto: "Jesús anuncia el Reino con hechos y palabras sencillas, no con grandes espectáculos. Pido comunicar mi fe con esa misma sencillez y coherencia.", fruto: "Coherencia sencilla" },
  { titulo: "La Transfiguración", texto: "Por un instante, los discípulos ven la gloria escondida en lo cotidiano de Jesús. Pido ojos para reconocer la presencia de Dios en lo ordinario de mi día.", fruto: "Ojos contemplativos" },
  { titulo: "La Institución de la Eucaristía", texto: "Jesús se entrega como alimento, sin reservarse nada. Pido aprender de ese gesto: existir para ser entregado, no para ser guardado.", fruto: "Vida entregada" },
];

const MISTERIOS_GOZOSOS_EN = [
  { titulo: "The Annunciation of the Angel to Mary", texto: "Mary says yes without conditions, and that yes makes her a docile instrument in God's hands. Today I ask for that same availability: that my will place no conditions on what God wants to do with me.", fruto: "Availability" },
  { titulo: "The Visitation of Mary to her Cousin Elizabeth", texto: "Mary does not keep the gift she received for herself — she hurries to serve. A faithful instrument does not hold on to grace: it carries it to whoever needs it, with concrete hands and time.", fruto: "Generous service" },
  { titulo: "The Birth of Jesus in Bethlehem", texto: "God chooses to be born in the poverty of a manger, without demanding worthy conditions. I ask for the simplicity of one who doesn't need to shine to be useful, only to be available.", fruto: "Simplicity" },
  { titulo: "The Presentation of Jesus in the Temple", texto: "Mary hands over the Child in the Temple without holding him back for herself. Today I offer what is hardest for me to let go of, trusting that God receives it and makes it fruitful.", fruto: "Trusting surrender" },
  { titulo: "The Finding of the Child Jesus in the Temple", texto: "When the instrument gets distracted or wanders off, the answer is not guilt but persevering search. Today, without fear, I return to seek God in whatever I have lost.", fruto: "Perseverance" },
];
const MISTERIOS_DOLOROSOS_EN = [
  { titulo: "The Agony of Jesus in the Garden", texto: "Jesus does not flee from the suffering his mission demands. I ask for the strength of one who does not withdraw when the cost of serving grows high.", fruto: "Strength" },
  { titulo: "The Scourging at the Pillar", texto: "Christ's body is given without resistance out of love for others. I unite my small sacrifices and discomforts of today to that same redeeming love.", fruto: "Sacrifice with love" },
  { titulo: "The Crowning with Thorns", texto: "Jesus is humiliated and does not respond with contempt. I ask for the humility to serve even when unrecognized, even when what I do out of love is mocked.", fruto: "Humility before mockery" },
  { titulo: "Jesus Carries the Cross to Calvary", texto: "Christ carries the cross with Simon's help — he does not carry it entirely alone. I learn to let myself be helped and to help whoever carries their own cross beside me.", fruto: "Accepting and giving help" },
  { titulo: "The Crucifixion and Death of Jesus", texto: "On the cross, Jesus gives himself unconditionally to the very end. I ask for the courage to hold nothing back for myself when the moment of total surrender comes.", fruto: "Total surrender" },
];
const MISTERIOS_GLORIOSOS_EN = [
  { titulo: "The Resurrection of the Lord", texto: "Death does not have the last word over one who gives themselves in love. I trust that what I offer today, however small it seems, is not lost but bears fruit.", fruto: "Trust" },
  { titulo: "The Ascension of the Lord into Heaven", texto: "Jesus ascends, but does not abandon his mission: he entrusts it to human hands. I ask for the peace of knowing I can continue his work even without seeing all the results.", fruto: "Peace in the mission" },
  { titulo: "The Descent of the Holy Spirit", texto: "The Spirit turns the disciples' fear into courage to go out. I ask for that same impulse so I don't stay locked in my own comfort.", fruto: "Apostolic courage" },
  { titulo: "The Assumption of Mary into Heaven", texto: "Mary, given entirely, is taken entirely into glory. Her life shows that nothing offered in love remains without lasting fruit.", fruto: "Hope in the fruit" },
  { titulo: "The Coronation of Mary as Queen", texto: "Mary reigns by serving, not by dominating. I ask to learn that true greatness lies in how much one loves, not in how much one is noticed.", fruto: "Greatness in service" },
];
const MISTERIOS_LUMINOSOS_EN = [
  { titulo: "The Baptism of Jesus in the Jordan", texto: "Jesus places himself among sinners before beginning his public mission. I ask for the humility to serve from closeness, not from a distance.", fruto: "Humble closeness" },
  { titulo: "The Wedding at Cana", texto: "Mary notices the need before anyone else and acts without seeking the spotlight: 'Do whatever he tells you.' I ask for that same quiet attentiveness to the needs around me today.", fruto: "Quiet attentiveness" },
  { titulo: "The Proclamation of the Kingdom of God", texto: "Jesus announces the Kingdom with simple deeds and words, not with great spectacles. I ask to communicate my faith with that same simplicity and consistency.", fruto: "Simple consistency" },
  { titulo: "The Transfiguration", texto: "For an instant, the disciples see the glory hidden in Jesus's everyday life. I ask for eyes to recognize God's presence in the ordinary of my day.", fruto: "Contemplative eyes" },
  { titulo: "The Institution of the Eucharist", texto: "Jesus gives himself as food, holding nothing back. I ask to learn from that gesture: to exist in order to be given, not to be kept.", fruto: "A life given" },
];

function misterioDelDia(language) {
  const en = language === "en";
  const day = new Date().getDay();
  if (day === 1 || day === 6) return { nombre: en ? "Joyful Mysteries" : "Misterios Gozosos", items: en ? MISTERIOS_GOZOSOS_EN : MISTERIOS_GOZOSOS };
  if (day === 2 || day === 5) return { nombre: en ? "Sorrowful Mysteries" : "Misterios Dolorosos", items: en ? MISTERIOS_DOLOROSOS_EN : MISTERIOS_DOLOROSOS };
  if (day === 4) return { nombre: en ? "Luminous Mysteries" : "Misterios Luminosos", items: en ? MISTERIOS_LUMINOSOS_EN : MISTERIOS_LUMINOSOS };
  return { nombre: en ? "Glorious Mysteries" : "Misterios Gloriosos", items: en ? MISTERIOS_GLORIOSOS_EN : MISTERIOS_GLORIOSOS };
}

const ORACION_PADRENUESTRO = {
  es: "Padre nuestro, que estás en el cielo,\nsantificado sea tu Nombre;\nvenga a nosotros tu reino;\nhágase tu voluntad en la tierra como en el cielo.\nDanos hoy nuestro pan de cada día;\nperdona nuestras ofensas,\ncomo también nosotros perdonamos a los que nos ofenden;\nno nos dejes caer en la tentación,\ny líbranos del mal.\nAmén.",
  en: "Our Father, who art in heaven,\nhallowed be thy name;\nthy kingdom come,\nthy will be done\non earth as it is in heaven.\nGive us this day our daily bread;\nand forgive us our trespasses,\nas we forgive those who trespass against us;\nand lead us not into temptation,\nbut deliver us from evil.\nAmen.",
};
const ORACION_AVEMARIA = {
  es: "Dios te salve, María, llena eres de gracia, el Señor es contigo.\nBendita tú eres entre todas las mujeres,\ny bendito es el fruto de tu vientre, Jesús.\nSanta María, Madre de Dios,\nruega por nosotros, pecadores,\nahora y en la hora de nuestra muerte.\nAmén.",
  en: "Hail Mary, full of grace, the Lord is with thee.\nBlessed art thou amongst women,\nand blessed is the fruit of thy womb, Jesus.\nHoly Mary, Mother of God,\npray for us sinners,\nnow and at the hour of our death.\nAmen.",
};
const ORACION_GLORIA = {
  es: "Gloria al Padre, y al Hijo, y al Espíritu Santo.\nComo era en el principio, ahora y siempre,\npor los siglos de los siglos.\nAmén.",
  en: "Glory be to the Father, and to the Son, and to the Holy Spirit.\nAs it was in the beginning, is now, and ever shall be,\nworld without end.\nAmen.",
};
const ORACION_FATIMA = {
  es: "Oh Jesús mío, perdona nuestros pecados,\nlíbranos del fuego del infierno,\nlleva al cielo a todas las almas,\nespecialmente a las más necesitadas de tu misericordia.",
  en: "O my Jesus, forgive us our sins,\nsave us from the fires of hell,\nlead all souls to Heaven,\nespecially those most in need of your mercy.",
};
const ORACION_CREDO = {
  es: "Creo en Dios, Padre todopoderoso, creador del cielo y de la tierra.\nCreo en Jesucristo, su único Hijo, nuestro Señor,\nque fue concebido por obra y gracia del Espíritu Santo,\nnació de Santa María Virgen,\npadeció bajo el poder de Poncio Pilato,\nfue crucificado, muerto y sepultado,\ndescendió a los infiernos,\nal tercer día resucitó de entre los muertos,\nsubió a los cielos\ny está sentado a la derecha de Dios, Padre todopoderoso.\nDesde allí ha de venir a juzgar a vivos y muertos.\nCreo en el Espíritu Santo,\nla santa Iglesia católica,\nla comunión de los santos,\nel perdón de los pecados,\nla resurrección de la carne\ny la vida eterna.\nAmén.",
  en: "I believe in God, the Father almighty, creator of heaven and earth.\nI believe in Jesus Christ, his only Son, our Lord,\nwho was conceived by the Holy Spirit,\nborn of the Virgin Mary,\nsuffered under Pontius Pilate,\nwas crucified, died, and was buried;\nhe descended into hell;\non the third day he rose again from the dead;\nhe ascended into heaven,\nand is seated at the right hand of God the Father almighty;\nfrom there he will come to judge the living and the dead.\nI believe in the Holy Spirit,\nthe holy catholic Church,\nthe communion of saints,\nthe forgiveness of sins,\nthe resurrection of the body,\nand life everlasting.\nAmen.",
};
const ORACION_SALVE = {
  es: "Dios te salve, Reina y Madre de misericordia,\nvida, dulzura y esperanza nuestra; Dios te salve.\nA ti llamamos los desterrados hijos de Eva;\na ti suspiramos, gimiendo y llorando,\nen este valle de lágrimas.\nEa, pues, Señora, abogada nuestra,\nvuelve a nosotros esos tus ojos misericordiosos;\ny después de este destierro muéstranos a Jesús,\nfruto bendito de tu vientre.\n¡Oh clementísima, oh piadosa, oh dulce siempre Virgen María!\nRuega por nosotros, Santa Madre de Dios,\npara que seamos dignos de alcanzar las promesas de Cristo.\nAmén.",
  en: "Hail, Holy Queen, Mother of Mercy,\nour life, our sweetness, and our hope.\nTo thee do we cry, poor banished children of Eve;\nto thee do we send up our sighs,\nmourning and weeping in this valley of tears.\nTurn then, most gracious advocate,\nthine eyes of mercy toward us;\nand after this our exile,\nshow unto us the blessed fruit of thy womb, Jesus.\nO clement, O loving, O sweet Virgin Mary!\nPray for us, O holy Mother of God,\nthat we may be made worthy of the promises of Christ.\nAmen.",
};

function construirPasosRosario(misterios, language) {
  const L = language === "en" ? "en" : "es";
  const tt = {
    signOfCross: L === "en" ? "Sign of the Cross" : "Señal de la Cruz",
    signOfCrossText: L === "en"
      ? "In the sign of the Holy Cross, deliver us from our enemies, O Lord our God.\nIn the name of the Father, and of the Son, and of the Holy Spirit.\nAmen."
      : "Por la señal de la Santa Cruz, de nuestros enemigos líbranos, Señor, Dios nuestro.\nEn el nombre del Padre, y del Hijo, y del Espíritu Santo.\nAmén.",
    prepTitle: L === "en" ? "Opening prayer" : "Oración preparatoria",
    prepText: L === "en"
      ? "Before I begin, I make silence.\n\nI shut out the noise from outside and within, and I ask you, Lord, to let your light enter what I am about to meditate on.\n\nI want to pray this Rosary letting myself be shaped as an instrument available in your hands and in Mary's, without conditions or reservations.\n\nTake this time of prayer and make it fruitful."
      : "Antes de comenzar, hago silencio.\n\nCierro los ruidos de fuera y los de dentro, y te pido, Señor, que tu luz entre en lo que voy a meditar.\n\nQuiero rezar este Rosario dejándome moldear como un instrumento disponible en tus manos y en las de María, sin condiciones ni reservas.\n\nToma este tiempo de oración y hazlo fecundo.",
    creedTitle: L === "en" ? "Apostles' Creed" : "Credo de los Apóstoles",
    ourFatherTitle: L === "en" ? "Our Father" : "Padre Nuestro",
    hailMary1: L === "en" ? "Hail Mary (1 of 3 — for faith)" : "Ave María (1 de 3 — por la fe)",
    hailMary2: L === "en" ? "Hail Mary (2 of 3 — for hope)" : "Ave María (2 de 3 — por la esperanza)",
    hailMary3: L === "en" ? "Hail Mary (3 of 3 — for charity)" : "Ave María (3 de 3 — por la caridad)",
    gloryTitle: L === "en" ? "Glory Be" : "Gloria",
    mysteryTitle: L === "en" ? "Mystery" : "Misterio",
    hailMaryOf10: L === "en" ? "Hail Mary" : "Ave María",
    of10: L === "en" ? "of 10" : "de 10",
    fatimaTitle: L === "en" ? "Fatima Prayer" : "Oración de Fátima",
    salveTitle: L === "en" ? "Hail Holy Queen" : "Salve — Dios te salve, Reina y Madre",
    offeringTitle: L === "en" ? "Closing offering" : "Ofrenda final",
    offeringText: L === "en"
      ? "Receive, Lord, this time of prayer.\n\nTake what I am and what I have, and keep forming me as an instrument available in your hands and in Mary's, for the good of those you place on my path today.\n\nAmen."
      : "Recibe, Señor, este tiempo de oración.\n\nToma lo que soy y lo que tengo, y sigue formándome como un instrumento disponible en tus manos y en las de María, para el bien de quienes hoy pongas en mi camino.\n\nAmén.",
    finalTitle: L === "en" ? "Amen 🙏" : "Amén 🙏",
    finalText: L === "en"
      ? "You have finished your Holy Rosary. May Mary intercede for all your intentions today."
      : "Has terminado tu Santo Rosario. Que María interceda por todas tus intenciones de hoy.",
  };
  const pasos = [
    { tipo: "intro", titulo: tt.signOfCross, texto: tt.signOfCrossText },
    { tipo: "preparacion", titulo: tt.prepTitle, texto: tt.prepText },
    { tipo: "credo", titulo: tt.creedTitle, texto: ORACION_CREDO[L] },
    { tipo: "padrenuestro", titulo: tt.ourFatherTitle, texto: ORACION_PADRENUESTRO[L] },
    { tipo: "avemaria", titulo: tt.hailMary1, texto: ORACION_AVEMARIA[L] },
    { tipo: "avemaria", titulo: tt.hailMary2, texto: ORACION_AVEMARIA[L] },
    { tipo: "avemaria", titulo: tt.hailMary3, texto: ORACION_AVEMARIA[L] },
    { tipo: "gloria", titulo: tt.gloryTitle, texto: ORACION_GLORIA[L] },
  ];
  misterios.items.forEach((m, i) => {
    pasos.push({ tipo: "misterio", titulo: `${tt.mysteryTitle} ${i + 1}: ${m.titulo}`, texto: m.texto, fruto: m.fruto });
    pasos.push({ tipo: "padrenuestro", titulo: tt.ourFatherTitle, texto: ORACION_PADRENUESTRO[L] });
    for (let j = 0; j < 10; j++) {
      pasos.push({ tipo: "avemaria", titulo: `${tt.hailMaryOf10} (${j + 1} ${tt.of10})`, texto: ORACION_AVEMARIA[L], decada: i, cuenta: j + 1 });
    }
    pasos.push({ tipo: "gloria", titulo: tt.gloryTitle, texto: ORACION_GLORIA[L] });
    pasos.push({ tipo: "fatima", titulo: tt.fatimaTitle, texto: ORACION_FATIMA[L] });
  });
  pasos.push({ tipo: "salve", titulo: tt.salveTitle, texto: ORACION_SALVE[L] });
  pasos.push({ tipo: "ofrenda", titulo: tt.offeringTitle, texto: tt.offeringText });
  pasos.push({ tipo: "final", titulo: tt.finalTitle, texto: tt.finalText });
  return pasos;
}

function RosaryScreen({ onBack, language }) {
  const { isTablet } = useViewportInfo();
  const misterios = useMemo(() => misterioDelDia(language), [language]);
  const pasos = useMemo(() => construirPasosRosario(misterios, language), [misterios, language]);
  const [iniciado, setIniciado] = useState(false);
  const [idx, setIdx] = useState(0);

  const paso = pasos[idx];
  const totalPasos = pasos.length;
  const esUltimo = idx === totalPasos - 1;

  function siguiente() { if (idx < totalPasos - 1) setIdx(idx + 1); }
  function anterior() { if (idx > 0) setIdx(idx - 1); }
  function reiniciar() { setIdx(0); setIniciado(false); }

  const tipoColor = {
    intro: C.slate, preparacion: C.slate, credo: C.blue, padrenuestro: C.navy, avemaria: C.periwinkle,
    gloria: C.gold, misterio: C.teal, fatima: C.sky, salve: C.gold, ofrenda: C.gold, final: C.gold,
  };
  const color = tipoColor[paso.tipo] || C.navy;

  if (!iniciado) {
    return (
      <div style={{ flex: 1, overflowY: "auto", background: gradients.home, paddingBottom: 90 }}>
        <div style={{ padding: "52px 22px 8px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
            <Icon name="chevron" size={20} color={C.inkLight} />
          </button>
          <div>
            <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 2px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "more_back")}</p>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{t(language, "rosary_title")}</h2>
          </div>
        </div>

        <div style={{ padding: "16px 22px 0" }}>
          <div style={{ borderRadius: 18, background: `linear-gradient(135deg, ${C.periwinkle}, ${C.blue})`, padding: "22px 20px", color: "#fff", marginBottom: 20 }}>
            <p style={{ fontSize: 10, opacity: 0.8, margin: "0 0 4px", letterSpacing: "0.12em", textTransform: "uppercase" }}>{t(language, "rosary_mysteries_today")}</p>
            <p style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", fontFamily: "'Cormorant Garamond', serif" }}>{misterios.nombre}</p>
            <p style={{ fontSize: 11, opacity: 0.85, margin: 0 }}>{new Date().toLocaleDateString(language === "en" ? "en-US" : "es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: C.inkLight, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>{t(language, "rosary_five_mysteries")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {misterios.items.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: C.cream, border: "1px solid " + C.mist, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${C.periwinkle}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.periwinkle, fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, margin: 0 }}>{m.titulo}</p>
                  <p style={{ fontSize: 11, color: C.inkLight, margin: "2px 0 0" }}>{t(language, "rosary_fruit")}: {m.fruto}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setIniciado(true)} style={{ width: "100%", padding: "16px", border: "none", borderRadius: 14, background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {t(language, "rosary_begin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: gradients.home }}>
      <div style={{ padding: "52px 22px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <button onClick={reiniciar} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.inkLight, fontSize: 12 }}>
            <Icon name="chevron" size={16} color={C.inkLight} /> {t(language, "rosary_exit")}
          </button>
          <p style={{ fontSize: 11, color: C.inkLight, margin: 0 }}>{idx + 1} / {totalPasos}</p>
        </div>
        <div style={{ background: C.mist, borderRadius: 100, height: 5, overflow: "hidden" }}>
          <div style={{ width: `${((idx + 1) / totalPasos) * 100}%`, height: "100%", background: color, borderRadius: 100, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 22px 20px", display: "flex", flexDirection: "column" }}>
        <div style={{ background: C.cream, borderRadius: 18, padding: "22px 20px", border: "1px solid " + C.mist, borderLeft: `4px solid ${color}`, flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>
            {paso.tipo === "misterio" ? misterios.nombre : paso.decada !== undefined ? `${t(language, "rosary_decade")} ${paso.decada + 1} ${t(language, "rosary_of_5")}` : ""}
          </p>
          <p style={{ fontSize: 17, fontWeight: 700, color: C.ink, margin: "0 0 14px", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.3 }}>{paso.titulo}</p>
          <p style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.85, margin: 0, whiteSpace: "pre-line" }}>{paso.texto}</p>
          {paso.fruto && (
            <div style={{ marginTop: 16, background: C.iceBlue, borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ fontSize: 11, color: C.blue, fontWeight: 700, margin: 0 }}>{t(language, "rosary_fruit_of_mystery")}: {paso.fruto}</p>
            </div>
          )}
        </div>

        {paso.decada !== undefined && (
          <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i < paso.cuenta ? color : C.mist }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 22px 90px", display: "flex", gap: 10 }}>
        <button onClick={anterior} disabled={idx === 0} style={{ flex: 1, padding: "15px", border: "1px solid " + C.mist, borderRadius: 14, background: C.white, color: C.inkMid, fontSize: 13, fontWeight: 600, cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.4 : 1, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          {t(language, "rosary_previous")}
        </button>
        <button onClick={esUltimo ? reiniciar : siguiente} style={{ flex: 2, padding: "15px", border: "none", borderRadius: 14, background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          {esUltimo ? t(language, "rosary_finish") : t(language, "rosary_next")}
        </button>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════
// HORARIO ESPIRITUAL (menú "Más")
// ═══════════════════════════════════════════════════════════════════════

const DEFAULT_MONTHLY_ITEMS = ["Visita al Santuario", "Visita al Santísimo", "Confesión", "Acompañamiento espiritual", "Eucaristía"];
const DEFAULT_MONTHLY_ITEMS_EN = ["Visit to the Shrine", "Visit to the Blessed Sacrament", "Confession", "Spiritual accompaniment", "Eucharist"];
const MONTHLY_SLOTS = 4;
const BLANK_PURPOSE_SLOTS = 5; // "Propósitos" en blanco para llenar
const FIXED_PURPOSE_CATEGORIES = [
  "Mi relación con Dios",
  "Mi relación conmigo mismo (a)",
  "Mi relación con mis hermanos",
  "Mi relación con las cosas, la naturaleza, el trabajo",
  "Grupo de vida",
];
const FIXED_PURPOSE_CATEGORIES_EN = [
  "My relationship with God",
  "My relationship with myself",
  "My relationship with my brothers and sisters",
  "My relationship with things, nature, work",
  "Life group",
];
const DAY_CELL_SIZE = 30;
const HORARIO_LABEL_WIDTH = 210;
const HORARIO_ROW_HEIGHT = 52;
const HORARIO_HEADER_HEIGHT = 28;

function pad2(n) { return String(n).padStart(2, "0"); }
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }

function scheduleHorarioReminder(time) {
  if (window._materHorarioTimer) clearTimeout(window._materHorarioTimer);
  if (!time || Notification.permission !== "granted") return;
  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  let target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const delay = target.getTime() - now.getTime();
  window._materHorarioTimer = setTimeout(() => {
    new Notification("Mater 🕊️ Horario Espiritual", {
      body: "Es momento de revisar tu Horario Espiritual de hoy.",
      icon: "/logo.jpeg",
      badge: "/logo.jpeg",
    });
    scheduleHorarioReminder(time);
  }, delay);
}

// Celda de NOMBRE — vive en la columna fija (NUNCA se mueve, no hay scroll aquí).
function HorarioLabelCell({
  item, isMonthly, isGeneral, placeholder,
  editingId, editValue, setEditingId, setEditValue,
  saveItemName, deleteItem,
}) {
  const isEditing = editingId === item.id;
  const isBlank = item.name === "" && !isEditing;
  return (
   <div style={{ height: HORARIO_ROW_HEIGHT, display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderBottom: "1px solid " + C.mist, background: C.white, overflow: "hidden" }}>
      {isEditing ? (
        <textarea
          autoFocus
          defaultValue={item.name}
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => saveItemName(item.id, isGeneral)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveItemName(item.id, isGeneral); } }}
          placeholder={placeholder}
          rows={1}
          style={{ flex: 1, minWidth: 0, border: "none", outline: "none", borderBottom: "1px solid " + C.mist, fontSize: 11.5, color: C.ink, background: "transparent", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "2px 0", resize: "none", lineHeight: 1.3 }}
        />
      ) : (
        <button onClick={() => { setEditingId(item.id); setEditValue(item.name); }} style={{ flex: 1, minWidth: 0, background: "none", border: "none", textAlign: "left", padding: 0, cursor: "pointer" }}>
          <p style={{
            fontSize: 11.5, color: isBlank ? C.inkLight : C.ink, fontWeight: isBlank ? 400 : 600,
            margin: 0, fontStyle: isBlank ? "italic" : "normal", lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", wordBreak: "break-word",
          }}>
            {isBlank ? placeholder : item.name}
          </p>
        </button>
      )}
      {!isMonthly && !isGeneral && (
        <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0, alignSelf: "flex-start" }}>
          <Icon name="trash" size={12} color={C.inkLight} />
        </button>
      )}
    </div>
  );
}

// Fila de CÍRCULOS de días — vive en la columna que SÍ hace scroll horizontal.
function HorarioDaysRow({ item, isMonthly, totalDays, monthKey, checks, toggleDaily, toggleMonthly }) {
  return (
    <div style={{ height: HORARIO_ROW_HEIGHT, display: "flex", alignItems: "center", borderBottom: "1px solid " + C.mist, width: totalDays * DAY_CELL_SIZE }}>
      {Array.from({ length: isMonthly ? MONTHLY_SLOTS : totalDays }).map((_, i) => {
        const slotIdx = i + 1;
        const checkKey = isMonthly ? `${monthKey}-slot${slotIdx}` : `${monthKey}-${pad2(slotIdx)}`;
        const done = !!checks[`${item.id}:${checkKey}`];
        return (
          <button
            key={i}
            onClick={() => isMonthly ? toggleMonthly(item.id, slotIdx) : toggleDaily(item.id, slotIdx)}
            style={{ width: DAY_CELL_SIZE, height: DAY_CELL_SIZE, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}
          >
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${done ? C.gold : C.mist}`, background: done ? C.gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {done && <svg width={9} height={9} viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Tabla completa: columna de nombres fija (izquierda) + columna de días con scroll (derecha).
function HorarioTable({
  rows, isMonthly, totalDays, monthKey, checks,
  editingId, editValue, setEditingId, setEditValue,
  saveItemName, deleteItem, toggleDaily, toggleMonthly,
  scrollRef,
}) {
  const slotCount = isMonthly ? MONTHLY_SLOTS : totalDays;
  return (
    <div style={{ margin: "0 22px", border: "1px solid " + C.mist, borderRadius: 12, background: C.white, display: "flex", overflow: "hidden" }}>
      {/* Columna fija — nunca se mueve */}
      <div style={{ width: HORARIO_LABEL_WIDTH, flexShrink: 0, borderRight: "1px solid " + C.mist }}>
        <div style={{ height: HORARIO_HEADER_HEIGHT, borderBottom: "2px solid " + C.mist }} />
        {rows.map(({ item, placeholder, isGeneral }) => (
          <HorarioLabelCell
            key={item.id}
            item={item}
            isMonthly={isMonthly}
            isGeneral={!!isGeneral}
            placeholder={placeholder}
            editingId={editingId}
            editValue={editValue}
            setEditingId={setEditingId}
            setEditValue={setEditValue}
            saveItemName={saveItemName}
            deleteItem={deleteItem}
          />
        ))}
      </div>
      {/* Columna con scroll horizontal — solo los días.
          minWidth:0 es OBLIGATORIO: sin esto, un hijo flex con overflow-x:auto
          no se reduce y empuja a sus hermanos fuera de pantalla. */}
      <div ref={scrollRef} style={{ overflowX: isMonthly ? "hidden" : "auto", flex: "1 1 0%", minWidth: 0 }}>
        <div style={{ display: "flex", height: HORARIO_HEADER_HEIGHT, borderBottom: "2px solid " + C.mist, width: slotCount * DAY_CELL_SIZE }}>
          {Array.from({ length: slotCount }).map((_, i) => (
            <div key={i} style={{ width: DAY_CELL_SIZE, flexShrink: 0, textAlign: "center", fontSize: 9, color: C.inkLight, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i + 1}
            </div>
          ))}
        </div>
        {rows.map(({ item }) => (
          <HorarioDaysRow
            key={item.id}
            item={item}
            isMonthly={isMonthly}
            totalDays={totalDays}
            monthKey={monthKey}
            checks={checks}
            toggleDaily={toggleDaily}
            toggleMonthly={toggleMonthly}
          />
        ))}
      </div>
    </div>
  );
}

function PropositosTable({
  groups, totalDays, monthKey, checks,
  editingId, editValue, setEditingId, setEditValue,
  saveItemName, deleteItem, toggleDaily,
  addPurposeItem, addCategory, scrollRef, language,
}) {
  return (
    <div style={{ margin: "0 22px", border: "1px solid " + C.mist, borderRadius: 12, background: C.white, display: "flex", overflow: "hidden" }}>
      <div style={{ width: HORARIO_LABEL_WIDTH, flexShrink: 0, borderRight: "1px solid " + C.mist }}>
        <div style={{ height: HORARIO_HEADER_HEIGHT, borderBottom: "2px solid " + C.mist }} />
        {groups.map(group => (
         <div key={group.categoria}>
            <div style={{ height: 44, display: "flex", alignItems: "center", padding: "6px 10px", background: C.navy, borderBottom: "1px solid " + C.mist, borderTop: "1px solid " + C.mist, overflow: "hidden" }}>
              <p style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "0.03em", textTransform: "uppercase", lineHeight: 1.25, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {group.categoria}
              </p>
            </div>
            {group.items.map(item => (
              <HorarioLabelCell
                key={item.id}
                item={item}
                isMonthly={false}
                isGeneral={false}
                placeholder={t(language, "horario_purpose_placeholder")}
                editingId={editingId}
                editValue={editValue}
                setEditingId={setEditingId}
                setEditValue={setEditValue}
                saveItemName={saveItemName}
                deleteItem={deleteItem}
              />
            ))}
            <div style={{ height: 34, display: "flex", alignItems: "center", borderBottom: "1px solid " + C.mist }}>
              <button onClick={() => addPurposeItem(group.categoria)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="plus" size={11} color={C.blue} />
                <span style={{ fontSize: 10.5, color: C.blue, fontWeight: 600 }}>{t(language, "horario_add_purpose")}</span>
              </button>
            </div>
          </div>
        ))}
        <div style={{ height: 38, display: "flex", alignItems: "center" }}>
          <button onClick={addCategory} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 10px", display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="plus" size={12} color={C.gold} />
            <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>{t(language, "horario_new_category")}</span>
          </button>
        </div>
      </div>
      <div ref={scrollRef} style={{ overflowX: "auto", flex: "1 1 0%", minWidth: 0 }}>
        <div style={{ display: "flex", height: HORARIO_HEADER_HEIGHT, borderBottom: "2px solid " + C.mist }}>
          {Array.from({ length: totalDays }).map((_, i) => (
            <div key={i} style={{ width: DAY_CELL_SIZE, flexShrink: 0, textAlign: "center", fontSize: 9, color: C.inkLight, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i + 1}
            </div>
          ))}
        </div>
        {groups.map(group => (
          <div key={group.categoria}>
            <div style={{ height: 44, background: C.navy, borderBottom: "1px solid " + C.mist, borderTop: "1px solid " + C.mist, width: totalDays * DAY_CELL_SIZE }} />
            {group.items.map(item => (
              <HorarioDaysRow
                key={item.id}
                item={item}
                isMonthly={false}
                totalDays={totalDays}
                monthKey={monthKey}
                checks={checks}
                toggleDaily={toggleDaily}
                toggleMonthly={() => {}}
              />
            ))}
            <div style={{ height: 34, borderBottom: "1px solid " + C.mist }} />
          </div>
        ))}
        <div style={{ height: 38 }} />
      </div>
    </div>
  );
}

function HorarioEspiritualScreen({ user, onBack, language }) {
  const { isTablet } = useViewportInfo();
  const [generalItem, setGeneralItem] = useState(null);
  const [items, setItems] = useState([]);
  const [monthlyItems, setMonthlyItems] = useState([]);
  const [checks, setChecks] = useState({});
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [remindOpen, setRemindOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(() => localStorage.getItem("mater_horario_notif_enabled") === "true");
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem("mater_horario_notif_time") || "20:00");
  const [reminderStatus, setReminderStatus] = useState("");
  const scrollRef = useRef(null);

  const monthKey = `${year}-${pad2(month + 1)}`;
  const totalDays = daysInMonth(year, month);
  const monthLabel = new Date(year, month, 1).toLocaleDateString(language === "en" ? "en-US" : "es-ES", { month: "long", year: "numeric" });

  useEffect(() => { loadItems(); }, [user]);
  useEffect(() => { if (generalItem || items.length || monthlyItems.length) loadChecks(); }, [month, year, generalItem, items, monthlyItems]);

  async function loadItems() {
    setLoading(true);
    let { data } = await supabase.from("spiritual_schedule_items").select("*").eq("user_id", user.id).order("position");
    if (!data || data.length === 0) {
      const seed = [
        { user_id: user.id, name: "", position: 0, is_monthly: false, is_general: true },
        ...(language === "en" ? FIXED_PURPOSE_CATEGORIES_EN : FIXED_PURPOSE_CATEGORIES).map((cat, i) => ({ user_id: user.id, name: "", position: i, is_monthly: false, is_general: false, categoria: cat })),
        ...(language === "en" ? DEFAULT_MONTHLY_ITEMS_EN : DEFAULT_MONTHLY_ITEMS).map((name, i) => ({ user_id: user.id, name, position: i, is_monthly: true, is_general: false })),
      ];
      const { data: inserted } = await supabase.from("spiritual_schedule_items").insert(seed).select();
      data = inserted || [];
    }
    setGeneralItem(data.find(d => d.is_general) || null);
    setItems(data.filter(d => !d.is_monthly && !d.is_general).sort((a, b) => a.position - b.position));
    setMonthlyItems(data.filter(d => d.is_monthly).sort((a, b) => a.position - b.position));
    setLoading(false);
  }

  async function loadChecks() {
    const { data } = await supabase.from("spiritual_schedule_checks").select("*").eq("user_id", user.id).like("check_key", `${monthKey}%`);
    const map = {};
    (data || []).forEach(c => { map[`${c.item_id}:${c.check_key}`] = c.completed; });
    setChecks(map);
  }

  async function toggleDaily(itemId, day) {
    const checkKey = `${monthKey}-${pad2(day)}`;
    const mapKey = `${itemId}:${checkKey}`;
    const current = !!checks[mapKey];
    setChecks(prev => ({ ...prev, [mapKey]: !current }));
    if (!current) {
      await supabase.from("spiritual_schedule_checks").upsert(
        { user_id: user.id, item_id: itemId, check_key: checkKey, completed: true },
        { onConflict: "user_id,item_id,check_key" }
      );
    } else {
      await supabase.from("spiritual_schedule_checks").delete().eq("user_id", user.id).eq("item_id", itemId).eq("check_key", checkKey);
    }
  }

  async function toggleMonthly(itemId, slot) {
    const checkKey = `${monthKey}-slot${slot}`;
    const mapKey = `${itemId}:${checkKey}`;
    const current = !!checks[mapKey];
    setChecks(prev => ({ ...prev, [mapKey]: !current }));
    if (!current) {
      await supabase.from("spiritual_schedule_checks").upsert(
        { user_id: user.id, item_id: itemId, check_key: checkKey, completed: true },
        { onConflict: "user_id,item_id,check_key" }
      );
    } else {
      await supabase.from("spiritual_schedule_checks").delete().eq("user_id", user.id).eq("item_id", itemId).eq("check_key", checkKey);
    }
  }

  async function saveItemName(itemId, isGeneral) {
    const name = editValue.trim();
    await supabase.from("spiritual_schedule_items").update({ name }).eq("id", itemId).eq("user_id", user.id);
    if (isGeneral) {
      setGeneralItem(prev => ({ ...prev, name }));
    } else {
      setItems(prev => prev.map(it => it.id === itemId ? { ...it, name } : it));
    }
    setEditingId(null);
  }

  async function addPurposeItem(categoria) {
    const maxPos = items.length ? Math.max(...items.map(it => it.position)) : -1;
    const { data } = await supabase.from("spiritual_schedule_items").insert({ user_id: user.id, name: "", position: maxPos + 1, is_monthly: false, is_general: false, categoria }).select().single();
    if (data) setItems(prev => [...prev, data]);
  }

  async function addCategory() {
    const nombre = window.prompt(t(language, "horario_category_prompt"));
    if (!nombre || !nombre.trim()) return;
    await addPurposeItem(nombre.trim());
  }

  async function deleteItem(itemId) {
    await supabase.from("spiritual_schedule_items").delete().eq("id", itemId).eq("user_id", user.id);
    await supabase.from("spiritual_schedule_checks").delete().eq("user_id", user.id).eq("item_id", itemId);
    setItems(prev => prev.filter(it => it.id !== itemId));
  }

  async function toggleReminder() {
    if (!reminderEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setReminderEnabled(true);
        localStorage.setItem("mater_horario_notif_enabled", "true");
        scheduleHorarioReminder(reminderTime);
        setReminderStatus(t(language, "horario_reminder_granted"));
      } else {
        setReminderStatus(t(language, "horario_reminder_denied"));
      }
    } else {
      setReminderEnabled(false);
      localStorage.setItem("mater_horario_notif_enabled", "false");
      if (window._materHorarioTimer) clearTimeout(window._materHorarioTimer);
    }
    setTimeout(() => setReminderStatus(""), 3000);
  }

  function updateReminderTime(value) {
    setReminderTime(value);
    localStorage.setItem("mater_horario_notif_time", value);
    if (reminderEnabled) scheduleHorarioReminder(value);
  }

  function changeMonth(delta) {
    let m = month + delta, y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  }
async function exportarInformePDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const navy = [44, 62, 107];
    const gold = [168, 134, 74];
    const ink = [28, 43, 58];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(...navy);
    doc.rect(0, 0, pageWidth, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.text(language === "en" ? "My Spiritual Schedule Report" : "Informe de mi Horario Espiritual", 14, 13);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(212, 184, 122);
    doc.text(language === "en" ? "My contribution to the Capital of Graces" : "Mi aporte al Capital de Gracias", 14, 20);

    doc.setTextColor(...ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const mesTexto = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
    doc.text(mesTexto, 14, 34);

    let cursorY = 40;

    function tablaSeccion(titulo, rows, headers) {
      if (rows.length === 0) return;
      if (cursorY > pageHeight - 40) { doc.addPage(); cursorY = 16; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...gold);
      doc.text(titulo, 14, cursorY);
      cursorY += 3;
      doc.autoTable({
        startY: cursorY,
        head: [["", ...headers]],
        body: rows.map(r => [r[0], ...r.slice(1).map(() => "")]),
        styles: { fontSize: 7, halign: "center", cellPadding: 1.3, textColor: ink },
        columnStyles: { 0: { halign: "left", cellWidth: 55, fontStyle: "bold" } },
        headStyles: { fillColor: navy, textColor: 255, fontSize: 6.5 },
        theme: "grid",
        margin: { left: 14, right: 14 },
        didDrawCell: (data) => {
          if (data.section !== "body" || data.column.index === 0) return;
          const marcado = rows[data.row.index][data.column.index] === "✓";
          if (!marcado) return;
          const cx = data.cell.x + data.cell.width / 2;
          const cy = data.cell.y + data.cell.height / 2;
          const r = Math.min(data.cell.width, data.cell.height) / 2 - 0.6;
          doc.setFillColor(...gold);
          doc.circle(cx, cy, r, "F");
        },
      });
      cursorY = doc.lastAutoTable.finalY + 8;
    }

    const dayHeaders = Array.from({ length: totalDays }, (_, i) => String(i + 1));

    if (generalItem) {
      tablaSeccion(language === "en" ? "PERSONAL RESOLUTION" : "PROPÓSITO PARTICULAR", [[
        generalItem.name || "—",
        ...Array.from({ length: totalDays }, (_, i) => checks[`${generalItem.id}:${monthKey}-${pad2(i + 1)}`] ? "✓" : "")
      ]], dayHeaders);
    }

    tablaSeccion(language === "en" ? "RESOLUTIONS" : "PROPÓSITOS", items.map(it => [
      it.name || "—",
      ...Array.from({ length: totalDays }, (_, i) => checks[`${it.id}:${monthKey}-${pad2(i + 1)}`] ? "✓" : "")
    ]), dayHeaders);

    const slotHeaders = Array.from({ length: MONTHLY_SLOTS }, (_, i) => String(i + 1));
    tablaSeccion(language === "en" ? "MONTHLY GOALS" : "METAS MENSUALES", monthlyItems.map(it => [
      it.name,
      ...Array.from({ length: MONTHLY_SLOTS }, (_, i) => checks[`${it.id}:${monthKey}-slot${i + 1}`] ? "✓" : "")
    ]), slotHeaders);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...gold);
    doc.text(
      language === "en"
        ? "«Everything offered to Mary with the intention of love is received by her and transformed into grace for the world.» — Fr. Joseph Kentenich"
        : "«Todo lo que se ofrece a María con intención de amor, es recibido por ella y transformado en gracia para el mundo.» — P. José Kentenich",
      14, pageHeight - 8, { maxWidth: pageWidth - 28 }
    );

    const fileName = `Horario-Espiritual-${monthKey}.pdf`;

    if (Capacitor.isNativePlatform()) {
      try {
        const dataUri = doc.output("datauristring");
        const pdfBase64 = dataUri.substring(dataUri.indexOf(",") + 1);
        const saved = await Filesystem.writeFile({
          path: fileName,
          data: pdfBase64,
          directory: Directory.Cache,
        });
        await Share.share({
          title: language === "en" ? "My Spiritual Schedule Report" : "Informe de mi Horario Espiritual",
          url: saved.uri,
          dialogTitle: language === "en" ? "Save or share your report" : "Guardar o compartir tu informe",
        });
      } catch (err) {
        console.error("Error al compartir el PDF:", err);
      }
    } else {
      doc.save(fileName);
    }
  }
 const groupedCategories = (() => {
    const otherLabel = language === "en" ? "Other resolutions" : "Otros propósitos";
    const map = {};
    items.forEach(it => {
      const cat = it.categoria || otherLabel;
      if (!map[cat]) map[cat] = [];
      map[cat].push(it);
    });
    const order = language === "en" ? [...FIXED_PURPOSE_CATEGORIES_EN] : [...FIXED_PURPOSE_CATEGORIES];
    const extra = Object.keys(map)
      .filter(c => !order.includes(c))
      .sort((a, b) => Math.min(...map[a].map(it => it.position)) - Math.min(...map[b].map(it => it.position)));
    const extraSorted = extra.includes(otherLabel)
      ? [otherLabel, ...extra.filter(c => c !== otherLabel)]
      : extra;
    return [...order, ...extraSorted].map(cat => ({ categoria: cat, items: (map[cat] || []).sort((a, b) => a.position - b.position) }));
  })();
  const sheetOverlay = { position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,50,0.7)", display: "flex", alignItems: isTablet ? "center" : "flex-end", justifyContent: "center", padding: isTablet ? 24 : 0 };
  const sheetCard = (extra = {}) => ({ background: C.white, borderRadius: isTablet ? 24 : "24px 24px 0 0", padding: "24px 22px 48px", width: "100%", maxWidth: isTablet ? 480 : 390, margin: "0 auto", maxHeight: "85vh", overflowY: "auto", ...extra });

  return (
    <div style={{ flex: 1, overflowY: "auto", background: gradients.home, paddingBottom: 90 }}>
      {remindOpen && (
        <div style={sheetOverlay} onClick={() => setRemindOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={sheetCard()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>{t(language, "horario_reminder_title")}</h2>
              <button onClick={() => setRemindOpen(false)} style={{ background: "none", border: "none", fontSize: 22, color: C.slateLight, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.iceBlue, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0 }}>{t(language, "horario_reminder_enable")}</p>
                <p style={{ fontSize: 11, color: C.slateLight, margin: "2px 0 0" }}>{t(language, "horario_reminder_enable_sub")}</p>
              </div>
              <button onClick={toggleReminder} style={{ width: 48, height: 28, borderRadius: 14, border: "none", background: reminderEnabled ? C.navy : C.mist, cursor: "pointer", position: "relative", flexShrink: 0 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: reminderEnabled ? 23 : 3, transition: "left 0.3s" }} />
              </button>
            </div>
            {reminderStatus && <p style={{ fontSize: 12, color: reminderStatus.includes("✓") ? C.blue : "#C0392B", textAlign: "center", marginBottom: 12 }}>{reminderStatus}</p>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: C.ink }}>{t(language, "horario_reminder_time")}</span>
              <input type="time" value={reminderTime} onChange={e => updateReminderTime(e.target.value)} style={{ border: "1px solid " + C.mist, borderRadius: 8, padding: "6px 10px", fontSize: 16, color: C.ink, background: C.fog, fontFamily: "'DM Sans', system-ui, sans-serif" }} />
            </div>
            <p style={{ fontSize: 11, color: C.slateLight, marginTop: 20, lineHeight: 1.6, textAlign: "center" }}>{t(language, "horario_iphone_hint")}</p>
          </div>
        </div>
      )}

      <div style={{ padding: "52px 22px 8px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
          <Icon name="chevron" size={20} color={C.inkLight} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: C.slateLight, margin: "0 0 2px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t(language, "more_back")}</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: C.ink, margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{t(language, "horario_title")}</h2>
        </div>
        <button onClick={() => setRemindOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <Icon name="bell" size={19} color={C.inkLight} />
        </button>
        <button onClick={exportarInformePDF} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, fontSize: 19 }}>
          ⬇️
        </button>
      </div>

      <div style={{ padding: "8px 22px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => changeMonth(-1)} style={{ background: C.cream, border: "1px solid " + C.mist, borderRadius: 10, width: 32, height: 32, cursor: "pointer" }}>‹</button>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: 0, textTransform: "capitalize" }}>{monthLabel}</p>
        <button onClick={() => changeMonth(1)} style={{ background: C.cream, border: "1px solid " + C.mist, borderRadius: 10, width: 32, height: 32, cursor: "pointer" }}>›</button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: C.slateLight, fontSize: 13, marginTop: 32 }}>{t(language, "horario_loading")}</p>
      ) : (
        <>
          <div style={{ padding: "0 22px 6px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.inkLight, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{t(language, "horario_particular_purpose")}</p>
          </div>
          {generalItem && (
            <HorarioTable
              rows={[{ item: generalItem, placeholder: t(language, "horario_purpose_placeholder"), isGeneral: true }]}
              isMonthly={false}
              totalDays={totalDays}
              monthKey={monthKey}
              checks={checks}
              editingId={editingId}
              editValue={editValue}
              setEditingId={setEditingId}
              setEditValue={setEditValue}
              saveItemName={saveItemName}
              deleteItem={deleteItem}
              toggleDaily={toggleDaily}
              toggleMonthly={toggleMonthly}
            />
          )}

          <div style={{ padding: "20px 22px 6px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.inkLight, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{t(language, "horario_purposes")}</p>
          </div>
          <PropositosTable
            groups={groupedCategories}
            totalDays={totalDays}
            monthKey={monthKey}
            checks={checks}
            editingId={editingId}
            editValue={editValue}
            setEditingId={setEditingId}
            setEditValue={setEditValue}
            saveItemName={saveItemName}
            deleteItem={deleteItem}
            toggleDaily={toggleDaily}
            addPurposeItem={addPurposeItem}
            addCategory={addCategory}
            scrollRef={scrollRef}
            language={language}
          />
          <div style={{ padding: "10px 22px 0" }}>
            <button onClick={addPurposeItem} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.blue, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "6px 0" }}>
              <Icon name="plus" size={14} color={C.blue} /> {t(language, "horario_add_purpose")}
            </button>
          </div>

          <div style={{ padding: "20px 22px 6px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.inkLight, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{t(language, "horario_monthly_goals")}</p>
          </div>
          <HorarioTable
            rows={monthlyItems.map(item => ({ item, placeholder: item.name }))}
            isMonthly={true}
            totalDays={totalDays}
            monthKey={monthKey}
            checks={checks}
            editingId={editingId}
            editValue={editValue}
            setEditingId={setEditingId}
            setEditValue={setEditValue}
            saveItemName={saveItemName}
            deleteItem={deleteItem}
            toggleDaily={toggleDaily}
            toggleMonthly={toggleMonthly}
          />
        </>
      )}
    </div>
  );
}
export default function App() {
  const [screen, setScreen] = useState("auth");
  const [activeTab, setActiveTab] = useState("home");
  const [moreSection, setMoreSection] = useState(null); // null | "miracles" | "rosary"
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mater_dark_mode") === "true");
  const [language, setLanguage] = useState(() => localStorage.getItem("mater_language") || "es");
  const { isTablet, contentMaxWidth, keyboardOpen } = useViewportInfo();

  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("mater_dark_mode", String(next));
      return next;
    });
  }

  function changeLanguage(lang) {
    setLanguage(lang);
    localStorage.setItem("mater_language", lang);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        setScreen("app");
      } else {
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
          <div style={{ width: 24, height: 24, border: "3px solid " + C.navy, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  const outerWrap = {
    height: "100vh",
    ...(typeof CSS !== "undefined" && CSS.supports && CSS.supports("height", "100dvh") ? { height: "100dvh" } : {}),
    width: "100%",
    display: "flex",
    justifyContent: "center",
    overflow: "hidden",
    background: isTablet ? (darkMode ? "#0B121C" : "#D8E1EE") : (darkMode ? DARK.iceBlue : C.iceBlue),
  };

  const phone = {
    width: "100%",
    maxWidth: contentMaxWidth,
    height: "100%",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
    display: "flex", flexDirection: "column",
    background: C.iceBlue,
    boxShadow: isTablet ? "0 0 60px rgba(15,30,50,0.18)" : "none",
    filter: darkMode ? "invert(1) hue-rotate(180deg)" : "none",
  };

  const imgFix = darkMode ? `
    .phone-dark img, .phone-dark video { filter: invert(1) hue-rotate(180deg); }
  ` : "";

  return (
    <>
      <style>{globalStyles}</style>
      <style>{imgFix}</style>
      <div style={outerWrap}>
      <div style={phone} className={darkMode ? "phone-dark" : ""}>
        {screen === "landing" && <LandingScreen onEnter={() => setScreen("onboarding")} language={language} />}
        {screen === "onboarding" && <OnboardingScreen onComplete={handleOnboardingComplete} language={language} />}
        {screen === "auth" && <AuthScreen onAuth={() => setScreen("app")} language={language} />}
        {screen === "app" && user && (
          <>
            {activeTab === "home" && <HomeScreen user={user} profile={profile} onTabChange={setActiveTab} darkMode={darkMode} language={language} />}
            {activeTab === "chat" && <ChatScreen user={user} darkMode={darkMode} language={language} />}
            {activeTab === "plan" && <PlanScreen user={user} darkMode={darkMode} language={language} />}
            {activeTab === "diary" && <DiaryScreen user={user} darkMode={darkMode} language={language} />}
            {activeTab === "more" && moreSection === null && <MoreScreen onOpenSection={setMoreSection} language={language} />}
            {activeTab === "more" && moreSection === "miracles" && <MiraclesScreen onBack={() => setMoreSection(null)} language={language} />}
            {activeTab === "more" && moreSection === "rosary" && <RosaryScreen onBack={() => setMoreSection(null)} language={language} />}
            {activeTab === "more" && moreSection === "horario" && <HorarioEspiritualScreen user={user} onBack={() => setMoreSection(null)} language={language} />}
            {activeTab === "profile" && <ProfileScreen user={user} profile={profile} setProfile={setProfile} onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} language={language} changeLanguage={changeLanguage} />}
            {!keyboardOpen && (
              <NavBar
                active={activeTab}
                onChange={(id) => { if (id !== "more") setMoreSection(null); setActiveTab(id); }}
                darkMode={darkMode}
                language={language}
              />
            )}
          </>
        )}
      </div>
      </div>
    </>
  );
}
