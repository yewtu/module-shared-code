const readLoggedInUserFromCookie = require('./helpers/readLoggedInUserFromCookie');
const writeLoggedInUserToCookie = require('./helpers/writeLoggedInUserToCookie');
const logoutUser = require('./helpers/logoutUser');

module.exports = (app, express) => {
	app.use(readLoggedInUserFromCookie);
	app.post('/login', writeLoggedInUserToCookie);
	app.get('/logout', logoutUser);
	app.use('/user-avatars', express.static(`${process.cwd()}/node_modules/module-ui-components/public/img/user-avatars`, {maxAge: 144000000}));
};
