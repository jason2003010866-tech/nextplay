
const escapeHTML = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

const btn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

btn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
  btn.textContent = open ? '✕' : '☰';
});

const grid = document.getElementById('category-grid');
const more = document.getElementById('load-more');
const sort = document.getElementById('sort-order');
const count = document.getElementById('article-count');
const status = document.getElementById('category-status');

const PAGE_SIZE = 6;

let articles = [];
let visible = PAGE_SIZE;

/* 文章卡片 */
function card(a) {
  return `
    <a class="article-card" href="${escapeHTML(encodeURI(a.url))}">

      <img
        loading="lazy"
        src="${escapeHTML(a.image)}"
        alt="${escapeHTML(a.title)}"
      >

      <div class="card-content">

        <div class="card-meta">
          <span class="category">
            ${escapeHTML(a.categoryLabel)}
          </span>

          <time datetime="${escapeHTML(a.date)}">
            ${escapeHTML(a.date.replaceAll('-', '/'))}
          </time>
        </div>

        <h3>${escapeHTML(a.title)}</h3>

        <p>${escapeHTML(a.summary)}</p>

      </div>

    </a>
  `;
}

/* 文章排序 */
function ordered() {
  const items = [...articles];

  if (sort.value === 'oldest') {
    items.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sort.value === 'title') {
    items.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'));
  } else {
    items.sort((a, b) => b.date.localeCompare(a.date));
  }

  return items;
}

/* 顯示文章 */
function render() {
  const items = ordered();

  grid.innerHTML = items.length
    ? items.slice(0, visible).map(card).join('')
    : '<p class="loading">目前沒有文章。</p>';

  more.hidden = visible >= items.length;

  count.textContent = `共 ${items.length} 篇文章`;

  status.textContent =
    `目前顯示 ${Math.min(visible, items.length)} 篇，共 ${items.length} 篇文章`;
}

/* 載入更多 */
more.addEventListener('click', () => {
  visible += PAGE_SIZE;
  render();
});

/* 切換排序 */
sort.addEventListener('change', () => {
  visible = PAGE_SIZE;
  render();
});

/* 載入文章資料 */
async function init() {
  try {
    const r = await fetch('data/articles.json');

    if (!r.ok) throw Error('載入失敗');

    const data = await r.json();

    if (!Array.isArray(data)) {
      throw Error('資料格式錯誤');
    }

    articles = data.filter(
      a => a.category === document.body.dataset.category
    );

    render();

  } catch (e) {
    console.error(e);

    grid.textContent =
      '文章載入失敗，請檢查本機伺服器與 articles.json。';

    count.textContent = '無法取得文章數量';
  }
}

init();
