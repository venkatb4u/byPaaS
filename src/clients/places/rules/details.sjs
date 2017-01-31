const debug = require('debug')('bypaas-places:rule:Details');
const config = require('../../../config').root;
const utils = require('../utils');
const async = require("async");

const GooglePlaces = require("googleplaces");
const googlePlaces = new GooglePlaces(config.supported_apps.google.places.key, config.supported_apps.google.places.output_format);

// Get Reviews for the given 'restaurant place_id'
task getDetails (data, cb) {
	catch (e) {
		throw e;
	}
	if (!Array.isArray(data)) {
		debug('Received input is not an array');
		return false;
	}

	err, netRes <<- async.mapLimit(data, 3, fetchForOneRecord);
	if (err) {
		console.log(err);
		throw err;
	}
	cb(null, netRes);
}

// Single Fetch operation
function fetchForOneRecord (item, done) {
	const place_id = item.place_id;
	const reference = item.reference;
	googlePlaces.placeDetailsRequest({reference: reference}, function(err, res) {
		if (err)
			done(err);
		done(null, res.result);
	});	
}

// Filters records with only Reviews
function thoseWithReviews (item) {
	return item.reviews
}
exports.process = getDetails;