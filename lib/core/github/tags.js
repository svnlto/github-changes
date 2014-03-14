var moment = require('moment');
var auth = require('./auth');

module.exports = function (self, opts) {

  var tagOpts = {
    user: opts.owner,
    repo: opts.repository
  };

  auth.call(this, self, opts);

  return self.github.repos.getTagsAsync(tagOpts).map(function (ref) {

    auth.call(this, self, opts);

    return self.github.repos.getCommitAsync({
      user: tagOpts.user,
      repo: tagOpts.repo,
      sha: ref.commit.sha
    }).then(function (commit) {

      //opts.verbose && console.log('pulled commit data for tag - ', ref.name);
      return {
        name: ref.name,
        date: moment(commit.commit.committer.date)
      };

    });

  }).then(function (tags) {
    return tags;
  });

};

