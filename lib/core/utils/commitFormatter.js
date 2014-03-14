var getCommitsInMerge = require('../github/getCommitsInMerge');

module.exports = function (opts, data) {

  var currentTagName = '';
  var output = '## Change Log\n';

  data.forEach(function (commit) {

    var isMerge = (commit.parents.length > 1);
    var isPull = isMerge && /^Merge pull request #/i.test(commit.commit.message);
    // exits
    if ((opts.merges === false) && isMerge) {
      return '';
    }

    if ((opts['only-merges']) && commit.parents.length < 2) {
      return '';
    }

    if ((opts['only-pulls']) && !isPull) {
      return '';
    }

    // choose message content
    var messages = commit.commit.message.split('\n');
    var message = messages.shift().trim();

    if (opts['use-commit-body'] && commit.parents.length > 1) {
      message = messages.join(' ').trim() || message;
    }

    if (commit.tag === null) {
      currentTagName = opts['tag-name'];

      output += '\n### ' + opts['tag-name'];
      output += '\n';
    } else if (commit.tag.name !== currentTagName) {
      currentTagName = commit.tag.name;

      output += '\n### ' + commit.tag.name;
      output += ' (' + commit.tag.date.utc().format('YYYY/MM/DD HH:mm Z') + ')';
      output += '\n';
    }

    // if commit is a merge then find all commits that belong to the merge
    // and extract authors out of those. Do this for --only-merges and for
    // --only-pulls
    var authors = {};

    if (isMerge && (opts['only-merges'] || opts['only-pulls'])) {
      getCommitsInMerge(commit).forEach(function (c) {
        // ignore the author of a merge commit, they might have reviewed,
        // resolved conflicts, and merged, but I don't think this alone
        // should result in them being considered one of the authors in
        // the pull request
        if (c.parents.length > 1) return;

        if (c.author && c.author.login) {
          authors[c.author.login] = true;
        }
      });
    }

    authors = Object.keys(authors);

    // if it's a pull request, then the link should be to the pull request
    if (isPull) {
      var prNumber = commit.commit.message.split('#')[1].split(' ')[0];

      var author = (commit.commit.message.split(/\#\d+\sfrom\s/)[1] || '').split('/')[0];
      var url = 'https://github.com/' + opts.owner + '/' + opts.repository + '/pull/' + prNumber;
      output += '- [#' + prNumber + '](' + url + ') ' + message;

      if (authors.length)
        output += ' (' + authors.map(function (author) {
          return '@' + author;
        }).join(', ') + ')';
      else
        output += ' (@' + author + ')';
    } else { //otherwise link to the commit
      output += '- [' + commit.sha.substr(0, 7) + '](' + commit.html_url + ') ' + message;

      if (authors.length) {
        output += ' (' + authors.map(function (author) {
          return '@' + author;
        }).join(', ') + ')';
      }
      else if (commit.author && commit.author.login) {
        output += ' (@' + commit.author.login + ')';
      }
    }

    // output += ' ' + moment(commit.commit.committer.date).utc().format('YYYY/MM/DD HH:mm Z');
    output += '\n';

  });

  return output.trim();
};

