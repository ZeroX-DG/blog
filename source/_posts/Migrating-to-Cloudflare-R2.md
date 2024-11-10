---
title: "Migrating to Cloudflare R2"
tags: ["random"]
date: 2024/11/10
---

A quick update: all images and videos on this blog are now sitting on a [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket!

For the past four years, those files were directly added to git and bundled along with the text contents in a Github action build before being deployed to Github pages. I know you weren't supposed to add non-text files to git, but I didn't want to think about that back then. When I started the blog, I wanted to write and didn't care where things were supposed to go. This system worked fine till recently when I tried to add a 400MB video of {% post_link Went-to-see-Thom-Yorke 'Thom Yorke\'s beautiful singing' %}:

![](git-add.png)
*`git add` takes 10s to run on 400MB file :shake:*
![](github-limit.png)
*`git push` takes a minute then get rejected with this message*

Turns out Github has a file limit of 100MB!

I gave Git LFS a whirl a few days ago, but then Github sent me this email:

![](lfs-limit.png)

So I finally bit the bullet and migrated to Cloudflare R2, which gives you 10GB for free. I thought this was going to be hard to set up, so I've been putting it off for years, but it turns out to be quite simple.

I won't get into the details of how I did it, but the rough steps that I took were:

1. Set up a public R2 bucket.
2. Change my domain name server to Cloudflare so I can use my subdomain for the bucket.
3. Upload all my images and videos to the bucket.
4. Write a [Hexo](https://hexo.io/) plugin to modify the images and videos URL to use my bucket URL.

That's about it.

```js
// append asset_external_host to assets
hexo.extend.filter.register('after_post_render', function (data) {
  const getAssetURL = (src) => {
    const externalHost = this.config.asset_external_host;
    return externalHost
      ? new URL(`${data.path}${src}`, externalHost).toString()
      : src;
  };

  // IMG
  data.content = data.content.replace(/<img[^>]* src=\"([^\"]*)\"[^>]*>/g, (_, src) => {
    return `<img src="${getAssetURL(src)}" />`;
  });

  // SOURCE (VIDEO)
  data.content = data.content.replace(/<source[^>]* src=\"([^\"]*)\"[^>]*>/g, (_, src) => {
    return `<source src="${getAssetURL(src)}" />`
  });

  return data;
});
```
*^my hexo plugin for appending a custom bucket link to image & video src*