const log4js = require('log4js');
const webConfig = require('../config/web.config');

log4js.configure({
  appenders: [
    {
      type: 'console'
    },
    {
      type: 'dateFile',
      filename: `${webConfig.logPath}/` || 'logs/iask-bala-nuxt/',
      pattern: 'yyyy-MM-dd.log',
      maxLogSize: 1024,
      alwaysIncludePattern: true
    }
  ],
  replaceConsole: true
});

log4js.setGlobalLogLevel(webConfig.logLevel || log4js.levels.INFO);

exports.getLogger = function(file) {
  return log4js.getLogger(file || 'log');
};
