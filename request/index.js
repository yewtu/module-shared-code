const axios = require('axios');

// catch here or axios will create a much more verbose error message
// add option to not rethrow the error. This is useful if the caller is a Promise.all and we want to collect all
// successful requests as well as this failure
const logError = (err, endpoint, options = {}) => {
	if (!options.noLog) {
		console.error(err.response && err.response.status, `endpoint: ${endpoint}`, err.stack);
		err.logged = true;
	}
	if (options.noRethrowErrors) return err;
	throw err;
};

const requestConfig = (options = {}) => {
	const updatedOptions = Object.assign({}, options, {
		headers: options.headers || {},
		auth: {
			username: options.userName
		}
	});
	if (typeof window !== 'undefined') updatedOptions.headers['X-Requested-With'] = 'XMLHttpRequest';
	return updatedOptions;
};

module.exports = {
	get: (endpoint, options) => {
		return axios.get(endpoint, requestConfig(options))
			.then(response => response.data)
			.catch(err => logError(err, endpoint, options));
	},

	post: (endpoint, data, options = {}) => {
		return axios.post(endpoint, data, requestConfig(options))
			.then(response => response.data)
			.catch(err => logError(err, endpoint, options));
	},

	put: (endpoint, data, options = {}) => {
		return axios.put(endpoint, data, requestConfig(options))
			.then(response => response.data)
			.catch(err => logError(err, endpoint, options));
	},

	del: (endpoint, options) => {
		return axios.delete(endpoint, requestConfig(options))
			.catch(err => logError(err, endpoint, options));
	}
}
