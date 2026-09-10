#!/usr/bin/env python3
"""Render Markdown with Pandoc and open the resulting HTML from WSL."""

import argparse
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


def open_html(html):
    xdg_open = shutil.which("xdg-open")
    if not xdg_open:
        raise RuntimeError("HTML 已生成，但未找到 xdg-open。请安装提供该命令的 xdg-utils。")
    try:
        subprocess.run([xdg_open, str(html)], check=True, capture_output=True, text=True)
    except (OSError, subprocess.CalledProcessError) as exc:
        detail = getattr(exc, "stderr", None) or str(exc)
        raise RuntimeError(f"HTML 已生成，但 xdg-open 打开失败：\n{detail}") from exc


def main():
    parser = argparse.ArgumentParser(description="将 Markdown 转换为临时 HTML，并在浏览器中打开。")
    parser.add_argument("markdown", type=Path, help="Markdown 文件路径")
    parser.add_argument("--template", default="default", help="templates/ 下的样式模板名称（默认：default）")
    parser.add_argument("--no-open", action="store_true", help="只转换，打印 HTML 路径")
    args = parser.parse_args()
    source = args.markdown.expanduser().resolve()
    if not source.is_file():
        parser.error(f"文件不存在或不是普通文件：{source}")
    pandoc = shutil.which("pandoc")
    if not pandoc:
        parser.error("未找到 pandoc。Ubuntu / Debian 中可运行：sudo apt install pandoc")
    templates = Path(__file__).resolve().parent / "templates"
    if args.template in (".", "..") or any(char in args.template for char in "/\\"):
        parser.error("模板名称必须是 templates/ 下的直接子目录名称")
    template_dir = templates / args.template
    template = template_dir / "template.html"
    css = template_dir / "style.css"
    if not template.is_file() or not css.is_file():
        parser.error(f"样式模板不完整：{template_dir}，需要 template.html 和 style.css")
    # WSL/Linux output always lives in /tmp; other platforms support conversion too.
    output_dir = Path(tempfile.mkdtemp(prefix="md-preview-", dir="/tmp" if sys.platform == "linux" else None))
    html = output_dir / "index.html"
    try:
        # Older Ubuntu releases ship Pandoc without --embed-resources.
        help_text = subprocess.check_output([pandoc, "--help"], text=True)
        embed_option = "--embed-resources" if "--embed-resources" in help_text else "--self-contained"
        subprocess.run([
            pandoc, str(source), "--from=gfm", "--to=html5", "--standalone",
            embed_option, "--metadata", f"pagetitle={source.stem}",
            "--template", str(template), "--css", str(css), "--output", str(html),
        ], cwd=source.parent, check=True)
    except (OSError, subprocess.CalledProcessError) as exc:
        shutil.rmtree(output_dir)
        print(f"转换失败：{exc}", file=sys.stderr)
        return 1
    print(html, flush=True)
    if not args.no_open:
        try:
            open_html(html)
        except RuntimeError as exc:
            print(exc, file=sys.stderr)
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
