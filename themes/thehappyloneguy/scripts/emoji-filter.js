hexo.extend.filter.register('after_post_render', function(data) {
  data.content = data.content.replace(/:(\w+):/g, '<i class="em em-$1"></i>');
  return data;
});
