exports.handleErrors = (res, err) => {
  console.log(err);
  res.status(500);
  res.render("errors/generic", {
    errorCode: "500",
    errorMessage: "Unkown server error - check logs",
  });
};

exports.methodNotAllowed = (_, res) => {
  res.status(405);
  res.render("errors/generic", { errorCode: "405", errorMessage: "Method not allowed" });
};

exports.pageNotFound = (_, res) => {
  res.status(404);
  res.render("errors/generic", { errorCode: "404", errorMessage: "Page not found" });
};
