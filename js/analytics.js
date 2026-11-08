
/* PlayScope 專屬 GA4 追蹤設定 */
const PLAYSCOPE_GA4_ID = 'G-37952X7K6J';

// 本機測試時不傳送 GA4 資料
const isLocal = ['localhost', '127.0.0.1'].includes(
  window.location.hostname
);

if (!isLocal) {
  window.dataLayer = window.dataLayer || [];

  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', PLAYSCOPE_GA4_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src =
    'https://www.googletagmanager.com/gtag/js?id=' +
    encodeURIComponent(PLAYSCOPE_GA4_ID);

  document.head.appendChild(script);
}
