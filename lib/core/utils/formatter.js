var commitFormatter = require('./commitFormatter');
var prFormatter = require('./prFormatter');

module.exports = function (self, opts, data) {

  if (opts.data === 'commits') {
    return commitFormatter(opts, data);
  }

  return prFormatter(opts, data);
};

