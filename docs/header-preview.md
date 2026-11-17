# Liquid Glass — Header principal

Se seleccionó **liquidGL 3.0.0** de NaughtyDuk para el header de `preview`.

**Documentación oficial:** https://github.com/naughtyduk/liquidGL/blob/main/package/README.md

**Demo oficial de referencia para una barra:** https://liquidgl.naughtyduk.com/demos/menu-bar.html

## Configuración óptica

| Parámetro | Valor | Motivo |
|---|---:|---|
| `refraction` | `0.012` | Cerca del valor inicial `0.01` de la documentación |
| `aberration` | `0` | Desactiva separación RGB que causaba halos y apariencia de imagen triplicada; recomendado para diagnosticar artefactos |
| `bevelDepth` | `0.014` | Profundidad tomada de la demo oficial de menú |
| `bevelWidth` | `0.071` | Banda del bisel estrecha, como la demo oficial |
| `frost` | `0` | Mantiene transparente la superficie y la refracción visible |
| `specular` | `true` | Reflejos animados |
| `interaction` | `fluid` | Interacción viscosa por mouse o tacto |
| `interactionStrength` | `0.44` | Interacción más contenida |
| `interactionRadius` | `0.35` | Radio de interacción documentado |
| `interactionViscosity` | `0.65` | Recuperación fluida |
| `resolution` | `1.25` móvil / `1.6` escritorio | Equilibrio entre claridad y memoria |

La aberración cromática es un efecto opcional, **no un requisito para producir refracción**. Debe volver a activarse solamente tras confirmar que no hay halos ni contornos duplicados en Chrome para Android; entonces probar un valor muy bajo separado del bisel.

## Continuidad del efecto

- El objetivo óptico ocupa exactamente el contenedor del header.
- El snapshot es `#main`, una fuente estable que excluye el propio header para evitar autocaptura. El proyecto usa `<main id="main">`.
- Se registra el canvas dinámico del hero mediante `liquidGL.registerDynamic()` después de inicializar la lente.
- No se emplean keys dependientes del scroll ni cambios de fuente al cambiar de sección.
- Al inicio del hero no hay píldora; al desplazarse se monta la lente y queda activa mientras se continúa descendiendo.
- El menú de desarrollo conserva una opción para regresar temporalmente al header anterior. La opción **Liquid Glass** es la predeterminada.

## Validación en dispositivo

Revisar que el borde sea neutral, sin verdes/amarillos; que el texto detrás no se triplique; que exista distorsión refractiva única; que los iconos permanezcan visibles y táctiles; y que no se remonte la lente al cambiar de sección. La compilación valida la integración de código, no el efecto óptico en el teléfono.
