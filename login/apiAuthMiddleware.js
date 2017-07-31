const auth = require('basic-auth');
const getUserProfile = require('./helpers/getUserProfile');

module.exports = app => {
	app.use((req, res, next) => {
		const credentials = auth(req);
		if (credentials && credentials.name)
			return getUserProfile(credentials.name)
				.then(userProfile => {
					res.locals.user = userProfile;
					return next();
				})
				.catch(err => res.status(404).send({
					message: err.message,
					errorType: 'USER_NOT_FOUND'
				}));
		return res.status(400).send({
			message: 'No user credentials supplied',
			errorType: 'NOT_LOGGED_IN'
		});
	});
};
