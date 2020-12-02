<template>
  <div id="quick-detail">
    <!-- 详情页主体内容 start -->
    <div class="yq-article-wrap">
      <h1 class="article-title">
        {{ detail.title }}
      </h1>
      <div class="yq-user-bar">
        <!-- 超过7天 显示2020-01-01 格式，7天内显示 'N天内' -->
        <span class="time">{{ detail.postDateName }}</span>
        <span class="name">{{ detail.userName }}</span>
      </div>
      <!--文章内容 start-->
      <div class="article-text" v-html="detail.content"></div>
      <!--文章内容 end-->
      <!--快答底部图片 start-->
      <img
        v-if="foot && detail.picId"
        class="article-pic"
        :src="basePic + detail.picId"
        :alt="detail.title"
      />
      <!--快答底部图片 end-->
      <!--分类 start-->
      <div
        v-if="detail && detail.categoryVo && detail.categoryVo.categoryName"
        class="article-label"
      >
        <span class="title">文章分类：</span>
        <div class="label-list">
          <span class="ele">
            {{ detail.categoryVo.categoryName }}
          </span>
        </div>
      </div>
      <!--分类 end-->
    </div>
    <!-- 详情页主体内容 end -->
    <!-- 推荐阅读模块  start-->
    <div class="yq-recommend-wrap">
      <h2 class="title">
        {{ !foot ? '延伸阅读' : '推荐阅读' }}
      </h2>
      <ul
        id="recommendList"
        class="yq-list"
        :class="{ 'yq-list-z': type === 'k' }"
      >
        <li
          v-for="(item, index) in recommendList"
          :key="item.id"
          class="list-item"
        >
          <div
            v-if="item.type === 'ad'"
            :class="item.id"
            @click="clickAd"
          ></div>

          <a
            v-else
            data-load="0"
            :data-index="index"
            class="list-link"
            :href="item.url + '?f=cdrqalist'"
            @click="clickItem(index)"
            ref="list-item"
          >
            <div class="list-con">
              <div class="img-wrap fr">
                <img :src="item.cover_url" :alt="item.title" />
                <span v-if="item.duration" class="list-duration">
                  <i>{{ item.duration }}</i>
                </span>
              </div>
              <div class="text-con">
                <h4 class="list-title">{{ item.title }}</h4>
                <p class="list-category">{{ item.extra3 }}</p>
              </div>
            </div>
          </a>
        </li>
      </ul>

      <!-- <p v-if="finished" class="index-text">
        <a href="/">去首页</a>
        <span>查看更多热门内容</span>
      </p> -->
    </div>

    <div v-if="!finished" class="yq-loading">
      <span class="loading-text">努力加载中..</span>
    </div>

    <a
      v-if="watching && finished"
      class="next-article-wrap"
      :class="{ 'show-fixed-bottom': foot !== 'sjx' && showShare }"
      :href="generateURL(watching) + '?f=kdrqalist'"
    >
      <div class="next-inter">
        <div class="pic-inter-con">
          <img :src="basePic + watching.picId" />
          <div class="mask"></div>
          <div class="next-text-con">
            <p class="title-text">{{ watching.title }}</p>
            <p class="text">
              {{ watching.content.slice(0, 30) }}
            </p>
          </div>
        </div>
        <div class="read-all">展开阅读全文</div>
      </div>
    </a>
    <!-- 推荐阅读模块  end-->
    <!--悬浮按钮 -->
    <!-- <div v-if="foot !== 'sjx' && showShare" class="quick-bottom-fix kpage">
      <nuxt-link to="/" class="btn-home">访问首页</nuxt-link>
    </div> -->
  </div>
</template>

<script>
import { DetailService } from '@/service';
import { statLoad, statClick } from '@/common/stat';
import { formatFullTime, getVideoTime } from '@/common/util';
import getDetailType from '@/common/getDetailType';

const basePic = process.env.BASE_PIC;

