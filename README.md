# md-view

将wsl 中 markdown文件编译为html，然后用浏览器打开的工具

## 安装

### 依赖项

```bash
sudo apt update
sudo apt install python3 pandoc xdg-utils git
```

### 安装

```bash
npm install -g git+https://github.com/xbghc/md-view.git
md a.md
md a.md --template default
md a.md --no-open
```

## 开发模板

模板的 HTML 与 CSS 用 Storybook 预览。侧边栏按模板分组，每个故事是一份聚焦某类元素的 Markdown 样例，显示的是 pandoc 真实生成的完整 HTML 文档。

```bash
npm install
npm run storybook        # 开发服务器，默认 6006 端口
npm run build-storybook  # 输出静态站点到 storybook-static/
```

推送到 `master` 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages，可以在 <https://xbghc.github.io/md-view/> 查看最新的模板预览。

预览由本机的 pandoc 生成，渲染参数与 `md-open.py` 相同，因此运行前需要先安装 pandoc。样式表不交给 pandoc 内联，而是由故事注入到文档中，这样切换配色不必重新转换；修改 `style.css` 时也不会重新调用 pandoc。

工具栏中的**配色**可以强制浅色或深色，不必修改系统设置；**介质**切换到打印后，`@media print` 中的规则会同时生效。控制面板中的**宽度**用于收窄预览容器，检查响应式断点。

新增样例时，在 `stories/samples/` 下添加 `.md` 文件，并在 `stories/Default.stories.js` 与 `stories/Github.stories.js` 中各加一行 `export`；`examples/` 下的文件也会自动成为可选样例。新增模板时，在 `templates/` 下建立包含 `template.html` 与 `style.css` 的目录，再复制一份故事文件并修改模板名称。
