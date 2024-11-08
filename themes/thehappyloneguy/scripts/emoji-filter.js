hexo.extend.filter.register('after_post_render', function (data) {
  data.content = data.content.replace(/:(\w+):/g, (matched, emo) => {
    if (emo == 'lenny') {
      return '<span style="font-family: Arial; display: inline-block">( ͡° ͜ʖ ͡°)</span>';
    } else {
      return `<i class="em em-${emo}"></i>`;
    }
  });
  return data;
});
