const getUserProfile = require('./getUserProfile');

module.exports = (req, res) => {
	const referrer = req.query.redirect || req.get('Referrer');
	getUserProfile(req.body.userName)
		.then(user => {
			user && res.cookie('user', JSON.stringify(user));
			res.redirect(303, referrer);
		})
		.catch(err => {
			// TODO - redirect to error page / return 404 for Ajax call
			res.redirect(303, referrer);
		});
};
