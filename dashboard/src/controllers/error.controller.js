exports.handleErrors = (res, err) => {
  res.status(err.statusCode);
  res.render("errors/generic", { errorCode: err.statusCode, errorMessage: err.msg });
};

exports.methodNotAllowed = (_, res) => {
  res.status(405);
  res.render("errors/generic", { errorCode: "405", errorMessage: "Method not allowed" });
};

exports.pageNotFound = (_, res) => {
  res.status(404);
  res.render("errors/generic", { errorCode: "404", errorMessage: "Page not found" });
};
