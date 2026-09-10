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
