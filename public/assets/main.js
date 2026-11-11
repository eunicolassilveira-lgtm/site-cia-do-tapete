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
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { lead_source: name || 'WhatsApp' });
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
      if (!motion) return null;
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
        .add(() => {
          // terminou: fica uma camada só, inteira; as faixas extras saem (eram cópias e pesavam a cada quadro)
          bands.slice(1).forEach((b) => b.remove());
          bands = bands.slice(0, 1);
          bands[0].style.clipPath = 'none';
        }, '<');
      return tl;
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
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
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

  /* ---------------------------------------------------------
     Barra de rolagem própria (da Akari): fina, sobreposta, aparece ao rolar; dá para arrastar
     --------------------------------------------------------- */
  (() => {
    const el = $('[data-barra]');
    if (!el || !finePointer) { el?.remove(); return; }
    const pega = $('i', el);
    let some = 0, arrastando = false, y0 = 0, s0 = 0;
    const mede = () => {
      const vh = window.innerHeight, total = document.documentElement.scrollHeight;
      const h = Math.max(36, (vh / total) * (vh - 16));
      const y = 8 + (window.scrollY / Math.max(1, total - vh)) * (vh - 16 - h);
      pega.style.height = `${h}px`;
      pega.style.transform = `translate3d(0, ${y}px, 0)`;
      return { vh, total, h };
    };
    const mostra = () => {
      el.classList.add('is-on');
      clearTimeout(some);
      some = setTimeout(() => { if (!arrastando && !el.matches(':hover')) el.classList.remove('is-on'); }, 1100);
    };
    window.addEventListener('scroll', () => { mede(); mostra(); }, { passive: true });
    window.addEventListener('resize', mede, { passive: true });
    window.addEventListener('pointermove', (e) => { if (e.clientX > window.innerWidth - 22) mostra(); }, { passive: true });
    pega.addEventListener('pointerdown', (e) => {
      arrastando = true; y0 = e.clientY; s0 = window.scrollY;
      pega.setPointerCapture(e.pointerId);
      el.classList.add('is-arrastando');
    });
    pega.addEventListener('pointermove', (e) => {
      if (!arrastando) return;
      const { vh, total, h } = mede();
      const y = s0 + ((e.clientY - y0) / (vh - 16 - h)) * (total - vh);
      if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
    });
    const solta = () => { arrastando = false; el.classList.remove('is-arrastando'); mostra(); };
    pega.addEventListener('pointerup', solta);
    pega.addEventListener('pointercancel', solta);
    if (document.readyState === 'complete') mede(); else window.addEventListener('load', mede);
    mede();
  })();

  /* ---------------------------------------------------------
     Toque: sem hover, o elemento tocado acende por 600 ms (botão, seta)
     --------------------------------------------------------- */
  if (window.matchMedia('(hover: none)').matches) {
    document.addEventListener('touchstart', (e) => {
      const alvo = e.target.closest('.btn, .seta, .busca__ir, .link-pedir');
      if (!alvo) return;
      alvo.classList.add('is-tocado');
      setTimeout(() => alvo.classList.remove('is-tocado'), 600);
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Busca por CEP (da Akari): máscara 00000-000, erro (sacode), buscando (o vermelho pulsa no botão) e achado.
     A Cia entrega em todo o Brasil: qualquer CEP com 8 números mostra as opções, e cada uma abre o WhatsApp
     com o produto e o CEP na mensagem.
     --------------------------------------------------------- */
  (() => {
    const form = $('[data-busca]');
    if (!form) return;
    const campo = $('input', form);
    const aviso = $('.busca__aviso', form);
    const botao = $('.busca__ir span', form);
    const lista = $('[data-locais]');
    campo.addEventListener('input', () => {
      const n = campo.value.replace(/\D/g, '').slice(0, 8);
      campo.value = n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n;
      if (form.classList.contains('is-erro') && n.length === 8) { form.classList.remove('is-erro'); aviso.textContent = ''; }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = campo.value.replace(/\D/g, '');
      form.classList.remove('is-erro');
      if (n.length !== 8) {
        void form.offsetWidth;
        form.classList.add('is-erro');
        aviso.textContent = 'Digite os 8 números do CEP.';
        lista.hidden = true;
        campo.focus();
        return;
      }
      form.classList.add('is-buscando');
      botao.textContent = '...';
      aviso.textContent = '';
      setTimeout(() => {
        form.classList.remove('is-buscando');
        botao.textContent = 'Ver';
        aviso.textContent = `Atendemos o CEP ${campo.value}. Escolha o que você precisa:`;
        $$('[data-wa-cep]', lista).forEach((a) => {
          a.href = waUrl(`Olá! Vim pelo site e quero um orçamento de ${a.dataset.waCep}. Meu CEP é ${campo.value}.`);
          a.target = '_blank';
          a.rel = 'noopener';
        });
        lista.hidden = false;
        if (hasGsap) gsap.fromTo(lista.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 });
      }, 900);
    });
  })();

  /* ---------------------------------------------------------
     Feedbacks: o card abre o print original da conversa numa janela por cima da página
     --------------------------------------------------------- */
  (() => {
    const modal = $('[data-fb-modal]');
    if (!modal || typeof modal.showModal !== 'function') return;
    const img = $('[data-fb-img]', modal);
    const fecha = () => { modal.close(); };
    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-conversa]');
      if (!card) return;
      img.src = card.dataset.conversa;
      modal.showModal();
      lenis?.stop();
    });
    modal.addEventListener('close', () => lenis?.start());
    $('[data-fb-fecha]', modal).addEventListener('click', fecha);
    modal.addEventListener('click', (e) => { if (e.target === modal) fecha(); });
  })();

  /* ---------------------------------------------------------
     Tinta e máscara da trama: baixam depois da primeira tela; html.tinta liga as texturas no CSS
     (a impressão do topo espera elas chegarem, no máximo 3 s)
     --------------------------------------------------------- */
  const tintaPronta = new Promise((ok) => {
    let falta = 2;
    const fim = () => { root.classList.add('tinta'); ok(); };
    const um = () => { if (--falta === 0) fim(); };
    // a máscara do CSS é buscada em modo CORS: o pré-carregamento usa o mesmo modo para aproveitar o mesmo arquivo (sem baixar duas vezes)
    [['assets/vinyl-ink.webp', false], ['assets/vinyl-mask.webp', true]].forEach(([src, cors]) => { const im = new Image(); if (cors) im.crossOrigin = 'anonymous'; im.onload = im.onerror = um; im.src = src; });
    setTimeout(fim, 3000);
  });

  /* ---------------------------------------------------------
     Leveza: as texturas coloridas (modelos e "do seu jeito") e a capa do vídeo só baixam quando a seção está chegando
     --------------------------------------------------------- */
  (() => {
    const perto = (seletores, margem, fn) => {
      const els = seletores.map((q) => $(q)).filter(Boolean);
      if (!els.length) return;
      if (!('IntersectionObserver' in window)) return fn();
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: margem });
      els.forEach((el) => io.observe(el));
    };
    perto(['#modelos', '#personalize'], '1400px 0px', () => root.classList.add('tex-ok'));
    perto(['#fabrica'], '900px 0px', () => $$('video[data-poster]').forEach((v) => { v.poster = v.dataset.poster; v.removeAttribute('data-poster'); }));
  })();

  /* ---------------------------------------------------------
     Aviso de cookies: o Pixel da Meta (e o Analytics) só carregam com "Aceitar"; a escolha fica guardada
     --------------------------------------------------------- */
  (() => {
    let escolha = null;
    try { escolha = localStorage.getItem('cia-cookies'); } catch (e) { /* navegação privada */ }
    if (escolha) return;
    const av = document.createElement('div');
    av.className = 'cookies';
    av.setAttribute('role', 'region');
    av.setAttribute('aria-label', 'Aviso de cookies');
    av.innerHTML = '<p>Usamos cookies de marketing (Pixel da Meta) para medir nossos anúncios. Você pode aceitar ou recusar. <a href="/privacidade">Política de privacidade</a></p>'
      + '<div class="cookies__acoes"><button type="button" class="cookies__btn" data-ck="recusado">Recusar</button><button type="button" class="cookies__btn cookies__btn--ok" data-ck="aceito">Aceitar</button></div>';
    const mostra = () => { document.body.appendChild(av); requestAnimationFrame(() => requestAnimationFrame(() => av.classList.add('is-on'))); };
    if (document.readyState === 'complete') setTimeout(mostra, 900); else window.addEventListener('load', () => setTimeout(mostra, 900), { once: true });
    av.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ck]');
      if (!b) return;
      try { localStorage.setItem('cia-cookies', b.dataset.ck); } catch (er) { /* sem armazenamento: vale só nesta visita */ }
      if (b.dataset.ck === 'aceito' && typeof window.carregaMarketing === 'function') window.carregaMarketing();
      av.classList.remove('is-on');
      setTimeout(() => av.remove(), 500);
    });
  })();

  /* ---------------------------------------------------------
     Vídeo da fábrica: só baixa quando está chegando na tela; toca mudo em loop enquanto aparece e pausa ao sair.
     O botão (ou um toque no vídeo) liga o som. Com "reduzir movimento", não toca sozinho: vira player comum.
     --------------------------------------------------------- */
  (() => {
    const fig = $('[data-video]');
    if (!fig) return;
    const video = $('video', fig);
    const som = $('[data-som]', fig);
    const somTexto = $('[data-som-texto]', fig);
    const barra = $('[data-video-barra]', fig);
    let carregado = false;
    const carrega = () => { if (!carregado) { video.src = video.dataset.src; carregado = true; } };
    const ligaSom = (sim) => {
      video.muted = !sim;
      som.setAttribute('aria-pressed', String(sim));
      somTexto.textContent = sim ? 'Desativar som' : 'Ativar som';
      if (sim) { carrega(); video.play().catch(() => {}); }
    };
    som.addEventListener('click', () => ligaSom(video.muted));
    video.addEventListener('click', () => ligaSom(video.muted));
    video.addEventListener('timeupdate', () => {
      if (video.duration) barra.style.transform = `scaleX(${(video.currentTime / video.duration).toFixed(4)})`;
    });
    if (reduce) { video.controls = true; video.preload = 'metadata'; carrega(); som.hidden = true; return; }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { carrega(); video.play().catch(() => {}); }
      else video.pause();
    }, { rootMargin: '200px 0px' }).observe(fig);
  })();

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

  /* ---------- abertura (como a da Akari): a página espera a impressão; um gesto acelera ---------- */
  const playHero = () => {
    const gestos = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    let abertura = null;
    const acelera = () => { if (abertura) abertura.timeScale(3); };
    const libera = () => {
      gestos.forEach((g) => window.removeEventListener(g, acelera));
    };
    gestos.forEach((g) => window.addEventListener(g, acelera, { passive: true }));

    abertura = gsap.timeline({ defaults: { ease: EASE }, onComplete: libera });
    abertura.add(() => entraUI(), 0.35);
    const imp = printer?.print(1.7);
    if (imp) abertura.add(imp, 0.45);
    abertura.to({}, { duration: 0.15 });
  };

  // depois da impressão: o menu desce do desfoque, os textos sobem, a galeria e os selos entram
  // o menu, os textos, a galeria e os selos entram pelo CSS (aparecem sem esperar o JavaScript);
  // aqui só começa o balanço dos selos, depois que eles entraram
  const entraUI = () => {
    gsap.delayedCall(1.6, () => $$('[data-chip]').forEach((c, i) => gsap.to(c, { y: i ? 8 : -8, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })));
  };

  const fontsReady = Promise.race([document.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 600))]);
  Promise.all([fontsReady, tintaPronta]).then(() => requestAnimationFrame(() => { playHero(); initScroll(); }));

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
      ScrollTrigger.create({
        trigger: hero, start: 'top bottom', end: 'bottom top',
        onToggle: (self) => {
          galleryLoop.paused(!self.isActive);
          $$('[data-chip]').forEach((c) => gsap.getTweensOf(c).forEach((t) => t.paused(!self.isActive)));
        },
      });
    }
    gsap.fromTo('.doormat', { yPercent: 0, y: 0, scale: 1 }, { yPercent: 10, y: 0, scale: 1, ease: 'none', force3D: true, scrollTrigger: { trigger: hero, start: 'top top', end: '70% top', scrub: true } });

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
      const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 85%', toggleActions: 'play none none reset' }, defaults: { ease: EASE } });
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
      gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reset' } });
    });

    // produtos entram em cascata
    gsap.fromTo('.pcard', { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: EASE, clearProps: 'opacity,transform', scrollTrigger: { trigger: '.carousel', start: 'top 85%', once: true } });

    // piso e grama: os dois cards sobem, um depois do outro
    gsap.fromTo('.lado', { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: EASE, clearProps: 'opacity,transform', scrollTrigger: { trigger: '.lados__grid', start: 'top 85%', once: true } });

    // segmentos
    gsap.fromTo('.seg-card', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.07, ease: EASE, clearProps: 'opacity,transform', scrollTrigger: { trigger: '.seg-grid', start: 'top 85%', once: true } });


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

    // empresa: a frase sobe pela máscara e acende de cinza para preto, uma linha depois da outra (por tempo)
    const manifesto = $('[data-manifesto]');
    if (manifesto && hasSplit) {
      const split = SplitText.create(manifesto, { type: 'lines', mask: 'lines' });
      gsap.timeline({ scrollTrigger: { trigger: manifesto, start: 'top 78%', toggleActions: 'play none none reset' } })
        .fromTo(split.lines, { yPercent: 110, opacity: 0.5 }, { yPercent: 0, duration: 1.1, ease: EASE, stagger: 0.07 }, 0)
        .to(split.lines, { opacity: 1, duration: 1, ease: 'power2.out', stagger: 0.22 }, 0.5);
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

    modelos();
    faixasFeedback();
    perso();
    fabrica();
    trilho();
    paralaxeMoldura();
    marcaRodape();
    ScrollTrigger.refresh();
  }


  /* ---------------------------------------------------------
     Impressora genérica (a mesma do topo, para os capachos da cena)
     --------------------------------------------------------- */
  function impressora(arte) {
    const fantasma = $('[data-camada]', arte);
    const nome = $('[data-nome]', fantasma);
    const sub = $('[data-sub]', fantasma);
    const cabeca = $('[data-cabeca]', arte);
    const FAIXAS = 5;
    let faixas = [];
    let tl = null;
    const visiveis = () => [...fantasma.children].filter((e) => e.offsetHeight > 0);
    const ajusta = () => {
      const w = arte.clientWidth, h = arte.clientHeight;
      let fs = w * 0.3;
      for (let i = 0; i < 40; i++) {
        arte.style.setProperty('--fs', `${fs}px`);
        const v = visiveis();
        const alto = v[v.length - 1].offsetTop + v[v.length - 1].offsetHeight - v[0].offsetTop;
        if (nome.scrollWidth <= w + 1 && alto <= h) break;
        fs *= 0.94;
      }
    };
    const monta = () => {
      faixas.forEach((f) => f.remove());
      faixas = Array.from({ length: FAIXAS }, () => {
        const c = fantasma.cloneNode(true);
        c.classList.remove('mtinta--fantasma');
        c.removeAttribute('data-camada');
        $$('[data-nome], [data-sub]', c).forEach((e) => { e.removeAttribute('data-nome'); e.removeAttribute('data-sub'); });
        c.style.clipPath = 'inset(0 100% 100% 0)';
        arte.insertBefore(c, cabeca);
        return c;
      });
    };
    const imprime = (dur = 1.2) => {
      tl?.kill();
      ajusta();
      monta();
      const kids = visiveis();
      const W = arte.clientWidth, H = arte.clientHeight;
      const top = Math.min(...kids.map((e) => e.offsetTop)) - 4;
      const bottom = Math.max(...kids.map((e) => e.offsetTop + e.offsetHeight)) + 4;
      const left = Math.max(0, Math.min(...kids.map((e) => e.offsetLeft)) - 8);
      const right = Math.min(W, Math.max(...kids.map((e) => e.offsetLeft + e.offsetWidth)) + 8);
      const alto = (bottom - top) / FAIXAS;
      const hc = alto + W * 0.06;
      cabeca.style.height = `${hc}px`;
      const wc = cabeca.offsetWidth;
      tl = gsap.timeline();
      tl.set(cabeca, { opacity: 1 });
      faixas.forEach((faixa, i) => {
        const y0 = top + i * alto - 0.5, y1 = y0 + alto + 1;
        const volta = i % 2 === 1;
        const o = { p: 0 };
        const passo = () => {
          const x = left + (right - left) * (volta ? 1 - o.p : o.p);
          faixa.style.clipPath = volta
            ? `inset(${y0}px ${W - right}px ${H - y1}px ${x}px)`
            : `inset(${y0}px ${W - x}px ${H - y1}px ${left}px)`;
          cabeca.style.transform = `translate3d(${volta ? x - 3 : x - wc + 3}px, ${y0 + alto / 2 - hc / 2}px, 0)`;
        };
        tl.add(() => cabeca.classList.toggle('is-volta', volta));
        tl.to(o, { p: 1, duration: dur / FAIXAS, ease: 'power1.inOut', onStart: passo, onUpdate: passo });
      });
      tl.to(cabeca, { opacity: 0, duration: 0.3 })
        .add(() => faixas.forEach((f) => { f.style.clipPath = 'none'; }), '<');
      return tl;
    };
    // apaga a tinta (as faixas somem) e, se pedir, imprime de novo com o que estiver no fantasma
    const limpa = (depois) => {
      tl?.kill();
      gsap.to(cabeca, { opacity: 0, duration: 0.2 });
      if (!faixas.length) { if (depois) depois(); return; }
      const velhas = faixas;
      faixas = [];
      tl = gsap.to(velhas, { opacity: 0, duration: 0.28, onComplete: () => { velhas.forEach((f) => f.remove()); if (depois) depois(); } });
    };
    new ResizeObserver(() => { if (faixas.length) ajusta(); }).observe(arte);
    return { imprime, limpa, impresso: () => faixas.length > 0 };
  }

  /* ---------------------------------------------------------
     Cena presa na rolagem (o palco da Akari): o palco fica preso na tela e, rolando, os três capachos se
     levantam do chão um depois do outro; em pé, cada um recebe a impressão. Só a cena segue a rolagem
     (amortecida e com teto de velocidade, para nada se atropelar); os textos entram por marcos, por tempo.
     --------------------------------------------------------- */
  function modelos() {
    const sec = $('[data-modelos]');
    if (!sec) return;
    const mats = $$('[data-mtap]', sec);
    const imps = mats.map((m) => impressora($('[data-arte]', m)));
    const janelas = [[0.04, 0.42], [0.2, 0.58], [0.36, 0.74]];
    const giros = [12, 0, -12];
    // no toque a cena acompanha o dedo mais de perto (no mouse ela segue amortecida, como antes)
    const toque = window.matchMedia('(pointer: coarse)').matches;
    const VMAX = toque ? 1 / 0.8 : 1 / 1.6, SEGUE = toque ? 14 : 9;
    const palco = $('.modelos__palco', sec);
    // percurso medido uma vez (e no resize): não depende da altura da tela, que muda quando a barra do navegador aparece/some
    let percurso = 1;
    const medePercurso = () => { percurso = Math.max(1, sec.offsetHeight - (palco ? palco.offsetHeight : window.innerHeight)); };
    medePercurso();
    window.addEventListener('resize', () => { if (!toque) medePercurso(); }, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(medePercurso, 300));
    // só trabalha quando a seção está perto da tela
    let perto = false;
    new IntersectionObserver(([e]) => { perto = e.isIntersecting; }, { rootMargin: '300px 0px' }).observe(sec);
    const ultimo = mats.map(() => ({ tf: '', op: '' }));
    const limita = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const suave = (a, b, x) => { const t = limita((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    let t = 0, fimOn = false, headOn = false;

    const linhas = (sel) => $$(sel, sec);
    const entra = (alvos) => gsap.fromTo(alvos, { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.1, ease: EASE, stagger: 0.07, overwrite: 'auto' });
    const sai = (alvos) => gsap.to(alvos, { yPercent: 110, y: 0, duration: 0.45, ease: 'power3.in', stagger: 0.02, overwrite: 'auto' });
    const setaEntra = () => {
      const seta = $('[data-marco-seta]', sec);
      gsap.timeline()
        .set(seta, { opacity: 1 })
        .fromTo($('.seta__anel circle', seta), { attr: { 'stroke-dasharray': '0 1000' } }, { attr: { 'stroke-dasharray': '1000 0' }, duration: 1.6, ease: 'power3.inOut' }, 0)
        .fromTo($('.seta__ponta', seta), { x: -14, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: EASE }, 0.35)
        .fromTo($('.seta__texto', seta), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 1, ease: EASE }, 0.2);
    };

    const desenha = (p) => {
      mats.forEach((m, i) => {
        const e = suave(janelas[i][0], janelas[i][1], p);
        // gira direto no transform (a placa de vídeo resolve) e só escreve quando o valor muda
        const tf = `translateX(-50%) rotateX(${(88 * (1 - e)).toFixed(1)}deg) rotateY(${(giros[i] * e).toFixed(1)}deg)`;
        const op = Math.min(1, e * 4).toFixed(2);
        if (tf !== ultimo[i].tf) { m.style.transform = tf; ultimo[i].tf = tf; }
        if (op !== ultimo[i].op) { m.style.opacity = op; ultimo[i].op = op; }
        if (e > 0.98 && !imps[i].impresso()) imps[i].imprime(1.2);
      });
      // marcos: o título quando a cena começa; os nomes e a seta quando os três estão em pé
      if (p > 0.01 && !headOn) { headOn = true; entra(linhas('.modelos__head [data-marco]')); }
      if (p <= 0.005 && headOn) { headOn = false; sai(linhas('.modelos__head [data-marco]')); }
      if (p >= 0.8 && !fimOn) { fimOn = true; entra(linhas('.modelos__nomes [data-marco]')); setaEntra(); }
      if (p < 0.7 && fimOn) { fimOn = false; sai(linhas('.modelos__nomes [data-marco]')); gsap.to($('[data-marco-seta]', sec), { opacity: 0, duration: 0.3 }); }
    };

    // no celular a cena não fica presa à rolagem: quando aparece, os capachos sobem e imprimem sozinhos, uma vez
    // (o arraste fica livre, com a rolagem nativa do aparelho)
    if (window.matchMedia('(pointer: coarse), (max-width: 700px)').matches) {
      const estado = { p: 0 };
      let tocou = false;
      desenha(0);
      new IntersectionObserver(([e]) => {
        if (!e.isIntersecting || tocou) return;
        tocou = true;
        gsap.to(estado, { p: 1, duration: 2.8, ease: 'power1.inOut', onUpdate: () => desenha(estado.p) });
      }, { threshold: 0.35 }).observe(sec);
      return;
    }

    gsap.ticker.add((_, dms) => {
      if (!perto) return;
      const r = sec.getBoundingClientRect();
      const alvo = limita((-r.top / percurso) * 1.2);
      const dt = Math.min(0.05, dms / 1000);
      if (Math.abs(alvo - t) < 0.0005) t = alvo;
      else {
        const passo = (alvo - t) * (1 - Math.exp(-SEGUE * dt)), teto = VMAX * dt;
        t += Math.max(-teto, Math.min(teto, passo));
      }
      desenha(t);
    });
  }

  /* ---------------------------------------------------------
     Trilho lateral (o processo da Akari): as fotos dos trabalhos andam de lado com a rolagem vertical
     --------------------------------------------------------- */
  function trilho() {
    const sec = $('[data-trilho]');
    if (!sec) return;
    const faixa = $('[data-trilho-faixa]', sec);
    let sobra = -1;
    let espera = 0;
    // a altura do trilho muda quando as fotos chegam: recalcula as posições uma vez só, depois que tudo assentar
    const mede = () => {
      const nova = Math.max(0, faixa.scrollWidth - window.innerWidth);
      if (nova === sobra) return;
      sobra = nova;
      sec.style.height = `calc(100svh + ${sobra}px)`;
      clearTimeout(espera);
      espera = setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    mede();
    window.addEventListener('resize', mede, { passive: true });
    $$('img', faixa).forEach((img) => img.addEventListener('load', mede, { once: true }));
    gsap.ticker.add(() => {
      const p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / Math.max(1, sobra)));
      faixa.style.transform = `translate3d(${(-p * sobra).toFixed(1)}px, 0, 0)`;
    });
    ScrollTrigger.create({
      trigger: sec, start: 'top 75%', toggleActions: 'play none none reset',
      onEnter: () => gsap.fromTo($$('[data-sobe]', sec), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.1, ease: EASE, stagger: 0.07, overwrite: 'auto' }),
      onLeaveBack: () => gsap.set($$('[data-sobe]', sec), { yPercent: 110, y: 0 }),
    });
  }

  /* ---------------------------------------------------------
     Paralaxe dentro da moldura: a foto (maior que a moldura) anda um pouco mais devagar que a página
     --------------------------------------------------------- */
  function paralaxeMoldura() {
    const fotos = $$('[data-moldura]');
    if (!fotos.length) return;
    gsap.ticker.add(() => {
      const vh = window.innerHeight;
      for (const img of fotos) {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        img.style.transform = `translate3d(0, ${(p * 6).toFixed(2)}%, 0) scale(1.12)`;
      }
    });
  }

  /* ---------------------------------------------------------
     Rodapé: CIA DO TAPETE gigante sobe quando o rodapé chega e fica cortado na base
     --------------------------------------------------------- */
  function marcaRodape() {
    const marca = $('[data-marca]');
    if (!marca) return;
    gsap.set(marca, { yPercent: 100 });
    ScrollTrigger.create({
      trigger: marca.parentElement, start: 'top 98%', toggleActions: 'play none none reset',
      onEnter: () => gsap.fromTo(marca, { yPercent: 100 }, { yPercent: 0, duration: 1.6, ease: EASE, overwrite: 'auto' }),
      onLeaveBack: () => gsap.set(marca, { yPercent: 100 }),
    });
  }

  /* ---------------------------------------------------------
     Personalize (cena presa): rolando, um capacho se monta (a manta de borracha, depois a trama se espalha) e
     vai mudando por etapas: a marca impressa, a cor, a letra, o logo e outros negócios. Cada mudança é impressa
     pela cabeça; rolando para cima, ele volta. A cena segue a rolagem amortecida; as trocas são por marcos.
     --------------------------------------------------------- */
  function perso() {
    const sec = $('[data-perso]');
    if (!sec) return;
    const mat = $('[data-pmat]', sec);
    const arte = $('[data-arte]', mat);
    const fantasma = $('[data-camada]', arte);
    const nome = $('[data-nome]', fantasma);
    const sub = $('[data-sub]', fantasma);
    const logo = $('[data-logo]', fantasma);
    const legenda = $('[data-legenda]', sec);
    const passos = $$('[data-passo]', sec);
    const imp = impressora(arte);
    const ETAPAS = [
      { em: 0, cor: 'grafite', tinta: 'creme', fonte: 'sans', nome: '', sub: '', logo: '', passo: 0, legenda: 'A trama de vinil' },
      { em: 0.13, cor: 'grafite', tinta: 'creme', fonte: 'sans', nome: 'Sua marca', sub: 'Seja bem-vindo', logo: '', passo: 1, legenda: 'A sua marca impressa' },
      { em: 0.27, cor: 'vermelho', tinta: 'creme', fonte: 'serif', nome: 'Bem-vindo', sub: 'Volte sempre', logo: '', passo: 2, legenda: 'A cor do seu jeito' },
      { em: 0.41, cor: 'cafe', tinta: 'amarelo', fonte: 'script', nome: 'Doce Lar', sub: 'Padaria e confeitaria', logo: '', passo: 3, legenda: 'A letra do seu estilo' },
      { em: 0.55, cor: 'cafe', tinta: 'amarelo', fonte: 'script', nome: 'Doce Lar', sub: 'Padaria e confeitaria', logo: 'xicara', passo: 4, legenda: 'Com o seu logo' },
      { em: 0.69, cor: 'azul', tinta: 'creme', fonte: 'sans', nome: 'Jardins', sub: 'Condomínio residencial', logo: 'casa', passo: 5, legenda: 'Para qualquer negócio' },
      { em: 0.83, cor: 'verde', tinta: 'creme', fonte: 'condensada', nome: 'Clínica Vida', sub: 'Seja bem-vindo', logo: 'folha', passo: 5, legenda: 'Para qualquer negócio' },
    ];
    const VMAX = 1 / 2.2, SEGUE = 8;
    const limita = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const suave = (a, b, x) => { const t = limita((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    let t = 0, atual = -1;

    const vai = (i) => {
      const e = ETAPAS[i];
      atual = i;
      passos.forEach((li) => li.classList.toggle('is-on', +li.dataset.passo === e.passo));
      if (legenda.textContent !== e.legenda) {
        gsap.timeline()
          .to(legenda, { opacity: 0, y: -6, duration: 0.2 })
          .add(() => { legenda.textContent = e.legenda; })
          .fromTo(legenda, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: EASE });
      }
      mat.dataset.cor = e.cor;
      imp.limpa(() => {
        if (atual !== i) return;
        if (!e.nome) return;
        arte.dataset.tinta = e.tinta;
        arte.dataset.fonte = e.fonte;
        nome.textContent = e.nome;
        sub.textContent = e.sub;
        if (e.logo) logo.dataset.tipo = e.logo; else delete logo.dataset.tipo;
        imp.imprime(1.05);
      });
    };

    const desenha = (p) => {
      // a montagem: a manta de borracha aparece e a trama se espalha por cima, da esquerda para a direita
      mat.style.setProperty('--manta', (0.92 + 0.08 * suave(0, 0.05, p)).toFixed(3));
      mat.style.setProperty('--manta-op', suave(0, 0.04, p).toFixed(3));
      mat.style.setProperty('--fio', `${(suave(0.03, 0.12, p) * 100).toFixed(2)}%`);
      // um giro leve contínuo: o capacho vai se endireitando enquanto a página desce
      mat.style.setProperty('--rx', (16 - 10 * p).toFixed(2));
      mat.style.setProperty('--ry', (-9 + 14 * p).toFixed(2));
      let i = 0;
      ETAPAS.forEach((e, n) => { if (p >= e.em) i = n; });
      if (i !== atual) vai(i);
    };

    gsap.ticker.add((_, dms) => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const percurso = Math.max(1, sec.offsetHeight - window.innerHeight);
      const alvo = limita(-r.top / percurso);
      const dt = Math.min(0.05, dms / 1000);
      if (Math.abs(alvo - t) < 0.0005) t = alvo;
      else {
        const passo = (alvo - t) * (1 - Math.exp(-SEGUE * dt)), teto = VMAX * dt;
        t += Math.max(-teto, Math.min(teto, passo));
      }
      desenha(t);
    });
    desenha(0);
  }

  /* ---------------------------------------------------------
     Feedbacks: as duas faixas andam em sentidos opostos, sem parar; rolando, aceleram (como a faixa vermelha)
     e, com o mouse em cima, quase param para dar tempo de ler
     --------------------------------------------------------- */
  function faixasFeedback() {
    $$('[data-fb-faixa]').forEach((faixa) => {
      const trilho = $('[data-fb-trilho]', faixa);
      const sentido = +faixa.dataset.fbFaixa;
      // duplica os cards para o laço não ter emenda; as cópias ficam fora do teclado e do leitor de tela
      const copia = trilho.innerHTML;
      trilho.insertAdjacentHTML('beforeend', copia);
      [...trilho.children].slice(trilho.children.length / 2).forEach((c) => { c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; });
      const laco = sentido > 0
        ? gsap.fromTo(trilho, { xPercent: 0 }, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 })
        : gsap.fromTo(trilho, { xPercent: -50 }, { xPercent: 0, duration: 46, ease: 'none', repeat: -1 });
      let parado = false;
      faixa.addEventListener('pointerenter', () => { parado = true; gsap.to(laco, { timeScale: 0.12, duration: 0.6, overwrite: true }); });
      faixa.addEventListener('pointerleave', () => { parado = false; gsap.to(laco, { timeScale: 1, duration: 0.8, overwrite: true }); });
      ScrollTrigger.create({
        trigger: faixa, start: 'top bottom', end: 'bottom top',
        onUpdate: (self) => {
          if (parado) return;
          const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 450);
          gsap.to(laco, { timeScale: boost, duration: 0.2, overwrite: true });
          gsap.to(laco, { timeScale: 1, duration: 1.2, delay: 0.2, ease: 'power2.out', overwrite: false });
        },
      });
    });
  }

  /* ---------------------------------------------------------
     Fábrica: o texto sobe pela máscara; a tela do vídeo entra de baixo e gira de leve conforme a página desce
     --------------------------------------------------------- */
  function fabrica() {
    const sec = $('#fabrica');
    if (!sec) return;
    const tela = $('.fabrica__tela', sec);
    ScrollTrigger.create({
      trigger: sec, start: 'top 72%', toggleActions: 'play none none reset',
      onEnter: () => gsap.fromTo($$('[data-sobe]', sec), { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 1.1, ease: EASE, stagger: 0.07, overwrite: 'auto' }),
      onLeaveBack: () => gsap.set($$('[data-sobe]', sec), { yPercent: 110, y: 0 }),
    });
    gsap.fromTo($('.fabrica__video', sec), { y: 120, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 1.4, ease: EASE, scrollTrigger: { trigger: sec, start: 'top 75%', toggleActions: 'play none none reset' } });
    gsap.fromTo(['.fabrica__apoio', '.fabrica__fatos li', '.fabrica__texto .btn'], { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: EASE, stagger: 0.08, delay: 0.25, scrollTrigger: { trigger: sec, start: 'top 72%', toggleActions: 'play none none reset' } });
    gsap.fromTo(tela, { '--giro': -16, '--incl': 6 }, { '--giro': 10, '--incl': -3, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
