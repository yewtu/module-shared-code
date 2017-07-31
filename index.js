const appLoginRoutes = require('./login/appLoginRoutes');
const apiAuthMiddleware = require('./login/apiAuthMiddleware');
const request = require('./request');
const AdminRoutes = require("./express/routes/admin-routes");

module.exports = {
	appLoginRoutes: appLoginRoutes,
	apiAuthMiddleware: apiAuthMiddleware,
	AdminRoutes: AdminRoutes,
	request: request
};
