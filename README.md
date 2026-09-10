# Markdown HTML/CSS 样式模板

此目录存储 Markdown 渲染使用的 HTML/CSS 样式模板。输入任意 Markdown 文件，脚本使用 Pandoc 套用所选模板，生成独立 HTML 到 WSL 的 `/tmp/md-preview-*/index.html`，再通过 `xdg-open` 打开。

## 推荐：通过 npm 安装 `md` 命令

在 WSL 中准备 Node.js 18+、npm，以及系统依赖：

```bash
sudo apt update
sudo apt install python3 pandoc xdg-utils git
```

将本项目上传到 GitHub 后，可直接从仓库全局安装，无需发布到 npm，也无需配置 `.bashrc`（将下面地址替换为实际仓库地址）：

```bash
npm install -g git+https://github.com/OWNER/REPO.git
md a.md
md a.md --template default
md a.md --no-open
```

默认使用 GitHub 主题。请在 WSL 终端中使用 WSL 内的 Node.js/npm 安装和运行。npm 安装会注册 `md` 命令并携带样式文件，Python、Pandoc 和 `xdg-open` 仍需由系统提供。

当前文件夹尚未关联 GitHub 仓库，也可先在本地安装：

```bash
cd /mnt/c/WorkSpaces/md-template
npm install -g .
md a.md
```

安装后可在任意目录使用，`a.md` 相对于当前工作目录解析。更新远程版本时重新执行上述仓库安装命令；卸载使用 `npm uninstall -g md-template-preview`。修改本地模板进行开发时，也可在项目目录使用 `npm link`。

如果之前配置过 `md()` 函数，请删除 `.bashrc` 中该函数，并在当前终端执行 `unset -f md`，让命令使用 npm 安装的入口。

## 可选：通过 `.bashrc` 配置 `md` 命令

在 WSL 中安装依赖（Ubuntu / Debian）：

```bash
sudo apt update
sudo apt install python3 pandoc xdg-utils
```

将下面的函数添加到 `~/.bashrc` 末尾，脚本路径请按实际存放位置修改：

```bash
md() {
  python3 /mnt/c/WorkSpaces/md-template/md-open.py --template github "$@"
}
```

执行 `source ~/.bashrc` 使配置在当前终端生效，之后可以在任意目录使用：

```bash
md a.md                          # 用 GitHub 主题打开当前目录的 a.md
md "我的笔记.md"                  # 文件名有空格时也用引号包裹
md a.md --template default        # 切换主题
md a.md --no-open                 # 只生成 HTML，打印路径
```

`md a.md` 会调用 `xdg-open` 打开生成的 HTML，实际浏览器取决于 WSL 的默认应用配置。

## 目录结构

```text
md-open.py
templates/
  default/
    template.html   # HTML 页面结构，使用 Pandoc 模板语法
    style.css       # 排版、颜色、深浅色和打印样式
  github/
    template.html   # GitHub 风格页面
    style.css       # 980px 最大宽度与响应式布局
    github-markdown.css  # 本地保存的上游样式 v5.9.0
    LICENSE         # 上游 MIT 许可证
```

## 安装与使用

在 WSL 的 Ubuntu / Debian 中执行：

```bash
sudo apt update
sudo apt install python3 pandoc xdg-utils

cd /mnt/c/WorkSpaces/md-template
python3 md-open.py "$HOME/我的笔记.md"
python3 md-open.py "$HOME/我的笔记.md" --template default
python3 md-open.py "$HOME/我的笔记.md" --template github

# 只转换，标准输出为生成的 HTML 路径
python3 md-open.py "$HOME/我的笔记.md" --no-open
```

脚本仅使用 `xdg-open` 打开 HTML。实际打开的程序取决于 WSL 中的默认应用配置；若要使用 Windows 浏览器，需要该配置能够将 HTML 文件交给 Windows 浏览器处理。

如果 `xdg-open` 不存在或打开失败，脚本报错并保留生成的 HTML，不尝试其他打开方式。`--no-open` 不依赖 `xdg-open`。

按开头说明安装或配置后，也可直接使用 `md 文件.md`。输入支持中文、空格及绝对路径；模板始终从脚本所在目录加载。手动配置且使用 Zsh 时可将同一函数添加到 `~/.zshrc` 并执行 `source ~/.zshrc`。

## 添加自己的样式模板

已内置 `github` 主题，基于 [github-markdown-css](https://github.com/sindresorhus/github-markdown-css) v5.9.0，支持自动深浅色切换。页面最大宽度为 980px（含内边距），可在 `templates/github/style.css` 中修改。上游 CSS 已保存到本地，转换后嵌入 HTML。

可以先用内置的排版示例预览模板（示例内容位于 `examples/`，样式位于 `templates/`）：

```bash
python3 md-open.py examples/preview.md --template default
python3 md-open.py examples/preview.md --template github
```

复制默认模板目录，然后修改 HTML 和 CSS：

```bash
cp -r templates/default templates/my-style
# 编辑 templates/my-style/template.html 和 style.css
python3 md-open.py "$HOME/我的笔记.md" --template my-style
```

每个模板目录必须包含 `template.html` 和 `style.css`。`--template` 接受 `templates/` 下的直接子目录名称。

HTML 使用 Pandoc 模板语法：

- `$body$`：Markdown 转换后的正文，放在需要插入内容的位置。
- `$pagetitle$`：浏览器标签页标题，默认取 Markdown 文件名。
- `$for(css)$ ... $endfor$`：加载脚本传入的 CSS，保留默认模板中的这段可使用同目录的 `style.css`。
- `$if(highlighting-css)$ ... $endif$`：插入 Pandoc 代码高亮样式。

可自行修改页面容器、页眉、页脚和排版。HTML 模板中如需字面量美元符号，写成 `$$`；独立 CSS 文件中正常写即可。

## 渲染与临时文件

- 使用 GitHub Flavored Markdown，支持表格、任务列表和代码块。
- 默认模板提供响应式排版、深浅色和打印样式。
- CSS 和 Pandoc 支持的图片资源嵌入 HTML；Markdown 中的相对资源路径以输入文件所在目录为基准，远程图片需要联网读取。
- HTML 模板中新增的相对资源地址也以输入文件所在目录为基准；模板自己的图片建议使用绝对路径或 data URI。
- 普通超链接不会嵌入或转换；其他 Markdown 文件不会自动生成对应预览。
- 每次生成新的临时目录。转换失败时清理本次目录，成功后保留 HTML。修改输入或模板后需重新运行脚本。
- 旧预览可手动清理对应的 `/tmp/md-preview-*` 目录；系统也可能按自己的临时文件策略清理。
- Mermaid 等扩展未配置专门渲染器。

脚本依赖 Python 标准库和 Pandoc，无需安装 Python 包。Windows 原生运行支持 `--no-open`，输出保存在 Windows 临时目录；浏览器自动打开针对 WSL/Linux 设计。
