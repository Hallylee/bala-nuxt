const resolve = require('path').resolve;
const fs = require('fs');
const env = process.env.NODE_ENV;
const defaultConfig = fs.existsSync('./config.default')
  ? require('./config.default')
  : {
      server: {
        host: '0.0.0.0',
        port: 7001
      },
      logPath: resolve(__dirname, '../logs/iask-bala-nuxt/')
    };
const developConfig = fs.existsSync('./config.local')
  ? require('./config.local')
  : {};
const testConfig = fs.existsSync('./config.test')
  ? require('./config.test')
  : {};
const prodConfig = fs.existsSync('./config.prod')
  ? require('./config.prod')
  : {};
let config;

if (env === 'development') {
  config = Object.assign(defaultConfig, developConfig);
} else if (env === 'test') {
  config = Object.assign(defaultConfig, testConfig);
} else if (env === 'production') {
  config = Object.assign(defaultConfig, prodConfig);
}

module.exports = config;
