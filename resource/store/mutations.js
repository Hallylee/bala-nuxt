export default {
  SET_USER_ID(state, userId) {
    state.userId = userId;
  },

  SET_DEVICE_ID(state, deviceId) {
    state.deviceId = deviceId;
  },

  SET_VISIT_ID(state, visitId) {
    state.visitId = visitId;
  },

  SET_ENVIRONMENT(state, deviceId) {
    state.isWechat = deviceId;
  }
};
