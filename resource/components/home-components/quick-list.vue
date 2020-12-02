<template>
  <div class="quick-wrap">
    <ul v-if="showList && showList.length" class="quick-list">
      <li
        v-for="(item, index) in showList"
        :key="index"
        ref="list-item"
        class="list-item"
        data-load="0"
        @click="handleClick"
      >
        <!-- 左文右图、全文字展示 -->
        <!-- <WordPicLayout :item="item" :path="'/quick-detail'" :index="index" /> -->
        <a class="list-link" :href="generateURL(item)">
          <h4 class="list-title">{{ item.title }}</h4>
          <p class="time">{{ item.postDateName }}</p>
        </a>
      </li>
    </ul>
    <div class="yq-loading">
      <span v-if="!finished && loading && showList.length" class="loading-text"
        >努力加载中..</span
      >
      <span v-if="finished" class="loading-text">加载完毕</span>
    </div>
    <!-- 无数据 -->
    <div v-if="!showList.length" class="list-none">
      <p>暂无内容</p>
    </div>
  </div>
</template>
<script>
import getDetailType from '@/common/getDetailType';
import { statLoad } from '@/common/stat';

export default {
  props: ['showList', 'finished', 'loading'],
  data() {
    return {
      loadTotal: 0,
      lastStamp: null
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
    handleClick() {
      this.$emit('handleClickItem');
    },
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll);
    },
    removeScrollListener() {
      window.removeEventListener('scroll', this.handleScroll);
    },
    handleScroll() {
      const windowHeight = window.innerHeight || document.body.clientHeight;

      if (this.loadTotal < this.showList.length) {
        const loadList = this.$refs['list-item'];
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
            // 曝光上报
            statLoad('h5_homepage', 'exposure_h5_homepag_qa_item');
          }
        });
      }
    }
  }
};
</script>
<style scoped>
.flow {
  color: red;
}
.back-img-icon {
  height: 15px;
  width: auto;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
}
.list-link {
  padding: 15px 40px 15px 15px !important;
}
</style>
