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
    role: 'retail-buyer',
    displayName: 'Waits & Spencer',
    userName: 'waitsandspencer'
  },
  saffronbadger: {
    role: 'restaurant-buyer',
    displayName: 'The Saffron Badger',
    userName: 'saffronbadger'
  }
};

module.exports = (req, res) => {
  const referrer = req.query.redirect || req.get('Referrer');
  const user = usersMap[req.body.username];
  user && res.cookie('yewtuAuth', JSON.stringify(user));
  res.redirect(303, referrer);
};
