const generateUUID = require('../common/utils').generateUUID;
const formatFullTime = require('../common/utils').formatFullTime;

module.exports = function(options, app) {
  return async (ctx, next) => {
    const path = ctx.path;
    // ctx.logger.info('request path: %s', path);
    await next();

    if (ctx.status !== 404 || ctx.method !== 'GET') {
      return;
    }

    ctx.status = 200;
    if (/\.js$/.test(path)) {
      ctx.set('Content-Type', 'application/javascript');
    }
    if (/\.css/.test(path)) {
      ctx.set('Content-Type', 'text/css');
    }
    if (/\.jpe?g/.test(path)) {
      ctx.set('Content-Type', 'image/jpg');
    }
    if (/\.png/.test(path)) {
      ctx.set('Content-Type', 'image/png');
    }
    if (/\.svg/.test(path)) {
      ctx.set('Content-Type', 'image/svg');
    }
    if (/\.gif/.test(path)) {
      ctx.set('Content-Type', 'image/gif');
    }
    ctx.logger.info(`Date: ${formatFullTime(new Date())}`);
    // webpack hot reload
    // egg will set 'content-length' with value, it will disable the hot middleware keep alive.
    // egg 默认设置了 'content-length' 值，导致热更新失败，建议去掉该值保持活跃
    if (ctx.path === '/__webpack_hmr/client') {
      ctx.response.remove('Content-Length');
    }
    // the "nuxt.render" returns callback, not Promise
    // 获取.env设定的cookie id
    const TOKEN_ID = process.env.TOKEN_ID;
    const DEVICE_ID = process.env.DEVICE_ID;
    const deviceId = ctx.cookies.get(DEVICE_ID, { signed: false });
    const visitId = ctx.cookies.get('vid', { signed: false });

    if (!deviceId) {
      ctx.cookies.set(DEVICE_ID, generateUUID(), {
        signed: false,
        maxAge: 365 * 24 * 60 * 60 * 1000
      });
    }
    if (!visitId) {
      ctx.cookies.set('vid', generateUUID(), {
        signed: false,
        maxAge: 365 * 24 * 60 * 60 * 1000
      });
    }
    // 将cookie保存到req
    ctx.req.cookies = {
      userId: ctx.cookies.get(TOKEN_ID, { signed: false }),
      deviceId: ctx.cookies.get(DEVICE_ID, { signed: false }),
      visitId: ctx.cookies.get('vid', { signed: false })
    };
    await new Promise((resolve) => {
      app.nuxt.render(ctx.req, ctx.res, resolve);
    });
    next();
  };
};
