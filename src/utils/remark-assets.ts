import { visit } from 'unist-util-visit';
import type { Root, Image, Html } from 'mdast';

const ASSET_HOST = 'https://blog-assets.viethung.space';

export default function remarkAssets() {
  return (tree: Root, file: any) => {
    // Get the post slug from the file path
    const filePath = file.history?.[0] || '';
    const match = filePath.match(/\/([^\/]+)\.md$/);
    const slug = match ? match[1] : '';

    visit(tree, 'image', (node: Image) => {
      const src = node.url;

      // Skip absolute URLs
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return;
      }

      // Rewrite relative URLs to use the external asset host
      if (slug) {
        node.url = `${ASSET_HOST}/${slug}/${src}`;
      }
    });
  };
}
