module.exports = function (opts, data) {
  var currentTagName = '';
  var output = '## Change Log\n';

  data.forEach(function (pr) {

    if (pr.tag === null) {
      currentTagName = opts['tag-name'];

      output += '\n### ' + opts['tag-name'];
      output += '\n';

    } else if (pr.tag.name !== currentTagName) {
      currentTagName = pr.tag.name;

      output += '\n### ' + pr.tag.name;
      output += ' (' + pr.tag.date.utc().format('YYYY/MM/DD HH:mm Z') + ')';
      output += '\n';
    }

    output += '- [#' + pr.number + '](' + pr.html_url + ') ' + pr.title;

    if (pr.user && pr.user.login) {
      output += ' (@' + pr.user.login + ')';
    }

    if (opts['issue-body'] && pr.body && pr.body.trim()) {
      output += '\n\n    >' + pr.body.trim().replace(/\n/ig, '\n    > ') + '\n';
    }

    // output += ' ' + moment(pr.merged_at).utc().format('YYYY/MM/DD HH:mm Z');
    output += '\n';
  });

  return output.trim();
};

