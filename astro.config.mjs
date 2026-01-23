import { defineConfig } from 'astro/config';
import remarkEmoji from './src/utils/remark-emoji.ts';
import remarkAssets from './src/utils/remark-assets.ts';

export default defineConfig({
  site: 'https://viethung.space',
  base: '/blog',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkAssets, remarkEmoji],
    shikiConfig: {
      theme: 'github-light'
    }
  }
});
