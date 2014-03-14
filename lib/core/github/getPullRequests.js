var Promise = require('bluebird');
var _ = require('lodash');
var linkParser = require('parse-link-header');

var auth = require('./auth');

exports.getPullRequests = function (self, opts) {

  var issueOpts = {
    user: opts.owner,
    repo: opts.repository,
    state: 'closed',
    sort: 'updated',
    direction: 'desc',
    per_page: 100,
    page: 1
  };

  var getIssues = function (options) {
    auth();

    return self.github.issues.repoIssuesAsync(options).then(function (issues) {
      opts.verbose && console.log('issues pulled - ', issues.length);
      opts.verbose && console.log('issues page - ', options.page);
      return issues;
    });
  };

  return getIssues(issueOpts).then(function (issues) {
    var linkHeader = linkParser(issues.meta.link);
    var totalPages = (linkHeader && linkHeader.last) ? linkHeader.last.page : 1;

    if (totalPages > issueOpts.page) {
      var allReqs = [];

      for (var i = issueOpts.page; i < totalPages; i++) {
        var newOptions = _.clone(issueOpts, true);

        newOptions.page += i;

        allReqs.push(getIssues(newOptions));
      }

      return Promise.all(allReqs).reduce(function (issues, moreIssues) {
        return issues.concat(moreIssues);
      }, issues);
    }

    return issues;

  }).map(function (issue) {

    if (!issue.pull_request.html_url) {
      return;
    }

    auth();

    return self.github.pullRequests.getAsync({
      user: issueOpts.user,
      repo: issueOpts.repo,
      number: issue.number
    }).then(function (pr) {

      if (pr.base.ref !== opts.branch) {
        return;
      }

      if (!pr.merged_at) {
        return;
      }

      return pr;
    });

  }).reduce(function (scrubbed, pr) {

    if (pr) {
      scrubbed.push(pr);
    }

    return scrubbed;
  }, [])

  .then(function (prs) {
    return prs;
  });

};

