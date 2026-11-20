# Auditoría visual v4 — layout, estructura y lenguaje visual

Fecha: 20 Nov 2026, 13:44–13:50 CST. Sitio: https://japm01.github.io/Portafolio-v2/v4/
Método: revisión en navegador real, modo oscuro, recarga forzada. El sitio carga,
los 4 lienzos WebGL se representan (Hero, Venn, radar y monograma) y las 3 fotos
de Work cargan; no se vio overlay de error ni imagen rota. Nada fue modificado.

## Limitación del método

El navegador de la revisión mantuvo un viewport fijo de 1920×963 px y no permitió
cambiarlo (DevTools y modo dispositivo no se abrieron). Por tanto lo verificado es
escritorio a 1920×963, NO a 1440×900, y la vista móvil de 390×844 NO pudo
capturarse. Los riesgos móviles se indican como previsibles, no observados, a
partir del DOM (no hay menú hamburguesa: solo la navegación completa del header).
La consola tampoco pudo inspeccionarse; no se afirma que esté limpia.

## Header (global)

1. Header extremadamente denso en una sola fila: logo JP + Julia Prat,
   «PRODUCT • UX/UI • BRANDING», 5 enlaces numerados, coordenadas
   41.3874°N 2.1686°E, UTC/BCN, «AVAILABLE 2027» y botón azul «Contact».
   A 1920 encaja justo; a 1440 (480 px menos) es previsible desbordamiento,
   sin menú móvil en el DOM.
2. Inconsistencia de ubicación: el header dice Barcelona (41.3874°N 2.1686°E,
   «BCN») y el pie dice Madrid (40.4168°N 3.7038°W).
3. El header fijo tapa el contenido al anclar/desplazar: en Manifiesto,
   Testimonios y SkillMap la primera línea queda cortada por detrás del header
   (falta scroll-margin).
4. El único acento azul del sitio es el botón «Contact»; el resto del header es
   gris sobre negro, con contraste bajo en las horas y coordenadas.

## Hero (cromo líquido 3D)

5. El «cromo líquido» se ve como columnas verticales/cortina, no como una masa
   líquida: franjas azul/negro con aberración cromática roja-verde muy intensa
   y repetitiva.
6. Legibilidad: el titular blanco en mayúsculas se asienta sobre franjas
   claras/grises brillantes («PRODUCT», «ARCHITECT») y pierde contraste por
   zonas; las etiquetas pequeñas «OPEN Q1 2027», el email y
   «SCROLL · TRABAJO SELECCIONADO» son grises diminutas sobre el cromo.
7. «HG_SHADER ·60FPS», a la derecha a media altura, queda pegado al borde
   derecho, con contraste bajo.
8. El titular ocupa solo la mitad izquierda; la mitad derecha es cromo vacío.
   El «&» queda huérfano al final de la segunda línea («DESIGNER &»). No hay
   retrato ni nombre grande de Julia Prat en el Hero (solo «Julia Prat»
   pequeño en el header).
9. «X 0.50 · Y 0.50» cambia con el ratón y es el único elemento con pastilla
   oscura legible; no hay jerarquía que lo justifique.

## Work (tarjetas de proyectos)

10. DEFECTO PRINCIPAL: la columna de texto es sticky con fundido/blur al hacer
    scroll. En posiciones intermedias se ven dos proyectos a la vez: el título
    «Halcyon Pay» borroso se superpone al título «Orbital Fleet OS» y a la
    imagen del siguiente proyecto, y luego aparecen las etiquetas de Norda bajo
    «ABRIR CASO» de Orbital. No es un parpadeo: persiste durante un largo
    tramo de scroll.
11. Vacío extremo en la columna de texto: en la tarjeta en reposo (Halcyon)
    hay unos 380 px de negro vacío entre las etiquetas superiores y el título
    alineado abajo.
12. Gran hueco (unos 100 px) entre el titular «Trabajo seleccionado» y la
    primera tarjeta.
