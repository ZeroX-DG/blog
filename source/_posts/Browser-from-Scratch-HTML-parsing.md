---
title: 'Browser from Scratch: HTML parsing'
tags: ["code", "browser-from-scratch"]
date: 2020/10/24
description: Since I have foolishly made a promise with the first three words in the name of this series, let's build an HTML parser from scratch.
---

When a browser starts to render a page, it first transforms the HTML code into a {% post_link Browser-from-Scratch-DOM-API DOM %} tree. This process includes two main activities:

- **HTML tokenization:** Transforming input text characters into HTML "tokens".
- **DOM tree building:** Transforming HTML tokens from the previous step into a DOM tree.

Because there're only two main activities, implementing an HTML parser should take you no more than 6 hours agonizing over the [HTML5 specification][3], three weeks implementing half of the parsing algorithm and 2 hours questioning the meaning of existence...every single day. The implementer is then expected to experience several after-effects that may include: confusion, regret for not using [Servo's HTML parser][1], and [Friedrich Nietzsche][2] starts to sound fascinating:

> To live is to suffer, to survive is to find some meaning in the suffering.

But since I have foolishly made a promise with the first three words in the name of this series, let's build an HTML parser from scratch :joy:

**Note:** I will just going to give you an overview of how the parser works. If you are interested in the implementation, please refer to [Moon's parser source code][14] and [HTML5 specification][3].

# The parsing flow

![](/blog/Browser-from-Scratch-HTML-parsing/html-parsing-process.png)

## Input decoder

When the browser receives an HTML document from the server, everything is transfered as raw bytes. Thus, to decode those bytes into readable text characters, the browser will first run the [encoding sniffing algorithm][4] to detect the document's encoding. This includes trying out various methods from BOM sniffing to `meta` detection. Yes, you heard me, BOM sniffing.

### BOM sniffing

BOM or [Byte Order Mark][5] :troll: is like a [magic number][6] in files. When opening a file in a hex editor like [bless][7], if the file starts with `4A` `46` `49` `46`, we know that it's a JPEG file; `25` `50` `44` `46`, it's a PDF file. BOM serves the same purpose but for text streams. Therefore, to determine the encoding of the text stream, the browser will compare the first 3 bytes with the table below:

| Byte order mark                               | Encoding |
|-----------------------------------------------|----------|
| <code class="no-float">0xEF 0xBB 0xBF</code>  | UTF-8    |
| <code class="no-float">0xFE 0xFF</code>       | UTF-16BE |
| <code class="no-float">0xFF 0xFE</code>       | UTF-16LE |

### Meta detection

Back in 2012, when [emmet][8] is not yet a thing, and developers still typing HTML manually from start to finish, I often find myself missing a crucial tag that I have no idea how it works back then:

```html
<meta charset="utf-8" />
```

This result in my browser displaying Vietnamese characters as "�" character, which for those who don't know, is called ["replacement character."][9] This issue was so popular back then that people started to paste replacement character into text inputs intentionally to troll webmasters and make them think that the database has a text encoding issue :joy:

Anyway, now you know that if the browser can't find the BOM, it will try to detect the document encoding via the `meta` tag. But you probably won't have to worry about this since HTML autocomplete is quite powerful these days, and they usually generate that `meta` tag by default.

## Tokenizer

**Note:** If you are not familiar with tokenization, be sure to read a bit about it [here][19].

After the stream of bytes is decoded into a stream of characters, it's then fed into an HTML tokenizer. The tokenizer is responsible for transforming input text characters into HTML tokens. There are fives types HTML tokens:

- **DOCTYPE:** Represent and contain information about the document doctype. Yes, that useless `<!DOCTYPE html>` isn't as useless as you think.
- **Tag**: Represent both start tag (e.g `<html>`) and end tag (e.g `</html>`).
- **Comment:** Represent a comment in the HTML document.
- **Character:** Represent a character that is not part of any other tokens.
- **EOF:** Represent the end of the HTML document.

The HTML tokenizer is a [state machine][20], which first starts at an initial state called the `Data` state. From that, the tokenizer will process a character according to the instruction of that state. The tokenization ends when it encounters an `EOF` character in the text stream.

![](/blog/Browser-from-Scratch-HTML-parsing/html-tokenize-data.png)
*The instruction for data state tokenization*

But don't be fooled by the small number of tokens. What gives me PTSD after implementing the tokenizer is the sheer number of tokenizer states. 80, to be exact.

![](/blog/Browser-from-Scratch-HTML-parsing/html-tokenizer-states.png)
*A small section of the states from [moon source code][10]*

## Tree-building

The way the tree-building stage works is similar to the tokenize stage. It also switches between different states to create the DOM tree. What special about this stage is it have a stack of open elements to keep track of the parent-child relationship, similar to the [balance parentheses problem][13].

One thing to notice when implementing an HTML parser is the tree-building stage doesn't happen after the tokenize stage. As stated in the specification:

> When a token is emitted, it must immediately be handled by the tree construction stage. The tree construction stage can affect the state of the tokenization stage, and can insert additional characters into the stream.

Consider this piece of HTML code:

```html
<p>this is a paragraph</p>

<script>
  document.write("<p>this is a new one</p>");
</script>

<p>this is another paragraph</p>

<!-- very long html below... -->
```

Because of [`document.write`][11], the code starting from the end of the `</script>` to the rest of the file will be cleared. Thus, if your parser attempts to tokenize the whole file before performing tree construction, it will end up wasting its time tokenizing redundant code.

Therefore, to tackle that problem, the browser has the ability to pause the HTML parsing process to execute the JS script first. Therefore, if the script modifies the page, the browser will resume parsing at a new location instead of where it left off before executing the script.

That's why JavaScript will block rendering and should be placed at the bottom of the HTML. It also reveals why CSS is also render blocking. When JavaScript runs, it can request for access to the CSSOM, which depends on the CSS; thus, the CSS will block the execution of JS until all the CSS is loaded and the CSSOM is constructed.

![](/blog/Browser-from-Scratch-HTML-parsing/html-blocking.png)

# Bonus

Here are some cool bonus things that I learnt after implementing this HTML parser:

## Speculative parsing

As I explained before, because JavaScript can potentially modify the page using `document.write`, the browser will stop the HTML parsing process until the script execution is completed. However, with the Firefox browser, since Firefox 4, [speculative parsing][15] has been supported. Speculative parsing allows the browser to parse ahead for any resources it might need to load while the JavaScript is being executed. Meaning, the browser can parse HTML faster if JavaScript doesn’t modify the page. However, if it does, everything that the browser parsed ahead is wasted.

## </sarcasm\>

After hours of implementing dry HTML parsing rules, this one really makes me question my own sanity :rolling_on_the_floor_laughing:

![](/blog/Browser-from-Scratch-HTML-parsing/html-sarcasm.png)

## <ruby\>

At first, I thought this tag has something to do with the language Ruby. But turn out, it's a tag to specify a small piece of on top of another text to show the pronunciation, otherwise known as [ruby][16]. For example:

<p style="text-align: center">
<ruby>
河 內<rp>(</rp><rt>Hà Nội</rt><rp>)</rp>
</ruby>

<ruby>
東 京<rp>(</rp><rt>Tō kyō</rt><rp>)</rp>
</ruby>
</p>

```html
<ruby>
河 內<rp>(</rp><rt>Hà Nội</rt><rp>)</rp>
</ruby>

<ruby>
東 京<rp>(</rp><rt>Tō kyō</rt><rp>)</rp>
</ruby>
```

---

That's all I can share on my journey implementing the HTML parser. It's not satisfying to read, I know. But even though it’s complicated to implement the parser, summing up how it works turns out to be quite a simple task; hence, the abrupt ending :joy:. But I hope that I inspired you to use [Servo's HTML parser][1] instead of implementing it from scratch like me :okay:. If you somehow deranged enough to do what I did, I wish you the best of luck.

# Resources
- Wikipedia. (2020). [Tokenization][19]
- Servo Engine. (2020). [Servo HTML parser][1]
- SerenityOS. (2020). [SerenityOS HTML parser][17]
- MDN. (2020). [Speculative parsing][15]
- Ilya Grigorik. (2020). [Render Blocking CSS][15]

[1]: https://github.com/servo/html5ever/
[2]: https://en.wikipedia.org/wiki/Friedrich_Nietzsche
[3]: https://html.spec.whatwg.org/
[4]: https://html.spec.whatwg.org/#encoding-sniffing-algorithm
[5]: https://en.wikipedia.org/wiki/Byte_order_mark
[6]: https://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files
[7]: https://community.linuxmint.com/software/view/bless
[8]: https://emmet.io/
[9]: https://en.wikipedia.org/wiki/Specials_(Unicode_block)
[10]: https://github.com/ZeroX-DG/moon/blob/master/components/html/src/tokenizer/state.rs
[11]: https://developer.mozilla.org/en-US/docs/Web/API/Document/write
[12]: https://html.spec.whatwg.org/#parsing-main-inhtml
[13]: https://leetcode.com/problems/valid-parentheses/
[14]: https://github.com/ZeroX-DG/moon/tree/master/components/html
[15]: https://developer.mozilla.org/en-US/docs/Glossary/speculative_parsing
[16]: https://en.wikipedia.org/wiki/Ruby_character
[17]: https://github.com/SerenityOS/serenity/tree/master/Libraries/LibWeb/HTML/Parser
[18]: https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-blocking-css
[19]: https://en.wikipedia.org/wiki/Lexical_analysis#Tokenization
[20]: https://www.freecodecamp.org/news/state-machines-basics-of-computer-science-d42855debc66/
