/* =========================================================
   Cia do Tapete: interações e animações
   ========================================================= */
(() => {
  'use strict';

  const WHATSAPP = '555195934868';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;

  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = hasGsap && !reduce;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!motion) root.classList.add('no-motion');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     WhatsApp + Meta Pixel
     --------------------------------------------------------- */
  // guarda de onde o visitante veio (anúncio, campanha) e manda junto na mensagem
  let origin = '';
  try {
    const q = new URLSearchParams(location.search);
    const found = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid'].forEach((k) => { if (q.get(k)) found[k] = q.get(k); });
    if (Object.keys(found).length) sessionStorage.setItem('cdt-utm', JSON.stringify(found));
    const saved = JSON.parse(sessionStorage.getItem('cdt-utm') || 'null');
    if (saved) {
      const parts = [saved.utm_source, saved.utm_campaign].filter(Boolean);
      if (!parts.length) parts.push(saved.gclid ? 'google ads' : 'facebook ads');
      origin = parts.join(' / ');
    }
  } catch (_) { /* sem storage */ }

  const waUrl = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(origin ? `${text}\n\n(Origem: ${origin})` : text)}`;
  const trackLead = (name) => {
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: name || 'WhatsApp' });
  };

  $$('[data-wa]').forEach((a) => {
    a.href = waUrl(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-lead]');
    if (a) trackLead(a.dataset.lead);
  });

  /* ---------------------------------------------------------
     Capacho do topo: a frase é impressa como numa impressora
     --------------------------------------------------------- */
  const printer = (() => {
    const box = $('[data-print]');
    if (!box) return null;
    const ghost = $('[data-print-layer]', box);
    const mainEl = $('[data-print-main]', ghost);
    const head = $('[data-print-head]', box);
    const BANDS = 5;
    let bands = [];
    let tl = null;

    const subEl = $('[data-print-sub]', ghost);
    const DEFAULT = { main: 'Cia do Tapete', sub: 'sua marca aqui' };

    // a letra mede o espaço real do capacho e diminui até caber (largura e altura)
    const fit = () => {
      const W = box.clientWidth;
      const cs = getComputedStyle(ghost);
      const availW = ghost.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const availH = ghost.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      let fs = W < 700 ? W * 0.2 : Math.min(W * 0.12, 136);
      for (let i = 0; i < 30; i++) {
        box.style.setProperty('--fs', `${fs}px`);
        const tooWide = mainEl.scrollWidth > availW + 1;
        const tooTall = subEl.offsetTop + subEl.offsetHeight - mainEl.offsetTop > availH;
        if (!tooWide && !tooTall) break;
        fs *= 0.93;
        if (fs < 22) break;
      }
    };

    const build = () => {
      bands.forEach((b) => b.remove());
      bands = [];
      for (let i = 0; i < BANDS; i++) {
        const c = ghost.cloneNode(true);
        c.classList.remove('print__layer--ghost');
        c.removeAttribute('data-print-layer');
        $$('[data-print-main],[data-print-sub]', c).forEach((e) => { e.removeAttribute('data-print-main'); e.removeAttribute('data-print-sub'); });
        c.style.clipPath = 'inset(0 100% 100% 0)';
        box.insertBefore(c, head);
        bands.push(c);
      }
    };

    // medidas sem transformações (o capacho pode estar em escala durante a animação)
    const geometry = () => {
      const kids = [...ghost.children];
      const W = box.clientWidth;
      return {
        W, H: box.clientHeight,
        top: Math.min(...kids.map((e) => e.offsetTop)) - 6,
        bottom: Math.max(...kids.map((e) => e.offsetTop + e.offsetHeight)) + 6,
        left: Math.max(0, Math.min(...kids.map((e) => e.offsetLeft)) - 12),
        right: Math.min(W, Math.max(...kids.map((e) => e.offsetLeft + e.offsetWidth)) + 12),
      };
    };

    const print = (dur = 1.9) => {
      fit();
      if (!motion) return;
      tl?.kill();
      build();
      const g = geometry();
      const bandH = (g.bottom - g.top) / BANDS;
      const headH = bandH + 26;
      head.style.height = `${headH}px`;
      const headW = head.offsetWidth;
      tl = gsap.timeline();
      tl.set(head, { opacity: 1 });
      bands.forEach((band, i) => {
        const y0 = g.top + i * bandH - 0.5;
        const y1 = y0 + bandH + 1;
        const rev = i % 2 === 1;
        const o = { p: 0 };
        const upd = () => {
          const x = g.left + (g.right - g.left) * (rev ? 1 - o.p : o.p);
          band.style.clipPath = rev
            ? `inset(${y0}px ${g.W - g.right}px ${g.H - y1}px ${x}px)`
            : `inset(${y0}px ${g.W - x}px ${g.H - y1}px ${g.left}px)`;
          const hx = rev ? x - 3 : x - headW + 3;
          head.style.transform = `translate3d(${hx}px, ${y0 + bandH / 2 - headH / 2}px, 0)`;
        };
        tl.add(() => head.classList.toggle('is-rev', rev));
        tl.to(o, { p: 1, duration: dur / BANDS, ease: 'power1.inOut', onStart: upd, onUpdate: upd });
      });
      tl.to(head, { opacity: 0, duration: 0.35 })
        .add(() => bands.forEach((b) => { b.style.clipPath = 'none'; }), '<');
    };

    const reprint = (main, sub) => {
      const go = () => { mainEl.textContent = main; subEl.textContent = sub; print(1.2); };
      if (!motion || !bands.length) return go();
      tl?.kill();
      gsap.to(head, { opacity: 0, duration: 0.2 });
      gsap.to(bands, { opacity: 0, duration: 0.3, onComplete: go });
    };

    fit();
    window.addEventListener('resize', fit);
    return { print, reprint, DEFAULT };
  })();

  const namer = $('[data-namer]');
  if (namer) {
    const input = $('[data-namer-input]', namer);
    let t;
    let last = '';
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const v = input.value.trim();
        if (v === last) return;
        last = v;
        if (v) printer?.reprint(v, 'seja bem-vindo');
        else printer?.reprint(printer.DEFAULT.main, printer.DEFAULT.sub);
      }, 550);
    });
    namer.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = input.value.trim();
      trackLead(name ? 'Topo: nome digitado' : 'Topo');
      const msg = name
        ? `Olá! Vim pelo site e quero um orçamento de capacho personalizado para a ${name}.`
        : 'Olá! Vim pelo site e quero um orçamento de capacho personalizado.';
      window.open(waUrl(msg), '_blank', 'noopener');
    });
  }

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Rolagem suave (Lenis)
     --------------------------------------------------------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.4, offset: -40 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
    });
  });

  /* ---------------------------------------------------------
     Menu: some ao descer, volta ao subir, troca de cor por seção
     --------------------------------------------------------- */
  const nav = $('[data-nav]');
  const fab = $('.fab');
  const mbar = $('[data-mbar]');
  const themed = $$('[data-theme]');
  let lastY = window.scrollY;
  let ticking = false;

  const updateNav = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 20);
    if (!nav.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > 480);
    lastY = y;

    const probe = nav.offsetHeight / 2;
    let light = false;
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { light = s.dataset.theme === 'light'; break; }
    }
    nav.classList.toggle('is-light', light);
    fab.classList.toggle('is-visible', y > window.innerHeight * 0.8);
    mbar?.classList.toggle('is-visible', y > window.innerHeight * 0.6);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
  }, { passive: true });
  updateNav();

  /* ---------------------------------------------------------
     Menu mobile
     --------------------------------------------------------- */
  const burger = $('[data-burger]');
  const menu = $('[data-menu]');
  function closeMenu() {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    nav.classList.remove('menu-open');
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    lenis?.start();
  }
  burger.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) return closeMenu();
    menu.classList.add('is-open');
    nav.classList.add('menu-open');
    nav.classList.remove('is-hidden');
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
    lenis?.stop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------------------------------------------------------
     Antes e depois
     --------------------------------------------------------- */
  $$('[data-ba]').forEach((ba) => {
    const range = $('.ba__range', ba);
    const set = (v) => ba.style.setProperty('--pos', `${v}%`);
    let touched = false;
    range.addEventListener('input', () => { touched = true; set(range.value); });

    if (motion) {
      const o = { v: 50 };
      ScrollTrigger.create({
        trigger: ba, start: 'top 75%', once: true,
        onEnter: () => {
          gsap.timeline({ delay: 0.4, onUpdate: () => { if (!touched) { set(o.v); range.value = o.v; } } })
            .to(o, { v: 22, duration: 0.9, ease: 'power2.inOut' })
            .to(o, { v: 76, duration: 1.1, ease: 'power2.inOut' })
            .to(o, { v: 50, duration: 0.8, ease: 'power2.inOut' });
        },
      });
    }
  });

  /* ---------------------------------------------------------
     Carrossel de produtos: automático, setas, arrastar
     --------------------------------------------------------- */
  const carousel = $('[data-carousel]');
  if (carousel) {
    const viewport = $('.carousel__viewport', carousel);
    const track = $('[data-car-track]', carousel);
    const cards = $$('.pcard', track);
    const dotsWrap = $('[data-car-dots]', carousel);
    const DELAY = 5;
    let idx = 0;
    let maxIdx = 0;
    let step = 0;
    let x = 0;
    let timer = null;
    let inView = false;
    let hovering = false;

    const setX = (val, animate = true) => {
      x = val;
      if (hasGsap) gsap.to(track, { x: val, duration: animate && !reduce ? 0.9 : 0, ease: 'expo.out', overwrite: true });
      else track.style.transform = `translate3d(${val}px,0,0)`;
    };

    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      step = cards[0].offsetWidth + gap;
      const perView = Math.max(1, Math.floor((viewport.clientWidth + gap) / step + 0.02));
      maxIdx = Math.max(0, cards.length - perView);
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIdx; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Ir para o grupo ${i + 1}`);
        b.innerHTML = '<i></i>';
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      }
      idx = Math.min(idx, maxIdx);
      goTo(idx, false);
    };

    const runTimer = () => {
      timer?.kill();
      const dot = dotsWrap.children[idx];
      if (!dot || !hasGsap) return;
      const fill = $('i', dot);
      timer = gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: DELAY, ease: 'none', onComplete: () => goTo(idx + 1) });
      if (!motion || !inView || hovering) timer.pause();
    };

    function goTo(i, animate = true) {
      idx = i > maxIdx ? 0 : i < 0 ? maxIdx : i;
      [...dotsWrap.children].forEach((d, n) => {
        d.classList.toggle('is-on', n === idx);
        if (hasGsap && n !== idx) gsap.set($('i', d), { scaleX: 0 });
      });
      setX(-idx * step, animate);
      runTimer();
    }

    $('[data-car-next]', carousel).addEventListener('click', () => goTo(idx + 1));
    $('[data-car-prev]', carousel).addEventListener('click', () => goTo(idx - 1));

    carousel.addEventListener('pointerenter', () => { hovering = true; timer?.pause(); });
    carousel.addEventListener('pointerleave', () => { hovering = false; if (inView && motion) timer?.resume(); });

    if (hasGsap) {
      ScrollTrigger.create({
        trigger: carousel, start: 'top 85%', end: 'bottom 15%',
        onToggle: (s) => { inView = s.isActive; if (inView && !hovering && motion) timer?.resume(); else timer?.pause(); },
      });
    }

    // arrastar com o dedo ou o mouse
    let startX = 0;
    let startTx = 0;
    let dragging = false;
    let moved = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragging = true; moved = 0; startX = e.clientX; startTx = x;
      track.classList.add('is-dragging');
      timer?.pause();
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) {
        if (hasGsap) gsap.set(track, { x: startTx + dx });
        else track.style.transform = `translate3d(${startTx + dx}px,0,0)`;
      }
    });
    window.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      const dx = e.clientX - startX;
      if (dx < -50) goTo(idx + 1);
      else if (dx > 50) goTo(idx - 1);
      else goTo(idx);
    });
    track.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', (e) => e.preventDefault());

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(measure, 150); });
    measure();
  }

  /* ---------------------------------------------------------
     Simulador
     --------------------------------------------------------- */
  const builder = $('[data-builder]');
  if (builder) {
    const mat = $('[data-mat]');
    const face = $('.mat__face', mat);
    const tText = $('[data-mat-text]');
    const tSub = $('[data-mat-sub]');
    const logo = $('[data-mat-logo]');
    const inText = $('[data-in-text]');
    const inSub = $('[data-in-sub]');
    const inLogo = $('[data-in-logo]');
    const logoName = $('[data-logo-name]');
    const cta = $('[data-build-cta]');
    const state = {};

    const readGroup = (g) => {
      const on = $(`[data-group="${g}"] .is-on`, builder);
      return { v: on.dataset.v, name: on.dataset.name, s: on.dataset.s };
    };
    const pulse = () => {
      if (motion) gsap.fromTo(face, { scale: 0.975 }, { scale: 1, duration: 0.9, ease: 'elastic.out(1, .45)', overwrite: true });
    };

    const render = () => {
      state.text = inText.value.trim();
      state.sub = inSub.value.trim();
      state.mat = readGroup('mat');
      state.art = readGroup('art');
      state.font = readGroup('font');
      state.size = readGroup('size');

      tText.textContent = state.text || (state.logo ? '' : 'Sua Marca');
      tText.hidden = !tText.textContent;
      tSub.textContent = state.sub || 'seja bem-vindo';
      mat.style.setProperty('--mat', state.mat.v);
      mat.style.setProperty('--art', state.art.v);
      mat.style.setProperty('--ratio', state.size.v);
      mat.style.setProperty('--scale', state.size.s);
      mat.dataset.font = state.font.v;

      const lines = [
        'Olá! Montei meu capacho no simulador do site:',
        `• Marca: ${state.text || 'vou enviar'}`,
        state.sub ? `• Frase: ${state.sub}` : null,
        `• Cor do capacho: ${state.mat.name}`,
        `• Cor da arte: ${state.art.name}`,
        `• Estilo da letra: ${state.font.name}`,
        `• Tamanho: ${state.size.name}`,
        state.logo ? '• Logo: vou anexar aqui na conversa' : null,
        '',
        'Pode me passar um orçamento?',
      ].filter((l) => l !== null);
      cta.href = waUrl(lines.join('\n'));
      cta.target = '_blank';
      cta.rel = 'noopener';
    };

    $$('[data-group]', builder).forEach((group) => {
      $$('button', group).forEach((b) => b.setAttribute('aria-pressed', b.classList.contains('is-on')));
      group.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        $$('button', group).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
        render();
        pulse();
      });
    });
    inText.addEventListener('input', render);
    inSub.addEventListener('input', render);
    inLogo.addEventListener('change', () => {
      const file = inLogo.files && inLogo.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        logo.src = reader.result;
        logo.hidden = false;
        state.logo = true;
        logoName.textContent = file.name;
        render();
        pulse();
      };
      reader.readAsDataURL(file);
    });
    render();

    const stage = $('[data-stage]');
    if (motion && finePointer) {
      stage.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(mat, { '--ry': `${px * 14}deg`, '--rx': `${50 - py * 12}deg`, '--rz': `${-5 + px * 4}deg`, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
      });
      stage.addEventListener('pointerleave', () => {
        gsap.to(mat, { '--ry': '0deg', '--rx': '50deg', '--rz': '-5deg', duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
      });
    }
  }

  /* ---------------------------------------------------------
     Diferenciais: técnica (troca sozinha) e destaque do mouse
     --------------------------------------------------------- */
  const tech = $('[data-tech]');
  if (tech) {
    const tabs = $$('[data-tech-tab]', tech);
    const desc = $('[data-tech-desc]', tech);
    const TEXTS = [
      'Ideal para logos com contorno nítido e cores sólidas.',
      'Ideal para fotos, degradês e detalhes finos, com cores vivas.',
    ];
    let cur = 0;
    let auto = null;
    const show = (i) => {
      cur = i;
      tabs.forEach((t, n) => { t.classList.toggle('is-on', n === i); t.setAttribute('aria-selected', n === i); });
      if (motion) {
        gsap.timeline()
          .to(desc, { opacity: 0, y: -6, duration: 0.2 })
          .add(() => { desc.textContent = TEXTS[i]; })
          .fromTo(desc, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
      } else desc.textContent = TEXTS[i];
    };
    tabs.forEach((t, n) => t.addEventListener('click', () => { clearInterval(auto); show(n); }));
    if (motion) {
      ScrollTrigger.create({
        trigger: tech, start: 'top 90%', end: 'bottom 10%',
        onToggle: (s) => {
          clearInterval(auto);
          if (s.isActive) auto = setInterval(() => show((cur + 1) % TEXTS.length), 3200);
        },
      });
    }
  }

  if (finePointer) {
    $$('[data-tile]').forEach((tile) => {
      tile.addEventListener('pointermove', (e) => {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
        tile.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------------------------------------------------------
     Perguntas frequentes
     --------------------------------------------------------- */
  $$('.acc__item').forEach((item) => {
    const summary = $('summary', item);
    const body = $('.acc__body', item);
    summary.addEventListener('click', (e) => {
      if (!motion) return;
      e.preventDefault();
      if (item.open) {
        gsap.to(body, {
          height: 0, duration: 0.45, ease: 'power3.inOut',
          onComplete: () => { item.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); },
        });
      } else {
        $$('.acc__item[open]').forEach((other) => { if (other !== item) $('summary', other).click(); });
        item.open = true;
        gsap.fromTo(body, { height: 0 }, {
          height: 'auto', duration: 0.55, ease: 'power3.out',
          onComplete: () => { gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); },
        });
      }
    });
  });

  /* =========================================================
     Daqui pra baixo: só animação
     ========================================================= */
  if (!motion) {
    const steps = $('[data-steps]');
    if (steps) { steps.style.setProperty('--p', 1); $$('.step', steps).forEach((s) => s.classList.add('is-active')); }
    const bar = $('[data-meter-bar]');
    if (bar) bar.style.transform = 'none';
    const num = $('[data-meter-num]');
    if (num) num.textContent = '80';
    $$('[data-measure-w]').forEach((el) => (el.textContent = '120'));
    $$('[data-measure-h]').forEach((el) => (el.textContent = '60'));
    return;
  }

  if (window.SplitText) gsap.registerPlugin(SplitText);
  const hasSplit = !!window.SplitText;
  const EASE = 'expo.out';

  /* ---------- botões magnéticos ---------- */
  if (finePointer) {
    $$('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.2);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- galeria infinita do topo ---------- */
  const gTrack = $('[data-gallery-track]');
  let galleryLoop = null;
  if (gTrack) {
    gTrack.innerHTML += gTrack.innerHTML;
    $$('img', gTrack).forEach((img, i) => { if (i >= gTrack.children.length / 2) img.alt = ''; });
    galleryLoop = gsap.to(gTrack, { xPercent: -50, duration: 60, ease: 'none', repeat: -1 });
    const gallery = $('[data-gallery]');
    gallery.addEventListener('pointerenter', () => gsap.to(galleryLoop, { timeScale: 0.2, duration: 0.8 }));
    gallery.addEventListener('pointerleave', () => gsap.to(galleryLoop, { timeScale: 1, duration: 0.8 }));
  }

  /* ---------- entrada do topo ---------- */
  const playHero = () => {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.fromTo('[data-hero]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0)
      .fromTo('.doormat', { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.4 }, 0.05)
      .add(() => printer?.print(1.9), 0.7)
      .fromTo('.gallery', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 1.6 }, 0.6)
      .from('.gallery__item', { scale: 0.86, duration: 1.6, stagger: 0.05 }, 0.6)
      .from('[data-chip]', { scale: 0.6, opacity: 0, y: 20, duration: 1, stagger: 0.15, ease: 'back.out(1.7)' }, 1.4)
      .add(() => {
        $$('[data-chip]').forEach((c, i) => gsap.to(c, { y: i ? 8 : -8, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      });
    return tl;
  };

  const fontsReady = Promise.race([document.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]);
  fontsReady.then(() => requestAnimationFrame(() => { playHero(); initScroll(); }));

  /* ---------- animações de rolagem ---------- */
  function initScroll() {
    const hero = $('.hero');

    // a galeria acelera com a velocidade da rolagem
    if (galleryLoop) {
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom top',
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(1, 8, 1 + Math.abs(self.getVelocity()) / 250);
          gsap.to(galleryLoop, { timeScale: boost, duration: 0.2, overwrite: true });
          gsap.to(galleryLoop, { timeScale: 1, duration: 1.4, delay: 0.25, ease: 'power2.out', overwrite: false });
        },
      });
    }
    gsap.to('.doormat', { scale: 0.94, yPercent: 8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '70% top', scrub: true } });

    // faixa vermelha: loop que inverte e acelera com a rolagem
    const mTrack = $('[data-marquee]');
    if (mTrack) {
      mTrack.innerHTML += mTrack.innerHTML;
      const loop = gsap.to(mTrack, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onUpdate: (self) => {
          const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 400);
          gsap.to(loop, { timeScale: self.direction * boost, duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.2, ease: 'power2.out', overwrite: false });
        },
      });
    }

    // cabeçalhos das seções
    $$('[data-head]').forEach((head) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 85%', once: true }, defaults: { ease: EASE } });
      const kicker = $('.kicker', head);
      const h2 = $('.h2', head);
      const sub = $('.sub', head);
      if (kicker) tl.from(kicker, { y: 16, opacity: 0, duration: 0.9 }, 0);
      if (h2) {
        if (hasSplit) {
          const split = SplitText.create(h2, { type: 'lines,words', mask: 'lines' });
          tl.from(split.words, { yPercent: 110, duration: 1.2, stagger: 0.025 }, 0.05);
        } else tl.from(h2, { y: 40, opacity: 0, duration: 1.1 }, 0.05);
      }
      if (sub) tl.from(sub, { y: 20, opacity: 0, filter: 'blur(6px)', duration: 1 }, 0.35);
    });

    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });

    // produtos entram em cascata
    gsap.from('.pcard', { y: 70, opacity: 0, duration: 1.2, stagger: 0.1, ease: EASE, scrollTrigger: { trigger: '.carousel', start: 'top 85%', once: true } });

    // segmentos
    gsap.from('.seg-card', { y: 50, opacity: 0, duration: 1, stagger: 0.07, ease: EASE, scrollTrigger: { trigger: '.seg-grid', start: 'top 85%', once: true } });

    // simulador
    gsap.from('.stage', { clipPath: 'inset(10% 10% 10% 10% round 28px)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: '.build__grid', start: 'top 80%', once: true } });
    gsap.from('.mat', { yPercent: 30, opacity: 0, duration: 1.5, ease: EASE, delay: 0.3, scrollTrigger: { trigger: '.build__grid', start: 'top 80%', once: true } });
    gsap.from('.panel > *', { y: 22, opacity: 0, duration: 0.9, stagger: 0.04, ease: EASE, scrollTrigger: { trigger: '.panel', start: 'top 85%', once: true } });

    // etapas: a linha vermelha acende cada passo
    const steps = $('[data-steps]');
    if (steps) {
      const items = $$('.step', steps);
      gsap.from(items, { y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: EASE, scrollTrigger: { trigger: steps, start: 'top 85%', once: true } });
      ScrollTrigger.create({
        trigger: steps, start: 'top 70%', end: 'bottom 55%', scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          steps.style.setProperty('--p', p.toFixed(4));
          items.forEach((s, i) => s.classList.toggle('is-active', p >= (i / (items.length - 1)) * 0.98));
        },
      });
    }

    // empresa: texto acende palavra por palavra
    const manifesto = $('[data-manifesto]');
    if (manifesto && hasSplit) {
      const split = SplitText.create(manifesto, { type: 'words', wordsClass: 'word' });
      gsap.fromTo(split.words, { opacity: 0.12 }, {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 50%', scrub: true },
      });
    }
    $$('.reveal-img').forEach((fig) => {
      gsap.fromTo(fig, { clipPath: 'inset(16% 10% 0% 10% round 28px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none',
        scrollTrigger: { trigger: fig, start: 'top 95%', end: 'top 40%', scrub: true },
      });
    });
    $$('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-count]').forEach((el) => {
      const o = { v: +(el.dataset.from || 0) };
      el.textContent = o.v;
      gsap.to(o, {
        v: +el.dataset.count, duration: 2, ease: 'power3.out',
        onUpdate: () => (el.textContent = Math.round(o.v)),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });
    gsap.from('.stat', { y: 30, opacity: 0, duration: 1, stagger: 0.08, ease: EASE, scrollTrigger: { trigger: '.stats', start: 'top 85%', once: true } });

    // diferenciais
    gsap.from('[data-tile]', { y: 70, opacity: 0, duration: 1.2, stagger: 0.1, ease: EASE, scrollTrigger: { trigger: '.bento', start: 'top 85%', once: true } });

    const meter = $('[data-meter]');
    if (meter) {
      const num = $('[data-meter-num]', meter);
      const o = { v: 0 };
      gsap.timeline({ scrollTrigger: { trigger: meter, start: 'top 85%', once: true } })
        .to(o, { v: 80, duration: 2, ease: 'power3.out', onUpdate: () => (num.textContent = Math.round(o.v)) }, 0)
        .to('[data-meter-bar]', { scaleX: 1, duration: 2, ease: 'power3.out' }, 0);
    }

    const measureSvg = $('[data-measure]');
    if (measureSvg) {
      const rect = $('.measure__mat', measureSvg);
      const len = rect.getTotalLength();
      const w = $('[data-measure-w]', measureSvg);
      const h = $('[data-measure-h]', measureSvg);
      const o = { w: 0, h: 0 };
      gsap.set(rect, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: measureSvg, start: 'top 85%', once: true } })
        .to(rect, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' })
        .to(rect, { fillOpacity: 1, duration: 0.6 }, '-=0.3')
        .from('.measure__line', { opacity: 0, duration: 0.5, stagger: 0.15 }, 0.6)
        .to(o, { w: 120, h: 60, duration: 1.4, ease: 'power3.out', onUpdate: () => { w.textContent = Math.round(o.w); h.textContent = Math.round(o.h); } }, 0.6);
    }

    const chat = $('[data-chat]');
    if (chat) {
      const [me, typing, them] = $$('.bubble', chat);
      gsap.set([me, typing, them], { opacity: 0, y: 12, scale: 0.96 });
      gsap.timeline({ scrollTrigger: { trigger: chat, start: 'top 85%', once: true } })
        .to(me, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, 0.3)
        .to(typing, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 1.1)
        .to(typing, { opacity: 0, height: 0, padding: 0, margin: 0, duration: 0.3 }, 2.6)
        .to(them, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, 2.7);
    }

    // perguntas
    gsap.from('.acc__item', { y: 24, opacity: 0, duration: 0.9, stagger: 0.07, ease: EASE, scrollTrigger: { trigger: '.acc', start: 'top 88%', once: true } });

    // CTA final
    const final = $('[data-final]');
    if (final) {
      gsap.timeline({ scrollTrigger: { trigger: final, start: 'top 80%', once: true }, defaults: { ease: EASE } })
        .from(final, { clipPath: 'inset(8% 6% 8% 6% round 36px)', duration: 1.4 }, 0)
        .from('.final__text > *', { y: 30, opacity: 0, duration: 1, stagger: 0.1 }, 0.3)
        .from('[data-final-img]', { y: 120, rotate: 16, opacity: 0, duration: 1.5 }, 0.3);
    }

    ScrollTrigger.refresh();
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
