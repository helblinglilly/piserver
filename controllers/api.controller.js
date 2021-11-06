exports.views = () => {
  let path = __dirname.split("/");
  path.pop();
  path = path.join("/") + "/views/";
  return path;
};

exports.getRoot = (_, res, next) => {
  res.sendFile(this.views() + "index.html");
};
