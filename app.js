class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
    this.app.config.coreMiddleware.unshift('nuxtRender');
  }

  async willReady() {
    await this.app.nuxt.ready();

    if (process.env.EGG_SERVER_ENV === 'local') {
      await this.app.nuxtBuilder.build();
    }
  }
}

module.exports = AppBootHook;
