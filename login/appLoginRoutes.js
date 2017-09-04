const readLoggedInUserFromCookie = require('./helpers/readLoggedInUserFromRequest');
const writeLoggedInUserToCookie = require('./helpers/writeLoggedInUserToCookie');
const logoutUser = require('./helpers/logoutUser');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

module.exports = (app, express) => {
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(readLoggedInUserFromCookie);
	app.post('/login', writeLoggedInUserToCookie);
	app.get('/logout', logoutUser);
	app.use('/user-avatars', express.static(`${process.cwd()}/node_modules/module-ui-components/public/img/user-avatars`, {maxAge: 144000000}));
};
