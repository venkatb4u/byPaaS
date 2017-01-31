const debug = require('debug')('bypaas:routes:core');
const express = require('express');
const router = express.Router();
const misc = require('../src/misc');
const config = require('../src/config').root;
const Core = require('../src/core.sjs');



// route middleware that will happen on every request with param 'appId'
router.param('appId', function(req, res, next, name) {

  const shouldRulesBeApplied = req.query.applyrules === 'true' ? true : false;
  req.msg = {};
  req.msg.shouldRulesBeApplied = shouldRulesBeApplied;
  
  // continue doing what we were doing and go to the route
  next(); 
});

/*
A generic route that takes up the 'appId' & 'appType' (optional) as params,
and decides the further flow of the framework.
*/

// e.g.
//1. http://localhost:1234/bypaas /places/restaurant?nearby=chennai
// /bypaas /['appId']/['appType']?nearby=chennai&applyrules=true

//2. http://localhost:1234/bypaas /fullcontact/person?email=venkat.crescentian@gmail.com     
router.get('/:appId/:appType', misc.route(trigger_source));
task trigger_source(req, res) {
  debug(req.params, 'req.params');
  debug(req.query, 'req.query');
  
  // const shouldRulesBeApplied = req.query.applyrules === 'true' ? true : false;
  // req.msg = {};
  // req.msg.shouldRulesBeApplied = shouldRulesBeApplied;
  debug(req.msg, 'inside route');

  result <- Core.init(req);

  res.json({
    status: 'success',
    result: result
  });
}

export default router;
