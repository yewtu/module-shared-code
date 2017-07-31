module.exports = (req, res, next) => {
  const userData = req.cookies.user;
  try {
    res.locals.user = userData ? JSON.parse(userData) : {};
    return next();
  } catch (err) {
    return next();
  }
};
