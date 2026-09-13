import { templateMeta } from './lib/preview.js';

export default {
  title: '模板/GitHub',
  ...templateMeta('github'),
};

export const Typography = { name: '排版与文本', args: { sample: 'typography' } };
export const CodeBlocks = { name: '代码与高亮', args: { sample: 'code-blocks' } };
export const Tables = { name: '表格', args: { sample: 'tables' } };
export const ListsAndQuotes = { name: '列表与引用', args: { sample: 'lists-and-quotes' } };
export const Preview = { name: '综合样例', args: { sample: 'preview' } };
