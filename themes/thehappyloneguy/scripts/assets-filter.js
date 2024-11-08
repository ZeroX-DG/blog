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