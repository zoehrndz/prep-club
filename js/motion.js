/* =========================================================
   PREP CLUB — Motion design & interactions
   Amélioration progressive : sans JS ou avec « réduire les animations »,
   tout le contenu reste visible et utilisable.
   ========================================================= */
'use strict';

const Motion = (() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  if (!reduce) root.classList.add('motion-ok');
  if (fine) root.classList.add('pointer-fine');

  const REVEAL = '.section-head, .card, .box-card, .way, .producer, .how__step, .tier, .pillar, .kpi, .panel, .planner-preview, .season-img, .co-step, .newsletter--card, .empty-state, .product__media, .acc, .steps-list li, .order-row';
  const SPLIT = '[data-split], .page-hero h1, .section-head h2, .product h1, .confirm-hero h1';
  const TILT = '.card, .box-card, .producer, .tilt, .tier';

  /* ---------- Apparition au scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      if (en.target.dataset.count) countUp(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  function reveal(el, instant) {
    if (el.classList.contains('rv')) return;
    el.classList.add('rv');
    const sibs = [...el.parentElement.children].filter((c) => c.matches(REVEAL));
    el.style.setProperty('--i', Math.min(Math.max(sibs.indexOf(el), 0), 6));
    if (instant || reduce) el.classList.add('in');
    else io.observe(el);
  }
  function applyReveal(scope, instant) {
    if (scope.matches && scope.matches(REVEAL)) reveal(scope, instant);
    if (scope.querySelectorAll) scope.querySelectorAll(REVEAL).forEach((el) => reveal(el, instant));
  }

  /* ---------- Titres animés mot par mot ---------- */
  function split(el, instant) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    let i = 0;
    const wrap = (node) => {
      const w = document.createElement('span');
      w.className = 'w';
      node.replaceWith(w);
      w.appendChild(node);
      node.style.setProperty('--wi', i++);
    };
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--wi', i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.classList.contains('rotator')) wrap(n);
          else walk(n);
        }
      });
    };
    walk(el);
    el.classList.add('is-split');
    if (instant || reduce) el.classList.add('in');
    else io.observe(el);
  }

  /* ---------- Mot qui change dans le hero ---------- */
  function rotator(el) {
    if (el.dataset.rotating) return;
    el.dataset.rotating = '1';
    const words = el.dataset.words.split('|');
    let k = 0;
    el.innerHTML = `<span class="rotator__word">${words[0]}</span>`;
    if (reduce) return;
    const t = setInterval(() => {
      if (!document.body.contains(el)) { clearInterval(t); return; }
      k = (k + 1) % words.length;
      const old = el.querySelector('.rotator__word:not(.out)');
      if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 550); }
      const nw = document.createElement('span');
      nw.className = 'rotator__word enter';
      nw.textContent = words[k];
      el.appendChild(nw);
    }, 2400);
  }

  /* ---------- Compteurs ---------- */
  function countUp(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suffix; return; }
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Carrousels (flèches + glisser) ---------- */
  function setupRails(scope) {
    $$('[data-rail]', scope).forEach((btn) => {
      btn.onclick = () => {
        const rail = btn.closest('section').querySelector('.rail');
        rail.scrollBy({ left: Number(btn.dataset.rail) * rail.clientWidth * 0.75, behavior: reduce ? 'auto' : 'smooth' });
      };
    });
    $$('.rail[data-drag]', scope).forEach((rail) => {
      let down = false; let startX = 0; let startLeft = 0; let moved = false;
      rail.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse') return;
        down = true; moved = false; startX = e.clientX; startLeft = rail.scrollLeft;
      });
      window.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 5) { moved = true; rail.classList.add('dragging'); }
        rail.scrollLeft = startLeft - dx;
      });
      window.addEventListener('pointerup', () => { down = false; setTimeout(() => rail.classList.remove('dragging'), 0); });
      rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    });
  }

  /* ---------- Parallaxe du hero ---------- */
  function setupParallax(scope) {
    const wrap = $('[data-parallax]', scope);
    if (!wrap || reduce || !fine) return;
    const zone = wrap.closest('section');
    zone.addEventListener('pointermove', (e) => {
      const r = zone.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      $$('[data-depth]', wrap).forEach((el) => {
        const d = Number(el.dataset.depth);
        el.style.translate = `${-x * d * 28}px ${-y * d * 28}px`;
      });
    });
    zone.addEventListener('pointerleave', () => $$('[data-depth]', wrap).forEach((el) => { el.style.translate = ''; }));
  }

  /* ---------- Zoom de la photo produit ---------- */
  function setupZoom(scope) {
    if (!fine) return;
    $$('.product__media', scope).forEach((m) => {
      const img = m.querySelector('img');
      if (!img) return;
      m.addEventListener('pointerenter', () => m.classList.add('zoom'));
      m.addEventListener('pointerleave', () => m.classList.remove('zoom'));
      m.addEventListener('pointermove', (e) => {
        const r = m.getBoundingClientRect();
        img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      });
    });
  }

  /* ---------- Effets liés au scroll ---------- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  let lastY = window.scrollY;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.scale = `${max > 0 ? y / max : 0} 1`;
    const header = $('#header');
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > 320 && y > lastY && !$('#nav').classList.contains('open'));
    lastY = y;
    if (reduce) return;
    $$('[data-speed]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const c = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translateY(${c * Number(el.dataset.speed)}px)`;
    });
    $$('[data-speed-x]').forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      el.style.translate = `${(r.top - vh) * Number(el.dataset.speedX)}px 0`;
    });
    $$('[data-manifesto]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      const words = el.children;
      const lit = Math.round(p * words.length);
      for (let k = 0; k < words.length; k++) words[k].classList.toggle('lit', k < lit);
    });
  }
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- Curseur personnalisé ---------- */
  if (fine && !reduce) {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    const label = document.createElement('div');
    dot.className = 'cursor cursor-dot';
    ring.className = 'cursor cursor-ring';
    label.className = 'cursor cursor-label';
    document.body.append(dot, ring, label);
    let mx = -100; let my = -100; let rx = -100; let ry = -100;
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.translate = `${mx}px ${my}px`;
    });
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.translate = `${rx}px ${ry}px`;
      label.style.translate = `${rx}px ${ry}px`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', (e) => {
      const lab = e.target.closest('[data-cursor], .card .media, .box-card .media, .plate');
      const hov = e.target.closest('a, button, input, select, textarea, label, summary');
      label.textContent = lab ? (lab.dataset.cursor || 'Voir') : '';
      label.classList.toggle('on', !!lab);
      ring.classList.toggle('hover', !!hov && !lab);
      ring.classList.toggle('off', !!lab);
    });
    document.addEventListener('pointerdown', () => ring.classList.add('down'));
    document.addEventListener('pointerup', () => ring.classList.remove('down'));
    document.documentElement.addEventListener('pointerleave', () => { [dot, ring, label].forEach((c) => c.classList.add('gone')); });
    document.documentElement.addEventListener('pointerenter', () => { [dot, ring, label].forEach((c) => c.classList.remove('gone')); });
  }

  /* ---------- Inclinaison 3D & boutons magnétiques ---------- */
  if (fine && !reduce) {
    let tilted = null;
    let magnet = null;
    document.addEventListener('pointermove', (e) => {
      const t = e.target.closest(TILT);
      if (tilted && tilted !== t) { tilted.style.removeProperty('--rx'); tilted.style.removeProperty('--ry'); }
      tilted = t;
      if (t) {
        const r = t.getBoundingClientRect();
        t.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 7}deg`);
        t.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 7}deg`);
      }
      const m = e.target.closest('.magnetic');
      if (magnet && magnet !== m) magnet.style.translate = '';
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
      }
    });
  }

  /* ---------- Onde au clic sur les boutons ---------- */
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.btn');
    if (!b || reduce) return;
    const r = b.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    b.appendChild(s);
    setTimeout(() => s.remove(), 700);
  });

  /* ---------- Le produit « vole » jusqu'au panier ---------- */
  document.addEventListener('click', (e) => {
    const trg = e.target.closest('[data-add], [data-add-discovery], [data-formula-add], #pAdd, #boxAdd, #bAdd');
    if (!trg) return;
    if (trg.classList.contains('add-btn')) {
      trg.classList.add('done');
      setTimeout(() => trg.classList.remove('done'), 1100);
    }
    const basket = $('#basketBtn');
    const bump = () => {
      basket.classList.remove('bump');
      void basket.offsetWidth;
      basket.classList.add('bump');
    };
    const src = (trg.closest('.card, .box-card, .float-card') || (trg.closest('.product') && $('.product__media', trg.closest('.product'))) || document).querySelector('img');
    if (reduce || !src) { bump(); return; }
    const a = src.getBoundingClientRect();
    const b = basket.getBoundingClientRect();
    if (!a.width) { bump(); return; }
    const fly = src.cloneNode();
    fly.className = 'fly';
    fly.removeAttribute('loading');
    const size = Math.min(a.width, a.height, 160);
    fly.style.cssText = `width:${size}px;height:${size}px;left:${a.left + a.width / 2 - size / 2}px;top:${a.top + a.height / 2 - size / 2}px`;
    document.body.appendChild(fly);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = fly.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 140}px) scale(.6) rotate(-12deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(10deg)`, opacity: 0.4 },
    ], { duration: 850, easing: 'cubic-bezier(.45,.05,.35,1)' });
    anim.onfinish = () => { fly.remove(); bump(); };
  }, true);

  /* ---------- Rideau de transition & intro ---------- */
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = `<div class="curtain__logo">${'PREP'.split('').map((c, k) => `<span style="--k:${k}">${c}</span>`).join('')}<em>${'CLUB'.split('').map((c, k) => `<span style="--k:${k + 4}">${c}</span>`).join('')}</em></div><div class="curtain__line"></div>`;
  document.body.appendChild(curtain);
  let busy = false;
  function transition(fn) {
    if (reduce || busy) { fn(); return; }
    busy = true;
    curtain.className = 'curtain cover';
    setTimeout(() => {
      fn();
      requestAnimationFrame(() => {
        curtain.className = 'curtain uncover';
        setTimeout(() => { curtain.className = 'curtain'; busy = false; }, 600);
      });
    }, 340);
  }
  let seen = false;
  try { seen = sessionStorage.getItem('pc-intro') === '1'; sessionStorage.setItem('pc-intro', '1'); } catch (e) { seen = false; }
  if (!reduce && !seen) {
    curtain.className = 'curtain intro';
    setTimeout(() => { curtain.className = 'curtain uncover'; }, 1300);
    setTimeout(() => { curtain.className = 'curtain'; }, 1950);
  }

  /* ---------- Menu mobile : apparition en cascade ---------- */
  $$('#nav a').forEach((a, k) => a.style.setProperty('--n', k));

  /* ---------- Contenus ajoutés dynamiquement (filtres, avis…) ---------- */
  new MutationObserver((muts) => {
    muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) applyReveal(n, false); }));
  }).observe($('#app'), { childList: true, subtree: true });

  /* ---------- Appelé par le routeur après chaque rendu ---------- */
  function onRoute(same) {
    const app = $('#app');
    if (!same && !reduce) {
      app.classList.remove('page-in');
      void app.offsetWidth;
      app.classList.add('page-in');
    }
    $$('.rotator', app).forEach(rotator);
    $$(SPLIT, app).forEach((el) => split(el, same));
    applyReveal(app, same);
    $$('[data-count]', app).forEach((el) => { if (same) countUp(el); else io.observe(el); });
    setupRails(app);
    setupParallax(app);
    setupZoom(app);
    onScroll();
  }

  return { onRoute, transition };
})();
