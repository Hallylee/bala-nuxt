<template>
  <div>
    <header class="yq-detail-header other-header header-fix">
      <a
        class="btn-home"
        @click="publicapi.statClick('h5_feedback', 'back_top'), $router.go(-1)"
      ></a>
      <p class="header-title">留言反馈</p>
      <a class="refresh-link" style="display:none" @click="getnewmessage"
        >收取新消息</a
      >
    </header>
    <div class="yq-message-wrap">
      <div v-for="(item, index) in conatant" :key="index">
        <div v-if="item.identity == 1">
          <p class="message-time">{{ item.createTime }}</p>
          <div class="ask-item">
            <div class="pic-user">
              <img :src="item.headPicUrl" />
            </div>
            <div class="text-wrap">
              <div class="text-main">
                <p>{{ item.messageContent }}</p>
                <i class="arrow"></i>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="message-time">{{ item.createTime }}</p>
          <div class="answer-item">
            <div class="pic-user">
              <img src="@/assets/images/pic_server_90x90.jpg" />
            </div>
            <div class="text-wrap">
              <div class="text-main">
                <p>{{ item.messageContent }}</p>
                <i class="arrow"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- <p class="message-time">上午11:00</p>
      <div class="ask-item">
        <div class="pic-user">
          <img src="@/assets/upload/pic_user_120x120.jpg" />
        </div>
        <div class="text-wrap">
          <div class="text-main">
            <p>为什么我无法绑定手机号？</p>
            <i class="arrow"></i>
          </div>
        </div>
      </div>
      <p class="message-time">上午11:00</p>
      <div class="answer-item">
        <div class="pic-user">
          <img src="@/assets/images/pic_server_90x90.jpg" />
        </div>
        <div class="text-wrap">
          <div class="text-main">
            <p>您好，进入到个人中心页面，然后选择绑定手机号即可。</p>
            <i class="arrow"></i>
          </div>
        </div>
      </div> -->
    </div>
    <div class="message-bar">
      <div class="message-input-wrap">
        <input
          v-model="usercontant"
          class="inter-text"
          placeholder="请输入您想问的问题"
        />
      </div>
      <a class="btn-send-message" @click="save">发送</a>
    </div>
    <!-- toast 提示-->
    <div class="toast">
      <p>请输入正确的手机号与验证码</p>
    </div>
  </div>
</template>
<script>
import { Message } from '@/service';
import { showTime } from '@/common/util';
export default {
  data() {
    return {
      uid: '',
      userinfo: null,
      usercontant: '',
      conatant: []
    };
  },
  created() {
    if (typeof window !== 'undefined') {
      (localStorage.getItem('userInfoVo') &&
        (this.uid = JSON.parse(localStorage.getItem('userInfoVo')).userId)) ||
        (this.uid = this.$store.state.userId);
      Message.find({
        id: this.uid
      }).then((res) => {
        // console.log(res);
        this.conatant = res.data || [];
      });
    }
  },
  mounted() {
    this.userinfo = JSON.parse(localStorage.getItem('userInfoVo'));
    this.getnewmessage();
    this.publicapi.statLoad('h5_feedback', 'feedback');
  },
  methods: {
    getnewmessage() {
      this.publicapi.statClick('h5_feedback', 'check');
      Message.findNew({
        userId: this.uid
      }).then((res) => {
        // console.log(res);
        if (res.code === '404') {
          return;
        }
        this.conatant.concat(...res.data);
      });
    },
    save() {
      this.usercontant = this.usercontant.replace(/\s+/g, '');
      if (this.usercontant === '') {
        this.$toast({
          message: '不可以为空',
          duration: 1000
        });
        return;
      }
      this.publicapi.statClick('h5_feedback', 'send');
      this.conatant.push({
        createTime: showTime(new Date()),
        identity: '1',
        messageContent: this.usercontant,
        headPicUrl: this.userinfo.headimgurl
      });
      Message.save({
        userId: this.uid,
        nickName: this.userinfo.nickName,
        headimgurl: this.userinfo.headimgurl,
        content: this.usercontant
      }).then((res) => {
        this.usercontant = '';
        // console.log(res);
      });
    }
  }
};
</script>
