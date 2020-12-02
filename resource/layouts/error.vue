<template>
  <div class="container">
    <img src="@/assets/images/error.jpg" alt="" />
    <p v-if="statusCode === 404" class="error-message">
      您访问的页面不存在
    </p>
    <p v-else class="error-message">应用发生错误异常: {{ message }}</p>
    <nuxt-link class="error-back" to="/">返回首页</nuxt-link>
  </div>
</template>

<script>
export default {
  props: ['error'],
  computed: {
    statusCode() {
      return (this.error && this.error.statusCode) || 500;
    },
    message() {
      return this.error.message || '';
    }
  },
  mounted() {
    document.body.style.backgroundColor = '#fff';
  },
  beforeRouteLeave(to, from, next) {
    document.body.style.backgroundColor = '';
    next();
  }
};
</script>

<style lang="less" scoped>
.container {
  padding: 100px 30px 50px;
  text-align: center;
}
.error-message {
  text-align: center;
  font-size: 16px;
  color: #666;
}
.error-back {
  display: inline-block;
  padding: 10px 18px;
  margin-top: 15px;
  color: #f25126;
  border: 1px solid #f25126;
  border-radius: 4px;
}
</style>
