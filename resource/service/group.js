import ajax from './ajax';

const service = {
  async getGroupList() {
    return await ajax({
      type: 'get',
      url: '/bala/circle/h5/index?page=0&size=10'
    });
  },

  async getGroupDetail(gid) {
    return await ajax({
      type: 'get',
      url: `/bala/circle/find/${gid}`
    });
  },

  async getGroupContentList(data) {
    return await ajax({
      type: 'get',
      url: '/bala/circle/circleSituationList',
      data
    });
  }
};

export default service;
