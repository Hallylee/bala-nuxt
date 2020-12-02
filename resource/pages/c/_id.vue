<template>
  <div id="index">
    <common-header menu></common-header>
    <!--首页导航条 -->
    <home-tabs
      :category-list="categoryList"
      :tabs-index="tabsIndex"
      :parentCategoryIndex="parentCategoryIndex"
      :childCategoryIndex="childCategoryIndex"
    ></home-tabs>
    <!--快答列表 -->
    <QuickList
      v-if="tabsIndex === 'kd'"
      :show-list="showList"
      :loading="loading"
      :finished="finished"
      @handleClickItem="handleClickItem"
    />
    <video-list
      v-else-if="tabsIndex === 'video'"
      :show-list="showList"
      :loading="loading"
      :finished="finished"
    />
    <composition
      v-else-if="tabsIndex === 'all' || parent === 'all'"
      ref="categoryRef"
      :show-list="showList"
      :loading="loading"
      :finished="finished"
      @handleClickItem="handleClickItem"
    />
    <!-- 分类列表 -->
    <CategoryList
      v-else
      :show-list="showList"
      :loading="loading"
      :finished="finished"
      @handleClickItem="handleClickItem"
    />
  </div>
</template>

<script>
import { statLoad, statClick } from '@/common/stat';
import HomeTabs from '@/components/home-components/home-tabs';
import CategoryList from '@/components/home-components/category-list';
import QuickList from '@/components/home-components/quick-list';
import composition from '@/components/home-components/composition';
import VideoList from '@/components/home-components/video-list';
import { HomeService } from '@/service';
import { removeHTMLTag, showTime, getVideoTime } from '@/common/util';

