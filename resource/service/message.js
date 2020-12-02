import ajax from './ajax';

// const SERVICE_LOGIN = process.env.SERVICE_LOGIN;
const SERVICE = process.env.SERVICE;

const message = {
  async unread(data) {
    return await ajax({
      type: 'post',
      data,
      baseURL: SERVICE,
      url: '/bala/message/feed/count/unread'
    });
  },

  async find(data) {
    return await ajax({
      type: 'get',
      baseURL: SERVICE,
      url: `/bala/message/feed/find/${data.id}`
    });
  },

  async findNew(data) {
    return await ajax({
      type: 'get',
      data,
      baseURL: SERVICE,
      url: '/bala/message/feed/find/new/'
    });
  },

  async save(data) {
    return await ajax({
      type: 'post',
      data,
      baseURL: SERVICE,
      url: '/bala/message/feed/save'
    });
  }
};

export default message;
