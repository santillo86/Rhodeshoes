# Rhode Shoes — catálogo

## Cómo verlo (hace falta un servidor local)
El modelo 3D `.glb` no carga si abrís el `index.html` con doble clic
(el navegador lo bloquea por CORS). Necesitás un servidor local:

**Opción 1 — una línea en la terminal**, parado en esta carpeta:
```
python3 -m http.server 8080
```
Después abrí http://localhost:8080

**Opción 2 — VS Code:** abrí esta carpeta, instalá la extensión
"Live Server", clic derecho en `index.html` → "Open with Live Server".

## Estructura
```
index.html              la página
css/style.css           todos los estilos
js/products.js          EL CATÁLOGO ← acá agregás modelos
js/app.js               catálogo, filtro, consulta por IG, 3D
assets/models/shoe.glb  modelo 3D comprimido (632 KB)
assets/products/        fotos de producto (.webp)
assets/brands/          logos de marca (opcional, ver abajo)
assets/instagram/       ig-1.webp … ig-6.webp
assets/og-rhode.png     imagen que se ve al compartir el link
assets/favicon.svg      ícono de la pestaña
_backup/                el index.html original, por las dudas
```

## Agregar un modelo al catálogo
Abrí `js/products.js` y copiá una línea. El campo `img` es el nombre
del archivo sin extensión. Si la foto todavía no existe, la card
muestra un placeholder y la web sigue funcionando.

## Poner las fotos reales
Guardá cada foto en `assets/products/` con **dos versiones**:
- `nombre.webp`     → hasta 1200 px (detalle)
- `nombre@sm.webp`  → hasta 640 px (la que usa la grilla)

Fondo transparente o blanco, zapatilla centrada, mismo ángulo en todas.
Ver `PROMPTS.md` para generar fotos consistentes.

## Ajustes rapidos del hero 3D
Estan comentados en el bloque 16 de `css/style.css` y en las constantes
del bloque 4 de `js/app.js`. Tabla resumen en `PROMPTS.md`, seccion 3.

## El catálogo viene de ImportProvee
`js/products.js` se generó desde tu catálogo B2B: 187 modelos con el
nombre, el colorway y los talles con stock que figuran ahí. El archivo
crudo quedó en `_backup/importprovee-raw.txt` por si hay que regenerarlo.

**Las fotos hoy se cargan desde el servidor del proveedor.** Funciona y no
pesa nada, pero si ellos borran o cambian una imagen, en tu web desaparece.
Para tener copia propia:

```
cd ~/Downloads/rhode-shoes-proyecto-completo
bash _backup/bajar-fotos.sh
```

Baja las 187 fotos a `_fotos-descargadas/`. Avisame cuando termine y las
convierto a WebP dentro de `assets/products/`; a partir de ahí la web usa
las locales y el proveedor deja de ser una dependencia.

Mientras tanto el orden de prioridad de cada card es:
foto local → foto del proveedor → placa tipográfica de Rhode.

## Actualizar el catálogo más adelante
Cuando cambie el stock, avisame y vuelvo a leer el catálogo B2B desde tu
navegador para regenerar `js/products.js`. No hace falta que copies nada.

`js/products.js` **se genera automáticamente, no lo edites a mano**. Sale de:

```
_backup/importprovee-raw.txt        Zapatillas (187)
_backup/importprovee-botines.txt    Botines (2)
python3 _backup/generar-catalogo.py  -> js/products.js
```

Si querés sumar otra categoría del proveedor (Ropa, Liquidación), se agrega
un archivo nuevo y una línea en la lista FUENTES del script.

## Buscador
Busca en categoría, marca, modelo y colorway, sin tildes y con varias
palabras. Un número de dos dígitos busca por talle ("41" trae todo lo que
tenga ese talle). Tiene diccionario castellano→inglés de colores porque el
proveedor los escribe en inglés: rosa→pink, negro→black, gamuza→suede, etc.
Está en la constante `SYN` de `js/app.js`, se le agregan palabras a mano.

## Visor de producto
Al hacer clic en la foto de una card se abre un `<dialog>` con la foto en
grande (pide la del proveedor a 1080px), los datos y los talles. El talle que
hayas elegido en la card viaja al visor. Se cierra con la ×, con Escape o
haciendo clic en el fondo.

## El mensaje de "Consultar"

**Instagram no permite dejar el mensaje escrito de antemano.** No existe un
parámetro de URL para eso — con WhatsApp sí (`wa.me/NUMERO?text=...`), con
Instagram no. Por eso el flujo es: se arma el mensaje, se copia al
portapapeles, se muestra en pantalla y se abre el chat. El cliente sólo pega.

Tocar un talle ya dispara el panel de consulta, con el mensaje listo:

> ¡Hola Rhode! Quiero saber si tenés stock de la {marca} {modelo} — {color}
> en talle {talle}. ¿Me pasás precio y forma de envío?

Sin talle elegido pregunta "¿Qué talles te quedan y cuánto sale?".
El texto se arma en `msgFor()` de `js/app.js`.

### Si algún día querés pasar a WhatsApp
Ahí el mensaje sí queda escrito solo, sin copiar ni pegar. Son dos líneas en
`js/app.js`: cambiar `CHAT_URL` por
`https://wa.me/54911XXXXXXXX?text=` + el mensaje codificado con
`encodeURIComponent()`. Decime el número y lo dejo andando.

## El 3D sólo en desktop
En celular no se carga nada del 3D: ni el motor de model-viewer (~250 KB),
ni el decodificador Draco (~336 KB), ni el modelo (632 KB). Se muestra
`assets/shoe-poster.webp` (48 KB), que es una captura del mismo 3D en el
mismo ángulo.

Esa imagen además hace de placeholder en desktop: se ve al instante y el 3D
la reemplaza recién cuando terminó de cargar.

El corte está en `js/app.js`, función `wants3D()`: hoy es ancho > 900 px.
Si el navegador tiene animaciones reducidas, tampoco carga el 3D.

Para regenerar el poster (por ejemplo si cambia el modelo), avisame: se saca
del propio 3D, no es una foto aparte.

## Categorías
El catálogo soporta categorías (campo `c`). Hoy hay una sola (Zapatillas), así
que el selector se esconde solo. Si volvés a sumar otra, aparece automático.

## Pendientes de Santiago
- [ ] Correr `bash _backup/bajar-fotos.sh` para tener las fotos propias
- [x] Feed de Instagram cargado (6 posts en `assets/instagram/`)
- [ ] Opcional: logos de marca en `assets/brands/`
- [ ] Al publicar, excluir la carpeta "Claude outputs" (capturas, 6+ MB)
