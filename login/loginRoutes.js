const readLoggedInUserFromCookie = require('./readLoggedInUserFromCookie');
const writeLoggedInUserToCookie = require('./writeLoggedInUserToCookie');
const logOutUser = require('./logOutUser');

module.exports = (app, express) => {
	app.use(readLoggedInUserFromCookie);
	app.post('/login', writeLoggedInUserToCookie);
	app.get('/logout', logOutUser);
	app.use('/user-avatars', express.static(`${process.cwd()}/node_modules/module-ui-components/public/img/user-avatars`, {maxAge: 144000000}));
};
