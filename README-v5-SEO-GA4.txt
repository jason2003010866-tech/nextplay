NEXTPLAY v5｜SEO 與 GA4 使用說明

一、已加入：每頁 meta description、Open Graph、Twitter Card；文章有 BlogPosting JSON-LD。
注意：這些資訊不保證搜尋排名或搜尋結果一定呈現特定樣式。

二、GA4：開啟 js/analytics.js，把 G-XXXXXXXXXX 換成你自己的 GA4 評估 ID。
未填入時不會送出追蹤資料。本機 localhost 預覽時不送資料。
若正式上線有使用分析 Cookie，請評估隱私告知與同意管理需求。

三、正式上線後：
在 nextplay 資料夾內執行：
python tools/configure_site.py https://USERNAME.github.io/REPO/
請換成你真正的 GitHub Pages 網址（專案網站請保留 /REPO/）。
這會產生 canonical、og:url、sitemap.xml、robots.txt。
每次新增文章後，重新執行指令，讓 Sitemap 收錄新文章。
然後把變更 push 到 GitHub，使用 Search Console 提交 sitemap.xml。

四、重要提醒：
1. 目前六篇文章是示範稿，正式公開前應替換為有價值的原創文章。
2. articles.json 的標題、摘要、日期與文章 HTML 應保持一致。
3. 新文章從 templates/article-template.html 複製；模板已包含 SEO 基礎標籤，但新增文章時仍需填入標題摘要及封面。
4. 如新增文章，請先在 articles.json 登記，再執行 configure_site.py。
5. Sitemap 和 robots.txt 只有設定正式網址後才會產生；不要把 localhost 提交搜尋引擎。
