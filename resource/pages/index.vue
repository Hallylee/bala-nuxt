<template>
  <div id="index">
    <common-header menu></common-header>

    <!-- component 首页导航条 -->
    <home-tabs
      :category-list="categoryList"
      :tabs-index="tabsIndex"
    ></home-tabs>

    <!-- component 轮播banner -->
    <Swiper
      v-if="tabsIndex === 'default'"
      :autoplay="3000"
      :banner-list="bannerList"
      @clickBanner="clickBanner"
    />

    <!-- component 兴趣圈 -->
    <interest-circle
      v-if="tabsIndex === 'default'"
      :list="circleList"
      @clickCircle="clickCircle"
    />

    <!-- component 首页推荐列表 -->
    <HomeList
      v-if="tabsIndex === 'default'"
      :show-list="showList"
      :finished="finished"
      :loading="loading"
      @handleClickItem="handleClickItem"
    />
  </div>
</template>

<script>
import { statLoad, statClick } from '@/common/stat';
import HomeTabs from '@/components/home-components/home-tabs';
import Swiper from '@/components/home-components/swiper';
import InterestCircle from '@/components/home-components/interest-circle';
import HomeList from '@/components/home-components/home-list';
import { HomeService } from '@/service';
import {
  removeHTMLTag,
  getRandomNumber,
  showTime,
  getVideoTime
} from '@/common/util';

