<template>
  <header class="yq-header center-header">
    <a
      class="btn-back"
      @click="publicapi.statClick(pageType, desc), $router.go(-1)"
    ></a>
    <p class="header-title">个人中心</p>
    <!-- 已登陆 -->
    <div v-show="hasMenu" class="login-con">
      <div class="btn-menu" @click="ishow = !ishow"></div>
      <div v-show="ishow" class="menu-more">
        <i class="arrow"></i>
        <div class="menu-list">
          <span
            class="menu-ele menu-home"
            @click="
              publicapi.statClick('h5_topmenu', 'homepage'), $router.push('/')
            "
            >首页</span
          >
          <span
            class="menu-ele menu-exit"
            @click="publicapi.statClick('h5_topmenu', 'logout'), func()"
            >退出</span
          >
        </div>
      </div>
    </div>
  </header>
</template>
<script>
export default {
  props: {
    hasMenu: {
      type: Boolean,
      default: true
    },
    func: {
      type: Function
    },
    pageType: String,
    desc: String
  },
  data() {
    return {
      ishow: false
    };
  }
};
</script>
<style lang="less" scoped></style>
