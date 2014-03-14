var commitParser = require('./commitParser');
var pullParser = require('./pullParser');

module.exports = function (self, opts, data) {

  if (opts.data === 'commits') {
    return commitParser(opts, data);
  }

  return pullParser(opts, data);
};

