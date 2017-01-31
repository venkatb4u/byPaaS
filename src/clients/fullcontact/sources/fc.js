
const debug = require('debug')('bypaas-FC:source:fc');
const config = require('../../../config').root;
const request = require('request');

const fcKey = config.supported_apps.fullcontact.key;

exports.source = function fetchFC (req, callback) {
    const email = req.query.email || "";
	// hit the API to get data
  	getFullContact(email, function(err, data){
      if(err) {
        debug('There was an error in checking full contact data for - ', err.message, err.stack);
        if (err.statusCode && err.ttl) {
          // pushing to DLX webhook retry queue with some ttl to try again later
          
        }
      }
      callback(null, data);
    });
}

function getFullContact(email, cb){
  const fullContactUrl = 'https://api.fullcontact.com/v2/person.json?apiKey=' + fcKey + '&prettyPrint=false&email=';
  const fullContactOrgUrl = 'https://api.fullcontact.com/v2/company/lookup.json?apiKey=' + fcKey + '&prettyPrint=false&domain=';
  const fcUrl = fullContactUrl+encodeURIComponent(email); // 'person' api
  debug('Fetching FullContact data from - ', fcUrl);
  request.get({url: fcUrl, timeout: 4000}, function(err, resp, body){
    if(err){
      debug('Error in FullContact request', err, err.stack);
      cb(err);
      return;
    }
    try{
      if(resp.statusCode === 200){ // 200 - OK Processed
        const fcdoc = {full_contact: JSON.parse(body)};
        cb(null, fcdoc);
      }else if(resp.statusCode === 202){ // 202 - Req is in progress
        debug('Got status code 202 from FullContact for ', email.id);
        // FullContact returned 202 for an email - retry after 2 minutes
        const retryErr = new Error('FullContact is being processed. Needs retry for result.');
        retryErr.statusCode = 202;
        retryErr.ttl = 120000;
        cb(retryErr);
      }else if(resp.statusCode === 403){ // 403 - Ratelimit exceeded
        debug('Got status code 403 from FullContact for ', email.id);
        const limitRemaining = resp.headers['x-rate-limit-remaining'];
        const limitReset = resp.headers['x-rate-limit-reset']; // time to Retry-After
        if (isNaN(limitReset) === false) {
          limitReset = limitReset * 1000;
        } else {
          limitReset = 60000;
        }
        const retryErr = new Error('Rate limit exceeded. Retry after - ' + limitReset);
        retryErr.statusCode = 403;
        retryErr.ttl = limitReset;
        debug('Status 403 from FullContact for ', email.id, '. Rate limit exceeded.. Submitted for retry after - ', limitReset);
        cb(retryErr); // not passing Error obj, as this is not a kind of 'error'
      }else if(resp.statusCode === 404){ // Not found - req was searched in the past 24hrs
        debug('Status 404 from FullContact for ', email.id, '. Info is not provided from fullcontact service');
        const fcdoc = {full_contact: JSON.parse(body)};
        cb(null, fcdoc);
      }else if(resp.statusCode === 503){ // Service temp unavailable.
        debug('Status 503 - FullContact service temporarily unavailable...');
        // FullContact service temporarily unavailable
        const retryAfter = resp.headers['retry-after'] || resp.headers['Retry-After'];
        if(isNaN(retryAfter)){
          // if retry-after header is not set, set it to 1 minute
          retryAfter = 60000;
        } else {
          retryAfter = retryAfter * 1000;
        }
        const retryErr = new Error('Status 503 - FullContact service temporarily unavailable...');
        retryErr.statusCode = 503;
        retryErr.ttl = retryAfter;
        cb(retryErr);
      }else if(resp.statusCode === 422){ // 422 - invalid api key or missing query params
        debug('Invalid email ID - ', email.id);
        const fcdoc = {full_contact: JSON.parse(body)};
        cb(null, fcdoc);
      }else{
        const err = {
          message: 'Error fetching FullContact data for ' + email.id,
          code: resp.statusCode,
          body: body
        };
        cb(new Error(err));
      }  
    }catch(e){
      cb(e);
    }    
  });
}