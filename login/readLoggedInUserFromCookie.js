module.exports = (req, res, next) => {
  const userData = req.cookies.yewtuAuth;
  try {
    if (userData) res.locals.user = JSON.parse(userData);
    return next();
  } catch (err) {
    return next();
  }
};
