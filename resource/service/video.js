import ajax from './ajax';

export default {
  // 获取视频详情
  async getVideoDetail(id) {
    return await ajax({
      type: 'get',
      data: { id },
      url: '/bala/article/media/detail'
    });
  },

  async getVideoRecommendList(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/paradigm/data'
    });
  },

  async paradigm(data) {
    return await ajax({
      type: 'post',
      data,
      url: '/action/api/log?clientToken=e524d4faff1f407984eb469df1bfd272',
      baseURL: 'https://nbrecsys.4paradigm.com'
    });
  }
};
