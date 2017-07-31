const userProfiles = require('./userProfiles.json');

module.exports = userName => {
	return new Promise((resolve, reject) => {
		if (userProfiles[userName]) return resolve(userProfiles[userName]);
		reject(new Error(`User ${userName} not found`));
	});
};
