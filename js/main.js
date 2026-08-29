// ヘッダーのDarkモード切り替え（ヒーローを抜けたら通常背景）
const header = document.getElementById('siteHeader');
const hero = document.getElementById('top');
const checkHeader = () => {
  const heroBottom = hero.getBoundingClientRect().bottom;
  if (heroBottom < 80) header.classList.remove('dark');
  else header.classList.add('dark');
};
window.addEventListener('scroll', checkHeader, { passive: true });
checkHeader();

// スムーススクロール（ヘッダーオフセット）
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const offsetY = target.getBoundingClientRect().top + window.pageYOffset - 64;
    window.scrollTo({ top: offsetY, behavior: 'smooth' });
  });
});

/* wp-gsap-animate: shiromae 全セクション（派手版） 2026-08-29 */
// GSAP + ScrollTrigger によるスクロールアニメーション。
// CDN読込に失敗した場合は何もせず静的表示のまま（要素を隠しっぱなしにしない）。
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ヒーローの初期チラつき防止（GSAP読込前に素の状態が一瞬見えるのを防ぐ）
  var preStyle = document.createElement('style');
  preStyle.textContent = '.hero-logo-wrap,.hero-eyebrow,.hero-title,.hero-sub,.hero-en,.hero-meta>div{opacity:0}';
  document.head.appendChild(preStyle);
  function unveil() { if (preStyle.parentNode) preStyle.parentNode.removeChild(preStyle); }
  var failsafe = setTimeout(unveil, 2500); // 読込が遅くても2.5秒で必ず表示

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function ensureGsap() {
    var p = Promise.resolve();
    if (!window.gsap) p = p.then(function () { return loadScript('https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js'); });
    return p.then(function () {
      if (!window.ScrollTrigger) return loadScript('https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js');
    });
  }
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function ST(trigger) { return { trigger: trigger, start: 'top 80%' }; }

  // 子要素（accent・ka・br等）の構造を保ったまま1文字ずつ<span>に分割する
  function splitCharsDeep(el) {
    if (!el) return [];
    if (!el.dataset.wgaSplit) {
      el.dataset.wgaSplit = '1';
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            if (/^\s*$/.test(n.textContent)) return; // 整形用の空白はそのまま
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

  onReady(function () {
    ensureGsap().then(function () {
      gsap.registerPlugin(ScrollTrigger);

      /* --- ヒーロー：Ken Burns＋1文字ずつのタイトル --- */
      var heroSec = document.querySelector('.hero');
      if (heroSec) heroSec.style.overflow = 'hidden'; // パララックスのはみ出し防止

      gsap.fromTo('.hero-bg', { scale: 1.14 }, { scale: 1, duration: 3.2, ease: 'power2.out' });

      var heroChars = splitCharsDeep(document.querySelector('.hero-title'));
      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('.hero-logo-wrap', { opacity: 0, filter: 'blur(10px)', y: 20 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.1 })
        .fromTo('.hero-eyebrow', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .set('.hero-title', { opacity: 1 }, '-=0.4')
        .fromTo(heroChars, { opacity: 0, y: 34, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.05 }, '<')
        .fromTo('.hero-sub', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
        .fromTo('.hero-en', { opacity: 0 }, { opacity: 1, duration: 0.7 }, '-=0.45')
        .fromTo('.hero-meta > div', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, '-=0.3');

      // 背景パララックス（スクロールで写真がゆっくり沈む）
      gsap.to('.hero-bg', { yPercent: 16, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

      // SCROLL表示のふわふわ浮遊
      gsap.to('.scroll-hint', { y: 10, duration: 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true });

      // from状態を仕込み終えたので、チラつき防止スタイルを外す
      clearTimeout(failsafe); unveil();

      /* --- 各セクション見出し：タイトルは1文字ずつblur reveal --- */
      document.querySelectorAll('.section-header').forEach(function (h) {
        var label = h.querySelector('.section-label');
        var title = h.querySelector('.section-title');
        var lead = h.querySelector('.section-lead');
        var tlh = gsap.timeline({ scrollTrigger: { trigger: h, start: 'top 82%' } });
        if (label) tlh.fromTo(label, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
        if (title) {
          var chars = splitCharsDeep(title);
          tlh.fromTo(chars, { opacity: 0, y: 28, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out', stagger: 0.035 }, '-=0.35');
        }
        if (lead) tlh.fromTo(lead, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3');
      });

      /* --- Concept：ステートメント fade + 3ステップ stagger-up（◆は回転ポップ） --- */
      gsap.fromTo('.concept-statement', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out', scrollTrigger: ST('.concept-statement') });
      gsap.fromTo('.concept-three-flow .flow-item', { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.16, scrollTrigger: ST('.concept-three-flow') });
      gsap.from('.concept-three-flow .flow-arrow', { opacity: 0, rotation: 225, scale: 0, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.2, delay: 0.3, scrollTrigger: ST('.concept-three-flow') });

      /* --- Location：bentoセル stagger-up + 数字カウントアップ --- */
      gsap.fromTo('.bento-location .bento-cell', { opacity: 0, y: 44, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power2.out', stagger: 0.12, scrollTrigger: ST('.bento-location') });
      document.querySelectorAll('.bento-location .big-number').forEach(function (el) {
        var tn = el.firstChild;
        if (!tn || tn.nodeType !== 3) return;
        var end = parseInt(tn.textContent, 10);
        if (isNaN(end)) return;
        var obj = { v: 0 };
        gsap.to(obj, { v: end, duration: 1.4, ease: 'power2.out', scrollTrigger: ST('.bento-location'),
          onUpdate: function () { tn.textContent = Math.round(obj.v); } });
      });

      /* --- Rooms：写真は image-reveal、飾り文字はズーム、情報は横から slide --- */
      document.querySelectorAll('.room-block').forEach(function (block) {
        var photo = block.querySelector('.room-photo-main');
        var kanji = block.querySelector('.room-kanji-deco');
        var thumbs = block.querySelectorAll('.room-photo-thumb');
        var plan = block.querySelector('.room-floor-plan');
        var info = block.querySelector('.room-info');
        var reverse = block.classList.contains('reverse');
        var tlr = gsap.timeline({ scrollTrigger: { trigger: block, start: 'top 75%' } });
        if (photo) tlr.fromTo(photo,
          { clipPath: reverse ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', scale: 1.1 },
          { clipPath: 'inset(0 0% 0 0%)', scale: 1, duration: 1.2, ease: 'power3.inOut' });
        if (kanji) tlr.from(kanji, { opacity: 0, scale: 1.5, filter: 'blur(10px)', duration: 1.1, ease: 'power2.out' }, '-=0.5');
        if (thumbs.length) tlr.fromTo(thumbs, { opacity: 0, y: 28, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.4)', stagger: 0.1 }, '-=0.6');
        if (plan) tlr.fromTo(plan, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.3');
        if (info) tlr.fromTo(info, { opacity: 0, x: reverse ? -60 : 60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out' }, 0.4);
      });

      /* --- Amenities：アイコンがポップに弾む --- */
      gsap.fromTo('.amenity-cell:not(.empty)', { opacity: 0, y: 26, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.7)', stagger: 0.06, scrollTrigger: ST('.amenity-grid') });

      /* --- Experience：3ステップ stagger-up（◆は回転ポップ） --- */
      gsap.fromTo('.exp-flow .exp-step', { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.16, scrollTrigger: ST('.exp-flow') });
      gsap.from('.exp-flow .exp-arrow', { opacity: 0, rotation: 225, scale: 0, duration: 0.8, ease: 'back.out(1.7)', stagger: 0.2, delay: 0.3, scrollTrigger: ST('.exp-flow') });
      gsap.fromTo('.exp-cta', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: ST('.exp-flow') });

      /* --- Surroundings：中央から広がる stagger --- */
      gsap.fromTo('.bento-surr .surr-cell', { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out', stagger: { each: 0.12, from: 'start' }, scrollTrigger: ST('.bento-surr') });

      /* --- Dining：カードが両端から中央へ集まる --- */
      gsap.fromTo('.dining-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: { each: 0.1, from: 'edges' }, scrollTrigger: ST('.dining-grid') });

      /* --- Pricing：カード zoom-in --- */
      gsap.fromTo('.price-card', { opacity: 0, y: 36, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'back.out(1.3)', stagger: 0.15, scrollTrigger: ST('.price-grid') });

      /* --- Reservation：CTA が力強く zoom-in --- */
      gsap.fromTo('.reserve-cta-wrap', { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'back.out(1.5)', scrollTrigger: ST('.reserve-cta-wrap') });

      /* --- FAQ：順番に左からスッと --- */
      gsap.fromTo('.faq-item', { opacity: 0, x: -36 }, { opacity: 1, x: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08, scrollTrigger: ST('.faq-list') });

      /* --- Access：情報と地図を stagger --- */
      gsap.fromTo('.access-grid > *', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.18, scrollTrigger: ST('.access-grid') });

    }).catch(function (e) { clearTimeout(failsafe); unveil(); console.warn('gsap-animate: load failed', e); });
  });
})();
/* /wp-gsap-animate */
