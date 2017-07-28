/*
Copy this file to the folder one level above the repos, then run with 'pm2 start pm2-marketplace.config.js'
 */
module.exports = {
	apps: [
		{
			name: "app-b2b-marketplace",
			script: "./app-b2b-marketplace/dist/server/index.js",
			watch: true,
			cwd: "./app-b2b-marketplace",
			env: {
				"SERVICE_ENV": "local",
				"NODE_ENV": "development"
			}
		},
		{
			name: "service-b2b-marketplace",
			script: "./service-b2b-marketplace/index.js",
			cwd: "./service-b2b-marketplace",
			watch: true,
			node_args: ["--harmony"],
			env: {
				"SERVICE_ENV": "local",
				"NODE_ENV": "development"
			}
		},
		{
			name: "app-cow-publisher",
			script: "./app-cow-publisher/dist/server/index.js",
			cwd: "./app-cow-publisher",
			watch: true,
			env: {
				"SERVICE_ENV": "local",
				"NODE_ENV": "development"
			}
		}
	]
}
