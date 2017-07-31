const userProfiles = require('./userProfiles.json');

module.exports = (req, res) => {
  const referrer = req.query.redirect || req.get('Referrer');
  const user = userProfiles[req.body.userName];
  user && res.cookie('user', JSON.stringify(user));
  res.redirect(303, referrer);
};
