/* =========================================================================
   PREP CLUB — Moteur de créas (motion design + visuels natifs)
   Chaque modèle dessine une image du temps t sur un canvas :
   aperçu animé dans la page, export vidéo (MediaRecorder) ou PNG.
   Styles inspirés des formats natifs des réseaux : texte « TikTok » sur
   fond blanc, jump cuts, stickers, posts texte, notes, listes.
   ========================================================================= */
'use strict';

const MO = (() => {
  const SIZES = {
    story: { w: 1080, h: 1920, label: 'Reel / Story / TikTok', ratio: '9 / 16' },
    post: { w: 1080, h: 1350, label: 'Post 4:5', ratio: '4 / 5' },
    square: { w: 1080, h: 1080, label: 'Carré 1:1', ratio: '1 / 1' },
  };
  const C = { cream: '#F4EEE2', ivory: '#FBF8F1', olive: '#5C6B3C', oliveDark: '#45512C', sand: '#E4D6BA', taupe: '#8A7B6A', charcoal: '#2A2925', white: '#FFFFFF' };
  const SANS = 'Inter, "Helvetica Neue", Arial, sans-serif';
  const SERIF = 'Fraunces, Georgia, serif';
  const font = (w, size, fam = SANS, italic = false) => `${italic ? 'italic ' : ''}${w} ${Math.round(size)}px ${fam}`;

  /* ---------- Outils d'animation ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const p = (t, start, dur) => clamp((t - start) / dur);
  const E = {
    out: (x) => 1 - Math.pow(1 - x, 3),
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };

  /* ---------- Images et vidéos ---------- */
  const cache = new Map();
  function load(src) {
    if (!src) return Promise.resolve(null);
    if (typeof src === 'object') return Promise.resolve(src.el || null); // import de l'utilisateur
    if (cache.has(src)) return cache.get(src);
    const pr = new Promise((res) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = /^(blob:|data:|https?:)/.test(src) ? src : imgUrlMk(src, 1400);
    });
    cache.set(src, pr);
    return pr;
  }
  const loadAll = (list) => Promise.all((list || []).map(load));

  /* ---------- Dessin ---------- */
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function cover(ctx, el, x, y, w, h, zoom = 1, fx = 0.5, fy = 0.5, filter = '') {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (!el) {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, '#9C8C78'); g.addColorStop(1, '#5E5446');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    } else {
      const iw = el.videoWidth || el.naturalWidth || el.width;
      const ih = el.videoHeight || el.naturalHeight || el.height;
      if (iw && ih) {
        const r = Math.max(w / iw, h / ih) * zoom;
        const dw = iw * r, dh = ih * r;
        if (filter) ctx.filter = filter;
        ctx.drawImage(el, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
        ctx.filter = 'none';
      }
    }
    ctx.restore();
  }
  function shade(ctx, W, H, from = 0.45, strength = 0.75) {
    const g = ctx.createLinearGradient(0, H * from, 0, H);
    g.addColorStop(0, 'rgba(20,20,16,0)');
    g.addColorStop(1, `rgba(20,20,16,${strength})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function wrap(ctx, text, maxW) {
    const out = [];
    String(text || '').split('\n').forEach((para) => {
      const words = para.split(' ');
      let line = '';
      words.forEach((w) => {
        const t = line ? `${line} ${w}` : w;
        if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out;
  }
  /* Texte façon TikTok / Reels : chaque ligne sur un fond arrondi */
  function boxes(ctx, text, cx, y, size, maxW, o = {}) {
    ctx.font = font(o.weight || 800, size);
    const lines = wrap(ctx, text, maxW - size * 0.9);
    const lh = size * 1.32;
    const padX = size * 0.42;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => {
      const w = ctx.measureText(l).width + padX * 2;
      const ly = y + i * lh;
      ctx.fillStyle = o.bg || C.white;
      rr(ctx, cx - w / 2, ly - lh / 2, w, lh + 1, size * 0.28);
      ctx.fill();
    });
    ctx.fillStyle = o.fg || '#111';
    lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lh + size * 0.04));
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    return lines.length * lh;
  }
  /* Texte blanc à contour, style légende native */
  function stroked(ctx, text, x, y, size, maxW, align = 'center', weight = 900) {
    ctx.font = font(weight, size);
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    const lines = wrap(ctx, text, maxW);
    lines.forEach((l, i) => {
      const ly = y + i * size * 1.12;
      ctx.lineWidth = size * 0.16; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(l, x, ly);
      ctx.fillStyle = C.white; ctx.fillText(l, x, ly);
    });
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    return lines.length * size * 1.12;
  }
  function pill(ctx, text, x, y, size, bg, fg, align = 'left') {
    ctx.font = font(800, size);
    const w = ctx.measureText(text).width + size * 1.4;
    const h = size * 2;
    const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = bg; rr(ctx, left, y - h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.fillText(text, left + size * 0.7, y + size * 0.05);
    ctx.textBaseline = 'alphabetic';
    return w;
  }
  function logo(ctx, x, y, size, fg = C.white, ac = C.sand, align = 'left') {
    ctx.font = font(600, size, SERIF);
    const a = ctx.measureText('PREP ').width;
    ctx.font = font(500, size, SERIF, true);
    const b = ctx.measureText('CLUB').width;
    const left = align === 'center' ? x - (a + b) / 2 : x;
    ctx.textBaseline = 'middle';
    ctx.font = font(600, size, SERIF); ctx.fillStyle = fg; ctx.fillText('PREP', left, y);
    ctx.font = font(500, size, SERIF, true); ctx.fillStyle = ac; ctx.fillText('CLUB', left + a, y);
    ctx.textBaseline = 'alphabetic';
  }
  function pop(ctx, cx, cy, k, fn, alpha = 1) {
    if (k <= 0 || alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = clamp(alpha) * clamp(k * 3);
    ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
    fn();
    ctx.restore();
  }
  function endCard(ctx, W, H, k, line1, line2) {
    if (k <= 0) return;
    const s = W / 1080;
    ctx.save();
    ctx.globalAlpha = E.out(k);
    ctx.fillStyle = C.olive; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, H * 0.7);
    g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.18)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const up = (1 - E.out(p(k, 0, 1))) * 40 * s;
    logo(ctx, W / 2, H * 0.4 + up, 92 * s, C.ivory, C.sand, 'center');
    ctx.font = font(500, 54 * s, SERIF, true); ctx.fillStyle = C.sand; ctx.textAlign = 'center';
    ctx.fillText(line1 || 'Your week, prepared.', W / 2, H * 0.4 + 110 * s + up);
    ctx.textAlign = 'left';
    if (line2) pill(ctx, line2, W / 2, H * 0.4 + 230 * s + up, 34 * s, C.ivory, C.charcoal, 'center');
    ctx.restore();
  }
  const cornerLogo = (ctx, W, H, s, dark) => logo(ctx, 64 * s, 96 * s, 40 * s, dark ? C.charcoal : C.white, dark ? C.olive : C.sand);

  /* =======================================================================
     MODÈLES
     ======================================================================= */
  const P = (id) => (PRODUCTS.find((x) => x.id === id) || {}).img;
  const T = [];

  /* ---------- Vidéos ---------- */
  T.push({
    id: 'pov', kind: 'video', dur: 7, name: 'POV', use: 'Le format star de TikTok et des Reels : une phrase « POV » sur ta vidéo ou ta photo.', tags: ['video'],
    fields: [['text1', 'Phrase 1 (accroche)', 'POV : tes repas de la semaine sont déjà dans le frigo'], ['text2', 'Phrase 2', 'Commandés en 5 minutes sur PREP CLUB 🥗']],
    photos: [IMG.spread],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      cover(ctx, A[0], 0, 0, W, H, 1.02 + 0.1 * (t / this.dur));
      shade(ctx, W, H, 0.55, 0.45);
      const y = H * (H > 1500 ? 0.3 : 0.26);
      if (t < 3.9) pop(ctx, W / 2, y, E.back(p(t, 0.25, 0.35)), () => boxes(ctx, d.text1, W / 2, y, 50 * s, W * 0.82), 1 - p(t, 3.7, 0.2));
      if (t >= 3.8) pop(ctx, W / 2, y, E.back(p(t, 3.85, 0.35)), () => boxes(ctx, d.text2, W / 2, y, 50 * s, W * 0.82));
      const k = p(t, 5.4, 0.4);
      if (k) { ctx.save(); ctx.globalAlpha = k; pill(ctx, 'PREP CLUB · Lyon', 64 * s, H * (H > 1500 ? 0.74 : 0.86), 30 * s, C.olive, C.ivory); ctx.restore(); }
    },
  });

  T.push({
    id: 'semaine', kind: 'video', dur: 8.4, name: 'Ma semaine en 7 jours', use: 'Jump cuts rapides : un jour, un plat. Parfait pour montrer la carte en 8 secondes.', tags: ['video'],
    fields: [['plats', 'Les 7 plats (un par ligne)', 'Porridge aux fruits rouges\nPoulet, riz & légumes rôtis\nBol saumon & quinoa\nLasagnes maison\nCurry de légumes\nBol de courge d’automne\nMousse au chocolat'], ['fin', 'Phrase de fin', 'Ta semaine, prête.']],
    photos: [P('overnight-oats'), P('chicken-rice-veg'), P('salmon-quinoa'), P('lasagna'), P('veggie-curry'), P('seasonal-bowl'), P('chocolate-mousse')],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      const days = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
      const plats = String(d.plats || '').split('\n');
      const step = 0.9;
      if (t < 7 * step) {
        const i = Math.min(6, Math.floor(t / step));
        const lt = t - i * step;
        cover(ctx, A[i] || A[0], 0, 0, W, H, 1.14 - 0.08 * (lt / step));
        shade(ctx, W, H, 0.3, 0.55);
        const fl = 1 - p(lt, 0, 0.1);
        if (fl > 0 && i > 0) { ctx.fillStyle = `rgba(255,255,255,${0.35 * fl})`; ctx.fillRect(0, 0, W, H); }
        const x = 70 * s - (1 - E.out(p(lt, 0, 0.18))) * 90 * s;
        ctx.font = font(900, 150 * s); ctx.fillStyle = C.white; ctx.textBaseline = 'middle';
        ctx.fillText(days[i], x, H * 0.42);
        ctx.textBaseline = 'alphabetic';
        if (plats[i]) boxes(ctx, plats[i], W / 2, H * 0.42 + 150 * s, 40 * s, W * 0.86);
        ctx.font = font(700, 30 * s); ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.fillText(`${i + 1}/7`, W - 120 * s, 100 * s);
        cornerLogo(ctx, W, H, s);
      } else {
        cover(ctx, A[6] || A[0], 0, 0, W, H, 1.06);
        endCard(ctx, W, H, p(t, 7 * step, 0.35), d.fin, 'Lien en bio');
      }
    },
  });

  T.push({
    id: 'raisons', kind: 'video', dur: 10.5, name: '3 raisons', use: 'Liste animée : une accroche, trois arguments, un appel à l’action. Très partagée.', tags: ['video', 'pub'],
    fields: [['hook', 'Accroche', '3 raisons d’arrêter de cuisiner tous les soirs'], ['r1', 'Raison 1', 'Tu gagnes 5 h par semaine'], ['r2', 'Raison 2', 'Tu sais exactement ce que tu manges'], ['r3', 'Raison 3', 'Zéro abonnement obligatoire'], ['cta', 'Fin', 'Lien en bio']],
    photos: [IMG.spread, P('chicken-rice-veg'), IMG.saladBowl, P('salmon-quinoa')],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      if (t < 2) {
        cover(ctx, A[0], 0, 0, W, H, 1.05 + 0.04 * t, 0.5, 0.5, 'brightness(.55)');
        const words = String(d.hook).split(' ');
        const shown = words.filter((_, i) => t > 0.15 + i * 0.11).join(' ');
        stroked(ctx, shown, W / 2, H * 0.36, 92 * s, W * 0.84);
        cornerLogo(ctx, W, H, s);
        return;
      }
      if (t < 9.2) {
        const i = Math.min(2, Math.floor((t - 2) / 2.4));
        const lt = t - 2 - i * 2.4;
        cover(ctx, A[i + 1] || A[0], 0, 0, W, H, 1.12 - 0.07 * (lt / 2.4));
        shade(ctx, W, H, 0.2, 0.7);
        const k = E.back(p(lt, 0, 0.35));
        pop(ctx, W / 2, H * 0.3, k, () => {
          ctx.font = font(900, 300 * s); ctx.fillStyle = C.sand; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(i + 1), W / 2, H * 0.3);
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        });
        const up = (1 - E.out(p(lt, 0.25, 0.35))) * 60 * s;
        ctx.save(); ctx.globalAlpha = p(lt, 0.25, 0.25);
        boxes(ctx, d[`r${i + 1}`], W / 2, H * 0.3 + 230 * s + up, 52 * s, W * 0.84);
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        [0, 1, 2].forEach((j) => { ctx.fillStyle = j <= i ? C.white : 'rgba(255,255,255,.35)'; rr(ctx, W / 2 - 90 * s + j * 64 * s, 70 * s, 52 * s, 8 * s, 4 * s); ctx.fill(); });
        return;
      }
      cover(ctx, A[3] || A[0], 0, 0, W, H, 1.05);
      endCard(ctx, W, H, p(t, 9.2, 0.35), 'Your week, prepared.', d.cta);
    },
  });

  T.push({
    id: 'produit', kind: 'video', dur: 6.5, name: 'Plat en vedette', use: 'Zoom sur un plat, badge, prix qui apparaît : idéal pour un nouveau plat ou une pub produit.', tags: ['video', 'pub'],
    fields: [['badge', 'Badge', 'NOUVEAU'], ['name', 'Nom du plat', 'Bol de courge d’automne'], ['price', 'Prix (sticker)', '10,20 €'], ['details', 'Détails', '380 g · prêt en 2 min · végétarien'], ['cta', 'Bouton', 'Commander →']],
    photos: [P('seasonal-bowl')],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      cover(ctx, A[0], 0, 0, W, H, 1 + 0.16 * E.inOut(clamp(t / this.dur)));
      shade(ctx, W, H, 0.35, 0.82);
      cornerLogo(ctx, W, H, s);
      const bx = -300 * s + E.out(p(t, 0.4, 0.4)) * (300 * s + 64 * s);
      if (d.badge) pill(ctx, d.badge, bx, H * (H > 1500 ? 0.56 : 0.5), 30 * s, C.sand, C.charcoal);
      const n = String(d.name);
      const shown = n.slice(0, Math.round(n.length * p(t, 0.8, 1)));
      ctx.font = font(500, 94 * s, SERIF); ctx.fillStyle = C.white;
      const lines = wrap(ctx, shown, W * 0.84);
      const ny = H * (H > 1500 ? 0.63 : 0.6);
      lines.forEach((l, i) => ctx.fillText(l, 64 * s, ny + i * 100 * s));
      const dy = ny + lines.length * 100 * s + 10 * s;
      ctx.save(); ctx.globalAlpha = p(t, 3, 0.4);
      ctx.font = font(600, 38 * s); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillText(d.details || '', 64 * s, dy);
      ctx.restore();
      if (d.price) {
        const px = W - 210 * s, py = H * (H > 1500 ? 0.36 : 0.3);
        pop(ctx, px, py, E.back(p(t, 2, 0.45)), () => {
          ctx.save(); ctx.translate(px, py); ctx.rotate(-0.2);
          ctx.fillStyle = C.sand; ctx.beginPath(); ctx.arc(0, 0, 140 * s, 0, Math.PI * 2); ctx.fill();
          ctx.font = font(900, 64 * s); ctx.fillStyle = C.charcoal; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(d.price, 0, 6 * s);
          ctx.restore();
        });
      }
      const ck = p(t, 3.8, 0.35);
      if (ck && d.cta) {
        const pulse = 1 + 0.04 * Math.sin((t - 3.8) * 6) * (t > 4.2 ? 1 : 0);
        pop(ctx, W / 2, H * (H > 1500 ? 0.86 : 0.9), E.back(ck) * pulse, () => pill(ctx, d.cta, W / 2, H * (H > 1500 ? 0.86 : 0.9), 40 * s, C.white, C.charcoal, 'center'));
      }
    },
  });

  T.push({
    id: 'compte', kind: 'video', dur: 6, name: 'Compte à rebours', use: 'Pour teaser une ouverture, une nouvelle collection ou la fin d’une offre.', tags: ['video', 'pub'],
    fields: [['top', 'Phrase du haut', 'Ouverture dans'], ['date', 'Date', 'Lundi 16 novembre'], ['place', 'Lieu', 'Lyon · Gerland']],
    photos: [],
    draw(ctx, t, W, H, d) {
      const s = W / 1080;
      ctx.fillStyle = C.olive; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H * 0.7);
      g.addColorStop(0, 'rgba(255,255,255,.1)'); g.addColorStop(1, 'rgba(0,0,0,.25)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (t < 3.8) {
        ctx.globalAlpha = p(t, 0.1, 0.3);
        ctx.font = font(800, 54 * s); ctx.fillStyle = C.ivory; ctx.fillText(d.top, W / 2, H * 0.3);
        ctx.globalAlpha = 1;
        const i = Math.floor((t - 0.8) / 1);
        if (t >= 0.8 && i < 3) {
          const lt = t - 0.8 - i;
          const k = 1.6 - 0.6 * E.out(p(lt, 0, 0.35));
          ctx.save(); ctx.globalAlpha = p(lt, 0, 0.15) * (1 - p(lt, 0.8, 0.2));
          ctx.translate(W / 2, H * 0.52); ctx.scale(k, k);
          ctx.font = font(500, 520 * s, SERIF); ctx.fillStyle = C.sand; ctx.fillText(String(3 - i), 0, 0);
          ctx.restore();
        }
      } else {
        const k = E.out(p(t, 3.8, 0.5));
        ctx.globalAlpha = k;
        logo(ctx, W / 2, H * 0.42 - (1 - k) * 40 * s, 110 * s, C.ivory, C.sand, 'center');
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = font(800, 60 * s); ctx.fillStyle = C.ivory; ctx.fillText(d.date, W / 2, H * 0.52);
        ctx.font = font(600, 36 * s); ctx.fillStyle = C.sand; ctx.fillText(d.place, W / 2, H * 0.52 + 80 * s);
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    },
  });

  T.push({
    id: 'promo', kind: 'video', dur: 6.5, name: 'Promo −10 %', use: 'Pub courte et punchy pour une offre (Meta Ads, TikTok Ads).', tags: ['video', 'pub'],
    fields: [['big', 'Gros chiffre', '−10 %'], ['line', 'Phrase', 'sur ta 1re commande'], ['code', 'Code', 'BIENVENUE10'], ['legal', 'Mention', 'Offre valable sur la première commande. Conditions sur le site.']],
    photos: [P('chicken-rice-veg'), P('salmon-quinoa'), P('overnight-oats'), P('lasagna')],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
      // bande de photos qui défile
      const cw = 360 * s, ch = H > 1500 ? 460 * s : 300 * s, gap = 24 * s;
      const y0 = H - ch - (H > 1500 ? 260 * s : 120 * s);
      const off = (t * 140 * s) % ((cw + gap) * A.length || 1);
      for (let k = -1; k < 6; k++) {
        const x = k * (cw + gap) - off + 40 * s;
        ctx.save(); rr(ctx, x, y0, cw, ch, 28 * s); ctx.clip();
        cover(ctx, A[((k % A.length) + A.length) % A.length], x, y0, cw, ch);
        ctx.restore();
      }
      logo(ctx, 64 * s, 100 * s, 44 * s, C.charcoal, C.olive);
      const k = E.back(p(t, 0.2, 0.4));
      const shake = t > 0.55 && t < 0.75 ? Math.sin(t * 90) * 8 * s : 0;
      const cy = H > 1500 ? H * 0.3 : H * 0.28;
      pop(ctx, W / 2 + shake, cy, k * (1 + 0.6 * (1 - p(t, 0.2, 0.4))), () => {
        ctx.font = font(900, 300 * s); ctx.fillStyle = C.olive; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(d.big, W / 2 + shake, cy);
      });
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = p(t, 0.9, 0.3);
      ctx.font = font(800, 58 * s); ctx.fillStyle = C.charcoal; ctx.fillText(d.line, W / 2, cy + 190 * s);
      ctx.globalAlpha = 1;
      const ck = E.back(p(t, 1.6, 0.4));
      pop(ctx, W / 2, cy + 320 * s, ck, () => {
        ctx.font = font(900, 56 * s);
        const w = ctx.measureText(d.code).width + 90 * s;
        ctx.fillStyle = C.white; rr(ctx, W / 2 - w / 2, cy + 270 * s, w, 100 * s, 22 * s); ctx.fill();
        ctx.setLineDash([14 * s, 10 * s]); ctx.lineWidth = 4 * s; ctx.strokeStyle = C.olive; ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.charcoal; ctx.fillText(d.code, W / 2, cy + 322 * s);
        // reflet
        const sx = W / 2 - w / 2 + ((t - 1.6) % 1.6) / 1.6 * (w + 200 * s) - 100 * s;
        ctx.save(); rr(ctx, W / 2 - w / 2, cy + 270 * s, w, 100 * s, 22 * s); ctx.clip();
        const g = ctx.createLinearGradient(sx - 60 * s, 0, sx + 60 * s, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(228,214,186,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(sx - 60 * s, cy + 270 * s, 120 * s, 100 * s); ctx.restore();
      });
      ctx.font = font(500, 22 * s); ctx.fillStyle = C.taupe; ctx.fillText(d.legal || '', W / 2, H - 50 * s);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      endCard(ctx, W, H, p(t, 5.2, 0.35), 'Your week, prepared.', 'Lien en bio');
    },
  });

  T.push({
    id: 'avantapres', kind: 'video', dur: 8, name: 'Avant / Après', use: 'Le contraste qui fait réagir : sans PREP CLUB, avec PREP CLUB.', tags: ['video', 'pub'],
    fields: [['labelA', 'Étiquette « avant »', 'SANS PREP CLUB'], ['textA', 'Texte « avant »', 'Dimanche soir : 2 h de courses, 3 h de cuisine, 1 h de vaisselle'], ['labelB', 'Étiquette « après »', 'AVEC PREP CLUB'], ['textB', 'Texte « après »', '5 minutes pour commander. C’est tout. 🙌']],
    photos: [IMG.shelves, IMG.spread],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      const y = H * (H > 1500 ? 0.3 : 0.27);
      cover(ctx, A[0], 0, 0, W, H, 1.04 + 0.03 * t, 0.5, 0.5, 'grayscale(1) brightness(.7)');
      if (t < 4) {
        pill(ctx, d.labelA, W / 2, y - 120 * s, 30 * s, C.charcoal, C.white, 'center');
        pop(ctx, W / 2, y, E.back(p(t, 0.3, 0.35)), () => boxes(ctx, d.textA, W / 2, y, 48 * s, W * 0.82));
      }
      const wk = E.inOut(p(t, 3.6, 0.6));
      if (wk > 0) {
        ctx.save();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W * wk * 1.6, 0); ctx.lineTo(W * wk * 1.6 - W * 0.6, H); ctx.lineTo(0, H); ctx.closePath(); ctx.clip();
        cover(ctx, A[1], 0, 0, W, H, 1.1 - 0.05 * p(t, 3.6, 4));
        shade(ctx, W, H, 0.5, 0.4);
        if (t > 4.1) {
          pill(ctx, d.labelB, W / 2, y - 120 * s, 30 * s, C.olive, C.white, 'center');
          pop(ctx, W / 2, y, E.back(p(t, 4.2, 0.35)), () => boxes(ctx, d.textB, W / 2, y, 48 * s, W * 0.82));
        }
        ctx.restore();
      }
      endCard(ctx, W, H, p(t, 6.6, 0.35), 'Your week, prepared.', 'Lien en bio');
    },
  });

  T.push({
    id: 'avis', kind: 'video', dur: 6.5, name: 'Avis client', use: 'Un vrai avis qui apparaît comme un commentaire, puis ta réponse. À utiliser avec un avis autorisé.', tags: ['video'],
    fields: [['author', 'Prénom du client', 'Camille (avis fictif, démo)'], ['comment', 'Son avis', 'Je ne pensais pas que des plats préparés pouvaient être aussi bons. Le curry 😍'], ['reply', 'Ta réponse', 'Merci Camille ! On te garde un curry pour jeudi ? 🥥']],
    photos: [P('salmon-coconut-curry')],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      cover(ctx, A[0], 0, 0, W, H, 1.08 + 0.04 * (t / this.dur));
      shade(ctx, W, H, 0, 0.35);
      const cx = W / 2, cy = H * (H > 1500 ? 0.36 : 0.32);
      pop(ctx, cx, cy, E.back(p(t, 0.3, 0.4)), () => {
        ctx.font = font(700, 40 * s);
        const lines = wrap(ctx, d.comment, W * 0.7);
        const h = 150 * s + lines.length * 52 * s;
        const x = W * 0.08, w = W * 0.84, y = cy - h / 2;
        ctx.fillStyle = C.white; rr(ctx, x, y, w, h, 36 * s); ctx.fill();
        ctx.fillStyle = C.sand; ctx.beginPath(); ctx.arc(x + 70 * s, y + 70 * s, 34 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.oliveDark; ctx.font = font(800, 32 * s); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(d.author || '?')[0].toUpperCase(), x + 70 * s, y + 72 * s);
        ctx.textAlign = 'left';
        ctx.font = font(600, 28 * s); ctx.fillStyle = '#7a7a7a'; ctx.fillText(`Avis de ${d.author}`, x + 124 * s, y + 58 * s);
        const stars = Math.round(5 * p(t, 0.9, 0.8));
        ctx.font = font(700, 28 * s); ctx.fillStyle = '#E3A21A'; ctx.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), x + 124 * s, y + 94 * s);
        ctx.font = font(700, 40 * s); ctx.fillStyle = '#111';
        lines.forEach((l, i) => ctx.fillText(l, x + 44 * s, y + 160 * s + i * 52 * s));
        ctx.textBaseline = 'alphabetic';
      });
      if (t > 3) pop(ctx, W / 2, cy + 330 * s, E.back(p(t, 3.1, 0.35)), () => boxes(ctx, d.reply, W / 2, cy + 330 * s, 42 * s, W * 0.82, { bg: C.olive, fg: C.white }));
      const k = p(t, 5, 0.4);
      if (k) { ctx.save(); ctx.globalAlpha = k; logo(ctx, W / 2, H * (H > 1500 ? 0.78 : 0.88), 56 * s, C.white, C.sand, 'center'); ctx.restore(); }
    },
  });

  /* ---------- Visuels fixes (formats natifs) ---------- */
  T.push({
    id: 'textpost', kind: 'image', name: 'Post texte', use: 'Une phrase forte, comme un post publié depuis ton téléphone. Très repartagé en story.', tags: ['image'],
    fields: [['text', 'Ton texte', 'Le dimanche soir, je commande.\nLe reste de la semaine, je profite.'], ['meta', 'Ligne du bas', '12:30 · Lyon']],
    photos: [], fmt: 'post',
    draw(ctx, t, W, H, d) {
      const s = W / 1080;
      ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
      ctx.font = font(600, 62 * s);
      const lines = wrap(ctx, d.text, W * 0.78);
      const h = 230 * s + lines.length * 82 * s;
      const x = W * 0.07, w = W * 0.86, y = (H - h) / 2;
      ctx.fillStyle = C.white; rr(ctx, x, y, w, h, 40 * s); ctx.fill();
      ctx.fillStyle = C.olive; ctx.beginPath(); ctx.arc(x + 84 * s, y + 90 * s, 44 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ivory; ctx.font = font(600, 34 * s, SERIF); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PC', x + 84 * s, y + 92 * s);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#111'; ctx.font = font(800, 36 * s); ctx.fillText('PREP CLUB', x + 150 * s, y + 74 * s);
      ctx.fillStyle = '#7a7a7a'; ctx.font = font(500, 30 * s); ctx.fillText(MK.brand.handle, x + 150 * s, y + 114 * s);
      ctx.fillStyle = '#111'; ctx.font = font(600, 62 * s); ctx.textBaseline = 'top';
      lines.forEach((l, i) => ctx.fillText(l, x + 60 * s, y + 170 * s + i * 82 * s));
      ctx.fillStyle = '#9a9a9a'; ctx.font = font(500, 28 * s); ctx.fillText(d.meta || '', x + 60 * s, y + h - 60 * s);
      ctx.textBaseline = 'alphabetic';
    },
  });

  T.push({
    id: 'notes', kind: 'image', name: 'Notes', use: 'Une liste façon application Notes : « ma semaine », « ma liste de courses »… Format très authentique.', tags: ['image'],
    fields: [['title', 'Titre', 'Ma semaine 🥗'], ['lines', 'Lignes (✓ au début = coché)', '✓ Lun · Poulet, riz & légumes rôtis\n✓ Mar · Bol saumon & quinoa\nMer · Lasagnes maison\nJeu · Curry de légumes\nVen · Bol de courge d’automne\n\nTemps passé en cuisine : 0 min']],
    photos: [], fmt: 'post',
    draw(ctx, t, W, H, d) {
      const s = W / 1080;
      ctx.fillStyle = '#FFFDF7'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#D9A21B'; ctx.font = font(600, 40 * s); ctx.fillText('‹ Notes', 50 * s, 110 * s);
      ctx.fillText('···', W - 120 * s, 110 * s);
      ctx.fillStyle = '#9a9a9a'; ctx.font = font(500, 28 * s); ctx.textAlign = 'center'; ctx.fillText('9 novembre 2026 à 10:04', W / 2, 190 * s); ctx.textAlign = 'left';
      ctx.fillStyle = '#111'; ctx.font = font(800, 76 * s); ctx.fillText(d.title, 70 * s, 300 * s);
      let y = 400 * s;
      String(d.lines || '').split('\n').forEach((l) => {
        const done = l.startsWith('✓');
        const txt = done ? l.slice(1).trim() : l;
        if (!txt) { y += 40 * s; return; }
        const isTodo = /^(Lun|Mar|Mer|Jeu|Ven|Sam|Dim)/.test(txt);
        let x = 70 * s;
        if (isTodo) {
          ctx.lineWidth = 4 * s; ctx.strokeStyle = done ? '#D9A21B' : '#c9c9c9';
          ctx.beginPath(); ctx.arc(x + 22 * s, y - 16 * s, 22 * s, 0, Math.PI * 2);
          if (done) { ctx.fillStyle = '#D9A21B'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + 11 * s, y - 16 * s); ctx.lineTo(x + 19 * s, y - 7 * s); ctx.lineTo(x + 34 * s, y - 26 * s); ctx.stroke(); } else ctx.stroke();
          x += 66 * s;
        }
        ctx.font = font(500, 44 * s); ctx.fillStyle = done ? '#9a9a9a' : '#111';
        ctx.fillText(txt, x, y);
        if (done) { const w = ctx.measureText(txt).width; ctx.fillRect(x, y - 15 * s, w, 3 * s); }
        y += 76 * s;
      });
    },
  });

  T.push({
    id: 'prix', kind: 'image', name: 'Photo + sticker prix', use: 'Le post produit classique des marques food actuelles : grande photo, badge, prix.', tags: ['image', 'pub'],
    fields: [['badge', 'Badge', 'PLAT DE LA SEMAINE'], ['name', 'Nom du plat', 'Bol saumon & quinoa'], ['price', 'Prix', '12,50 €']],
    photos: [P('salmon-quinoa')], fmt: 'post',
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      cover(ctx, A[0], 0, 0, W, H, 1.02);
      shade(ctx, W, H, 0.45, 0.8);
      cornerLogo(ctx, W, H, s);
      const y = H - 120 * s;
      ctx.font = font(800, 76 * s);
      const lines = wrap(ctx, d.name, W * 0.8);
      ctx.fillStyle = C.white;
      lines.forEach((l, i) => ctx.fillText(l, 64 * s, y - (lines.length - 1 - i) * 86 * s));
      if (d.badge) pill(ctx, d.badge, 64 * s, y - lines.length * 86 * s - 30 * s, 26 * s, C.white, C.charcoal);
      if (d.price) {
        const px = W - 190 * s, py = 230 * s;
        ctx.save(); ctx.translate(px, py); ctx.rotate(0.18);
        ctx.fillStyle = C.sand; ctx.beginPath(); ctx.arc(0, 0, 120 * s, 0, Math.PI * 2); ctx.fill();
        ctx.font = font(900, 56 * s); ctx.fillStyle = C.charcoal; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.price, 0, 4 * s);
        ctx.restore();
      }
    },
  });

  T.push({
    id: 'grille', kind: 'image', name: 'Menu en grille', use: 'Le menu de la semaine en 4 photos : le post du dimanche.', tags: ['image'],
    fields: [['title', 'Titre', 'Le menu de la semaine'], ['names', 'Les 4 plats (un par ligne)', 'Poulet, riz & légumes\nBol saumon & quinoa\nLasagnes maison\nCurry de légumes'], ['foot', 'Bas de l’image', 'Commande avant mercredi minuit']],
    photos: [P('chicken-rice-veg'), P('salmon-quinoa'), P('lasagna'), P('veggie-curry')], fmt: 'post',
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.charcoal; ctx.font = font(900, 70 * s); ctx.fillText(d.title, 60 * s, 130 * s);
      logo(ctx, W - 290 * s, 60 * s, 34 * s, C.charcoal, C.olive);
      const names = String(d.names || '').split('\n');
      const top = 190 * s, gap = 20 * s, bottom = H - 110 * s;
      const cw = (W - 120 * s - gap) / 2, ch = (bottom - top - gap) / 2;
      for (let i = 0; i < 4; i++) {
        const x = 60 * s + (i % 2) * (cw + gap), y = top + Math.floor(i / 2) * (ch + gap);
        ctx.save(); rr(ctx, x, y, cw, ch, 26 * s); ctx.clip(); cover(ctx, A[i], x, y, cw, ch); ctx.restore();
        if (names[i]) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, cw, ch); ctx.clip(); pill(ctx, names[i], x + 20 * s, y + ch - 44 * s, 24 * s, C.white, C.charcoal); ctx.restore(); }
      }
      ctx.fillStyle = C.olive; ctx.font = font(700, 32 * s); ctx.fillText(d.foot || '', 60 * s, H - 48 * s);
    },
  });

  T.push({
    id: 'pin', kind: 'image', name: 'Épingle Pinterest', use: 'Photo + gros titre : le format qui génère des clics sur Pinterest.', tags: ['image'],
    fields: [['title', 'Titre', '5 lunch box pour le bureau'], ['sub', 'Sous-titre', 'Idées & recettes · PREP CLUB Lyon']],
    photos: [IMG.salads], fmt: 'pin',
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      const mh = H * 0.6;
      cover(ctx, A[0], 0, 0, W, mh);
      ctx.fillStyle = C.olive; ctx.fillRect(0, mh, W, H - mh);
      ctx.font = font(900, 84 * s); ctx.fillStyle = C.ivory;
      const lines = wrap(ctx, String(d.title).toUpperCase(), W * 0.86);
      lines.forEach((l, i) => ctx.fillText(l, 64 * s, mh + 130 * s + i * 92 * s));
      ctx.font = font(600, 34 * s); ctx.fillStyle = C.sand; ctx.fillText(d.sub || '', 64 * s, H - 70 * s);
    },
  });

  T.push({
    id: 'citation', kind: 'image', name: 'Grande phrase', use: 'Une phrase de marque sur fond uni, pour annoncer ou teaser.', tags: ['image'],
    fields: [['text', 'Phrase', 'Quelque chose se prépare à Lyon.'], ['sub', 'Petite ligne', 'Lundi 16 novembre'], ['theme', 'Couleur (olive, charbon, sable, crème)', 'charbon']],
    photos: [], fmt: 'post',
    draw(ctx, t, W, H, d) {
      const s = W / 1080;
      const th = { olive: [C.olive, C.ivory, C.sand], charbon: [C.charcoal, C.ivory, C.sand], sable: [C.sand, C.charcoal, C.olive], 'crème': [C.cream, C.charcoal, C.olive], creme: [C.cream, C.charcoal, C.olive] }[String(d.theme || '').toLowerCase()] || [C.charcoal, C.ivory, C.sand];
      ctx.fillStyle = th[0]; ctx.fillRect(0, 0, W, H);
      logo(ctx, 70 * s, 110 * s, 40 * s, th[1], th[2]);
      ctx.font = font(500, 110 * s, SERIF); ctx.fillStyle = th[1];
      const lines = wrap(ctx, d.text, W * 0.84);
      const y0 = H / 2 - (lines.length * 116 * s) / 2 + 60 * s;
      lines.forEach((l, i) => ctx.fillText(l, 70 * s, y0 + i * 116 * s));
      ctx.font = font(700, 36 * s); ctx.fillStyle = th[2]; ctx.fillText(d.sub || '', 70 * s, H - 90 * s);
    },
  });

  T.push({
    id: 'storyframe', kind: 'image', name: 'Story texte', use: 'Une photo et une phrase façon story : ajoute ensuite le sondage ou le lien dans l’appli.', tags: ['image'],
    fields: [['text', 'Phrase', 'Petit-déj ou déjeuner ?']],
    photos: [IMG.breakfastSpread], fmt: 'story',
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      cover(ctx, A[0], 0, 0, W, H, 1.02);
      shade(ctx, W, H, 0.6, 0.35);
      boxes(ctx, d.text, W / 2, H * 0.24, 56 * s, W * 0.82);
      logo(ctx, W / 2, H - 140 * s, 40 * s, C.white, C.sand, 'center');
    },
  });

  /* ---------- Vidéos supplémentaires ---------- */
  T.push({
    id: 'unboxing', kind: 'video', dur: 7, name: 'Unboxing', use: 'On ouvre la box et on découvre les plats un par un : le format « déballage » adoré sur TikTok.', tags: ['video'],
    fields: [['title', 'Phrase du haut', 'Ma box de la semaine est arrivée 📦'], ['label', 'Texte sur le couvercle', 'Livraison du jeudi'], ['items', 'Plats montrés (un par ligne, 4 max)', 'Lundi · Poulet rôti\nMardi · Bol saumon\nMercredi · Lasagnes\nJeudi · Curry']],
    photos: [IMG.spread],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      cover(ctx, A[0], 0, 0, W, H, 1.04 + 0.05 * (t / this.dur));
      shade(ctx, W, H, 0.6, 0.35);
      const tags = String(d.items || '').split('\n').filter(Boolean).slice(0, 4);
      const pos = [[0.3, 0.32], [0.68, 0.44], [0.32, 0.58], [0.66, 0.7]];
      tags.forEach((tg, i) => {
        const [fx, fy] = pos[i];
        pop(ctx, W * fx, H * fy, E.back(p(t, 1.8 + i * 0.45, 0.35)), () => {
          ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(W * fx, H * fy + 46 * s, 10 * s, 0, Math.PI * 2); ctx.fill();
          pill(ctx, tg, W * fx, H * fy, 30 * s, C.white, C.charcoal, 'center');
        });
      });
      if (t > 1.3) pop(ctx, W / 2, H * 0.14, E.back(p(t, 1.3, 0.3)), () => boxes(ctx, d.title, W / 2, H * 0.14, 46 * s, W * 0.84));
      const lk = E.inOut(p(t, 0.4, 1));
      if (lk < 1) {
        const y = -lk * H * 1.05;
        ctx.fillStyle = C.sand; ctx.fillRect(0, y, W, H);
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(W * 0.45, y, W * 0.1, H);
        logo(ctx, W / 2, y + H * 0.45, 110 * s, C.charcoal, C.olive, 'center');
        ctx.font = font(700, 40 * s); ctx.textAlign = 'center'; ctx.fillStyle = C.oliveDark; ctx.fillText(d.label || '', W / 2, y + H * 0.45 + 120 * s); ctx.textAlign = 'left';
      }
      endCard(ctx, W, H, p(t, 5.8, 0.35), 'Your week, prepared.', 'Lien en bio');
    },
  });

  T.push({
    id: 'recette', kind: 'video', dur: 10, name: 'En cuisine, étape par étape', use: 'Comment on prépare un plat, en 4 étapes. Montre le savoir-faire et rassure sur la qualité.', tags: ['video'],
    fields: [['title', 'Titre', 'Comment on prépare notre bol de courge'], ['s1', 'Étape 1', 'On rôtit la courge au four'], ['s2', 'Étape 2', 'On cuit les lentilles'], ['s3', 'Étape 3', 'On torréfie les noisettes'], ['s4', 'Étape 4', 'Sauce tahini-citron, et c’est prêt'], ['fin', 'Phrase de fin', 'Toi, tu n’as qu’à réchauffer.']],
    photos: [IMG.pumpkin, IMG.cooking, IMG.mushrooms, P('seasonal-bowl')],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      if (t < 1.6) {
        cover(ctx, A[3] || A[0], 0, 0, W, H, 1.05 + 0.03 * t, 0.5, 0.5, 'brightness(.55)');
        stroked(ctx, d.title, W / 2, H * 0.4, 88 * s, W * 0.84);
        cornerLogo(ctx, W, H, s);
        return;
      }
      if (t < 8.8) {
        const i = Math.min(3, Math.floor((t - 1.6) / 1.8));
        const lt = t - 1.6 - i * 1.8;
        cover(ctx, A[i] || A[0], 0, 0, W, H, 1.1 - 0.06 * (lt / 1.8));
        shade(ctx, W, H, 0.4, 0.75);
        const sw = (W - 120 * s - 24 * s) / 4;
        for (let j = 0; j < 4; j++) {
          ctx.fillStyle = 'rgba(255,255,255,.35)'; rr(ctx, 60 * s + j * (sw + 8 * s), 56 * s, sw, 8 * s, 4 * s); ctx.fill();
          const k = j < i ? 1 : j === i ? lt / 1.8 : 0;
          if (k) { ctx.fillStyle = C.white; rr(ctx, 60 * s + j * (sw + 8 * s), 56 * s, sw * k, 8 * s, 4 * s); ctx.fill(); }
        }
        const cy = H * (H > 1500 ? 0.62 : 0.56);
        pop(ctx, 120 * s, cy, E.back(p(lt, 0, 0.3)), () => {
          ctx.fillStyle = C.olive; ctx.beginPath(); ctx.arc(120 * s, cy, 60 * s, 0, Math.PI * 2); ctx.fill();
          ctx.font = font(900, 64 * s); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), 120 * s, cy + 4 * s);
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        });
        ctx.save(); ctx.globalAlpha = p(lt, 0.15, 0.25);
        boxes(ctx, d[`s${i + 1}`], W / 2, cy + 130 * s, 46 * s, W * 0.84);
        ctx.restore();
        return;
      }
      cover(ctx, A[3] || A[0], 0, 0, W, H, 1.05);
      endCard(ctx, W, H, p(t, 8.8, 0.35), d.fin, 'Lien en bio');
    },
  });

  T.push({
    id: 'quiz', kind: 'video', dur: 7, name: 'Ce plat ou celui-là ?', use: 'Le format « this or that » : deux plats, on demande de choisir en commentaire. Fait exploser les commentaires.', tags: ['video'],
    fields: [['q', 'Question', 'Tu choisis quoi ce midi ?'], ['a', 'Plat A', 'Lasagnes maison'], ['b', 'Plat B', 'Bol saumon & quinoa'], ['reveal', 'Réponse finale', 'Pas besoin de choisir : les deux sont sur la carte 😉']],
    photos: [P('lasagna'), P('salmon-quinoa')],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      const tall = H > W * 1.2;
      const k = E.out(p(t, 0, 0.45));
      const ha = tall ? [0, -(1 - k) * H / 2, W, H / 2] : [-(1 - k) * W / 2, 0, W / 2, H];
      const hb = tall ? [0, H / 2 + (1 - k) * H / 2, W, H / 2] : [W / 2 + (1 - k) * W / 2, 0, W / 2, H];
      cover(ctx, A[0], ...ha); cover(ctx, A[1], ...hb);
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, 0, W, H);
      const ca = tall ? [W / 2, H * 0.36] : [W * 0.25, H * 0.7];
      const cb = tall ? [W / 2, H * 0.86] : [W * 0.75, H * 0.7];
      pop(ctx, ca[0], ca[1], E.back(p(t, 0.6, 0.3)), () => boxes(ctx, `A · ${d.a}`, ca[0], ca[1], 40 * s, tall ? W * 0.8 : W * 0.44));
      pop(ctx, cb[0], cb[1], E.back(p(t, 0.8, 0.3)), () => boxes(ctx, `B · ${d.b}`, cb[0], cb[1], 40 * s, tall ? W * 0.8 : W * 0.44));
      const mid = tall ? [W / 2, H / 2] : [W / 2, H / 2];
      pop(ctx, mid[0], mid[1], E.back(p(t, 1, 0.3)), () => {
        ctx.fillStyle = C.charcoal; ctx.beginPath(); ctx.arc(mid[0], mid[1], 70 * s, 0, Math.PI * 2); ctx.fill();
        ctx.font = font(900, 44 * s); ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('OU', mid[0], mid[1] + 3 * s);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      });
      pop(ctx, W / 2, H * 0.08, E.back(p(t, 0.3, 0.3)), () => boxes(ctx, d.q, W / 2, H * 0.08, 46 * s, W * 0.86));
      const tk = p(t, 1.4, 3);
      if (t > 1.4 && t < 4.6) { ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(0, H - 14 * s, W, 14 * s); ctx.fillStyle = C.sand; ctx.fillRect(0, H - 14 * s, W * (1 - tk), 14 * s); }
      const rk = p(t, 4.6, 0.35);
      if (rk) {
        ctx.save(); ctx.globalAlpha = rk * 0.88; ctx.fillStyle = C.olive; ctx.fillRect(0, 0, W, H); ctx.restore();
        pop(ctx, W / 2, H * 0.42, E.back(rk), () => boxes(ctx, d.reveal, W / 2, H * 0.42, 50 * s, W * 0.84));
        ctx.save(); ctx.globalAlpha = p(t, 5.4, 0.4); logo(ctx, W / 2, H * 0.62, 56 * s, C.ivory, C.sand, 'center'); ctx.restore();
      }
    },
  });

  T.push({
    id: 'producteur', kind: 'video', dur: 8, name: 'Portrait de producteur', use: 'Style documentaire : nom, métier, distance qui défile, citation. Valorise le local.', tags: ['video'],
    fields: [['name', 'Nom', 'Les Jardins de la Saône'], ['job', 'Métier · lieu', 'Maraîcher · Neuville-sur-Saône'], ['km', 'Distance de Lyon (km)', '18'], ['quote', 'Citation (avec son accord)', 'Ce qu’on récolte le lundi est dans vos plats le jeudi.']],
    photos: [IMG.seedlings],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      cover(ctx, A[0], 0, 0, W, H, 1.1 - 0.06 * (t / this.dur));
      shade(ctx, W, H, 0.35, 0.8);
      const km = Math.round((Number(String(d.km).replace(',', '.')) || 0) * E.out(p(t, 0.6, 1.4)));
      ctx.save(); ctx.globalAlpha = p(t, 0.5, 0.3); pill(ctx, `📍 à ${km} km de Lyon`, 64 * s, 120 * s, 32 * s, C.white, C.charcoal); ctx.restore();
      const lk = E.out(p(t, 1.2, 0.5));
      const y = H * (H > 1500 ? 0.66 : 0.62);
      ctx.save(); ctx.beginPath(); ctx.rect(0, y - 90 * s, W * lk, 210 * s); ctx.clip();
      ctx.fillStyle = C.olive; ctx.fillRect(0, y - 90 * s, W * 0.86, 190 * s);
      ctx.fillStyle = C.sand; ctx.fillRect(0, y - 90 * s, 12 * s, 190 * s);
      ctx.font = font(500, 66 * s, SERIF); ctx.fillStyle = C.ivory; ctx.fillText(d.name, 64 * s, y);
      ctx.font = font(600, 34 * s); ctx.fillStyle = C.sand; ctx.fillText(d.job, 64 * s, y + 60 * s);
      ctx.restore();
      if (t > 3.4) {
        ctx.save(); ctx.globalAlpha = p(t, 3.4, 0.5) * (1 - p(t, 6.4, 0.3));
        ctx.font = font(500, 64 * s, SERIF, true); ctx.fillStyle = C.white;
        const lines = wrap(ctx, `« ${d.quote} »`, W * 0.84);
        lines.forEach((l, i) => ctx.fillText(l, 64 * s, H * 0.3 + i * 74 * s));
        ctx.restore();
      }
      endCard(ctx, W, H, p(t, 6.6, 0.35), 'Meet the people behind your food.', 'Nos producteurs · lien en bio');
    },
  });

  T.push({
    id: 'chiffres', kind: 'video', dur: 8, name: 'PREP CLUB en chiffres', use: 'Des chiffres qui défilent : simple, clair, très efficace en pub et en story.', tags: ['video', 'pub'],
    fields: [['lines', 'Chiffres (nombre | texte, un par ligne)', '6 | producteurs partenaires\n30 | plats à la carte\n2 min | pour réchauffer\n0 | abonnement obligatoire']],
    photos: [],
    draw(ctx, t, W, H, d) {
      const s = W / 1080;
      ctx.fillStyle = C.olive; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, H * 0.7);
      g.addColorStop(0, 'rgba(255,255,255,.1)'); g.addColorStop(1, 'rgba(0,0,0,.25)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      logo(ctx, W / 2, 130 * s, 48 * s, C.ivory, C.sand, 'center');
      const rows = String(d.lines || '').split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((r) => r[0]).slice(0, 4);
      const i = Math.min(rows.length - 1, Math.floor((t - 0.4) / 1.5));
      if (t >= 0.4 && t < 6.6 && rows[i]) {
        const lt = t - 0.4 - i * 1.5;
        const m = /^(\d+)(.*)$/.exec(rows[i][0]);
        const val = m ? `${Math.round(Number(m[1]) * E.out(p(lt, 0, 0.6)))}${m[2]}` : rows[i][0];
        ctx.save(); ctx.globalAlpha = p(lt, 0, 0.15) * (1 - p(lt, 1.3, 0.2));
        const up = (1 - E.out(p(lt, 0, 0.35))) * 50 * s;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = font(500, 300 * s, SERIF); ctx.fillStyle = C.sand; ctx.fillText(val, W / 2, H * 0.44 + up);
        ctx.font = font(800, 56 * s); ctx.fillStyle = C.ivory; wrap(ctx, rows[i][1] || '', W * 0.8).forEach((l, j) => ctx.fillText(l, W / 2, H * 0.44 + 210 * s + j * 66 * s + up));
        ctx.restore();
      }
      ctx.textAlign = 'center'; ctx.font = font(700, 30 * s); ctx.fillStyle = 'rgba(251,248,241,.7)';
      ctx.fillText(rows.map((_, j) => (j === i && t < 6.6 ? '●' : '○')).join('  '), W / 2, H - 120 * s);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      endCard(ctx, W, H, p(t, 6.6, 0.35), 'Your week, prepared.', 'Lien en bio');
    },
  });

  T.push({
    id: 'menuvideo', kind: 'video', dur: 8, name: 'Le menu de la semaine (vidéo)', use: 'Les plats arrivent un par un, jour par jour. La version animée du post du dimanche.', tags: ['video', 'pub'],
    fields: [['title', 'Titre', 'Le menu de la semaine'], ['plats', 'Les 5 plats (un par ligne)', 'Poulet, riz & légumes rôtis\nBol saumon & quinoa\nLasagnes maison\nCurry de légumes\nBol de courge d’automne'], ['cta', 'Bouton', 'Commande avant mercredi minuit']],
    photos: [P('chicken-rice-veg'), P('salmon-quinoa'), P('lasagna'), P('veggie-curry'), P('seasonal-bowl')],
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = p(t, 0.1, 0.3);
      ctx.font = font(900, 72 * s); ctx.fillStyle = C.charcoal; ctx.fillText(d.title, 60 * s, H * 0.1);
      logo(ctx, 60 * s, H * 0.1 + 64 * s, 34 * s, C.olive, C.taupe);
      ctx.restore();
      const plats = String(d.plats || '').split('\n').slice(0, 5);
      const days = ['LUN', 'MAR', 'MER', 'JEU', 'VEN'];
      const top = H * 0.17, avail = H * 0.66, rh = avail / 5, ph = rh - 18 * s;
      plats.forEach((name, i) => {
        const k = E.out(p(t, 0.5 + i * 0.45, 0.45));
        if (!k) return;
        const x = 60 * s + (1 - k) * W, y = top + i * rh;
        ctx.save(); ctx.globalAlpha = k;
        ctx.fillStyle = C.white; rr(ctx, x, y, W - 120 * s, ph, 22 * s); ctx.fill();
        ctx.save(); rr(ctx, x, y, ph, ph, 22 * s); ctx.clip(); cover(ctx, A[i], x, y, ph, ph); ctx.restore();
        ctx.font = font(800, 26 * s); ctx.fillStyle = C.olive; ctx.fillText(days[i], x + ph + 30 * s, y + ph * 0.42);
        ctx.font = font(700, 38 * s); ctx.fillStyle = C.charcoal; ctx.fillText(wrap(ctx, name, W - 120 * s - ph - 60 * s)[0], x + ph + 30 * s, y + ph * 0.42 + 48 * s);
        ctx.restore();
      });
      const ck = E.back(p(t, 3.2, 0.4));
      if (ck) pop(ctx, W / 2, H * 0.9, ck * (1 + 0.03 * Math.sin(t * 6)), () => pill(ctx, d.cta, W / 2, H * 0.9, 34 * s, C.olive, C.ivory, 'center'));
      endCard(ctx, W, H, p(t, 6.6, 0.35), 'Your week, prepared.', 'Lien en bio');
    },
  });

  /* ---------- Visuels supplémentaires ---------- */
  T.push({
    id: 'couverture', kind: 'image', name: 'Couverture de carrousel', use: 'La 1re image d’un carrousel : une grosse accroche qui donne envie de glisser.', tags: ['image'],
    fields: [['hook', 'Accroche', '3 astuces pour ne plus jamais te demander « on mange quoi ? »'], ['swipe', 'Petit bouton', 'Glisse →']],
    photos: [IMG.tabletop], fmt: 'post',
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      cover(ctx, A[0], 0, 0, W, H, 1.02, 0.5, 0.5, 'brightness(.6)');
      cornerLogo(ctx, W, H, s);
      ctx.font = font(700, 30 * s); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText('1/6', W - 110 * s, 100 * s);
      ctx.font = font(900, 96 * s); ctx.fillStyle = C.white;
      const lines = wrap(ctx, d.hook, W * 0.84);
      const y0 = H / 2 - (lines.length * 104 * s) / 2 + 40 * s;
      lines.forEach((l, i) => ctx.fillText(l, 64 * s, y0 + i * 104 * s));
      pill(ctx, d.swipe, W - 64 * s, H - 90 * s, 34 * s, C.white, C.charcoal, 'right');
    },
  });

  T.push({
    id: 'comparatif', kind: 'image', name: 'Comparatif', use: 'Seul(e) ou avec PREP CLUB : un tableau clair qui fait réfléchir. Très enregistré.', tags: ['image', 'pub'],
    fields: [['title', 'Titre', 'Ta semaine de déjeuners'], ['rows', 'Lignes (critère | seul | PREP CLUB)', 'Courses | 1 h | 0 min\nCuisine | 3 h | 0 min\nVaisselle | 1 h | 0 min\nSavoir ce qu’on mange | Pas toujours | Toujours\nEngagement | — | Aucun']],
    photos: [], fmt: 'post',
    draw(ctx, t, W, H, d) {
      const s = W / 1080;
      ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H);
      logo(ctx, 60 * s, 90 * s, 36 * s, C.charcoal, C.olive);
      ctx.font = font(900, 74 * s); ctx.fillStyle = C.charcoal;
      wrap(ctx, d.title, W * 0.86).forEach((l, i) => ctx.fillText(l, 60 * s, 210 * s + i * 82 * s));
      const rows = String(d.rows || '').split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((r) => r[0]).slice(0, 7);
      const top = 300 * s, rh = Math.min(140 * s, (H - top - 80 * s) / (rows.length + 1));
      const c1 = 60 * s, c2 = W * 0.5, c3 = W * 0.76, cw = W * 0.22;
      ctx.font = font(800, 30 * s);
      ctx.fillStyle = C.taupe; ctx.fillText('Seul(e)', c2, top + rh * 0.6);
      ctx.fillStyle = C.olive; rr(ctx, c3 - 16 * s, top + 8 * s, cw, rh - 16 * s, 16 * s); ctx.fill();
      ctx.fillStyle = C.ivory; ctx.fillText('PREP CLUB', c3, top + rh * 0.6);
      rows.forEach((r, i) => {
        const y = top + (i + 1) * rh;
        if (i % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,.7)'; rr(ctx, 40 * s, y + 6 * s, W - 80 * s, rh - 12 * s, 16 * s); ctx.fill(); }
        ctx.font = font(700, 34 * s); ctx.fillStyle = C.charcoal; ctx.fillText(wrap(ctx, r[0], c2 - c1 - 20 * s)[0], c1, y + rh * 0.58);
        ctx.font = font(600, 34 * s); ctx.fillStyle = C.taupe; ctx.fillText(r[1] || '', c2, y + rh * 0.58);
        ctx.font = font(800, 34 * s); ctx.fillStyle = C.oliveDark; ctx.fillText(r[2] || '', c3, y + rh * 0.58);
      });
    },
  });

  T.push({
    id: 'faq', kind: 'image', name: 'Question / réponse', use: 'Une vraie question de ta communauté et ta réponse. Parfait en story et en post.', tags: ['image'],
    fields: [['question', 'La question', 'Les plats se gardent combien de temps ?'], ['answer', 'Ta réponse', 'Jusqu’à 5 jours au frigo. La date est sur chaque étiquette 👌']],
    photos: [P('chicken-mushrooms')], fmt: 'story',
    draw(ctx, t, W, H, d, A) {
      const s = W / 1080;
      cover(ctx, A[0], 0, 0, W, H, 1.1, 0.5, 0.5, 'blur(14px) brightness(.8)');
      const cx = W / 2, y = H * 0.28;
      ctx.font = font(800, 50 * s);
      const lines = wrap(ctx, d.question, W * 0.66);
      const h = 120 * s + lines.length * 62 * s, w = W * 0.78;
      ctx.fillStyle = C.white; rr(ctx, cx - w / 2, y, w, h, 36 * s); ctx.fill();
      ctx.save(); rr(ctx, cx - w / 2, y, w, 80 * s, 36 * s); ctx.clip(); ctx.fillStyle = C.olive; ctx.fillRect(cx - w / 2, y, w, 80 * s); ctx.restore();
      ctx.fillStyle = C.ivory; ctx.font = font(700, 30 * s); ctx.textAlign = 'center'; ctx.fillText('Vos questions', cx, y + 52 * s);
      ctx.fillStyle = '#111'; ctx.font = font(800, 50 * s);
      lines.forEach((l, i) => ctx.fillText(l, cx, y + 140 * s + i * 62 * s));
      ctx.textAlign = 'left';
      boxes(ctx, d.answer, W / 2, y + h + 140 * s, 46 * s, W * 0.84, { bg: C.charcoal, fg: C.white });
      logo(ctx, W / 2, H - 140 * s, 40 * s, C.white, C.sand, 'center');
    },
  });

  T.push({
    id: 'avisimg', kind: 'image', name: 'Avis client (image)', use: 'Un avis 5 étoiles mis en valeur. Uniquement avec un avis réel et l’accord du client.', tags: ['image', 'pub'],
    fields: [['comment', 'Avis réel (avec autorisation)', 'Mes déjeuners de la semaine sont réglés en 5 minutes. Et c’est vraiment bon.'], ['author', 'Prénom + quartier', 'Camille, Lyon 7e (avis fictif, démo)']],
    photos: [], fmt: 'post',
    draw(ctx, t, W, H, d) {
      const s = W / 1080;
      ctx.fillStyle = C.sand; ctx.fillRect(0, 0, W, H);
      logo(ctx, 70 * s, 110 * s, 40 * s, C.charcoal, C.olive);
      ctx.font = font(900, 70 * s); ctx.fillStyle = '#E3A21A'; ctx.fillText('★★★★★', 70 * s, H * 0.3);
      ctx.font = font(500, 76 * s, SERIF); ctx.fillStyle = C.charcoal;
      const lines = wrap(ctx, `« ${d.comment} »`, W * 0.84);
      lines.forEach((l, i) => ctx.fillText(l, 70 * s, H * 0.3 + 120 * s + i * 88 * s));
      ctx.font = font(800, 36 * s); ctx.fillStyle = C.oliveDark; ctx.fillText(`— ${d.author}`, 70 * s, H - 100 * s);
    },
  });

  /* ---------- Profil : photo et couvertures « à la une » ---------- */
  const THEME3 = { olive: [C.olive, C.ivory, C.sand], charbon: [C.charcoal, C.ivory, C.sand], 'crème': [C.cream, C.charcoal, C.olive], sable: [C.sand, C.charcoal, C.olive] };
  T.push({
    id: 'avatar', kind: 'image', name: 'Photo de profil', use: 'Le logo bien centré, lisible même en tout petit.', tags: ['profil'],
    fields: [['theme', 'Couleur (olive, charbon, crème, sable)', 'olive']],
    photos: [], fmt: 'square',
    draw(ctx, t, W, H, d) {
      const s = W / 1080;
      const th = THEME3[String(d.theme || '').toLowerCase()] || THEME3.olive;
      ctx.fillStyle = th[0]; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = font(600, 230 * s, SERIF); ctx.fillStyle = th[1]; ctx.fillText('PREP', W / 2, H / 2 - 110 * s);
      ctx.font = font(500, 230 * s, SERIF, true); ctx.fillStyle = th[2]; ctx.fillText('CLUB', W / 2, H / 2 + 120 * s);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    },
  });
  function icon(ctx, name, cx, cy, r, col) {
    ctx.save();
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    if (name === 'bowl') {
      ctx.moveTo(cx - r, cy - r * 0.05); ctx.lineTo(cx + r, cy - r * 0.05);
      ctx.moveTo(cx - r, cy - r * 0.05); ctx.arc(cx, cy - r * 0.05, r, Math.PI, 0, true);
      ctx.moveTo(cx - r * 0.35, cy + r * 0.95); ctx.lineTo(cx + r * 0.35, cy + r * 0.95);
      [-0.4, 0, 0.4].forEach((k) => { ctx.moveTo(cx + k * r, cy - r * 0.35); ctx.quadraticCurveTo(cx + k * r + r * 0.15, cy - r * 0.6, cx + k * r, cy - r * 0.85); });
    } else if (name === 'bag') {
      ctx.moveTo(cx - r * 0.8, cy - r * 0.4); ctx.lineTo(cx + r * 0.8, cy - r * 0.4); ctx.lineTo(cx + r * 0.7, cy + r); ctx.lineTo(cx - r * 0.7, cy + r); ctx.closePath();
      ctx.moveTo(cx - r * 0.38, cy - r * 0.4); ctx.arc(cx, cy - r * 0.4, r * 0.38, Math.PI, 0);
    } else if (name === 'calendar') {
      rr(ctx, cx - r, cy - r * 0.75, r * 2, r * 1.75, r * 0.2);
      ctx.moveTo(cx - r, cy - r * 0.25); ctx.lineTo(cx + r, cy - r * 0.25);
      ctx.moveTo(cx - r * 0.5, cy - r); ctx.lineTo(cx - r * 0.5, cy - r * 0.55);
      ctx.moveTo(cx + r * 0.5, cy - r); ctx.lineTo(cx + r * 0.5, cy - r * 0.55);
      ctx.stroke(); ctx.beginPath();
      [[-0.5, 0.2], [0, 0.2], [0.5, 0.2], [-0.5, 0.6], [0, 0.6]].forEach(([x, y]) => { ctx.moveTo(cx + x * r + r * 0.08, cy + y * r); ctx.arc(cx + x * r, cy + y * r, r * 0.08, 0, Math.PI * 2); });
      ctx.fill(); ctx.restore(); return;
    } else if (name === 'leaf') {
      ctx.moveTo(cx - r * 0.8, cy + r * 0.8); ctx.quadraticCurveTo(cx - r * 0.9, cy - r * 0.9, cx + r * 0.85, cy - r * 0.85);
      ctx.quadraticCurveTo(cx + r * 0.9, cy + r * 0.9, cx - r * 0.8, cy + r * 0.8);
      ctx.moveTo(cx - r * 0.8, cy + r * 0.8); ctx.lineTo(cx + r * 0.3, cy - r * 0.3);
    } else if (name === 'star') {
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rad = i % 2 ? r * 0.45 : r; const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad * 1.02 + r * 0.05; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.closePath();
    } else if (name === 'question') {
      ctx.font = font(500, r * 2.4, SERIF); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', cx, cy + r * 0.1); ctx.restore(); return;
    } else if (name === 'camera') {
      rr(ctx, cx - r, cy - r * 0.55, r * 2, r * 1.45, r * 0.25);
      ctx.moveTo(cx + r * 0.42, cy + r * 0.18); ctx.arc(cx, cy + r * 0.18, r * 0.42, 0, Math.PI * 2);
      ctx.moveTo(cx - r * 0.4, cy - r * 0.55); ctx.lineTo(cx - r * 0.25, cy - r * 0.8); ctx.lineTo(cx + r * 0.25, cy - r * 0.8); ctx.lineTo(cx + r * 0.4, cy - r * 0.55);
    }
    ctx.stroke(); ctx.restore();
  }
  T.push({
    id: 'highlight', kind: 'image', name: 'Couverture « à la une »', use: 'Les ronds sous la bio d’Instagram : une icône simple, même couleur pour tous.', tags: ['profil'],
    fields: [['icon', 'Icône (bowl, bag, calendar, leaf, star, question, camera)', 'bowl'], ['theme', 'Couleur (olive, charbon, crème, sable)', 'olive']],
    photos: [], fmt: 'story',
    draw(ctx, t, W, H, d) {
      const th = THEME3[String(d.theme || '').toLowerCase()] || THEME3.olive;
      ctx.fillStyle = th[0]; ctx.fillRect(0, 0, W, H);
      icon(ctx, d.icon, W / 2, H / 2, W * 0.17, th[1]);
    },
  });

  const byId = (id) => T.find((x) => x.id === id);
  const defaults = (tpl) => Object.fromEntries(tpl.fields.map(([k, , v]) => [k, v]));
  const PIN = { w: 1000, h: 1500, label: 'Pinterest 2:3', ratio: '2 / 3' };
  const fmtOf = (tpl, fmt) => { const k = fmt || tpl.fmt || 'story'; return k === 'pin' ? PIN : SIZES[k]; };

  function frame(ctx, tpl, t, W, H, d, A) {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    tpl.draw(ctx, tpl.kind === 'image' ? 99 : t, W, H, d, A);
    ctx.restore();
  }

  /* ---------- Lecteurs d'aperçu ---------- */
  const players = new Map();
  let active = null;
  function mount(el, spec) {
    const tpl = byId(spec.tpl);
    const f = fmtOf(tpl, spec.fmt);
    const scale = el.dataset.big ? 0.6 : 0.42;
    const cv = document.createElement('canvas');
    cv.width = Math.round(f.w * scale); cv.height = Math.round(f.h * scale);
    cv.style.aspectRatio = f.ratio;
    el.innerHTML = '';
    el.style.setProperty('--ratio', f.ratio);
    el.appendChild(cv);
    const d = Object.assign(defaults(tpl), spec.data || {});
    const photos = spec.photos && spec.photos.length ? spec.photos : tpl.photos;
    const st = { el, cv, ctx: cv.getContext('2d'), tpl, d, A: [], t: 0, playing: false, raf: 0 };
    players.set(el, st);
    loadAll(photos).then((A) => {
      st.A = A;
      frame(st.ctx, tpl, tpl.kind === 'video' ? poster(tpl) : 99, cv.width, cv.height, d, A);
    });
    if (tpl.kind === 'video') {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'player__play'; b.setAttribute('aria-label', 'Lire l’aperçu');
      b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      b.addEventListener('click', (e) => { e.preventDefault(); toggle(st); });
      el.appendChild(b);
      cv.addEventListener('click', () => toggle(st));
    }
    return st;
  }
  const poster = (tpl) => ({ pov: 1.2, semaine: 0.6, raisons: 1.9, produit: 4.4, compte: 4.6, promo: 2.6, avantapres: 5, avis: 4, unboxing: 3.4, recette: 2.6, quiz: 3, producteur: 4.6, chiffres: 2.4, menuvideo: 5.4 }[tpl.id] || tpl.dur * 0.5);
  function toggle(st) {
    if (st.playing) { stop(st); return; }
    if (active && active !== st) stop(active);
    active = st;
    st.playing = true;
    st.el.classList.add('is-playing');
    st.A.forEach((a) => { if (a && a.tagName === 'VIDEO') { a.currentTime = 0; a.play().catch(() => {}); } });
    const t0 = performance.now();
    const tick = (now) => {
      if (!st.playing) return;
      st.t = (now - t0) / 1000;
      if (st.t >= st.tpl.dur) { stop(st); frame(st.ctx, st.tpl, poster(st.tpl), st.cv.width, st.cv.height, st.d, st.A); return; }
      frame(st.ctx, st.tpl, st.t, st.cv.width, st.cv.height, st.d, st.A);
      st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
  }
  function stop(st) {
    st.playing = false;
    cancelAnimationFrame(st.raf);
    st.el.classList.remove('is-playing');
    st.A.forEach((a) => { if (a && a.tagName === 'VIDEO') a.pause(); });
    if (active === st) active = null;
  }
  function update(el, data, photos) {
    const st = players.get(el);
    if (!st) return;
    Object.assign(st.d, data || {});
    const go = () => { if (!st.playing) frame(st.ctx, st.tpl, st.tpl.kind === 'video' ? poster(st.tpl) : 99, st.cv.width, st.cv.height, st.d, st.A); };
    if (photos) loadAll(photos).then((A) => { st.A = A; go(); }); else go();
  }

  /* ---------- Exports ---------- */
  function save(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function ready() { try { await Promise.all([document.fonts.load('900 60px Inter'), document.fonts.load('800 60px Inter'), document.fonts.load('600 60px Inter'), document.fonts.load('500 60px Fraunces'), document.fonts.load('italic 500 60px Fraunces'), document.fonts.load('600 60px Fraunces')]); } catch (e) { /* polices de secours */ } }

  async function exportImage(spec, name) {
    const tpl = byId(spec.tpl);
    const f = fmtOf(tpl, spec.fmt);
    await ready();
    const cv = document.createElement('canvas'); cv.width = f.w; cv.height = f.h;
    const A = await loadAll(spec.photos && spec.photos.length ? spec.photos : tpl.photos);
    frame(cv.getContext('2d'), tpl, tpl.kind === 'video' ? poster(tpl) : 99, f.w, f.h, Object.assign(defaults(tpl), spec.data || {}), A);
    return new Promise((res) => { try { cv.toBlob((b) => { if (!b) return res(false); save(b, `${name}.png`); res(true); }, 'image/png'); } catch (e) { res(false); } });
  }

  const videoMime = () => {
    if (!window.MediaRecorder) return null;
    return ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || null;
  };
  async function exportVideo(spec, name, onProgress) {
    const tpl = byId(spec.tpl);
    const f = fmtOf(tpl, spec.fmt);
    const mime = videoMime();
    if (!mime || !HTMLCanvasElement.prototype.captureStream) return { ok: false, reason: 'unsupported' };
    await ready();
    const cv = document.createElement('canvas'); cv.width = f.w; cv.height = f.h;
    const ctx = cv.getContext('2d');
    const A = await loadAll(spec.photos && spec.photos.length ? spec.photos : tpl.photos);
    const d = Object.assign(defaults(tpl), spec.data || {});
    frame(ctx, tpl, 0, f.w, f.h, d, A);
    const stream = cv.captureStream(30);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 10_000_000 });
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise((res) => { rec.onstop = res; });
    A.forEach((a) => { if (a && a.tagName === 'VIDEO') { a.currentTime = 0; a.play().catch(() => {}); } });
    rec.start(250);
    const t0 = performance.now();
    await new Promise((res) => {
      const tick = (now) => {
        const t = (now - t0) / 1000;
        frame(ctx, tpl, Math.min(t, tpl.dur), f.w, f.h, d, A);
        if (onProgress) onProgress(Math.min(1, t / tpl.dur));
        if (t >= tpl.dur + 0.15) { res(); return; }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    rec.stop();
    await done;
    stream.getTracks().forEach((tr) => tr.stop());
    const ext = mime.includes('mp4') ? 'mp4' : 'webm';
    save(new Blob(chunks, { type: mime.split(';')[0] }), `${name}.${ext}`);
    return { ok: true, ext };
  }

  return { T, SIZES, byId, defaults, fmtOf, mount, update, exportImage, exportVideo, videoMime, players };
})();
