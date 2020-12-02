<template>
  <div>
    <commonBack
      :has-menu="false"
      :func="() => {}"
      page-type="h5_amend_phone"
      desc="back_top"
    />
    <div class="yq-login-main">
      <div class="binding-text">
        <p>已绑定手机号</p>
        <p class="phone-num">{{ phone }}</p>
        <p class="tips-text">
          更换手机号后，下次登录可使用新手机号登录，解除手机号绑定会影响你登录，请谨慎操作
        </p>
      </div>
      <a
        class="btn-login"
        @click="
          publicapi.statClick('h5_bind_failure', 'unbind'),
            $router.push('/changePhoneView')
        "
        >确定更换</a
      >
      <a
        v-show="isShowunBind === 'true'"
        class="btn-relieve btn-relieve-no"
        @click="publicapi.statClick('h5_bind_failure', 'bind'), unbind()"
        >解除手机号绑定</a
      >
    </div>
    <div class="toast">
      <p>你的账号暂时无法进行此项操作，联系客服进入 个人中心-留言反馈</p>
    </div>
    <!--解除手机号绑定 提示 -->
    <div class="dialog-exit dialog-info" style="display: none;">
      <div class="dialog-inter">
        <p class="info-text">
          解除手机号绑定，账号相关数据将被清空无法找回，确认解绑吗？
        </p>
      </div>
      <div class="dialog-footer">
        <a class="btn-cancel">取消</a>
        <a class="btn-sure">确定</a>
      </div>
    </div>
    <!-- 遮罩层 -->
    <div class="m-mask" style="display: none;"></div>
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
      phone: '',
      isShowunBind: false
    };
  },
  mounted() {
    document.body.style.backgroundColor = '#fff';
    const userinfo = JSON.parse(localStorage.getItem('userInfoVo'));
    this.isShowunBind =
      String(userinfo.weixin_unionid) === 'null' ||
      String(userinfo.weixin_unionid) === '' ||
      String(userinfo.weixin_unionid) === 'undefined'
        ? 'false'
        : 'true';
    this.phone = userinfo.mobileAccount;
  },
  beforeRouteLeave(to, from, next) {
    document.body.style.backgroundColor = '';
    next();
  },
  methods: {
    unbind() {
      UserService.unbindphone({
        uid: this.$store.state.userId
      }).then((res) => {
        // console.log(res);
        this.$router.push('/ucenter');
      });
    }
  }
};
</script>
