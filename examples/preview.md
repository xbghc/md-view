# 默认样式预览

这份示例用于检查 HTML/CSS 模板的排版效果。你可以将同一份内容套用到不同样式，比较字体、间距和颜色。

## 文本与链接

正文包含 **粗体强调**、*斜体*、~~删除线~~ 和 `行内代码`。中英文混排示例：Markdown turns plain text into readable documents，适合笔记、技术文档与长篇阅读。

[示例链接](https://example.com)

> 好的排版让内容更容易阅读。
>
> 这里展示多段引用的颜色、缩进与边框。

## 列表与任务

1. 准备一份 Markdown 文件。
2. 选择 HTML/CSS 模板。
3. 在浏览器中查看转换结果。

- 简洁的标题层级
- 舒适的正文行距
- 自适应的内容宽度

- [x] 页面结构
- [x] 表格与代码样式
- [ ] 添加自己的主题

## 表格

| 元素 | 用途 | 状态 |
| :--- | :--- | :---: |
| 标题 | 建立内容层级 | 完成 |
| 代码块 | 展示命令与程序 | 完成 |
| 引用 | 补充说明 | 完成 |

## 代码块

```python
from pathlib import Path

def read_note(filename: str) -> str:
    """读取一份 Markdown 笔记。"""
    return Path(filename).read_text(encoding="utf-8")

print(read_note("笔记.md"))
```

```bash
python3 md-open.py examples/preview.md --template default
```

### 三级标题

在较窄的窗口中，正文自动换行，较宽的代码块和表格可以横向滚动。模板会跟随系统的深浅色偏好；使用浏览器打印预览可以查看打印样式。

---

预览结束。修改 `templates/default/style.css` 后，重新运行转换命令即可查看效果。
