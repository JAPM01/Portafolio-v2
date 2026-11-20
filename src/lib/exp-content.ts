"use client";

import { useEffect, useState } from "react";

/**
 * Contenido LITERAL de Melon (melon.studio) para el clon 1:1 pixel a pixel
 * de /experimento, por indicación de Jafet (19 Nov 2026, 17:57 CST):
 * "tal cual... exactamente igual pixel a pixel", incluyendo los textos.
 * Extraído del HTML en vivo de melon.studio el 19 Nov 2026 (textos,
 * proyectos, testimonios, experiencia, clientes, insights, contacto y
 * footer, con sus URLs de imágenes).
 *
 * Las imágenes se referencian por URL remota a melon.studio porque el
 * snapshot de GitHub no admite binarios. Para validación local se
 * sustituye el prefijo MELON_BASE por /Portafolio-v2/exp/melon: las
 * copias locales en public/exp/melon replican la estructura de rutas
 * de melon.studio (media/..., brand/...). RESTAURAR las remotas antes
 * de subir.
 *
 * La sección Mi CV es la única que conserva contenido de Jafet (la pidió
 * en sus secciones de la v2; Melon no tiene equivalente). Va en inglés
 * para que el clon sea uniforme.
 */

export const MELON_BASE = "https://melon.studio";

const media = (path: string) => `${MELON_BASE}${path}`;

export function usePoznanTime() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    function tick() {
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Warsaw",
        }).format(new Date()),
      );
    }
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export const EXP_LOGO = media("/brand/Logo-melon.svg");
export const EXP_LOGO_FOOTER = media("/brand/logo-footer.svg");
export const EXP_EMAIL = "hello@melon.studio";

export const EXP_STRINGS = {
  hero: {
    word: "melon",
    phrase: "I design and build websites and digital products.",
    place: "Poznań, Poland",
    available: "Open to new projects.",
  },
  work: {
    heading: "Latest Work",
    showAll: "Show all",
    showAllHref: `${MELON_BASE}/work`,
  },
  about: {
    statementBefore: "I'm Piotr",
    statementAfter:
      " — Product Designer / Design Engineer based in Poland, deep into Design Systems. I build slick SaaS products, apps, and websites - down to the details that make them click.",
    portrait: media("/media/home/about/head.png"),
    paragraphs: [
      "Currently, I'm focused on growing in AI and design engineering. I build projects in code from the very start, checking my work with developers along the way. This new way of designing, where a designer can work in code, really excites me.",
      "I'm also a fan of sharing knowledge - whether it's mentoring teams, giving feedback, helping people level up in Figma, or showing how AI can actually make our work smarter, faster, and more fun.",
    ],
    moreAbout: "More about me",
    moreAboutHref: `${MELON_BASE}/about`,
  },
  experience: {
    heading: "Experience",
    freelanceLabel: "As a freelancer I worked with",
  },
  insights: {
    heading: "Insights",
    allNotes: "All notes",
    allNotesHref: `${MELON_BASE}/insights`,
  },
  clients: {
    heading: "Clients",
    note: "Brands and teams I have designed for: in-house, with agencies and as a freelancer.",
    caseStudy: "Case study",
    ctaTop: "This spot's open.",
    ctaBottom: "Let's talk",
    ctaHref: `${MELON_BASE}/contact`,
  },
  testimonials: {
    heading: "What people say",
    prev: "Previous review",
    next: "Next review",
  },
  cv: {
    label: "My CV",
    heading: "One CV, one trajectory.",
    skills: "Tools",
    education: "Education",
  },
  contact: {
    heading: "Let's start a project.",
    startProject: "Start a project",
    startProjectHref: `${MELON_BASE}/contact`,
  },
  footer: {
    contact: "Contact",
    services: "Services",
    social: "Social",
    listening: "Listening & Reading",
    nowPlaying: "Now playing",
    reading: "Reading",
    backTop: "Back to top",
    rights: "All rights reserved.",
  },
} as const;

export type ExpProject = {
  title: string;
  meta: string;
  image: string;
  imageAlt: string;
  link: string;
};

