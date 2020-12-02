import ajax from './ajax';

const service = {
  async getQuestDetail(id) {
    return await ajax({
      type: 'get',
      url: '/bala/article/detail/' + id
    });
  },

  async getComposition(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/composition/detail/'
    });
  },

  // https://m.bala.iask.sina.com.cn/bala/article/paradigm/list
  // https://m.bala.iask.sina.com.cn/bala/article/paradigm/data

  async getFourthList(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/paradigm/data'
    });
  },
  // 长问答推荐阅读接口
  async getLongQuesRecommendList(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/h5/detail/recommend'
    });
  },
  // 获取快答详情
  async getQuickDetail(id) {
    return await ajax({
      type: 'get',
      url: `/bala/article/kuai/detail/${id}`
    });
  },
  // 获取快答精选详情
  async getGoodQuickDetail(id) {
    return await ajax({
      type: 'get',
      url: `/bala/article/kuai/goodDetail/${id}`
    });
  },
  // 获取短问答大家都在看
  async getQuickRecommend(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/kuai/recommend'
    });
  },
  // 获取长问答大家都在看
  async getRecommend(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/detail/recommend'
    });
  },
  // 数据埋点上传
  async bilog(data) {
    return await ajax({
      baseURL: 'https://dw.iask.com.cn',
      type: 'post',
      data,
      url: '/iask/bilog',
      dataType: 'text',
      requestId: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  // 第四范式曝光上报https://nbrecsys.4paradigm.com
  async disiBilog(token, data) {
    return await ajax({
      baseURL: 'https://nbrecsys.4paradigm.com',
      type: 'post',
      data,
      url: `/action/api/log?clientToken=${token}`,
      dataType: 'text'
    });
  },

  async getParadigmList(data) {
    return await ajax({
      type: 'get',
      data,
      url: '/bala/article/paradigm/data'
    });
  }
};

export default service;
