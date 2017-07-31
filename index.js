const loginRoutes = require('./login/loginRoutes');
const getUserProfile = require('./login/getUserProfile');
const AdminRoutes = require("./express/routes/admin-routes");

module.exports = {
	loginRoutes,
	getUserProfile,
	AdminRoutes
};
