---
title: 'Browser from Scratch: HTML parsing & DOM tree building'
tags: [code, browser-from-scratch]
---

There are many reasons why one would build one's own browser, having no girlfriend, having no life or probably just want more freedom in customization, which, in my case, is all of the above. Anyway, in this article, we will go through the making of one of the most important building block of the browser-HTML parser and DOM tree.

# HTML parser

So, why HTML then? Good question. Around one heck of a long time ago, in 1989, a respectable computer scientist named [Sir Timothy John Berners-Lee][1] invented something called the [World Wide Web][2] which, basically a system where documents are shared accross the Internet via [Hypertext Transfer Protocol][6] (HTTP) and those documents are written in [Hypertext Markup Language][3] or one might call it: HTML. These [hypertext][4] documents are then displayed using the [Web browser][5] which we are currently building right now!

That means HTML is only one way of describing documents, the Internet contains other interesting protocols too, such as [Gopher][7] or [NNTP][8] and you yourself, can create your own protocol if you like...or just generally lost and don't know what you are doing with your life.

Although there are many cool protocols that we can support, I'm just going to support HTML at this stage.

Now, let's dive into the code.

## Specification

There are many resources to read about the specification of HTML, I recommend reading through this document from [w3.org][9], but you can totally ignore it and read on because just like its creator, my HTML parser will be pretty weak, sloppy and generally pathetic so it won't cover every aspect of HTML parsing.

### Nodes

Nodes are like atoms in a DOM tree. The word atom comes from the Ancient Greek adjective atomos, meaning "indivisible" <sup>[source][10]</sup>, that means, nodes will be the smallest structure in the DOM tree.

There are different types of nodes in a DOM tree, some of them are:

- [**Element nodes**][11] 
Which are HTML elements such as `p`, `div` or `marquee` and `center` that only pre-HTML5 kids remember.
- [**Text nodes**][12]
Which are texts that will be rendered to the screen. It could appears as a child of an element node or just stand alone by itself.
- [**Doctype node**][13]
Doctype node is that useless `<!DOCTYPE html>` part that located at the top of the HTML documents that you don't understand why it has to be there.

### DOM Tree

DOM tree is essentially a [tree][13] of nodes and have a pre-defined structure. 

![](/blog/Browser-from-Scratch-HTML-parsing-DOM-tree-building/DOM.png)
*A structure of a DOM tree. [Source][15]*

After parsing the HTML, we have to make sure that the tree that the code produce follow the structure of a DOM tree. Since developers are lazy creatures, the HTML received from the server might be incomplete and in some cases, completely broken. But, since the web doesn't really have errors, we have to cover for those cases too :okay:

## Structure

Writing a HTML parser is quite simple, you will have a cursor/pointer that constantly moving forward to the next character in the HTML code. When we encounter a `<` character we say that's an open tag. If followed by the `<` character is `!DOCTYPE` we say not you again you useless piece of sh- (Actually it's not very useless, read more about it [here][16]).

### Node structure

Since, the browser will be written in Rust, we have to define our code in Rust's way. Because Rust doesn't have a concept of class and inheritance like other languages, we have to define the node structure using struct.

```rust
#[derive(Debug, Clone)]
pub struct Node {
  node_type: NodeType,
  children: Vec<Node>,
}
```

Instead of using inheritance, we will define different types of nodes via the `NodeType` enum which, structured as below:

```rust
#[derive(Debug, Clone)]
pub enum NodeType {
  Element(ElementNode),
  Text(String),
  Comment(String)
}
```

This way, each node will have a different meaning. If a node is a text node or a comment node, the content of it will only be a string. However, if it's an element node, the content of it is defined in a struct called `ElementNode`:

```rust
#[derive(Debug, Clone)]
pub struct ElementNode {
    pub tag_name: String,
    pub attributes: AttrMap,
}

pub type AttrMap = HashMap<String, String>;
```

Nothing too complicated at the momment, let's define some functions that will helps us create a `Node` faster

```rust
pub fn text(content: &str) -> Node {
  Node {
    children: Vec::new(),
    node_type: NodeType::Text(content.to_string())
  }
}

pub fn element(tag_name: &str, attributes: AttrMap, children: Vec<Node>) -> Node {
  Node {
    children,
    node_type: NodeType::Element(ElementNode {
      tag_name: tag_name.to_string(),
      attributes
    })
  }
}

pub fn comment(content: &str) -> Node {
  Node {
    children: Vec::new(),
    node_type: NodeType::Comment(content.to_string())
  }
}
```

### Parser structure

The structure for the parser is quite simple. Because we only need to keep track the position where we have parsed to, the parser only needed to be a simple struct that hold a number which, will be used to index the html code being parsed.

```rust
pub struct Parser {
  html: String,
  pos: usize
}
```

From now on, that index number will be referenced as the `cursor`. The cursor will constantly moves towards the end of the html code.

![](/blog/Browser-from-Scratch-HTML-parsing-DOM-tree-building/parser_cursor.png)

# HTML parsing

[1]: https://en.wikipedia.org/wiki/Tim_Berners-Lee
[2]: https://en.wikipedia.org/wiki/World_Wide_Web
[3]: https://en.wikipedia.org/wiki/HTML
[4]: https://en.wikipedia.org/wiki/Hypertext
[5]: https://en.wikipedia.org/wiki/Web_browser
[6]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
[7]: https://en.wikipedia.org/wiki/Gopher_(protocol)
[8]: https://en.wikipedia.org/wiki/Network_News_Transfer_Protocol
[9]: https://www.w3.org/TR/html52/
[10]: https://en.wikipedia.org/wiki/Atomic_theory
[11]: https://developer.mozilla.org/en-US/docs/Web/API/Element
[12]: https://developer.mozilla.org/en-US/docs/Web/API/Text
[13]: https://developer.mozilla.org/en-US/docs/Web/API/DocumentType
[14]: https://en.wikipedia.org/wiki/Tree_(data_structure)
[15]: https://en.wikipedia.org/wiki/Document_Object_Model
[16]: https://www.bitdegree.org/learn/doctype-html