13. Fotos genéricas o incoherentes con el proyecto: Halcyon Pay (rediseño de
    checkout B2B) muestra arquitectura en blanco y negro con el cielo quemado
    en blanco, sin interfaz; Orbital Fleet OS muestra un dashboard con la
    marca «FleetIQ», no «Orbital»; Norda Cerámica muestra jarrones negros y
    una tarjeta con «YAG» grabado, no la marca Norda. La imagen de Norda es
    además muy oscura y el segundo jarrón queda recortado.
14. Dentro de la imagen de Orbital, las etiquetas del mapa («TRK-102»,
    «TAN-048 62 km/h») se solapan con marcadores y son casi ilegibles.
15. «ABRIR CASO» no tiene borde ni fondo de botón, solo texto pequeño con
    flecha, pegado al borde inferior de la tarjeta. En el DOM cada proyecto
    tiene además dos botones idénticos «Abrir caso de estudio».
16. Ritmo inconsistente: etiquetas en mono gris de ~10 px, título grande en
    grotesca, descripción gris; la imagen es ~65 % del ancho y la columna de
    texto ~35 %.

## Manifiesto (diagrama de Venn 3D de vidrio)

17. El Venn es demasiado grande para el viewport: la esfera azul queda
    recortada por el borde derecho y la inferior por el borde inferior; nunca
    se ven las tres esferas y las tres etiquetas a la vez.
18. Etiquetas desprendidas: «PRODUCTO» está sobre la esfera azul superior,
    «DISEÑO» aparece flotando en el vacío negro bajo la esfera naranja (no
    dentro de ninguna esfera) y «CÓDIGO» no es visible en la misma vista. No
    se distingue una zona central de intersección etiquetada: no se lee como
    un Venn.
19. Las esferas no se leen como vidrio transparente: son azul eléctrico y
    naranja/marrón opacos, con un grueso brillo blanco de borde; las
    intersecciones no se transparentan.
20. Vacío enorme: unos 450 px de negro vacío a la izquierda y entre el titular
    y el párrafo, que queda abajo a la izquierda, desconectado del diagrama
    de la derecha.
21. En el titular «Design at the edge of utility & form», las colas de la «g»
    de «Design»/«edge» y de la «y» de «utility» se ven recortadas/reducidas a
    un punto, mientras que en Experiencia la «p» de «Practice» baja completa:
    el recorte parece propio de este titular.
22. El énfasis en negrita del párrafo es irregular y sin patrón visible; la
    retícula de puntos de fondo apenas se percibe.

## Experience

23. Desequilibrio de columnas: las estadísticas 11+ / 50+ / 200k+ se apilan a
    la izquierda y el único párrafo queda arriba a la derecha; a la derecha
    de 50+ y 200k+ hay un vacío negro de unos 900×350 px.
24. Las etiquetas («AÑOS PRÁCTICA INDEPENDIENTE», «MARCAS Y PROYECTOS»,
    «USUARIOS IMPACTADOS») son minúsculas, en dos líneas, pegadas al lateral
    de números gigantes; la relación número/etiqueta es inconsistente.
25. La parrilla de marcas es solo texto, sin logotipos: 8 nombres con
    tipografías, pesos y contrastes distintos (HALCYON espaciado, «orbital»
    en itálica serif, NORDA condensada, «vectra/» mono fina, «Mareo» serif,
    KILN&CO, LUMA.OS, «Atlas» itálica), varios en gris muy claro sobre negro.
26. Gran vacío (unos 200 px) entre la parrilla de marcas y el titular
    «Skill map».

## SkillMap (radar + vidrio 3D)

27. El radar es demasiado alto: en ningún viewport se ven a la vez las 6
    etiquetas y el polígono completo; la etiqueta superior (96 Visual design)
    y la inferior (90 Front-end development) están a más de 963 px de
    distancia.
28. Etiquetas desprendidas del gráfico: 78 Interaction, 92 Information,
    84 Strategy y 88 Creative coding están a unos 250–350 px de su vértice,
    unidas por una línea conectora finísima casi invisible o rota.
