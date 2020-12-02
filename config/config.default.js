const resolve = require('path').resolve;

module.exports = {
  server: {
    host: '0.0.0.0',
    port: 7001
  },
  logPath: resolve(__dirname, '../logs/iask-bala-nuxt/')
};
