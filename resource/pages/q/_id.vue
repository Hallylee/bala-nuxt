<template>
  <div id="group-detail">
    <van-sticky>
      <common-header
        page-type="h5_interest_detail"
        desc="back_top"
        :title="title"
        back
        share
      ></common-header>
    </van-sticky>
    <!--圈子详情头部-->
    <div class="interest-bar">
      <div class="link">
        <img :src="'http://pic.iask.cn/fimg/' + group.picId" />
        <div class="bar-mask"></div>
        <div class="bar-inter">
          <div class="bar-pic">
            <img :src="'http://pic.iask.cn/fimg/' + group.headPicId" />
          </div>
          <div class="bar-text-con">
            <div class="txt-head">
              <p class="name">{{ group.title }}</p>
              <p class="num">{{ group.articleNum }}篇问答</p>
            </div>
            <p class="text">
              {{ group.introduce }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <!--圈子详情导航-->
    <van-sticky :offset-top="44">
      <div class="interest-nav">
        <a
          v-for="(nav, index) in navOptions"
          :key="nav.title"
          class="nav-link"
          :class="{ current: navIndex === index }"
          @click="navChange(index)"
          >{{ nav.title }}</a
        >
      </div>
    </van-sticky>
    <!--圈子内容列表-->
    <div class="interest-tab-con current">
      <ul class="yq-list">
        <li
          v-for="item in list"
          ref="list-item"
          :key="item.id"
          class="list-item"
          data-load="0"
          :class="{ 'list-no-img': !item.picId }"
        >
          <a :href="generateURL(item)" class="list-link">
            <h4 class="list-title">{{ item.title }}</h4>
            <div v-if="item.picIds && item.picIds.length" class="tree-pic-list">
              <div v-for="pic in item.picIds" :key="pic" class="pic-item">
                <div class="pic-inter">
                  <img :src="'http://pic.iask.cn/fimg/' + pic" />
                </div>
              </div>
            </div>
            <div v-else class="list-con">
              <div v-if="item.picId" class="img-wrap fr">
                <img :src="'http://pic.iask.cn/fimg/' + item.picId" />
              </div>
              <div class="text-con">
                <p class="text">
                  {{ item.content.slice(0, 55) }}
                </p>
                <p class="time">{{ item.postDate }}</p>
              </div>
            </div>
          </a>
        </li>
      </ul>
      <div v-if="!noMore" class="yq-loading">
        <span class="loading-text">努力加载中..</span>
      </div>
      <!-- 无数据 -->
      <div v-if="!list.length" class="list-none">
        <p>暂无内容</p>
      </div>
      <!-- 无网络 -->
      <div class="list-none none-net" style="display: none;">
        <p>暂无网路</p>
      </div>
    </div>
  </div>
</template>

<script>
import { statLoad, statClick } from '@/common/stat';
import getDetailType from '@/common/getDetailType';
import { GroupService } from '@/service';
import { showTime, removeHTMLTag } from '@/common/util';

export default {
  name: 'GroupDetail',
  async asyncData({ params, redirect, error }) {
    const gid = params.id;

    try {
      // 获取圈子详情
      const { data: result } = await GroupService.getGroupDetail(gid);

      if (!result) {
        redirect('/qu');
      }

      const groupContentOptions = {
        skip: 0,
        limit: 15,
        type: 'hot',
        interestId: gid
      };
      // 获取圈子列表
      const { data: results } = await GroupService.getGroupContentList(
        groupContentOptions
      );
      let list;
      if (results && results.length) {
        list = results.map((i) => {
          const date = i.postDate.replace(/[-]/g, '/');

          i.postDate = showTime(new Date(date));
          i.content = removeHTMLTag(i.content);
          return i;
        });

        return {
          gid,
          group: result,
          list: list || [],
          skip: 15,
          noMore: results.length < 15,
          loadTotal: 0
        };
      } else {
        return {
          gid,
          group: result,
          list: list || [],
          skip: 0,
          noMore: true,
          loadTotal: 0
        };
      }
    } catch (err) {
      error({ statusCode: err.code, message: err.message });
    }
  },
  data() {
    return {
      group: {},
      title: '',
      navIndex: 0,
      navOptions: [
        {
          title: '最热',
          type: 'hot',
          desc: 'hottest'
        },
        {
          title: '最新',
          type: 'new',
          desc: 'newest'
        },
        {
          title: '精华',
          type: 'good',
          desc: 'essence'
        }
      ],
      list: [],
      loading: false,
      noMore: false
    };
  },
  mounted() {
    statLoad('h5_interest_detail', 'interest_detail');
    document.body.style.backgroundColor = '#fff';
    if (this.list && this.list.length) {
      this.addScrollListener();
    }
  },
  beforeRouteLeave(to, from, next) {
    document.body.style.backgroundColor = '';
    next();
  },
  beforeDestroy() {
    this.removeScrollListener();
  },
  methods: {
    // 根据channelSources生成跳转链接
    generateURL(i) {
      const channelSources = i.channelSources;

      if (!channelSources) {
        return `/b${i.categoryId}/${i.id}`;
      }

      const type = getDetailType(channelSources);

      return `/${type.head + i.categoryId + type.foot}/${i.id}?f=quqalist`;
    },
    async navChange(index) {
      const _self = this;
      if (index === _self.navIndex) {
        return;
      }
      statClick('h5_interest_detail', _self.navOptions[index].desc);
      _self.navIndex = index;
      _self.skip = 0;
      _self.loading = false;
      _self.$toast.loading({
        message: '加载中...',
        forbidClick: true,
        loadingType: 'spinner',
        duration: 0
      });
      await this.fetchData('reload');
      _self.$toast.clear();
    },
    // 获取圈子列表
    async fetchData(type = 'loading') {
      const _self = this;
      const groupContentOptions = {
        skip: _self.skip,
        limit: 15,
        type: _self.navOptions[_self.navIndex].type,
        interestId: _self.gid
      };
      const { data: results } = await GroupService.getGroupContentList(
        groupContentOptions
      );
      let list;

      if (results && results.length) {
        _self.noMore = false;
        list = results.map((i) => {
          const date = i.postDate.replace(/[-]/g, '/');

          i.postDate = showTime(new Date(date));
          i.content = removeHTMLTag(i.content);
          return i;
        });

        if (type === 'loading') {
          _self.list.push(...list);
        } else {
          _self.list = list;
        }
        if (results.length < 15) {
          _self.noMore = true;
          _self.removeScrollListener();
        }
      } else {
        _self.noMore = true;
        _self.removeScrollListener();
      }
    },
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll);
    },
    removeScrollListener() {
      window.removeEventListener('scroll', this.handleScroll);
    },
    async handleScroll() {
      const _self = this;
      const bodyHeight = document.body.scrollHeight;
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const windowHeight = window.innerHeight || document.body.clientHeight;

      if (scrollTop > 0) {
        _self.title = _self.group.title;
      } else {
        _self.title = '';
      }

      if (
        !_self.noMore &&
        !_self.loading &&
        bodyHeight - (windowHeight + scrollTop) < 50
      ) {
        _self.loading = true;
        _self.skip = _self.skip + 15;
        await _self.fetchData();
        _self.loading = false;
      }

      if (_self.loadTotal < _self.list.length) {
        const loadList = _self.$refs['list-item'];

        loadList.forEach((i) => {
          const isLoad = i.dataset.load === '1';
          // 判断是否已经曝光
          if (isLoad) {
            return;
          }
          const itemTop = i.getBoundingClientRect().top;
          if (itemTop < windowHeight) {
            _self.loadTotal = _self.loadTotal + 1;
            i.dataset.load = '1';
            statLoad('h5_interest_detail', 'qa_item');
          }
        });
      }
    }
  },
  head() {
    const _self = this;

    return {
      title: `${_self.group.title}-扒拉扒拉`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: `${_self.group.introduce.slice(0, 100)}...`
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: _self.group.title
        }
      ]
    };
  }
};
</script>

