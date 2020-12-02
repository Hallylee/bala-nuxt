<template>
  <div>
    <!--详情页头部 start-->
    <header class="yq-detail-header">
      <div class="logo">
        <img src="@/assets/images/yq_logo.jpg" />
      </div>
      <a class="btn-home" @click="back"></a>
      <div class="btn-share" @click="shareMaskFlag = true"></div>
    </header>
    <!--详情页头部 end-->
    <nuxt />
    <!-- 分享遮罩 start -->
    <div v-show="shareMaskFlag" class="m-mask" @click="shareMaskFlag = false">
      <div class="yq-share-wrap">
        <p>点击右上角更多</p>
        <p>分享给好友或到朋友圈</p>
      </div>
    </div>
    <!-- 分享遮罩 end -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      shareMaskFlag: false
    };
  },
  methods: {
    back() {
      window.history.back();
    }
  }
};
</script>
