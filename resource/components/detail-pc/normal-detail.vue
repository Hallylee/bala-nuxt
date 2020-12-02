<template>
  <div id="normal-detail">
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

      <div class="article-text" v-html="detail.content"></div>
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
    </div>
    <!-- 详情页主体内容 end -->
    <!-- 推荐阅读模块  start-->
    <div class="yq-recommend-wrap">
      <h2 class="title">推荐阅读</h2>
      <ul
        v-if="recommendList && recommendList.length"
        id="recommendList"
        class="yq-list"
      >
        <li
          v-for="(item, index) in recommendList"
          :key="index"
          data-load="0"
          :data-index="index"
          ref="list-item"
          class="list-item"
        >
          <a
            class="list-link"
            :href="item.url + '?f=cdrqalist'"
            @click="clickItem(index)"
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
  </div>
</template>

<script>
import { DetailService } from '@/service';
import { statLoad, statClick } from '@/common/stat';
import { formatFullTime, getVideoTime } from '@/common/util';
import getDetailType from '@/common/getDetailType';

const basePic = process.env.BASE_PIC;

export default {
  name: 'NormalDetail',
  props: {
    type: {
      type: String,
      default: 'b'
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
          type: 9,
          channel: 'm'
        });
        const {
          data: recommendVideoData
        } = await DetailService.getParadigmList({
          userId: _self.$store.state.userId || _self.$store.state.deviceId,
          type: 10,
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
        console.log(recommendData, recommendVideoData);
      } catch (err) {
        console.log(err.message);
      }

      for (let i = 0; i < 15; ++i) {
        if (tempVideoList && tempVideoList.length && (i === 0 || i % 3 === 0)) {
          _self.tempList.push(tempVideoList.splice(0, 1)[0]);
        } else if (tempList && tempList.length) {
          _self.tempList.push(tempList.splice(0, 1)[0]);
        }
      }

      if (_self.tempList && _self.tempList.length) {
        _self.recommendList = _self.tempList.splice(0, 8);
      }
    }
  },
  mounted() {
    this.addScrollListener();
    this.handleScroll();
  },
  methods: {
    // 根据channelSources生成跳转链接
    generateURL(i) {
      const channelSources = i.channelSources;

      if (!channelSources) {
        return `/b${i.categoryId}/${i.id}`;
      }

      const type = getDetailType(channelSources);

      return `/${type.head + i.categoryId + type.foot}/${i.id}`;
    },
    /** 点击第四范式推荐 */
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
        if (_self.loadTotal < _self.recommendList.length) {
          const loadList = _self.$refs['list-item'];

          if (loadList && loadList.length) {
            loadList.forEach((i) => {
              const isLoad = i.dataset.load === '1';

              if (!isLoad) {
                const itemTop = i.getBoundingClientRect().top;

                if (itemTop < windowHeight) {
                  statLoad(
                    'h5_qa_detail',
                    'exposure_h5_qa_detail_recommended_qa_item'
                  );
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
