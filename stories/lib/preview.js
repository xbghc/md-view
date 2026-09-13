/**
 * Shared rendering helpers for the template stories.
 *
 * Each story shows a complete Pandoc document inside an iframe. A real document
 * is the only faithful preview here: the templates style `body` globally and
 * rely on `prefers-color-scheme`, so rendering them inline would collide with
 * Storybook's own styles.
 */

import { documents, samples, styles, templates } from 'virtual:md-view/previews';

const DARK_QUERY = /@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/g;
const PRINT_QUERY = /@media\s+print\b/g;

export const sampleIds = samples.map((sample) => sample.id);
export const sampleTitles = new Map(samples.map((sample) => [sample.id, sample.title]));
export const templateIds = templates;

export const WIDTHS = {
  自适应: 'auto',
  '手机 375px': '375',
  '平板 768px': '768',
  '笔记本 1024px': '1024',
  '桌面 1440px': '1440',
};

/**
 * Rewrites the media conditions so a story can force what the browser would
 * otherwise decide. `@media all` always matches and `@media not all` never does,
 * which turns each conditional block on or off without touching its rules.
 */
export function transformCss(css, { colorScheme = 'system', previewMode = 'screen' } = {}) {
  let output = css;
  if (colorScheme === 'dark') output = output.replace(DARK_QUERY, '@media all');
  if (colorScheme === 'light') output = output.replace(DARK_QUERY, '@media not all');
  if (previewMode === 'print') output = output.replace(PRINT_QUERY, '@media all');
  if (colorScheme !== 'system') output += `\n:root { color-scheme: ${colorScheme}; }\n`;
  return output;
}

/** Inserts the stylesheet into the document Pandoc produced, just before `</head>`. */
export function buildDocument(html, css) {
  const style = `<style>\n${css}\n</style>\n`;
  return html.includes('</head>') ? html.replace('</head>', `${style}</head>`) : style + html;
}

function errorBox(message) {
  const box = document.createElement('pre');
  box.style.cssText = 'margin:0;padding:16px;font:13px/1.6 monospace;color:#b3261e;white-space:pre-wrap';
  box.textContent = message;
  return box;
}

export function renderPreview({ template, sample, width = 'auto' }, { globals = {} } = {}) {
  const page = documents[template]?.[sample];
  if (!page) {
    return errorBox(
      `没有找到预览：模板 ${template} / 样例 ${sample}。\n` +
        `可用模板：${templateIds.join('、')}\n可用样例：${sampleIds.join('、')}`,
    );
  }

  const frame = document.createElement('iframe');
  frame.title = `${template} — ${sampleTitles.get(sample) ?? sample}`;
  frame.style.cssText = [
    'display:block',
    'width:100%',
    width === 'auto' ? 'max-width:none' : `max-width:${width}px`,
    'height:100%',
    'border:0',
    'background:#fff',
    'box-shadow:0 0 0 1px rgba(0,0,0,.14)',
  ].join(';');
  frame.srcdoc = buildDocument(page, transformCss(styles[template], globals));

  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'position:fixed;inset:0;display:flex;justify-content:center;background:repeating-conic-gradient(#0000 0 25%, #8881 0 50%) 0 0/16px 16px';
  wrapper.appendChild(frame);
  return wrapper;
}

/**
 * Builds the shared half of a template's CSF default export. The story files
 * spread it into an object literal and add `title` themselves, because
 * Storybook reads the title by parsing the file rather than by running it.
 */
export function templateMeta(template) {
  return {
    render: (args, context) => renderPreview(args, context),
    args: { template, width: 'auto' },
    argTypes: {
      template: { control: 'select', options: templateIds, name: '模板', description: 'templates/ 下的目录名称' },
      sample: { control: 'select', options: sampleIds, name: '样例', description: '渲染所用的 Markdown 文件' },
      width: {
        control: { type: 'select', labels: invert(WIDTHS) },
        options: Object.values(WIDTHS),
        name: '宽度',
        description: '预览容器宽度，用于检查响应式断点',
      },
    },
    parameters: { layout: 'fullscreen' },
  };
}

function invert(map) {
  return Object.fromEntries(Object.entries(map).map(([label, value]) => [value, label]));
}
