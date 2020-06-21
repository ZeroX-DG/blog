---
title: 'Browser from Scratch: HTML parser'
tags: [code, browser-from-scratch]
date: 2020/06/20
---

There are many reasons why one would build one's own browser, having no girlfriend, having no life or probably just want more freedom in customization, which, in my case, is all of the above. One of the most easiest thing that you can customize when building your own browser is how it interpret HTML. But instead of customizing HTML, this article will only be focusing on the making of a small and simple HTML parser. However, I do recommend you try something mildly interesting or strangely arousing with your browser. Some ideas might be natively support for [Pug][21] and [Handlebar][22]!

# HTML parser

So, why HTML then? Good question. Around one heck of a long time ago, in 1989, a respectable computer scientist named [Sir Timothy John Berners-Lee][1] invented something called the [World Wide Web][2] which, basically a system where documents are shared accross the Internet via [Hypertext Transfer Protocol][6] (HTTP) and those documents are written in [Hypertext Markup Language][3] or one might call it: HTML. These [hypertext][4] documents are then displayed using the [Web browser][5] which we are currently building right now!

That means HTTP has been the main way of communicating on the web since the start of the web itself. Thus HTML become the main language that used for defining website structure. However, the Internet also contains other interesting protocols, such as [Gopher][7] or [NNTP][8] and you yourself, can create your own protocol if you like...or just generally lost and don't know what to do with your life.

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

![](/blog/Browser-from-Scratch-HTML-parser/DOM.png)
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

These code will be defined in a separate module called `dom` so when you encounter something like `dom::comment(&comment_content)`, that code is calling the code that you see above.

### Parser structure

The structure for the parser is quite simple. Because we only need to keep track the position where we have parsed to, the parser only needed to be a simple struct that hold a number which, will be used to index the html code being parsed.

```rust
pub struct Parser {
  html: String,
  pos: usize
}
```

From now on, that index number will be referenced as the `cursor`. The cursor will constantly moves towards the end of the html code.

![](/blog/Browser-from-Scratch-HTML-parser/parser_cursor.png)

# HTML parsing

Maths is fun until they replace all the numbers with characters, the concept of building a parser is cool until you really build it. But fear not, building a HTML parser should only cost you no more than your entire lifetime plus your partner and the partner that you are hiding from your current partner. That was a joke, obviously, nobody with a partner would build a HTML parser, let alone 2, and HTML is really not that hard to parse...if you don't take these concepts into consideration:

- **Self-closing tags**
Normally HTML tags start with an open tag, for example, `<div>` and end with a closing tag `</div>`. However, to simlify the tags that doesn't contain a child, HTML invented self-closing tags like `<br />` or `<hr />`.

- **Tag omission**
I'm sure that self-closing tags is not a new concept to you and while they does add some degree of complexity to the code of the parser, there's a concept that was born just to confuse the parser which, is called [tag omission][17]. The idea of this concept is quite simple, while most HTML tags require a closing tag otherwise, it should be a self-closing tag, tag omission allow you to completely ignore that fact. That's why this piece of code is quite inconsistent but still valid to the browser:
```html
<p>first paragraph
<p>second paragraph
<p>third paragraph
```

## Moving abilities

When parsing the code, the parser should be able to only move forward. However, instead of just moving character by character, the cursor should also have other moving abilities too.

### Next character

The fundamental function that a parser must have is the ability to move forward by 1 character. If we were using languages like JavaScript, we can just simply increase the cursor by 1 because when indexing the string, you are indexing by character regardless of its' encoding. However, in Rust, strings are indexed by byte.

A normal English alphabet character only needed 1 byte. But, some other non-English characters (a.k.a [wide characters][18]) needed more than that (read more about [encoding][19]). Thus, when indexing the string, we could accidentally only indexed a part of a character. That's why we must use `char_indices` to move the cursor to the right index of the next character.

```rust
fn next(&mut self) -> Option<char> {
  let mut iter = self.html[self.pos..].char_indices();
  // get the current character
  if let Some((_, current_ch)) = iter.next() {
    // get the offset to the index of the next character
    if let Some((offset, _)) = iter.next() {
      // move the cursor to the index of the next character
      self.pos += offset;
      return Some(current_ch);
    }
  }
  None
}
```

### Peeking

Peeking is essential for a parser. It allows parser to peek at the next character without moving the cursor onto that character like the `next` function that we talked about previously.

```rust
fn peek(&self) -> Option<char> {
  self.html[self.pos..].chars().next()
}
```

### Take while

Sometimes, it's necessary to jump to a certain part of the string and not jump by only 1 character. By combining `peek` and `next` functions, the parser can keep moving the cursor forward until a certain condition is satisfied and that is exactly the idea of this function.

```rust
fn take_while<F>(&mut self, cond: F) -> String
    where F: Fn(char) -> bool
{
  let mut result = String::new();
  while let Some(c) = self.peek() {
    if !cond(c) {
      break
    }
    if self.next().is_none() {
      break
    }
    result.push(c);
  }
  result
}
```

Some utility functions that will be use with this `take_while` function are.

