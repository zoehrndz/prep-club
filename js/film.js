/* =========================================================================
   PREP CLUB — Film principal (motion design, ~50 s)
   Chaque scène dessine l'image du temps t sur un canvas. La bande-son est
   synthétisée en direct (Web Audio) et calée sur le tempo (100 BPM) :
   aperçu dans la page, export vidéo + son (MediaRecorder) ou PNG.
   ========================================================================= */
'use strict';

const FILM = (() => {
  const C = {
    ivory: '#FBF7EF', cream: '#F3ECDD', white: '#FFFFFF', olive: '#56663A', oliveDark: '#2F3A1F', oliveDeep: '#222A16',
    oliveSoft: '#E5E9D2', sand: '#E6D3AE', sandSoft: '#F0E5CF', taupe: '#8E7D69', charcoal: '#1F1E1B',
    saffron: '#E9A23B', tomato: '#D4623B', muted: '#6B6255', line: '#E6DCC9',
  };
  const SANS = 'Manrope, "Helvetica Neue", Arial, sans-serif';
  const SERIF = 'Fraunces, Georgia, serif';
  const F = (w, size, fam = SANS, it = false) => `${it ? 'italic ' : ''}${w} ${Math.round(size)}px ${fam}`;
  const BEAT = 0.6; // 100 BPM
  const BAR = BEAT * 4;

  const FORMATS = {
    wide: { w: 1920, h: 1080, label: '16:9 · YouTube, site, écrans', ratio: '16 / 9' },
    tall: { w: 1080, h: 1920, label: '9:16 · Reels, TikTok, Stories', ratio: '9 / 16' },
  };

  const FIELDS = [
    ['hook', 'Accroche (entre * * = italique)', 'On mange quoi *ce soir ?*'],
    ['tagline', 'Signature', 'Votre semaine, préparée.'],
    ['offer', 'Offre de fin', '−10 % sur votre 1re commande · BIENVENUE10'],
    ['url', 'Adresse du site', 'prepclub.fr'],
  ];
  const defaults = () => Object.fromEntries(FIELDS.map(([k, , v]) => [k, v]));

  /* ---------- Outils ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const p = (t, start, dur) => clamp((t - start) / dur);
  const lerp = (a, b, k) => a + (b - a) * k;
  const E = {
    out: (x) => 1 - Math.pow(1 - x, 3),
    out5: (x) => 1 - Math.pow(1 - x, 5),
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  const euro = (v) => `${v.toFixed(2).replace('.', ',')} €`;
  const prod = (id) => (typeof PRODUCTS !== 'undefined' && PRODUCTS.find((x) => x.id === id)) || { id, name: id, price: 0, img: '' };

  /* ---------- Images ---------- */
  const url = (id, w = 900) => (!id ? '' : /^(https?:|data:|blob:)/.test(id) ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`);
  const IMGS = {};
  function loadImg(key, src, w) {
    return new Promise((res) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => { IMGS[key] = im; res(im); };
      im.onerror = () => res(null);
      im.src = url(src, w);
    });
  }
  function grayCopy(im) {
    if (!im) return null;
    const c = document.createElement('canvas');
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    const x = c.getContext('2d');
    x.filter = 'grayscale(1) contrast(1.05)';
    x.drawImage(im, 0, 0);
    return c;
  }
  let loading = null;
  function preload() {
    if (loading) return loading;
    const list = [['shelves', IMG.shelves, 1600], ['spread', IMG.spread, 1200], ['market', IMG.market, 1200]];
    PRODUCTS.forEach((x) => list.push([x.id, x.img, 600]));
    PRODUCERS.forEach((x) => list.push([x.id, x.img, 400]));
    loading = Promise.all(list.map(([k, s, w]) => loadImg(k, s, w))).then(() => { IMGS.shelvesGray = grayCopy(IMGS.shelves); });
    return loading;
  }
  async function fontsReady() {
    try {
      await Promise.all(['800 40px Manrope', '700 40px Manrope', '600 40px Manrope', '500 40px Manrope', '400 40px Fraunces', '500 40px Fraunces', '600 40px Fraunces', 'italic 400 40px Fraunces', 'italic 500 40px Fraunces'].map((f) => document.fonts.load(f)));
    } catch (e) { /* polices de secours */ }
  }

  /* ---------- Dessin ---------- */
  function rr(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function cover(ctx, el, x, y, w, h, zoom = 1, fx = 0.5, fy = 0.5) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const iw = el && (el.naturalWidth || el.width), ih = el && (el.naturalHeight || el.height);
    if (!iw || !ih) {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, '#B9A88E'); g.addColorStop(1, '#7C6E5A');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    } else {
      const r = Math.max(w / iw, h / ih) * zoom;
      const dw = iw * r, dh = ih * r;
      ctx.drawImage(el, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
    }
    ctx.restore();
  }
  function roundImg(ctx, el, x, y, w, h, r, zoom = 1) {
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip(); cover(ctx, el, x, y, w, h, zoom); ctx.restore();
  }
  function plate(ctx, el, cx, cy, r, s, rot = 0, ring = C.ivory) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.shadowColor = 'rgba(20,24,12,.35)'; ctx.shadowBlur = 40 * s; ctx.shadowOffsetY = 18 * s;
    ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.clip();
    cover(ctx, el, -r, -r, r * 2, r * 2, 1.05);
    ctx.restore();
  }
  function card(ctx, x, y, w, h, r, s, fill = C.white) {
    ctx.save();
    ctx.shadowColor = 'rgba(47,58,31,.16)'; ctx.shadowBlur = 30 * s; ctx.shadowOffsetY = 12 * s;
    ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
    ctx.restore();
  }
  function txt(ctx, s, x, y, font, color, align = 'left', base = 'alphabetic') {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
    ctx.fillText(s, x, y);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }
  function spaced(ctx, s, x, y, size, color, spacing = 0.2, align = 'left', weight = 800) {
    ctx.font = F(weight, size);
    const chars = [...String(s)];
    const widths = chars.map((c) => ctx.measureText(c).width + size * spacing);
    const total = widths.reduce((a, b) => a + b, 0) - size * spacing;
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    ctx.fillStyle = color; ctx.textBaseline = 'middle';
    chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i]; });
    ctx.textBaseline = 'alphabetic';
    return total;
  }
  function eyebrow(ctx, s, x, y, size, color, k = 1, align = 'left') {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k;
    const lw = 34 * size / 20;
    if (align === 'center') {
      ctx.font = F(800, size);
      const w = spaced(ctx, s, -9999, -9999, size, color) + lw + size * 0.6;
      ctx.fillStyle = color; rr(ctx, x - w / 2, y - size * 0.06, lw * k, size * 0.14, size * 0.07); ctx.fill();
      spaced(ctx, s, x - w / 2 + lw + size * 0.6, y, size, color);
    } else {
      ctx.fillStyle = color; rr(ctx, x, y - size * 0.06, lw * k, size * 0.14, size * 0.07); ctx.fill();
      spaced(ctx, s, x + lw + size * 0.6 + (1 - k) * 20, y, size, color);
    }
    ctx.restore();
  }
  function pill(ctx, s, x, y, size, bg, fg, align = 'left', o = {}) {
    ctx.font = F(o.weight || 700, size);
    const w = ctx.measureText(s).width + size * 1.6;
    const h = size * 2.3;
    const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = bg; rr(ctx, left, y - h / 2, w, h, h / 2); ctx.fill();
    if (o.stroke) { ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || fg; ctx.stroke(); }
    ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.fillText(s, left + size * 0.8, y + size * 0.04);
    ctx.textBaseline = 'alphabetic';
    return w;
  }
  function logo(ctx, x, y, size, fg = C.charcoal, ac = C.olive, align = 'left', k = 1) {
    ctx.font = F(600, size, SERIF);
    const a = ctx.measureText('PREP').width + size * 0.12;
    ctx.font = F(500, size, SERIF, true);
    const b = ctx.measureText('CLUB').width;
    const left = align === 'center' ? x - (a + b) / 2 : x;
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    // Révélation lettre par lettre
    const letters = [...'PREP'].map((c) => [c, false]).concat([...'CLUB'].map((c) => [c, true]));
    let cx = left;
    letters.forEach(([c, it], i) => {
      ctx.font = it ? F(500, size, SERIF, true) : F(600, size, SERIF);
      const w = ctx.measureText(c).width;
      const kk = k >= 1 ? 1 : E.out(clamp(k * 1.8 - i * 0.09));
      if (kk > 0) {
        ctx.save();
        ctx.beginPath(); ctx.rect(cx - size * 0.2, y - size * 0.95, w + size * 0.4, size * 1.25); ctx.clip();
        ctx.fillStyle = it ? ac : fg;
        ctx.fillText(c, cx, y + (1 - kk) * size * 1.1);
        ctx.restore();
      }
      cx += w + (i === 3 ? size * 0.12 : 0);
    });
    ctx.restore();
    return a + b;
  }
  function badge(ctx, cx, cy, r, rot, label, s, bg = C.saffron, fg = C.oliveDeep) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(rot);
    const chars = [...label];
    ctx.font = F(800, r * 0.17); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    chars.forEach((c, i) => {
      ctx.save(); ctx.rotate((i / chars.length) * Math.PI * 2); ctx.fillText(c, 0, -r * 0.74); ctx.restore();
    });
    ctx.rotate(-rot);
    ctx.font = F(500, r * 0.5, SERIF, true); ctx.fillText('✺', 0, r * 0.03);
    ctx.restore();
  }
  function cursor(ctx, x, y, s, press = 0) {
    ctx.save();
    ctx.translate(x, y);
    const k = 1 - press * 0.15;
    ctx.scale(k * s * 1.25, k * s * 1.25);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.lineTo(9, 26); ctx.lineTo(15, 39); ctx.lineTo(21, 36); ctx.lineTo(15, 23); ctx.lineTo(26, 23); ctx.closePath();
    ctx.fillStyle = C.charcoal; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = C.white; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
  }
  function ripple(ctx, x, y, k, s, color = C.saffron) {
    if (k <= 0 || k >= 1) return;
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.lineWidth = 4 * s; ctx.strokeStyle = color;
    ctx.beginPath(); ctx.arc(x, y, 10 * s + 50 * s * E.out(k), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  function squiggle(ctx, x, y, w, s, k, color = C.saffron) {
    if (k <= 0) return;
    ctx.save();
    ctx.lineWidth = 9 * s; ctx.lineCap = 'round'; ctx.strokeStyle = color;
    ctx.beginPath();
    const n = 60;
    for (let i = 0; i <= n * k; i++) {
      const u = i / n;
      const px = x + u * w, py = y + Math.sin(u * Math.PI * 5) * 9 * s;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }
  function glow(ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('A', a)); g.addColorStop(1, color.replace('A', 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  /* Texte riche : *mots en italique* dans la couleur d'accent, révélés mot à mot */
  function parse(text) {
    const out = [];
    let it = false;
    String(text || '').split(/(\*)/).forEach((seg) => {
      if (seg === '*') { it = !it; return; }
      seg.split(/\s+/).filter(Boolean).forEach((w) => out.push({ w, it }));
    });
    return out;
  }
  function title(ctx, text, x, y, size, maxW, t, start, o = {}) {
    const fam = o.fam || SERIF;
    const fnt = (it) => (it ? F(o.itWeight || 400, size, SERIF, true) : F(o.weight || 420, size, fam));
    const words = parse(text);
    ctx.font = fnt(false);
    const space = ctx.measureText(' ').width;
    const lines = [];
    let cur = { words: [], width: 0 };
    words.forEach((wd) => {
      ctx.font = fnt(wd.it);
      const ww = ctx.measureText(wd.w).width;
      if (cur.words.length && cur.width + space + ww > maxW) { lines.push(cur); cur = { words: [], width: 0 }; }
      const wx = cur.words.length ? cur.width + space : 0;
      cur.words.push({ ...wd, x: wx, width: ww });
      cur.width = wx + ww;
    });
    if (cur.words.length) lines.push(cur);
    const lh = size * (o.lh || 1.06);
    const align = o.align || 'left';
    let i = 0;
    const res = { lines: [], h: lines.length * lh };
    lines.forEach((ln, li) => {
      const ly = y + li * lh;
      const lx = align === 'center' ? x - ln.width / 2 : align === 'right' ? x - ln.width : x;
      res.lines.push({ x: lx, y: ly, w: ln.width });
      ln.words.forEach((wd) => {
        const k = E.out(p(t, start + i * (o.stagger ?? 0.08), o.d || 0.7));
        const ko = o.out != null ? E.inOut(p(t, o.out + i * 0.03, 0.45)) : 0;
        i++;
        if (k <= 0 || ko >= 1) return;
        ctx.save();
        ctx.beginPath(); ctx.rect(lx + wd.x - size * 0.25, ly - size * 1.02, wd.width + size * 0.5, size * 1.38); ctx.clip();
        ctx.font = fnt(wd.it);
        ctx.fillStyle = wd.it ? (o.accent || C.olive) : (o.color || C.charcoal);
        ctx.fillText(wd.w, lx + wd.x, ly + (1 - k) * size * 1.2 - ko * size * 1.2);
        ctx.restore();
      });
    });
    return res;
  }
  function counter(t, start, dur, to) { return Math.round(to * E.out(p(t, start, dur))); }

  /* Grain argentique (comme le site) */
  let grainCv = null;
  function grain(ctx, W, H, t, a = 0.06) {
    if (!grainCv) {
      grainCv = document.createElement('canvas'); grainCv.width = grainCv.height = 256;
      const g = grainCv.getContext('2d');
      const im = g.createImageData(256, 256);
      for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      g.putImageData(im, 0, 0);
    }
    ctx.save();
    ctx.globalAlpha = a; ctx.globalCompositeOperation = 'overlay';
    const ox = Math.floor((t * 24) % 8) * 31, oy = Math.floor((t * 24) % 5) * 47;
    ctx.translate(-ox, -oy);
    ctx.fillStyle = ctx.createPattern(grainCv, 'repeat');
    ctx.fillRect(0, 0, W + 256, H + 256);
    ctx.restore();
  }
  /* Rideau entre deux scènes (même transition que les pages du site) */
  function curtain(ctx, W, H, t, at, color) {
    const k = (t - (at - 0.42)) / 0.42;
    if (k <= 0 || k >= 2) return;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    if (k < 1) {
      const a = E.inOut(k);
      const top = H * (1 - a), bulge = H * 0.12 * Math.sin(a * Math.PI);
      ctx.moveTo(0, H); ctx.lineTo(0, top); ctx.quadraticCurveTo(W / 2, top - bulge, W, top); ctx.lineTo(W, H);
    } else {
      const b = E.inOut(k - 1);
      const bot = H * (1 - b), bulge = H * 0.12 * Math.sin(b * Math.PI);
      ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, bot); ctx.quadraticCurveTo(W / 2, bot - bulge, 0, bot);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* =======================================================================
     SCÈNES
     ======================================================================= */
  const S = [];
  const scene = (o) => { o.start = S.length ? S[S.length - 1].start + S[S.length - 1].dur : 0; S.push(o); return o; };

  /* 1 — L'accroche */
  scene({
    id: 'hook', name: 'L’accroche', dur: BAR * 2, note: '« On mange quoi ce soir ? » — la question de tous les soirs.',
    draw(ctx, t, e) {
      const { W, H, s, wide } = e;
      ctx.fillStyle = C.ivory; ctx.fillRect(0, 0, W, H);
      glow(ctx, W * 0.85, H * 0.15, H * 0.7, 'rgba(233,162,59,A)', 0.14);
      glow(ctx, W * 0.1, H * 0.95, H * 0.6, 'rgba(86,102,58,A)', 0.12);
      const zoom = 1 + 0.03 * E.inOut(p(t, 0, 4.8));
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
      // Horloge + jour
      const cy = H * (wide ? 0.3 : 0.32);
      const ck = E.back(p(t, 0.15, 0.5));
      if (ck > 0) {
        ctx.save(); ctx.globalAlpha = clamp(ck);
        const r = 30 * s;
        const cx = W / 2 - 170 * s;
        ctx.lineWidth = 5 * s; ctx.strokeStyle = C.olive;
        ctx.beginPath(); ctx.arc(cx, cy, r * ck, 0, Math.PI * 2); ctx.stroke();
        const m = E.inOut(p(t, 0.3, 1.6)) * Math.PI; // 19 h → 19 h 30
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(m) * r * 0.72, cy - Math.cos(m) * r * 0.72); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(-Math.PI / 6 + m / 12) * r * 0.48, cy - Math.cos(-Math.PI / 6 + m / 12) * r * 0.48); ctx.stroke();
        const mins = Math.round(30 * E.inOut(p(t, 0.3, 1.6)));
        txt(ctx, `Lundi, 19 h ${String(mins).padStart(2, '0')}`, cx + r + 24 * s, cy + 2 * s, F(800, 40 * s), C.olive, 'left', 'middle');
        ctx.restore();
      }
      const size = (wide ? 170 : 132) * s;
      const res = title(ctx, e.d.hook, W / 2, H * (wide ? 0.56 : 0.5), size, W * (wide ? 0.8 : 0.86), t, 0.75, { align: 'center', stagger: 0.13, accent: C.olive, out: 4.25 });
      const last = res.lines[res.lines.length - 1];
      if (last && t < 4.3) squiggle(ctx, last.x + last.w * 0.05, last.y + size * 0.22, last.w * 0.9, s, E.inOut(p(t, 2.0, 0.6)) * (1 - p(t, 4.1, 0.2)));
      // Points d'interrogation qui surgissent
      const qs = wide ? [[0.17, 0.3, -0.3, C.tomato], [0.84, 0.36, 0.25, C.saffron], [0.78, 0.82, -0.15, C.olive]] : [[0.15, 0.2, -0.3, C.tomato], [0.84, 0.24, 0.25, C.saffron], [0.8, 0.76, -0.15, C.olive]];
      qs.forEach(([x, y, r, col], i) => {
        const k = E.back(p(t, 2.6 + i * BEAT / 2, 0.4)) * (1 - E.inOut(p(t, 4.2, 0.3)));
        if (k <= 0) return;
        ctx.save(); ctx.translate(W * x, H * y); ctx.rotate(r + Math.sin(t * 3 + i) * 0.08); ctx.scale(k, k);
        txt(ctx, '?', 0, 0, F(500, 150 * s, SERIF, true), col, 'center', 'middle');
        ctx.restore();
      });
      ctx.restore();
    },
  });

  /* 2 — Le problème */
  scene({
    id: 'probleme', name: 'Le problème', dur: BAR * 2, note: 'Courses, cuisine, vaisselle : 5 heures par semaine.',
    draw(ctx, t, e) {
      const { W, H, s, wide } = e;
      ctx.fillStyle = C.charcoal; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = 0.2 + 0.08 * p(t, 0, 1);
      cover(ctx, IMGS.shelvesGray, 0, 0, W, H, 1.08 + 0.06 * (t / 4.8));
      ctx.restore();
      glow(ctx, W * 0.5, H * 0.5, H * 0.9, 'rgba(31,30,27,A)', 0.6);
      const words = ['Les courses.', 'La cuisine.', 'La vaisselle.'];
      const size = (wide ? 150 : 128) * s;
      const gap = size * 1.12;
      const y0 = H * (wide ? 0.32 : 0.34);
      const dim = 1 - 0.6 * E.inOut(p(t, 2.9, 0.4));
      words.forEach((w, i) => {
        const at = i * BEAT;
        const k = p(t, at, 0.28);
        if (k <= 0) return;
        const sc = lerp(1.5, 1, E.out(k));
        const y = y0 + i * gap;
        ctx.save();
        ctx.globalAlpha = clamp(k * 2) * dim;
        ctx.translate(W / 2, y); ctx.scale(sc, sc); ctx.rotate((1 - E.out(k)) * (i % 2 ? 0.06 : -0.06));
        txt(ctx, w, 0, 0, F(420, size, SERIF), C.ivory, 'center', 'middle');
        ctx.restore();
        // Barré tomate
        const sk = E.inOut(p(t, 1.9 + i * 0.2, 0.3));
        if (sk > 0) {
          ctx.font = F(420, size, SERIF);
          const tw = ctx.measureText(w).width;
          ctx.save(); ctx.globalAlpha = dim;
          ctx.strokeStyle = C.tomato; ctx.lineWidth = 12 * s; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(W / 2 - tw / 2 - 10 * s, y + 4 * s); ctx.lineTo(W / 2 - tw / 2 - 10 * s + (tw + 20 * s) * sk, y - 6 * s * sk); ctx.stroke();
          ctx.restore();
        }
      });
      // Le chiffre
      const yb = y0 + 3 * gap + size * 0.2;
      const hours = counter(t, 2.9, 0.9, 5);
      if (t > 2.85) {
        title(ctx, `*${hours} heures* par semaine. Rien que ça.`, W / 2, yb, (wide ? 70 : 64) * s, W * 0.86, t, 2.9, { align: 'center', fam: SANS, weight: 700, accent: C.saffron, color: C.ivory, stagger: 0.06 });
      }
    },
  });

  /* 3 — La révélation de la marque */
  const PLATES = ['salmon-quinoa', 'chicken-rice-veg', 'overnight-oats', 'veggie-curry', 'chocolate-mousse', 'seasonal-bowl'];
  scene({
    id: 'marque', name: 'PREP CLUB', dur: BAR * 2, note: 'Le logo, la signature, les plats qui flottent.',
    draw(ctx, t, e) {
      const { W, H, s, wide } = e;
      const iris = E.inOut(p(t, 0, 0.6));
      if (iris < 1) S[1].draw(ctx, S[1].dur + t, e);
      ctx.save();
      if (iris < 1) { ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.hypot(W, H) * 0.55 * iris, 0, Math.PI * 2); ctx.clip(); }
      ctx.fillStyle = C.oliveDeep; ctx.fillRect(0, 0, W, H);
      glow(ctx, W * 0.82, H * 0.12, H * 0.9, 'rgba(233,162,59,A)', 0.28);
      glow(ctx, W * 0.1, H * 0.95, H * 0.7, 'rgba(110,127,69,A)', 0.5);
      const pos = wide
        ? [[0.13, 0.24, 175], [0.87, 0.22, 150], [0.09, 0.8, 140], [0.88, 0.78, 190], [0.32, 0.88, 95], [0.66, 0.1, 85]]
        : [[0.2, 0.13, 165], [0.86, 0.22, 130], [0.13, 0.8, 145], [0.82, 0.86, 185], [0.5, 0.95, 80], [0.6, 0.06, 80]];
      pos.forEach(([x, y, r], i) => {
        const k = E.back(p(t, 0.3 + i * 0.09, 0.6));
        if (k <= 0) return;
        const fy = Math.sin(t * 1.4 + i * 1.7) * 14 * s;
        const fx = (x - 0.5) * W * 0.12 * (1 - E.out(p(t, 0.3, 1.2)));
        plate(ctx, IMGS[PLATES[i]], W * x - fx, H * y + fy, r * s * k, s, t * 0.08 * (i % 2 ? 1 : -1), C.oliveDark);
      });
      const ly = H * (wide ? 0.52 : 0.5);
      const size = (wide ? 230 : 172) * s;
      logo(ctx, W / 2, ly, size, C.ivory, C.saffron, 'center', p(t, 0.55, 0.9));
      title(ctx, e.d.tagline, W / 2, ly + size * 0.62, (wide ? 72 : 60) * s, W * 0.86, t, 1.5, { align: 'center', fam: SERIF, weight: 400, color: C.sand, stagger: 0.1 });
      const bk = E.back(p(t, 2.1, 0.5));
      if (bk > 0) {
        ctx.save(); ctx.translate(W / 2 + size * (wide ? 1.72 : 1.05), ly - size * (wide ? 0.95 : 1.6)); ctx.scale(bk, bk);
        badge(ctx, 0, 0, (wide ? 92 : 78) * s, t * 0.6, 'PRÉPARÉ À LYON ✺ CHAQUE SEMAINE ✺ ', s);
        ctx.restore();
      }
      ctx.restore();
    },
  });

  /* 4 — Des plats frais, préparés à Lyon */
  const ROW1 = ['chicken-rice-veg', 'salmon-quinoa', 'mediterranean-bowl', 'lasagna', 'veggie-curry', 'seasonal-bowl', 'salmon-coconut-curry'];
  const ROW2 = ['overnight-oats', 'egg-avocado-box', 'pesto-pasta', 'roast-chicken', 'chia-pudding', 'raspberry-cake', 'beef-meatballs'];
  function dishCard(ctx, id, x, y, w, h, s) {
    const pr = prod(id);
    card(ctx, x, y, w, h, 26 * s, s);
    const ih = h - 92 * s;
    roundImg(ctx, IMGS[id], x + 10 * s, y + 10 * s, w - 20 * s, ih - 10 * s, 18 * s);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w - 120 * s, h); ctx.clip();
    txt(ctx, pr.name, x + 20 * s, y + ih + 38 * s, F(700, 25 * s), C.charcoal);
    ctx.restore();
    txt(ctx, euro(pr.price), x + w - 20 * s, y + ih + 38 * s, F(800, 25 * s), C.olive, 'right');
    txt(ctx, `${pr.weight || 380} g · prêt en 2 min`, x + 20 * s, y + ih + 70 * s, F(600, 19 * s), C.muted);
  }
  scene({
    id: 'carte', name: 'Des plats frais', dur: BAR * 2, note: 'La carte qui défile : plats frais, cuisinés chaque semaine à Lyon.',
    draw(ctx, t, e) {
      const { W, H, s, wide } = e;
      ctx.fillStyle = C.ivory; ctx.fillRect(0, 0, W, H);
      glow(ctx, W * 0.9, H * 0.05, H * 0.6, 'rgba(233,162,59,A)', 0.12);
      const pad = (wide ? 120 : 80) * s;
      const ty = wide ? 190 * s : 300 * s;
      eyebrow(ctx, 'PRÉPARÉ CHAQUE SEMAINE À LYON', pad, ty - 10 * s, 22 * s, C.olive, E.out(p(t, 0.05, 0.5)));
      const size = (wide ? 92 : 96) * s;
      title(ctx, 'Des plats *frais*, cuisinés chaque semaine avec des produits de saison.', pad, ty + size * 1.1, size, wide ? W * 0.52 : W - pad * 2, t, 0.15, { stagger: 0.05, accent: C.olive });
      // Chiffres clés
      const stats = [[PRODUCTS.length, 'recettes à la carte'], [5, 'moments de la journée'], [0, 'abonnement obligatoire']];
      stats.forEach(([n, l], i) => {
        const k = E.out(p(t, 0.7 + i * 0.15, 0.6));
        if (k <= 0) return;
        const x = wide ? W * 0.66 + i * 210 * s : pad + i * 315 * s;
        const y = wide ? ty + 70 * s : ty + 560 * s;
        ctx.save(); ctx.globalAlpha = k;
        txt(ctx, String(n ? counter(t, 0.7 + i * 0.15, 1.2, n) : 0), x, y + (1 - k) * 30 * s, F(400, 96 * s, SERIF), i === 2 ? C.tomato : C.olive);
        ctx.font = F(700, 21 * s);
        l.split(' ').reduce((acc, w) => { const last = acc[acc.length - 1]; if (last && ctx.measureText(`${last} ${w}`).width < 180 * s) acc[acc.length - 1] = `${last} ${w}`; else acc.push(w); return acc; }, [])
          .forEach((ln, j) => txt(ctx, ln, x, y + 40 * s + j * 28 * s, F(700, 21 * s), C.muted));
        ctx.restore();
      });
      // Deux rangées de plats qui défilent en sens inverse
      const cw = (wide ? 330 : 380) * s, ch = (wide ? 250 : 330) * s, gap = 28 * s;
      const rows = wide ? [H - 2 * ch - gap - 50 * s, H - ch - 50 * s] : [H * 0.53, H * 0.53 + ch + gap];
      [[ROW1, -1, rows[0]], [ROW2, 1, rows[1]]].forEach(([list, dir, y], r) => {
        const k = E.out(p(t, 0.35 + r * 0.15, 0.8));
        const total = list.length * (cw + gap);
        const off = ((t + 2) * 95 * s) % total;
        const yy = y + (1 - k) * 200 * s;
        ctx.save(); ctx.globalAlpha = k;
        for (let i = -1; i <= list.length; i++) {
          const x = dir < 0 ? i * (cw + gap) - off : i * (cw + gap) + off - total;
          for (const xx of [x, x + total]) if (xx > -cw && xx < W) dishCard(ctx, list[((i % list.length) + list.length) % list.length], xx, yy, cw, ch, s);
        }
        ctx.restore();
      });
    },
  });

  /* 5 — Commandez à votre façon */
  scene({
    id: 'facon', name: 'À votre façon', dur: BAR, note: 'Trois façons de commander : carte, box, planning.',
    draw(ctx, t, e) {
      const { W, H, s, wide } = e;
      ctx.fillStyle = C.oliveDark; ctx.fillRect(0, 0, W, H);
      glow(ctx, W * 0.8, H * 0.2, H * 0.8, 'rgba(233,162,59,A)', 0.22);
      glow(ctx, W * 0.15, H * 0.9, H * 0.7, 'rgba(110,127,69,A)', 0.45);
      const zoom = 1 + 0.25 * E.inOut(p(t, 2.0, 0.4));
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
      ctx.globalAlpha = 1 - p(t, 2.1, 0.3);
      const size = (wide ? 150 : 124) * s;
      const res = title(ctx, 'Commandez *à votre façon.*', W / 2, H * (wide ? 0.45 : 0.43), size, W * 0.86, t, 0.05, { align: 'center', color: C.ivory, accent: C.saffron, stagger: 0.09 });
      const y = H * (wide ? 0.45 : 0.43) + res.h + 20 * s;
      const chips = ['À la carte', 'En box', 'En planning'];
      ctx.font = F(700, 34 * s);
      const ws = chips.map((c) => ctx.measureText(c).width + 34 * s * 1.6);
      const gap = 22 * s;
      let x = W / 2 - (ws.reduce((a, b) => a + b, 0) + gap * 2) / 2;
      chips.forEach((c, i) => {
        const k = E.back(p(t, 0.8 + i * BEAT / 2, 0.4));
        if (k > 0) {
          ctx.save(); ctx.translate(x + ws[i] / 2, y); ctx.scale(k, k);
          pill(ctx, c, 0, 0, 34 * s, i === 0 ? C.saffron : C.ivory, C.oliveDeep, 'center');
          ctx.restore();
        }
        x += ws[i] + gap;
      });
      ctx.restore();
    },
  });

  /* 6 — Le site en action : carte, box, planning */
  const CARTE = ['chicken-rice-veg', 'salmon-quinoa', 'mediterranean-bowl', 'lasagna', 'veggie-curry', 'overnight-oats'];
  const BOX = ['chicken-rice-veg', 'salmon-quinoa', 'lasagna', 'veggie-curry', 'seasonal-bowl'];
  const PLAN_ROWS = [['Matin', ['overnight-oats', 'greek-yogurt-bowl', 'chia-pudding', 'granola-bowl', 'banana-bread', 'egg-avocado-box', 'breakfast-muffins']],
    ['Midi', ['chicken-rice-veg', 'salmon-quinoa', 'mediterranean-bowl', 'pesto-pasta', 'buddha-bowl', 'seasonal-bowl', 'creamy-chicken-bowl']],
    ['Soir', ['roast-chicken', 'salmon-squash', 'lasagna', 'veggie-curry', 'chicken-mushrooms', 'salmon-coconut-curry', 'beef-meatballs']],
    ['Pause', ['energy-balls', 'fresh-fruits', 'nut-mix', 'cookies', 'chocolate-mousse', 'homemade-granola', 'raspberry-cake']]];
  const SCREEN = BAR * 2;
  const CAPTIONS = [
    ['01', 'À la carte', 'Choisissez vos plats un par un, quand vous voulez.'],
    ['02', 'En box', 'Composez votre box : le prix se calcule en direct.'],
    ['03', 'En planning', 'Vos 7 jours organisés en un clic, puis tout au panier.'],
  ];
  // Moments de clic (temps local de la scène)
  const CLICKS_CARTE = [[1, 1.6], [3, 2.6], [4, 3.5]];
  const BOX_FILL = BOX.map((_, i) => SCREEN + 0.7 + i * 0.42);
  const BOX_ADD = SCREEN + 3.9;
  const PLAN_SUGGEST = SCREEN * 2 + 0.75;
  const PLAN_ADD = SCREEN * 2 + 3.5;

  function deviceRect(e) {
    const { W, H, s, wide } = e;
    if (wide) { const x = W * 0.38, y = 110 * s; return { x, y, w: W - x - 110 * s, h: H - y - 110 * s, phone: false }; }
    const w = 800 * s, h = 1300 * s;
    return { x: (W - w) / 2, y: H - h - 110 * s, w, h, phone: true };
  }
  function screenCarte(ctx, u, R, s, e) {
    const { x, y, w } = R;
    const pad = 36 * s;
    txt(ctx, 'La carte', x + pad, y + 70 * s, F(420, 52 * s, SERIF), C.charcoal);
    const chips = ['Tout', 'Petit-déjeuner', 'Déjeuner', 'Dîner', 'Végétarien'];
    let cx = x + pad;
    chips.forEach((c, i) => {
      if (R.phone && i > 3) return;
      ctx.save(); ctx.globalAlpha = E.out(p(u, 0.15 + i * 0.05, 0.4));
      cx += pill(ctx, c, cx, y + 125 * s, 17 * s, i === 0 ? C.olive : C.white, i === 0 ? C.ivory : C.charcoal, 'left', { stroke: i ? 1.5 * s : 0, strokeColor: C.line }) + 10 * s;
      ctx.restore();
    });
    const cols = R.phone ? 2 : 3;
    const gx = 20 * s;
    const cw = (w - pad * 2 - gx * (cols - 1)) / cols;
    const rows = Math.ceil(CARTE.length / cols);
    const chh = Math.min(R.phone ? 330 * s : 300 * s, (R.h - 175 * s - 30 * s - gx * (rows - 1)) / rows);
    const pos = [];
    CARTE.forEach((id, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const px = x + pad + c * (cw + gx), py = y + 175 * s + r * (chh + gx);
      pos.push([px, py, cw, chh]);
      const k = E.out(p(u, 0.25 + i * 0.06, 0.5));
      if (k <= 0) return;
      ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 40 * s);
      const pr = prod(id);
      ctx.fillStyle = C.white; rr(ctx, px, py, cw, chh, 18 * s); ctx.fill();
      ctx.lineWidth = 1.5 * s; ctx.strokeStyle = C.line; ctx.stroke();
      roundImg(ctx, IMGS[id], px + 8 * s, py + 8 * s, cw - 16 * s, chh - 100 * s, 13 * s);
      ctx.save(); ctx.beginPath(); ctx.rect(px, py, cw - 16 * s, chh); ctx.clip();
      txt(ctx, pr.name, px + 16 * s, py + chh - 58 * s, F(700, 19 * s), C.charcoal);
      ctx.restore();
      txt(ctx, euro(pr.price), px + 16 * s, py + chh - 26 * s, F(800, 19 * s), C.olive);
      // bouton +
      const added = CLICKS_CARTE.some(([j, at]) => j === i && u > at);
      const bx = px + cw - 34 * s, by = py + chh - 34 * s;
      const press = CLICKS_CARTE.some(([j, at]) => j === i && u > at - 0.08 && u < at + 0.1) ? 0.85 : 1;
      ctx.fillStyle = added ? C.saffron : C.olive;
      ctx.beginPath(); ctx.arc(bx, by, 22 * s * press, 0, Math.PI * 2); ctx.fill();
      txt(ctx, added ? '✓' : '+', bx, by + 1 * s, F(800, 24 * s), added ? C.oliveDeep : C.ivory, 'center', 'middle');
      ctx.restore();
    });
    return pos;
  }
  function screenBox(ctx, u, R, s) {
    const { x, y, w, h } = R;
    const pad = 36 * s;
    txt(ctx, 'Composer ma box', x + pad, y + 70 * s, F(420, 52 * s, SERIF), C.charcoal);
    // étapes
    const steps = ['Type', 'Plats', 'Options', 'Récap'];
    const sw = (w - pad * 2) / 4;
    steps.forEach((st, i) => {
      const yy = y + 118 * s;
      const on = i <= 1;
      ctx.fillStyle = on ? C.olive : C.line; rr(ctx, x + pad + i * sw, yy, sw - 10 * s, 7 * s, 4 * s); ctx.fill();
      if (i === 1) { ctx.fillStyle = C.saffron; rr(ctx, x + pad + i * sw, yy, (sw - 10 * s) * E.inOut(p(u, 0.6, 2.4)), 7 * s, 4 * s); ctx.fill(); }
      txt(ctx, `${i + 1} · ${st}`, x + pad + i * sw, yy + 36 * s, F(700, 17 * s), on ? C.olive : C.muted);
    });
    // emplacements
    const n = BOX.length;
    const cols = R.phone ? 3 : 5;
    const gap = 16 * s;
    const sz = Math.min((w - pad * 2 - gap * (cols - 1)) / cols, R.phone ? 220 * s : 240 * s);
    const rowW = cols * sz + (cols - 1) * gap;
    const top = y + 200 * s;
    let sum = 0;
    BOX.forEach((id, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const rowCount = Math.min(cols, n - r * cols);
      const startX = x + (w - (rowCount * sz + (rowCount - 1) * gap)) / 2;
      const px = (R.phone ? startX : x + (w - rowW) / 2) + c * (sz + gap), py = top + r * (sz + gap + 40 * s);
      ctx.save();
      ctx.setLineDash([10 * s, 8 * s]); ctx.lineWidth = 2.5 * s; ctx.strokeStyle = '#CDBF9F';
      rr(ctx, px, py, sz, sz, 22 * s); ctx.stroke(); ctx.setLineDash([]);
      txt(ctx, '+', px + sz / 2, py + sz / 2, F(500, 40 * s), '#CDBF9F', 'center', 'middle');
      const at = BOX_FILL[i] - SCREEN;
      const k = E.back(p(u, at, 0.4));
      if (k > 0) {
        sum += prod(id).price;
        ctx.translate(px + sz / 2, py + sz / 2); ctx.scale(k, k); ctx.translate(-px - sz / 2, -py - sz / 2);
        roundImg(ctx, IMGS[id], px, py, sz, sz, 22 * s);
      }
      ctx.restore();
      if (k > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(px, py, sz, sz + 40 * s); ctx.clip();
        txt(ctx, prod(id).name, px + 4 * s, py + sz + 28 * s, F(700, 15 * s), C.charcoal);
        ctx.restore();
      }
    });
    // récapitulatif
    const ph = 150 * s;
    const py = y + h - ph - pad;
    ctx.fillStyle = C.cream; rr(ctx, x + pad, py, w - pad * 2, ph, 22 * s); ctx.fill();
    const filled = BOX_FILL.filter((at) => u > at - SCREEN).length;
    txt(ctx, `Box Déjeuner · ${filled}/5 plats`, x + pad + 28 * s, py + 50 * s, F(800, 22 * s), C.charcoal);
    ctx.fillStyle = C.line; rr(ctx, x + pad + 28 * s, py + 72 * s, (w - pad * 2) * 0.42, 9 * s, 5 * s); ctx.fill();
    ctx.fillStyle = C.olive; rr(ctx, x + pad + 28 * s, py + 72 * s, (w - pad * 2) * 0.42 * (filled / 5), 9 * s, 5 * s); ctx.fill();
    const disc = E.out(p(u, 3.0, 0.4));
    const shownSum = sum;
    const priceX = R.phone ? x + pad + 28 * s : x + w - pad - 300 * s;
    const priceY = R.phone ? py + 125 * s : py + 95 * s;
    if (disc > 0) {
      ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * (1 - disc);
      txt(ctx, euro(shownSum), priceX, priceY - (R.phone ? 0 : 42 * s), F(700, (R.phone ? 20 : 22) * s), C.muted, R.phone ? 'left' : 'right');
      ctx.restore();
      ctx.font = F(700, 22 * s);
      const ow = ctx.measureText(euro(shownSum)).width;
      ctx.strokeStyle = C.tomato; ctx.lineWidth = 3 * s;
      ctx.beginPath();
      if (R.phone) { ctx.moveTo(priceX, priceY - 7 * s); ctx.lineTo(priceX + ow * disc, priceY - 7 * s); } else { ctx.moveTo(priceX - ow, priceY - 49 * s); ctx.lineTo(priceX - ow + ow * disc, priceY - 49 * s); }
      ctx.stroke();
    }
    const final = shownSum * (1 - 0.1 * disc);
    if (!R.phone) txt(ctx, euro(final), priceX, priceY + 4 * s, F(800, 40 * s), C.olive, 'right');
    else txt(ctx, euro(final), priceX + 110 * s, priceY + 2 * s, F(800, 30 * s), C.olive);
    const sk = E.back(p(u, 3.0, 0.4));
    if (sk > 0) {
      const bx = R.phone ? x + w - pad - 250 * s : x + w - pad - 410 * s, by = py - 8 * s;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.12); ctx.scale(sk, sk);
      pill(ctx, '−10 %', 0, 0, 24 * s, C.tomato, C.white, 'center', { weight: 800 });
      ctx.restore();
    }
    // bouton
    const bw = R.phone ? 200 * s : 230 * s;
    const bx = R.phone ? x + w - pad - 28 * s - bw : x + w - pad - 28 * s - bw;
    const by = R.phone ? py + 95 * s : py + ph / 2;
    const press = u > BOX_ADD - SCREEN - 0.08 && u < BOX_ADD - SCREEN + 0.12 ? 0.94 : 1;
    const done = u > BOX_ADD - SCREEN;
    if (!R.phone) {
      ctx.save(); ctx.translate(bx + bw / 2, by); ctx.scale(press, press);
      ctx.fillStyle = done ? C.saffron : C.olive; rr(ctx, -bw / 2, -30 * s, bw, 60 * s, 30 * s); ctx.fill();
      txt(ctx, done ? 'Ajoutée ✓' : 'Ajouter la box →', 0, 2 * s, F(800, 20 * s), done ? C.oliveDeep : C.ivory, 'center', 'middle');
      ctx.restore();
    } else {
      ctx.save(); ctx.translate(bx + bw / 2, by); ctx.scale(press, press);
      ctx.fillStyle = done ? C.saffron : C.olive; rr(ctx, -bw / 2, -28 * s, bw, 56 * s, 28 * s); ctx.fill();
      txt(ctx, done ? 'Ajoutée ✓' : 'Ajouter →', 0, 2 * s, F(800, 19 * s), done ? C.oliveDeep : C.ivory, 'center', 'middle');
      ctx.restore();
    }
    return { add: [bx + bw / 2, by] };
  }
  function screenPlan(ctx, u, R, s) {
    const { x, y, w, h } = R;
    const pad = 36 * s;
    txt(ctx, R.phone ? 'Ma semaine' : 'Planning de la semaine', x + pad, y + 70 * s, F(420, 52 * s, SERIF), C.charcoal);
    // bouton suggestion
    const sx = R.phone ? x + pad : x + w - pad - 300 * s, sy = R.phone ? y + 125 * s : y + 52 * s;
    const sp = u > PLAN_SUGGEST - SCREEN * 2 - 0.08 && u < PLAN_SUGGEST - SCREEN * 2 + 0.12 ? 0.94 : 1;
    ctx.save(); ctx.translate(sx + 150 * s, sy); ctx.scale(sp, sp);
    ctx.fillStyle = C.oliveSoft; rr(ctx, -150 * s, -28 * s, 300 * s, 56 * s, 28 * s); ctx.fill();
    txt(ctx, '✺ Suggestion automatique', 0, 2 * s, F(800, 18 * s), C.olive, 'center', 'middle');
    ctx.restore();
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const lab = R.phone ? 70 * s : 120 * s;
    const top = y + (R.phone ? 190 * s : 140 * s);
    const gw = (w - pad * 2 - lab) / 7;
    const gh = R.phone ? 150 * s : Math.min(130 * s, (h - 330 * s) / 4);
    days.forEach((d, i) => txt(ctx, d, x + pad + lab + i * gw + gw / 2, top + 10 * s, F(800, 18 * s), C.muted, 'center'));
    const t0 = PLAN_SUGGEST - SCREEN * 2 + 0.15;
    let n = 0;
    PLAN_ROWS.forEach(([label, ids], r) => {
      const ry = top + 30 * s + r * gh;
      txt(ctx, label, x + pad, ry + gh / 2 + 6 * s, F(700, (R.phone ? 15 : 19) * s), C.charcoal);
      ids.forEach((id, c) => {
        const cx = x + pad + lab + c * gw + gw / 2, cy = ry + gh / 2;
        const rad = Math.min(gw, gh) * 0.4;
        ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
        const k = E.back(p(u, t0 + (c + r) * 0.07, 0.35));
        if (k > 0) {
          n++;
          ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rad * k, 0, Math.PI * 2); ctx.clip();
          cover(ctx, IMGS[id], cx - rad, cy - rad, rad * 2, rad * 2, 1.1);
          ctx.restore();
        }
      });
    });
    // pied
    const fy = y + h - pad - 30 * s;
    txt(ctx, `${n} repas planifiés`, x + pad, fy + 8 * s, F(800, 24 * s), C.charcoal);
    const bw = 260 * s, bx = x + w - pad - bw;
    const done = u > PLAN_ADD - SCREEN * 2;
    const press = u > PLAN_ADD - SCREEN * 2 - 0.08 && u < PLAN_ADD - SCREEN * 2 + 0.12 ? 0.94 : 1;
    ctx.save(); ctx.translate(bx + bw / 2, fy); ctx.scale(press, press);
    ctx.globalAlpha = 0.4 + 0.6 * p(u, 1.6, 0.4);
    ctx.fillStyle = done ? C.saffron : C.olive; rr(ctx, -bw / 2, -30 * s, bw, 60 * s, 30 * s); ctx.fill();
    txt(ctx, done ? 'Au panier ✓' : 'Tout au panier →', 0, 2 * s, F(800, 20 * s), done ? C.oliveDeep : C.ivory, 'center', 'middle');
    ctx.restore();
    return { suggest: [sx + 150 * s, sy], add: [bx + bw / 2, fy] };
  }
  scene({
    id: 'site', name: 'Le site en action', dur: SCREEN * 3, note: 'À la carte, box à composer, planning de la semaine : le site en vrai.',
    draw(ctx, t, e) {
      const { W, H, s, wide } = e;
      ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
      glow(ctx, W * (wide ? 0.15 : 0.5), H * 0.15, H * 0.7, 'rgba(233,162,59,A)', 0.14);
      glow(ctx, W * 0.9, H * 0.95, H * 0.7, 'rgba(86,102,58,A)', 0.14);
      const R0 = deviceRect(e);
      const ek = E.out5(p(t, 0, 0.8));
      const R = { ...R0, y: R0.y + (1 - ek) * H * 0.6 };
      // Légende
      const idx = Math.min(2, Math.floor(t / SCREEN));
      CAPTIONS.forEach(([num, head, sub], i) => {
        const st = i * SCREEN + (i ? 0.05 : 0.3);
        const out = i < 2 ? (i + 1) * SCREEN - 0.35 : null;
        if (t < st - 0.1 || (out != null && t > out + 0.6)) return;
        const cx = wide ? 110 * s : 80 * s;
        const cy = wide ? H * 0.34 : 170 * s;
        const nk = E.out(p(t, st, 0.5)) * (out != null ? 1 - E.inOut(p(t, out, 0.35)) : 1);
        ctx.save(); ctx.globalAlpha = nk;
        txt(ctx, num, cx, cy + (1 - nk) * 30 * s, F(400, (wide ? 130 : 96) * s, SERIF, true), C.saffron);
        ctx.restore();
        const hs = (wide ? 86 : 74) * s;
        const hx = wide ? cx : cx + 150 * s;
        const hy = wide ? cy + 120 * s : cy - 4 * s;
        title(ctx, `*${head}*`, hx, hy, hs, wide ? W * 0.27 : W * 0.7, t, st + 0.08, { accent: C.olive, out });
        title(ctx, sub, wide ? cx : 80 * s, wide ? hy + hs * 0.95 : cy + 92 * s, (wide ? 36 : 34) * s, wide ? W * 0.25 : W - 160 * s, t, st + 0.25, { fam: SANS, weight: 600, color: C.muted, stagger: 0.03, lh: 1.35, out });
      });
      // Appareil
      ctx.save();
      ctx.shadowColor = 'rgba(47,58,31,.28)'; ctx.shadowBlur = 80 * s; ctx.shadowOffsetY = 40 * s;
      ctx.fillStyle = R.phone ? C.charcoal : C.white;
      rr(ctx, R.x, R.y, R.w, R.h, (R.phone ? 70 : 26) * s); ctx.fill();
      ctx.restore();
      const bar = R.phone ? 0 : 54 * s;
      const inset = R.phone ? 18 * s : 0;
      const V = { x: R.x + inset, y: R.y + inset + bar, w: R.w - inset * 2, h: R.h - inset * 2 - bar, phone: R.phone };
      if (!R.phone) {
        ['#E26D5A', '#E9B23B', '#8DB255'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(R.x + 30 * s + i * 24 * s, R.y + 27 * s, 7 * s, 0, Math.PI * 2); ctx.fill(); });
        ctx.fillStyle = C.cream; rr(ctx, R.x + R.w / 2 - 240 * s, R.y + 12 * s, 480 * s, 30 * s, 15 * s); ctx.fill();
        const paths = ['carte', 'composer-ma-box', 'planning'];
        txt(ctx, `${e.d.url}/#/${paths[idx]}`, R.x + R.w / 2, R.y + 28 * s, F(600, 16 * s), C.muted, 'center', 'middle');
        ctx.fillStyle = C.line; ctx.fillRect(R.x, R.y + bar - 1, R.w, 1.5 * s);
      }
      ctx.save();
      rr(ctx, V.x, V.y, V.w, V.h, R.phone ? 54 * s : 0); ctx.clip();
      if (!R.phone) { ctx.beginPath(); ctx.rect(V.x, V.y, V.w, V.h); ctx.clip(); }
      ctx.fillStyle = C.ivory; ctx.fillRect(V.x, V.y, V.w, V.h);
      // En-tête du site
      const hh = R.phone ? 120 * s : 76 * s;
      const hy = V.y + (R.phone ? 44 * s : 0);
      logo(ctx, V.x + 36 * s, hy + hh / 2 + 12 * s, 34 * s);
      if (!R.phone) {
        const nav = ['La carte', 'Formules', 'Planning', 'Collection de saison'];
        const act = [0, 1, 2][idx];
        let nx = V.x + 250 * s;
        ctx.font = F(600, 17 * s);
        nav.forEach((n, i) => {
          txt(ctx, n, nx, hy + hh / 2 + 6 * s, F(600, 17 * s), i === act ? C.olive : C.charcoal);
          ctx.font = F(600, 17 * s);
          const nw = ctx.measureText(n).width;
          if (i === act) { ctx.fillStyle = C.olive; ctx.fillRect(nx, hy + hh / 2 + 16 * s, nw, 2.5 * s); }
          nx += nw + 30 * s;
        });
      } else {
        txt(ctx, '9:41', V.x + 70 * s, V.y + 32 * s, F(800, 20 * s), C.charcoal, 'center', 'middle');
        ctx.fillStyle = C.charcoal; rr(ctx, V.x + V.w / 2 - 80 * s, V.y + 14 * s, 160 * s, 36 * s, 18 * s); ctx.fill();
      }
      // Panier
      const cartX = V.x + V.w - 50 * s, cartY = hy + hh / 2;
      let count = CLICKS_CARTE.filter(([, at]) => t > at + 0.55).length;
      if (t > BOX_ADD + 0.55) count += 5;
      if (t > PLAN_ADD + 0.55) count += 28;
      const bump = Math.max(...[...CLICKS_CARTE.map(([, at]) => at + 0.55), BOX_ADD + 0.55, PLAN_ADD + 0.55].map((at) => 1 - p(t, at, 0.3) + (t < at ? -1 : 0)), 0);
      ctx.save(); ctx.translate(cartX, cartY); ctx.scale(1 + 0.25 * bump, 1 + 0.25 * bump);
      ctx.strokeStyle = C.charcoal; ctx.lineWidth = 3 * s; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-14 * s, -6 * s); ctx.lineTo(14 * s, -6 * s); ctx.lineTo(11 * s, 16 * s); ctx.lineTo(-11 * s, 16 * s); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -8 * s, 7 * s, Math.PI, 0); ctx.stroke();
      if (count) {
        ctx.fillStyle = C.tomato; ctx.beginPath(); ctx.arc(14 * s, -14 * s, 14 * s, 0, Math.PI * 2); ctx.fill();
        txt(ctx, String(count), 14 * s, -13 * s, F(800, 15 * s), C.white, 'center', 'middle');
      }
      ctx.restore();
      ctx.fillStyle = C.line; ctx.fillRect(V.x, hy + hh, V.w, 1.5 * s);
      // Écrans qui glissent
      const C0 = { x: V.x, y: hy + hh, w: V.w, h: V.y + V.h - hy - hh, phone: R.phone };
      const tr = [E.inOut(p(t, SCREEN - 0.3, 0.55)), E.inOut(p(t, SCREEN * 2 - 0.3, 0.55))];
      const shift = (tr[0] + tr[1]) * C0.w;
      let pos = null, boxUI = null, planUI = null;
      ctx.save(); ctx.beginPath(); ctx.rect(C0.x, C0.y, C0.w, C0.h); ctx.clip();
      if (tr[0] < 1) { ctx.save(); ctx.translate(-shift, 0); pos = screenCarte(ctx, t, C0, s, e); ctx.restore(); }
      if (tr[0] > 0 && tr[1] < 1) { ctx.save(); ctx.translate(C0.w - shift, 0); boxUI = screenBox(ctx, t - SCREEN, C0, s); ctx.restore(); }
      if (tr[1] > 0) { ctx.save(); ctx.translate(C0.w * 2 - shift, 0); planUI = screenPlan(ctx, t - SCREEN * 2, C0, s); ctx.restore(); }
      // Plats qui volent vers le panier
      if (pos) CLICKS_CARTE.forEach(([j, at]) => {
        const k = p(t, at, 0.55);
        if (k <= 0 || k >= 1) return;
        const [px, py, cw, chh] = pos[j];
        const sx = px + cw - 34 * s, sy = py + chh - 34 * s;
        const kk = E.inOut(k);
        const fx = lerp(sx, cartX, kk), fy = lerp(sy, cartY, kk) - Math.sin(kk * Math.PI) * 160 * s;
        ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, lerp(46, 12, kk) * s, 0, Math.PI * 2); ctx.clip();
        cover(ctx, IMGS[CARTE[j]], fx - 46 * s, fy - 46 * s, 92 * s, 92 * s);
        ctx.restore();
      });
      ctx.restore();
      ctx.restore();
      // Curseur (en coordonnées écran)
      if (!R.phone || true) {
        const targets = [];
        if (pos) CLICKS_CARTE.forEach(([j, at]) => { const [px, py, cw, chh] = pos[j]; targets.push([at, px + cw - 34 * s, py + chh - 34 * s]); });
        if (boxUI) targets.push([BOX_ADD, boxUI.add[0] + (C0.w - shift), boxUI.add[1]]);
        if (planUI) { targets.push([PLAN_SUGGEST, planUI.suggest[0] + (C0.w * 2 - shift), planUI.suggest[1]]); targets.push([PLAN_ADD, planUI.add[0] + (C0.w * 2 - shift), planUI.add[1]]); }
        targets.sort((a, b) => a[0] - b[0]);
        const home = [R.x + R.w * 0.8, R.y + R.h * 0.95];
        let prev = [0.6, ...home];
        let cx = home[0], cy = home[1], press = 0;
        for (const tg of targets) {
          if (t < tg[0] + 0.35) {
            const start = Math.max(prev[0] + 0.25, tg[0] - 0.75);
            const k = E.inOut(p(t, start, tg[0] - start - 0.05));
            cx = lerp(prev[1], tg[1], k); cy = lerp(prev[2], tg[2], k);
            press = clamp(1 - Math.abs(t - tg[0]) / 0.1);
            ripple(ctx, tg[1], tg[2], p(t, tg[0], 0.45), s);
            break;
          }
          ripple(ctx, tg[1], tg[2], p(t, tg[0], 0.45), s);
          prev = [tg[0], tg[1], tg[2]];
          cx = tg[1]; cy = tg[2];
        }
        const ck = p(t, 0.6, 0.4) * (1 - p(t, SCREEN * 3 - 0.4, 0.3));
        if (ck > 0) { ctx.save(); ctx.globalAlpha = ck; cursor(ctx, cx + 4 * s, cy + 4 * s, s, press); ctx.restore(); }
      }
    },
  });

  /* 7 — Les producteurs */
  scene({
    id: 'producteurs', name: 'Producteurs locaux', dur: BAR * 2, note: 'Les fermes partenaires, toutes à moins de 50 km de Lyon.',
    draw(ctx, t, e) {
      const { W, H, s, wide } = e;
      ctx.fillStyle = C.ivory; ctx.fillRect(0, 0, W, H);
      glow(ctx, W * 0.7, H * 0.55, H * 0.8, 'rgba(229,233,210,A)', 0.9);
      const cx = wide ? W * 0.68 : W / 2, cy = wide ? H * 0.54 : H * 0.64;
      const Rmax = (wide ? 420 : 430) * s;
      const km = (d) => (parseFloat(d) / 50) * Rmax;
      // Cercles de distance
      [15, 30, 45].forEach((d, i) => {
        const k = E.inOut(p(t, 0.15 + i * 0.12, 0.8));
        if (k <= 0) return;
        ctx.save(); ctx.setLineDash([6 * s, 10 * s]); ctx.lineWidth = 2 * s; ctx.strokeStyle = 'rgba(86,102,58,.45)';
        ctx.beginPath(); ctx.arc(cx, cy, km(d), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.globalAlpha = k;
        pill(ctx, `${d} km`, cx, cy - km(d), 14 * s, C.ivory, C.olive, 'center', { stroke: 1.5 * s, strokeColor: 'rgba(86,102,58,.4)', weight: 800 });
        ctx.restore();
      });
      const angles = { p1: -2.5, p2: -0.9, p3: 2.3, p4: -0.1, p5: -1.6, p6: 1.1 };
      PRODUCERS.forEach((pr, i) => {
        const a = angles[pr.id] ?? i;
        const d = km(pr.distance);
        const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d;
        const at = 0.9 + i * BEAT / 2;
        const lk = E.inOut(p(t, at - 0.2, 0.4));
        if (lk > 0) {
          ctx.save(); ctx.strokeStyle = C.olive; ctx.lineWidth = 2.5 * s; ctx.globalAlpha = 0.6;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(lerp(cx, px, lk), lerp(cy, py, lk)); ctx.stroke(); ctx.restore();
        }
        const k = E.back(p(t, at, 0.45));
        if (k <= 0) return;
        const r = (wide ? 58 : 56) * s;
        plate(ctx, IMGS[pr.id], px, py, r * k, s, 0, C.white);
        ctx.save(); ctx.globalAlpha = clamp(k);
        const right = Math.cos(a) >= -0.2;
        const lx = right ? px + r + 14 * s : px - r - 14 * s;
        ctx.font = F(800, 21 * s);
        const nm = pr.name.replace('Champignonnière des Monts du Lyonnais', 'Champignonnière du Lyonnais');
        const nw = Math.max(ctx.measureText(nm).width, 120 * s) + 32 * s;
        const bx = right ? lx : lx - nw;
        ctx.fillStyle = C.white; rr(ctx, bx, py - 36 * s, nw, 72 * s, 16 * s); ctx.fill();
        txt(ctx, nm, bx + 16 * s, py - 6 * s, F(800, 21 * s), C.charcoal);
        txt(ctx, `${pr.type} · ${pr.distance}`, bx + 16 * s, py + 22 * s, F(600, 17 * s), C.muted);
        ctx.restore();
      });
      // Lyon
      const lk = E.back(p(t, 0.1, 0.5));
      if (lk > 0) {
        const pulse = (t * 0.8) % 1;
        ctx.save(); ctx.globalAlpha = 1 - pulse; ctx.fillStyle = 'rgba(233,162,59,.5)'; ctx.beginPath(); ctx.arc(cx, cy, 20 * s + 50 * s * pulse, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        ctx.save(); ctx.translate(cx, cy); ctx.scale(lk, lk);
        ctx.fillStyle = C.oliveDeep; ctx.beginPath(); ctx.arc(0, 0, 44 * s, 0, Math.PI * 2); ctx.fill();
        txt(ctx, 'Lyon', 0, 2 * s, F(500, 26 * s, SERIF, true), C.saffron, 'center', 'middle');
        ctx.restore();
      }
      // Titre
      const tx = wide ? 110 * s : 80 * s, ty = wide ? H * 0.3 : 230 * s;
      eyebrow(ctx, 'NOS PRODUCTEURS', tx, ty, 22 * s, C.olive, E.out(p(t, 0.05, 0.5)));
      const size = (wide ? 92 : 92) * s;
      const res = title(ctx, 'Des ingrédients venus de *moins de 50 km.*', tx, ty + size * 1.15, size, wide ? W * 0.36 : W - 160 * s, t, 0.15, { stagger: 0.07 });
      title(ctx, 'On vous dit qui cultive, élève et récolte. Fiche par fiche.', tx, ty + size * 1.15 + res.h + 10 * s, 34 * s, wide ? W * 0.32 : W - 160 * s, t, 0.9, { fam: SANS, weight: 600, color: C.muted, stagger: 0.03, lh: 1.35 });
    },
  });

  /* 8 — Livraison & retrait */
  function icon(ctx, kind, x, y, r, s) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = C.olive; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ivory; ctx.lineWidth = 3.5 * s; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const u = r / 40;
    ctx.beginPath();
    if (kind === 'bag') { ctx.moveTo(-15 * u, -6 * u); ctx.lineTo(15 * u, -6 * u); ctx.lineTo(12 * u, 17 * u); ctx.lineTo(-12 * u, 17 * u); ctx.closePath(); ctx.moveTo(-7 * u, -6 * u); ctx.arc(0, -8 * u, 7 * u, Math.PI, 0); }
    if (kind === 'pin') { ctx.arc(0, -5 * u, 12 * u, Math.PI * 0.85, Math.PI * 0.15); ctx.lineTo(0, 19 * u); ctx.closePath(); ctx.moveTo(4 * u, -5 * u); ctx.arc(0, -5 * u, 4 * u, 0, Math.PI * 2); }
    if (kind === 'free') { ctx.moveTo(-14 * u, 1 * u); ctx.lineTo(-4 * u, 11 * u); ctx.lineTo(15 * u, -10 * u); }
    ctx.stroke(); ctx.restore();
  }
  scene({
    id: 'livraison', name: 'Livraison & retrait', dur: BAR * 2, note: 'Livré chez vous ou à retirer, sans abonnement obligatoire.',
    draw(ctx, t, e) {
      const { W, H, s, wide } = e;
      ctx.fillStyle = C.sandSoft; ctx.fillRect(0, 0, W, H);
      glow(ctx, W * 0.85, H * 0.2, H * 0.7, 'rgba(233,162,59,A)', 0.2);
      const tx = wide ? 110 * s : 80 * s, ty = wide ? 230 * s : 260 * s;
      const size = (wide ? 104 : 96) * s;
      const res = title(ctx, 'Livré chez vous, *ou à retirer.*', tx, ty, size, wide ? W * 0.5 : W - 160 * s, t, 0.1, { stagger: 0.08 });
      const items = [
        ['bag', `Livraison offerte dès ${DELIVERY.freeFrom} €`, `Lyon et métropole · créneaux midi et soir`],
        ['pin', 'Retrait sur place', DELIVERY.pickupPoints.map((x) => x.id === 'gerland' ? 'Gerland' : x.id === 'partdieu' ? 'Part-Dieu' : 'Croix-Rousse').join(' · ')],
        ['free', 'Sans abonnement obligatoire', 'Le Club, seulement si vous le voulez'],
      ];
      const iy = ty + res.h + (wide ? 50 : 90) * s;
      items.forEach(([ic, a, b], i) => {
        const at = 0.9 + i * BEAT;
        const k = E.out(p(t, at, 0.5));
        if (k <= 0) return;
        const y = iy + i * (wide ? 130 : 150) * s;
        ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * -60 * s, 0);
        const ik = E.back(p(t, at, 0.45));
        ctx.save(); ctx.translate(tx + 40 * s, y); ctx.scale(ik, ik); icon(ctx, ic, 0, 0, 40 * s, s); ctx.restore();
        txt(ctx, a, tx + 110 * s, y - 4 * s, F(800, (wide ? 40 : 38) * s), C.charcoal);
        txt(ctx, b, tx + 110 * s, y + 38 * s, F(600, 26 * s), C.muted);
        ctx.restore();
      });
      // Trajet animé
      const pts = wide ? [[W * 0.62, H * 0.82], [W * 0.7, H * 0.3], [W * 0.92, H * 0.62], [W * 0.84, H * 0.22]] : [[W * 0.22, H * 0.9], [W * 0.4, H * 0.66], [W * 0.75, H * 0.98], [W * 0.82, H * 0.74]];
      const bez = (u) => {
        const [a, b, c, d] = pts;
        const m = 1 - u;
        return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]];
      };
      const rk = E.inOut(p(t, 0.5, 2.3));
      ctx.save();
      ctx.setLineDash([2 * s, 18 * s]); ctx.lineCap = 'round'; ctx.lineWidth = 9 * s; ctx.strokeStyle = 'rgba(86,102,58,.55)';
      ctx.beginPath();
      for (let i = 0; i <= 80 * rk; i++) { const [x, y] = bez(i / 80); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke(); ctx.restore();
      // Point de départ (l'atelier) et maison
      const [ax, ay] = pts[0];
      const sk = E.back(p(t, 0.4, 0.4));
      if (sk > 0) { ctx.save(); ctx.translate(ax, ay); ctx.scale(sk, sk); pill(ctx, 'L’Atelier · Gerland', 0, 0, 20 * s, C.oliveDeep, C.saffron, 'center', { weight: 800 }); ctx.restore(); }
      const [hx, hy] = pts[3];
      const hk = E.back(p(t, 2.75, 0.45));
      if (hk > 0) {
        ctx.save(); ctx.translate(hx, hy); ctx.scale(hk, hk);
        ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(0, 0, 62 * s, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.olive; ctx.lineWidth = 5 * s; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-26 * s, -2 * s); ctx.lineTo(0, -26 * s); ctx.lineTo(26 * s, -2 * s); ctx.moveTo(-18 * s, -8 * s); ctx.lineTo(-18 * s, 22 * s); ctx.lineTo(18 * s, 22 * s); ctx.lineTo(18 * s, -8 * s); ctx.stroke();
        ctx.restore();
        ctx.save(); ctx.globalAlpha = p(t, 2.95, 0.3);
        pill(ctx, 'Livré ✓', hx, hy + 100 * s, 22 * s, C.saffron, C.oliveDeep, 'center', { weight: 800 });
        ctx.restore();
      }
      if (rk > 0 && rk < 1) {
        const [bx, by] = bez(rk);
        ctx.save(); ctx.translate(bx, by + Math.sin(t * 14) * 3 * s);
        icon(ctx, 'bag', 0, 0, 46 * s, s);
        ctx.restore();
      }
    },
  });

  /* 9 — Fin */
  scene({
    id: 'fin', name: 'Signature', dur: BAR * 2, note: 'Logo, signature, offre de bienvenue et adresse du site.',
    draw(ctx, t, e) {
      const { W, H, s, wide } = e;
      ctx.fillStyle = C.oliveDeep; ctx.fillRect(0, 0, W, H);
      glow(ctx, W * 0.5, H * 0.42, H * 0.8, 'rgba(233,162,59,A)', 0.2);
      glow(ctx, W * 0.05, H * 0.95, H * 0.6, 'rgba(110,127,69,A)', 0.45);
      // Plats en orbite
      const n = 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + t * 0.12;
        const rx = W * (wide ? 0.44 : 0.46), ry = H * (wide ? 0.42 : 0.44);
        const k = E.back(p(t, 0.1 + i * 0.05, 0.6));
        if (k <= 0) continue;
        const ids = ['salmon-quinoa', 'overnight-oats', 'lasagna', 'mediterranean-bowl', 'chocolate-mousse', 'veggie-curry', 'egg-avocado-box', 'seasonal-bowl'];
        plate(ctx, IMGS[ids[i]], W / 2 + Math.cos(a) * rx, H * 0.5 + Math.sin(a) * ry, (wide ? 80 : 74) * s * k, s, a, C.oliveDark);
      }
      const ly = H * (wide ? 0.42 : 0.42);
      const size = (wide ? 200 : 160) * s;
      logo(ctx, W / 2, ly, size, C.ivory, C.saffron, 'center', p(t, 0.05, 0.9));
      title(ctx, e.d.tagline, W / 2, ly + size * 0.62, (wide ? 70 : 60) * s, W * 0.86, t, 0.6, { align: 'center', fam: SERIF, weight: 400, color: C.sand, stagger: 0.1 });
      const ok = E.back(p(t, 1.4, 0.5));
      const oy = ly + size * 0.62 + (wide ? 120 : 140) * s;
      if (ok > 0 && e.d.offer) {
        ctx.save(); ctx.translate(W / 2, oy); ctx.scale(ok, ok);
        const lines = wide ? [e.d.offer] : String(e.d.offer).split(' · ');
        lines.forEach((l, i) => pill(ctx, l, 0, i * 96 * s, 36 * s, i ? C.ivory : C.saffron, C.oliveDeep, 'center', { weight: 800 }));
        ctx.restore();
      }
      const uk = E.out(p(t, 2.0, 0.5));
      if (uk > 0) {
        ctx.save(); ctx.globalAlpha = uk;
        const uy = oy + (wide ? 110 : 200) * s + (1 - uk) * 20 * s;
        txt(ctx, `Commandez sur ${e.d.url}`, W / 2, uy, F(700, 36 * s), C.ivory, 'center', 'middle');
        txt(ctx, 'Lyon & métropole · Livraison et retrait sur place', W / 2, uy + 54 * s, F(600, 24 * s), C.sand, 'center', 'middle');
        ctx.restore();
      }
    },
  });

  const DUR = S[S.length - 1].start + S[S.length - 1].dur;

  /* ---------- Image du temps t ---------- */
  function frame(ctx, t, W, H, d) {
    const s = Math.min(W, H) / 1080;
    const e = { W, H, s, wide: W > H, d };
    const i = S.findIndex((x) => t >= x.start && t < x.start + x.dur);
    const sc = S[i < 0 ? S.length - 1 : i];
    ctx.save();
    sc.draw(ctx, t - sc.start, e);
    ctx.restore();
    // Transitions en rideau
    curtain(ctx, W, H, t, S[4].start, C.oliveDark);
    curtain(ctx, W, H, t, S[6].start, C.olive);
    curtain(ctx, W, H, t, S[7].start, C.saffron);
    curtain(ctx, W, H, t, S[8].start, C.oliveDeep);
    grain(ctx, W, H, t, 0.07);
  }

  /* =======================================================================
     BANDE-SON (synthétisée, 100 BPM)
     ======================================================================= */
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function Synth(ac, out) {
    const master = ac.createGain(); master.gain.value = 0.85;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.005; comp.release.value = 0.2;
    master.connect(comp); comp.connect(out);
    const rev = ac.createConvolver();
    const len = ac.sampleRate * 2.4;
    const ib = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const dd = ib.getChannelData(ch); for (let i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    rev.buffer = ib;
    const revOut = ac.createGain(); revOut.gain.value = 0.32;
    rev.connect(revOut); revOut.connect(master);
    const nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const noise = (when, dur) => { const src = ac.createBufferSource(); src.buffer = nb; src.loop = true; src.start(when); src.stop(when + dur + 0.05); return src; };
    const env = (g, when, a, peak, hold, rel) => {
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(peak, when + a);
      g.gain.setValueAtTime(peak, when + a + hold);
      g.gain.exponentialRampToValueAtTime(0.0001, when + a + hold + rel);
    };
    const send = (node, wet = 0.5) => { node.connect(master); if (wet) { const g = ac.createGain(); g.gain.value = wet; node.connect(g); g.connect(rev); } };
    return {
      master,
      pad(when, notes, dur, bright = 1400, vol = 0.045) {
        const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = bright; f.Q.value = 0.4;
        const g = ac.createGain(); env(g, when, 0.5, vol, Math.max(0.05, dur - 0.5), 0.9);
        f.connect(g); send(g, 0.8);
        notes.forEach((m) => [-7, 7].forEach((det) => {
          const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det;
          o.connect(f); o.start(when); o.stop(when + dur + 1.2);
        }));
      },
      pluck(when, m, vol = 0.07) {
        const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m);
        const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = mtof(m + 12);
        const g = ac.createGain(); env(g, when, 0.004, vol, 0, 0.45);
        const g2 = ac.createGain(); g2.gain.value = 0.35;
        o.connect(g); o2.connect(g2); g2.connect(g); send(g, 0.6);
        o.start(when); o2.start(when); o.stop(when + 0.6); o2.stop(when + 0.6);
      },
      bass(when, m, dur, vol = 0.22) {
        const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m);
        const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = mtof(m);
        const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
        const g = ac.createGain(); env(g, when, 0.01, vol, dur * 0.6, dur * 0.4);
        o.connect(f); o2.connect(f); f.connect(g); send(g, 0);
        o.start(when); o2.start(when); o.stop(when + dur + 0.1); o2.stop(when + dur + 0.1);
      },
      kick(when, vol = 0.9) {
        const o = ac.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(150, when); o.frequency.exponentialRampToValueAtTime(42, when + 0.13);
        const g = ac.createGain(); env(g, when, 0.002, vol, 0.02, 0.32);
        o.connect(g); send(g, 0); o.start(when); o.stop(when + 0.45);
      },
      clap(when, vol = 0.22) {
        const src = noise(when, 0.3);
        const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 0.9;
        const g = ac.createGain(); env(g, when, 0.002, vol, 0.01, 0.17);
        src.connect(f); f.connect(g); send(g, 0.5);
      },
      hat(when, vol = 0.05, open = false) {
        const src = noise(when, 0.3);
        const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500;
        const g = ac.createGain(); env(g, when, 0.001, vol, 0, open ? 0.22 : 0.05);
        src.connect(f); f.connect(g); send(g, 0.15);
      },
      tick(when, vol = 0.12) {
        const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = 1900;
        const g = ac.createGain(); env(g, when, 0.001, vol, 0, 0.04);
        o.connect(g); send(g, 0.3); o.start(when); o.stop(when + 0.08);
      },
      pop(when, f0 = 700, vol = 0.18) {
        const o = ac.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(f0, when); o.frequency.exponentialRampToValueAtTime(f0 * 1.9, when + 0.07);
        const g = ac.createGain(); env(g, when, 0.002, vol, 0.01, 0.1);
        o.connect(g); send(g, 0.3); o.start(when); o.stop(when + 0.16);
      },
      whoosh(when, dur = 0.6, vol = 0.12, from = 300, to = 5000) {
        const src = noise(when, dur);
        const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
        f.frequency.setValueAtTime(from, when); f.frequency.exponentialRampToValueAtTime(to, when + dur);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + dur * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        src.connect(f); f.connect(g); send(g, 0.6);
      },
      slam(when) {
        this.kick(when, 1);
        const o = ac.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(90, when); o.frequency.exponentialRampToValueAtTime(38, when + 0.5);
        const g = ac.createGain(); env(g, when, 0.003, 0.5, 0.05, 0.6);
        o.connect(g); send(g, 0.4); o.start(when); o.stop(when + 0.8);
        this.clap(when, 0.12);
      },
      crash(when, vol = 0.1) {
        const src = noise(when, 2.2);
        const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 4500;
        const g = ac.createGain(); env(g, when, 0.002, vol, 0, 2);
        src.connect(f); f.connect(g); send(g, 0.6);
      },
    };
  }
  /* Partition : liste d'événements [temps, durée, fn(synth, quand, durée restante)] */
  function score() {
    const ev = [];
    const at = (t, fn, dur = 0) => ev.push({ t, dur, fn });
    const CH = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [55, 60, 62, 65]]; // Fmaj7, Am7, Dm7, G7sus4
    const ROOT = [41, 45, 38, 43];
    // Accroche : nappe douce + tic-tac
    at(0, (y, w, d) => y.pad(w, CH[0], d, 900, 0.04), BAR);
    at(BAR, (y, w, d) => y.pad(w, [52, 55, 59, 62], d, 900, 0.04), BAR);
    for (let b = 0; b < 8; b++) at(b * BEAT, (y, w) => y.tick(w, b % 4 ? 0.07 : 0.11));
    for (let i = 0; i < 3; i++) at(S[0].start + 2.6 + i * BEAT / 2, (y, w) => y.pop(w, 520 + i * 160, 0.12));
    // Problème : nappe sombre + impacts
    const P0 = S[1].start;
    at(P0, (y, w, d) => y.pad(w, [50, 53, 57], d, 500, 0.05), BAR);
    at(P0 + BAR, (y, w, d) => y.pad(w, [46, 50, 53], d, 450, 0.05), BAR);
    at(P0, (y, w) => y.bass(w, 38, BAR, 0.16));
    at(P0 + BAR, (y, w) => y.bass(w, 34, BAR, 0.16));
    for (let i = 0; i < 3; i++) at(P0 + i * BEAT, (y, w) => y.slam(w));
    for (let i = 0; i < 3; i++) at(P0 + 1.9 + i * 0.2, (y, w) => y.whoosh(w, 0.25, 0.06, 2000, 600));
    at(P0 + 2.9, (y, w) => y.pop(w, 300, 0.15));
    at(S[2].start - 1.6, (y, w) => y.whoosh(w, 1.6, 0.16, 200, 6000));
    // Groove à partir de la marque
    const G0 = S[2].start;
    const END = S[8].start;
    const BREAK = [S[4].start, S[5].start]; // respiration sur « à votre façon »
    at(G0, (y, w) => y.crash(w, 0.1));
    for (let bar = 0; G0 + bar * BAR < END; bar++) {
      const b0 = G0 + bar * BAR;
      const c = bar % 4;
      const inBreak = b0 >= BREAK[0] - 0.01 && b0 < BREAK[1] - 0.01;
      at(b0, (y, w, d) => y.pad(w, CH[c], d, inBreak ? 900 : 1700, 0.04), BAR);
      for (let q = 0; q < 8; q++) {
        const tq = b0 + q * BEAT / 2;
        if (!inBreak) {
          if (q === 0 || q === 4 || q === 3 && bar % 2) at(tq, (y, w) => y.kick(w, 0.85));
          if (q === 2 || q === 6) at(tq, (y, w) => y.clap(w));
          at(tq, (y, w) => y.hat(w, q % 2 ? 0.05 : 0.03, q === 7 && bar % 2 === 1));
          if ([0, 3, 4, 6].includes(q)) at(tq, (y, w) => y.bass(w, ROOT[c] + (q === 6 ? 12 : 0), BEAT * 0.45));
        } else if (q % 2) at(tq, (y, w) => y.hat(w, 0.03));
        if (bar >= 2) {
          const arp = [CH[c][0] + 12, CH[c][1] + 12, CH[c][2] + 12, CH[c][3] + 12, CH[c][2] + 12, CH[c][1] + 12, CH[c][3] + 12, CH[c][2] + 12];
          if (!inBreak || q % 2 === 0) at(tq, (y, w) => y.pluck(w, arp[q], 0.05));
        }
      }
    }
    // Transitions
    [S[4].start, S[6].start, S[7].start, S[8].start].forEach((b) => at(b - 0.45, (y, w) => y.whoosh(w, 0.5, 0.1)));
    at(S[5].start, (y, w) => y.crash(w, 0.07));
    // Sons d'interface
    const st = S[5].start;
    CLICKS_CARTE.forEach(([, c]) => { at(st + c, (y, w) => y.pop(w, 820)); at(st + c + 0.55, (y, w) => y.pop(w, 1250, 0.1)); });
    BOX_FILL.forEach((c, i) => at(st + c, (y, w) => y.pop(w, 600 + i * 90, 0.12)));
    at(st + BOX_ADD, (y, w) => y.pop(w, 900));
    at(st + PLAN_SUGGEST, (y, w) => y.pop(w, 900));
    for (let i = 0; i < 10; i++) at(st + PLAN_SUGGEST + 0.2 + i * 0.07, (y, w) => y.tick(w, 0.05));
    at(st + PLAN_ADD, (y, w) => y.pop(w, 900));
    PRODUCERS.forEach((_, i) => at(S[6].start + 0.9 + i * BEAT / 2, (y, w) => y.pop(w, 500 + i * 70, 0.1)));
    [0, 1, 2].forEach((i) => at(S[7].start + 0.9 + i * BEAT, (y, w) => y.pop(w, 700, 0.1)));
    at(S[7].start + 2.75, (y, w) => y.pop(w, 1000, 0.14));
    // Final : accord résolu
    at(END, (y, w) => { y.kick(w, 1); y.crash(w, 0.12); y.bass(w, 36, BAR * 1.5, 0.2); });
    at(END, (y, w, d) => y.pad(w, [48, 52, 55, 59, 62], d, 1600, 0.05), BAR * 2 - 0.9);
    [60, 64, 67, 71, 74, 79].forEach((m, i) => at(END + i * BEAT / 2, (y, w) => y.pluck(w, m, 0.06)));
    return ev;
  }
  const SCORE = score();
  function playScore(ac, out, from) {
    const y = Synth(ac, out);
    const base = ac.currentTime + 0.1 - from;
    SCORE.forEach((e) => {
      if (e.t >= from - 0.005) e.fn(y, base + e.t, e.dur);
      else if (e.dur && e.t + e.dur > from + 0.3) e.fn(y, base + from, e.t + e.dur - from);
    });
    return { y, base };
  }

  /* =======================================================================
     LECTEUR
     ======================================================================= */
  let AC = null;
  const audioCtx = () => { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); return AC; };

  function Player(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    const st = { t: opts.t ?? 2.6, playing: false, raf: 0, sound: true, d: defaults(), session: null, onTime: opts.onTime || (() => {}), onState: opts.onState || (() => {}) };
    const draw = () => frame(ctx, st.t, canvas.width, canvas.height, st.d);
    function stopAudio() {
      if (!st.session) return;
      const { y, ac } = st.session;
      try { y.master.gain.cancelScheduledValues(ac.currentTime); y.master.gain.setTargetAtTime(0, ac.currentTime, 0.03); } catch (e) { /* */ }
      setTimeout(() => { try { y.master.disconnect(); } catch (e) { /* */ } }, 400);
      st.session = null;
    }
    function play() {
      if (st.playing) return;
      if (st.t >= DUR - 0.05) st.t = 0;
      const ac = audioCtx();
      ac.resume();
      const vol = ac.createGain(); vol.gain.value = st.sound ? 1 : 0; vol.connect(ac.destination);
      const { y, base } = playScore(ac, vol, st.t);
      st.session = { y, base, ac, vol };
      st.playing = true; st.onState(true);
      let last = performance.now();
      const tick = (now) => {
        if (!st.playing) return;
        // Horloge du son ; si le navigateur bloque l'audio, horloge de l'écran
        if (ac.state === 'running') st.t = Math.max(0, ac.currentTime - base);
        else st.t += (now - last) / 1000;
        last = now;
        if (st.t >= DUR) { st.t = DUR; draw(); pause(); st.onTime(st.t); return; }
        draw(); st.onTime(st.t);
        st.raf = requestAnimationFrame(tick);
      };
      st.raf = requestAnimationFrame(tick);
    }
    function pause() {
      st.playing = false; cancelAnimationFrame(st.raf); stopAudio(); st.onState(false);
    }
    return {
      st, draw, play, pause,
      toggle() { if (st.playing) pause(); else play(); },
      seek(t) { const was = st.playing; if (was) pause(); st.t = clamp(t, 0, DUR); draw(); st.onTime(st.t); if (was) play(); },
      setData(d) { Object.assign(st.d, d); if (!st.playing) draw(); },
      setSound(on) { st.sound = on; if (st.session) st.session.vol.gain.setTargetAtTime(on ? 1 : 0, st.session.ac.currentTime, 0.02); },
      resize(w, h) { canvas.width = w; canvas.height = h; draw(); },
    };
  }

  /* ---------- Exports ---------- */
  function save(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 8000);
  }
  async function exportImage(fmt, d, t, name) {
    const f = FORMATS[fmt];
    await fontsReady(); await preload();
    const cv = document.createElement('canvas'); cv.width = f.w; cv.height = f.h;
    frame(cv.getContext('2d'), t, f.w, f.h, Object.assign(defaults(), d));
    return new Promise((res) => cv.toBlob((b) => { if (!b) return res(false); save(b, `${name}.png`); res(true); }, 'image/png'));
  }
  const videoMime = () => {
    if (!window.MediaRecorder) return null;
    return ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || null;
  };
  let exporting = false;
  async function exportVideo(fmt, d, name, onProgress, withSound = true) {
    if (exporting) return { ok: false, reason: 'busy' };
    const f = FORMATS[fmt];
    const mime = videoMime();
    if (!mime || !HTMLCanvasElement.prototype.captureStream) return { ok: false, reason: 'unsupported' };
    exporting = true;
    try {
      await fontsReady(); await preload();
      const cv = document.createElement('canvas'); cv.width = f.w; cv.height = f.h;
      const ctx = cv.getContext('2d');
      const data = Object.assign(defaults(), d);
      frame(ctx, 0, f.w, f.h, data);
      const ac = audioCtx(); await ac.resume();
      const dest = ac.createMediaStreamDestination();
      const vstream = cv.captureStream(30);
      const tracks = [...vstream.getVideoTracks()];
      if (withSound) tracks.push(...dest.stream.getAudioTracks());
      const stream = new MediaStream(tracks);
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: fmt === 'wide' ? 14_000_000 : 12_000_000, audioBitsPerSecond: 192_000 });
      const chunks = [];
      rec.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunks.push(ev.data); };
      const done = new Promise((res) => { rec.onstop = res; });
      rec.start(500);
      const { y, base } = playScore(ac, dest, 0);
      await new Promise((res) => {
        const tick = () => {
          const t = ac.currentTime - base;
          frame(ctx, clamp(t, 0, DUR), f.w, f.h, data);
          if (onProgress) onProgress(clamp(t / DUR));
          if (t >= DUR + 0.25) { res(); return; }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      rec.stop();
      await done;
      try { y.master.disconnect(); } catch (e) { /* */ }
      stream.getTracks().forEach((tr) => tr.stop());
      const ext = mime.includes('mp4') ? 'mp4' : 'webm';
      save(new Blob(chunks, { type: mime.split(';')[0] }), `${name}.${ext}`);
      return { ok: true, ext };
    } finally { exporting = false; }
  }

  return { S, DUR, BEAT, FORMATS, FIELDS, defaults, preload, fontsReady, Player, exportImage, exportVideo, videoMime, frame };
})();
