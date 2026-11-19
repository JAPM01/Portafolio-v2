"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Contenido REAL de la versión experimento (/experimento).
 * Fuente: CV de diseño de Jafet (docx 15 Nov 2026) y lo acordado en chat.
 * Sin métricas inventadas: solo hay año donde el CV lo da (Nu 2022,
 * Gobierno 2017-2019); el resto usa tipo/estado como metadato.
 * Los testimonios son BORRADORES redactados a petición de Jafet
 * (19 Nov 2026): él afirma haber recibido buenos comentarios pero no
 * los tiene por escrito. Están basados en hechos reales de cada proyecto
 * y atribuidos al equipo/cliente, SIN inventar nombres de personas ni
 * métricas. Jafet debe confirmarlos o reemplazarlos por las citas reales.
 * Las imágenes de Trabajo son PLACEHOLDERS que se ven reales (búsqueda
 * web, verificadas una por una: cargan y muestran el tema correcto);
 * Jafet las cambiará por mockups reales de cada proyecto.
 */

export type ExpLang = "es" | "en";

function getExpLang(): ExpLang {
  if (typeof window === "undefined") return "es";
  return window.localStorage.getItem("site-lang") === "en" ? "en" : "es";
}

function subscribeExpLang(callback: () => void) {
  window.addEventListener("site-lang", callback);
  return () => window.removeEventListener("site-lang", callback);
}

export function useExpLang(): ExpLang {
  return useSyncExternalStore<ExpLang>(subscribeExpLang, getExpLang, () => "es");
}

export function usePachucaTime() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    function tick() {
      setTime(
        new Intl.DateTimeFormat("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Mexico_City",
        }).format(new Date()),
      );
    }
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export type ExpProject = {
  title: string;
  category: string;
  status: string;
  blurb: { es: string; en: string };
  image: string;
  imageAlt: { es: string; en: string };
  link?: string;
  linkLabel?: { es: string; en: string };
};

export const EXP_FEATURED: ExpProject[] = [
  {
    title: "Pincali",
    category: "Product Design",
    status: "Implementado",
    blurb: {
      es: "Rediseño UX de la tarjeta de producto: el precio como ancla, títulos estándar y contraste WCAG.",
      en: "UX redesign of the product card: price as the anchor, standard titles and WCAG contrast.",
    },
    image:
      "https://framerusercontent.com/images/bCzGrRmGUfukngZtbSoo6PsU2M.png?width=3000&height=2250",
    imageAlt: {
      es: "Tienda en línea con listado de productos en una laptop",
      en: "Online store with a product listing on a laptop",
    },
    link: "https://www.figma.com/deck/imyrOm9oZ59UkfaXetfYXs/UX-redesign-concept-for-the-PLP-card",
    linkLabel: { es: "Ver caso", en: "View case" },
  },
  {
    title: "Rappi",
    category: "Product Design",
    status: "Propuesta pagada",
    blurb: {
      es: "Personalización de recomendaciones: 61% de los usuarios se sentía abrumado por las opciones al pedir comida.",
      en: "Recommendation personalisation: 61% of users felt overwhelmed by the options when ordering food.",
    },
    image:
      "https://eatthis.com/wp-content/uploads/sites/4/2021/12/online-food-delivery-phone.jpg?quality=82&strip=all&w=640",
    imageAlt: {
      es: "Aplicación de entrega de comida en un teléfono",
      en: "Food delivery app on a phone",
    },
  },
  {
    title: "HiringBe",
    category: "UX Design · Branding",
    status: "En vivo",
    blurb: {
      es: "Plataforma de reclutamiento con IA: estructura, experiencia y scoring candidato–vacante.",
      en: "AI recruitment platform: structure, experience and candidate–vacancy scoring.",
    },
    image:
      "https://cdn.prod.website-files.com/6386dd27a0ad72f77e46db23/6931cb5daab90f706d3613a1_recruiting-dashboard%20(1)-p-1080.png",
    imageAlt: {
      es: "Panel de reclutamiento con analítica en una laptop",
      en: "Recruitment dashboard with analytics on a laptop",
    },
  },
  {
    title: "Wildfork",
    category: "UX Design",
    status: "Implementado",
    blurb: {
      es: "Rediseño de registro y compra: validaciones en tiempo real y mensajes de error claros.",
      en: "Signup and checkout redesign: real-time validation and clear error messages.",
    },
    image:
      "https://source.inblog.dev/featured_image/2026-03-06T10:24:48.199Z-bc68d608-7daf-4213-9c44-bdd809588043",
    imageAlt: {
      es: "Carnicería con cortes de carne en vitrina",
      en: "Butcher shop with meat cuts on display",
    },
  },
  {
    title: "Nu Collections",
    category: "Branding",
    status: "2022",
    blurb: {
      es: "Brandbook 2022: imagotipo, sistema, paleta y criterios de accesibilidad para Collections.",
      en: "2022 Brandbook: wordmark, system, palette and accessibility criteria for Collections.",
    },
    image:
      "https://agencialuminus.com.br/wp-content/uploads/2026/04/Stationery-Branding-Mockup-1.jpg",
    imageAlt: {
      es: "Papelería de identidad de marca sobre fondo azul",
      en: "Brand identity stationery on a blue background",
    },
  },
  {
    title: "Revo",
    category: "Product Design",
    status: "Propuesta pagada",
    blurb: {
      es: "Rediseño de interfaz para convertir usuarios gratuitos a premium.",
      en: "Interface redesign to convert free users to premium.",
    },
    image:
      "https://legend1st.com/wp-content/uploads/2022/07/application-interface-ui-smartphone-3d-rendering-scaled.webp",
    imageAlt: {
      es: "Pantallas de aplicación móvil en un teléfono",
      en: "Mobile app screens on a phone",
    },
  },
  {
    title: "AIFA",
    category: "Branding",
    status: "Propuesta pagada",
    blurb: {
      es: "Isotipo FA + águila + avión, con círculos de proporción áurea y sistema de retícula.",
      en: "FA monogram + eagle + plane, built on golden-ratio circles and a grid system.",
    },
    image: "https://intercs.org/wp-content/uploads/2022/06/872411.png",
    imageAlt: {
      es: "Terminal de aeropuerto con aviones en pista",
      en: "Airport terminal with planes on the tarmac",
    },
  },
];

