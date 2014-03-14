var Promise = require('bluebird');
var moment = require('moment');
var semver = require('semver');
var _ = require('lodash');

var getGithubToken = require('./github/token');

var getTags = require('./github/tags');
var getData = require('./github/getData');


var parser = require('./utils/parser');
var plates = require('./utils/plates');
var tagger = require('./github/tagger');

var allTags;

module.exports = function (opts, authOptions) {

  var self = this;

  getGithubToken(opts, authOptions)
  .then(function (authData) {

    if (!authData.token) {
      return;
    }

    opts.authData = authData;
  })

  .then(function () {
    return Promise.all([getTags.call(this, self, opts), getData.call(this, self, opts)]);
  })

  .spread(function (tags, data) {
    allTags = _.sortBy(tags, 'date').reverse();
    return data;
  })

  .map(function (data) {
    data.tag = tagger(opts, allTags, data);
    data.tagDate = data.tag.date;
    return data;
  })

  .then(function (data) {

    //order by tag date then commit date DESC
    if (!opts['order-semver'] && opts.data === 'commits') {

      data = data.sort(function (a, b) {
        var tagCompare = (a.tagDate - b.tagDate);

        if (!tagCompare) {
          return (moment(b.commit.committer.date) - moment(a.commit.committer.date));
        } else {
          return tagCompare;
        }

      }).reverse();

      return data;

    } else if (!opts['order-semver'] && opts.data === 'pulls') {

      data = data.sort(function (a, b) {
        var tagCompare = (a.tagDate - b.tagDate);

        if (!tagCompare) {
          return (moment(b.merged_at) - moment(a.merged_at));
        } else {
          return tagCompare;
        }

      }).reverse();
      return data;
    }

    //order by semver then commit date DESC
    data = data.sort(function (a, b) {

      if (semver.valid(a) && semver.valid(b)) {
        var tagCompare = 0;

        if (a.tag.name === b.tag.name) {
          tagCompare = 0;
        } else if (a.tag.name === opts['tag-name']) {
          tagCompare = 1;
        } else if (b.tag.name === opts['tag-name']) {
          tagCompare - 1;
        } else {
          tagCompare = semver.compare(a.tag.name, b.tag.name);
        }

        if (tagCompare) {
          return tagCompare;
        } else {
          return (moment(b.commit.committer.date) - moment(a.commit.committer.date));
        }
      }

    }).reverse();

    return data;
  })

  .then(function (data) {
    return parser.call(this, self, opts, data);
  })


  .done(function (data) {
    return plates.call(this, self, opts, data);
  });

  //.then(function () {
    //process.exit(0);
  //})

  //.catch(function (error) {
    //console.error('error', error);
    //console.error('stack', error.stack);
    //process.exit(1);
  //});

};

