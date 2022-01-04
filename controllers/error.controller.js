exports.handleErrors = (res, err) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  }
};

exports.methodNotAllowed = (_, res, next) => {
  next({ status: 405, msg: "Method not allowed" });
};
