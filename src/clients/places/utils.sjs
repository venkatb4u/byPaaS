
const config = require('../../config').root;
const debug = require('debug')('bypaas-places:utils');

const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
 
  // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: config.supported_apps.google.places.key, // for Mapquest, OpenCage, Google Premier 
  formatter: config.supported_apps.google.places.output_format // 'gpx', 'string', ... 
};
 
const geocoder = NodeGeocoder(options);
 
// Finds GeoCode for the given location
task geoCode (place) {
  err, res <<- geocoder.geocode(place);
  if (err)
    throw err;
  return res;
};

exports.geoCode = geoCode;
