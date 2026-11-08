
"""PlayScope SEO 自動化設定工具"""

import sys
import json
import re
import html
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, urljoin
from xml.etree.ElementTree import Element, SubElement, ElementTree

ROOT = Path(__file__).resolve().parents[1]

if len(sys.argv) != 2:
    sys.exit(
        "用法：python tools/configure_site.py "
        "https://USERNAME.github.io/REPO/"
    )

raw = sys.argv[1].strip()
p = urlsplit(raw)

if (
    p.scheme != "https"
    or not p.netloc
    or p.query
    or p.fragment
    or p.username
    or p.password
    or p.hostname in ("localhost", "127.0.0.1")
):
    sys.exit("請提供正式公開的 HTTPS 網址")

base = urlunsplit((
    p.scheme,
    p.netloc,
    p.path.rstrip("/") + "/",
    "",
    ""
))

articles = json.loads(
    (ROOT / "data/articles.json").read_text(encoding="utf-8")
)

paths = [
    "index.html",
    "game.html",
    "sports.html"
] + [a["url"] for a in articles]

# 執行前先確認所有檔案存在
for rel in paths:
    if not (ROOT / rel).is_file():
        sys.exit("找不到 HTML 檔案：" + rel)

# 更新每個頁面的 SEO 資訊
for rel in paths:
    file = ROOT / rel
    content = file.read_text(encoding="utf-8")
    url = urljoin(base, rel)

    # 移除既有 Canonical 與 og:url，避免重複
    content = re.sub(
        r'^[ \t]*<link\b(?=[^>]*\brel=["\']canonical["\'])[^>]*>\s*\n?',
        "",
        content,
        flags=re.I | re.M
    )

    content = re.sub(
        r'^[ \t]*<meta\b(?=[^>]*\bproperty=["\']og:url["\'])[^>]*>\s*\n?',
        "",
        content,
        flags=re.I | re.M
    )

    # 移除本工具先前產生的 JSON-LD
    content = re.sub(
        r'^[ \t]*<script type="application/ld\+json" '
        r'data-site-url="true">.*?</script>\s*\n?',
        "",
        content,
        flags=re.S | re.M
    )

    injection = (
        '<link rel="canonical" href="'
        + html.escape(url, quote=True)
        + '">\n'
        + '<meta property="og:url" content="'
        + html.escape(url, quote=True)
        + '">\n'
    )

    # 文章頁自動加入 BlogPosting 結構化資料
    if rel.startswith("articles/"):
        article = next(
            a for a in articles if a["url"] == rel
        )

        schema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": url
            },
            "url": url,
            "headline": article["title"],
            "datePublished": article["date"],
            "author": {
                "@type": "Person",
                "name": article.get("author", "Jason")
            },
            "publisher": {
                "@type": "Organization",
                "name": "PlayScope"
            }
        }

        injection += (
            '<script type="application/ld+json" '
            'data-site-url="true">\n'
            + json.dumps(schema, ensure_ascii=False, indent=2)
            + '\n</script>\n'
        )

    if "</head>" not in content:
        sys.exit("找不到 </head>：" + rel)

    content = content.replace(
        "</head>",
        injection + "</head>",
        1
    )

    file.write_text(content, encoding="utf-8")

# 產生 Sitemap
site = Element(
    "urlset",
    {"xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
)

for rel in paths:
    node = SubElement(site, "url")
    SubElement(node, "loc").text = urljoin(base, rel)

    article = next(
        (a for a in articles if a["url"] == rel),
        None
    )

    if article:
        SubElement(node, "lastmod").text = article["date"]

ElementTree(site).write(
    ROOT / "sitemap.xml",
    encoding="utf-8",
    xml_declaration=True
)

# 產生 robots.txt
(ROOT / "robots.txt").write_text(
    "User-agent: *\n"
    "Allow: /\n"
    "Sitemap: " + urljoin(base, "sitemap.xml") + "\n",
    encoding="utf-8"
)

print("PlayScope SEO 設定完成！")
print("網站網址：" + base)
print("已產生：Canonical、og:url、BlogPosting、Sitemap、robots.txt")
