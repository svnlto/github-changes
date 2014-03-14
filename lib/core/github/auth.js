module.exports = function (self, opts) {

  if (!opts.authData.token) {
    return;
  }

  self.github.authenticate({
    type: 'oauth',
    token: opts.authData.token
  });

};

