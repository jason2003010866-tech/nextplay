// NEXTPLAY GA4：填入你的 G-XXXXXXXXXX 評估 ID 才會啟用。
// 請勿填入其他網站的 GA4 ID；localhost 不會傳送測試資料。
const NEXTPLAY_GA4_ID = 'G-XXXXXXXXXX';
if (/^G-[A-Z0-9]{6,}$/.test(NEXTPLAY_GA4_ID) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){window.dataLayer.push(arguments);};
  window.gtag('js', new Date());
  window.gtag('config', NEXTPLAY_GA4_ID);
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(NEXTPLAY_GA4_ID);
  document.head.appendChild(tag);
}
