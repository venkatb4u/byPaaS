const debug = require('debug')('bypaas-places:source:nearbyPlaces');
const config = require('../../../config').root;
const utils = require('../utils.sjs');

const GooglePlaces = require("googleplaces");
const googlePlaces = new GooglePlaces(config.supported_apps.google.places.key, config.supported_apps.google.places.output_format);

// Search for the Places nearby the 'location' provided
task fetchNearbyPlaces (data) {
  catch (e) {
    throw e;
  }
  const searchType = [data.params.appType];
  geoInfo <- utils.geoCode(data.query.nearby);
  const latLong = [geoInfo[0].latitude, geoInfo[0].longitude];
  console.log('GeoCode - ', latLong);

  const parameters = {
    location: latLong,
    types: searchType
  };

  error, response <<- googlePlaces.placeSearch(parameters);
  if (error) {
    console.log(error);
    throw error;
  } 

  return response.results;

};

exports.source = fetchNearbyPlaces;