```rust
pub fn is_whitespace(ch: char) -> bool {
  ch == ' ' || ch == '\t' || ch == '\n'
}

pub fn is_alphanumeric(ch: char) -> bool {
  match ch {
    'a'..='z' | 'A'..='Z' | '0'..='9' => true,
    _ => false
  }
}
```

This way, next time when we call `take_while(is_whitespace)`, the parser will go over any whitespace character and stop at the first non-whitespace character that it found. The same principle applies to the `is_alphanumeric` function.

## Let the parsing begin

> **Warning!** The following section described by experts as dry, demotivational and may cause horrible experiences such as: drowsiness, confusion, sleepiness and utterly lost...just like when you lost your mum at the supermarket or me during high school chemistry class. But in any way, it's recommended to read the next section with insomnia.

The first thing we need to do when parsing HTML is to define a list to store the nodes that we parsed. I also created a boolean to keep track if we parsing characters inside of a tag or not.

```rust
fn parse_nodes(&mut self) -> Vec<Node> {
  let mut nodes: Vec<Node> = Vec::new();
  let mut is_open_tag = false;
  ...
```

Since whitespaces doesn't matter between tags, we will skips all the whitespaces that we found in our parse loop. 

```rust
loop {
  self.take_while(is_whitespace);
  ...
```

In each loop, after skipping through whitespaces, we will start peeking at the first non-whitespace character that the parser hit.

### Open tag

The first case that we need to consider is when the parser meet a `<` character. Because usually `<` signals an openning of the tag, we set the variable `is_open_tag` to `true` to notify the parser that any character that comes after is part of a tag. We also need to call `next()` to advance to the next character and not freezing the computer inside an infinite loop.

```rust
if let Some(ch) = self.peek() {
  match ch {
    '<' => {
      is_open_tag = true;
      self.next();
    }
    ...
```

### A closing tag

The next case that we have to consider is when the character `<` is followed by the character `/`. This normally means the parser is parsing a closing tag `</`, therefore, if we meet this case, we can stop the parsing loop completely and return the back the result.

```rust
...
'/' => {
  if is_open_tag {
    break
  }
}
...
```

### Newline character at the end of file

Sometimes, at the end of the html code, we get a newline character that can confuse the parser. To fix this problem, we can simply stop parsing and move on

```rust
...
'\n' => {
  // skip last new line in file
  if self.next().is_none() {
    break
  }
}
...
```

### Comment & Doctype

Comment and Doctype nodes has something in common, they all start with `<!`. So if we encounter a `!` character after the `<` character, we can start categorizing the next characters is part of a comment or a doctype.

For doctype, we can check if the rest of the code is start with `doctype` which, requires us to define a `starts_with` function:

```rust
pub fn starts_with(&self, pattern: &str, case_insensitive: bool) -> bool {
  if case_insensitive {
    self.html[self.pos..]
        .to_lowercase()
        .starts_with(pattern.to_lowercase().as_str())
  } else {
    self.html[self.pos..].starts_with(pattern)
  }
}
```

Since the keyword `doctype` is case insensitive `DocTyPe` is same as `doCtYpe` so our `starts_with` function have to support case insensitive. After that, we can use this function and decide if we are parsing a doctype or a comment:

```rust
...
'!' => {
  if is_open_tag {
    // if the tag start with `!` then it could be
    // a comment or a doctype
    if self.starts_with("!doctype", true) {
      // TODO: support doctype
      self.take_while(|x| x != '>');
      self.next();

    } else {
      // it's classified as a comment
      let comment = self.parse_comment();
      nodes.push(comment);
    }

    is_open_tag = false;
  }
}
...
```

To keep this parser as simple as possible, I decided to not support doctype node and simply skip it by moving the cursor to the next `>` character which is the end of a doctype node.

```
<!doctype html>
 ^            ^
old          new
```

For parsing comments, we can use the same technique and append the `<` and `>` characters to the comment before returning a comment node with that content.
```rust
fn parse_comment(&mut self) -> Node {
  let mut comment_content = String::from("<");
  comment_content.push_str(&self.take_while(|x| x != '>'));
  comment_content.push('>');
  self.next();
  dom::comment(&comment_content)
}
```

### Elements & texts

For any other characters, the parser will consider it as part of an element node if `is_open_tag` is `true`, otherwise, it will be treated as part of a text node.

```rust
...
_ => { // other chars
  if is_open_tag {
    // these are chars that directly come after '<'
    // and it's not comment or doctype so it must be
    // an element
    let element = self.parse_element();
    nodes.push(element);

    is_open_tag = false;
  } else {
    // these are text nodes
    let text_node = self.parse_text();
    nodes.push(text_node);
  }
}
...
```

For parsing text node, we just need to take everything before the next `<` character which, indicate the next openning tag.

```rust
fn parse_text(&mut self) -> Node {
  let text_content = self.take_while(|x| x != '<');
  dom::text(&text_content)
}
```

However, parsing elements are not that easy. When we start parsing an element, we know that the next characters that are not space or `>` will be part of our tag name.

