/** @type {import('@storybook/html-vite').Preview} */
const preview = {
  globalTypes: {
    colorScheme: {
      description: '强制模板的配色，而不是跟随系统设置',
      toolbar: {
        title: '配色',
        icon: 'mirror',
        items: [
          { value: 'system', title: '跟随系统' },
          { value: 'light', title: '浅色' },
          { value: 'dark', title: '深色' },
        ],
        dynamicTitle: true,
      },
    },
    previewMode: {
      description: '在屏幕样式与打印样式之间切换',
      toolbar: {
        title: '介质',
        icon: 'print',
        items: [
          { value: 'screen', title: '屏幕' },
          { value: 'print', title: '打印' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { colorScheme: 'system', previewMode: 'screen' },
  parameters: {
    controls: { expanded: true },
    options: {
      storySort: { order: ['说明', '模板', ['默认', 'GitHub']] },
    },
  },
};

export default preview;
