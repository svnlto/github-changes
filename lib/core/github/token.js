var Promise = require('bluebird');
var ghauth = Promise.promisify(require('ghauth'));

module.exports = function (opts, authOptions) {

  if (opts.token) {
    return Promise.resolve({
      token: opts.token
    });
  }

  if (opts.auth) {
    return ghauth(authOptions);
  }

  return Promise.resolve({});
};

