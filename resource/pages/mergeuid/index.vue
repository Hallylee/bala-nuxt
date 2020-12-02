<template>
  <div>
    <header class="yq-detail-header phone-header">
      <a
        class="btn-home"
        @click="
          publicapi.statClick('h5_bind_failure', 'back_top'), $router.go(-1)
        "
      ></a>
      <p class="header-title">绑定手机号</p>
    </header>
    <div class="yq-login-main">
      <div class="bing-fail-wrap">
        <p class="fail-tips">
          你的手机号
          <span class="num">{{ userinfo.mobileAccount }}</span> 已被下方账号绑定
        </p>
        <div class="bing-item bind-active">
          <i class="b-bing">当前绑定</i>
          <div class="inter-wrap">
            <div class="pic-user">
              <img :src="userinfo.headimgurl" />
            </div>
            <div class="text-con">
              <p class="name">{{ userinfo.nickName }}</p>
              <p class="text">
                <span class="time">{{ wechatinfo.createAt }}</span>
                {{ userinfo.weixin | backmes }}
              </p>
            </div>
          </div>
        </div>
        <div class="merge-wrap">
          <p class="merge-txt">是否合并账号信息</p>
          <div class="bing-item">
            <div class="inter-wrap">
              <div class="pic-user">
                <img :src="wechatinfo.headimgurl" />
              </div>
              <div class="text-con">
                <p class="name">{{ wechatinfo.nickName }}</p>
                <p class="text">
                  <span class="time">{{ wechatinfo.createAt }}</span>
                  {{ wechatinfo.weixin | backmes }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a
        class="btn-login"
        @click="publicapi.statClick('h5_bind_failure', 'merge'), merge()"
        >合并</a
      >
      <a
        class="btn-relieve"
        @click="
          publicapi.statClick('h5_bind_failure', 'not_merge'),
            $router.push('/ucenter')
        "
        >暂不合并</a
      >
    </div>
  </div>
</template>
<script>
import { UserService } from '@/service';
export default {
  filters: {
    backmes(v) {
      if (v === 'weixin') {
        return '通过微信注册';
      } else {
        return '通过手机号注册';
      }
    }
  },
  data() {
    return {
      userinfo: {
        headimgurl: '',
        mobileAccount: '',
        nickName: '',
        source: '',
        terminal: '2',
        userId: '',
        weixin_unionid: ''
      },
      wechatinfo: {
        headimgurl: '',
        mobileAccount: '',
        nickName: '',
        source: '',
        terminal: '2',
        userId: '',
        weixin_unionid: ''
      }
    };
  },
  mounted() {
    this.userinfo = JSON.parse(localStorage.getItem('userInfoVo'));
    this.publicapi.statLoad('h5_bind_failure', 'bind_failure');
    // console.log(this.$router.currentRoute.query.id);
    if (
      this.$router.currentRoute.query.id ||
      this.$router.currentRoute.query.userId
    ) {
      UserService.getUserInfo({
        id:
          this.$router.currentRoute.query.id ||
          this.$router.currentRoute.query.userId
      }).then((res) => {
        this.wechatinfo = res.data;
      });
    } else {
      UserService.getUserInfoformobile({
        id: this.$router.currentRoute.query.phone
      }).then((res) => {
        if (res.code !== '0') {
          this.$toast({
            message: res.message,
            duration: 1000
          });
          return;
        }
        this.wechatinfo = res.data;
      });
    }

    // console.log(this.$store.state.userId, this.userinfo.userId);
  },
  methods: {
    merge() {
      try {
        UserService.merge({
          userId1: this.userinfo.userId,
          userId2: this.wechatinfo.userId
        }).then((res) => {
          // console.log(res);
          if (res.code !== '0') {
            this.$toast({
              message: res.message,
              duration: 1000
            });
            return;
          }
          const user = JSON.parse(localStorage.getItem('userInfoVo'));
          user.userId = res.data;
          localStorage.setItem('userInfoVo', JSON.stringify(user));
          this.$store.commit('SET_USER_ID', res.data);
          this.$toast({
            message: res.message,
            duration: 1000
          });
          this.$router.push('/ucenter');
        });
      } catch (e) {
        this.$toast({
          message: e.message,
          duration: 1000
        });
      }
    }
  }
};
</script>
