<template>
  <div id="login">
    <common-header
      back
      title="登录/注册"
      page-type="h5_login"
      desc="back_top"
    ></common-header>
    <van-overlay :show="show" z-index="160" />
    <van-loading
      v-show="show"
      size="24px"
      vertical
      style="z-index:200;top: 40%;
    position: fixed;
    left: 42%;"
      >加载中...</van-loading
    >
    <div class="login-banner">
      <img src="@/assets/images/yq_login_banner.jpg" />
    </div>
    <div class="yq-login-main">
      <div class="login-item login-code-item">
        <div class="input-wrap">
          <input
            v-model="phoneNumber"
            type="tel"
            maxlength="11"
            class="login-input phone-input"
            placeholder="请输入手机号"
            @blur="checkoutSub"
          />
          <div class="btn-input-delete"></div>
        </div>
        <span
          class="btn-code"
          :class="{ 'btn-code-no': !phoneNumber }"
          @click="sendCode"
          >{{ codeText }}</span
        >
      </div>
      <div class="login-item">
        <div class="input-wrap">
          <input id="smsId" type="hidden" />
          <input
            v-model="phoneSms"
            type="text"
            class="login-input code-input"
            placeholder="请输入验证码"
            @blur="checkoutSub"
          />
          <div class="btn-input-delete"></div>
        </div>
      </div>
      <a
        class="btn-login"
        :class="{ 'btn-login-yes': isover, 'btn-login-no': !isover }"
        @click="publicapi.statClick('h5_login', 'phone_enter'), login()"
        >登录</a
      >
      <p class="login-tips">未注册手机验证后自动登录</p>
      <div
        class="other-login"
        :class="{ notwechat: environment === 'outweb' }"
        @click="publicapi.statClick('h5_login', 'wechat_enter'), wechatlogin()"
      >
        <div class="other-title">
          <span class="other-text">其他登录方式</span>
        </div>
        <a class="wx-login"></a>
      </div>
      <p class="login-bottom-tips">
        注册即代表你同意
        <a
          href="#"
          class="link j_agreement"
          @click="
            publicapi.statClick('h5_login', 'agreement'),
              $router.push('/agreement')
          "
          >用户协议</a
        >
      </p>
    </div>
  </div>
</template>

<script>
import { UserService } from '@/service';

export default {
  name: 'Login',
  data() {
    return {
      phoneNumber: '',
      phoneSms: '',
      code: '',
      codeText: '获取验证码',
      codeInterval: null,
      codeTime: 0,
      smsId: '',
      environment: '',
      isover: false,
      show: false
    };
  },
  created() {
    if (typeof window !== 'undefined') {
      const naviga = navigator.userAgent.toLowerCase();
      if (naviga.includes('micromessenger') || naviga.includes('wechat')) {
        this.environment = 'wechat';
        this.$store.commit('SET_ENVIRONMENT', 'wechat');
      } else {
        this.environment = 'outweb';
        this.$store.commit('SET_ENVIRONMENT', 'outweb');
      }
    }
  },
  mounted() {
    document.body.style.backgroundColor = '#fff';
    this.publicapi.statLoad('h5_login', 'login');
  },
  beforeRouteLeave(to, from, next) {
    document.body.style.backgroundColor = '';
    next();
  },
  methods: {
    async sendCode() {
      const _self = this;
      const phoneNumber = _self.phoneNumber;
      const reg = /^1[3456789]\d{9}$/;

      if (_self.codeInterval) {
        return;
      }

      if (!phoneNumber) {
        _self.$toast({
          message: '请输入手机号码',
          duration: 1000
        });
      }

      if (!reg.test(phoneNumber)) {
        _self.$toast({
          message: '手机号码格式错误',
          duration: 1000
        });
        return;
      }

      _self.codeTime = 60;
      _self.codeText = '60秒后重试';
      _self.codeInterval = setInterval(() => {
        const time = _self.codeTime - 1;

        _self.codeTime = time;
        if (time) {
          _self.codeText = `${time}秒后重试`;
        } else {
          _self.codeText = '获取验证码';
          clearInterval(_self.codeInterval);
          _self.codeInterval = null;
        }
      }, 1000);

      try {
        const data = await UserService.getCode({
          businessCode: 4,
          mobile: phoneNumber,
          nationCode: 86,
          terminal: 'M'
        });
        // console.log(data);
        if (data.code === '2110') {
          _self.$toast({
            message: data.message,
            duration: 1000
          });
          return;
        }
        _self.smsId = data.data.smsId;
      } catch (err) {
        const e = String(err)
          .split('Message')[1]
          .split(';')[0]
          .split(':')[1];
        _self.$toast({
          message: e,
          duration: 1000
        });
        // console.error('获取验证码失败：' + e);
      }
    },
    login() {
      // this.$router.push('/ucenter')
      if (this.phoneSms === '') {
        this.$toast({
          message: '验证码不能为空',
          duration: 1000
        });
        return;
      }
      if (this.smsId === '') {
        this.$toast({
          message: '验证码还没有获取',
          duration: 1000
        });
        return;
      }
      this.show = true;
      UserService.login({
        mobile: this.phoneNumber,
        smsId: this.smsId,
        checkCode: this.phoneSms,
        nationCode: '86',
        terminal: 'm'
      }).then((res) => {
        this.show = false;
        // console.log(res);
        if (res.code !== '0') {
          this.$toast({
            message: res.message,
            duration: 1000
          });
          return;
        }
        this.$store.commit('SET_USER_ID', res.data.userInfoVo.userId);
        localStorage.setItem('userInfoVo', JSON.stringify(res.data.userInfoVo));
        this.$router.replace('/');
      });
    },
    checkoutSub() {
      const reg = /^1[3456789]\d{9}$/;
      if (
        this.phoneNumber !== '' &&
        this.phoneSms !== '' &&
        reg.test(this.phoneNumber)
      ) {
        this.isover = true;
      } else {
        this.isover = false;
      }
    },
    wechatlogin() {
      UserService.loginwechat({
        redurl: 'wxLogin',
        redirect_uri: location.href
      }).then((res) => {
        // console.log(res);
      });
    }
  }
};
</script>

<style lang="less" scoped>
.login-tips {
  font-size: 12px;
  color: @gray-lighter;
  line-height: 20px;
  margin-top: 10px;
}
.other-login {
  margin-top: 28vw;

  .other-title {
    height: 24px;
    line-height: 24px;
    position: relative;
    text-align: center;

    &::before {
      height: 1px;
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      background: -webkit-linear-gradient(
        left,
        rgba(222, 222, 222, 0),
        #dedede,
        rgba(222, 222, 222, 0)
      );
      background: linear-gradient(
        to right,
        rgba(222, 222, 222, 0),
        #dedede,
        rgba(222, 222, 222, 0)
      );
      -webkit-transform: translateY(0.5) translateY(-50%);
      transform: translateY(0.5) translateY(-50%);
      content: '';
    }

    .other-text {
      display: inline-block;
      background-color: #fff;
      position: relative;
      font-size: 13px;
      color: #8f8f90;
      padding: 0 6px;
    }
  }

  .wx-login {
    width: 40px;
    height: 40px;
    display: block;
    margin: 8px auto 0;
    background-image: url('../assets/images/icon_wx_login.png');
    background-size: 40px 40px;
    cursor: pointer;
  }
}
.login-bottom-tips {
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-size: 12px;
  color: @gray-lighter;
  margin-top: 20px;
  .link {
    color: @gray;
    cursor: pointer;
  }
}
.notwechat {
  transform: translateX(-200%);
}
</style>
