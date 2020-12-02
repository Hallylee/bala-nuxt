const { Nuxt, Builder } = require('nuxt');
const NUXT = Symbol('Application#Nuxt');
const NUXT_BUILDER = Symbol('Application#NuxtBuilder');
const config = require('../../config/nuxt.config');

module.exports = {
  get nuxt() {
    if (!this[NUXT]) {
      this[NUXT] = new Nuxt(config);
    }

    return this[NUXT];
  },

  get nuxtBuilder() {
    if (!this[NUXT_BUILDER]) {
      this[NUXT_BUILDER] = new Builder(this.nuxt);
    }

    return this[NUXT_BUILDER];
  }
};
