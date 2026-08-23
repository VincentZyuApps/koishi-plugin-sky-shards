const pkg = require('../package.json')

export const usage = `
<h1>Koishi 插件：Sky Shards 碎片查询</h1>
<h2>🎯 插件版本：v${pkg.version}</h2>

<p>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-sky-shards" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Koishi plugin GitHub">
  </a>
  <a href="https://github.com/VincentZyu233/sky-shards" target="_blank">
    <img src="https://img.shields.io/badge/Sky%20Shards%20Source-181717?style=flat-square&logo=github&logoColor=white" alt="Sky Shards source GitHub">
  </a>
</p>

<p>🔮 查询《光·遇》国服与国际服碎片，并将 Sky Shards 页面首屏渲染为图片。</p>

<h2>📌 指令</h2>
<pre>
国服碎片
国际服碎片 +1
国服碎片 20260824
</pre>

<p>🗓️ 参数留空时查询对应服务器时区的当天；仅支持 <code>yyyymmdd</code>、<code>+N</code> 与 <code>-N</code>。</p>

<h2>🕒 常用时区</h2>
<p>
  <a href="https://time.is/Shanghai" target="_blank">上海（Asia/Shanghai）</a> ・
  <a href="https://time.is/Los_Angeles" target="_blank">洛杉矶（America/Los_Angeles）</a> ・
  <a href="https://time.is/New_York" target="_blank">纽约（America/New_York）</a> ・
  <a href="https://time.is/London" target="_blank">伦敦（Europe/London）</a> ・
  <a href="https://time.is/Tokyo" target="_blank">东京（Asia/Tokyo）</a>
</p>

<h2>🤖 QQ 官方 Bot</h2>
<p>QQ 官方 Bot 会在截图后额外发送 Markdown 摘要，并附上国际服与国服的今日、明日、后日快捷按钮。</p>
`
