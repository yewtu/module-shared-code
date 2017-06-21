const readLoggedInUserFromCookie = require('./login/readLoggedInUserFromCookie');
const writeLoggedInUserToCookie = require('./login/writeLoggedInUserToCookie');
const logOutUser = require('./login/logOutUser');

module.exports = {
  readLoggedInUserFromCookie,
  writeLoggedInUserToCookie,
  logOutUser
};