export default {
  components: {
    VideoList,
    HomeTabs,
    CategoryList,
    QuickList,
    composition
  },
  async asyncData({ params, store }) {
    // 获取分类ID
    const tabsIndex = params.id ? params.id.replace('.html', '') : '';
    // 获取导航数据
    const categoryData = await HomeService.getCategoryList({ site: 'M' });
    let categoryList = [];
    if (categoryData.code === '0' && categoryData.data) {
      try {
        categoryList = JSON.parse(categoryData.data);
      } catch (e) {
        categoryList = [];
      }
    } else {
      categoryList = [];
    }
    // 判断分类索引位置
    let parentCategoryIndex, childCategoryIndex, parent, categoryName;

    for (let i = 0; i < categoryList.length; i++) {
      if (categoryList[i].categoryId === '0097' && tabsIndex === 'kd') {
        parentCategoryIndex = i;
        childCategoryIndex = null;
        categoryName = '快答';
        break;
      }

      if (categoryList[i].categoryId === tabsIndex) {
        parentCategoryIndex = i;
        childCategoryIndex = null;
        categoryName = categoryList[i].categoryName;
        break;
      }

      if (categoryList[i].childs) {
        for (let j = 0; j < categoryList[i].childs.length; j++) {
          if (categoryList[i].childs[j].categoryId === tabsIndex) {
            parentCategoryIndex = i;
            childCategoryIndex = j;
            parent = categoryList[i].categoryId;
            categoryName = categoryList[i].childs[j].categoryName;
            break;
          }
        }

        if (childCategoryIndex) {
          break;
        }
      }
    }

    let showList = [];
    let lastStamp;
    if (tabsIndex === 'kd') {
      const params = {
        stamp: null,
        page: 1,
        size: 10
      };
      const quickData = await HomeService.getQuickList(params);
      if (quickData.code === '0') {
        const lastPostDate = quickData.data[quickData.data.length - 1].postDate;
        showList = quickData.data;
        lastStamp = new Date(lastPostDate.replace(/-/g, '/')).getTime();
        showList.forEach((item) => {
          item.content = removeHTMLTag(item.content);
          item.postDateName = showTime(
            new Date(item.postDate.replace(/-/g, '/'))
          );
        });
      }
    } else if (tabsIndex === 'all' || parent === 'all') {
      const params = {
        cid: tabsIndex,
        page: 1,
        size: 10,
        deviceNo: store.state.deviceId
      };
      console.log(params);
      const categoryData = await HomeService.getComposition(params);
      console.log(categoryData.data.length);
      showList = categoryData.data || [];
    } else if (tabsIndex === 'video') {
      const userId = store.state.userId;
      const deviceNo = store.state.deviceId;
      const params = {
        page: 1,
        size: 10,
        deviceNo
      };

      if (userId) {
        params.userId = userId;
      }

      let videoData;

      try {
        videoData = await HomeService.getVideoList(params);

        // console.log(videoData);
      } catch (err) {
        console.error(err);
      }

      if (videoData.data && videoData.data.length) {
        showList = videoData.data.map((i) => {
          const date = i.postDate.replace(/-/g, '/');
          i.type = 'video';
          i.date = showTime(new Date(date));
          i.duration = getVideoTime(i.mediaDuration);
          return i;
        });
      }
    } else {
      const params = {
        categoryId: tabsIndex,
        page: 1,
        size: 10
      };
      const categoryData = await HomeService.getCategoryRecommendList(params);
      if (categoryData.code === '0') {
        showList = categoryData.data;
        showList.forEach((item) => {
          item.type = '';
          item.content = removeHTMLTag(item.content);
          item.postDateName = showTime(
            new Date(item.postDate.replace(/-/g, '/'))
          );
        });
      }
    }

    return {
      categoryList,
      showList,
      tabsIndex,
      parentCategoryIndex,
      childCategoryIndex,
      lastStamp,
      parent,
      categoryName
    };
  },
  data() {
    return {
      tabsIndex: 'default',
      categoryList: [], // tabs类别列表
      showList: [],
      finished: false,
      loading: false,
      page: 1,
      size: 10,
      lastStamp: null,
      parent: '',
      categoryName: ''
    };
  },
  mounted() {
    statLoad('h5_homepage', 'exposure_h5_homepag');
    document.body.style.backgroundColor = '#fff';
    this.handleScroll();
    this.addScrollListener();
  },
  beforeDestroy() {
    this.removeScrollListener();
  },
  beforeRouteLeave(to, from, next) {
    document.body.style.backgroundColor = '';
    next();
  },
  methods: {
    handleClickItem() {
      statClick('h5_homepage', 'qa_item');
    },
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll);
    },
    removeScrollListener() {
      window.removeEventListener('scroll', this.handleScroll);
    },
    handleScroll() {
      const _self = this;
      const bodyHeight = document.body.scrollHeight;
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const windowHeight = window.innerHeight || document.body.clientHeight;
      const id = _self.tabsIndex === 'kd' ? '0097' : _self.tabsIndex;

      if (
        !_self.finished &&
        !_self.loading &&
        bodyHeight - (windowHeight + scrollTop) < 200
      ) {
        if (_self.tabsIndex === 'kd') {
          _self.loading = true;
          _self.getQuickList();
        } else if (_self.tabsIndex === 'all' || _self.parent === 'all') {
          _self.loading = true;
          _self.page += 1;
          _self.getComposition(id);
        } else if (_self.tabsIndex === 'video') {
          _self.loading = true;
          _self.page += 1;
          _self.getVideo();
        } else {
          _self.loading = true;
          _self.page += 1;
          _self.getCategoryRecommendList(id);
        }
      }
    },
    // 获取分类页数据
    getCategoryRecommendList(categoryId) {
      const _self = this;
      const params = {
        categoryId,
        page: _self.page,
        size: _self.size
      };

      HomeService.getCategoryRecommendList(params).then((res) => {
        _self.loading = false;

        if (res.code === '0') {
          if (res.data && res.data.length > 0) {
            const data = res.data;
            data.forEach((item) => {
              item.type = '';
              item.content = removeHTMLTag(item.content);
              item.postDateName = showTime(
                new Date(item.postDate.replace(/-/g, '/'))
              );
            });
            _self.showList = _self.showList.concat(data);
            if (res.data.length < 10) {
              _self.finished = true;
            }
          } else {
            _self.finished = true;
          }
        } else {
        }
      });
    },
    // 获取快答数据
    getQuickList() {
      const _self = this;
      const params = {
        stamp: _self.lastStamp,
        size: _self.size
      };
      HomeService.getQuickList(params).then((res) => {
        _self.loading = false;
        _self.$toast.clear();
        if (res.code === '0') {
          if (res.data && res.data.length > 0) {
            const data = res.data;
            data.forEach((item) => {
              item.picId = '';
              item.content = removeHTMLTag(item.content);
              item.postDateName = showTime(
                new Date(item.postDate.replace(/-/g, '/'))
              );
            });
            _self.showList = _self.showList.concat(data);
            let tempTime = data[data.length - 1].postDate;
            tempTime = tempTime.replace(/-/g, '/');
            const timedate = new Date(tempTime);
            _self.lastStamp = timedate.getTime();
            if (res.data.length < 10) {
              _self.finished = true;
            }
          } else {
            _self.finished = true;
          }
        } else {
          _self.showList = [];
        }
      });
    },
    async getVideo() {
      const _self = this;
      const userId = _self.$store.state.userId;
      const deviceNo = _self.$store.state.deviceId;
      const params = {
        page: _self.page,
        size: 10,
        deviceNo
      };

      if (userId) {
        params.userId = userId;
      }

      let videoData;

      try {
        videoData = await HomeService.getVideoList(params);

        _self.loading = false;
      } catch (err) {
        console.error(err);
      }

      if (videoData.data && videoData.data.length) {
        const showList = videoData.data.map((i) => {
          const date = i.postDate.replace(/-/g, '/');
          i.type = 'video';
          i.date = showTime(new Date(date));
          i.duration = getVideoTime(i.mediaDuration);
          return i;
        });
        _self.showList.push(...showList);

        if (videoData.data.length < 10) {
          _self.finished = true;
        }
      } else {
        _self.finished = true;
      }
    },
    // 文章列表
    getComposition(id) {
      const _self = this;
      const params = {
        page: _self.page,
        size: _self.size,
        cid: id,
        deviceNo: _self.$store.state.deviceId
      };
      HomeService.getComposition(params).then((res) => {
        _self.loading = false;
        _self.$toast.clear();
        if (res.code === '0') {
          if (res.data && res.data.length > 0) {
            const data = res.data;
            _self.showList = _self.showList.concat(data);
            if (res.data.length < 10) {
              _self.finished = true;
            }
          } else {
            _self.finished = true;
          }
        } else {
        }
      });
    }
  },
  head() {
    const _self = this;

    if (
      _self.tabsIndex === 'all' ||
      _self.tabsIndex === '1' ||
      _self.tabsIndex === '2' ||
      _self.tabsIndex === '3'
    ) {
      return {
        title: `${
          _self.categoryName !== '作文' ? _self.categoryName : ''
        }作文_${
          _self.categoryName !== '作文' ? _self.categoryName : ''
        }优秀作文大全-扒拉扒拉`,
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: `扒拉扒拉${
              _self.categoryName !== '作文' ? _self.categoryName : ''
            }作文大全栏目汇集了各类优秀的${
              _self.categoryName !== '作文' ? _self.categoryName : ''
            }作文，不仅包含${
              _self.categoryName !== '作文' ? _self.categoryName : ''
            }各年级优质作文，而且作文体裁丰富多样、兴趣话题多样，让你在快乐中了解到更多${
              _self.categoryName !== '作文' ? _self.categoryName : ''
            }作文知识。`
          },
          {
            hid: 'keywords',
            name: 'keywords',
            content: `${
              _self.categoryName !== '作文' ? _self.categoryName : ''
            }作文,${
              _self.categoryName !== '作文' ? _self.categoryName : ''
            }作文大全,${
              _self.categoryName !== '作文' ? _self.categoryName : ''
            }生优秀作文`
          }
        ]
      };
    }

    return {
      title: `${_self.categoryName}-扒拉扒拉`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: `扒拉${_self.categoryName}栏目汇集了众多新颖、趣味的文化、历史、科普等知识视频，这里最有创意的二次元Up主、最棒的ACG氛围帮你找到更多视频中趣味。`
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: `${_self.categoryName},视频,动漫,弹幕,新番,二次元,字幕,ACG`
        }
      ]
    };
  }
};
</script>
