# JEV: formas procedurales nativas en Rive

Este documento describe el estado técnico actual de 2D-AI_char. La aplicación combina React, Rive, TypeSafe/JEV y Groq para que JEV conserve sus animaciones e interacción mientras cambia su silueta mediante geometría procedural.

La meta de esta etapa no es generar SVG arbitrario. La meta es que un modelo produzca una configuración geométrica segura y que Rive construya la forma nativamente.

## Quick path

1. Ejecuta la aplicación desde character-ai.
2. Prueba shapeType = 0 para validar el cuerpo y sus animaciones originales.
3. Prueba las formas procedurales 1..4 con parámetros neutros.
4. Cambia shapeRoundness, shapeBulge, shapeTaper y shapeAsymmetry.
5. Verifica Bump, fills, strokes, morph e interacción.

El siguiente hito es reemplazar la geometría de puntos de Groq por un JSON de parámetros que React escriba en ViewModel1.

## Arquitectura actual

~~~text
React / futuro modelo JEV / Groq
              │
              ▼
          ViewModel1
              │
      ┌───────┴────────┐
      │                │
   shapeType       parámetros
      │                │
      └───────┬────────┘
              ▼
       Path Effect Script
              │
              ▼
         SPHERE > Path
              │
      ┌───────┴────────┐
      │                │
  activeShape = 0  activeShape 1..4
      │                │
  return inPath     generar Path
      │                │
  Rive original     geometría procedural
~~~

El seam principal de la geometría es el Path Effect Script: recibe inputs enlazados por Data Binding, conserva inPath o construye un Path nuevo y devuelve la geometría final a cada fill o stroke.

## Responsabilidades

| Módulo | Responsabilidad |
|---|---|
| Rive State Machine | Estados, animaciones, interacción, Pointer Down/Up y Bump original. |
| Path Effect Script | Geometría procedural, modificadores, morph y sincronización visual. |
| ViewModel1 | Transporte de parámetros entre React/Rive y entre las instancias del efecto. |
| React | Interfaz, sliders, secuencias y futura escritura de parámetros. |
| TypeSafe/JEV | Seleccionar un estado existente o decidir create_new. |
| Groq | Generar una configuración de forma cuando JEV decide create_new. |
| DynamicShape/SVG | Implementación heredada; no es el destino de la arquitectura nativa. |

## Inputs del Path Effect

El script expone:

~~~text
width
height
shapeType
pressed
shapeRoundness
shapeBulge
shapeTaper
shapeAsymmetry
~~~

Estado interno:

~~~text
context
activeShape
fromShape
targetShape
wasPressed
morphTime
morphActive
~~~

### Valores

| Parámetro | Rango | Valor neutro | Efecto |
|---|---:|---:|---|
| width | 50–150 | 100 | Escala horizontal. |
| height | 50–150 | 100 | Escala vertical. |
| shapeType | 0–4 | 0 | Selecciona la topología base. |
| pressed | 0–1 | 0 | Detecta Pointer Down. |
| shapeRoundness | 0–100 | 0 | Mezcla la forma hacia una elipse. |
| shapeBulge | -100–100 | 0 | Infla o contrae el centro. |
| shapeTaper | -100–100 | 0 | Estrecha una zona y ensancha la opuesta. |
| shapeAsymmetry | -100–100 | 0 | Deforma lateralmente la masa central. |

Todas las instancias relevantes de fills y strokes deben recibir los mismos valores del ViewModel. Cada fill puede tener su propia instancia de MyEffect, pero el binding debe apuntar a la misma propiedad.

### Alineación de nombres

El script de Rive documentado usa width y height. El frontend histórico usa también shapeWidth, shapeHeight y shapeSharpness.

Antes de conectar Groq definitivamente hay que elegir un contrato único. No se deben introducir mapeos implícitos. El contrato externo recomendado es:

~~~text
shapeWidth
shapeHeight
shapeSharpness
shapeRoundness
shapeBulge
shapeTaper
shapeAsymmetry
~~~

