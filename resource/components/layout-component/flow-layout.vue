<template>
  <li class="list-interest">
    <a class="list-link" @click="handleClick(item)">
      <img :src="`${basePic}${item.pagePicId}`" />
      <div class="mask"></div>
      <div class="inter">
        <div class="pic-con">
          <img :src="`${basePic}${item.headPicId}`" />
        </div>
        <div class="inter-text-con">
          <div class="txt-head">
            <p class="name">{{ item.title }}</p>
            <p class="num">{{ item.articleNum || 0 }}篇问答</p>
          </div>
          <p v-if="item.introduce" class="inter-text">
            {{ item.introduce }}
          </p>
        </div>
      </div>
    </a>
  </li>
</template>

<script>
const basePic = process.env.BASE_PIC;

export default {
  props: ['item'],
  data() {
    return {
      basePic
    };
  },
  methods: {
    handleClick(item) {
      this.$router.push(`/q/${item.id}`);
    }
  }
};
</script>

<style lang="less" scoped>
.list-interest {
  margin: 5px 0;
  background-color: #fff;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  height: 28vw;
  z-index: 5;

  .mask {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 2;
  }
  .inter {
    position: absolute;
    width: 100%;
    z-index: 4;
    left: 0;
    top: 50%;
    .transform-2d(0, -50%);
    padding: 0 15px;
    .box-sizing();
    overflow: hidden;
  }
  .pic-con {
    width: 60px;
    height: 60px;
    float: left;
    margin-right: 10px;
    border-radius: 60px;
    overflow: hidden;
  }
  .inter-text-con {
    overflow: hidden;
  }
  .txt-head {
    height: 20px;
    .flex();
    .align-items-center();
    .justify-flex-justify();
  }
  .name {
    font-size: 18px;
    color: #fff;
  }
  .num {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
  .inter-text {
    font-size: 12px;
    line-height: 18px;
    height: 36px;
    .text-overflow();
    color: rgba(255, 255, 255, 0.8);
    margin-top: 6px;
  }
}
</style>
