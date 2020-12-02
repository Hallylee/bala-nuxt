<template>
  <div id="common-header">
    <!--头部 start-->
    <header
      class="yq-header"
      :class="{
        'header-center': back || (!back && !share && !menu),
        border: border
      }"
    >
      <!--返回按钮-->
      <a v-if="back" class="btn-back" @click="backHandler"></a>
      <!--文字标题-->
      <p v-if="title" class="header-title">{{ title }}</p>
      <!--LOGO-->
      <div v-else class="logo">
        <img src="@/assets/images/yq_logo.jpg" />
      </div>
      <!--分享按钮-->
      <div v-if="share" class="btn-share" @click="shareHandler"></div>
      <!--菜单按钮-->
      <div v-if="menu">
        <!-- 未登录 -->
        <div v-if="!userId" class="login-con">
          <nuxt-link to="/login" class="login-link">登录/注册</nuxt-link>
        </div>
        <!-- 已登陆 -->
        <div v-else class="login-con">
          <div class="btn-menu" @click="navMenuFlag = !navMenuFlag">
            <i class="icon-news"></i>
          </div>
          <div v-if="navMenuFlag" class="menu-more" style="display:block">
            <i class="arrow"></i>
            <div class="menu-list">
              <a class="menu-ele menu-home" href="/">首页</a>
              <a class="menu-ele menu-center" href="/ucenter">
                个人中心<i class="icon-news"></i>
              </a>
              <a class="menu-ele menu-exit" @click="loginOut">退出</a>
            </div>
          </div>
        </div>
      </div>
    </header>
    <!--首页头部 end-->
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
// import { mapState } from 'vuex';
import { statClick } from '../common/stat';

export default {
  name: 'CommonHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    share: {
      type: Boolean,
      default: false
    },
    menu: {
      type: Boolean,
      default: false
    },
    back: {
      type: Boolean,
      default: false
    },
    logo: {
      type: Boolean,
      default: true
    },
    border: Boolean,
    pageType: {
      type: String,
      default: ''
    },
    desc: {
      type: String,
      default: ''
    },
    shareDesc: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      shareMaskFlag: false,
      navMenuFlag: false,
      userId: ''
    };
  },
  created() {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userInfoVo')
        ? JSON.parse(localStorage.getItem('userInfoVo')).userId
        : '';
    }
  },
  mounted() {
    const _self = this;

    if (_self.userId) {
      this.isLogin = true;
    }
    document.addEventListener(
      'scroll',
      () => {
        _self.navMenuFlag = false;
      },
      false
    );
  },
  methods: {
    backHandler() {
      if (this.pageType && this.desc) {
        statClick(this.pageType, this.desc);
      }

      window.history.back();
    },
    shareHandler() {
      if (this.pageType && this.shareDesc) {
        statClick(this.pageType, this.shareDesc);
      }

      this.shareMaskFlag = true;
    },
    /** 退出 */
    loginOut() {
      this.navMenuFlag = false;
      localStorage.removeItem('userInfoVo');
      this.$store.commit('SET_USER_ID', '');
      this.userId = '';
    }
  }
};
</script>

<style lang="less" scoped>
/*头部*/
.yq-header {
  height: 45px;
  .flex();
  .align-items-center();
  .justify-flex-justify();
  padding: 0 15px;
  background-color: #fff;
  position: relative;
  z-index: 100;

  &.border:after {
    height: 1px;
    background-color: #e8e8e8;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    .transform-scale(1, 0.5);
    content: '';
  }
  .logo {
    width: 164/2px;
    height: 60/2px;
  }
  .home-title {
    font-size: 18px;
    color: @gray-dark;
    font-weight: bold;
    margin-left: 15px;
  }
  .header-title {
    font-size: 1rem;
    color: @gray-dark;
    font-weight: normal;
    .text-ellipsis();
  }
  .login-con {
    height: 45px;
    line-height: 45px;
  }
  .login-link {
    font-size: 16px;
    color: #fb4c5b;
  }
  .btn-home {
    width: 40px;
    height: 44px;
    cursor: pointer;
    position: absolute;
    display: block;
    left: 0;
    top: 0;
    z-index: 5;
    &:before {
      background-image: url('../assets/images/icon_yq_back.png');
      background-size: 16px 16px;
      background-repeat: no-repeat;
      .center(know, 16px, 16px);
      content: '';
    }
  }
  .btn-share {
    height: 44px;
    width: 44px;
    position: absolute;
    cursor: pointer;
    right: 3px;
    top: 0;
    &:before {
      background-image: url('../assets/images/icon_yq_share.png');
      background-size: 20px 20px;
      background-repeat: no-repeat;
      .center(know, 20px, 20px);
      content: '';
    }
  }
  .btn-menu {
    width: 45px;
    height: 45px;
    position: absolute;
    display: block;
    right: 1.5px;
    top: 0;
    cursor: pointer;
    &:before {
      width: 18px;
      height: 16px;
      position: absolute;
      top: 50%;
      left: 50%;
      .transform-2d(-50%, -50%);
      background-image: url('../assets/images/icon_yq_menu.png');
      background-size: 18px 16px;
      content: '';
    }
  }
  .icon-news {
    width: 6px;
    height: 6px;
    display: block;
    position: absolute;
    right: 13.5px;
    top: 5px;
    border-radius: 6px;
    background-color: transparent;
  }
  .menu-more {
    width: 122px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    top: 43px;
    right: 10px;
    z-index: 20;
    display: none;
    &:before {
      width: 200%;
      height: 200%;
      border: 1px solid #e8e8e8;
      position: absolute;
      border-radius: 10px;
      left: 0;
      top: 0;
      .box-sizing();
      .transform-scale(0.5, 0.5);
      .transform-origin(left, top);
      z-index: 1;
      content: '';
    }
    &:after,
    .arrow {
      .arrow-bottom(5px, #fff);
      position: absolute;
      z-index: 3;
      right: 10px;
      top: -9px;
    }
    &:after {
      border-bottom-color: #e8e8e8;
      top: -10px;
      z-index: 2;
      content: '';
    }
    .menu-list {
      line-height: 44px;
      position: relative;
      z-index: 5;
    }
    .menu-ele {
      display: block;
      position: relative;
      padding-left: 40px;
      color: #333;
      &:before {
        width: 20px;
        height: 20px;
        position: absolute;
        left: 14px;
        top: 50%;
        .transform-2d(0, -50%);
        background-size: 20px 20px;
        content: '';
      }
      &:after {
        height: 1px;
        background-color: #e8e8e8;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        .transform-scale(1, 0.5);
        content: '';
      }
      &.menu-home {
        &:before {
          background-image: url('../assets/images/icon_menu_home.png');
        }
      }
      &.menu-center {
        &:before {
          background-image: url('../assets/images/icon_menu_center.png');
        }
      }
      &.menu-exit {
        &:before {
          background-image: url('../assets/images/icon_menu_exit.png');
        }
        &:after {
          visibility: hidden;
        }
      }
      .icon-news {
        // right: 20px;
        // top: 11px;
      }
    }
  }
}
.header-center {
  .justify-flex-center();
}
</style>
