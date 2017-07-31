
module.exports = (req, res) => {
  const referrer = req.get('Referrer');
  res.clearCookie('user');
  res.redirect(303, referrer);
};