export const EXP_FEATURED: ExpProject[] = [
  {
    title: "Mastercard Music",
    meta: "Product design, 2025",
    image: media("/media/projects/mastercard-music/thumbnail.webp"),
    imageAlt: "Mastercard Music: Product design",
    link: `${MELON_BASE}/work/mastercard-music`,
  },
  {
    title: "All Aces Games",
    meta: "Brand and website, 2026",
    image: media("/media/projects/allaces-games/thumbnail.webp"),
    imageAlt: "All Aces Games: Brand and website",
    link: `${MELON_BASE}/work/allaces-games`,
  },
  {
    title: "oneDynamics",
    meta: "Company website, 2026",
    image: media("/media/projects/onedynamics/thumbnail.webp"),
    imageAlt: "oneDynamics: Company website",
    link: `${MELON_BASE}/work/onedynamics`,
  },
  {
    title: "Sawicki Legal",
    meta: "Law firm website, 2025",
    image: media("/media/projects/sawicki-legal/thumbnail.webp"),
    imageAlt: "Sawicki Legal: Law firm website",
    link: `${MELON_BASE}/work/sawicki-legal`,
  },
  {
    title: "Huuuge Games",
    meta: "Games website, 2024",
    image: media("/media/projects/huuuge-games/thumbnail.webp"),
    imageAlt: "Huuuge Games: Games website",
    link: `${MELON_BASE}/work/huuuge-games`,
  },
  {
    title: "Interact",
    meta: "Redesign concept, 2025",
    image: media("/media/projects/ipg-interact/thumbnail.webp"),
    imageAlt: "Interact: Redesign concept",
    link: `${MELON_BASE}/work/ipg-interact`,
  },
  {
    title: "HiProMine",
    meta: "Home page design, 2025",
    image: media("/media/projects/hipromine/thumbnail.webp"),
    imageAlt: "HiProMine: Home page design",
    link: `${MELON_BASE}/work/hipromine`,
  },
];

export type ExpExperience = {
  name: string;
  role: string;
  dates: string;
  tile: string;
  tileAlt: string;
};

export const EXP_EXPERIENCE: ExpExperience[] = [
  {
    name: "Kinesso",
    role: "Product Designer",
    dates: "2024 – Present",
    tile: media("/media/home/experience/roles/0/tile.svg"),
    tileAlt: "Kinesso logo",
  },
  {
    name: "Webmetric",
    role: "UX/UI Designer",
    dates: "2023 – Present",
    tile: media("/media/home/experience/roles/1/tile.svg"),
    tileAlt: "Webmetric logo",
  },
  {
    name: "Froggly",
    role: "UI Designer",
    dates: "2023 – 2024",
    tile: media("/media/home/experience/roles/2/tile.svg"),
    tileAlt: "Froggly logo",
  },
  {
    name: "GPD Agency & Film Studio",
    role: "Senior Graphic Designer & UX/UI Designer",
    dates: "2018 – 2023",
    tile: media("/media/home/experience/roles/3/tile.png"),
    tileAlt: "GPD Agency & Film Studio logo",
  },
  {
    name: "Pit Bull West Coast",
    role: "Graphic Designer",
    dates: "2018",
    tile: media("/media/home/experience/roles/4/tile.svg"),
    tileAlt: "Pit Bull West Coast logo",
  },
];

export const EXP_FREELANCE = ["Stagwell", "zu.agency", "teacode.io", "brandma.pl"] as const;

export type ExpInsight = {
  date: string;
  title: string;
  excerpt: string;
  category: string;
  read: string;
  image: string;
  link: string;
};

