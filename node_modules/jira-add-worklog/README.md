# jira-add-worklog
jira-add-worklog is a utility tool for jira users to log work hour against an issue. The best use case of this tool can be hooked it into git pre-commit / post-commit. So that, developer can log work against every commit without leaving the terminal.
## Installation
It's advised to install the *jira-add-worklog* module as a devDependencies in your *package.json* as you only need this for development purposes. To install the module simply run:\
```npm install --save-dev jira-add-worklog```
## Example
```
$ logwork -C $HOME/workspace/logwork.config.js
issueIdOrKey: Issue-101
timeSpent:[1h 30m] 2h
comment: 'description for the work done'
startDate:[2018-07-19] 2018-07-19 // default is current date
startTime:[20:24:11.000] 20:24:11.000 // default is current time
```
### Configuration (*option* **-C**)

It takes the a file path for configuration (*.js*). For example: 
```
module.exports = {
  'username': <user name to jira>,
  'apiToken': <api token [create your API token for the basic authentication]>,
  'email': <email id>,
  'domain': <domain name for jira>,
  'timeZone': <time zone offset>
  /**
    'timeSpent': <value>,
    'issueIdOrKey': <value>,
    'comment': <value>,
    'startDate': <value>,
    'startTime': <value>
  */
};
```
Those options which do not ocassionally get changed can be stored in the configuration file.

### help:
```
$ logwork -h

  Usage: logwork [options]

  Options:

    -v, --version                    output the version number
    -C, --config           [string]  Path to the config file. [default: logwork.config.js] (default: ./logwork.config.js)
    -u, --username         [string]  Username of jira account.
    -a, --api-token        [string]  API token for basic authentication. Generate an API token in jira.
    -e, --email            [string]  Registered email address
    -t, --time-spent       [string]  Time for log work hour. For example: ['30m', '1h', '1h 30m', '1d 1h 30m']
    -i, --issue-id-or-key  [string]  Issue id or key for the issue where work hour will be logged
    -d, --domain           [string]  Domain name
    -c, --comment          [string]  Description of the work
    -D, --start-date       [string]  Start date of current work [optional]. For example: 2018-12-31
    -T, --start-time       [string]  Start time of current work [optional]. For example: 22:10:00
    -z, --time-zone        [string]  current time zone [optional]. For example: +0530
    -h, --help                       output usage information
```
