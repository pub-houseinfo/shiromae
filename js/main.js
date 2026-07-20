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

// IntersectionObserverでフェードアップ
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.section, .room-block').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});
