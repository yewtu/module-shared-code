const appLoginRoutes = require('./login/appLoginRoutes');
const apiAuthMiddleware = require('./login/apiAuthMiddleware');
const AdminRoutes = require("./express/routes/admin-routes");

module.exports = {
	appLoginRoutes,
	apiAuthMiddleware,
	AdminRoutes,
};