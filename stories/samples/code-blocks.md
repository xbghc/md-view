# 代码与高亮

这一份样例集中检查行内代码、代码块的配色、内边距与横向滚动。

## 行内代码

运行 `md a.md --template github` 即可使用 GitHub 样式；`--no-open` 只输出 HTML 路径而不打开浏览器。

## Python

```python
from pathlib import Path


def read_note(filename: str) -> str:
    """读取一份 Markdown 笔记。"""
    return Path(filename).read_text(encoding="utf-8")


print(read_note("笔记.md"))
```

## Shell

```bash
sudo apt install pandoc xdg-utils
python3 md-open.py examples/preview.md --template default
```

## CSS

```css
.markdown-body {
  box-sizing: border-box;
  max-width: 980px;
  margin: 0 auto;
  padding: 45px;
}
```

## 未标注语言

```
这一段没有声明语言，因此不会被高亮，用来对比有无高亮时的背景色与边框。
```

## 超长行

下面的代码块包含一条很长的命令，用来确认横向滚动而不是换行：

```bash
pandoc examples/preview.md --from=gfm --to=html5 --standalone --embed-resources --metadata pagetitle=preview --template templates/github/template.html --css templates/github/style.css --output /tmp/preview.html
```
