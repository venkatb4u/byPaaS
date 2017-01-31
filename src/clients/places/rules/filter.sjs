const debug = require('debug')('bypaas-places:rule:Filter');


// Filter the places with the given set of detailed docs
task filterPlaces (data, cb) {
	catch (e) {
		throw e;
	}
	if (!Array.isArray(data)) {
		debug('Received input is not an array');
		return false;
	}

	const docsWithReviews = data.filter(thoseWithReviews);
	// debug(netRes, ' - netRes');
	// return docsWithReviews;
	cb(null, docsWithReviews);
}

// Filter records that has Reviews
function thoseWithReviews (item) {
	return item.reviews
}
exports.process = filterPlaces;