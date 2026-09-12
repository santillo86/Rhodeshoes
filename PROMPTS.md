# Rhode Shoes · Pack de prompts

Tres bloques: **fotos de producto**, **posts de Instagram** y **cómo pedirme
cambios a mí** sin que tenga que releer todo el proyecto.

---

## 1. Fotos de producto

El catálogo se ve profesional o amateur por una sola razón: **si las 22 fotos
comparten ángulo, luz y fondo, parece una marca. Si cada una viene de un lado
distinto, parece una carpeta de capturas de pantalla.**

Por eso el prompt se arma en dos partes: un **bloque base que NO se toca nunca**
y una **línea de modelo** que cambia por zapatilla.

### 1.1 Bloque base (constante — copialo idéntico en las 22)

```
Professional e-commerce product photograph of a single sneaker,
strict three-quarter front-left view, shoe pointing to the left,
lateral side fully visible, toe angled 30 degrees toward camera.
Camera at shoe height, 85mm lens, no perspective distortion.
Soft large softbox from upper left, subtle fill from the right,
one crisp contact shadow directly under the sole, no cast shadow on the wall.
Pure white seamless background, isolated product, centered,
10 percent empty margin on every side.
Photorealistic, sharp focus edge to edge, true-to-life materials,
visible texture on leather and suede, clean laces, no wrinkles.
Square 1:1 composition. Commercial catalog quality.
```

### 1.2 Línea de modelo (cambiá solo esta)

Pegala **antes** del bloque base:

```
{MARCA} {MODELO} in {COLORWAY}, {MATERIALES}.
```

Ejemplos listos para usar:

| Archivo | Línea de modelo |
|---|---|
| `dunk-low-panda` | `Nike Dunk Low in black and white panda colorway, smooth leather upper, white midsole.` |
| `air-force-1-white` | `Nike Air Force 1 '07 in triple white, tumbled leather upper, perforated toe box.` |
| `nb-550-white-green` | `New Balance 550 in white with green accents, leather upper, retro basketball silhouette.` |
| `samba-og-white` | `Adidas Samba OG in cloud white with black stripes and gum sole, leather and suede.` |
| `gel-kayano-14-cream` | `Asics Gel-Kayano 14 in cream and grey, mesh upper with silver overlays, visible gel unit.` |
| `old-skool-black-white` | `Vans Old Skool in black canvas and suede with white side stripe, white foxing tape.` |
| `chuck-70-parchment` | `Converse Chuck 70 high top in parchment off-white canvas, cream rubber toe cap.` |

### 1.3 Negative prompt (Stable Diffusion / Firefly)

```
two shoes, pair, human foot, leg, person, hands, shoe box, text, logo,
watermark, brand name text, price tag, cluttered background, colored
background, gradient background, reflection, mirror, tilted horizon, blurry,
low resolution, extra laces, deformed sole, cartoon, illustration, 3d render
```

### 1.4 Herramienta por herramienta

- **Midjourney** → agregá al final: `--ar 1:1 --style raw --stylize 150 --v 6.1`
  El `--style raw` es clave: sin eso Midjourney "embellece" y cada foto queda
  con un look distinto.
- **Adobe Firefly** → Content type **Photo**, Visual intensity bajo, 1:1.
  Usá el negative prompt de arriba.
- **Nano Banana / Gemini** → cuando tengas la primera imagen que te guste,
  subila como referencia y pedí: *"misma cámara, misma luz, mismo fondo,
  cambiá solo la zapatilla por {MODELO}"*. Es la forma más rápida de mantener
  la serie pareja.
- **Si tenés fotos reales del proveedor** → no generes nada. Recortá el fondo
  (remove.bg o Photoshop) y pasámelas: yo las convierto a WebP en los dos
  tamaños que necesita la web.

### 1.5 Qué hacer con la imagen ya generada

Guardala en `assets/products/` con **el nombre exacto** de la columna `img`
de `js/products.js`, en dos tamaños:

```
dunk-low-panda.webp       ← hasta 1200 px
dunk-low-panda@sm.webp    ← hasta 640 px
```

Si me pasás la carpeta con los originales, el redimensionado y la conversión
los hago de una sola pasada.

---

## 2. Posts de Instagram (los 6 recuadros)

Van en `assets/instagram/` como `ig-1.webp` … `ig-6.webp`, cuadrados.
Si preferís generarlos en vez de usar posts reales:

```
Editorial sneaker photograph for a fashion Instagram feed.
{ESCENA}. Soft natural light, muted pastel pink and warm grey palette,
film grain, shallow depth of field, 35mm look.
No text, no logos, no watermarks. Square 1:1.
```

Reemplazá `{ESCENA}` por:

1. `Close-up of sneaker laces and eyelets, macro detail`
2. `Two sneakers side by side on a concrete step, seen from above`
3. `Person walking on a city sidewalk, cropped at the knees, sneakers in focus`
4. `Sneaker resting on a pale pink paper backdrop, single hard shadow`
5. `Open shoe box with tissue paper, sneaker peeking out`
6. `Detail of a rubber outsole tread pattern, high contrast`

---

## 3. Cómo pedirme cambios (y gastar menos)

El proyecto está separado en archivos chicos justamente para esto. Si me decís
**qué archivo tocar**, voy directo y no leo todo de nuevo.

**Plantillas que funcionan bien:**

> En `js/products.js`, agregá estos modelos: Nike Dunk High — Syracuse,
> talles 40 a 43, sin stock el 43.

> En `css/style.css`, la zapatilla del hero está muy grande. Bajala un 15%.

> Agregá una sección nueva entre el catálogo y la guía de talles, con
> {lo que quieras}. Seguí el estilo de las secciones que ya están.

**Lo que encarece sin necesidad:**

- "Revisá toda la web y mejorá lo que veas" → me obliga a releer todo.
  Mejor: "revisá la sección X".
- Pegarme HTML entero en el chat → el archivo ya lo tengo, decime el nombre.
- Pedirme que mire imágenes de a una → mandame la carpeta y las proceso juntas.

**Ajustes del hero 3D que podés hacer vos mismo**, todos comentados en el
bloque 20 de `css/style.css` y en el bloque 5 de `js/app.js`:

| Querés… | Tocá |
|---|---|
| **Zapatilla más grande** | `RADIUS` en `js/app.js` (bloque 5) → bajá el `70%`. Es el encuadre de la cámara: 84% la muestra entera con aire, 70% llena el banner, abajo de 62% empieza a pisar el texto. **Este es el control real del tamaño, no el ancho de la caja.** |
| Que sobresalga más del banner | `.stage { bottom: -20% }` en `css/style.css` → más negativo |
| Moverla a la derecha o izquierda | `.stage { left: 75% }` |
| Que gire más o menos | `AZ_FROM` / `AZ_TO` en `js/app.js` |
| Que gire más suave | el `0.12` de `loop()` en `js/app.js` → más chico = más suave |
| Más o menos perspectiva | `field-of-view="24deg"` en el `<model-viewer>` del `index.html` |
| Bajar el peso del modelo | regenerar el `.glb` con `--texture-size 1024` (hoy va en 2048, malla completa) |
