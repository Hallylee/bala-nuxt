import ajax from './ajax';
import efetch from './axios';

const SERVICE_LOGIN = process.env.SERVICE_LOGIN;

const service = {
  async login(data) {
    return await efetch({
      type: 'post',
      data,
      baseURL: SERVICE_LOGIN,
      url: '/login/login/login'
    });
  },

  async getCode(data) {
    return await ajax({
      type: 'post',
      data,
      baseURL: SERVICE_LOGIN,
      url: '/login/sms/ishareSendSms'
    });
  },

  async getUserInfo(data) {
    return await ajax({
      type: 'post',
      baseURL: SERVICE_LOGIN,
      url: `/login/user/find/info?userId=${data.id}`
    });
  },

  async getUserInfoformobile(data) {
    return await efetch({
      type: 'get',
      baseURL: SERVICE_LOGIN,
      url: `/login/user/find/info/mobile?mobile=${data.id}`
    });
  },

  bindwechat(data) {
    location.href = `//m.login.iask.sina.com.cn/login/login/wxRedirect?redurl=bindWechat&uid=${
      data.uid
    }&redirect_uri=${encodeURI(
      'https://m.bala.iask.sina.com.cn/ucenter'
    )}&redirect_fil=${encodeURI('https://m.bala.iask.sina.com.cn/mergeuid')}`;
    // return await ajax({
    //   type: 'get',
    //   data,
    //   baseURL: SERVICE_LOGIN,
    //   url: `/login/login/wxRedirect`
    // });
  },
  // http://192.168.100.122:9092/login/wxRedirect?redurl=wxLogin&redirect_uri=https://baidu.com
  loginwechat() {
    location.href = `//m.login.iask.sina.com.cn/login/login/wxRedirect?redurl=wxLogin&redirect_uri=${encodeURI(
      'https://m.bala.iask.sina.com.cn/ucenter'
    )}`;
    // return await ajax({
    //   type: 'get',
    //   data,
    //   baseURL: SERVICE_LOGIN,
    //   url: `/login/login/wxRedirect`
    // });
  },

  // http://192.168.100.122:9092/login/login/unbindMobile/uid
  async unbindphone(data) {
    return await ajax({
      type: 'get',
      data,
      baseURL: SERVICE_LOGIN,
      url: `/login/login/unbindMobile/${data.uid}`
    });
  },

  async merge(data) {
    return await efetch({
      type: 'post',
      data,
      baseURL: SERVICE_LOGIN,
      url: `/login/login/appendUser`
    });
  },

  async changePhone(data) {
    return await efetch({
      type: 'post',
      data,
      baseURL: SERVICE_LOGIN,
      url: `/login/login/modifyMobile`
    });
  },

  async bindPhine(data) {
    return await efetch({
      type: 'post',
      data,
      baseURL: SERVICE_LOGIN,
      url: `/login/login/bindMobile`
    });
  }
};

export default service;
