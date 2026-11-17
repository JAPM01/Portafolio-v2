# Liquid Glass — implementación de la píldora

Motor activo: **liquid-gl@3.0.0** (NaughtyDuk). Rama: `preview`.

Documentación: https://github.com/naughtyduk/liquidGL/blob/main/package/README.md

## Causas verificadas en código

1. **Desplazamiento ligado a la página.** El shader sumaba el
   desplazamiento `offset` directamente a `mapped`, coordenadas UV
   normalizadas de la textura completa. La cantidad de píxeles desplazados
   aumentaba con las dimensiones de la captura, aunque la cápsula no
   cambiara de tamaño. Se verifica en la fuente 3.0.0, shaders GLSL y WGSL.
2. **Suavizado obligatorio de texto.** Incluso con `frost: 0`, ambos
   shaders promediaban cinco muestras (`sampleUV` y sus cuatro vecinos).
   Se reemplazó ese promedio por una sola muestra; el desenfoque explícito
   de `frost > 0` permanece.
3. **Contorno duplicado.** El contenedor `previewGlassRoot::after`
   añadía otra superficie redondeada, con degradado blanco e iluminación,
   encima de la lente GPU. Se eliminó. El contorno restante usa el
   mismo rectángulo y radio que el objetivo óptico.
4. **Brillo sobre blanco.** `specular: true` sumaba luminosidad en
   el shader, además de los brillos CSS. Se desactivó hasta validar
   una iluminación que funcione sobre fondos claros y oscuros.
5. **Montaje dependiente del scroll.** `SiteNav` desmontaba la lente
   cuando `showGlass` era falso. Ahora su instancia permanece montada
   con `header1` seleccionado; el canvas se oculta al inicio del hero
   mediante CSS y aparece al desplazarse.
6. **Estado del motor.** El menú informaba «WebGL2» según el parámetro
   solicitado, no según el motor real. Ahora lee la clase del backend
   inicializado y, cuando existe, la escala de la captura.

## Parche reproducible

`scripts/patch-liquid-glass.mjs` se ejecuta en `postinstall` tras
`npm ci` y `npm install`. Modifica exclusivamente el fichero instalado
`node_modules/liquid-gl/liquidGL.js`, no la fuente del proyecto.

En ambas variantes GLSL y WGSL se convierte la desviación a unidades
de la lente:

```
offsetUV = direction * amount * centreBlend
         * min(lensWidth, lensHeight)
         * (snapshotBoundsUVSize / lensSize)
```

De ese modo, `refraction` y `bevelDepth` producen desplazamientos
proporcionales al tamaño físico de la píldora, no al alto de la página.

Para una píldora móvil de 62px, los valores actuales `0.024` y
`0.046` limitan el desplazamiento nominal combinado a
aproximadamente 4.3px antes de las atenuaciones del shader.
`aberration` permanece en `0`, `frost` en `0`,
`bevelWidth` en `0.071`, `magnify` en `1` y
`interaction: "fluid"` sigue habilitado.

**Control de integridad:** el script exige diez sustituciones verificables
(desplazamiento, muestreo, bordes de texto, iluminación del bisel y reflejos en ambos shaders) y falla si la versión de la librería
cambia de forma incompatible, en vez de aplicar un parche parcial.

## Límites y validación real

- La textura `body` se limita a la dimensión máxima de textura que
  permita la GPU. El motor puede reducir la escala en documentos muy largos.
- El rasterizador de liquidGL es una representación del DOM, no una
  captura nativa automática del compositor del navegador.
- El shader del canvas del hero se registra como contenido dinámico.
- La compilación confirma que Next.js acepta la integración y que
  `postinstall` parchea la dependencia. No confirma por sí sola la
  ausencia de artefactos ópticos en un teléfono.
- Revisar fondos claros, oscuros, letras detrás de la lente, continuidad
  al hacer scroll, contraste de iconos y comportamiento táctil en Android.

## Iteración de contraste, capas y refresco — Android

- En `liquidGL`, `zIndex` es **global**. El renderer resta el z-index
  del ancestro fijo antes de establecer el z-index local del canvas.
  El header tiene `z-index: 9999`; usar `zIndex: 10001` sitúa el
  canvas en `z-index: 1`, por debajo de la navegación (`z-index: 3`).
- Eliminamos `mix-blend-mode: difference` de la navegación. Este modo
  invertía los colores semánticos: los controles oscuros terminaban blancos
  sobre los paneles claros y parecían desaparecer. Ahora heredan
  `--header-foreground`, que depende del tema y de la ubicación del hero.
