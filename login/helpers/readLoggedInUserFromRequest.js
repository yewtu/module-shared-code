const auth = require('basic-auth');
const getUserProfile = require('./getUserProfile');

module.exports = (req, res, next) => {
	const userData = req.cookies.user;
	if (userData) {
		try {
			res.locals.user = userData ? JSON.parse(userData) : {};
			return next();
		} catch (err) {
			return next();
		}
	}

	const credentials = auth(req);
	if (credentials && credentials.name) {
		return getUserProfile(credentials.name)
			.then(userProfile => {
				res.locals.user = userProfile;
				return next();
			})
			.catch(err => res.status(403).send({
				message: err.message,
				errorType: 'USER_NOT_FOUND'
			}));
	}
	res.locals.user = {};
	return next();
};