<style lang="less" scoped>
.interest-bar {
  position: relative;
  height: 30vw;
  overflow: hidden;
  .link {
    display: block;
  }
  .bar-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2;
  }
  .bar-inter {
    width: 100%;
    .box-sizing();
    position: absolute;
    left: 0;
    top: 50%;
    .transform-2d(0, -50%);
    padding: 0 30px;
    overflow: hidden;
    z-index: 5;
  }
  .bar-pic {
    width: 60px;
    height: 60px;
    border-radius: 60px;
    float: left;
    margin-right: 16px;
    overflow: hidden;
  }
  .bar-text-con {
    overflow: hidden;
  }
  .txt-head {
    height: auto;
    line-height: 20px;
    .flex();
    .justify-flex-justify();
    .align-items-center();
  }
  .name {
    width: 150px;
    margin-right: 10px;
    font-size: 18px;
    line-height: 24px;
    color: #fff;
    .text-overflow();
  }
  .num {
    .flex(1);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
  .text {
    font-size: 12px;
    line-height: 18px;
    color: rgba(255, 255, 255, 0.8);
    .text-overflow();
    margin-top: 6px;
    height: 36px;
  }
}
.interest-nav {
  height: 38px;
  line-height: 38px;
  position: relative;
  font-size: 15px;
  padding: 0 12vw;
  overflow: hidden;
  background-color: #fff;
  z-index: 50;
  &:after {
    height: 1px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #e3e3e3;
    .transform-scale(1, 0.5);
    content: '';
  }
  .nav-link {
    width: 33.333333%;
    display: block;
    float: left;
    text-align: center;
    color: @gray;
    position: relative;
    &:after {
      height: 2px;
      width: 10px;
      position: absolute;
      left: 50%;
      bottom: 0;
      background-color: #fd4c5b;
      .transform-2d(-50%, 0);
      border-radius: 2px;
    }
  }

  .current {
    font-size: 18px;
    font-weight: bold;
    color: #fd4c5b;
    &:after {
      content: '';
    }
  }
}
.interest-nav-fix {
  position: fixed;
  width: 100%;
  .box-sizing();
  left: 0;
  top: 44px;
  -webkit-transform: translateZ(0);
  z-index: 50;
}
.interest-tab-con {
  background-color: #fff;
  display: none;
  &.current {
    display: block;
  }
}
.list-none {
  background-color: #fff;
  .box-sizing();
  padding: 28vw 0;
  font-size: 12px;
  line-height: 20px;
  color: @gray;
  text-align: center;
  &:before {
    width: 122px;
    height: 94px;
    display: block;
    background-image: url('../../assets/images/icon_yq_none.jpg');
    background-size: 122px 94px;
    margin: 0 auto 10px;
    content: '';
  }
}
.none-net {
  &:before {
    background-image: url('/images/icon_none_net.jpg');
  }
}
@keyframes roate {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes roate {
  0% {
    -webkit-transform: rotate(0deg);
  }
  50% {
    -webkit-transform: rotate(180deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}
</style>
