const debug = require('debug')('bypaas:src:core');
const async = require("async");
const config = require('./config').root; // framework config


const clientPath = './clients/';

task init (req) {
  catch (e) {
    debug('init_err', e);
    return e;
  }
  
  const options = req.params;

  // TODO: should think of where to retain /*/manifest.js
  const manifest = require(clientPath + options.appId + '/manifest'); 
  const App = manifest.App; // Client-App config
  const Sources = App.sources;
  
  if (!Sources.length) {
    throw new Error("No source list definition");
  }

  // For each sources i, source
  // err, res <<- triggerSource(Sources[i]);
  err, res <<- async.map(Sources, async.apply(triggerSource, req));
  
  return res;

}

task triggerSource (req, src) { // syntax: [params...], coll entry
  catch (e) {
    debug('triggerSource_err', e);
    throw e;
  }
  
  const service = src.service;
  const suppApp = config.supported_apps[service.id];
  const suppAppType = suppApp[service.type];
  const app = suppAppType || suppApp;  // e.g. 'google.places' or 'google'

  if (app) { // if the service app matches with the supported_apps
    const userContext = service.userContext;
    const creds = userContext && userContext.credentials;
    const connHandlerPath = './connectors/' + (service.id && service.type ? service.id + '/' + service.type : service.id) + '/main.sjs';
    const connHandler = require(connHandlerPath);

    //TODO: custom creds & rate limit needs to be handled
    sourceData <- connHandler.source(req);

    // Deciding if Rules should be applied
    if (req.msg && req.msg.shouldRulesBeApplied) {
      err, results <<- invokeSourceRules(req.params, sourceData);
      return results;
    }

    return sourceData;
  }

}


function invokeSourceRules(app, sourceData, callback) {
    const triggered = [];
    const rule = null;
    // How was this rule triggered?
    // Can be source or webhook
    const trigger = 'source';

    // Rules is a list of lambda function names
    fetchRulesForSource(app, function(err, rules) {
        if (err) {
            return callback(err);
        }
        const ruleHandlers = rules.set.map(function(d) { // Extracting the handlers of a Rule
        	return d.handler.process
        });
        ruleHandlers.unshift(function(cb) { // Initiating the waterfall with input data
        	cb(null, sourceData);
        });

        if (rules.type === 'waterfall') { // waterfall flow of execution
        	async.waterfall(ruleHandlers, function(err, result) {
	        	// debug('collective waterfall res - ', result);
	        	callback(null, result);
	        });	
        } else { // parallel flow of execution
        	async.parallel(ruleHandlers, function(err, result) {
        		// debug('collective parallel res - ', result);
	        	callback(null, result);
        	});
        }
        // async.map(rules, async.reflect(async.apply(invokeRule, trigger, sourceData)), function(err, results) {
        //     // debug("invokeSourceRules result: " + JSON.stringify(results));
        //     results = results.map(function(r, i) {
        //         try {
        //             const message = r.value ? (r.value.error ? r.value.error : r.value) : r.error;
        //             if (message.Payload) {
        //                 message.Payload = JSON.parse(message.Payload);
        //             }
        //         } catch (ex) {}

        //         return {
        //             id: rules[i].id,
        //             status: r.value && !r.value.error ? 'success' : 'error',
        //             message: message
        //         }
        //     });

        //     callback(null, results);
        // });
    });

    task invokeRule(trigger, sourceData, rule) {
        const handler = null;

        catch (e) {
            debug("invokeRule_error: " + (e.message || e.toString()));
            return {
                error: e.message || e.toString()
            };
        }

        switch (trigger) {
            case 'webhook':
                {
                    if (rule.handler && typeof rule.handler.webhookTransform === 'function') {
                        sourceData <- rule.handler.webhookTransform(sourceData);
                        debug("Transformed source: " + JSON.stringify(sourceData));
                    }
                }

            case 'source':
                {
                    if (rule.handler && typeof rule.handler.process === 'function') {
                        handler = async.apply(rule.handler.process);
                    }
                }
        }

        if (!handler) {
            console.log('No Handler...');
            // handler = async.apply(utils.invokeLambda, rule.id, rule.type);
        }

        debug("Invoking rule: " + rule.id + " of type: " + rule.type);
        result <- handler(sourceData);

        debug(result.length, ' - net output length of rule - ', rule.id);
        
        return result;
    }
}

task fetchRulesForSource(app) {
  const id = app.appId;
  const type = app.appType;
  const App = require(clientPath + id + '/manifest').App; // Client-App config

  return App.rules[id][type] || [];
}


exports.init = init;
exports.invokeSourceRules = invokeSourceRules;

