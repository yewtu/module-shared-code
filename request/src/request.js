const axios = require('axios');

const requestConfig = function ( options ) {
    options = options || {};
    const updatedOptions = Object.assign({}, options, {
        headers: options.headers || {},
        auth: {
            username: options.userName,
            password: options.password
        }
    });
    if ( typeof window !== 'undefined' ) updatedOptions.headers[ 'X-Requested-With' ] = 'XMLHttpRequest';
    return updatedOptions;
};


function requestFactory () {
    const catchError = ( endPoint, method ) => err => {
        if ( err.message === "Network Error" ) {
            const detailedNetworkErr = new Error(`Network error using ${method} to access ${endPoint}`);
            this.logger.error(detailedNetworkErr);
            return Promise.reject(detailedNetworkErr);
        }
        else {
            this.logger.error(err);
            return Promise.reject(err)
        }
    };

    const pickData = response => response.data;
    this.logger = console;

    return {
        get: ( endpoint, options ) => {
            return axios.get(endpoint, requestConfig(options))
                .then(pickData)
                .catch(catchError(endpoint, "GET"))
        },

        post: ( endpoint, data, options ) => {
            options = options || {};
            return axios.post(endpoint, data, requestConfig(options))
                .then(pickData)
                .catch(catchError(endpoint, "POST"))
        },

        put: ( endpoint, data, options ) => {
            options = options || {};
            return axios.put(endpoint, data, requestConfig(options))
                .then(pickData)
                .catch(catchError(endpoint, "PUT"))
        },

        del: ( endpoint, options ) => {
            return axios.delete(endpoint, requestConfig(options))
                .catch(catchError(endpoint, "DELETE"))
        },
        useLogger: ( logger = console ) => {
            if ( "log" in logger && "error" in logger ) {
                this.logger = logger
            }
        }
    }
}

module.exports = requestFactory.call({});
