module.exports = function (opts, data) {

  var arry = [];

  data.forEach(function (pr) {

    var payload = {};

    if (pr.tag === null) {
      payload.name = opts['tag-name'];
    }

    payload.name = pr.tag.name;
    payload.tagName = pr.tag.name;
    payload.tagDate = pr.tag.date.utc().format('YYYY/MM/DD HH:mm Z');
    payload.number = pr.number;
    payload.html_url = pr.html_url;
    payload.title = pr.title;

    if (pr.user && pr.user.login) {
      payload.login = pr.user.login;
    }

    if (opts['issue-body'] && pr.body && pr.body.trim()) {
      payload.body = pr.body.trim().replace(/\n/ig, '\n    > ');
    }

    arry.push(payload);
  });

  return arry;

};