export type ExpMoreProject = {
  title: string;
  category: string;
  status: string;
  blurb: { es: string; en: string };
};

export const EXP_MORE: ExpMoreProject[] = [
  {
    title: "Proxemia",
    category: "Branding",
    status: "Logotipo",
    blurb: {
      es: "Diseño de logotipo con conceptualización completa de marca.",
      en: "Logo design with full brand conceptualisation.",
    },
  },
  {
    title: "OnlyFast",
    category: "Branding",
    status: "Identidad",
    blurb: {
      es: "Branding, logotipo e imagen para redes de una marca de comida rápida.",
      en: "Branding, logo and social imagery for a fast-food brand.",
    },
  },
  {
    title: "UPMH",
    category: "Diseño editorial",
    status: "Por proyecto",
    blurb: {
      es: "Logotipo de la carrera de TI y diseño completo de la revista Pueblos Mágicos.",
      en: "IT degree logo and full design of the Pueblos Mágicos interactive magazine.",
    },
  },
];

export const EXP_EXPERIENCE = [
  {
    name: "Freelance Independiente",
    role: { es: "Diseñador Digital & UI/UX Senior", en: "Senior Digital & UI/UX Designer" },
    dates: { es: "Ene 2015 — Actualidad", en: "Jan 2015 — Present" },
    mono: "FI",
    tile: "red",
  },
  {
    name: "Gobierno del Estado de Hidalgo",
    role: { es: "Diseñador Gráfico e Identidad Institucional", en: "Graphic & Institutional Identity Designer" },
    dates: { es: "Abr 2017 — Ene 2019", en: "Apr 2017 — Jan 2019" },
    mono: "GEH",
    tile: "outline",
  },
  {
    name: "UPMH",
    role: { es: "Diseñador Gráfico y Editorial", en: "Graphic & Editorial Designer" },
    dates: { es: "Por proyecto", en: "Per project" },
    mono: "UPMH",
    tile: "dark",
  },
  {
    name: "Pieza Creativa",
    role: { es: "Diseñador Gráfico", en: "Graphic Designer" },
    dates: { es: "Etapa inicial", en: "Early stage" },
    mono: "PC",
    tile: "gray",
  },
] as const;

