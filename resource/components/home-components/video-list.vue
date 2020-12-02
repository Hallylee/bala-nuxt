<template>
  <div id="video-list">
    <template v-if="showList && showList.length">
      <div class="video-content">
        <a
          v-for="item in showList"
          :key="item.id"
          class="video-item"
          data-load="0"
          ref="video-item"
          :href="`/v/${item.categoryId}/${item.id}`"
        >
          <div class="video-cover">
            <img :src="basePic + item.picId" alt="" class="video-cover-img" />
            <div class="video-cover-duration">{{ item.duration }}</div>
          </div>

          <p class="video-title">
            {{ item.title }}
          </p>
          <p class="video-date">{{ item.date }}</p>
        </a>
      </div>
      <div class="yq-loading">
        <span v-if="!finished && showList.length" class="loading-text"
          >努力加载中..</span
        >
        <span v-if="finished" class="finished-text">加载完毕</span>
      </div>
    </template>
    <div v-else class="list-none">
      <p>暂无内容</p>
    </div>
  </div>
</template>

<script>
import { statLoad } from '@/common/stat';

const basePic = process.env.BASE_PIC;

export default {
  name: 'VideoList',
  props: ['showList', 'finished', 'loading'],
  data() {
    return {
      basePic,
      loadTotal: 0
    };
  },
  mounted() {
    this.handleScroll();
    this.addScrollListener();
    // }
  },
  beforeDestroy() {
    this.removeScrollListener();
  },
  methods: {
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll);
    },
    removeScrollListener() {
      window.removeEventListener('scroll', this.handleScroll);
    },
    handleScroll() {
      const windowHeight = window.innerHeight || document.body.clientHeight;

      if (this.loadTotal < this.showList.length) {
        const loadList = this.$refs['video-item'];
        loadList.forEach((i) => {
          const isLoad = i.dataset.load === '1';
          // // 判断是否已经曝光
          if (isLoad) {
            return;
          }
          const itemTop = i.getBoundingClientRect().top;
          if (itemTop < windowHeight) {
            this.loadTotal = this.loadTotal + 1;
            i.dataset.load = '1';
            statLoad('h5_video', 'video_item');
          }
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.video-content {
  .flex();
  .justify-flex-justify();
  flex-wrap: wrap;
  padding: 15px 15px 0;

  .video-item {
    display: block;
    width: 44.8vw;
    margin-bottom: 20px;

    .video-cover {
      width: 100%;
      height: 25.4vw;
      border-radius: 5px;
      overflow: hidden;
      position: relative;

      &-img {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 5px;
      }
      &-duration {
        padding: 3px 5px;
        font-size: 10px;
        color: #fefefe;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 2px;
        position: absolute;
        bottom: 10px;
        right: 10px;
      }
    }
    .video-title {
      padding-right: 14px;
      margin-top: 8px;
      font-size: 14px;
      line-height: 18px;
      color: #333;
      .text-overflow(2);
    }
    .video-date {
      margin-top: 8px;
      font-size: 12px;
      color: #999;
      line-height: 1;
    }
  }
}
</style>
