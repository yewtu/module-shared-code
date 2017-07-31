module.exports = (req, res, next) => {
  const userData = req.cookies.user;
  try {
    if (userData) res.locals.user = JSON.parse(userData);
    return next();
  } catch (err) {
    return next();
  }
};
