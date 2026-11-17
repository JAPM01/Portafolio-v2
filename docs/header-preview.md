# Comparación de motores Liquid Glass en `preview`

El menú flotante **Herramientas** (anteriormente «Retícula») permite
activar una de dos opciones. El estado se guarda en
`localStorage["jpm-header-preview"]` y aplica al header global.

- **Retícula**: control independiente; muestra/oculta la cuadrícula
  del hero sin afectar el efecto de vidrio.
- **Header 1 — liquidGL**: `liquid-gl@3.0.0`, WebGPU / WebGL,
  `interaction: "fluid"`, refracción, aberración y bisel.
- **Header 2 — Simple Liquid Glass**: `simple-liquid-glass@6.0.0`,
  React Interactive + WebGL, refracción de lente, dispersión y
  elasticidad del puntero. Se muestra el diagnóstico del renderer.
- **Desactivados**: conserva el header anterior y su vidrio actual.

Las dos opciones son excluyentes. Al empezar sobre el hero, el header
sigue siendo transparente; **desplazarse** activa la cápsula de vidrio.
La navegación, los controles ES/EN y el tema se mantienen iguales.

Sobre el hero las dos opciones toman como fuente el **canvas animado
real** (`[data-hero-bg-source] canvas`), sin volver a capturar
todas las secciones. Al salir del hero, usan `#main` como referencia.
Los motores se cargan solo cuando se seleccionan.

Estas opciones son experimentales y deben validarse en Chrome Android,
especialmente el rendimiento, el renderer real y la elasticidad táctil.
Un build exitoso no demuestra fidelidad visual.
