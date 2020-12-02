<template>
  <div class="yq-banner-wrap">
    <div v-if="bannerList && bannerList.length > 0" class="yq-banner">
      <van-swipe :autoplay="autoplay" @change="onSwipeChange">
        <van-swipe-item
          v-for="(item, i) in bannerList"
          :key="i"
          class="swiper-slide"
          @click="clickBanner(item)"
        >
          <img :src="basePic + item.picId" />
          <div class="bg"></div>
          <p class="yq-banner-title">{{ item.title }}</p>
        </van-swipe-item>
        <template #indicator>
          <div class="yq-focus">
            <span
              v-for="index in bannerList.length"
              :key="index"
              :class="currentSwipe + 1 === index ? 'active' : ''"
            ></span>
          </div>
        </template>
      </van-swipe>
    </div>
  </div>
</template>

<script>
const basePic = process.env.BASE_PIC;

export default {
  props: {
    bannerList: {
      type: Array
    },
    autoplay: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      currentSwipe: 0,
      basePic
    };
  },
  methods: {
    /**
     * 切换轮播图
     */
    onSwipeChange(index) {
      this.currentSwipe = index;
    },
    clickBanner(item) {
      this.$emit('clickBanner', item);
    }
  }
};
</script>

<style lang="less" scoped>
@banner-height: 110px;

.van-swipe {
  height: @banner-height;

  img {
    height: @banner-height;
  }
}
.yq-banner {
  &-title {
    width: 255px;
    height: 16px;
    font-size: 16px;
    color: #fff;
    line-height: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    position: absolute;
    left: 15px;
    bottom: 10px;
  }
}
.bg {
  background: url(../../assets/images/bannerbuttom.png);
  width: 100%;
  height: 40px;
  position: absolute;
  top: 64%;
  border-radius: 0 0 10px 10px;
  background-size: contain;
}
</style>