29. El polígono de datos no se lee como radar: es un prisma/pirámide azul
    degradado saturado y opaco que tapa la retícula y los ejes; los ejes son
    grises casi invisibles y hay un punteado rojo/cian de aberración
    cromática en los bordes.
30. Los nodos «de vidrio 3D» son esferas oscuras casi negras, apenas visibles
    sobre el relleno azul; el vértice superior es una esfera pequeña oscura y
    el inferior tiene un punto rojo que parece un artefacto.
31. Solo la habilidad seleccionada muestra sus herramientas («Figma · Adobe CC»
    al pulsar Visual design; por defecto «React · TypeScript» en Front-end):
    las otras 5 ocultan esa línea, así que la etiqueta seleccionada gana una
    tercera línea y rompe la simetría.
32. Vacío de unos 250 px bajo la etiqueta 90 antes del titular de
    Testimonios.

## Testimonials

33. La cita queda cortada por el header fijo al desplazar: la primera línea se
    ve solo por la mitad, tapada por el header.
34. Gran vacío (unos 250 px) sobre el titular «What people say» y otro vacío
    similar bajo las flechas de navegación.
35. Aviso «CONTENIDO DE MUESTRA · PENDIENTE DE APROBACIÓN» en mono gris
    diminuto bajo la autora (Elena Vance, VP of Product / FinTech Core): el
    testimonio se presenta como contenido de muestra no aprobado.
36. Navegación mínima: flechas diminutas y «01/03» en gris; solo se ve un
    testimonio, sin tarjetas ni retratos.

## Footer (monograma 3D)

37. El monograma JP gira con el scroll: al llegar al final de la página queda
    boca abajo/girado y se lee como «qL», no «JP»; en otra posición es una
    lámina vertical fina de canto. Es negro sobre negro, con contraste muy
    bajo, solo se ven los brillos de borde.
38. La marquesina final «LET'S BUILD SOMETHING ICONIC —» queda recortada por
    los bordes izquierdo y derecho y por el borde inferior de la página, en
    el final absoluto del scroll.
39. Columnas desalineadas: email/teléfono a la izquierda, «OPEN Q1 2027» y
    enlaces (Read.cv, Dribbble) a la derecha, con el monograma centrado más
    alto; «Escríbeme» es el único botón azul, sin relación visual con el
    resto del pie.
40. No hay desbordamiento horizontal a 1920 (no aparece scroll lateral; el
    Venn y el radar se recortan por overflow, no desplazan la página), pero
    sí recorte de contenido en los bordes derecho/inferior.

## Lenguaje visual: SkillMap vs. Work vs. Venn

- **Colores y acentos:** SkillMap usa azul rey saturado en degradado +
  naranja + punteado rojo; el Venn usa azul eléctrico opaco + naranja/marrón;
  Work es negro/blanco/gris con fotos y el único azul es el botón
  «Contact»/«Escríbeme». El azul no es el mismo en las tres piezas ni tiene
  la misma función (relleno de datos, esfera sólida, botón).
- **Grosor de trazos:** SkillMap tiene ejes finísimos casi invisibles y un
  borde de polígono punteado con aberración cromática; Work usa bordes de
  1 px gris y fotos con esquinas redondeadas; el Venn no tiene trazo, sino
  un brillo grueso blanco de borde de esfera. No hay un sistema de trazo común.
- **Radios de esquina:** Work redondea las fotos (~12–16 px) y el header es
  una píldora; SkillMap y Venn son círculos/esferas perfectas, mientras el
  polígono del radar tiene vértices agudos. Tres geometrías distintas
  conviviendo sin regla.
- **Tipografía y etiquetas:** Work etiqueta en mono mayúscula de ~10 px +
  título en grotesca grande; SkillMap usa número grande + nombre en versales
  pequeñas + herramientas en mono gris (solo en la seleccionada); el Venn usa
  etiquetas en mono blanco diminuto sobre la esfera. Tres sistemas de
  etiqueta, tres tamaños y tres jerarquías.
