<template>
  <div class="cate-list-content">
    <div class="scroll-box">
      <ul v-if="showList && showList.length > 0" class="yq-list">
        <li
          v-for="(item, index) in showList"
          :key="index"
          ref="list-item"
          class="list-item"
          data-load="0"
          @click="handleClick"
        >
          <!-- 左文右图、全文字展示 -->
          <!-- <WordPicLayout :path="'/detail'" :item="item" :index="index" /> -->
          <a class="list-link" :href="generateURL(item)">
            <h4
              class="list-title"
              :class="{ flow: item && item.type === 'flow' }"
            >
              {{ item && item.title }}
            </h4>
            <div class="list-con">
              <div v-if="item && item.picId" class="img-wrap fr">
                <img :src="`${basePic}${item.picId}`" />
              </div>
              <div v-if="item" class="text-con">
                <p v-if="item.content" class="text">
                  {{ item.content.slice(0, 55) }}
                </p>
                <div class="list-info-bar">
                  <span v-if="item.postDateName" class="time">{{
                    item.postDateName
                  }}</span>
                  <div v-if="item.categoryName" class="article-label">
                    <div class="label-list">
                      <span class="ele">{{ item.categoryName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </li>
      </ul>
      <div class="yq-loading">
        <span
          v-if="!finished && loading && showList.length"
          class="loading-text"
          >努力加载中..</span
        >
        <span v-if="finished" class="loading-text">加载完毕</span>
      </div>
      <!-- 无数据 -->
      <div v-if="!showList.length" class="list-none">
        <p>暂无内容</p>
      </div>
    </div>
  </div>
</template>
<script>
import getDetailType from '@/common/getDetailType';
import { statLoad } from '@/common/stat';

const basePic = process.env.BASE_PIC;

export default {
  props: ['showList', 'finished', 'loading'],
  data() {
    return {
      activeCategoryId: 'default',
      parentCategoryId: '',
      timer: null,
      loadTotal: 0,
      basePic,
      tabsList: []
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
            statLoad('h5_homepage', 'exposure_h5_homepag_qa_item');
          }
        });
      }
    }
  }
};
</script>
