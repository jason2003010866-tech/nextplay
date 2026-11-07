"""設定正式網址後，執行 python tools/configure_site.py https://USERNAME.github.io/REPO/"""
import sys,json,re,html
from pathlib import Path
from urllib.parse import urlsplit,urlunsplit,urljoin
from xml.etree.ElementTree import Element,SubElement,ElementTree
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:sys.exit('用法：python tools/configure_site.py https://USERNAME.github.io/REPO/')
raw=sys.argv[1].strip();p=urlsplit(raw)
if p.scheme!='https' or not p.netloc or p.query or p.fragment or p.username or p.password or p.hostname in ('localhost','127.0.0.1'):
 sys.exit('請提供正式公開的 HTTPS 網址（可含 GitHub Pages 專案路徑）')
base=urlunsplit((p.scheme,p.netloc,p.path.rstrip('/')+'/', '', ''))
articles=json.loads((root/'data/articles.json').read_text(encoding='utf-8'))
paths=['index.html','game.html','sports.html']+[a['url'] for a in articles]
for rel in paths:
 file=root/rel
 if not file.is_file():sys.exit('找不到文章檔案：'+rel)
 s=file.read_text(encoding='utf-8');url=urljoin(base,rel)
 # 重複執行也不會留下舊網址
 s=re.sub(r'<link rel="canonical"[^>]*>\n?', '',s)
 s=re.sub(r'<meta property="og:url"[^>]*>\n?', '',s)
 s=re.sub(r'<script type="application/ld\+json" data-site-url="true">.*?</script>\n?', '',s,flags=re.S)
 injection='<link rel="canonical" href="'+html.escape(url,quote=True)+'">\n<meta property="og:url" content="'+html.escape(url,quote=True)+'">\n'
 if rel.startswith('articles/'):
  a=next(x for x in articles if x['url']==rel)
  obj={'@context':'https://schema.org','@type':'BlogPosting','mainEntityOfPage':{'@type':'WebPage','@id':url},'url':url,'headline':a['title'],'datePublished':a['date'],'author':{'@type':'Organization','name':a.get('author','NEXTPLAY 編輯部')},'publisher':{'@type':'Organization','name':'NEXTPLAY'}}
  injection+='<script type="application/ld+json" data-site-url="true">'+json.dumps(obj,ensure_ascii=False).replace('<','\\u003c')+'</script>\n'
 s=s.replace('</head>',injection+'</head>',1);file.write_text(s,encoding='utf-8')
site=Element('urlset',{'xmlns':'http://www.sitemaps.org/schemas/sitemap/0.9'})
for rel in paths:
 node=SubElement(site,'url');SubElement(node,'loc').text=urljoin(base,rel)
 a=next((x for x in articles if x['url']==rel),None)
 if a:SubElement(node,'lastmod').text=a['date']
ElementTree(site).write(root/'sitemap.xml',encoding='utf-8',xml_declaration=True)
(root/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+urljoin(base,'sitemap.xml')+'\n',encoding='utf-8')
print('已產生 canonical、og:url、sitemap.xml、robots.txt；網站網址：'+base)
