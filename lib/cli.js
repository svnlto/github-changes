var runner = require('./core/runner');
var GithubApi = require('github');
var http = require('http');
var https = require('https');

var _ = require('lodash');

var Promise = require('bluebird');

module.exports = function (options) {

  this.token = null;
  this.github = new GithubApi({
    version: '3.0.0',
    timeout: 10000
  });

  Promise.promisifyAll(this.github.repos);
  Promise.promisifyAll(this.github.pullRequests);
  Promise.promisifyAll(this.github.issues);

  // ~/.config/changelog.json will store the token
  var authOptions = {
    configName : 'changelog',
    scopes     : ['user', 'public_repo', 'repo']
  };

  var opts = {
    owner: 'hoodiehq',  //  (required) owner of the Github repository
    repository: 'hoodie-server', // (required) name of the Github repository
    data: 'pulls',  // (DEPRECATED) use pull requests or commits (choices: pulls, commits)
    branch: 'master', // name of the default branch
    'tag-name': null, // tag name for upcoming release
    'issue-body': false,
    'no-merges': false, // do not include merges
    'only-merges': false,  // only include merges
    'only-pulls': true, // only include pull requests
    'use-commit-body': false, //use the commit body of a merge instead of the message - "Merge branch..."
    'order-semver': true, // use semantic versioning for the ordering instead of the tag date
    auth: true, // prompt to auth with Github - use this for private repos and higher rate limits
    token: false, // need to use this or --auth for private repos and higher rate limits
    //file: 'output.txt', // name of the file to output the changelog to
    verbose: true, // output details,
    raw: false
  };

  _.merge(opts, options);

  runner.apply(this, [opts, authOptions]);

  // Increase number of concurrent requests
  http.globalAgent.maxSockets = 60;
  https.globalAgent.maxSockets = 60;
};

