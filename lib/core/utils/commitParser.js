var getCommitsInMerge = require('../github/getCommitsInMerge');

module.exports = function (opts, data) {

  var currentTagName = '';

  var arry = [];

  data.forEach(function (commit) {
    var payload = {};

    var isMerge = (commit.parents.length > 1);
    var isPull = isMerge && /^Merge pull request #/i.test(commit.commit.message);

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
      payload.name = opts['tag-name'];
    } else if (commit.tag.name !== currentTagName) {
      payload.name = commit.tag.name;
      payload.tagName = commit.tag.name;
      payload.tagDate = commit.tag.date.utc().format('YYYY/MM/DD HH:mm Z');
    }

    // if commit is a merge then find all commits that belong to the merge
    // and extract authors out of those. Do this for --only-merges and for
    // --only-pulls
    payload.authors = {};

    if (isMerge && (opts['only-merges'] || opts['only-pulls'])) {
      getCommitsInMerge(commit).forEach(function (ref) {

        console.log('pulls >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', ref);
        // ignore the author of a merge commit, they might have reviewed,
        // resolved conflicts, and merged, but I don't think this alone
        // should result in them being considered one of the authors in
        // the pull request
        if (ref.parents.length > 1) return;

        if (ref.author && ref.author.login) {
          payload.authors[ref.author.login] = true;
        }
      });
    }

    payload.authors = Object.keys(payload.authors);

    // if it's a pull request, then the link should be to the pull request
    if (isPull) {

      var prNumber = commit.commit.message.split('#')[1].split(' ')[0];

      var author = (commit.commit.message.split(/\#\d+\sfrom\s/)[1] || '').split('/')[0];
      var url = 'https://github.com/' + opts.owner + '/' + opts.repository + '/pull/' + prNumber;

      payload.prNumber = prNumber;
      payload.url = url;
      payload.message = message;
      payload.author = author;
      payload.sha = commit.sha.substr(0, 7);
      payload.html_url = commit.html_url;
      payload.authorLogin = commit.author.login;
      payload.authors = [];

      if (payload.authors.length)
        payload.authors.forEach(function (author) {
          payload.authors.push(author);
        });
      else {
        payload.author = author;
      }
    } else {
      //otherwise link to the commit
      payload.sha = commit.sha.substr(0, 7);
      payload.html_url = commit.html_url;

      if (payload.authors.length) {
        payload.authors.forEach(function (author) {
          payload.authors.push(author);
        });
      } else if (commit.author && commit.author.login) {
        payload.author = commit.author.login;
      }
    }

    arry.push(payload);
  });

  return arry;
};

