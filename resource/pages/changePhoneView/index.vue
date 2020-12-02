<template>
  <div>
    <!-- <header class="yq-detail-header phone-header">
      <a class="btn-home"></a>
      <p class="header-title">绑定手机号</p>
    </header> -->
    <commonBack
      :has-menu="false"
      page-type="h5_personnlcenter"
      desc="top_menu"
    />
    <div class="yq-login-main binging-phone-main">
      <p class="change-text">
        更换手机号后，下次登录可使用新手机号登录，当前手机号
        <span class="num">{{ userinfo.mobileAccount }}</span>
      </p>
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
        @click="publicapi.statClick('h5_change_phone', 'change'), login()"
        >确定更换</a
      >
    </div>
  </div>
</template>
<script>
import commonBack from '@/components/common-back-set';
import { UserService } from '@/service';
export default {
  components: {
    commonBack
  },
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
      userinfo: ''
    };
  },
  mounted() {
    document.body.style.backgroundColor = '#fff';
    this.userinfo = JSON.parse(localStorage.getItem('userInfoVo'));
    this.publicapi.statLoad('h5_change_phone', 'change_phone');
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
          businessCode: 5,
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
        _self.$toast({
          message: err.message,
          duration: 1000
        });
        // console.error('获取验证码失败：' + err);
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
      try {
        UserService.changePhone({
          userId: this.userinfo.userId,
          mobile: this.phoneNumber,
          oldMobile: this.userinfo.mobileAccount,
          smsId: this.smsId,
          checkCode: this.phoneSms,
          nationCode: '86',
          terminal: 'm'
        }).then((res) => {
          // console.log(res);
          if (res.code !== '0') {
            if (res.code === '215') {
              this.$router.replace(`/mergeuid?id=${res.message}`);
              return;
            }
            this.$toast({
              message: res.message,
              duration: 1000
            });

            return;
          }
          // this.$store.commit('SET_USER_ID', res.data.userInfoVo.userId);
          // localStorage.setItem(
          //   'userInfoVo',
          //   JSON.stringify(res.data.userInfoVo)
          // );
          this.$router.replace('/ucenter');
        });
      } catch (e) {
        this.$toast({
          message: e.message,
          duration: 1000
        });
      }
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
    }
  },
  beforeRouteLeave(to, from, next) {
    document.body.style.backgroundColor = '';
    next();
  }
};
</script>
