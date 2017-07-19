module.exports = {
	resources: {
		[

			{
				name: "service-marketplace",
				URI: {
					local: "http://0.0.0.0:3004"
				}
			},
			{
				name: "app-marketplace",
				URI: { 
					local: "http://0.0.0.0:3002" 
				}
			},
			{
				name: "app-shopfront",
				URI: {
					local: "http://0.0.0.0:3003"
				},
			},
			{
				name: "service-b2c-store",
				URI: {
					local: "http://0.0.0.0:3001"
				}	
			},
		]
	}
}
