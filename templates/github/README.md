# GitHub 样式

上游：[sindresorhus/github-markdown-css](https://github.com/sindresorhus/github-markdown-css)

固定版本：**v5.9.0**，MIT 许可证，完整许可见 `LICENSE`。

- `github-markdown.css`：上游样式，含许可注释，自动适配系统深浅色。
- `style.css`：本地布局与 Pandoc 适配；修改 `max-width: 980px` 可调整页面最大宽度（包含左右内边距）。
- `template.html`：Pandoc HTML 页面模板；代码高亮由 Pandoc 提供，与 GitHub 的高亮配色可能不同。

桌面端左右内边距各 45px，767px 以下各 15px。样式保存在本地，转换时嵌入 HTML，预览无需从 CDN 加载 CSS。

```bash
python3 md-open.py examples/preview.md --template github
```
