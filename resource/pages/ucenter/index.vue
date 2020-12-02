<template>
  <div>
    <!-- <header class="yq-header center-header">
      <a class="btn-back"></a>
    <p class="header-title">个人中心</p>-->
    <!-- 已登陆 -->
    <!-- <div class="login-con">
        <div class="btn-menu"></div>
        <div class="menu-more">
          <i class="arrow"></i>
          <div class="menu-list">
            <a class="menu-ele menu-home" href="../yq_index.html">首页</a>
            <a class="menu-ele menu-exit">退出</a>
          </div>
        </div>
      </div>
    </header>-->
    <commonBack :func="exit" page-type="h5_personnlcenter" desc="top_menu" />
    <div class="center-user-wrap">
      <img src="@/assets/images/bg_center_user.jpg" />
      <div class="user-inter">
        <div class="user-pic">
          <img :src="userData.headimgurl" />
        </div>
        <div class="user-info">
          <p class="user-name">{{ userData.nickName }}</p>
          <p>ID:{{ userData.userId }}</p>
        </div>
      </div>
    </div>
    <div class="center-ele-item center-ele-phone">
      <i class="icon-ele"></i>
      <p class="ele-text">
        手机号
        <span class="num">{{ userData.mobileAccount }}</span>
      </p>
      <span
        :class="{
          'change-phone': phoneStatus == 0 || phoneStatus == 1,
          'binding-wx': phoneStatus == 2
        }"
        @click="phoneStatusPage"
        >{{ phoneStatus | phonefunc }}</span
      >
    </div>
    <div
      v-show="$store.state.isWechat == 'wechat'"
      class="center-ele-item center-ele-wx"
      @click="bindwechat"
    >
      <i class="icon-ele"></i>
      <p class="ele-text">
        微信
        <span class="num">{{ userData.nickName }}</span>
      </p>
      <!-- 未绑定状态  -->
      <a v-show="userData.weixin_unionid == ''" class="binding-wx">去绑定</a>
    </div>
    <div class="center-ele-item center-ele-message">
      <span
        class="ele-link"
        @click="
          publicapi.statClick('h5_personnlcenter', 'feedback'),
            $router.push('/callback')
        "
      >
        <i class="icon-ele"></i>
        <p class="ele-text">留言反馈</p>
        <div v-show="freemessage != 0" class="message-num">
          <span>{{ freemessage }}</span>
        </div>
      </span>
    </div>
    <div
      class="center-ele-item center-ele-agreement"
      @click="
        publicapi.statClick('h5_personnlcenter', 'useragreement'),
          $router.push('/agreement')
      "
    >
      <span class="ele-link">
        <i class="icon-ele"></i>
        <p class="ele-text">用户协议</p>
      </span>
    </div>
    <!--遮罩层 -->
    <div v-show="maskShouw" class="m-mask"></div>
    <!-- 退出弹出层 -->
    <!-- <div class="dialog-exit">
      <div class="dialog-inter">
        <p class="title-text">确定要退出？</p>
      </div>
      <div class="dialog-footer">
        <a class="btn-cancel">取消</a>
        <a class="btn-sure">确定</a>
      </div>
    </div>-->
  </div>
</template>
<script>
import commonBack from '@/components/common-back-set';
import { UserService, Message } from '@/service';
import { statLoad, statClick } from '@/common/stat';
// /login/user/find/info?userId=${id}
export default {
  components: {
    commonBack
  },
  filters: {
    phonefunc(v) {
      // console.log(v);
      if (typeof v === 'number') {
        v = Number(v);
      } else {
        // console.error('错误的传入值');
      }
      if (v === 0) {
        return '管理';
      } else if (v === 1) {
        return '管理';
      } else if (v === 2) {
        return '去绑定';
      } else {
        return '？？';
      }
    }
  },
  data() {
    return {
      maskShouw: false,
      phoneStatus: 0,
      userData: {
        headimgurl: '',
        nickName: '',
        mobileAccount: '',
        userId: '',
        weixin_unionid: ''
      },
      freemessage: 0
    };
  },
  created() {
    if (typeof window !== 'undefined') {
      let uid;
      (localStorage.getItem('userInfoVo') &&
        (uid = JSON.parse(localStorage.getItem('userInfoVo')).userId)) ||
        (uid = this.$store.state.userId);
      UserService.getUserInfo({ id: uid }).then((res) => {
        // console.log(res);
        if (res.code === 'G-404') {
          this.$router.replace('/login');
        } else {
          this.userData = res.data;
          if (res.data.mobileAccount && res.data.mobileAccount !== '') {
            this.phoneStatus = 1;
          } else {
            this.phoneStatus = 2;
          }
          this.userData.weixin_unionid = String(this.userData.weixin_unionid);
          if (
            this.userData.weixin_unionid === 'null' ||
            this.userData.weixin_unionid === '' ||
            this.userData.weixin_unionid === 'undefined'
          ) {
            this.userData.weixin_unionid = '';
          }
          // console.log(String(this.userData.weixin_unionid));
          localStorage.setItem('userInfoVo', JSON.stringify(res.data));
          this.$store.commit('SET_USER_ID', res.data.userId);
        }
        // this.userData = res.data;
      });
      Message.unread({
        userId: uid
      }).then((res) => {
        // console.log(res);
        if (res.code !== 0) {
          this.freemessage = 0;
        }
        this.freemessage = res.data;
      });
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
    statLoad('h5_personnlcenter', 'personnlcenter');
  },
  methods: {
    exit() {
      // console.log('推出');
      localStorage.removeItem('userInfoVo');
      this.$store.commit('SET_USER_ID', '');
      this.$router.push('/');
    },
    phoneStatusPage() {
      if (this.phoneStatus === 2) {
        statClick('h5_personnlcenter', 'bind_phone');
        this.$router.push('/bindPhoneView');
      } else if (this.phoneStatus === 1) {
        statClick('h5_personnlcenter', 'phone_manage');
        this.$router.push('/phonemanage');
      }
    },
    // http://192.168.100.122:9092/login/login/wxRedirect?redurl=bindWechat&uid=5e73246083c381012c8ea568&redirect_uri=https://baidu.com
    bindwechat() {
      statClick('h5_personnlcenter', 'bind_wechat');
      if (this.userData.weixin_unionid !== '') {
        return;
      }
      UserService.bindwechat({
        redurl: 'bindWechat',
        uid: this.userData.userId,
        redirect_uri: location.href
      }).then((res) => {
        // console.log(res);
      });
    }
  }
};
</script>
