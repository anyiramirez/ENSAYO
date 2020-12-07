#! /usr/bin/env node

/**
 * Module dependencies
 */
const program = require('commander'),
  co = require('co'),
  prompt = require('co-prompt'),
  chalk = require('chalk'),
  worklog = require('./src/worklog'),
  log = console.log,
  pkgJSON = require('./package.json');
/**
 * varibale declaration
 */
const dateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/,
  timeRegex = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/,
  timeZoneRegex = /[+-]([01]\d|2[0-4])(:?[0-5]\d)?/;

let date = new Date(),
  defaultTimeSpent = '1h 30m',
  defaultTime = `${date.toLocaleTimeString()}.000`,
  defaultDate = `${date.getFullYear()}-${('0' + (date.getMonth() +　1)).slice(-2)}-${('0' + (date.getDate() +　1)).slice(-2)}`,
  tZoneOffset = new Date().getTimezoneOffset() * -1,
  absTZOffset = Math.abs(tZoneOffset),
  defaultTimeZone = `${tZoneOffset < 0 ? '-' : '+'}${('0' + parseInt(absTZOffset / 60).toString()).slice(-2)}${absTZOffset % 60}`;
let args = {},
  placeHolders = ['username', 'apiToken', 'email', 'domain', 'issueIdOrKey', 'timeSpent', 'comment', 'startDate', 'startTime', 'timeZone'],
  briefInfo = {
    'timeSpent': `[${defaultTimeSpent}]`,
    'startDate': `[${defaultDate}]`,
    'startTime': `[${defaultTime}]`,
    'timeZone': `[${defaultTimeZone}]`
  },
  defaultValue = {
    'timeSpent': `${defaultTimeSpent}`,
    'startDate': `${defaultDate}`,
    'startTime': `${defaultTime}`,
    'timeZone': `${defaultTimeZone}`
  },
  test = {
    // 'timeSpent': `${defaultTimeSpent}`,
    'startDate': dateRegex,
    'startTime': timeRegex,
    'timeZone': timeZoneRegex
  };

/**
 * parse all supported arguments
 */
program
  .version(`${pkgJSON.version}`, '-v, --version')
  .option('-C, --config           [string]', 'Path to the config file. [default: logwork.config.js]', v => v, './logwork.config.js')
  .option('-u, --username         [string]', 'Username of jira account.')
  .option('-a, --api-token        [string]', 'API token for basic authentication. Generate an API token in jira.')
  .option('-e, --email            [string]', 'Registered email address')
  .option('-t, --time-spent       [string]', `Time for log work hour. For example: ['30m', '1h', '1h 30m', '1d 1h 30m']`)
  .option('-i, --issue-id-or-key  [string]', 'Issue id or key for the issue where work hour will be logged')
  .option('-d, --domain           [string]', 'Domain name')
  .option('-c, --comment          [string]', 'Description of the work')
  .option('-D, --start-date       [string]', 'Start date of current work [optional]. For example: 2018-12-31')
  .option('-T, --start-time       [string]', 'Start time of current work [optional]. For example: 22:10:00')
  .option('-z, --time-zone        [string]', 'current time zone [optional]. For example: +0530')
  .parse(process.argv);
try {
  const config = require(program.config);
  for (let i = 0, len = placeHolders.length, value, placeHolder; i < len; i++) {
    (value = config[placeHolder = placeHolders[i]]) && (args[placeHolder] = value);
  }
} catch (err) {
  args = {};
}

for (let i = 0, len = placeHolders.length, placeHolder; i < len; i++) {
  program[placeHolder = placeHolders[i]] && (args[placeHolder] = program[placeHolder]);
}

/**
 * read input from console
 */
co (function * () {
  for (let i = 0, len = placeHolders.length, placeHolder, info; i < len; i++) {
    if (!args[placeHolder = placeHolders[i]]) {
      info = briefInfo[placeHolder] || '';
      if (placeHolder === 'apiToken') {
        args[placeHolder] = yield prompt.password(`${placeHolder}:${info} `, '*');
      } else {
        args[placeHolder] = yield prompt(`${placeHolder}:${info} `);
        if ((args[placeHolder] && test[placeHolder]) && !test[placeHolder].test(args[placeHolder])) {
          log(chalk.hex('#ffcc00')(`warning: wrong input format. hint: ${defaultValue[placeHolder]}`));
          delete args[placeHolder];
          i--;
          continue;
        }
        (!args[placeHolder] && defaultValue[placeHolder]) && (args[placeHolder] = defaultValue[placeHolder]);
      }
    }
  }
  return args;
}).then((args) => {
  process.stdin.pause();
  // format data time string. example: 1992-03-28T19:56:00.000+0530
  args.started = `${args.startDate}T${args.startTime}${args.timeZone}`;
  delete args.startDate;
  delete args.startTime;
  delete args.timeZone;
  /**
   * request to log work hour
   */
  worklog(args);
}).catch ((err) =>{
  log(chalk.red.bold(`error: ${err}`));
  process.exit(1);
});
