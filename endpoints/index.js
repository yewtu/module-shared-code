const configs = {
	default: require('./default.js'),
	local: require('./local.js'),
	staging: require('./staging.js'),
	production: require('./production.js'),
	test: require('./test.js'),
};

module.exports = (serviceNames = [], logger) => {
	const config = configs[process.env.SERVICE_ENV];
	if (!config) {
		logger.error(`Couldn't load config for env ${process.env.SERVICE_ENV}`);
		return null;
	}
	const endpoints = {};
	serviceNames.forEach(name =>
		endpoints[name] = config.resources.find(resource => resource.name === name));
	return endpoints;
};
