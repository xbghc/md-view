/**
 * Vite plugin that renders every (template, sample) pair with Pandoc and exposes
 * the result to the browser through the `virtual:md-view/previews` module, as a
 * document per pair plus one stylesheet per template.
 *
 * Pandoc is invoked exactly as md-open.py invokes it, except that no `--css` is
 * passed: the stylesheet is resolved here instead and handed to the stories as
 * plain text, so the preview can force a colour scheme or the print styles
 * without re-running Pandoc.
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PANDOC = process.platform === 'win32' ? 'pandoc.exe' : 'pandoc';
const VIRTUAL_ID = 'virtual:md-view/previews';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/**
 * Directories scanned for sample Markdown, in the order they appear in the
 * sidebar. A file name that occurs in both directories is taken from the first.
 */
const SAMPLE_DIRS = ['stories/samples', 'examples'];

const IMPORT_RULE = /@import\s+(?:url\(\s*)?(['"]?)([^'")]+)\1\s*\)?\s*;/g;

function hash(text) {
  return createHash('sha1').update(text).digest('hex');
}

/**
 * Returns the flag that embeds resources into the output. Older Pandoc releases
 * spell it `--self-contained`, which is also how md-open.py probes for it.
 */
function detectEmbedFlag() {
  let help;
  try {
    help = execFileSync(PANDOC, ['--help'], { encoding: 'utf8' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('未找到 pandoc，Storybook 无法渲染预览。Ubuntu / Debian 中可运行：sudo apt install pandoc');
    }
    throw error;
  }
  return help.includes('--embed-resources') ? '--embed-resources' : '--self-contained';
}

/** Reads a stylesheet and inlines its local `@import`s, returning the files it touched. */
function readStylesheet(file, seen = new Set()) {
  const abs = path.resolve(file);
  if (seen.has(abs)) return { css: '', files: [] };
  seen.add(abs);
  const files = [abs];
  const css = readFileSync(abs, 'utf8').replace(IMPORT_RULE, (rule, _quote, href) => {
    if (/^[a-z]+:/i.test(href) || href.startsWith('//')) return rule;
    const nested = readStylesheet(path.resolve(path.dirname(abs), href), seen);
    files.push(...nested.files);
    return nested.css;
  });
  return { css, files };
}

function listTemplates() {
  const dir = path.join(ROOT, 'templates');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      id: entry.name,
      template: path.join(dir, entry.name, 'template.html'),
      style: path.join(dir, entry.name, 'style.css'),
    }))
    .filter((tpl) => existsSync(tpl.template) && existsSync(tpl.style));
}

function listSamples() {
  const samples = [];
  const seen = new Set();
  for (const relative of SAMPLE_DIRS) {
    const dir = path.join(ROOT, relative);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith('.md') || seen.has(name)) continue;
      seen.add(name);
      const file = path.join(dir, name);
      const source = readFileSync(file, 'utf8');
      const heading = source.match(/^#\s+(.+)$/m);
      samples.push({
        id: path.basename(name, '.md'),
        title: heading ? heading[1].trim() : path.basename(name, '.md'),
        file,
        source,
      });
    }
  }
  return samples;
}

export function pandocPreviews() {
  /** Pandoc output keyed by template + Markdown content, so CSS edits never re-run Pandoc. */
  const cache = new Map();
  let embed = '--embed-resources';
  let watched = new Set();

  function render(template, templateHash, sample) {
    const key = `${templateHash}:${hash(sample.source)}`;
    let html = cache.get(key);
    if (html === undefined) {
      html = execFileSync(
        PANDOC,
        [
          sample.file,
          '--from=gfm',
          '--to=html5',
          '--standalone',
          embed,
          '--metadata',
          `pagetitle=${sample.id}`,
          '--template',
          template.template,
        ],
        { cwd: path.dirname(sample.file), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
      );
      cache.set(key, html);
    }
    return html;
  }

  function build() {
    const templates = listTemplates();
    const samples = listSamples();
    if (templates.length === 0) throw new Error('templates/ 下没有找到完整的模板（需要 template.html 与 style.css）。');
    if (samples.length === 0) throw new Error(`${SAMPLE_DIRS.join(' 与 ')} 下没有找到 Markdown 样例。`);

    const files = new Set(samples.map((sample) => sample.file));
    const styles = {};
    const documents = {};
    for (const template of templates) {
      const { css, files: styleFiles } = readStylesheet(template.style);
      files.add(template.template);
      styleFiles.forEach((file) => files.add(file));
      styles[template.id] = css;
      documents[template.id] = {};
      const templateHash = hash(readFileSync(template.template, 'utf8'));
      for (const sample of samples) {
        documents[template.id][sample.id] = render(template, templateHash, sample);
      }
    }
    watched = files;

    return {
      templates: templates.map((tpl) => tpl.id),
      samples: samples.map(({ id, title }) => ({ id, title })),
      styles,
      documents,
    };
  }

  return {
    name: 'md-view:pandoc-previews',
    enforce: 'pre',

    buildStart() {
      embed = detectEmbedFlag();
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_ID) return null;
      const data = build();
      // Every watched file is declared so `vite build` also tracks them.
      watched.forEach((file) => this.addWatchFile(file));
      return [
        `export const templates = ${JSON.stringify(data.templates)};`,
        `export const samples = ${JSON.stringify(data.samples)};`,
        `export const styles = ${JSON.stringify(data.styles)};`,
        `export const documents = ${JSON.stringify(data.documents)};`,
      ].join('\n');
    },

    handleHotUpdate({ file, server }) {
      if (!watched.has(path.resolve(file))) return;
      const module = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (!module) return;
      server.moduleGraph.invalidateModule(module);
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}

export default pandocPreviews;
