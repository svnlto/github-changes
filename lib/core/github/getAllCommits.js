var Promise = require('bluebird');
var commitStream = require('github-commit-stream');

module.exports = function (opts) {

  opts.verbose && console.log('fetching commits');

  return new Promise(function (resolve, reject) {
    var commits = [];
    var commitsBySha = {};

    commitStream({
      token: opts.authData.token,
      user: opts.owner,
      repo: opts.repository,
      sha: opts.branch,
      per_page: 100
    }).on('data', function (data) {
      commitsBySha[data.sha] = data;
      commits = commits.concat(data);
    }).on('end', function (error) {

      if (error) {
        return reject(error);
      }

      opts.verbose && console.log('fetched all commits');

      return resolve(commits);
    });

  });

};