- **Vidrio/transparencia:** el Hero es cromo iridiscente opaco; el Venn son
  esferas opacas brillantes; los nodos del radar son vidrio oscuro casi
  negro; Work es mate, sin vidrio ni transparencia. No hay un material
  «vidrio» compartido: cada pieza simula uno distinto.
- **Ritmo de espaciado:** Work deja un vacío vertical de ~380 px dentro de la
  tarjeta; SkillMap separa etiquetas y vértices 250–350 px; el Venn deja
  ~450 px de vacío a la izquierda. Los tres tienen vacíos grandes, pero con
  medidas, direcciones y lógicas distintas; no hay una retícula ni un
  espaciado de sección común (los huecos entre secciones varían de ~100 a
  ~500 px).

## Correcciones aplicadas (20 Nov 2026, ~14:05 CST, solo local, sin subir)

Jafet ordenó corregir los 40 puntos. Estado verificado en local (build raíz
en verde; 1440 y 390 sin overflow, sin page errors; capturas en
`~/workspace/v4fix-*.png`):

- **Work (10–16):** eliminado el sticky + blur/escala al hacer scroll (el
  fantasma desapareció); columna de texto centrada verticalmente (sin vacío
  de 380 px); «ABRIR CASO» ahora es un botón con borde; imagen a `h-full`
  (sin recorte del 118%); 3 fotos nuevas sin texto ni marcas ajenas
  (tarjeta de vidrio, autopista nocturna, cerámica clara); etiquetas de
  aria diferenciadas (imagen «Ver proyecto», botón «Abrir caso de estudio»).
- **Manifiesto/Venn (17–22):** contenedor de 140% → `max-w-[560px]` y
  cámara z 4.9 → 6.2 (las 3 esferas caben); etiquetas sobre sus esferas +
  «Punto dulce» al centro; lentes menos gruesas (0.35); retícula usada
  completa (texto col 1–5, Venn col 7–12); énfasis del párrafo reducido a
  la frase inicial + «token»; descendentes (g/y) con `padding-bottom` en
  `.reveal-line`.
- **SkillMap (27–32):** ancho máx 880 px (cabe en el viewport); etiquetas
  recalculadas sobre sus vértices; ejes hasta radio 128 y más visibles;
  prisma opaco → relleno plano azul 10% + contorno azul 85%; nodos de
  vidrio oscuro → perlas blancas; herramientas visibles en las 6 etiquetas;
  aspect 3/2 también en móvil.
- **Hero (5–9):** flautas del shader suavizadas (menos costillas, menos
  borde oscuro, menos dispersión y menos especular); scrim inferior al 62%;
  «&» abre la tercera línea; X/Y como texto plano tenue; HG_SHADER con más
  contraste.
- **Header (1–4):** relojes UTC/BCN solo desde xl (a 1440 ya no desborda);
  coordenadas y horas con más contraste; scroll-margin 88 px en todas las
  secciones (el header ya no tapa el contenido al anclar).
- **Experience (23–26):** métricas en fila de 3 (número arriba, etiqueta
  debajo; apiladas en móvil); párrafo a ancho completo debajo; 8 marcas con
  una sola tipografía (sin itálicas/serif/mono mezcladas).
- **Testimonios (33–36):** aviso «contenido de muestra» eliminado; flechas
  más grandes (variante `large` de CircleButton) y contador con más
  contraste.
- **Footer (37–39):** monograma sin autoRotate (JP siempre legible, gira
  solo al arrastrar); marquesina sin `translate-y` y con padding inferior
  (ya no se recorta abajo); coords del pie = Barcelona 41.3874° N ·
  2.1686° E (antes Madrid).
- **Lenguaje visual (global):** un solo azul #000AFF; vidrio compartido con
  aberración cromática 0.35 y distorsión 0.2; etiquetas mono 11px en todas
  las piezas; espaciado de sección unificado py-20 / md:py-28.

Pendiente: aprobación de Jafet para subir a preview (commit con los
archivos v4 modificados + 3 `.b64` nuevos + AUDIT.md).
