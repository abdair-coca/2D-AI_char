# JEV: eliminación del fondo del personaje 2D

Este documento describe cómo renderiza la app al personaje Rive sin fondo visible y qué decisiones lo respaldan. Aplica a `character-ai`.

## Estado actual (técnica prestada de jevBot)

El personaje se dibuja **directamente** desde el runtime de Rive y el fondo se neutraliza con una **máscara radial CSS estática**. No hay procesamiento de píxeles por frame.

~~~text
prove1.riv ──► useRive (WebGL2) ──► <RiveComponent class="rive-source">
                                          │
                            máscara radial CSS (App.css)
                            + transform: scale(1.4)
                                          │
                                          ▼
                              personaje visible, sin fondo
~~~

Puntos clave:

1. **Render directo.** `src/components/Character.tsx` monta únicamente `<RiveComponent className="rive-source" />`. No hay canvas intermedio ni copia por frame.
2. **Máscara radial.** `.rive-source` en `src/App.css` aplica:

   ~~~css
   -webkit-mask-image: radial-gradient(ellipse 46% 43% at 50% 50%, #000 0 58%, transparent 100%);
   mask-image: radial-gradient(ellipse 46% 43% at 50% 50%, #000 0 58%, transparent 100%);
   ~~~

   El centro del óvalo queda opaco; hacia el borde el degradado llega a `transparent` y recorta los bordes del canvas y cualquier resto de fondo. Es composición de GPU: coste fijo, cero CPU por frame.
3. **Escala.** `.character-orbit canvas` aplica `transform: scale(1.4); transform-origin: center` para agrandar al personaje sin tocar el artboard.

## Historial: por qué se cambió

La versión anterior usaba `TransparentRiveCanvas.tsx`:

- Copiaba el canvas WebGL a un canvas 2D **cada frame** (`requestAnimationFrame`).
- Ejecutaba un flood-fill desde los bordes (`removeEdgeConnectedBackground`) que ponía `alpha = 0` a todo píxel oscuro (`max(r,g,b) ≤ 64`) y poco saturado conectado al borde.

Problemas conocidos:

- **Frágil:** dependía de que el fondo del `.riv` fuese oscuro y grisáceo; un fondo morado (azul > 64) no se detectaba.
- **Caro:** `getImageData` + BFS a resolución completa × `devicePixelRatio` en cada frame, con allocations nuevos por frame (presión de GC).
- **Franja de contorno:** threshold binario sin feathering dejaba halos oscuros.

La solución de jevBot (`C:\Users\abdai\Desktop\Tracker\jevBot`) eliminaba todo eso: un solo `RiveComponent` + `mask-image` en CSS. Este proyecto adoptó la misma técnica.

## Archivos tocados

| Archivo | Cambio |
| --- | --- |
| `src/components/Character.tsx` | `src` = `/rive/prove1.riv`; eliminado el import y el uso de `TransparentRiveCanvas` y el destructuring de `canvas`. |
| `src/App.css` (`.rive-source`) | Quitado `opacity: 0` y `position: absolute`; añadida la máscara radial. |
| `src/App.css` (`.character-orbit canvas`) | `transform: scale(1.4)`. |
| `src/components/TransparentRiveCanvas.tsx` | Queda **sin uso** (no se borró el archivo). |

## Cómo tunear

- **Tamaño:** cambiar el `1.4` de `.character-orbit canvas`.
- **Encuadre de la máscara:** los radios `46% 43%` y el stop `58%` del gradient. Más `58%` = zona opaca más grande (menos viñeteado alrededor del personaje). Menos = fundido antes.
- **Si aparece un fondo sólido** dentro de la zona opaca, el problema está en el `.riv` (el artboard pinta su Fill). Solución limpia: editor Rive → artboard → Fill con alfa 0 → re-exportar. La máscara solo difumina bordes; no puede tapar fondo que quede alrededor del personaje en el centro.

## Límites y notas

- `prove1.riv` conserva las propiedades `shapeWidth/Height/Sharpness` en `ViewModel1` → los sliders y el `applyShapeParameters` de `Chat.tsx` (flujo `create_new`) siguen operativos.
- `public/rive/character.riv` (variante usada por jevBot) **no** tiene esas propiedades: con ese archivo los sliders quedan sin efecto visual.
- El warning de consola `stateMachines parameter is deprecated` es pre-existente del runtime de Rive y no está relacionado.
