<template>
  <li id="video-flow" class="list-item">
    <a class="list-link" :href="item.url">
      <h4 class="list-title">
        {{ item && item.title }}
      </h4>
      <div class="list-con">
        <div class="text-con">
          <div class="video-content">
            <img
              class="video-content-cover"
              :src="item.cover_url"
              :alt="item.title"
            />
            <span class="video-content-duration">{{ item.duration }}</span>
            <img
              class="video-content-icon"
              src="@/assets/images/play.png"
              alt=""
            />
          </div>
          <div class="list-info-bar">
            <span class="time">
              {{ item.date }}
            </span>
            <div v-if="item.categoryName" class="article-label">
              <div class="label-list">
                <span class="ele">{{ item.categoryName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  </li>
</template>

<script>
const basePic = process.env.BASE_PIC;

export default {
  name: 'VideoFlowLayout',
  props: ['item'],
  data() {
    return {
      basePic
    };
  }
};
</script>

<style lang="less" scoped>
.video-content {
  width: 100%;
  height: 164px;
  margin-top: 2px;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 5px;
  position: relative;

  &-cover {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  &-duration {
    box-sizing: border-box;
    min-width: 43px;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 2px;
    font-size: 12px;
    line-height: 1;
    text-align: center;
    color: #fff;
    position: absolute;
    right: 10px;
    bottom: 10px;
  }
  &-icon {
    width: 45px;
    height: 45px;
    .transform-2d(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
  }
}
</style>
