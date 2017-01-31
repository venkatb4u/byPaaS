
// Client-App config
exports.App = {
	bizid: "user1",
	sources: [{
		id: 'places',
		service: { // specifying one of the framework subscribed services
 			id: 'google', 
 			type: 'places',
 			userContext: { // if user-context level, else framework config can be used (optional)
 				credentials: { 
					key: "AIzaSyBuAACZdJOJqcpzVtLicGCqgaVzT9d9HvE",
					output_format: "json"
				},
				ratelimit: {
					max: 300,
					duration: 60000
				}
 			}
		},
		
		// handler: require('./sources/nearbyPlaces.sjs'), // optional. If in case extra level of processing the raw source o/p is needed.
		
		fetch: {
			input: {
				
			},
			mode: "poll", // poll/push
			frequency: 3000, // 3s
			page: 2, // paging
 			skip: 100, // skipping off initial 99 records
 			backfill: true // boolean to decide backfill the fetch or not
		}
		
	}],
	rules: {
		places: {
			restaurant: {
				type: "waterfall", // waterfall/parallel mode of execution
				set: [{
					id: '',
					handler: require('./rules/details.sjs'),
					type: ''
				},
				{
				    id: 'filter',
				    handler: require('./rules/filter.sjs'),
				    type: 'Event'
				},
				{
				    id: 'pick',
				    handler: require('./rules/pick.sjs'),
				    type: 'Event'
				}]
			}
			 
		}
	},
	db: {
	   "url": "any remote db endpoint that the user specifies"
	},
	queue: {
		id: "rabbitmq",
		details: {}
	},
	webhooks: {
		url: ""	
	}
};