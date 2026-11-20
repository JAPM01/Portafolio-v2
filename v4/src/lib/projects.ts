import halcyon from "../assets/work-halcyon.jpg";
import orbital from "../assets/work-orbital.jpg";
import norda from "../assets/work-norda.jpg";

// Vite resuelve las imágenes como string; el type-check raíz (Next) las
// tipa como StaticImageData. El cast las normaliza a string para <img>.
const halcyonImg = halcyon as unknown as string;
const orbitalImg = orbital as unknown as string;
const nordaImg = norda as unknown as string;

export type Project = {
  slug: string;
  index: string;
  name: string;
  summary: string;
  discipline: string;
  tags: string[];
  year: string;
  status: string;
  image: string;
  viewport: string;
  metrics: { value: string; label: string }[];
  headline: string;
  role: string;
  challenge: string;
  solution: string;
  process: { step: string; title: string; text: string }[];
  frames: { title: string; caption: string }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "halcyon-pay",
    index: "01",
    name: "Halcyon Pay",
    summary: "Rediseño del checkout B2B y sistema de componentes.",
    discipline: "Product Design",
    tags: ["Product Design", "Design System"],
    year: "2026",
    status: "LIVE 2026",
    image: halcyonImg,
    viewport: "VIEWPORT 1440×900",
    metrics: [
      { value: "+38%", label: "ARR" },
      { value: "−42%", label: "ABANDONO" },
    ],
    headline: "Un checkout B2B que se siente como un producto de consumo.",
    role: "Lead Product Designer · 9 meses",
    challenge:
      "Halcyon procesaba pagos de 4.000 empresas con un flujo de 11 pasos heredado de 2019. El 42% de los compradores abandonaba en la validación fiscal y cada equipo de producto mantenía su propia librería de componentes.",
    solution:
      "Reduje el checkout a 4 pasos con validación progresiva, autocompletado fiscal y estados límite resueltos de antemano. En paralelo construí un design system con tokens multiplataforma que hoy usan 6 squads.",
    process: [
      { step: "N.01", title: "Auditoría", text: "62 entrevistas, mapa de fricción y análisis de 1,2M sesiones." },
      { step: "N.02", title: "Arquitectura", text: "Tokens, estados y matriz de componentes en Figma y código." },
      { step: "N.03", title: "Prototipo", text: "Prototipo en React con datos reales probado con 40 compradores." },
      { step: "N.04", title: "Despliegue", text: "Rollout gradual por mercado con métricas en vivo." },
    ],
    frames: [
      { title: "Resumen de pedido", caption: "Total, impuestos y condiciones en una sola vista." },
      { title: "Validación fiscal", caption: "Autocompletado por CIF con estados de error explicados." },
      { title: "Confirmación", caption: "Recibo exportable y siguiente acción clara." },
    ],
  },
  {
    slug: "orbital-fleet-os",
    index: "02",
    name: "Orbital Fleet OS",
    summary: "Sistema operativo para flotas autónomas de última milla.",
    discipline: "UX/UI",
    tags: ["UX/UI", "Data Viz", "Autonomous Mobility"],
    year: "2025",
    status: "LIVE 2025",
    image: orbitalImg,
    viewport: "VIEWPORT 2048×1536",
    metrics: [
      { value: "+61%", label: "RETENCIÓN" },
      { value: "4.2M", label: "SESIONES" },
    ],
    headline: "Supervisar 300 vehículos sin perder de vista ninguno.",
    role: "UX/UI Lead · 7 meses",
    challenge:
      "Los operadores de Orbital vigilaban la flota en 5 herramientas distintas. Las incidencias críticas tardaban de media 4 minutos en detectarse.",
    solution:
      "Diseñé un mapa operativo único con jerarquía de alertas por severidad, atajos de teclado y modo nocturno de bajo deslumbramiento para turnos de 12 horas.",
    process: [
      { step: "N.01", title: "Shadowing", text: "3 semanas en sala de control con operadores reales." },
      { step: "N.02", title: "Jerarquía", text: "Modelo de severidad de alertas en 4 niveles." },
      { step: "N.03", title: "Interacción", text: "Micro-motion para cambios de estado de vehículos." },
      { step: "N.04", title: "Medición", text: "Tiempo de detección de 4 min a 38 s." },
    ],
    frames: [
      { title: "Mapa operativo", caption: "Rutas en vivo y estado de cada vehículo." },
      { title: "Incidencia", caption: "Panel lateral con contexto y acciones." },
      { title: "Informe de turno", caption: "Resumen exportable para el cambio de turno." },
    ],
  },
  {
    slug: "norda-ceramica",
    index: "03",
    name: "Norda Cerámica",
    summary: "Identidad y e-commerce para un estudio de cerámica nórdico.",
    discipline: "Branding",
    tags: ["Branding", "Identity", "E-commerce"],
    year: "2024",
    status: "LIVE 2024",
    image: nordaImg,
    viewport: "VIEWPORT 1440×900",
    metrics: [
      { value: "14", label: "MERCADOS" },
      { value: "×3", label: "VENTAS ONLINE" },
    ],
    headline: "Una marca táctil que también funciona en una pantalla.",
    role: "Brand Architect · 5 meses",
    challenge:
      "Norda vendía en ferias y tiendas físicas, pero su marca no se sostenía en digital ni en 14 mercados con idiomas distintos.",
    solution:
      "Sistema de identidad con tipografía propia, retícula de packaging modular y una tienda online donde la fotografía y el tacto del material lideran.",
    process: [
      { step: "N.01", title: "Estrategia", text: "Posicionamiento y arquitectura de líneas de producto." },
      { step: "N.02", title: "Identidad", text: "Logotipo, tipografía y sistema de relieve en papel." },
      { step: "N.03", title: "Packaging", text: "Retícula modular para 40 SKUs." },
      { step: "N.04", title: "Tienda", text: "E-commerce en 6 idiomas con checkout local." },
    ],
    frames: [
      { title: "Sistema de marca", caption: "Logotipo, color y relieve." },
      { title: "Ficha de producto", caption: "Fotografía a sangre y detalle de material." },
      { title: "Packaging", caption: "Retícula modular aplicada." },
    ],
  },
];

export const CONTACT = {
  email: "hola@jpstudio.design",
  phone: "+34 611 204 880",
  coords: "40.4168° N · 3.7038° W",
};
