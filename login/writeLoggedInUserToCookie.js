const usersMap = {
  david: {
    role: 'farmer',
    displayName: 'David',
    userName: 'david'
  },
  tastyburger: {
    role: 'retail-buyer',
    displayName: 'Tasty Burger',
    userName: 'tastyburger'
  },
  waitsandspencer: {
    role: 'restaurant-buyer',
    displayName: 'Waits & Spencer',
    userName: 'waitsandspencer'
  }
};

module.exports = (req, res) => {
  const referrer = req.get('Referrer');
  const user = usersMap[req.body.username];
  user && res.cookie('yewtuAuth', JSON.stringify(user));
  res.redirect(303, referrer);
};
