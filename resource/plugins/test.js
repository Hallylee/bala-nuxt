import Vue from 'vue';

// const buried = {
//   install(Vue) {
//     Vue.prototype.buried = {
//       statLoad: function(pageType, desc) {
//         window._hmt.push(['_trackEvent', pageType, 'load', desc]);
//         window._czc.push(['_trackEvent', pageType, 'load', desc]);
//       },
//       statClick: function(pageType, desc) {
//         window._hmt.push(['_trackEvent', pageType, 'skip', desc]);
//         window._czc.push(['_trackEvent', pageType, 'skip', desc]);
//       }
//     };
//   }
// };
const PUBLICAPI = class PUBLICAPI {
  statLoad(pageType, desc) {
    window._hmt.push(['_setAccount', '9c90ba222f8338a82502ae5928cf1eeb']);
    window._hmt.push(['_trackEvent', pageType, 'load', desc]);
    window._czc.push(['_trackEvent', pageType, 'load', desc]);
  }

  statClick(pageType, desc) {
    window._hmt.push(['_setAccount', '9c90ba222f8338a82502ae5928cf1eeb']);
    window._hmt.push(['_trackEvent', pageType, 'skip', desc]);
    window._czc.push(['_trackEvent', pageType, 'skip', desc]);
  }
};
Vue.prototype.publicapi = new PUBLICAPI();
