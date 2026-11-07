const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menuButton=document.querySelector('.menu-toggle'),nav=document.querySelector('.main-nav');menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
const articleBody=document.querySelector('.article-body');
function initToc(){
 const headings=[...articleBody.querySelectorAll('h2,h3')];const toc=document.getElementById('article-toc'),list=document.getElementById('article-toc-list');
 if(!headings.length)return;
 const used=new Set([...document.querySelectorAll('[id]')].map(el=>el.id));
 headings.forEach((heading,index)=>{
  if(!heading.id){let id='section-'+(index+1);while(used.has(id))id+='-x';heading.id=id;used.add(id);}
  const li=document.createElement('li');if(heading.tagName==='H3')li.className='toc-sub';
  const link=document.createElement('a');link.href='#'+encodeURIComponent(heading.id);link.textContent=heading.textContent;li.append(link);list.append(li);
 });toc.hidden=false;
}
function initShare(){
 const url=location.href.split('#')[0],title=document.querySelector('article h1')?.textContent||document.title;
 const feedback=document.getElementById('share-feedback');
 const show=t=>{feedback.textContent=t;};
 document.getElementById('share-line').href='https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(url);
 const native=document.getElementById('share-native');if(!navigator.share)native.hidden=true;
 native.addEventListener('click',async()=>{try{await navigator.share({title,url});}catch(e){if(e.name!=='AbortError')show('分享失敗，請使用複製連結。');}});
 document.getElementById('share-copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(url);show('連結已複製！');}
  catch(e){const input=document.createElement('textarea');input.value=url;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();const ok=document.execCommand('copy');input.remove();show(ok?'連結已複製！':'無法自動複製，請從網址列複製連結。');}
 });
}
async function loadArticle(){
 const id=document.body.dataset.articleId;
 try{
  const r=await fetch('../data/articles.json');if(!r.ok)throw Error('文章資料載入失敗');
  const articles=await r.json(),article=articles.find(a=>a.id===id);if(!article)throw Error('找不到對應文章 ID：'+id);
  document.getElementById('article-label').textContent=article.categoryLabel;
  const category=document.getElementById('article-category');category.textContent=article.category==='game'?'遊戲':'體育';
  const date=document.getElementById('article-date');date.textContent='發布：'+article.date.replaceAll('-','/');date.dateTime=article.date;
  document.getElementById('article-author').textContent=article.author||'NEXTPLAY 編輯部';
  const related=articles.filter(a=>a.id!==id&&a.category===article.category).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  document.getElementById('related-grid').innerHTML=related.length?related.map(a=>`<a class="article-card" href="../${encodeURI(a.url)}"><img loading="lazy" src="${escapeHTML(a.image)}" alt="${escapeHTML(a.title)}"><div class="card-meta"><span class="category">${escapeHTML(a.categoryLabel)}</span><time datetime="${escapeHTML(a.date)}">${escapeHTML(a.date.replaceAll('-','/'))}</time></div><h3>${escapeHTML(a.title)}</h3></a>`).join(''):'<p>目前沒有相關文章。</p>';
 }catch(e){console.error(e);document.getElementById('related-grid').textContent='延伸閱讀暫時無法載入，請檢查文章 ID 與資料檔。';}
}
initToc();initShare();loadArticle();
