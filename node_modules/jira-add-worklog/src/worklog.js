const request = require('request'),
    chalk = require('chalk'),
    log = console.log;

module.exports = function (args) {
  const username = args.username,
    apiToken = args.apiToken,
    email = args.email,
    timeSpent = args.timeSpent,
    comment = args.comment,
    domain = args.domain,
    issueIdOrKey = args.issueIdOrKey,
    self = `https://${domain}.jira.com/rest/api/2/user?username=${username}`,
    data = {  
      'author':{  
        'self': self,
        'name': username,
        'key': username,
        'active':true
      },
      'self': self,
      'updateAuthor': {},
      'comment' : comment,
      'timeSpent': timeSpent
    },

    // Set the headers
    headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ` + new Buffer(`${email}:${apiToken}`).toString('base64')
    },
    // Configure the request
    options = {
      url: `https://${domain}.jira.com/rest/api/2/issue/${issueIdOrKey}/worklog`,
      method: 'POST',
      headers: headers,
      json: true,
      body: data
    };
  // add start time
  args.started && (data.started = args.started);
  log(chalk.hex('#ffcc00')(`warning: do not quit!`));
  // Start the request
  request(options, function (error, response, body) {
    if (!error && body && !body.errorMessages) {
      log(chalk.green.underline('succesfully worklog added!'));
      log(chalk.hex('#00a200')(`worklog author: ${body.author.displayName}`));
      log(chalk.hex('#00a200')(`issue id: ${issueIdOrKey}`));
      log(chalk.hex('#00a200')(`time spent: ${body.timeSpent}`));
      log(chalk.hex('#00a200')(`description: ${body.comment ? body.comment : ''}`));
    } else {
      log(chalk.red.bold(`error: ${error}`));
    }
  });
}