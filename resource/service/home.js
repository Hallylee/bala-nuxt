import ajax from './ajax';

const service = {
  // 获取banner列表
  async getBannerList(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/banner/find/'
    });
  },
  // 获取内容列表
  async getHomeRecommendList(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/paradigm/data'
    });
  },
  async getInfoFlowList(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/circle/index/infoFlow'
    });
  },
  // 获取首页兴趣圈数据
  async getInterestCircleList(size, deviceId) {
    return await ajax({
      type: 'get',
      url: `/bala/circle/index/recommend?size=${size}`
    });
  },
  // 获取分类
  async getCategoryList() {
    return await ajax({
      type: 'get',
      url: `/bala/category/find/site`,
      data: { site: 'M' }
    });
  },
  // 获取分类推荐列表
  async getCategoryRecommendList(data) {
    return await ajax({
      type: 'get',
      data,
      url: `/bala/article/find/category/optimal`
    });
  },
  // /bala/article/find/findKuaiDa
  async getQuickList(data) {
    return await ajax({
      type: 'get',
      data,
      url: `/bala/article/find/findKuaiDa`
    });
  },

  async getComposition(data) {
    return await ajax({
      type: 'get',
      data,
      url: `/bala/article/composition/list`
    });
  },

  // 获取推荐视频列表
  async getRecommendVideoList(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/media/recommend'
    });
  },
  // 获取视频列表
  async getVideoList(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/media/list'
    });
  }
};

export default service;