export const EXP_CLIENTS = [
  "Rappi",
  "Pincali",
  "Wildfork",
  "Nu México",
  "Gobierno Federal",
  "Gobierno del Estado de Hidalgo",
  "ION Financiera",
  "UPMH",
  "Mantiz Game Studios",
  "HiringBe",
  "IDAI",
  "Prosmile",
  "Ictica",
  "Business Solutions",
  "Proxemia",
  "OnlyFast",
  "Revo",
  "AIFA",
] as const;

export type ExpTestimonial = {
  quote: { es: string; en: string };
  by: { es: string; en: string };
  link?: string;
  linkLabel?: { es: string; en: string };
};

export const EXP_TESTIMONIALS: ExpTestimonial[] = [
  {
    quote: {
      es: "El rediseño de la tarjeta ordenó la jerarquía: el precio manda, los títulos se leen de un vistazo y el contraste por fin cumple WCAG.",
      en: "The card redesign fixed the hierarchy: price leads, titles scan at a glance, and contrast finally meets WCAG.",
    },
    by: { es: "Equipo de Producto, Pincali", en: "Product Team, Pincali" },
    link: "https://www.figma.com/deck/imyrOm9oZ59UkfaXetfYXs/UX-redesign-concept-for-the-PLP-card",
    linkLabel: { es: "Ver caso", en: "View case" },
  },
  {
    quote: {
      es: "El brandbook le dio orden a todo Collections: imagotipo, sistema, paleta y accesibilidad en un solo documento claro.",
      en: "The brandbook brought order to all of Collections: wordmark, system, palette and accessibility in one clear document.",
    },
    by: { es: "Equipo de Collections, Nu México", en: "Collections Team, Nu México" },
  },
  {
    quote: {
      es: "El registro y la compra por fin se sienten fáciles: errores claros, validación en tiempo real y un flujo sin fricción.",
      en: "Signup and checkout finally feel easy: clear errors, real-time validation and a frictionless flow.",
    },
    by: { es: "Equipo de Producto, Wildfork", en: "Product Team, Wildfork" },
  },
];

export const EXP_MANIFESTO = {
  principles: [
    {
      title: { es: "Entender a las personas.", en: "Understanding people." },
      desc: {
        es: "Investigación de usuarios y mercado antes de cualquier pantalla.",
        en: "User and market research before any screen.",
      },
    },
    {
      title: { es: "Observar antes de actuar.", en: "Observing before acting." },
      desc: {
        es: "Miro cómo se usa lo que existe y dónde se rompe.",
        en: "I look at how what exists is used, and where it breaks.",
      },
    },
    {
      title: { es: "Definir los resultados.", en: "Defining outcomes." },
      desc: {
        es: "Cada decisión tiene una forma de medirse.",
        en: "Every decision has a way to be measured.",
      },
    },
  ],
} as const;

export const EXP_CV_STATS = [
  { value: "50+", label: { es: "marcas y empresas", en: "brands and companies" } },
  { value: "10+", label: { es: "años de trayectoria", en: "years of practice" } },
  { value: "7", label: { es: "proyectos destacados", en: "featured projects" } },
] as const;

export const EXP_CV = {
  header: {
    es: "Diseñador Digital & UI/UX Senior | Consultoría y Proyectos Independientes",
    en: "Senior Digital & UI/UX Designer | Consulting & Independent Projects",
  },
  meta: {
    es: "Remoto / Híbrido · Enero 2015 — Actualidad",
    en: "Remote / Hybrid · January 2015 — Present",
  },
  bullets: {
    es: [
      "Lidero diseño de producto y UX/UI por proyecto, de discovery a validación con usuarios reales.",
      "Construyo marcas con proceso completo: investigación, conceptualización, identidad y sistemas visuales.",
      "Diseño experiencias que se miden por resultados: usabilidad, accesibilidad y conversión.",
      "Trabajo con empresas grandes, instituciones y emprendimientos, en remoto e híbrido.",
    ],
    en: [
      "I lead product and UX/UI design per project, from discovery to validation with real users.",
      "I build brands through the full process: research, conceptualisation, identity and visual systems.",
      "I design experiences measured by results: usability, accessibility and conversion.",
      "I work with large companies, institutions and startups, remote and hybrid.",
    ],
  },
  tools: [
    "Figma",
    "Adobe Illustrator",
    "Adobe Photoshop",
    "Miro",
    "Hotjar",
    "Microsoft Clarity",
    "GA4",
    "Google Workspace",
    "ChatGPT",
    "Claude",
    "Gemini",
  ],
  education: {
    es: "Ingeniería en Tecnologías de la Información — UPMH, 2013–2016",
    en: "BEng in Information Technologies — UPMH, 2013–2016",
  },
  cert: {
    es: "Digital Marketing Fundamentals (SCDM-F) — SMstudy",
    en: "Digital Marketing Fundamentals (SCDM-F) — SMstudy",
  },
  english: { es: "Inglés B1", en: "English B1" },
} as const;