export const EXP_INSIGHTS: ExpInsight[] = [
  {
    date: "Oct 7",
    title: "Redefining Navigation for Interact SaaS",
    excerpt:
      "As part of the broader redesign initiative for Interact, an industry-leading SaaS for media planning and campaign management, I was responsible for creating one of the three conceptual directions.",
    category: "Product design",
    read: "3 min read",
    image: media("/media/posts/redefining-navigation-for-interact-saas/homeImage/src.webp"),
    link: `${MELON_BASE}/insights/redefining-navigation-for-interact-saas`,
  },
  {
    date: "Oct 14",
    title: "Stable Diffusion 3 vs Midjourney and Dall·E 3",
    excerpt: "Understand the differences and choose which one is right for you?",
    category: "AI",
    read: "3 min read",
    image: media("/media/posts/stable-diffusion-3-vs-midjourney-and-dall-e-3/homeImage/src.webp"),
    link: `${MELON_BASE}/insights/stable-diffusion-3-vs-midjourney-and-dall-e-3`,
  },
  {
    date: "Oct 14",
    title: "WebGPU: The future of web applications.",
    excerpt: "Let's analyze what WebGPU is and what impact it can have.",
    category: "Web design",
    read: "Quick read",
    image: media("/media/posts/webgpu-the-future-of-web-applications/homeImage/src.webp"),
    link: `${MELON_BASE}/insights/webgpu-the-future-of-web-applications`,
  },
  {
    date: "Oct 13",
    title: "Discover New Music with Spotify's Smart Shuffle ✨",
    excerpt: "Music that perfectly match your unique vibe. Discover new favorites!",
    category: "AI",
    read: "2 min read",
    image: media("/media/posts/discover-new-music-with-spotifys-smart-shuffle/homeImage/src.webp"),
    link: `${MELON_BASE}/insights/discover-new-music-with-spotifys-smart-shuffle`,
  },
  {
    date: "Oct 13",
    title: "Valentine's Matchmaker",
    excerpt: "Event Design for the SkinsMonkey CS2 Community",
    category: "AI",
    read: "2 min read",
    image: media("/media/posts/valentines-matchmaker/homeImage/src.webp"),
    link: `${MELON_BASE}/insights/valentines-matchmaker`,
  },
];

export type ExpClient = {
  name: string;
  logo: string;
  caseStudy?: string;
};

export const EXP_CLIENTS: ExpClient[] = [
  { name: "Mastercard", logo: media("/media/logos/mastercard/colour.svg"), caseStudy: `${MELON_BASE}/work/mastercard-music` },
  { name: "Lidl", logo: media("/media/logos/lidl/colour.svg") },
  { name: "Bayer", logo: media("/media/logos/bayer/colour.svg") },
  { name: "Huuuge Games", logo: media("/media/logos/huuuge/colour.svg"), caseStudy: `${MELON_BASE}/work/huuuge-games` },
  { name: "Poczta Polska", logo: media("/media/logos/pocztapolska/colour.svg") },
  { name: "PKP", logo: media("/media/logos/pkp/colour.svg") },
  { name: "Stagwell", logo: media("/media/logos/stagwell/colour.svg") },
  { name: "Omnicom", logo: media("/media/logos/omnicom/colour.png"), caseStudy: `${MELON_BASE}/work` },
  { name: "Enea", logo: media("/media/logos/enea/colour.svg") },
  { name: "Kinesso", logo: media("/media/logos/kinesso/colour.svg") },
  { name: "All Aces Games", logo: media("/media/logos/allaces/colour.svg"), caseStudy: `${MELON_BASE}/work/allaces-games` },
  { name: "WSiP", logo: media("/media/logos/wsip/colour.svg") },
  { name: "Kinderkraft", logo: media("/media/logos/kinderkraft/colour.svg") },
  { name: "Państwowa Inspekcja Pracy", logo: media("/media/logos/pip/colour.svg") },
  { name: "Barter", logo: media("/media/logos/barter/colour.svg") },
  { name: "HiProMine", logo: media("/media/logos/hipromine/colour.svg"), caseStudy: `${MELON_BASE}/work/hipromine` },
  { name: "Sawicki Legal", logo: media("/media/logos/sawicki/colour.svg"), caseStudy: `${MELON_BASE}/work/sawicki-legal` },
  { name: "John Dog", logo: media("/media/logos/johndog/colour.svg") },
  { name: "Pitbull West Coast", logo: media("/media/logos/pitbull/colour.svg") },
  { name: "Webmetric", logo: media("/media/logos/webmetric/colour.svg") },
  { name: "Froggly", logo: media("/media/logos/froggly/colour.svg") },
  { name: "oneDynamics", logo: media("/media/logos/onedynamics/colour.svg"), caseStudy: `${MELON_BASE}/work/onedynamics` },
  { name: "GPD Agency & Film Studio", logo: media("/media/logos/gpd/colour.svg") },
  { name: "teacode.io", logo: media("/media/logos/teacode/colour.svg") },
  { name: "Sisem", logo: media("/media/logos/sisem/colour.svg") },
  { name: "zu.agency", logo: media("/media/logos/zuagency/colour.svg") },
  { name: "One Day More", logo: media("/media/logos/onedaymore/colour.svg") },
  { name: "BKT Elektronik", logo: media("/media/logos/bkt/colour.svg") },
  { name: "SEOHOST", logo: media("/media/logos/seohost/colour.svg") },
  { name: "brandma.pl", logo: media("/media/logos/brandma/colour.svg") },
  { name: "Tenzi", logo: media("/media/logos/tenzi/colour.svg") },
];

