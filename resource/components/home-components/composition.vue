<template>
  <div class="composition">
    <div v-if="showList && showList.length && showList.length">
      <div
        class="composition-template"
        v-for="(item, index) in showList"
        :key="index"
      >
        <a class="composition-wrap" :href="generateURL(item)">
          <div class="composition-title">
            {{ item.title }}
          </div>
          <div class="composition-contant">
            {{ item.content.slice(0, 80) }}
          </div>
          <div class="composition-label">
            <!-- <span v-for="(item, index) in item.label" :key="index">{{
              item.name
            }}</span> -->
            <span>{{ item.categoryName }}</span>
            <span>{{ item.genres }}</span>
          </div>
        </a>
      </div>
    </div>
    <!-- 无数据 -->
    <div v-if="!showList.length" class="list-none">
      <p>暂无内容</p>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    showList: {
      type: Array
    },
    func: {
      type: Function
    }
  },
  data() {
    return {
      lastNumber: 0,
      arrEnd: 0,
      finished: false
    };
  },
  mounted() {
    console.log(this.showList);
    window.addEventListener('scroll', this.handleScroll);
    const windowHeight = window.innerHeight || document.body.clientHeight;
    this.arrEnd = parseInt(windowHeight / 124);
    this.showList &&
      this.showList.length > 0 &&
      this.showList.slice(0, this.arrEnd).forEach((item) => {
        // h5_composition_detail*load*composition_item
        this.publicapi.statLoad('h5_icomposition', 'composition_item');
      });
  },
  methods: {
    handleScroll() {
      // const bodyHeight = document.body.scrollHeight;
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const windowHeight = window.innerHeight || document.body.clientHeight;
      // console.log(bodyHeight, scrollTop, windowHeight);
      if (this.arrEnd < parseInt((scrollTop + windowHeight) / 124)) {
        this.showList
          .slice(this.arrEnd, parseInt((scrollTop + windowHeight) / 124))
          .forEach((item) => {
            console.log(parseInt(scrollTop - this.lastNumber / 124));
            this.publicapi.statLoad('h5_icomposition', 'composition_item');
          });
        this.arrEnd = parseInt((scrollTop + windowHeight) / 124);
        this.lastNumber = scrollTop;
      }
    },
    // 根据channelSources生成跳转链接
    generateURL(i) {
      console.log(i.categoryId, i.id);
      return `/z${i.categoryId}/${i.id}`;
    }
  }
};
</script>
<style lang="less" scoped>
.composition {
  background: #fff;
}
.composition-template {
  // overflow: hidden;
  width: 92%;
  min-height: 124px;
  background: #fff;
  margin: 0 auto 0;
  border-bottom: 1px solid #f6f6f6;
  .composition-wrap {
    width: 100%;
    margin: 0 auto 0;
    // border-bottom: 1px solid #f6f6f6;
    .composition-title {
      padding-top: 15px;
      font-size: 18px;
      color: #333;
      // width: 100%;
      // overflow: hidden;
      // text-overflow: ellipsis;
    }
    .composition-contant {
      margin: 8px 0 15px 0;
      font-size: 12px;
      color: #777;
      width: 100%;
      height: 32px;
      line-height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .composition-label {
      padding-bottom: 15px;
      > span {
        min-width: 51px;
        height: 18px;
        border-radius: 50px;
        border: 1px solid #7cb6f7;
        padding: 2px 8px 2px 8px;
        font-size: 12px;
        margin-right: 5px;
        text-align: center;
        color: #81b9f7;
      }
    }
  }
}
</style>
