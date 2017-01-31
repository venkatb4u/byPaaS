

// Client-App config
exports.App = {
	bizid: "user2",
	sources: [{
		id: 'fullcontact',
		service: { // specifying one of the framework subscribed services
 			id: 'fullcontact', 
 			type: '',
			userContext: { // if user-context level, else framework config can be used (optional)
				credentials: { 
					key: "77b9c858cde37e01"
				},
				ratelimit: {
					max: 300,
					duration: 60000
				}
			}
		},
		
		// handler: require('./sources/fc.js'),

		fetch: {
			input: {
				prettyPrint: false
			},
			mode: "poll", // poll/push
			frequency: 3000, // 3s
			page: 1, // paging
 			skip: 100, // skipping off initial 99 records
 			backfill: true // boolean to decide backfill the fetch or not
		}
		
	}],
	rules: {
		fullcontact: {
			person: {
				type: "waterfall", // waterfall/parallel mode of execution
				set: [{
					id: '',
					handler: require('./rules/getOrg.js'),
					type: ''
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