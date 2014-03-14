var _ = require('lodash');
var commitsBySha = {}; // populated when calling getAllCommits

module.exports = function (mergeCommit) {
  var parentShas = _.pluck(mergeCommit.parents, 'sha');
  var notSha = parentShas.shift(); // value to pass to --not flag in git log

  // store reachable commits
  var store1 = {};
  var store2 = {};

  var getAllReachableCommits = function (sha, store) {

    if (!commitsBySha[sha]) {
      return;
    }

    store[sha] = true;

    commitsBySha[sha].parents.forEach(function (parent) {
      if (store[parent.sha]) {
        return; // don't revist commits we've explored
      }

      return getAllReachableCommits(parent.sha, store);
    });
  };

  parentShas.forEach(function (sha) {
    return getAllReachableCommits(sha, store1);
  });

  getAllReachableCommits(notSha, store2);

  return _.difference(
    Object.keys(store1),
    Object.keys(store2)
  ).map(function (sha) {
    return commitsBySha[sha];
  });

};

