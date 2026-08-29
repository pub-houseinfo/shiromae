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

/* wp-gsap-animate: shiromae 全セクション 2026-08-29 */
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

  onReady(function () {
    ensureGsap().then(function () {
      gsap.registerPlugin(ScrollTrigger);

      /* --- ヒーロー：読み込み時のタイムライン（blur-in → slide-up → stagger） --- */
      var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('.hero-logo-wrap', { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1.1 })
        .fromTo('.hero-eyebrow', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9 }, '-=0.35')
        .fromTo('.hero-sub', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .fromTo('.hero-en', { opacity: 0 }, { opacity: 1, duration: 0.7 }, '-=0.45')
        .fromTo('.hero-meta > div', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, '-=0.3');

      // from状態を仕込み終えたので、チラつき防止スタイルを外す
      clearTimeout(failsafe); unveil();

      /* --- 各セクション見出し：ラベル→タイトル→リード文の順に slide-up --- */
      document.querySelectorAll('.section-header').forEach(function (h) {
        var items = h.querySelectorAll('.section-label, .section-title, .section-lead');
        if (!items.length) return;
        gsap.fromTo(items, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.12, scrollTrigger: { trigger: h, start: 'top 82%' } });
      });

      /* --- Concept：ステートメント fade + 3ステップ stagger-up --- */
      gsap.fromTo('.concept-statement', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: ST('.concept-statement') });
      gsap.fromTo('.concept-three-flow > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12, scrollTrigger: ST('.concept-three-flow') });

      /* --- Location：bentoセル stagger-up --- */
      gsap.fromTo('.bento-location .bento-cell', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1, scrollTrigger: ST('.bento-location') });

      /* --- Rooms：写真は image-reveal、情報は横から slide --- */
      document.querySelectorAll('.room-block').forEach(function (block) {
        var photo = block.querySelector('.room-photo-main');
        var thumbs = block.querySelectorAll('.room-photo-thumb');
        var plan = block.querySelector('.room-floor-plan');
        var info = block.querySelector('.room-info');
        var reverse = block.classList.contains('reverse');
        var tlr = gsap.timeline({ scrollTrigger: { trigger: block, start: 'top 75%' } });
        if (photo) tlr.fromTo(photo,
          { clipPath: reverse ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', scale: 1.08 },
          { clipPath: 'inset(0 0% 0 0%)', scale: 1, duration: 1.1, ease: 'power3.inOut' });
        if (thumbs.length) tlr.fromTo(thumbs, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 }, '-=0.4');
        if (plan) tlr.fromTo(plan, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.3');
        if (info) tlr.fromTo(info, { opacity: 0, x: reverse ? -40 : 40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, 0.35);
      });

      /* --- Amenities：控えめに stagger-fade --- */
      gsap.fromTo('.amenity-cell:not(.empty)', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.05, scrollTrigger: ST('.amenity-grid') });

      /* --- Experience：3ステップ stagger-up --- */
      gsap.fromTo('.exp-flow > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12, scrollTrigger: ST('.exp-flow') });

      /* --- Surroundings：bentoセル stagger-up --- */
      gsap.fromTo('.bento-surr .surr-cell', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1, scrollTrigger: ST('.bento-surr') });

      /* --- Dining：カード stagger-up --- */
      gsap.fromTo('.dining-card', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.09, scrollTrigger: ST('.dining-grid') });

      /* --- Pricing：カード stagger-up --- */
      gsap.fromTo('.price-card', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12, scrollTrigger: ST('.price-grid') });

      /* --- Reservation：CTA を zoom-in --- */
      gsap.fromTo('.reserve-cta-wrap', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: ST('.reserve-cta-wrap') });

      /* --- FAQ：stagger-fade --- */
      gsap.fromTo('.faq-item', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.06, scrollTrigger: ST('.faq-list') });

      /* --- Access：情報と地図を stagger --- */
      gsap.fromTo('.access-grid > *', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.15, scrollTrigger: ST('.access-grid') });

    }).catch(function (e) { clearTimeout(failsafe); unveil(); console.warn('gsap-animate: load failed', e); });
  });
})();
/* /wp-gsap-animate */
