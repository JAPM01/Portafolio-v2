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

## Corrección de continuidad y óptica

Los motores utilizan una fuente estable `#main` durante todo el scroll.
Nunca se cambia la `key` ni la fuente de refracción al cruzar el límite
del hero: la instancia activa permanece montada hasta apagar el selector
o regresar por completo a la cabecera sin cristal.

- **Header 1:** aberración `0.065`, refracción `0.032`, bisel más
  estrecho y sin halo cromático intenso; la lente ocupa el contenedor
  del header y el canvas del hero se registra como contenido dinámico.
- **Header 2:** perfil `player` (no `loupe`), sin la segunda lente
  local de `followPointer`, borde único, dispersión y desplazamientos
  reducidos. Se mantiene la elasticidad y el efecto de clic.
- Ambos continúan siendo prototipos que deben comprobarse en el Chrome
  Android donde se observaron los problemas.
