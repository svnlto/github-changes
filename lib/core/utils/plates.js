var Handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');

Handlebars.registerHelper('debug', function (optionalValue) {
  console.log('Current Context');
  console.log('====================');
  console.log(this);

  if (optionalValue) {
    console.log('Value');
    console.log('====================');
    console.log(optionalValue);
  }
});

var commitsTemplate = fs.readFileSync(path.resolve('lib/core/templates/commits.hbs'), 'utf8');
var pullsTemplate = fs.readFileSync(path.resolve('lib/core/templates/pull.hbs'), 'utf8');

var commits = commitsTemplate;
var comts = Handlebars.compile(commits);

var pulls = pullsTemplate;
var pull = Handlebars.compile(pulls);



module.exports = function (self, opts, data) {

  if (opts.data === 'commits') {
    if (!opts.raw) {
      console.log(comts(data));
    }

    return data;
  }

  if (!opts.raw) {
    console.log(pull(data));
  }

  return data;
};