export default {
  components: {
    HomeTabs,
    Swiper,
    InterestCircle,
    HomeList
  },
  async asyncData({ store }) {
    let bannerList, circleList, categoryList;
    let contentList = [];
    let flowList = [];
    let videoList = [];
    let videoFinished = false;
    let finished = false;

    try {
      /* tabs分类列表 */
      const categoryData = await HomeService.getCategoryList({ site: 'M' });

      if (categoryData.code === '0' && categoryData.data) {
        try {
          categoryList = JSON.parse(categoryData.data);
        } catch (e) {
          categoryList = [];
        }
      } else {
        categoryList = [];
      }
    } catch (err) {
      console.error(err);
    }

    try {
      /* banner列表 */
      const bannerData = await HomeService.getBannerList({
        categoryId: 'INDEX',
        site: 'M'
      });

      if (bannerData.code === '0') {
        bannerList = bannerData.data;
      } else {
        bannerList = [];
      }
    } catch (err) {
      console.error(err);
    }

    const contentParams = {
      userId: store.state.userId || store.state.deviceId,
      type: 14,
      channel: 'm'
    };
    /* 推荐内容列表 */
    try {
      const { data: contentData } = await HomeService.getHomeRecommendList(
        contentParams
      );

      if (contentData) {
        contentList = contentData;
      } else {
        finished = true;
      }
    } catch (err) {
      console.log(err);
    }

    if (contentList && contentList.length) {
      if (contentList.length < 10) {
        finished = true;
      }
      console.log(contentList);
      contentList.forEach((item) => {
        item.type = '';
        item.content = removeHTMLTag(item.content);
        item.postDateName = showTime(
          new Date(item.publish_time.replace(/-/g, '/'))
        );
      });
    }

    try {
      /* 圈子列表 */
      const circleData = await HomeService.getInterestCircleList(
        10,
        store.state.deviceId
      );

      if (circleData.code === '0') {
        circleList = circleData.data;
      } else {
        circleList = [];
      }
    } catch (err) {
      console.error(err);
    }

    /* 插入内容的圈子列表 */
    try {
      const { data: flowData } = await HomeService.getInfoFlowList({
        size: 10
      });

      if (flowData && flowData.length) {
        flowList = flowData;
      }
    } catch (err) {
      console.error(err);
    }

    flowList.forEach((item) => {
      item.type = 'flow';
    });

    // 获取视频feed流
    try {
      // const { data: videoData } = await HomeService.getRecommendVideoList({
      //   page: 1,
      //   size: 10
      // });

      const { data: videoData } = await HomeService.getHomeRecommendList({
        userId: store.state.userId || store.state.deviceId,
        type: 15,
        channel: 'm'
      });

      if (videoData && videoData.length) {
        if (videoData.length < 10) {
          videoFinished = true;
        }
        videoList = videoData;
      }
    } catch (err) {
      console.error(err);
    }
    console.log(videoList);
    videoList.forEach((i) => {
      const date = i.publish_time.replace(/-/g, '/');
      i.type = 'video';
      i.date = showTime(new Date(date));
      i.duration = getVideoTime(JSON.parse(i.extra4).mediaDuration);
    });

    // videoList.forEach((i) => {
    //   const date = i.postDate.replace(/-/g, '/');
    //   i.type = 'video';
    //   i.date = showTime(new Date(date));
    //   i.duration = getVideoTime(i.mediaDuration);
    // });

    // 视频流随机数
    const videoRandomNumber = getRandomNumber(2, 4);
    // 圈子流随机数
    const flowRandomNumber = getRandomNumber(3, 5) + videoRandomNumber + 1;

    // 插入视频
    videoList.length &&
      contentList.splice(videoRandomNumber, 0, videoList.splice(0, 1)[0]);
    // 插入圈子
    flowList.length &&
      contentList.splice(flowRandomNumber, 0, flowList.splice(0, 1)[0]);

    console.log('contentList', contentList);
    const showList = contentList;

    return {
      bannerList,
      circleList,
      categoryList,
      flowList,
      showList,
      videoList,
      videoFinished,
      finished
    };
  },
  data() {
    return {
      tabsIndex: 'default',
      bannerList: [], // 轮播图列表
      circleList: [], // 圈子列表
      categoryList: [], // tabs类别列表
      flowList: [],
      showList: [],
      videoList: [],
      page: 1,
      loading: false,
      finished: false,
      size: 10,
      videoPage: 1,
      videoFinished: false
    };
  },
  mounted() {
    statLoad('h5_homepage', 'exposure_h5_homepag');
    this.addScrollListener();
  },
  beforeDestroy() {
    this.removeScrollListener();
  },
  methods: {
    // 点击埋点
    handleClickItem() {
      statClick('h5_homepage', 'qa_item');
    },
    // 点击轮播图
    clickBanner(item) {
      this.handleClickItem();
      if (item.url && item.url.includes('http') > -1) {
        window.location.href = item.url;
      } else {
        this.$router.push(item.url);
      }
    },
    // 点击兴趣圈
    clickCircle(item) {
      this.$router.push({
        path: `/q/${item.id}`
      });
      this.handleClickItem();
    },
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll);
    },
    removeScrollListener() {
      window.removeEventListener('scroll', this.handleScroll);
    },
    handleScroll() {
      const bodyHeight = document.body.scrollHeight;
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const windowHeight = window.innerHeight || document.body.clientHeight;

      if (
        !this.finished &&
        !this.loading &&
        bodyHeight - (windowHeight + scrollTop) < 2
      ) {
        this.loading = true;
        this.page += 1;
        this.getHomeRecommendList();
      }
    },
    getHomeRecommendList() {
      const _self = this;
      const userId = _self.$store.state.userId;
      const deviceId = _self.$store.state.deviceId;
      const params = {
        userId: userId || deviceId,
        type: 14,
        channel: 'm'
      };

      HomeService.getHomeRecommendList(params).then(async (res) => {
        _self.loading = false;

        if (res.code === '0') {
          if (res.data && res.data.length) {
            const data = res.data;
            data.forEach((item) => {
              item.type = '';
              item.content = removeHTMLTag(item.content);
              item.postDateName = showTime(
                new Date(item.publish_time.replace(/-/g, '/'))
              );
            });

            // 视频流随机数
            const videoRandomNumber = getRandomNumber(2, 4);
            // 圈子流随机数
            const flowRandomNumber =
              getRandomNumber(3, 5) + videoRandomNumber + 1;

            // 插入圈子
            _self.flowList &&
              _self.flowList.length &&
              data.splice(flowRandomNumber, 0, _self.flowList.splice(0, 1)[0]);

            // 插入视频
            if (_self.videoList && _self.videoList.length) {
              data.splice(
                videoRandomNumber,
                0,
                _self.videoList.splice(0, 1)[0]
              );
            } else if (!_self.videoFinished) {
              _self.videoPage = _self.videoPage + 1;
              const {
                data: videoData
              } = await HomeService.getRecommendVideoList({
                page: _self.videoPage,
                size: 10
              });

              if (videoData.length < 10) {
                _self.videoFinished = true;
              }
              _self.videoList = videoData.map((i) => {
                const date = i.postDate.replace(/-/g, '/');
                i.type = 'video';
                i.date = showTime(new Date(date));
                i.duration = getVideoTime(i.mediaDuration);
                return i;
              });

              data.splice(
                videoRandomNumber,
                0,
                _self.videoList.splice(0, 1)[0]
              );
            }

            _self.showList.push(...data);
            if (res.data.length < 11) {
              _self.finished = true;
            }
          } else {
            _self.finished = true;
          }
        } else {
          _self.showList = [];
        }
      });
    }
  }
};
</script>
