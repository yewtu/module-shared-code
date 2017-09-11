const userProfiles = require('./userProfiles.json');

module.exports = async userName => {
	if (userProfiles[userName]) return userProfiles[userName];
	throw new Error(`User ${userName} not found`);
};
