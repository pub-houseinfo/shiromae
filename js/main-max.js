/* wp-gsap-animate: shiromae 全力デモ版(max) 2026-08-29
   index-max.html 専用。本番 index.html は js/main.js（派手版）のまま。
   オープニング幕・ScrollSmoother・マルキー・金粉・ピン留め墨入れ・回転リビール・マグネットCTA */
(function () {
  'use strict';

  /* ---------- アニメ無しでも成立する基本動作（ヘッダー色・アンカー） ---------- */
  var header = document.getElementById('siteHeader');
  var hero = document.getElementById('top');
  var smoother = null;
  function checkHeader() {
    if (!header || !hero) return;
    var heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 80) header.classList.remove('dark');
    else header.classList.add('dark');
  }
  window.addEventListener('scroll', checkHeader, { passive: true });
  checkHeader();

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      if (smoother) {
        smoother.scrollTo(target, true, 'top 64px');
      } else {
        var offsetY = target.getBoundingClientRect().top + window.pageYOffset - 64;
        window.scrollTo({ top: offsetY, behavior: 'smooth' });
      }
    });
  });

  var curtain = document.getElementById('maxCurtain');
  function dropCurtain() { if (curtain && curtain.parentNode) curtain.parentNode.removeChild(curtain); }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dropCurtain();
    return; // 動きを減らす設定の人には静的表示
  }

  /* ---------- GSAP読込（CDN・二重読込ガード） ---------- */
  var failsafe = setTimeout(dropCurtain, 3500); // 読込失敗でも必ず表示

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function ensureGsap() {
    var base = 'https://cdn.jsdelivr.net/npm/gsap@3/dist/';
    var p = Promise.resolve();
    if (!window.gsap) p = p.then(function () { return loadScript(base + 'gsap.min.js'); });
    return p.then(function () {
      var q = [];
      if (!window.ScrollTrigger) q.push(loadScript(base + 'ScrollTrigger.min.js'));
      return Promise.all(q);
    }).then(function () {
      if (!window.ScrollSmoother) return loadScript(base + 'ScrollSmoother.min.js').catch(function () {});
    });
  }
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function ST(trigger) { return { trigger: trigger, start: 'top 80%' }; }

  /* 子要素の構造を保ったまま1文字ずつ<span>に分割 */
  function splitCharsDeep(el) {
    if (!el) return [];
    if (!el.dataset.wgaSplit) {
      el.dataset.wgaSplit = '1';
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            if (/^\s*$/.test(n.textContent)) return;
            var frag = document.createDocumentFragment();
            n.textContent.split('').forEach(function (ch) {
              if (ch === ' ' || ch === '\n' || ch === '\t') { frag.appendChild(document.createTextNode(' ')); return; }
              var s = document.createElement('span');
              s.className = 'wga-ch'; s.style.display = 'inline-block';
              s.textContent = ch;
              frag.appendChild(s);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
        });
      })(el);
    }
    return el.querySelectorAll('.wga-ch');
  }

  /* ---------- 追加CSS（デモ用の装飾はJSから注入して本体CSSを汚さない） ---------- */
  var KIN = '#a88a3f';
  function injectStyles() {
    var css = [
      '.max-progress{position:fixed;top:0;left:0;height:3px;width:100%;background:' + KIN + ';transform:scaleX(0);transform-origin:left;z-index:1200;pointer-events:none}',
      '.max-marquee{overflow:hidden;padding:26px 0;border-top:1px solid rgba(168,138,63,.3);border-bottom:1px solid rgba(168,138,63,.3)}',
      '.max-marquee .max-track{display:flex;white-space:nowrap;will-change:transform}',
      '.max-marquee .max-item{flex:0 0 auto;font-family:"Shippori Mincho","Noto Serif JP",serif;font-size:clamp(20px,2.6vw,30px);letter-spacing:.3em;color:' + KIN + ';opacity:.8;padding-right:3.2em}',
      '.max-giant{position:absolute;top:8%;left:0;font-family:"Cormorant Garamond",serif;font-weight:500;font-size:22vw;line-height:1;letter-spacing:.04em;color:transparent;-webkit-text-stroke:1px rgba(168,138,63,.22);pointer-events:none;white-space:nowrap;z-index:0}',
      '.section.concept,.section.rooms{position:relative;overflow:hidden}',
      '.max-dust{position:absolute;border-radius:50%;background:' + KIN + ';pointer-events:none;will-change:transform,opacity}',
      '.hero,.reservation{overflow:hidden;position:relative}',
      '.room-photo-main{overflow:hidden}',
      '.room-photo-main{transition:none}',
      '.max-veil{position:absolute;inset:0;background:' + KIN + ';z-index:4;pointer-events:none;transform-origin:left}',
      '.room-photo-thumb{transition:transform .5s cubic-bezier(.2,.7,.2,1)}',
      '.room-photo-thumb:hover{transform:scale(1.05)}',
      '.wga-flip{perspective:900px;display:inline-block}',
      '.max-magnet{display:inline-block;will-change:transform}'
    ].join('\n');
    var s = document.createElement('style');
    s.id = 'max-style'; s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- 装飾DOMの生成 ---------- */
  function buildDecor() {
    // 読み進みバー
    var bar = document.createElement('div');
    bar.className = 'max-progress'; bar.id = 'maxProgress';
    document.body.appendChild(bar);

    // マルキー（流れる帯）×2：部屋の前・予約の前
    function makeMarquee() {
      var wrap = document.createElement('div');
      wrap.className = 'max-marquee'; wrap.setAttribute('aria-hidden', 'true');
      var track = document.createElement('div');
      track.className = 'max-track';
      for (var i = 0; i < 4; i++) {
        var item = document.createElement('span');
        item.className = 'max-item';
        item.textContent = 'BESSO 城前　—　SHIROMAE　—　姫路城まで徒歩六分　—　二部屋限定　—';
        track.appendChild(item);
      }
      wrap.appendChild(track);
      return wrap;
    }
    var rooms = document.getElementById('rooms');
    if (rooms) rooms.parentNode.insertBefore(makeMarquee(), rooms);
    var reserve = document.getElementById('reservation');
    if (reserve) reserve.parentNode.insertBefore(makeMarquee(), reserve);

    // 巨大アウトライン文字（コンセプト・部屋の背景）
    var concept = document.querySelector('.section.concept');
    if (concept) {
      var g1 = document.createElement('span');
      g1.className = 'max-giant'; g1.textContent = 'SHIROMAE'; g1.setAttribute('aria-hidden', 'true');
      concept.insertBefore(g1, concept.firstChild);
    }
    var roomsSec = document.querySelector('.section.rooms');
    if (roomsSec) {
      var g2 = document.createElement('span');
      g2.className = 'max-giant'; g2.style.top = '2%'; g2.textContent = 'TWO STORIES'; g2.setAttribute('aria-hidden', 'true');
      roomsSec.insertBefore(g2, roomsSec.firstChild);
    }

    // 金粉（ヒーローと予約セクションに舞う粒）
    function dust(container, count) {
      if (!container) return [];
      var out = [];
      for (var i = 0; i < count; i++) {
        var d = document.createElement('span');
        d.className = 'max-dust';
        var size = 2 + Math.random() * 4;
        d.style.width = size + 'px'; d.style.height = size + 'px';
        d.style.left = (Math.random() * 100) + '%';
        d.style.top = (20 + Math.random() * 75) + '%';
        d.style.opacity = '0';
        container.appendChild(d);
        out.push(d);
      }
      return out;
    }
    return {
      bar: bar,
      heroDust: dust(document.querySelector('.hero'), 16),
      rsvDust: dust(document.querySelector('.reservation'), 12)
    };
  }

  /* ---------- 本体 ---------- */
  onReady(function () {
    ensureGsap().then(function () {
      gsap.registerPlugin(ScrollTrigger);
      injectStyles();
      var decor = buildDecor();

      /* --- ScrollSmoother：スクロールの吸い付き（対応環境のみ） --- */
      if (window.ScrollSmoother) {
        gsap.registerPlugin(ScrollSmoother);
        var wrapper = document.createElement('div'); wrapper.id = 'smooth-wrapper';
        var content = document.createElement('div'); content.id = 'smooth-content';
        wrapper.appendChild(content);
        // ヘッダー・幕・バーは固定表示なので外に残す
        Array.prototype.slice.call(document.body.children).forEach(function (child) {
          if (child === header || child === curtain || child === decor.bar || child.tagName === 'SCRIPT') return;
          content.appendChild(child);
        });
        document.body.appendChild(wrapper);
        smoother = ScrollSmoother.create({ wrapper: wrapper, content: content, smooth: 1.2, effects: false, smoothTouch: false });
      }

      var heroSec = document.querySelector('.hero');

      /* --- オープニング幕 → ヒーロー --- */
      gsap.set('.hero-bg', { scale: 1.18 });
      var heroChars = splitCharsDeep(document.querySelector('.hero-title'));
      gsap.set(['.hero-logo-wrap', '.hero-eyebrow', '.hero-sub', '.hero-en', '.hero-meta > div'], { opacity: 0 });
      gsap.set(heroChars, { opacity: 0 });

      var open = gsap.timeline({ defaults: { ease: 'power2.out' } });
      if (curtain) {
        var cChars = curtain.querySelectorAll('.max-curtain-title span');
        open
          .fromTo(curtain.querySelector('.max-curtain-en'), { opacity: 0, letterSpacing: '1.2em' }, { opacity: 0.7, letterSpacing: '0.55em', duration: 0.9 })
          .fromTo(cChars, { opacity: 0, rotationX: -95, y: 30 }, { opacity: 1, rotationX: 0, y: 0, duration: 0.8, stagger: 0.16, ease: 'back.out(1.6)' }, '-=0.4')
          .fromTo(curtain.querySelector('.max-curtain-line'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, '-=0.3')
          .fromTo(curtain.querySelector('.max-curtain-sub'), { opacity: 0, y: 12 }, { opacity: 0.85, y: 0, duration: 0.6 }, '-=0.4')
          .to(curtain, { yPercent: -100, duration: 1.0, ease: 'power4.inOut', delay: 0.35 })
          .add(function () { clearTimeout(failsafe); dropCurtain(); });
      }
      open
        .to('.hero-bg', { scale: 1, duration: 3.0, ease: 'power2.out' }, '-=1.0')
        .fromTo('.hero-logo-wrap', { opacity: 0, filter: 'blur(10px)', y: 20 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.0 }, '-=2.8')
        .fromTo('.hero-eyebrow', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, '-=2.3')
        .fromTo(heroChars, { opacity: 0, rotationX: -90, y: 30 }, { opacity: 1, rotationX: 0, y: 0, duration: 0.7, stagger: 0.05, ease: 'back.out(1.4)' }, '-=2.1')
        .fromTo('.hero-sub', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, '-=1.3')
        .fromTo('.hero-en', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=1.0')
        .fromTo('.hero-meta > div', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.1 }, '-=0.8');

      // ヒーローの視差＋離脱時に沈み込む
      gsap.to('.hero-bg', { yPercent: 18, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero-inner', { opacity: 0, y: -60, scale: 0.96, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });
      gsap.to('.scroll-hint', { y: 10, duration: 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true });

      // 金粉：ゆらゆら舞い続ける
      function twinkle(list) {
        list.forEach(function (d) {
          gsap.to(d, { opacity: 0.35 + Math.random() * 0.45, duration: 1 + Math.random() * 2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 2 });
          gsap.to(d, { x: 'random(-60,60)', y: 'random(-90,-20)', duration: 'random(6,12)', repeat: -1, yoyo: true, ease: 'sine.inOut', repeatRefresh: true });
        });
      }
      twinkle(decor.heroDust); twinkle(decor.rsvDust);

      // 読み進みバー
      gsap.to(decor.bar, { scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: 0.3 } });

      // マルキー：流れ続ける帯
      document.querySelectorAll('.max-marquee .max-track').forEach(function (track) {
        var half = track.scrollWidth / 2;
        gsap.to(track, { x: -half, duration: 22, ease: 'none', repeat: -1,
          modifiers: { x: function (x) { return (parseFloat(x) % half) + 'px'; } } });
      });

      // 巨大アウトライン文字：スクロールで横滑り
      document.querySelectorAll('.max-giant').forEach(function (g) {
        gsap.fromTo(g, { xPercent: 4 }, { xPercent: -22, ease: 'none',
          scrollTrigger: { trigger: g.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      /* --- セクション見出し：1文字ずつ回転して起き上がる --- */
      document.querySelectorAll('.section-header').forEach(function (h) {
        var label = h.querySelector('.section-label');
        var title = h.querySelector('.section-title');
        var lead = h.querySelector('.section-lead');
        var tlh = gsap.timeline({ scrollTrigger: { trigger: h, start: 'top 82%' } });
        if (label) tlh.fromTo(label, { opacity: 0, letterSpacing: '0.8em' }, { opacity: 1, letterSpacing: '0.3em', duration: 0.7, ease: 'power2.out' });
        if (title) {
          var chars = splitCharsDeep(title);
          gsap.set(title, { transformPerspective: 800 });
          tlh.fromTo(chars, { opacity: 0, rotationX: -92, y: 26, transformOrigin: '50% 100% -12px' },
            { opacity: 1, rotationX: 0, y: 0, duration: 0.6, ease: 'back.out(1.5)', stagger: 0.035 }, '-=0.4');
        }
        if (lead) tlh.fromTo(lead, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3');
      });

      /* --- Concept：ピン留め＋墨が染みるように文字が濃くなる --- */
      var stmt = document.querySelector('.concept-statement');
      if (stmt) {
        var stChars = splitCharsDeep(stmt);
        gsap.set(stmt, { opacity: 1 });
        gsap.fromTo(stChars, { opacity: 0.1 }, { opacity: 1, ease: 'none', stagger: 0.06,
          scrollTrigger: { trigger: stmt, start: 'top 45%', end: '+=650', scrub: 0.4, pin: stmt, pinSpacing: true } });
      }
      gsap.fromTo('.concept-three-flow .flow-item', { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.16, scrollTrigger: ST('.concept-three-flow') });
      gsap.from('.concept-three-flow .flow-arrow', { opacity: 0, rotation: 225, scale: 0, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.2, delay: 0.3, scrollTrigger: ST('.concept-three-flow') });

      /* --- Location：bento stagger＋カウントアップ --- */
      gsap.fromTo('.bento-location .bento-cell', { opacity: 0, y: 44, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out', stagger: 0.12, scrollTrigger: ST('.bento-location') });
      document.querySelectorAll('.bento-location .big-number').forEach(function (el) {
        var tn = el.firstChild;
        if (!tn || tn.nodeType !== 3) return;
        var end = parseInt(tn.textContent, 10);
        if (isNaN(end)) return;
        var obj = { v: 0 };
        gsap.to(obj, { v: end, duration: 1.4, ease: 'power2.out', scrollTrigger: ST('.bento-location'),
          onUpdate: function () { tn.textContent = Math.round(obj.v); } });
        gsap.fromTo(el, { scale: 0.7 }, { scale: 1, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: ST('.bento-location') });
      });

      /* --- Rooms：金の幕→写真クリップ→飾り文字は視差で漂う --- */
      document.querySelectorAll('.room-block').forEach(function (block) {
        var photo = block.querySelector('.room-photo-main');
        var kanji = block.querySelector('.room-kanji-deco');
        var thumbs = block.querySelectorAll('.room-photo-thumb');
        var plan = block.querySelector('.room-floor-plan');
        var info = block.querySelector('.room-info');
        var reverse = block.classList.contains('reverse');
        var tlr = gsap.timeline({ scrollTrigger: { trigger: block, start: 'top 75%' } });
        if (photo) {
          var veil = document.createElement('div');
          veil.className = 'max-veil';
          photo.appendChild(veil);
          tlr.fromTo(photo,
            { clipPath: reverse ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', scale: 1.12 },
            { clipPath: 'inset(0 0% 0 0%)', scale: 1, duration: 1.2, ease: 'power3.inOut' })
            .fromTo(veil, { scaleX: 1, transformOrigin: reverse ? 'right' : 'left' },
              { scaleX: 0, transformOrigin: reverse ? 'left' : 'right', duration: 0.7, ease: 'power3.inOut' }, '-=0.55');
        }
        if (kanji) {
          tlr.from(kanji, { opacity: 0, scale: 1.5, filter: 'blur(10px)', duration: 1.0, ease: 'power2.out' }, '-=0.5');
          gsap.to(kanji, { yPercent: -22, ease: 'none',
            scrollTrigger: { trigger: block, start: 'top bottom', end: 'bottom top', scrub: true } });
        }
        if (thumbs.length) tlr.fromTo(thumbs, { opacity: 0, y: 28, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.4)', stagger: 0.1 }, '-=0.6');
        if (plan) tlr.fromTo(plan, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.3');
        if (info) tlr.fromTo(info, { opacity: 0, x: reverse ? -60 : 60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' }, 0.4);
      });

      /* --- Amenities / Experience / Surroundings / Dining / Pricing --- */
      gsap.fromTo('.amenity-cell:not(.empty)', { opacity: 0, y: 26, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.7)', stagger: 0.06, scrollTrigger: ST('.amenity-grid') });
      gsap.fromTo('.exp-flow .exp-step', { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.16, scrollTrigger: ST('.exp-flow') });
      gsap.from('.exp-flow .exp-arrow', { opacity: 0, rotation: 225, scale: 0, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.2, delay: 0.3, scrollTrigger: ST('.exp-flow') });
      gsap.fromTo('.exp-cta', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: ST('.exp-flow') });
      gsap.fromTo('.bento-surr .surr-cell', { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out', stagger: { each: 0.12, from: 'start' }, scrollTrigger: ST('.bento-surr') });
      gsap.fromTo('.dining-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: { each: 0.1, from: 'edges' }, scrollTrigger: ST('.dining-grid') });
      gsap.fromTo('.price-card', { opacity: 0, y: 36, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'back.out(1.3)', stagger: 0.15, scrollTrigger: ST('.price-grid') });

      /* --- Reservation / FAQ / Access --- */
      gsap.fromTo('.reserve-cta-wrap', { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'back.out(1.5)', scrollTrigger: ST('.reserve-cta-wrap') });
      gsap.fromTo('.faq-item', { opacity: 0, x: -36 }, { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08, scrollTrigger: ST('.faq-list') });
      gsap.fromTo('.access-grid > *', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.18, scrollTrigger: ST('.access-grid') });

      /* --- マグネットCTA：カーソルに吸い付くボタン --- */
      document.querySelectorAll('.reserve-cta-large, .exp-cta, .btn-reserve').forEach(function (btn) {
        btn.classList.add('max-magnet');
        var qx = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
        var qy = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          qx((e.clientX - (r.left + r.width / 2)) * 0.3);
          qy((e.clientY - (r.top + r.height / 2)) * 0.3);
        });
        btn.addEventListener('mouseleave', function () { qx(0); qy(0); });
      });

      /* FAQの開閉で高さが変わるので発火位置を再計算 */
      document.querySelectorAll('details.faq-item').forEach(function (d) {
        d.addEventListener('toggle', function () { ScrollTrigger.refresh(); });
      });

      window.addEventListener('load', function () { ScrollTrigger.refresh(); });

    }).catch(function (e) { clearTimeout(failsafe); dropCurtain(); console.warn('gsap-max: load failed', e); });
  });
})();
/* /wp-gsap-animate */