```rust
fn parse_element(&mut self) -> Node {
  // when we start parsing element cursor will start at `<`
  // For example:
  // <div attr='value'>
  // ^
  let tag_name = self.take_while(is_alphanumeric);
  ...
```

After that, we need to define a `HashMap` to store the `attributes` and the associate `values` of the tag.

```rust
...
let mut attributes: AttrMap = HashMap::new();
...
```

Before parsing the attributes we must understand [4 different forms of attributes][20]:

- **Empty attribute syntax**
Only attribute name is present, the value is set to empty string.
```html
<input disabled>
```
- **Unquoted attribute value syntax**
Both attribute name and value are present but the value is not surrounded by any quote
```html
<input value=yes>
```
- **Single-quoted attribute value syntax**
The attribute value is surrounded by a single quote
```html
<input type='checkbox'>
```
- **Double-quoted attribute value syntax**
Similar to the single quoted syntax but instead, the value is surrounded by double-quote
```html
<input name="be evil">
```

Now that we have understand all 4 forms of attributes, we need to first define a string to store the last attribute name. This last attribute name string will act as a placeholder being inserted to the `attributes` hashmap first. If we ever found a value, we can always use that last attribute name to identify the slot on the `attributes` map to insert the value to.

I also defined a boolean to indicate if the tag is self-closing or not so that we can skip parsing the children nodes if the tag is self-closing.

```rust
...
let mut last_attribute_name: Option<String> = None;
let mut self_close = false;
...
```

Using the same technique that we used to parse the nodes, we can also create a parsing loop and in each loop we will skip the unnecessary whitespace that we encounter.

```rust
...
loop {
  self.take_while(is_whitespace);
  ...
```

After that we peek at the next non-whitespace element and start processing.

```rust
...
if let Some(ch) = self.peek() {
  match ch {
  ...
```

#### Tag close

When we encounter the `>` character, we can say that we have reached the end of the open tag. In this case, we can simply advance to the next character and break out of the parsing loop.

```rust
...
'>' => {
  // if the next character is `>` which means the tag
  // is ended and all attributes has been parsed
  self.next();
  break
}
...
```

#### Self-closing tag...or not

When the parser meet the `/` character, we can asume that this is a self-closing tag. However, this might be a mistake from the developer and there might be other attributes behind this `/` character. Therefore, instead of jumping to conclusions like your girlfriend when you are home after 10, we will only temporarily set `self_close` variable to `true` to say that this could be a self-closing tag and moving to the next character.

```rust
...
'/' => {
  self_close = true;
  self.next();
}
...
```

#### Quoted attribute value

If the parser saw a quote, either double-quote or single-quote, we can categorize the next characters as part of an attribute value.

```rust
...
'"' | '\'' => {
  self_close = false;
  // if the next character is a quote, which means we
  // started to parse attribute value
  self.next();

  // we will take until we hit the quote that being used
  // to open the attribute value
  let attribute_value = self.take_while(|x| x != ch);

  // set the value for the last attribute if the attribute
  // exists
  if let Some(attribute_name) = last_attribute_name.clone() {
    attributes.insert(attribute_name, attribute_value);
    last_attribute_name = None;
  }
  self.next();
}
...
```

#### Attribute name or unquoted value?

Attribute name and unquoted value both have something in common, they don't have quote around them. This detail creates even more confusion for the parser. However, by reseting the value of the `last_attribute_name` to `None` every time we done parsing the attribute value, we can simply check if the `last_attribute_name` is currently have a value or not and decide if the character that we are parsing is part of attribute name or value.

```rust
...
_ => {
  self_close = false;

  // if the last attribute name exists but we not hit
  // the quote for the value then we must be parsing
  // unquoted value
  if let Some(attribute_name) = last_attribute_name.clone() {
    let attribute_value = self.take_while(|x| !is_whitespace(x) && x != '>');
    attributes.insert(attribute_name, attribute_value);
    last_attribute_name = None;
    continue;
  }

  // any value that not in the above case will be
  // classified as attribute name
  let attribute_name = self.take_while(|x| x != '=');
  attributes.insert(attribute_name.clone(), String::new());

  last_attribute_name = Some(attribute_name);
  self.next(); // step over `=` character
}
...
```

#### Children nodes

The last thing to take care of when parsing an element is parsing the child elements of the current element. But instead of going through some more long and boring code, we can just reuse this `parse_nodes` function and recursively parse all the child nodes. But if a node is a self-closing node, we can just return an empty list of children for that node.

```rust
...
let children = if !self_close {
  self.parse_nodes()
} else {
  Vec::new()
};

// skip the end of the last child tag because `parse_nodes`
// stop at `</`
self.take_while(|x| x != '>');
self.next();

dom::element(&tag_name, attributes, children)
```

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
[17]: https://en.wikipedia.org/wiki/Tag_omission
[18]: https://en.wikipedia.org/wiki/Wide_character
[19]: https://kunststube.net/encoding/
[20]: https://html.spec.whatwg.org/dev/syntax.html#attributes-2
[21]: https://pugjs.org
[22]: https://handlebarsjs.com/
