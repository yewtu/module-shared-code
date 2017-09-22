'use strict';

var axios = require('axios');

var requestConfig = function requestConfig(options) {
    options = options || {};
    var updatedOptions = Object.assign({}, options, {
        headers: options.headers || {},
        auth: {
            username: options.userName,
            password: options.password
        }
    });
    if (typeof window !== 'undefined') updatedOptions.headers['X-Requested-With'] = 'XMLHttpRequest';
    return updatedOptions;
};

function requestFactory() {
    var _this = this;

    var catchError = function catchError(endPoint, method) {
        return function (err) {
            if (err.message === "Network Error") {
                var detailedNetworkErr = new Error('Network error using ' + method + ' to access ' + endPoint);
                _this.logger.error(detailedNetworkErr);
                return Promise.reject(detailedNetworkErr);
            } else {
                _this.logger.error(err);
                return Promise.reject(err);
            }
        };
    };

    var pickData = function pickData(response) {
        return response.data;
    };
    this.logger = console;

    return {
        get: function get(endpoint, options) {
            return axios.get(endpoint, requestConfig(options)).then(pickData).catch(catchError(endpoint, "GET"));
        },

        post: function post(endpoint, data, options) {
            options = options || {};
            return axios.post(endpoint, data, requestConfig(options)).then(pickData).catch(catchError(endpoint, "POST"));
        },

        put: function put(endpoint, data, options) {
            options = options || {};
            return axios.put(endpoint, data, requestConfig(options)).then(pickData).catch(catchError(endpoint, "PUT"));
        },

        del: function del(endpoint, options) {
            return axios.delete(endpoint, requestConfig(options)).catch(catchError(endpoint, "DELETE"));
        },
        useLogger: function useLogger() {
            var logger = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : console;

            if ("log" in logger && "error" in logger) {
                _this.logger = logger;
            }
        }
    };
}

module.exports = requestFactory.call({});
