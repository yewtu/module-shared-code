const userProfiles = require('./userProfiles.json');

module.exports = async userName => {
	return new Promise((resolve, reject) => {
		if (userProfiles[userName]) return resolve(userProfiles[userName]);
		reject(new Error(`User ${userName} not found`));
	});
};
