<template>
  <div id="video-detail">
    <div :class="{ 'pc-bg-re': platform === 'web' }">
      <div :class="{ 'pc-bg-wrap': platform === 'web' }">
        <div :class="{ 'pc-wrap': platform === 'web' }">
          <!--浮动二维码 start-->
          <div v-show="platform === 'web'" class="pc-float">
            <div class="pc-logo">
              <div></div>
              <div>爱问扒拉扒拉</div>
              <div>用有趣的方式获得新知</div>
            </div>
            <div class="pc-qr-code">
              <div></div>
              <div>扫一扫 访问小程序</div>
            </div>
          </div>
          <!--浮动二维码 end-->

          <common-header
            page-type="h5_video_detail"
            desc="back_top"
            share-desc="share"
            :share="platform === 'mobile'"
            :back="platform === 'mobile'"
            border
          />

          <div class="video-content">
            <div
              class="video-cover"
              :class="{ 'video-web': platform === 'web' }"
            >
              <video
                id="video-player"
                class="video-player"
                preload="auto"
                playsinline
                webkit-playsinline
                x5-playsinline
              ></video>
              <div v-show="!isPlay" class="video-cover-duration">
                {{ detail.duration }}
              </div>
            </div>

            <div class="video-info">
              <p class="video-info-title">
                {{ detail.title }}
              </p>
              <div class="video-info-other">
                <p class="video-info-name">{{ detail.userName }}</p>
                <p class="video-info-date">{{ detail.date }}</p>
              </div>
            </div>
          </div>

          <div
            v-if="recommendList && recommendList.length"
            class="video-recommend"
          >
            <div class="video-recommend-title">相关推荐</div>

            <a
              v-for="(item, index) in recommendList"
              :key="item.item_id"
              class="video-recommend-item"
              data-load="0"
              ref="video-item"
              @click="itemClickHandler(index)"
              :href="item.url"
            >
              <div class="video-recommend-item-cover">
                <img class="img" :src="item.cover_url" alt="" />
                <div class="duration">{{ item.duration }}</div>
              </div>

              <div class="video-recommend-item-info">
                <h1 class="title">
                  {{ item.title }}
                </h1>
                <p class="date">{{ item.date }}</p>
              </div>
            </a>

            <div v-if="!finished" class="yq-loading">
              <span class="loading-text">努力加载中..</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { statLoad, statClick } from '@/common/stat';
import { VideoService, DetailService } from '@/service';
import {
  showTime,
  getVideoTime,
  formatFullTime,
  generateUUID
} from '@/common/util';

const basePic = process.env.BASE_PIC;

export default {
  name: 'VideoDetail',
  async asyncData({ params, error, store }) {
    const vid = params.vid;
    const videoCategoryId = params.videoCategory;
    let videoData, recommendList, recommendTotalList;
    let finished = false;

    try {
      const { data: result } = await VideoService.getVideoDetail(vid);

      if (!result) {
        const err = new Error('内容不存在');
        err.code = 404;
        throw err;
      }

      if (result.categoryId !== videoCategoryId) {
        const err = new Error('内容不存在');
        err.code = 404;
        throw err;
      }
      videoData = result;
    } catch (err) {
      error({ statusCode: Number(err.code), message: err.message });
    }

    try {
      const userId = store.state.userId;
      const deviceId = store.state.deviceId;
      const results = await DetailService.getParadigmList({
        userId: userId || deviceId,
        type: 16,
        channel: 'm'
      });

      if (results.data && results.data.length) {
        recommendList = results.data.splice(0, 10).map((i) => {
          const date = i.publish_time.replace(/-/g, '/');
          const extraData = JSON.parse(i.extra4);

          i.date = showTime(new Date(date));
          i.duration = getVideoTime(extraData.mediaDuration);
          return i;
        });
        recommendTotalList = results.data;
      } else {
        recommendList = recommendTotalList = [];
        finished = true;
      }
    } catch (err) {
      console.log(err);
    }

    if (videoData) {
      const date = videoData.postDate.replace(/-/g, '/');
      videoData.date = showTime(new Date(date));
      videoData.duration = getVideoTime(videoData.mediaDuration);
    }

    return {
      detail: videoData,
      recommendList,
      recommendTotalList,
      finished
    };
  },
  data() {
    return {
      basePic,
      detail: {},
      player: null,
      isPlay: false,
      finished: false,
      loading: false,
      recommendList: [],
      recommendTotalList: [],
      loadTotal: 0,
      platform: 'mobile'
    };
  },
  mounted() {
    statLoad('h5_video_detail', 'video_detai');
    this.insertVideoCSS();
    this.insertVideoJS();
    this.handleScroll();
    this.addScrollListener();
  },
  created() {
    if (process.client) {
      this.$nextTick(() => {
        this.platform = /Android|webOS|iPhone|iPod|BlackBerry/i.test(
          navigator.userAgent
        )
          ? 'mobile'
          : 'web';
      });
    }
  },
  beforeDestroy() {
    this.removeScrollListener();
  },
  methods: {
    insertVideoCSS() {
      // 每次执行前，先移除上次插入的代码
      document.getElementById('videoCSS') &&
        document.getElementById('videoCSS').remove();

      const videoCSS = document.createElement('link');

      videoCSS.id = 'videoCSS';
      videoCSS.href =
        'https://imgcache.qq.com/open/qcloud/video/tcplayer/tcplayer.css';
      videoCSS.rel = 'stylesheet';
      document.head.appendChild(videoCSS);
    },
    insertVideoJS() {
      // 每次执行前，先移除上次插入的代码
      document.getElementById('HjsSDK') &&
        document.getElementById('HjsSDK').remove();
      document.getElementById('videoSDK') &&
        document.getElementById('videoSDK').remove();

      const HjsSDK = document.createElement('script');

      HjsSDK.id = 'HjsSDK';
      HjsSDK.src =
        'https://imgcache.qq.com/open/qcloud/video/tcplayer/libs/hls.min.0.12.4.js';
      document.head.appendChild(HjsSDK);
      HjsSDK.onload = () => {
        const videoSDK = document.createElement('script');

        videoSDK.id = 'videoSDK';
        videoSDK.src =
          'https://imgcache.qq.com/open/qcloud/video/tcplayer/tcplayer.v4.min.js';
        document.head.appendChild(videoSDK);
        videoSDK.onload = () => {
          this.playerInit();
        };
      };
    },
    playerInit() {
      const _self = this;
      _self.player = window.TCPlayer('video-player', {
        // player-container-id 为播放器容器 ID，必须与 html 中一致
        fileID: _self.detail.mediaId, // 请传入需要播放的视频 filID（必须）
        appID: '1302373329', // 请传入点播账号的 appID（必须）
        posterImage: true
      });
      _self.player.on('play', () => {
        this.isPlay = true;
      });
    },
    async itemClickHandler(index) {
      const _self = this;
      const userId = _self.$store.state.userId;
      const deviceId = _self.$store.state.deviceId;
      const item = _self.recommendList[index];
      const dateNow = new Date();
      const data = {
        date: formatFullTime(dateNow),
        actions: [
          {
            itemId: item.item_id,
            actionTime: dateNow.getTime(),
            action: 'detailPageShow',
            itemSetId: '71215',
            sceneId: '78469',
            userId: userId || deviceId,
            context: item.context,
            requestId: generateUUID()
          }
        ]
      };

      await VideoService.paradigm(data);
      statClick('h5_video_detail', 'recommended_video_item');
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

      if (
        !_self.finished &&
        !_self.loading &&
        bodyHeight - (windowHeight + scrollTop) < 100
      ) {
        _self.loadList();
      }

      if (_self.loadTotal < _self.recommendList.length) {
        const loadList = _self.$refs['video-item'];

        loadList.map(async (i, index) => {
          const isLoad = i.dataset.load === '1';
          // // 判断是否已经曝光
          if (isLoad) {
            return;
          }
          const itemTop = i.getBoundingClientRect().top;

          if (itemTop < windowHeight) {
            const item = _self.recommendList[index];
            const userId = _self.$store.state.userId;
            const deviceId = _self.$store.state.deviceId;
            const dateNow = new Date();
            const data = {
              date: formatFullTime(dateNow),
              actions: [
                {
                  itemId: item.item_id,
                  actionTime: dateNow.getTime(),
                  action: 'show',
                  itemSetId: '71215',
                  sceneId: '78469',
                  userId: userId || deviceId,
                  context: item.context,
                  requestId: generateUUID()
                }
              ]
            };
            _self.loadTotal = _self.loadTotal + 1;
            i.dataset.load = '1';
            await VideoService.paradigm(data);
            statLoad('h5_video_detail', 'video_item');
          }
        });
      }
    },
    loadList() {
      const _self = this;

      if (
        !_self.recommendTotalList ||
        !_self.recommendTotalList.length ||
        _self.finished
      ) {
        _self.finished = true;
        return;
      }

      if (_self.loading) {
        return;
      }

      _self.loading = true;

      setTimeout(() => {
        const list = _self.recommendTotalList.splice(0, 10).map((i) => {
          try {
            const date = i.publish_time.replace(/-/g, '/');
            const extraData = JSON.parse(i.extra4);

            i.date = showTime(new Date(date));
            i.duration = getVideoTime(extraData.mediaDuration);
            return i;
          } catch (err) {
            console.log(err);
          }
        });
        _self.recommendList.push(...list);
        _self.loading = false;

        if (!_self.recommendTotalList.length) {
          _self.finished = true;
        }
      }, 500);
    }
  },
  head() {
    const _self = this;

    return {
      title: `${_self.detail.title}-扒拉扒拉`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: ''
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: _self.detail.title
        }
      ]
    };
  }
};
</script>

<style lang="less" scoped>
.video-content {
  background-color: #fff;
}
.video-cover {
  width: 100%;
  height: 210px;
  overflow: hidden;
  position: relative;

  .video-player {
    width: 100%;
    height: 210px;
  }
  &.video-web {
    height: 337px;

    .video-player {
      height: 337px;
    }
  }
  &-img {
    display: block;
    width: 100%;
    height: 100%;
  }
  &-icon {
    display: block;
    width: 45px;
    height: 45px;
    .transform-2d(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
  }
  &-duration {
    padding: 6px 8px;
    font-size: 12px;
    line-height: 1;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 2px;
    position: absolute;
    bottom: 12px;
    right: 15px;
  }
}
.video-info {
  padding: 0 15px 25px;

  &-title {
    margin-top: 15px;
    font-size: 18px;
    line-height: 24px;
    color: #222;
    .text-overflow();
  }
  &-other {
    .flex();
    margin-top: 15px;
    font-size: 12px;
    line-height: 1px;
  }
  &-name {
    margin-right: 15px;
    color: #666;
  }
  &-date {
    color: #999;
  }
}
.video-recommend {
  padding: 20px 15px;
  margin-top: 10px;
  background-color: #fff;

  &-title {
    font-size: 16px;
    line-height: 1;
    color: #666;
  }
  &-item {
    .flex();
    .align-items-center();
    margin-top: 15px;

    &-cover {
      width: 133px;
      height: 75px;
      margin-right: 13px;
      border-radius: 5px;
      overflow: hidden;
      position: relative;

      .img {
        display: block;
        width: 100%;
        height: 100%;
      }
      .duration {
        padding: 3px 5px;
        font-size: 10px;
        line-height: 1;
        color: #fefefe;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 2px;
        position: absolute;
        bottom: 8px;
        right: 5px;
      }
    }
    &-info {
      .flex(1);

      .title {
        font-size: 17px;
        line-height: 23px;
        color: #333;
        .text-overflow();
      }
      .date {
        margin-top: 10px;
        font-size: 12px;
        line-height: 1;
        color: #999;
      }
    }
  }
}
.yq-loading {
  margin-top: 15px;
}
</style>
