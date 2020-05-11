---
title: 'Browser from Scratch: Introduction'
tags: [code, browser-from-scratch]
description: 'This is the start of Browser from Scratch series, created to help me (and probably you too) to learn more about how a browser works by building one!'
---

Ah, the browser, the provider of modern addictions such as social media, online games and hours upon hours of videos of stuff getting smashed by the hydraulic press. All of that in one simple piece of software that only take up 90% of your RAM and even [slows down Youtube if you try to switch to other browsers.][1]

That's why the browser is so appealing to me. We mainly connect with the Internet world via the browser, we spend hours being productive by watching other people being productive on Youtube, we organize our schedule on Google Calendar via the browser even though we go to sleep at 3 AM and wake up just after lunchtime and everyday is a half-day to you. And most importantly, if you are a web developer, the browser's output literally decides if you will get pay or become [Diogenes][2]:

![](/blog/Browser-from-Scratch-Introduction/Diogenes.jpg)
*Diogenes Sitting in his Tub by [Jean-Léon Gérôme][9] (1860)*

Such an important creation of the world and you probably never get to know how it works which in that case, shame on you....and me too. :okay:

And that's the reason why this series was born, it's not to guide you to create a complete browser, but to document the process of me learning how a browser works by creating one and probably get stuck for years and finally give up on this project **BUT!** that comes later.

# Language

Most browsers are written in C or C++ to achieve maximum speed and flexibility. However, for this project, we are going to use [Rust.][3] Why? Because I think Rust is more developer-friendly, more secure and almost as fast as C or C++. And also the [Servo engine][5] is written in Rust so I can ~~steal~~ learn the structure of it and apply it to my engine. :troll:

# Browser architecture

Before we start jumping into the code, let's first take a look at the overall structure of a browser.

![](/blog/Browser-from-Scratch-Introduction/browser_structure.png)
*Source: https://www.randgroup.com/insights/ajax-seo-does-google-index-ajax/*

## User Interface

The browsers UI includes things that are not created by the web. For example, the URL input box or the forward and backward button, etc. The main purpose of the UI is to receive inputs from the user to control the web being rendered.

## Browser Engine

I used to think that things that are not the UI, together is called browser engine but I was wrong...as usual. The browser engine is the part that receives the input from the UI and processes it to command the render engine. It's a middle man who sits between UI and Render Engine to connect those 2 parts.

Why do you need a middle man instead of letting those 2 parts talking directly to each other? That's because if you want to have both study materials and facebook to be opened at the same time to distract yourself, you will have to have multiple windows or tabs open. In browsers like Chrome, each tab is a separate process that has an instance of Render Engine for rendering the website and these processes will only talk to the browser engine and no one else.

This way, the browser can isolate the tabs which can be very useful in many situations. For example:

- If you click on that picture of the cute cat in your email and a hacker takes over your tab, he cannot access data in other tabs since each tab is a different process and they are introverts therefore they don't talk to each other.

- If one of your tabs is doing some heavy work, instead of freezing the whole browser and wait for the work to finish like the old days, that tab can run in the background and you can still switch to other tabs to do you work without any interruption.

- If one tab crashes, it doesn't crash the whole browser!

Sounds interesting? Check out [Chrome comic][7] for more useful information on Google Chrome design that doesn't bore you.

![](/blog/Browser-from-Scratch-Introduction/chrome_processes.jpg)
*Source: https://www.google.com/googlebooks/chrome/small_04.html*

## Render Engine

The render engine in charge of most of the most expensive operations in the browser. For example, parsing HTML, putting up make up for it using CSS and make it more interesting using JavaScript. However, the render engine doesn't execute JavaScript directly, instead, each browser has its own dedicated JavaScript engine to process JavaScript code, for example:

- [v8][4] of Google Chrome
- [SpiderMonkey][8] of Firefox
- [Chakra][6] of IE

## Network

The network module handle HTTP calls and other network related tasks.

# Do you use library?

While many parts of the browser can be created using libraries. I'll only use libraries for some truly complicated tasks that aren't very related to the browser, for example, GPU rendering, etc. The rest of the browser will be written from scratch.

# Next article

That's it for the introduction. This post aims to give you an overview of how a browser works as well as some resources to read and understand it further before we start working on some code. In the next article, we will work on the Rendering Engine for the browser.

Till next time, folks.

[1]: https://www.cnet.com/news/mozilla-exec-says-google-slowed-youtube-down-on-non-chrome-browsers/
[2]: https://en.wikipedia.org/wiki/Diogenes
[3]: https://www.rust-lang.org/
[4]: https://v8.dev/
[5]: https://servo.org/
[6]: https://en.wikipedia.org/wiki/Chakra_(JScript_engine)
[7]: https://www.google.com/googlebooks/chrome
[8]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey
[9]: https://en.wikipedia.org/wiki/Jean-L%C3%A9on_G%C3%A9r%C3%B4me
