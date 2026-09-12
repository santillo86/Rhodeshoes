/* ============================================================
   RHODE SHOES — app.js
   1. ilustraciones de relleno   2. catálogo + filtro
   3. consulta por Instagram     4. header / reveal
   5. hero 3D
   ============================================================ */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IG_USER = 'rhode.shoes';

  /* ---------- 0. REVEAL (se declara antes: lo usa el catálogo) --- */
  let io = null;
  if ('IntersectionObserver' in window && !reduced) {
    io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  }
  function observe(els) { els.forEach(el => io ? io.observe(el) : el.classList.add('is-in')); }

  /* ---------- 2. CATÁLOGO: categoría + marca + búsqueda ---- */
  const LIST  = window.RHODE_PRODUCTS || [];
  const BY_ID = new Map(LIST.map(p => [p.img, p]));
  const grid  = $('#grid'), chips = $('#chips'), cats = $('#cats'), count = $('#count');
  const STEP  = 24;                      // cuántas cards carga cada tanda
  let cat = 'Todo', filter = 'Todas', shown = STEP, query = '';
  const more  = $('#more'), qBox = $('#q'), qClr = $('#qx'), empty = $('#empty');

  /* el proveedor escribe los colores en inglés; esto deja buscar en castellano */
  const SYN = {
    rosa:['pink'], rosado:['pink'], fucsia:['pink'],
    negro:['black'], negra:['black'], negras:['black'],
    blanco:['white'], blanca:['white'], blancas:['white'],
    gris:['grey','gray'], grises:['grey','gray'],
    azul:['blue'], celeste:['blue'], marino:['marine','navy'],
    verde:['green'], rojo:['red'], roja:['red'],
    amarillo:['yellow'], naranja:['orange'],
    marron:['brown'], violeta:['purple'], lila:['purple','lila'],
    crema:['cream'], beige:['beige','cream'], hueso:['bone','ivory'],
    plateado:['silver'], plata:['silver'], dorado:['gold'], oro:['gold'],
    jean:['denim'], cuero:['leather'], gamuza:['suede'],
    alta:['high'], altas:['high'], baja:['low'], bajas:['low'],
    botin:['botin','predator','predstrike','maxpro'], botines:['botin','predator','predstrike','maxpro'],
    zapatilla:[''], zapatillas:['']
  };
  const norm = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  LIST.forEach(p => { p._k = norm(`${p.c} ${p.b} ${p.n} ${p.v}`); });

  const full = p => p.b + ' ' + p.n + (p.v ? ' — ' + p.v : '');

  /* ---------- relleno tipográfico mientras no hay foto ----- */
  const TINTS = ['#cbbdc4', '#e4b8d0', '#bccad1', '#d5c5ae'];
  function filler(p, i) {
    const c = TINTS[i % TINTS.length];
    return `<div class="ph" aria-hidden="true">
      <svg viewBox="0 0 200 112">
        <text class="ph__mark" x="95" y="62" text-anchor="middle" fill="${c}">rhode</text>
        <circle cx="158" cy="56" r="5.4" fill="${c}"/>
        <path d="M64,78 L136,78" stroke="${c}" stroke-width="1.6" opacity=".75"/>
        <text class="ph__sub" x="100" y="95" text-anchor="middle" fill="${c}">${p.b.toUpperCase()}</text>
      </svg>
    </div>`;
  }
  const imgTag = (p, w) => `<img src="assets/products/${p.img}.webp" alt="${full(p)}"
      loading="lazy" decoding="async" data-remote="${(p.remote || '').replace('w=640', 'w=' + w)}"
      onload="this.closest('.card__pic,.lb__pic').classList.add('has-img')"
      onerror="if(this.dataset.remote){this.src=this.dataset.remote;this.dataset.remote='';}else{this.remove()}">`;

  const sizeChips = p => p.s.map(t => `<b role="button" tabindex="0" data-size="${t}">${t}</b>`).join('')
    + p.out.map(t => `<b class="out" aria-disabled="true">${t}</b>`).join('');

  function card(p, i) {
    const stock = p.s.length;
    const tag = p.tag ? `<span class="card__tag ${p.tag === 'Nuevo' ? 'card__tag--soft' : ''}">${p.tag}</span>` : '';
    return `<article class="card reveal" data-id="${p.img}" style="transition-delay:${(i % 4) * 60}ms">
      <button class="card__pic" type="button" aria-label="Ver ${full(p)} más grande">${tag}${filler(p, i)}${imgTag(p, 640)}
        <span class="card__zoom" aria-hidden="true">Ver foto</span>
      </button>
      <div class="card__brand">${p.b}</div>
      <h3>${p.n}</h3>
      <div class="card__variant">${p.v}</div>
      <div class="card__sizes">${sizeChips(p)}</div>
      <div class="card__foot">
        <span class="card__note">${stock ? stock + (stock === 1 ? ' talle disponible' : ' talles disponibles') : 'Sin stock · consultanos'}</span>
        <button class="card__ask" type="button">Consultar <span class="arrow">↗</span></button>
      </div>
    </article>`;
  }

  function rowsNow() {
    let r = cat === 'Todo' ? LIST : LIST.filter(p => p.c === cat);
    if (filter !== 'Todas') r = r.filter(p => p.b === filter);
    if (query) {
      const terms = norm(query).split(/\s+/).filter(Boolean);
      r = r.filter(p => terms.every(t => {
        if (/^\d{2}$/.test(t) && p.s.includes(+t)) return true;
        return [t, ...(SYN[t] || [])].some(a => a !== '' && p._k.includes(a))
            || (SYN[t] && SYN[t].includes(''));
      }));
    }
    return r;
  }

  function render(reset) {
    if (reset) shown = STEP;
    const rows = rowsNow(), slice = rows.slice(0, shown);
    grid.innerHTML = slice.map(card).join('');
    if (count) count.textContent = rows.length + (rows.length === 1 ? ' modelo' : ' modelos');
    if (empty) empty.hidden = rows.length > 0;
    if (more) {
      const rest = rows.length - slice.length;
      more.hidden = rest <= 0;
      more.firstChild.nodeValue = `Ver ${Math.min(rest, STEP)} más `;
    }
    $$('img', grid).forEach(im => { if (im.complete && im.naturalWidth) im.closest('.card__pic').classList.add('has-img'); });
    observe($$('.reveal', grid));
  }

  function renderChips() {
    if (!chips) return;
    const pool = cat === 'Todo' ? LIST : LIST.filter(p => p.c === cat);
    const tally = {};
    pool.forEach(p => tally[p.b] = (tally[p.b] || 0) + 1);
    const brands = ['Todas', ...Object.keys(tally).sort((a, b) => tally[b] - tally[a])];
    chips.innerHTML = brands.map(b =>
      `<button type="button" class="chip${b === filter ? ' is-on' : ''}" data-b="${b}">${b}` +
      `<i>${b === 'Todas' ? pool.length : tally[b]}</i></button>`).join('');
  }

  if (grid && LIST.length) {
    /* categorías (sólo si hay más de una con productos) */
    const catList = [...new Set(LIST.map(p => p.c))];
    if (cats && catList.length > 1) {
      cats.innerHTML = ['Todo', ...catList].map(c =>
        `<button type="button" class="cat${c === 'Todo' ? ' is-on' : ''}" data-c="${c}">${c}</button>`).join('');
      cats.addEventListener('click', e => {
        const b = e.target.closest('.cat'); if (!b) return;
        cat = b.dataset.c; filter = 'Todas';
        $$('.cat', cats).forEach(x => x.classList.toggle('is-on', x === b));
        renderChips(); render(true);
      });
    } else if (cats) cats.hidden = true;

    renderChips();
    chips && chips.addEventListener('click', e => {
      const c = e.target.closest('.chip'); if (!c) return;
      filter = c.dataset.b;
      $$('.chip', chips).forEach(x => x.classList.toggle('is-on', x === c));
      render(true);
    });

    if (qBox) {
      let t = null;
      qBox.addEventListener('input', () => {
        if (qClr) qClr.hidden = !qBox.value;
        clearTimeout(t);
        t = setTimeout(() => { query = qBox.value.trim(); render(true); }, 160);
      });
      qBox.addEventListener('keydown', e => { if (e.key === 'Escape') resetAll(); });
    }
    function resetAll() {
      if (qBox) qBox.value = '';
      if (qClr) qClr.hidden = true;
      query = ''; filter = 'Todas'; cat = 'Todo';
      $$('.cat', cats || document).forEach(x => x.classList.toggle('is-on', x.dataset.c === 'Todo'));
      renderChips(); render(true);
    }
    qClr && qClr.addEventListener('click', () => { resetAll(); qBox.focus(); });
    const qr = $('#qreset'); qr && qr.addEventListener('click', resetAll);
    if (more) more.addEventListener('click', () => { shown += STEP; render(); });

    render(true);
    const hm = $('#hero-count'); if (hm) hm.textContent = LIST.length;
    const hs = $('#hero-sizes');
    if (hs) {
      const all = LIST.flatMap(p => p.s);
      if (all.length) hs.textContent = `${Math.min(...all)}–${Math.max(...all)}`;
    }
  }

  /* ---------- 3. CONSULTA POR INSTAGRAM ------------------- */
  /* Instagram NO permite pre-cargar el texto del DM: no existe
     parámetro para eso. Lo que sí podemos es dejar el mensaje
     escrito, copiarlo y mostrarlo, para que el cliente sólo
     tenga que pegar. Si algún día se pasa a WhatsApp, alcanza
     con cambiar CHAT_URL y armar el link con ?text=              */
  const CHAT_URL = `https://ig.me/m/${IG_USER}`;
  const toast = $('#toast');
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(say._t); say._t = setTimeout(() => toast.classList.remove('is-on'), 4600);
  }

  const msgFor = (p, size) =>
    `¡Hola Rhode! Quiero saber si tenés stock de la ${full(p)}`
    + (size ? ` en talle ${size}. ¿Me pasás precio y forma de envío?`
            : `. ¿Qué talles te quedan y cuánto sale?`);

  /* copia con red de seguridad: el portapapeles moderno falla en
     http sin localhost y en algunos navegadores viejos */
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  /* --- panel de consulta --- */
  const askDlg = $('#ask');
  let askMsg = '';
  function openAsk(p, size) {
    askMsg = msgFor(p, size);
    if (!askDlg) { copy(askMsg); window.open(CHAT_URL, '_blank', 'noopener'); return; }
    $('#asktitle').textContent = full(p) + (size ? ` · Talle ${size}` : '');
    $('#askmsg').textContent = askMsg;
    if (lb && lb.open) lb.close();
    askDlg.showModal();
  }
  if (askDlg) {
    askDlg.addEventListener('click', async (e) => {
      if (e.target === askDlg || e.target.closest('#askx')) return askDlg.close();
      if (!e.target.closest('#askgo')) return;
      const ok = await copy(askMsg);
      say(ok ? 'Mensaje copiado — pegalo en el chat' : 'Copiá el mensaje de arriba y pegalo en el chat');
      askDlg.close();
      setTimeout(() => window.open(CHAT_URL, '_blank', 'noopener'), 250);
    });
    /* que se pueda seleccionar el texto a mano si el copiado falla */
    $('#askmsg').addEventListener('click', function () {
      const r = document.createRange(); r.selectNodeContents(this);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    });
  }

  const markSize = (chip) => {
    $$('b', chip.parentElement).forEach(b => b.classList.remove('is-on'));
    chip.classList.add('is-on');
  };
  const chosen = (root) => { const b = $('.card__sizes b.is-on', root); return b && b.textContent; };

  grid && grid.addEventListener('click', (e) => {
    const c = e.target.closest('.card'); if (!c) return;
    const p = BY_ID.get(c.dataset.id); if (!p) return;
    const chip = e.target.closest('.card__sizes b[data-size]');
    if (chip) { markSize(chip); return openAsk(p, chip.textContent); }   // tocar el talle ya arma la consulta
    if (e.target.closest('.card__ask')) return openAsk(p, chosen(c));
    if (e.target.closest('.card__pic')) return openLb(p, chosen(c));
  });
  grid && grid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('b[data-size]')) {
      e.preventDefault(); e.target.click();
    }
  });

  /* ---------- 3b. VISOR DE PRODUCTO ----------------------- */
  const lb = $('#lb');
  let lbProd = null;
  function openLb(p, size) {
    if (!lb) return;
    lbProd = p;
    $('#lbpic').className = 'lb__pic';
    $('#lbpic').innerHTML = filler(p, 0) + imgTag(p, 1080);
    $('#lbbrand').textContent = p.c === 'Botines' ? `${p.b} · Botines` : p.b;
    $('#lbname').textContent = p.n;
    $('#lbvar').textContent = p.v;
    $('#lbsizeslabel').textContent = p.s.length ? 'Talles disponibles' : 'Sin stock por ahora';
    $('#lbsizes').innerHTML = sizeChips(p);
    if (size) { const b = $$('b[data-size]', $('#lbsizes')).find(x => x.textContent === size); if (b) b.classList.add('is-on'); }
    const im = $('img', $('#lbpic'));
    if (im && im.complete && im.naturalWidth) $('#lbpic').classList.add('has-img');
    lb.showModal();
  }
  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) return lb.close();                 // click en el fondo
      const chip = e.target.closest('.card__sizes b[data-size]');
      if (chip) { markSize(chip); return openAsk(lbProd, chip.textContent); }
      if (e.target.closest('#lbask') && lbProd) return openAsk(lbProd, chosen(lb));
      if (e.target.closest('#lbx')) lb.close();
    });
  }

  /* ---------- 4. HEADER + REVEAL ------------------------- */
  const header = $('.site-header');
  const onStick = () => header && header.classList.toggle('is-stuck', scrollY > 40);
  addEventListener('scroll', onStick, { passive: true }); onStick();

  observe($$('.reveal'));

  /* el año del footer, antes de cualquier salida temprana */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- 5. HERO 3D --------------------------------- */
  /* En celular NO se carga nada del 3D: ni el motor, ni el
     decodificador, ni el modelo. Se muestra una imagen fija de
     la misma zapatilla (assets/shoe-poster.webp, 48 KB) en vez
     de ~1,2 MB + WebGL. En desktop va el 3D completo.          */
  const hero = $('.hero'), stage = $('.stage'), mv = $('#shoe3d');
  if (!hero || !stage || !mv) return;

  const MV_SRC = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
  const wants3D = () => innerWidth > 900 && !reduced;
  let booted = false;

  function boot3D() {
    if (booted || !wants3D()) return;
    booted = true;
    const sc = document.createElement('script');
    sc.type = 'module'; sc.src = MV_SRC;
    document.head.appendChild(sc);
    customElements.whenDefined('model-viewer').then(() => {
      mv.src = mv.dataset.src;
      start3D();
    });
  }
  boot3D();
  /* si alguien agranda la ventana o gira la tablet, recién ahí se carga */
  if (!booted) addEventListener('resize', boot3D, { passive: true });

  function start3D() {
  const AZ_FROM = -22, AZ_TO = 338;   // grados de giro a lo largo del hero
  const POL_FROM = 82, POL_TO = 70;   // inclinación
  // Tamaño de la zapatilla: es el encuadre de la cámara, no la caja.
  // Más chico = más cerca = más grande. En celular se afloja un poco
  // porque la caja es proporcionalmente más ancha y se recortaría.
  const RADIUS = () => innerWidth < 900 ? '86%' : '70%';

  let target = 0, current = 0, tiltX = 0, tiltY = 0, curX = 0, curY = 0;
  let running = false, visible = true;

  const readProgress = () => {
    const r = hero.getBoundingClientRect();
    target = clamp(-r.top / (r.height * 0.92));
  };
  function apply() {
    const az = AZ_FROM + (AZ_TO - AZ_FROM) * current;
    const pol = POL_FROM + (POL_TO - POL_FROM) * current;
    mv.cameraOrbit = `${az + curX}deg ${pol + curY}deg ${RADIUS()}`;
    stage.style.setProperty('--p', current.toFixed(4));
  }
  function loop() {
    current += (target - current) * 0.12;
    curX += (tiltX - curX) * 0.08;
    curY += (tiltY - curY) * 0.08;
    apply();
    const still = Math.abs(target - current) < 0.0004
               && Math.abs(tiltX - curX) < 0.02 && Math.abs(tiltY - curY) < 0.02;
    if (still || !visible) { running = false; return; }
    requestAnimationFrame(loop);
  }
  const kick = () => { if (!running && visible) { running = true; requestAnimationFrame(loop); } };

  if (reduced) {
    mv.cameraOrbit = `${AZ_FROM}deg ${POL_FROM}deg ${RADIUS()}`;
  } else {
    mv.interpolationDecay = 60;
    addEventListener('scroll', () => { readProgress(); kick(); }, { passive: true });
    addEventListener('resize', () => { readProgress(); kick(); });
    if (matchMedia('(pointer:fine)').matches) {
      addEventListener('mousemove', (e) => {
        tiltX = (e.clientX / innerWidth - .5) * 14;
        tiltY = (e.clientY / innerHeight - .5) * -7;
        kick();
      }, { passive: true });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); },
        { threshold: 0 }).observe(hero);
    }
    readProgress(); current = target; apply(); kick();
  }

    /* la imagen fija hace de placeholder hasta que el 3D está listo */
    mv.addEventListener('load', () => stage.classList.add('is-loaded', 'is-3d'), { once: true });
    mv.addEventListener('error', () => {
      stage.classList.add('is-loaded');
      console.warn('[rhode] No se pudo cargar el 3D; queda la imagen fija. ¿Abriste la página con un servidor local? Ver README.md');
    }, { once: true });
  }
})();
