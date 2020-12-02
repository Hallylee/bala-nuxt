<template>
  <!--首页导航条 start-->
  <van-sticky>
    <nav class="yq-nav">
      <div ref="scroll" class="nav-scroll">
        <a
          class="nav-link"
          :class="{ current: tabsIndex === 'default' }"
          href="/"
          >推荐</a
        >
        <a
          @click="navClick(item.categoryName)"
          v-for="(item, i) in categoryList"
          :key="i"
          class="nav-link"
          :class="{ current: parentCategoryIndex === i }"
          :href="`/c/${item.categoryId === '0097' ? 'kd' : item.categoryId}`"
          >{{ item.categoryName }}</a
        >
      </div>
    </nav>

    <ul
      v-if="
        tabsIndex !== 'default' &&
          tabsIndex !== 'video' &&
          categoryList[parentCategoryIndex].childs &&
          categoryList[parentCategoryIndex].childs.length
      "
      class="tabs-row"
    >
      <li class="tabs-item" :class="{ active: childCategoryIndex === null }">
        <a
          class="tabs-inner"
          :href="`/c/${categoryList[parentCategoryIndex].categoryId}`"
          >全部</a
        >
      </li>
      <li
        v-for="(item, i) in categoryList[parentCategoryIndex].childs"
        :key="i"
        class="tabs-item"
        :class="{ active: childCategoryIndex === i }"
      >
        <a class="tabs-inner" :href="`/c/${item.categoryId}`">
          {{ item.categoryName }}
        </a>
      </li>
    </ul>
  </van-sticky>
</template>
<script>
export default {
  props: [
    'tabsIndex',
    'categoryList',
    'childCategoryIndex',
    'parentCategoryIndex'
  ],
  mounted() {
    const nav = document.querySelector('.yq-nav');
    const current = document.querySelector('.current');
    const currentOffset = current.getBoundingClientRect().x + 62;
    const windowWidth = window.innerWidth || document.body.clientWidth;

    if (currentOffset > windowWidth) {
      nav.scrollLeft = Math.abs(windowWidth / 2 - currentOffset);
    }
  },
  methods: {
    navClick(item) {
      switch (item) {
        case '推荐':
          this.publicapi.statClick('h5_homepage', 'recommendation');
          break;
        case '文化':
          this.publicapi.statClick('h5_homepage', 'culture');
          break;
        case '历史':
          this.publicapi.statClick('h5_homepage', 'history');
          break;
        case '科技':
          this.publicapi.statClick('h5_homepage', 'technology');
          break;
        case '知识':
          this.publicapi.statClick('h5_homepage', 'knowledge');
          break;
        case '视频':
          this.publicapi.statClick('h5_homepage', 'video');
          break;
        case '作文':
          this.publicapi.statClick('h5_homepage', 'composition');
          break;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.yq-nav {
  height: 36px;
  line-height: 36px;
  background-color: #fff;
  font-size: 15px;
  text-align: center;
  position: relative;
  z-index: 99;
  overflow-x: scroll;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    display: none;
  }
  .nav-scroll {
    .flex();
    float: left;
    position: relative;

    &:after {
      height: 1px;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #e6e6e6;
      .transform-scale(1, 0.5);
      content: '';
    }
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .nav-link {
    .flex(none);
    width: 56px;
    cursor: pointer;
    color: @gray;
    position: relative;
    display: block;
    text-align: center;

    &:after {
      height: 2px;
      border-radius: 2px;
      .center(known-x, 10px);
      bottom: 0;
      background-color: #fb4c5b;
      z-index: 2;
    }
    &.current {
      width: 62px;
      font-size: 18px;
      color: #fb4c5b;
      font-weight: bold;
      &:after {
        content: '';
      }
    }
  }
}
.tabs-row {
  display: flex;
  justify-content: center;
  height: 100%;
  background-color: #f5f5f5;
  padding: 11px 0;
}

.tabs-item {
  display: inline-block;
  padding: 0 5px;
  display: flex;
  align-items: center;
}
.active .tabs-inner {
  background: #fd4c5b;
  color: white;
}

.tabs-inner {
  padding: 5px 10px;
  border-radius: 50px;
  color: #666;
}
</style>
