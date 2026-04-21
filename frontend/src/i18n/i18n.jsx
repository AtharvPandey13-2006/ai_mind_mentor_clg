import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const dictionaries = {
  en: {
    app: {
      title: 'MindMentor',
      dashboard: 'Dashboard',
      login: 'Login',
      logout: 'Logout',
      language: 'Language',
      greetingMorning: 'Good morning',
      greetingAfternoon: 'Good afternoon',
      greetingEvening: 'Good evening',
      reduceMotion: 'Reduce motion',
    },
    tabs: {
      overview: 'Overview',
      career: 'Career Mentor',
      emotional: 'Emotional Support',
      mood: 'Mood Journal',
      roadmap: 'Career Roadmap',
      profile: 'Profile',
      brain: 'Career Brain',
    },
    dashboard: {
      dayStreak: 'Day Streak',
    },
    graph: {
      title: 'Personal Career Brain',
      ingestTitle: 'Build your knowledge graph',
      resumePlaceholder: 'Paste your resume (optional)',
      github: 'GitHub Username',
      linkedin: 'LinkedIn URL (optional)',
      leetcode: 'LeetCode Username (optional)',
      targetRole: 'Target Role (optional)',
      buildGraph: 'Build Graph',
      currentGraph: 'Current Graph',
      futureGraph: 'Future Graph',
      nextBest: 'Next best recommendations',
      skills: 'Skills',
      projects: 'Projects',
      jobs: 'Roles',
    },
    gantt: {
      title: 'Roadmap Timeline',
    },
    quests: {
      title: 'Quests',
      accept: 'Accept',
      complete: 'Complete',
    },
  },
  hi: {
    app: { title: 'माइंड मेंटर', dashboard: 'डैशबोर्ड', login: 'लॉगिन', logout: 'लॉगआउट', language: 'भाषा', greetingMorning: 'सुप्रभात', greetingAfternoon: 'शुभ दोपहर', greetingEvening: 'शुभ संध्या', reduceMotion: 'कम एनीमेशन' },
    tabs: { overview: 'ओवरव्यू', career: 'करियर मेंटर', emotional: 'भावनात्मक सहायता', mood: 'मूड जर्नल', roadmap: 'करियर रोडमैप', profile: 'प्रोफ़ाइल', brain: 'करियर ब्रेन' },
    dashboard: { dayStreak: 'दिन की स्ट्रीक' },
    graph: {
      title: 'पर्सनल करियर ब्रेन',
      ingestTitle: 'अपना नॉलेज ग्राफ बनाएँ',
      resumePlaceholder: 'अपना रिज़्यूमे पेस्ट करें (ऐच्छिक)',
      github: 'GitHub उपयोगकर्ता नाम', linkedin: 'LinkedIn URL (ऐच्छिक)', leetcode: 'LeetCode उपयोगकर्ता नाम (ऐच्छिक)',
      targetRole: 'लक्षित भूमिका (ऐच्छिक)',
      buildGraph: 'ग्राफ बनाएँ', nextBest: 'अगला सर्वश्रेष्ठ सुझाव', skills: 'कौशल', projects: 'प्रोजेक्ट्स', jobs: 'रोल्स',
      currentGraph: 'वर्तमान ग्राफ',
      futureGraph: 'भविष्य का ग्राफ',
    },
    gantt: { title: 'रोडमैप टाइमलाइन' },
    quests: { title: 'क्वेस्ट्स', accept: 'स्वीकारें', complete: 'पूरा करें' },
  },
  es: {
    app: { title: 'MindMentor', dashboard: 'Panel', login: 'Iniciar sesión', logout: 'Cerrar sesión', language: 'Idioma', greetingMorning: 'Buenos días', greetingAfternoon: 'Buenas tardes', greetingEvening: 'Buenas noches', reduceMotion: 'Reducir movimiento' },
    tabs: { overview: 'Resumen', career: 'Mentor de carrera', emotional: 'Apoyo emocional', mood: 'Diario de ánimo', roadmap: 'Hoja de ruta', profile: 'Perfil', brain: 'Cerebro de carrera' },
    dashboard: { dayStreak: 'Racha de días' },
    graph: {
      title: 'Cerebro de Carrera Personal',
      ingestTitle: 'Construye tu grafo de conocimiento',
      resumePlaceholder: 'Pega tu currículum (opcional)',
      github: 'Usuario de GitHub', linkedin: 'URL de LinkedIn (opcional)', leetcode: 'Usuario de LeetCode (opcional)',
      targetRole: 'Rol objetivo (opcional)',
      buildGraph: 'Construir grafo', nextBest: 'Siguientes mejores recomendaciones', skills: 'Habilidades', projects: 'Proyectos', jobs: 'Roles',
      currentGraph: 'Grafo actual',
      futureGraph: 'Grafo futuro',
    },
    gantt: { title: 'Cronograma de hoja de ruta' },
    quests: { title: 'Misiones', accept: 'Aceptar', complete: 'Completar' },
  },
  fr: {
    app: { title: 'MindMentor', dashboard: 'Tableau de bord', login: 'Connexion', logout: 'Déconnexion', language: 'Langue', greetingMorning: 'Bonjour', greetingAfternoon: 'Bon après-midi', greetingEvening: 'Bonsoir', reduceMotion: 'Réduire les animations' },
    tabs: { overview: 'Aperçu', career: 'Mentor de carrière', emotional: 'Soutien émotionnel', mood: 'Journal d’humeur', roadmap: 'Feuille de route', profile: 'Profil', brain: 'Cerveau de carrière' },
    dashboard: { dayStreak: 'Série de jours' },
    graph: {
      title: 'Cerveau de Carrière Personnel',
      ingestTitle: 'Construisez votre graphe de connaissances',
      resumePlaceholder: 'Collez votre CV (optionnel)',
      github: 'Identifiant GitHub', linkedin: 'URL LinkedIn (optionnel)', leetcode: 'Identifiant LeetCode (optionnel)',
      targetRole: 'Rôle cible (optionnel)',
      buildGraph: 'Construire le graphe', nextBest: 'Meilleures recommandations suivantes', skills: 'Compétences', projects: 'Projets', jobs: 'Rôles',
      currentGraph: 'Graphe actuel',
      futureGraph: 'Graphe futur',
    },
    gantt: { title: 'Chronologie de la roadmap' },
    quests: { title: 'Quêtes', accept: 'Accepter', complete: 'Terminer' },
  },
};

const I18nContext = createContext({ t: (k) => k, lang: 'en', setLang: () => {} });

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  useEffect(() => { localStorage.setItem('lang', lang); }, [lang]);

  const t = useMemo(() => (key) => {
    const parts = key.split('.');
    let cur = dictionaries[lang] || dictionaries.en;
    for (const p of parts) { cur = cur?.[p]; if (!cur) break; }
    return cur || key;
  }, [lang]);

  const value = useMemo(() => ({ t, lang, setLang }), [t, lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
