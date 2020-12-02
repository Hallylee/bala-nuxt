<template>
  <div class="interest-wrap">
    <div class="header-wrap">
      <h2 class="title-txt">兴趣圈</h2>
      <a class="view-more" @click="clickMore">全部</a>
    </div>
    <div v-if="list && list.length > 0" class="interest-scroll-wrap">
      <div class="interest-scroll">
        <div
          v-for="(item, i) in list"
          :key="i"
          class="scroll-item"
          @click="clickCircle(item)"
        >
          <a class="scroll-link">
            <img :src="basePic + item.pagePicId" />
            <p class="scroll-text">{{ item.title }}</p>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const basePic = process.env.BASE_PIC;
export default {
  props: {
    list: {
      type: Array
    }
  },
  data() {
    return {
      basePic
    };
  },
  methods: {
    clickCircle(item) {
      this.$emit('clickCircle', item);
    },
    clickMore() {
      this.$router.push('/qu');
    }
  }
};
</script>
