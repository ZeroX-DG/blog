---
title: 'Browser from Scratch: CSS parsing & processing'
tags: ["code", "browser-from-scratch"]
---

In the beginning was the web, and the web was.....ugly.

No one knows why, but it was indeed ugly. So in 1994, a web pioneer working at the birthplace of the web - [CERN][2], named [Håkon Wium Lie][1], has proposed a new way to style the web. This method of styling rely on a simple concept, that is to "cascade" the styles through out the HTML document. Hence, the name Cascading Style Sheets or as self-taught developers lacking of history lessons like myself would call it - CSS.

CSS went on to be a great success; adopted by major browsers, and contributed greatly to the increment of insomnia rate among developers. Making Håkon Wium Lie, one of the greatest creations that Norway has ever given to the world, just after [Aurora][4] and [OOP][5] of course. So, takk skal du ha herr Håkon Wium Lie for that.

> **Fun Fact:** In 1996, Netscape implemented CSS support by translating CSS rules into snippets of JavaScript, which were then run along with other scripts. The company then proposed a new syntax called JSSS or [JavaScript Style Sheets][3] to bypass CSS entirely. That didn't work out, fortunately. And from that on, the world lives happily in CSS and we never tried to write JS [for][6] [styling][7] [ever][8] [again][9].

## CSS Parsing

![](css_parsing_flow.png)


[1]: https://en.wikipedia.org/wiki/H%C3%A5kon_Wium_Lie
[2]: https://en.wikipedia.org/wiki/CERN
[3]: https://en.wikipedia.org/wiki/JavaScript_Style_Sheets
[4]: https://en.wikipedia.org/wiki/Aurora_(singer)
[5]: https://en.wikipedia.org/wiki/Object-oriented_programming
[6]: https://cssinjs.org/
[7]: https://styled-components.com/
[8]: https://emotion.sh
[9]: https://formidable.com/open-source/radium/
[10]: https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule
