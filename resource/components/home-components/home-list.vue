<template>
  <div>
    <ul v-if="showList && showList.length" class="yq-list">
      <template v-for="(item, index) in showList">
        <li
          v-if="item && (item.type === '' || item.type === 'content-no-border')"
          :key="index"
          ref="list-item"
          class="list-item"
          data-load="0"
          :data-index="index"
          @click="handleClick(item)"
        >
          <a class="list-link" :href="item.url">
            <h4 class="list-title">
              {{ item && item.title }}
            </h4>
            <div class="list-con">
              <div v-if="item.picId" class="img-wrap fr">
                <img :src="`${basePic}${item.picId}`" />
              </div>
              <div class="text-con">
                <p class="text">{{ item.content.slice(0, 55) }}</p>
                <div class="list-info-bar">
                  <span v-if="item.postDateName" class="time">{{
                    item.postDateName
                  }}</span>
                  <div v-if="item.extra3" class="article-label">
                    <div class="label-list">
                      <span class="ele">{{ item.extra3 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </li>

        <!-- 信息流圈子展示 -->
        <flow-layout
          v-else-if="item && item.type === 'flow'"
          :key="index"
          :item="item"
        />

        <div
          v-else-if="item && item.type === 'video'"
          ref="list-item"
          data-load="0"
          :data-index="index"
          :key="index"
          @click="handleClick(item)"
        >
          <video-flow-layout :item="item" />
        </div>
      </template>
    </ul>
    <div class="yq-loading">
      <span v-if="!finished && loading && showList.length" class="loading-text"
        >努力加载中..</span
      >
      <span v-if="finished" class="finished-text">加载完毕</span>
    </div>
    <!-- 无数据 -->
    <div v-if="!showList.length" class="list-none">
      <p>暂无内容</p>
    </div>
  </div>
</template>

<script>
import { DetailService } from '@/service';
import { formatFullTime } from '@/common/util';
import getDetailType from '@/common/getDetailType';
import FlowLayout from '@/components/layout-component/flow-layout';
import VideoFlowLayout from '@/components/layout-component/video-flow-layout';
import { statLoad, statClick } from '@/common/stat';

const basePic = process.env.BASE_PIC;

export default {
  components: {
    FlowLayout,
    VideoFlowLayout
  },
  props: ['showList', 'finished', 'loading'],
  data() {
    return {
      loadTotal: 0,
      basePic, // 图片路径
      loadTimeout: null
    };
  },
  mounted() {
    this.handleScroll();
    this.addScrollListener();
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

      return `/${type.head + i.categoryId + type.foot}/${i.id}?f=cqalist`;
    },
    /**
     * 点击事件
     */
    async handleClick(item) {
      statClick('h5_homepage', 'qa_item');
      const _self = this;
      const userId = _self.$store.state.userId;
      const deviceId = _self.$store.state.deviceId;
      const bilogparam = {
        date: formatFullTime(new Date()),
        actions: [
          {
            itemId: item.item_id,
            actionTime: new Date().getTime(),
            action: 'detailPageShow',
            requestId: 'appwxextend77629',
            itemSetId: item.materialId,
            sceneId: item.sceneId,
            userId: userId || deviceId,
            deviceId,
            context: item.context
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
    removeScrollListener() {
      window.removeEventListener('scroll', this.handleScroll);
    },
    // 滚动到页面底部 加载数据 埋点
    handleScroll() {
      const _self = this;

      _self.loadTimeout && clearTimeout(_self.loadTimeout);
      _self.loadTimeout = setTimeout(() => {
        const windowHeight = window.innerHeight || document.body.clientHeight;
        const showListLength = _self.showList.length;
        const itemLength = showListLength - parseInt(showListLength / 10) * 2;

        if (_self.loadTotal < itemLength) {
          const loadList = _self.$refs['list-item'];

          if (loadList && loadList.length) {
            loadList.forEach((i) => {
              const isLoad = i.dataset.load === '1';
              // // 判断是否已经曝光
              if (isLoad) {
                return;
              }
              const itemTop = i.getBoundingClientRect().top;
              if (itemTop < windowHeight) {
                statLoad('h5_homepage', 'exposure_h5_homepag_qa_item');
                // 第四范式上报
                console.log(_self.showList[i.dataset.index]);
                const data = _self.showList[i.dataset.index];
                console.log(data.sceneId);
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
                _self.loadTotal = _self.loadTotal + 1;
                i.dataset.load = '1';
              }
            });
          }
        }
      }, 500);
    }
  }
};
</script>
