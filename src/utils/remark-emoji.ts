import { visit } from 'unist-util-visit';
import type { Root, Text, Html } from 'mdast';

export default function remarkEmoji() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const regex = /:(\w+):/g;
      const text = node.value;

      if (!regex.test(text)) return;

      // Reset regex lastIndex
      regex.lastIndex = 0;

      const parts: (Text | Html)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }

        // Add the emoji replacement
        const emo = match[1];
        if (emo === 'lenny') {
          parts.push({
            type: 'html',
            value: '<span style="font-family: Arial; display: inline-block">( ͡° ͜ʖ ͡°)</span>'
          });
        } else {
          parts.push({
            type: 'html',
            value: `<i class="em em-${emo}"></i>`
          });
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          value: text.slice(lastIndex)
        });
      }

      if (parts.length > 0) {
        parent.children.splice(index, 1, ...parts);
      }
    });
  };
}