export default {
  name: 'QuickDetail',
  props: {
    type: {
      type: String,
      default: 'k'
    },
    foot: {
      type: String,
      default: ''
    },
    detail: {
      type: Object,
      default() {
        return {};
      }
    },
    watching: {
      type: Object,
      default() {
        return {};
      }
    },
    showShare: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      basePic,
      recommendList: [],
      tempList: [],
      loadTimeout: null,
      loading: false,
      finished: false,
      loadTotal: 0
    };
  },
  async created() {
    const _self = this;

    if (process.client) {
      let tempList, tempVideoList;

      try {
        const { data: recommendData } = await DetailService.getParadigmList({
          userId: _self.$store.state.userId || _self.$store.state.deviceId,
          type: 7,
          channel: 'm'
        });
        const {
          data: recommendVideoData
        } = await DetailService.getParadigmList({
          userId: _self.$store.state.userId || _self.$store.state.deviceId,
          type: 8,
          channel: 'm'
        });

        if (recommendData && recommendData.length) {
          tempList = recommendData;
        }

        if (recommendVideoData && recommendVideoData.length) {
          tempVideoList = recommendVideoData.map((i) => {
            const item = i;

            if (item.extra4) {
              try {
                const extraData = JSON.parse(item.extra4);

                item.duration = getVideoTime(extraData.mediaDuration);
              } catch (err) {
                console.log(err);
              }
            }
            return item;
          });
        }
      } catch (err) {
        console.log(err.message);
      }

      for (let i = 0; i < 15; ++i) {
        if (tempVideoList && tempVideoList.length && (i === 0 || i % 3 === 0)) {
          _self.tempList.push(tempVideoList.splice(0, 1)[0]);
        } else if (i === 2) {
          _self.tempList.push({
            type: 'ad',
            id: '_x5o3ahrqfsf'
          });
        } else if (i === 5) {
          _self.tempList.push({
            type: 'ad',
            id: '_g1xzj2izvx'
          });
        } else if (tempList && tempList.length) {
          _self.tempList.push(tempList.splice(0, 1)[0]);
        }
      }

      if (_self.tempList && _self.tempList.length) {
        _self.recommendList = _self.tempList.splice(0, 8);
        _self.ad();
      }
    }
  },
  mounted() {
    this.addScrollListener();
    this.handleScroll();
  },
  methods: {
    ad() {
      const baiduAd = document.createElement('script');

      baiduAd.src = '//cpro.baidustatic.com/cpro/ui/cm.js';
      baiduAd.async = 'async';
      baiduAd.defer = 'defer';
      baiduAd.onload = () => {
        (window.slotbydup = window.slotbydup || []).push({
          id: 'u6095884',
          container: '_x5o3ahrqfsf',
          async: true
        });
        (window.slotbydup = window.slotbydup || []).push({
          id: 'u6116206',
          container: '_g1xzj2izvx',
          async: true
        });
      };

      const shieldA = document.createElement('script');
      const shieldB = document.createElement('script');

      shieldA.src =
        '//matwbp.iask.sina.com.cn/common/s/source/nmtvk-p/p/openjs/j.js';
      shieldB.src =
        '//matwbp.iask.sina.com.cn/source/av-u/resource/eeu/production/k-bu.js';

      document.querySelector('#third').appendChild(shieldA);
      document.querySelector('#third').appendChild(shieldB);
      document.querySelector('#third').appendChild(baiduAd);
    },
    // 根据channelSources生成跳转链接
    generateURL(i) {
      const channelSources = i.channelSources;

      if (!channelSources) {
        return `/b${i.categoryId}/${i.id}`;
      }

      const type = getDetailType(channelSources);

      return `/${type.head + i.categoryId + type.foot}/${i.id}`;
    },
    // 大家都在看点击事件
    watchingClick() {
      statClick('h5_kd_detail', 'recommended_qa');
    },
    /** 点击第四范式推荐 */
    async clickItem(index) {
      const _self = this;
      statClick('h5_kd_detail', 'recommended_qa_item');

      const data = _self.recommendList[index];
      const userId = _self.$store.state.userId;
      const deviceId = _self.$store.state.deviceId;
      const bilogparam = {
        date: formatFullTime(new Date()),
        actions: [
          {
            itemId: data.item_id,
            actionTime: new Date().getTime(),
            action: 'detailPageShow',
            requestId: 'appwxextend77629',
            itemSetId: data.materialId,
            sceneId: data.sceneId,
            userId: userId || deviceId,
            deviceId,
            context: data.context
          }
        ]
      };
      // a8cf6dd20cce4b5ab7126f54ae2eb664
      await DetailService.disiBilog(
        'e524d4faff1f407984eb469df1bfd272',
        bilogparam
      );
    },
    clickAd() {
      window._hmt.push(['_setAccount', '32acd7ce79ffccff4e50c22fdff8f3df']);
      window._hmt.push([
        '_trackEvent',
        'h5_kd_detail',
        'skip',
        'recommended_ad'
      ]);
    },
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll);
    },
    handleScroll() {
      const _self = this;
      const bodyHeight = document.body.scrollHeight;
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const windowHeight = window.innerHeight || document.body.clientHeight;

      if (
        bodyHeight - (windowHeight + scrollTop) < 100 &&
        !_self.loading &&
        !_self.finished
      ) {
        _self.loading = true;

        setTimeout(() => {
          _self.loading = false;
          _self.finished = true;
          _self.recommendList.push(..._self.tempList.splice(0, 7));
        }, 1000);
      }

      _self.loadTimeout && clearTimeout(_self.loadTimeout);
      _self.loadTimeout = setTimeout(() => {
        if (_self.loadTotal < _self.recommendList.length - 2) {
          const loadList = _self.$refs['list-item'];
          const adList = ['_x5o3ahrqfsf', '_g1xzj2izvx'];

          adList.forEach((i) => {
            const ad =
              (document.querySelector(`.${i}`) &&
                document.querySelector(`.${i}`).getBoundingClientRect().top) ||
              false;

            if (ad && ad < windowHeight) {
              window._hmt.push([
                '_setAccount',
                '32acd7ce79ffccff4e50c22fdff8f3df'
              ]);
              window._hmt.push([
                '_trackEvent',
                'h5_kd_detail',
                'load',
                'kd_recommended_ad'
              ]);
            }
          });

          if (loadList && loadList.length) {
            loadList.forEach((i) => {
              const isLoad = i.dataset.load === '1';

              if (!isLoad) {
                const itemTop = i.getBoundingClientRect().top;

                if (itemTop < windowHeight) {
                  statLoad('h5_kd_detail', 'recommended_qa_item');
                  // 第四范式上报
                  const data = _self.recommendList[i.dataset.index];
                  const userId = _self.$store.state.userId;
                  const bilogparam = {
                    date: formatFullTime(new Date()),
                    actions: [
                      {
                        itemId: data.item_id,
                        actionTime: new Date().getTime(),
                        action: 'show',
                        requestId: 'appwxextend77629',
                        itemSetId: data.materialId,
                        sceneId: data.sceneId,
                        userId: userId || _self.$store.state.deviceId,
                        deviceId: _self.$store.state.deviceId,
                        context: data.context
                      }
                    ]
                  };
                  // a8cf6dd20cce4b5ab7126f54ae2eb664
                  DetailService.disiBilog(
                    'e524d4faff1f407984eb469df1bfd272',
                    bilogparam
                  ).then((res) => {});
                  i.dataset.load = '1';
                  _self.loadTotal = _self.loadTotal + 1;
                }
              }
            });
          }
        }
      }, 800);
    }
  }
};
</script>