Si el script conserva nombres cortos por compatibilidad, el adaptador debe ser explícito y estar documentado en un solo lugar.

## Formas procedurales

~~~text
shapeType = 0  JEV original / Path nativo de Rive
shapeType = 1  Rounded Square
shapeType = 2  Diamond
shapeType = 3  Triangle
shapeType = 4  Organic Blob
~~~

Constantes actuales:

~~~lua
local BASE_SIZE = 400
local MORPH_DURATION = 0.28
local POINT_COUNT = 32
~~~

Los 32 puntos mantienen una topología común para interpolar las formas 1..4.

## Regla crítica: shapeType 0

shapeType = 0 no es una forma procedural normal. Representa el Path real animado por Rive.

Cuando activeShape == 0, el efecto debe devolver:

~~~lua
return inPath
~~~

Esto conserva Idle, Blink, Follow, Bump, estados, animaciones y deformaciones originales de Rive.

Los modificadores procedurales no deben alterar el cuerpo cuando activeShape == 0.

El retorno a shapeType = 0 es directo. No se hace morph procedural hacia un círculo, porque ese círculo es solo una aproximación y no representa los vértices reales de inPath.

## Geometría base

shapePoint() centraliza la forma:

~~~text
shape 0 → circlePoint como geometría auxiliar
shape 1 → roundedSquarePoint
shape 2 → diamondPoint
shape 3 → trianglePoint
shape 4 → blobPoint
~~~

Las formas recorren 32 puntos.

- circlePoint: puntos alrededor de una elipse.
- roundedSquarePoint: superellipse simplificada.
- diamondPoint: TOP → RIGHT → BOTTOM → LEFT → TOP.
- trianglePoint: TOP → BOTTOM RIGHT → BOTTOM LEFT → TOP.
- blobPoint: radio distorsionado con ondas suaves.

La forma blob usa conceptualmente:

~~~lua
distortion =
  1
  + 0.10 * sin(angle * 3 + 0.7)
  + 0.06 * sin(angle * 5 - 0.8)
~~~

## Modificadores

El orden actual es intencional:

~~~text
shapePoint
→ applyRoundness
→ applyBulge
→ applyTaper
→ applyAsymmetry
→ Path
~~~

### Roundness

Mezcla el punto procedural con el punto equivalente de una elipse:

~~~text
0   → conserva la forma
50  → mezcla parcial
100 → elipse
~~~

### Bulge

La fuerza máxima está en el centro vertical y disminuye hacia arriba y abajo. Usa aproximadamente una intensidad 0.25.

~~~text
0    → sin cambio
+100  → ensancha el centro
-100  → contrae el centro
~~~

### Taper

Usa la coordenada vertical normalizada:

~~~text
-1 → arriba
 0 → centro
+1 → abajo
~~~

~~~text
+100 → arriba estrecho, abajo ancho
-100 → arriba ancho, abajo estrecho
~~~

### Asymmetry

La deformación lateral es mayor cerca del centro vertical y menor en los extremos. No es una traslación completa:

~~~text
0    → simétrico
+100  → masa hacia la derecha
-100  → masa hacia la izquierda
~~~

Toda la geometría está centralizada en applyModifiers().

## Morph procedural

El morph ocurre entre formas 1..4 usando:

~~~text
fromShape
targetShape
morphTime
morphActive
POINT_COUNT = 32
~~~

Por cada punto:

~~~text
fromPoint = shapePoint(fromShape)
toPoint   = shapePoint(targetShape)
point     = lerp(fromPoint, toPoint, eased)
final     = applyModifiers(point)
~~~

La duración aproximada es 0.28 segundos. El easing usa smoothstep con un pequeño overshoot para una transición suave y viva.

El Path Effect no controla el Bump.

## Interacción y Bump

La State Machine original conserva:

~~~text
Pointer Down
├── trigState
└── pressed = 1

Pointer Up
└── pressed = 0
~~~

El script detecta únicamente el flanco:

~~~text
pressed >= 0.5
wasPressed < 0.5
~~~

