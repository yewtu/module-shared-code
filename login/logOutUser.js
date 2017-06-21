
module.exports = (req, res) => {
  const referrer = req.get('Referrer');
  res.clearCookie('yewtuAuth');
  res.redirect(303, referrer);
};
