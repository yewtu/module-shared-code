const appLoginRoutes = require('./login/appLoginRoutes');
const apiAuthMiddleware = require('./login/apiAuthMiddleware');
const AdminRoutes = require("./express/routes/admin-routes");
const ClientLogger = require("./dist/logger/clientLogger");
const ServerLogger = require("./dist/logger/serverLogger");

module.exports = {
	appLoginRoutes,
	apiAuthMiddleware,
	AdminRoutes,
	ClientLogger,
	ServerLogger,
};
