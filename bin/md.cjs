#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const python = process.platform === 'win32' ? 'python' : 'python3';
const script = path.join(__dirname, '..', 'md-open.py');
const result = spawnSync(python, [script, '--template', 'github', ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(`无法启动 ${python}：${result.error.message}`);
  console.error('请先安装 Python 3；WSL Ubuntu / Debian 可运行 sudo apt install python3。');
  process.exit(1);
}

process.exit(result.status ?? 1);
