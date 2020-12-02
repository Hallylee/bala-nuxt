const express = require('express');
const consola = require('consola');
const cookieParser = require('cookie-parser');
const { Nuxt, Builder } = require('nuxt');
const config = require('../config/nuxt.config.js');
const log4js = require('../lib/log4js').getLogger('APP');
const generateUUID = require('./common/utils').generateUUID;
const formatFullTime = require('./common/utils').formatFullTime;
const app = express();

config.dev = process.env.NODE_ENV === 'development';

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config);
  const { host, port } = nuxt.options.server;

  await nuxt.ready();
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  // Give nuxt middleware to express
  app.use(cookieParser());
  app.use(function(req, res, next) {
    log4js.info(`${req.method} : ${req.path}`);
    // console.log(
    //   `[${formatFullTime(new Date())}] - ${req.method} : ${req.path}`
    // );

    const DEVICE_ID = process.env.DEVICE_ID;
    let deviceId = req.cookies[DEVICE_ID];
    let visitId = req.cookies.vid;

    if (!deviceId) {
      deviceId = generateUUID();
      res.cookie(DEVICE_ID, deviceId);
      req.cookies[DEVICE_ID] = deviceId;
    }
    if (!visitId) {
      visitId = generateUUID();
      res.cookie('vid', visitId);
      req.cookies.vid = visitId;
    }
    next();
  });
  app.use(nuxt.render);

  // Listen the server
  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });
}
start();
