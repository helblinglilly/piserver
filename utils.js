exports.views = () => {
  let path = __dirname.split("/");
  path = path.join("/") + "/views/";
  return path;
};
