export default {
  nuxtServerInit({ commit }, { req }) {
    const TOKEN_ID = process.env.TOKEN_ID;
    const DEVICE_ID = process.env.DEVICE_ID;
    const userId = req.cookies[TOKEN_ID];
    const deviceId = req.cookies[DEVICE_ID];
    const visitId = req.cookies.vid;

    console.log(
      `Vuex Store: ${
        userId ? 'userId:' + userId + ';' : ''
      } deviceId: ${deviceId}; visitId: ${visitId};`
    );
    if (userId) {
      commit('SET_USER_ID', userId);
    }
    if (deviceId) {
      commit('SET_DEVICE_ID', deviceId);
    }
    if (visitId) {
      commit('SET_VISIT_ID', visitId);
    }
  }
};