export const EXP_STRINGS = {
  hero: {
    phrase: { es: "Diseño que se mide en resultados.", en: "Design measured by results." },
    available: { es: "Disponible para proyectos", en: "Open to new projects" },
  },
  manifesto: {
    label: { es: "Manifiesto", en: "Manifesto" },
    heading: { es: "Cómo trabajo.", en: "How I work." },
    intro: {
      es: "Me muevo entre el diseño, la tecnología y la usabilidad para abordar cada reto desde la raíz, tomando decisiones claras que se miden por resultados reales.",
      en: "Moving between design, technology, and usability to tackle every challenge from the root, making clear decisions measured by real outcomes.",
    },
  },
  work: {
    label: { es: "Trabajo seleccionado", en: "Selected work" },
    heading: { es: "Trabajo que se mide en resultados.", en: "Work measured by results." },
    showAll: { es: "Ver todo", en: "Show all" },
    moreLabel: { es: "Más proyectos", en: "More projects" },
    implemented: { es: "Implementado", en: "Implemented" },
  },
  experience: {
    label: { es: "Experiencia", en: "Experience" },
    heading: { es: "Trayectoria en diseño.", en: "Design trajectory." },
    note: {
      es: "Más de 50 marcas, empresas e instituciones, locales, nacionales e internacionales.",
      en: "More than 50 brands, companies and institutions, local, national and international.",
    },
  },
  clients: {
    label: { es: "Clientes", en: "Clients" },
    heading: { es: "Marcas que confiaron en mí.", en: "Brands that trusted me." },
    cta: { es: "¿Tu marca aquí? Hablemos", en: "Your brand here? Let's talk" },
  },
  testimonials: {
    label: { es: "Testimonios", en: "Testimonials" },
    heading: { es: "Lo que dicen de mi trabajo.", en: "What they say about my work." },
    prev: { es: "Testimonio anterior", en: "Previous testimonial" },
    next: { es: "Testimonio siguiente", en: "Next testimonial" },
  },
  cv: {
    label: { es: "Mi CV", en: "My CV" },
    heading: { es: "Un solo CV, una sola trayectoria.", en: "One CV, one trajectory." },
    skills: { es: "Herramientas", en: "Tools" },
    education: { es: "Formación", en: "Education" },
  },
  contact: {
    label: { es: "Contacto", en: "Contact" },
    heading: { es: "Empecemos un proyecto.", en: "Let's start a project." },
    available: { es: "Disponible para proyectos", en: "Open to new projects" },
    location: { es: "Pachuca, Hidalgo · Remoto / Híbrido", en: "Pachuca, Hidalgo · Remote / Hybrid" },
    emailLabel: { es: "Escríbeme", en: "Write to me" },
  },
  footer: {
    backTop: { es: "Volver arriba", en: "Back to top" },
    rights: { es: "Todos los derechos reservados.", en: "All rights reserved." },
    portfolio: { es: "Portafolio 2026", en: "Portfolio 2026" },
    mail: { es: "Mail", en: "Mail" },
    place: { es: "Ubicación", en: "Location" },
    linkedin: { es: "LinkedIn", en: "LinkedIn" },
    listening: { es: "Escuchando y leyendo", en: "Listening & Reading" },
    listening1: { es: "Artículo — por definir", en: "Article — to be defined" },
    listening2: { es: "Libro — por definir", en: "Book — to be defined" },
  },
} as const;

export const EXP_EMAIL = "jperez.mond@gmail.com";
export const EXP_LINKEDIN = "https://www.linkedin.com/in/jafetperezmondragon";