export type ExpTestimonial = {
  quote: string;
  name: string;
  role: string;
  caseStudy?: string;
  caseStudyLabel?: string;
};

export const EXP_TESTIMONIALS: ExpTestimonial[] = [
  {
    quote:
      "Piotr Brzeziński was responsible for the entire design of Huuuge's new website, and he absolutely nailed it! It was a pleasure working with him, and I hope our paths cross again soon!",
    name: "Agata Rutkowska",
    role: "Brand Identity Manager at Huuuge Games",
    caseStudy: `${MELON_BASE}/work/huuuge-games`,
    caseStudyLabel: "Huuuge Games case study",
  },
  {
    quote:
      "Piotr is a highly skilled UX/UI specialist, and working with him day to day is remarkably smooth. His diverse experience lets him see the product from a broader perspective and offer valuable advice.",
    name: "Justyna Pakuła-Steć",
    role: "Senior IT Project Manager at Poczta Polska",
  },
  {
    quote:
      "Piotr is a proactive and talented Product Designer who combines excellent UX/UI skills with strong communication, leadership, and problem-solving abilities, making him a great asset to any team.",
    name: "Rafal Jablonski",
    role: "AI & Automation Offering Lead at iteo",
  },
];

export const EXP_SOCIAL = [
  { label: "Behance", href: "https://www.behance.net/MelonToPies" },
  { label: "Dribbble", href: "https://dribbble.com/MelonToPies" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/piotr-brzezinski-ux-ui-design/" },
] as const;

export const EXP_SERVICES = [
  { label: "SaaS & product design", href: `${MELON_BASE}/services/saas-product-design` },
  { label: "Web design", href: `${MELON_BASE}/services/web-design` },
  { label: "Design for agencies", href: `${MELON_BASE}/services/design-for-agencies` },
] as const;

export const EXP_LISTENING = {
  nowPlaying: {
    title: "Syn okiennika",
    by: "Kacperczyk, Artur Rojek",
    href: "https://open.spotify.com/track/5Y4KDqJPuqIp2GdG35KKNi",
  },
  reading: {
    title: "The Umami Strategy",
    by: "Aga Szóstek",
    href: "https://www.bispublishers.com/the-umami-strategy.html",
  },
} as const;

/**
 * Mi CV — contenido de Jafet (única sección que conserva su contenido;
 * Melon no tiene equivalente). En inglés para que el clon sea uniforme.
 * Fuente: CV de diseño (docx 15 Nov 2026) + estructura última acordada.
 */
export const EXP_CV_STATS = [
  { value: "50+", label: "brands and companies" },
  { value: "10+", label: "years of practice" },
  { value: "5", label: "featured projects" },
] as const;

export const EXP_CV = {
  header: "Senior Digital & UI/UX Designer | Consulting & Independent Projects",
  meta: "Remote / Hybrid · January 2015 — Present",
  bullets: [
    "I lead product and UX/UI design per project, from discovery to validation with real users.",
    "I build brands through the full process: research, conceptualisation, identity and visual systems.",
    "I design experiences measured by results: usability, accessibility and conversion.",
    "I work with large companies, institutions and startups, remote and hybrid.",
  ],
  featured: [
    { title: "Pincali", category: "Product Design" },
    { title: "Rappi", category: "Product Design" },
    { title: "HiringBe", category: "UX Design" },
    { title: "Wildfork", category: "UX Design" },
    { title: "Nu Collections", category: "Branding" },
  ],
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
  education: "BEng in Information Technologies — UPMH, 2013–2016",
  cert: "Digital Marketing Fundamentals (SCDM-F) — SMstudy",
  english: "English B1",
} as const;
