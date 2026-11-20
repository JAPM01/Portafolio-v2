export const SKILLS = [
  { label: "Visual design", value: 96, tools: "Figma · Adobe CC", axis: "visual" },
  { label: "Information architecture", value: 92, tools: "Figma · Miro", axis: "architecture" },
  { label: "Creative coding", value: 88, tools: "Three.js · GLSL", axis: "coding" },
  { label: "Front-end development", value: 90, tools: "React · TypeScript", axis: "frontend" },
  { label: "Strategy", value: 84, tools: "Research · Brand systems", axis: "strategy" },
  { label: "Interaction design", value: 78, tools: "ProtoPie · Motion", axis: "interaction" },
] as const;

// Editorial preview only. Replace with approved client statements before publication.
export const TESTIMONIALS = [
  { quote: "Julia turned a fragile checkout into the product our board talks about. Eleven weeks, one system, zero compromises on craft.", author: "Elena Vance", role: "VP of Product / FinTech Core", projectSlug: "halcyon-pay" },
  { quote: "Una interfaz que transforma la complejidad en claridad. Cada decisión conecta lo que el equipo necesita con lo que el producto puede llegar a ser.", author: "Autor pendiente", role: "Equipo de producto / Orbital Fleet OS", projectSlug: "orbital-fleet-os" },
  { quote: "La sensibilidad de una marca artesanal, llevada al mundo digital sin perder su esencia. Un sistema coherente en cada punto de contacto.", author: "Autor pendiente", role: "Equipo de marca / Norda Cerámica", projectSlug: "norda-ceramica" },
] as const;

export function radarPoint(axis: number, value: number) {
  const angle = -Math.PI / 2 + axis * Math.PI / 3;
  const radius = 290 * value / 100;
  return { x: 600 + Math.cos(angle) * radius, y: 400 + Math.sin(angle) * radius };
}

export function testimonialIndex(index: number, direction: number) {
  return (index + direction + TESTIMONIALS.length) % TESTIMONIALS.length;
}