- El contorno se pinta **dentro** de la misma geometría, con un borde
  de 1px. Ya no hay outline exterior ni pseudo-elementos que puedan
  generar una segunda píldora.
- El desplazamiento óptico de la lente baja a `refraction: 0.026` y
  `bevelDepth: 0.018`, manteniendo `aberration: 0`.
- `NaughtyDOM.rasteriseAsync` captura una textura del documento que no
  reacciona automáticamente a cambios de `data-theme`, idioma o a todos
  los elementos que entran con animaciones. Para evitar mostrar estados
  anteriores, recapturamos después de cada scroll detenido (330 ms),
  cambio de tema (450 ms) y cambio de idioma (250 ms), con una ventana
  mínima de 1000 ms entre capturas. La textura anterior sigue activa
  mientras termina el refresco.
- El backend GPU sigue montado durante el scroll. El shader modificado
  en `postinstall` permanece igual.

### Validación pendiente

Capturas de Chrome Android sobre fondo negro, fondo blanco, textos
grandes y secciones intermedias. Comprobar que no exista texto
desplazado ni controles invisibles, y que el refresco de la captura no
provoque saltos o retardos perceptibles.

## Borde adaptativo sin segunda silueta

El borde CSS de `previewGlassRoot` también era incorrecto: la
interacción `fluid` puede deformar la máscara GPU, pero el contorno
estático seguía dibujando una píldora de tamaño original. Esto explica
que aparecieran dos contornos desplazados sobre fondos claros.

Se eliminó la geometría CSS adicional. Ambos shaders ahora calculan un
reflejo de borde `rimWeight = pow(edge, 8) * 0.28`, adaptado a la
luminosidad de la imagen refractada. La máscara, el radio y la
elasticidad proceden de una única superficie GPU. En fondos negros,
el borde gana algo de luminosidad; en blancos se oscurece sutilmente.
No se utilizan otros colores base de la paleta.

## Corrección de alta fidelidad y contraste — noviembre 2026

- El shader mantiene la refracción de gradientes y colores, pero limita los dobles contornos al cruzar letras de alto contraste. Compara la muestra refractada con la muestra original y reduce el desplazamiento únicamente cuando difieren mucho. El mismo código existe en WebGL y WebGPU.
- Los parámetros `refraction: 0.014` y `bevelDepth: 0.009` producen una desviación física nominal de aproximadamente 1.4px sobre una lente de 62px, antes de las atenuaciones espaciales y la interacción viscosa.
- El texto se toma con una sola muestra cuando `frost: 0`; la aberración cromática se mantiene en cero.
- La captura de `body` se actualiza al terminar la carga de fuentes y después de cambiar idioma, tema o tamaño de pantalla. El scroll solo actualiza coordenadas y contraste; no dispara un proceso de rasterización completo en cada pausa.
- Los iconos y JPM eligen de forma independiente un tono de la escala neutra autorizada, según la luminancia mediana de sus respectivas regiones en la captura real. Se utiliza histéresis para evitar parpadeos. Si la captura no permite lectura, siguen usando los colores semánticos del tema.
- La barra y la superficie óptica tienen exactamente la misma altura en móvil y escritorio.
- Los controles y el menú permanecen como DOM interactivo, encima del canvas GPU.


## Recuperación de profundidad sin doble cápsula (noviembre 2026)

La lente actual conserva una sola máscara GPU. Su versión anterior usaba `refraction=0.014`, `bevelDepth=0.009`, `bevelWidth=0.068` y `specular=false`; por ello resultaba casi plana. Ahora utiliza `0.024 / 0.046 / 0.15` y `specular=true`.

Los diez parches reproducibles en WebGL y WebGPU mantienen los ocho cambios previos y amplían la iluminación: el bisel usa una transición de perfil amplio (con una cresta fina), mientras que el reflejo especular se modula por luminosidad. Esto permite recuperar volumen sobre el mesh oscuro sin blanquear fondos claros. La protección de texto de alto contraste, la ausencia de cromatismo y el muestreo nítido permanecen.

La sombra difusa se aplica al **canvas con transparencia** de la GPU, siguiendo su silueta, nunca mediante una segunda píldora ni un pseudo-elemento con bordes. El padding horizontal de la navegación queda simétrico: 17px en móvil y 24px en escritorio.

El estado del menú de desarrollo ahora muestra `geometría ΔNpx`, que compara los rectángulos CSS y GPU de la lente al iniciar y al terminar de desplazarse o cambiar el tamaño, para detectar discrepancias reales en dispositivos. Un Δ cercano a cero demuestra alineación de las dimensiones medidas, pero no valida por sí mismo el aspecto final del shader.
