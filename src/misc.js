const debug = require('debug')('bypaas-misc');

exports.route = function task_route(handler) {
    return function wrapped_route(req, res, next) {
        handler(req, res, function(err) {
          if (err && !res.headersSent) {
            next(err);
          }
        });
    };
};

exports.protoTime = function timestamp(Timestamp, date) {
  const now = +(date || new Date());
  return new Timestamp({
    seconds: (now / 1000).toFixed(),
    nanos: now % 1000
  });
};

const moduleCache = exports.moduleCache = {};

function requireFromString(src, filename) {
  const m = new module.constructor();
  m.paths = module.paths;
  m._compile(src, filename);
  return m.exports;
}

// sourceName: name of the Source
// type: pre or post
// src: source as string
function loadFeedHook(sourceName, type, src) {
  const m;
  try {
    m = requireFromString(src);
  } catch(e) {
    debug("Error loading feed hook: " + e);
    return null;
  }
  moduleCache[sourceName + ':' + type] = m;
  return m;
}

function executeFeedHook(sourceName, type, params, callback) {
  const key = sourceName + ':' + type;
  if (moduleCache[key]) {
    return moduleCache[key](params, callback);
  }
}

exports.loadFeedHook = loadFeedHook;
exports.executeFeedHook = executeFeedHook;
