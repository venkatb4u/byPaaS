const debug = require('debug')('bypaas-places:rule:Pick');


// Get Only reviews for the given set of place docs
task pickOnlyReviews (data, cb) {
	catch (e) {
		throw e;
	}
	if (!Array.isArray(data)) {
		debug('Received input is not an array');
		return false;
	}

	const reviews = data.map(pick);
	// return reviews;
	cb(null, reviews);
}

// Filter records that has Reviews
function pick (item) {
	return item.reviews
}
exports.process = pickOnlyReviews;