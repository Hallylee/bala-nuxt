<template>
  <div id="composition-detail">
    <!-- 详情页主体内容 start -->
    <div class="yq-article-wrap">
      <h1 class="article-title">
        {{ detail.title }}
      </h1>

      <div class="yq-user-bar">
        <!-- 超过7天 显示2020-01-01 格式，7天内显示 'N天内' -->
        <span class="composition-name">{{ detail.userName }}</span>
        <span v-if="detail.contentNum" class="composition-words">
          {{ detail.contentNum }}字
        </span>
      </div>

      <div
        class="article-text"
        :class="{
          'z-height': type === 'z' && showMore,
          'article-p': type === 'z'
        }"
        :style="{ height: Zheight }"
        v-html="detail.content"
      ></div>

      <div
        class="composition-make-more"
        @click="(showMore = !showMore), (Zheight = '100%')"
        v-show="showMore"
      >
        <div
          class="composition-make-down"
          style="background-size: contain;"
        ></div>
        <div class="composition-make-text">点击展开全部</div>
      </div>

      <div
        v-if="detail && detail.categoryVo && detail.categoryVo.categoryName"
        class="article-label"
      >
        <span class="title">文章分类：</span>
        <div class="label-list">
          <span class="ele">
            {{ detail.categoryVo.categoryName }}
          </span>
        </div>
      </div>

      <div class="composition-label" style="padding-top: 10px;">
        <span class="composition-title">相关分类：</span>
        <div class="composition-label-list">
          <span class="composition-cele">
            {{ detail.categoryName }}
          </span>
          <span class="composition-cele">{{ detail.genres }}</span>
        </div>
      </div>
    </div>
    <!-- 详情页主体内容 end -->
    <!-- 推荐精选 -->
    <div class="composition-selection">
      <div class="composition-selection-head">
        <h2 class="title">推荐精选</h2>
        <div class="change-button" @click="changeBackData">换一换</div>
      </div>
      <div
        v-for="(item, index) in compositionList.slice(start, end)"
        :key="index"
        class="composition-selection-list-wrap"
        :class="{
          hasborder: index % 2 == 0 && index != 0
        }"
        @click="clickItem(item)"
      >
        <a
          :href="item.url"
          class="composition-selection-list"
          :class="{
            fisrtdiv: index == 0,
            lastdiv: index == 3
          }"
        >
          <div>{{ item.title }}</div>
          <div>{{ item.tag }}</div>
        </a>
      </div>
    </div>
    <!-- 推荐精选 end-->
    <!-- 推荐阅读模块  start-->
    <div class="composition-read">
      <h2 class="title">推荐阅读</h2>

      <ul
        v-if="recommendList && recommendList.length"
        id="recommendList"
        class="composition-yq-list"
      >
        <li
          v-for="(item, index) in recommendList"
          :key="index"
          ref="list-item"
          class="composition-list-item"
          data-load="0"
          :data-item="item.category_id"
          :data-type="item._typs"
          :data-itemid="item.item_id"
          :data-context="item.context"
          :data-sceneId="item.sceneId"
          :data-materialId="item.materialId"
          @click="clickItem(item)"
        >
          <a
            v-if="item._typs === 'videoList'"
            class="composition-list-link"
            :href="item.url + '?f=cdrqalist'"
          >
            <div
              class="composition-list-con"
              :class="{ 'list-no-img': !item.item_id }"
            >
              <div class="composition-videoList-img">
                <img :src="item.cover_url" class="img-box" />
                <span class="composition-videoList-during">{{
                  (item.mediaDuration / 60).toFixed(2).replace(/\./g, ':')
                }}</span>
              </div>
              <div class="composition-text-con">
                <h4 class="composition-list-title">{{ item.title }}</h4>
                <!-- <p class="text">{{ item.content }}</p> -->
                <p class="composition-text">
                  {{ item.extra3 }}
                </p>
              </div>
            </div>
          </a>

          <a
            class="composition-list-link"
            :href="item.url + '?f=cdrqalist'"
            v-if="item._typs === 'articleList'"
          >
            <div
              class="composition-list-con"
              :class="{ 'list-no-img': !item.item_id }"
            >
              <div class="composition-img-wrap">
                <img :src="item.cover_url" class="img-box" />
              </div>
              <div class="composition-text-con">
                <h4 class="composition-list-title">{{ item.title }}</h4>
                <p class="composition-text">{{ item.extra3 }}</p>
              </div>
            </div>
          </a>
        </li>
      </ul>
    </div>
    <!-- <a class="composition-bottom" href="https://m.bala.iask.sina.com.cn/">
      <span>去首页 </span>
      <span>查看更多热门内容</span>
    </a> -->
  </div>
