const fs = require('fs');
const path = require('path');

// 读取 icons.css
const iconsCSS = fs.readFileSync('src/css/icons.css', 'utf-8');

// 提取所有图标
const iconRegex = /\.icon-([a-z-]+)\s*\{[^}]*content:\s*url\(data:image\/svg\+xml;base64,([^)]+)\)/g;
const icons = [];

let match;
while ((match = iconRegex.exec(iconsCSS)) !== null) {
  const name = match[1];
  const base64 = match[2];

  try {
    // 解码 base64
    const svg = Buffer.from(base64, 'base64').toString('utf-8');
    icons.push({ name, svg });
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
  }
}

console.log(`\n提取了 ${icons.length} 个图标`);

// 创建组件目录
const iconsDir = 'src/components/icons';
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 生成 Vue 组件
icons.forEach(({ name, svg }) => {
  // 转换为 PascalCase
  const componentName = 'Icon' + name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('');

  // 提取 SVG 属性
  const svgMatch = svg.match(/<svg[^>]*>/);
  const svgTag = svgMatch ? svgMatch[0] : '<svg>';

  // 提取 viewBox
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  // 提取内容
  const content = svg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');

  // 生成组件
  const component = `<template>
  <svg
    :width="size"
    :height="size"
    :class="className"
    viewBox="${viewBox}"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    ${content}
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [String, Number], default: 24 },
  className: { type: String, default: '' }
})
</script>
`;

  fs.writeFileSync(path.join(iconsDir, `${componentName}.vue`), component);
});

// 生成索引文件
const indexContent = icons.map(({ name }) => {
  const componentName = 'Icon' + name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('');
  return `export { default as ${componentName} } from './${componentName}.vue'`;
}).join('\n');

fs.writeFileSync(path.join(iconsDir, 'index.js'), indexContent + '\n');

console.log(`\n✓ 生成了 ${icons.length} 个组件`);
console.log(`✓ 创建了索引文件`);