El Bump pertenece a la State Machine:

~~~text
State Machine → interacción y Bump
Path Effect   → geometría y morph
~~~

No se debe volver a introducir en el script lógica como bumpTime, bumpActive, bumpX, bumpY o squash.

## Bug de State Machine ya resuelto

Durante las pruebas, Idle mostró formas extrañas. El problema no estaba en el Path Effect ni en los parámetros geométricos.

La causa estaba en la layer States de la State Machine. Después de corregirla, Idle volvió a funcionar.

Si aparece el mismo síntoma, revisar primero:

~~~text
States
StatesRandom
capas concurrentes
~~~

antes de modificar el script.

## Presets de prueba

| Forma | type | width | height | roundness | bulge | taper | asymmetry |
|---|---:|---:|---:|---:|---:|---:|---:|
| Círculo/óvalo | 1 | 100 | 100 | 100 | 0 | 0 | 0 |
| Cuadrado suave | 1 | 100 | 100 | 20 | 0 | 0 | 0 |
| Cápsula | 1 | 100 | 100 | 80 | 10 | 0 | 0 |
| Huevo | 1 | 85 | 120 | 75 | 10 | 40 | 0 |
| Gota | 1 | 90 | 125 | 65 | 5 | -75 | 5 |
| Pera | 1 | 100 | 100 | 55 | 25 | 70 | 5 |
| Diamante suave | 2 | 100 | 100 | 35 | 0 | 0 | 0 |
| Escudo | 2 | 100 | 100 | 30 | 10 | 55 | 0 |
| Triángulo suave | 3 | 100 | 100 | 45 | 5 | 0 | 0 |
| Blob/fantasma | 4 | 100 | 100 | 40 | 25 | 10 | 15 |
| Frijol | 4 | 110 | 90 | 50 | 10 | 0 | 70 |
| Piedra orgánica | 4 | 100 | 100 | 25 | 20 | -10 | 35 |

## Flujo futuro con TypeSafe, Groq y React

TypeSafe/JEV no genera geometría. Decide entre un estado existente o create_new:

~~~text
Usuario
  ↓
TypeSafe/JEV
  ├── estado existente
  └── create_new
        ↓
      Groq
~~~

Para create_new, Groq debe devolver parámetros estructurados:

~~~json
{
  "shapeType": 4,
  "width": 112,
  "height": 93,
  "shapeRoundness": 71,
  "shapeBulge": 36,
  "shapeTaper": -10,
  "shapeAsymmetry": 12
}
~~~

El flujo final previsto:

~~~text
Prompt
↓
TypeSafe/JEV decide
↓
Groq genera parámetros
↓
React valida y escribe ViewModel1
↓
Path Effect construye la forma
~~~

La salida antigua de Groq basada en puntos para DynamicShape es un adaptador heredado durante la migración, no el contrato final.

## Checklist de verificación

- [ ] shapeType = 0 devuelve inPath.
- [ ] Idle funciona sin formas extrañas.
- [ ] Bump sigue controlado por Rive.
- [ ] Pointer Down y Pointer Up funcionan repetidamente.
- [ ] Todos los fills y strokes cambian juntos.
- [ ] Las formas 1..4 usan 32 puntos.
- [ ] Los cuatro modificadores funcionan durante el morph.
- [ ] El retorno a shapeType = 0 conserva las animaciones.
- [ ] Los valores neutros no cambian la apariencia.
- [ ] React y Groq todavía no escriben parámetros hasta fijar nombres.
- [ ] No se usa SVG como destino de la arquitectura nativa.

## Próximo paso

1. Elegir los nombres canónicos del contrato externo.
2. Crear un tipo compartido de parámetros en React.
3. Validar y limitar valores antes de escribir en Rive.
4. Probar un preset desde React.
5. Cambiar Groq de puntos a parámetros.
6. Mantener el SVG como fallback temporal hasta verificar el flujo nativo.

No incorporar SQLite ni persistencia de formas hasta que el contrato de parámetros funcione de forma estable en el navegador.
