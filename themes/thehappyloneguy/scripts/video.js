hexo.extend.tag.register(
  "video",
  function (args) {
    const width = args[1] || "100%";
    return `<video width="${width}" controls> <source src="${args[0]}" type="video/mp4"> </video>`;
  },
  { async: true },
);