</template>

<script>
import { DetailService } from '@/service';
import { statLoad, statClick } from '@/common/stat';
import { formatFullTime } from '@/common/util';

const basePic = process.env.BASE_PIC;

export default {
  name: 'CompositionDetail',
  props: {
    type: {
      type: String,
      default: 'b'
    },
    detail: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      basePic,
      tempRecommendList: [],
      recommendList: [],
      lastnumRecommend: 10,
      upmovenum: 0,
      loadTotal: 0,
      Zheight: '100%',
      showMore: false,
      isfirst: true,
      start: 0,
      end: 4,
      compositionList: ''
    };
  },
  mounted() {
    this.addScrollListener();
    this.getFourthListfunc();
    const contant = document.querySelector('.article-p').offsetHeight;
    const clientHeight =
      document.documentElement.clientHeight || document.body.clientHeight;

    if (contant > clientHeight) {
      this.Zheight = `${clientHeight}px`;
      this.showMore = true;
    } else {
      this.Zheight = `${contant}px`;
      this.showMore = false;
    }
  },
  methods: {
    getFourthListfunc() {
      const _self = this;
      let fourthList;
      Promise.all([
        DetailService.getFourthList({
          userId: _self.$store.state.userId || _self.$store.state.deviceId,
          type: '11',
          channel: 'm'
        }),
        DetailService.getFourthList({
          userId: _self.$store.state.userId || _self.$store.state.deviceId,
          type: '12',
          channel: 'm'
        }),
        DetailService.getFourthList({
          userId: _self.$store.state.userId || _self.$store.state.deviceId,
          type: '13',
          channel: 'm'
        })
      ]).then((res) => {
        console.log(res[2]);
        fourthList = res;
        console.log(fourthList);
        const { data: videoList } = res[2];
        const { data: articleList } = res[1];
        const { data: compositionList } = res[0];
        console.log(articleList);
        _self.compositionList = compositionList || [];
        for (let i = 0; i < 5; i++) {
          // fourthList.compositionList &&
          //   fourthList.compositionList
          //     .slice(dictionaries[i]['0'], dictionaries[i]['1'])
          //     .map((item) => {
          //       item._typs = 'compositionList';
          //       _self.tempRecommendList.push(item);
          //     });
          videoList &&
            videoList.slice(i, i + 1).map((item) => {
              item._typs = 'videoList';
              console.log(item.extra4);
              item.mediaDuration =
                item.extra4 && JSON.parse(item.extra4).mediaDuration;
              _self.tempRecommendList.push(item);
            });

          articleList &&
            articleList.slice(i * 2, i * 2 + 2).map((item) => {
              item._typs = 'articleList';
              _self.tempRecommendList.push(item);
            });

          this.fourbur(_self.compositionList[i]);
        }
        _self.recommendList = _self.tempRecommendList.slice(0, 5);
      });
    },
    /** 点击第四范式推荐 */
    async clickItem(e) {
      const _self = this;

      statClick('h5_composition_detail', 'recommended_qa_item');
      const userId = _self.$store.state.userId;
      const deviceId = _self.$store.state.deviceId;
      const bilogparam = {
        date: formatFullTime(new Date()),
        actions: [
          {
            itemId: e.item_id,
            actionTime: new Date().getTime(),
            action: 'detailPageShow',
            requestId: 'appwxextend77629',
            itemSetId: e.materialId,
            sceneId: e.sceneId,
            userId: userId || deviceId,
            context: e.context
          }
        ]
      };
      // a8cf6dd20cce4b5ab7126f54ae2eb664
      await DetailService.disiBilog(
        'e524d4faff1f407984eb469df1bfd272',
        bilogparam
      );
    },
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll);
    },
    handleScroll() {
      const _self = this;
      const bodyHeight = document.body.scrollHeight;
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const windowHeight = window.innerHeight || document.body.clientHeight;
      if (bodyHeight - (windowHeight + scrollTop) < 200) {
        const parentNode = document.getElementById('recommendList');
        const loadList = parentNode.querySelectorAll('.composition-list-item');

        if (bodyHeight === windowHeight + scrollTop && _self.upmovenum !== 2) {
          _self.recommendList = _self.tempRecommendList.slice(
            0,
            _self.lastnumRecommend
          );
          _self.upmovenum++;
          _self.lastnumRecommend += 5;
        }

        if (loadList && loadList.legnth) {
          return;
        }

        loadList.forEach((i) => {
          const isLoad = i.dataset.load === '1';

          if (!isLoad) {
            const itemTop = i.getBoundingClientRect().top;
            if (itemTop < windowHeight) {
              _self.loadTotal = _self.loadTotal + 1;
              statLoad('h5_composition_detail', 'composition_item');
              const userId = _self.$store.state.userId;
              const bilogparam = {
                date: formatFullTime(new Date()),
                actions: [
                  {
                    itemId: i.dataset.itemid,
                    actionTime: new Date().getTime(),
                    action: 'show',
                    requestId: 'appwxextend77629',
                    itemSetId: i.dataset.materialid,
                    sceneId: i.dataset.sceneid,
                    userId: userId || _self.$store.state.deviceId,
                    deviceId: _self.$store.state.deviceId,
                    context: i.dataset.context
                  }
                ]
              };
              // a8cf6dd20cce4b5ab7126f54ae2eb664
              DetailService.disiBilog(
                'e524d4faff1f407984eb469df1bfd272',
                bilogparam
              ).then((res) => {});
              i.dataset.load = '1';
            }
          }
        });
      }
    },
    changeBackData(item) {
      if (this.end === 12) {
        this.getSelectionData();
        return;
      }
      this.start += 4;
      this.end += 4;
      this.compositionList.slice(this.start, this.end).map((item) => {
        this.fourbur(item);
      });
    },
    fourbur(item) {
      console.log(item);
      statLoad('h5_composition_detail', 'composition_item');
      const userId = this.$store.state.userId;
      const bilogparam = {
        date: formatFullTime(new Date()),
        actions: [
          {
            itemId: item.item_id,
            actionTime: new Date().getTime(),
            action: 'show',
            requestId: 'appwxextend77629',
            itemSetId: item.materialId,
            sceneId: item.sceneId,
            userId: userId || this.$store.state.deviceId,
            deviceId: this.$store.state.deviceId,
            context: item.context
          }
        ]
      };
      // a8cf6dd20cce4b5ab7126f54ae2eb664
      DetailService.disiBilog(
        'e524d4faff1f407984eb469df1bfd272',
        bilogparam
      ).then((res) => {});
    },
    getSelectionData() {
      DetailService.getFourthList({
        userId: this.$store.state.userId || this.$store.state.deviceId,
        type: '11',
        channel: 'm'
      }).then((res) => {
        this.compositionList = res.data;
        this.start = 0;
        this.end = 4;
        for (let j = 0; j < 5; j++) {
          this.fourbur(this.compositionList[j]);
        }
      });

      // this.start = 0;
      // this.end = 4;
    }
  }
};
</script>
<style lang="less" scoped>
.composition-selection {
  // width: 100%;
  border-top: 10px solid #f5f5f5;
  background: #fff;
  padding-top: 23px;
  padding-left: 15px;
  padding-right: 15px;
  .composition-selection-head {
    display: flex;
    justify-content: space-between;
    .title {
      font-size: 18px;
      font-family: PingFang SC Bold, PingFang SC Bold-Bold;
      text-align: left;
      color: #444444;
      line-height: 25px;
    }
    .change-button {
      font-size: 12px;
      font-family: PingFang SC Medium, PingFang SC Medium-Medium;
      font-weight: 500;
      text-align: left;
      color: #999999;
      display: flex;
      align-items: center;
      &::before {
        content: '';
        width: 12px;
        height: 12px;
        background: url(../../assets/images/change.png);
        background-size: contain;
        background-repeat: no-repeat;
        display: inline-block;
        position: relative;
        left: -10%;
      }
    }
  }

  .composition-selection-list-wrap {
    overflow: hidden;
  }
  .composition-selection-list {
    margin: 15px 0 15px 0;
    font-size: 17px;
    font-family: PingFang SC Medium, PingFang SC Medium-Medium;
    font-weight: 500;
    text-align: justifyLeft;
    color: #333333;
    display: flex;
    > div:nth-child(1) {
      max-width: 500px;
      height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    > div:nth-child(2) {
      width: 50px;
      height: 18px;
      overflow: hidden;
      background: #fff;
      border: 1px solid #8fc0fa;
      border-radius: 17px;
      font-size: 12px;
      font-family: PingFang SC Medium, PingFang SC Medium-Medium;
      font-weight: 500;
      text-align: justifyLeft;
      color: #7fb0f0;
      text-align: center;
      line-height: 17px;
      margin-left: 8px;
    }
  }
  .hasborder {
    border-top: 1px solid #f2f2f2;
  }
  .fisrtdiv {
    margin-top: 10px !important;
  }
  .lastdiv {
    margin-bottom: 21px !important;
  }
}
.composition-bottom {
  width: 100%;
  height: 63px;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  > span:nth-child(1) {
    font-family: PingFang SC Medium, PingFang SC Medium-Medium;
    font-weight: 500;
    text-align: left;
    color: #1a72cc;
  }
  > span:nth-child(2) {
    color: #666;
    margin-left: 10px;
  }
}
.composition-read {
  border-top: 10px solid #f5f5f5;
  background: #fff;
  padding: 13px 15px 0 15px;
  .title {
    font-size: 18px;
    font-family: PingFang SC Bold, PingFang SC Bold-Bold;
    text-align: left;
    color: #444444;
    line-height: 25px;
  }
  .composition-yq-list {
    .composition-list-item {
      .composition-list-link {
        .composition-list-con {
          display: flex;
          flex-flow: row-reverse;
          justify-content: space-between;
          border-bottom: 1px solid #f2f2f2;
          padding: 10px 0 10px 0;
          .composition-text-con {
            flex: 0.97;
          }
          .composition-list-title {
            width: 100%;
            max-height: 42px;
            font-size: 17px;
            font-family: PingFang SC Medium, PingFang SC Medium-Medium;
            text-align: left;
            line-height: 22px;
            color: #333333;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .composition-text {
            width: max-content;
            margin-top: 10px;
            padding: 2px 5px 2px 5px;
            // background: #dddddd;
            border: 1px solid #dddddd;
            border-radius: 6px;
          }
          .composition-videoList-img {
            position: relative;
            .composition-videoList-during {
              position: absolute;
              width: 45px;
              height: 16px;
              line-height: 16px;
              opacity: 0.6;
              background: #000000;
              border-radius: 4px;
              top: 65%;
              left: 43%;
              font-size: 10px;
              font-family: PingFang SC Medium, PingFang SC Medium-Medium;
              text-align: center;
              color: #fefefe;
              &::before {
                content: '';
                display: inline-block;
                width: 0;
                height: 0;
                border-top: 4px solid transparent;
                border-left: 6px solid #fff;
                border-bottom: 4px solid transparent;
                margin-right: 2px;
              }
            }
          }
        }
      }
    }
  }
  .img-box {
    width: 88px;
    height: 70px;
  }
}
</style>
