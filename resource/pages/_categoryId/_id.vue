<template>
  <div id="detail" class="detail">
    <div v-if="where == 'm'">
      <common-header
        :share="foot !== 'sjx'"
        back
        border
        :pageType="type === 'z' ? 'h5_composition_detail' : ''"
        :desc="type === 'z' ? 'back_top' : ''"
        :shareDesc="type === 'z' ? 'share' : ''"
      ></common-header>

      <normal-detail
        v-if="type === 'b'"
        :type="type"
        :detail="detail"
        :watching="watching"
      />

      <quick-detail
        v-if="type === 'k'"
        :type="type"
        :foot="foot"
        :detail="detail"
        :watching="watching"
        :showShare="showShare"
      />

      <composition-detail v-if="type === 'z'" :type="type" :detail="detail" />
    </div>
    <div v-else class="pc-bg-re">
      <div class="pc-bg-wrap">
        <div class="pc-wrap">
          <div class="pc-float">
            <div class="pc-logo">
              <div></div>
              <div>爱问扒拉扒拉</div>
              <div>用有趣的方式获得新知</div>
            </div>
            <div class="pc-qr-code">
              <div></div>
              <div>扫一扫 访问小程序</div>
            </div>
          </div>
          <common-header
            :share="false"
            :pageType="type === 'z' ? 'h5_composition_detail' : ''"
            :desc="type === 'z' ? 'back_top' : ''"
            :shareDesc="type === 'z' ? 'share' : ''"
          ></common-header>

          <div class="pc-line"></div>

          <normal-detail-pc
            v-if="type === 'b'"
            :type="type"
            :detail="detail"
            :watching="watching"
          />

          <quick-detail-pc
            v-if="type === 'k'"
            :type="type"
            :foot="foot"
            :detail="detail"
            :watching="watching"
            :showShare="showShare"
          />

          <composition-detail-pc
            v-if="type === 'z'"
            :type="type"
            :detail="detail"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { statLoad, statClick } from '@/common/stat';
import { DetailService } from '@/service';
import {
  removeHTMLTag,
  generateUUID,
  formatTimeYYYYMMDD,
  showTime
} from '@/common/util';
import { baseEncode } from '@/common/base64';
import getDetailType from '@/common/getDetailType';
import NormalDetail from '@/components/detail/normal-detail';
import QuickDetail from '@/components/detail/quick-detail';
import CompositionDetail from '@/components/detail/composition-detail';

import NormalDetailPc from '@/components/detail-pc/normal-detail';
import QuickDetailPc from '@/components/detail-pc/quick-detail';
import CompositionDetailPc from '@/components/detail-pc/composition-detail';

const basePic = process.env.BASE_PIC;

export default {
  validate({ params }) {
    const b = /^b([0-9]+)$/.test(params.categoryId);
    const k = /^k([0-9]+)$/.test(params.categoryId);
    const kjx = /^k([0-9]+)_([0-9a-zA-Z]+)$/.test(params.categoryId);
    const z = /^z([0-9]+)|([0-9]+)_([0-9a-zA-Z]+)$/.test(params.categoryId);

    return b || k || kjx || z;
  },
  components: {
    NormalDetail,
    QuickDetail,
    CompositionDetail,
    NormalDetailPc,
    QuickDetailPc,
    CompositionDetailPc
  },
  async asyncData({ params, store, error, req }) {
    let showShare = false;
    const refererHost =
      process.server && req.headers.referer
        ? req.headers.referer.replace(/https?:\/\//gi, '').split('/')[0]
        : '';

    if (refererHost && refererHost.includes('m.bala')) {
      showShare = false;
    } else {
      showShare = true;
    }
    const head = params.categoryId[0];
    const foot = params.categoryId.split('_')[1];
    const categoryId = params.categoryId
      .split('_')[0]
      .replace(/[a-zA-Z]/gi, '');
    const id = params.id.replace('.html', '');

    const getDetailMethod =
      head === 'b'
        ? 'getQuestDetail'
        : head === 'z'
        ? 'getComposition'
        : foot
        ? 'getGoodQuickDetail'
        : 'getQuickDetail';

    try {
      // if (head === 'z') {
      //   const temId = id;
      //   id = {
      //     id: temId
      //   };
      // }
      let tempresult;
      const temId = id;
      if (head === 'z') {
        tempresult = await DetailService[getDetailMethod]({
          id: temId
        });
        // result = result
      } else {
        tempresult = await DetailService[getDetailMethod](id);
      }
      const { data: result } = tempresult;

      if (!result || !result.id) {
        const err = new Error('内容不存在');
        err.code = 404;
        throw err;
      }

      const type = getDetailType(result.channelSources);

      if (type.head !== head) {
        const err = new Error('内容不存在');
        err.code = 404;
        throw err;
      }
      // 判断分类是否正确
      if (!result || result.categoryId !== categoryId) {
        if (!result.categoryVo) {
          const err = new Error('内容不存在');
          err.code = 404;
          throw err;
        }
        if (
          result.categoryVo &&
          result.categoryVo.parentCategoryId &&
          result.categoryVo.parentCategoryId !== categoryId
        ) {
          const err = new Error('内容不存在');
          err.code = 404;
          throw err;
        }
      }
      // 处理显示时间
      if (result.postDate && result.postDate.includes('-')) {
        result.postDateName = showTime(
          new Date(result.postDate.replace(/-/g, '/'))
        );
      } else {
        result.postDateName = result.postDate;
      }

      if (head === 'b') {
        try {
          const deviceNo = store.state.deviceId;
          const userId = store.state.userId;
          const { data: recommend } = await DetailService.getRecommend({
            deviceNo,
            userId,
            cid: categoryId,
            situationId: id
          });

          if (!recommend) {
            return {
              type: head,
              detail: result,
              showShare
            };
          }

          let watching = null;

          if (recommend.watchList && recommend.watchList.length) {
            watching = recommend.watchList[0];
            watching.content = removeHTMLTag(watching.content).slice(0, 30);
          }

          return {
            type: head,
            detail: result,
            showShare,
            watching
          };
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          const deviceNo = store.state.deviceId;
          const userId = store.state.userId;
          const { data: quickResult } = await DetailService.getQuickRecommend({
            deviceNo,
            userId,
            cid: categoryId,
            situationId: id
          });

          if (!quickResult) {
            return {
              foot,
              type: head,
              detail: result,
              watching: null,
              showShare
            };
          }

          let watching = null;

          if (quickResult.watchList && quickResult.watchList.length) {
            watching = quickResult.watchList[0];
            watching.content = removeHTMLTag(watching.content).slice(0, 30);
          }

          return {
            foot,
            type: head,
            detail: result,
            watching,
            showShare
          };
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      error({ statusCode: Number(err.code), message: err.message });
    }
  },
  data() {
    return {
      shareMaskFlag: false,
      type: 'b',
      foot: '',
      detail: {},
      basePic,
      watching: {},
      where: 'm'
    };
  },
  mounted() {
    // 长问答处理
    if (this.type === 'b') {
      statLoad('h5_qa_detail', 'exposure_h5_qa_detail');
    }
    // 快答处理
    if (this.type === 'k') {
      if (this.foot === 'sjx') {
        statLoad('h5_kd_sjx_detail', 'kd_sjx_detai');
      } else {
        statLoad('h5_kd_detail', 'kd_detai');
      }
    }
    // 作文处理
    if (this.type === 'z') {
      statLoad('h5_composition_detail', 'composition_detai');
    }

    if (this.type !== 'z') {
      this.bilog();
    }
  },
  created() {
    if (typeof window !== 'undefined') {
      this.where = /Android|webOS|iPhone|iPod|BlackBerry/i.test(
        navigator.userAgent
      )
        ? 'm'
        : 'c';
    }
  },
  methods: {
    whereIsfrom(value) {
      // value = 'www.iask.sina.com.cn';
      if (!value) {
        return '8';
      }
      // so: 'so.com',
      // baidu: 'baidu.com',
      // sogou: 'sogou.com',
      // sm: 'sm.cn',
      // bala: 'bala.iask.sina.com.cn',
      // iask: 'iask.sina.com.cn'
      const arr = {
        '360': '2',
        baidu: '1',
        sogou: '3',
        sm: '4',
        bala: '10',
        toutiao: '6',
        google: '5'
        // iask: 'iask.sina.com.cn'
      };
      for (const key in arr) {
        if (value[0].includes(key)) {
          return arr[key];
        }
      }
      return '7';
    },
    // 数据中心埋点动作
    async bilog() {
      const _self = this;
      const prePageName = '';
      const preUrl = document.referrer;
      const referer = /(\w+\.)+(\w+)/.exec(preUrl);
      // so.com baidu.com sogou.com sm.cn
      const data = {
        eventType: 'page', // 事件类型
        eventID: 'SE001', // 事件编号
        eventName: 'queryDetailView', // 事件英文名字
        eventTime: Date.now(), // 事件触发时间戳（毫秒）
        reportTime: Date.now(), // 上报时间戳（毫秒）
        sdkVersion: 'v1.0.0', // 埋点sdk版本
        terminalType: '1', // 软件终端类型
        loginStatus: _self.$store.state.userId ? 1 : 0, // 登录状态
        visitID: _self.$store.state.visitId, // 访客ID
        userID: _self.$store.state.userId || '', // 用户ID
        sessionID: generateUUID(), // 会话ID
        productName: 'iask-bala', // 产品名称
        productCode: '0', // 产品代码
        productVer: 'v1.1.5', // 产品版本
        prePageID: '', // 上一个页面编号
        prePageName, // 上一个页面的名称
        prePageURL: preUrl, // 上一个页面URL
        pageID: _self.type === 'b' ? 'M-B-QD-N' : 'M-B-QD-K', // 当前页面编号
        pageName: _self.type === 'b' ? '长问答详情页' : '短问答详情页', // 当前页面的名称
        pageURL: window.location.href, // 当前页面URL
        deviceID: _self.$store.state.deviceId, // 设备号
        deviceBrand: '', // 移动设备品牌（厂商）
        deviceModel: '', // 移动设备机型型号
        deviceLanguage: '', // 设备语言
        osType: '', // 操作系统类型
        osVer: '', // 操作系统版本
        resolution: '', // 设备屏幕分辨率
        moduleID: '',
        moduleName: '',
        domID: '',
        domName: '',
        domURL: '',
        ip: '',
        location: '',
        mac: '',
        networkType: '',
        networkProvider: '',
        browserVer: '',
        appChannel: '',
        var: {
          queryID: _self.detail.id, // 问题ID
          topLevelChannelID:
            (_self.detail.categoryVo &&
              _self.detail.categoryVo.parentCategoryId) ||
            _self.detail.categoryId, // 频道一级分类ID
          secondLevelChannelID:
            _self.detail.categoryVo && _self.detail.categoryVo.parentCategoryId
              ? _self.detail.categoryId
              : '', // 频道二级分类ID
          publishDate: _self.detail.postDate, // 问题发布日期
          groupName: _self.detail.projectName || '', // 问题生产的项目-中文
          productSupplyPipeline: _self.detail.channelSources, // 问题生产的问题渠道-英文
          pageType: _self.type === 'b' ? 'depth' : 'widthKd', // 页面的类型,
          title: _self.detail.title,
          referer: this.whereIsfrom(referer),
          oldAuthorID: this.type === 'k' ? '' : _self.detail.serviceId
        }
      };
      console.log(_self.detail);
      console.log(data);
      try {
        await DetailService.bilog(baseEncode(JSON.stringify(data)));
      } catch (err) {}
    },
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll);
    },
    handleScroll() {
      const bodyHeight = document.body.scrollHeight;
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const windowHeight = window.innerHeight || document.body.clientHeight;

      if (bodyHeight - (windowHeight + scrollTop) < 200) {
        window._showAdvertising();
        const parentNode = document.getElementById('recommendList');
        const loadList = parentNode.querySelectorAll('.list-item');
        if (
          bodyHeight === windowHeight + scrollTop &&
          this.upmovenum !== 2 &&
          this.type === 'z'
        ) {
          this.recommendList = this.temprecommendList.slice(
            0,
            this.lastnumRecommend
          );
          this.upmovenum++;
          this.lastnumRecommend += 5;
        }
        if (loadList && loadList.legnth) {
          return;
        }

        loadList.forEach((i) => {
          const isLoad = i.dataset.load === '1';
          const isDisiLoad = i.dataset.disi === '1';
          // // 判断是否已经曝光
          // if (isLoad) {
          // return;
          // }
          // if (!i.dataset.context) {
          //   return;
          // }
          if (!isLoad) {
            const itemTop = i.getBoundingClientRect().top;
            if (itemTop < windowHeight) {
              this.loadTotal = this.loadTotal + 1;
              i.dataset.load = '1';

              if (this.type === 'b') {
                statLoad(
                  'h5_qa_detail',
                  'exposure_h5_qa_detail_recommended_qa_item'
                );
              } else if (this.type === 'z') {
                statLoad('h5_composition_detail', 'composition_item');
              } else if (this.type === 'k') {
                statLoad('h5_kd_detail', 'recommended_qa_item');
              }
            }
          }
          if (!isDisiLoad && this.type === 'k') {
            const userId =
              localStorage.getItem('userInfoVo') &&
              JSON.parse(localStorage.getItem('userInfoVo')).userId;
            const scene = this.foot ? '77632' : '76321';
            const bilogparam = {
              date: formatTimeYYYYMMDD(new Date()),
              actions: [
                {
                  itemId: i.dataset.itemid,
                  actionTime: new Date().getTime(),
                  action: 'show',
                  requestId: 'appwxextend77629',
                  itemSetId: '69206',
                  sceneId: scene,
                  userId: userId || this.$store.state.deviceId,
                  deviceId: this.$store.state.deviceId,
                  context: i.dataset.context
                }
              ]
            };
            // a8cf6dd20cce4b5ab7126f54ae2eb664
            DetailService.disiBilog(
              'e524d4faff1f407984eb469df1bfd272',
              bilogparam
            ).then((res) => {});
            i.dataset.disi = '1';
          }
          if (!isDisiLoad && this.type === 'z') {
            const userId =
              localStorage.getItem('userInfoVo') &&
              JSON.parse(localStorage.getItem('userInfoVo')).userId;
            const bilogparam = {
              date: formatTimeYYYYMMDD(new Date()),
              actions: [
                {
                  itemId: i.dataset.itemid,
                  actionTime: new Date().getTime(),
                  action: 'show',
                  requestId: 'appwxextend77629',
                  itemSetId:
                    i.dataset.type === 'articleList'
                      ? '71216'
                      : i.dataset.type === 'videoList'
                      ? '71215'
                      : i.dataset.type === 'compositionList'
                      ? '69206'
                      : '',
                  sceneId:
                    i.dataset.type === 'articleList'
                      ? '78465'
                      : i.dataset.type === 'videoList'
                      ? '78464'
                      : i.dataset.type === 'compositionList'
                      ? '78467'
                      : '',
                  userId: userId || this.$store.state.deviceId,
                  deviceId: this.$store.state.deviceId,
                  context: i.dataset.context
                }
              ]
            };
            // a8cf6dd20cce4b5ab7126f54ae2eb664
            DetailService.disiBilog(
              'e524d4faff1f407984eb469df1bfd272',
              bilogparam
            ).then(() => {});
            i.dataset.disi = '1';
          }
        });
      }
    },
    /** 点击第四范式推荐 */
    async clickItem(e, item) {
      const _self = this;

      if (_self.type === 'b') {
        statClick('h5_qa_detail', 'recommended_qa_item');
      } else if (_self.type === 'k') {
        statClick('h5_kd_detail', 'recommended_qa_item');

        const i = e.target.parentNode;
        const userId = _self.$store.state.userId;
        const deviceId = _self.$store.state.deviceId;
        const scene = _self.foot ? '77632' : '76321';
        const bilogparam = {
          date: formatTimeYYYYMMDD(new Date()),
          actions: [
            {
              itemId: i.dataset.itemid,
              actionTime: new Date().getTime(),
              action: 'detailPageShow',
              requestId: 'appwxextend77629',
              itemSetId: '69206',
              sceneId: scene,
              userId: userId || deviceId,
              context: i.dataset.context
            }
          ]
        };
        // a8cf6dd20cce4b5ab7126f54ae2eb664
        await DetailService.disiBilog(
          'e524d4faff1f407984eb469df1bfd272',
          bilogparam
        );
      } else if (_self.type === 'z') {
        statClick('h5_composition_detail', 'recommended_qa_item');
        const userId = _self.$store.state.userId;
        const deviceId = _self.$store.state.deviceId;
        const bilogparam = {
          date: formatTimeYYYYMMDD(new Date()),
          actions: [
            {
              itemId: e.item_id,
              actionTime: new Date().getTime(),
              action: 'detailPageShow',
              requestId: 'appwxextend77629',
              itemSetId:
                e._typs === 'articleList'
                  ? '71216'
                  : e._typs === 'videoList'
                  ? '71215'
                  : e._typs === 'compositionList'
                  ? '69206'
                  : '',
              sceneId:
                e._typs === 'articleList'
                  ? '78465'
                  : e._typs === 'videoList'
                  ? '78464'
                  : e._typs === 'compositionList'
                  ? '78467'
                  : '',
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
      }
    }
  },
  head() {
    const _self = this;

    return {
      title: `${_self.detail.title}-扒拉扒拉`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: `${removeHTMLTag(_self.detail.content).slice(0, 100)}...`
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: _self.detail.title
        }
      ]
    };
  }
};
</script>

<style lang="less">
#detail {
  padding-bottom: 0;
}
#detail.hide-bottom {
  padding-bottom: 81px;
}
.detail {
  .kpage {
    padding: 0 !important;
  }
  .quick-bottom-fix {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    padding: 18px 15px;
    z-index: 50;

    .btn-share {
      height: 45px;
      border-radius: 45px;
      border: 1px solid #fd4c5b;
      .box-sizing();
      .flex();
      .align-items-center();
      .justify-flex-center();
      font-size: 16px;
      color: #fd4c5b;
      &:before {
        width: 17px;
        height: 17px;
        background-image: url('../../assets/images/icon_yq_share_34x34.png');
        background-size: 17px 17px;
        margin-right: 7px;
        content: '';
      }
    }
    .btn-home-con {
      position: relative;
      width: 56vw;
      .home-tips {
        padding: 0 10px 0 30px;
        position: absolute;
        left: 50%;
        .transform-2d(-50%, 0);
        bottom: 52px;
        height: 30px;
        line-height: 30px;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0px 1.5px 3px 0.5px rgba(0, 0, 0, 0.08);
        font-size: 12px;
        color: #fd4c5b;
        white-space: nowrap;
        &:after {
          width: 200%;
          height: 200%;
          position: absolute;
          left: 0;
          top: 0;
          border: 1px solid #e9e9e9;
          border-radius: 10px;
          .box-sizing();
          .transform-scale(0.5, 0.5);
          .transform-origin(left, top);
          z-index: 1;
          content: '';
        }
        .arrow,
        &:before {
          .arrow-top(5px, #e9e9e9);
          position: absolute;
          z-index: 2;
          left: 50%;
          margin-left: -5px;
          bottom: -10px;
          content: '';
        }
        .arrow {
          border-top-color: #fff;
          bottom: -9px;
          z-index: 3;
        }
        .icon-finger {
          width: 21px;
          .center(known-y, 24.5px);
          display: block;
          left: 10px;
          // background-image: url('../../assets/images/icon_finger.gif');
          background-size: 21px 24.5px;
        }
      }
    }
    .btn-home {
      // width: 65%;
      // margin: 0 auto;
      // height: 45px;
      // border-radius: 45px;
      // background-color: #fd4c5b;
      // .flex();
      // .align-items-center();
      // .justify-flex-center();
      // font-size: 16px;
      // color: #fff;
      // position: relative;

      // &:before {
      //   width: 17px;
      //   height: 17px;
      //   background-image: url('../../assets/images/icon_yq_home_white.png');
      //   background-size: 17px 17px;
      //   margin-right: 7px;
      //   content: '';
      // }
      width: 111px;
      height: 40px;
      background: #fb4c5b;
      position: fixed;
      bottom: 42px;
      border-radius: 50px;
      color: #ffffff;
      text-align: center;
      line-height: 40px;
      left: 50%;
      margin-left: -55px;
    }

    .two-btn-con {
      .flex();
      .justify-flex-justify();
      .btn-share {
        width: 33.333vw;
      }
    }
  }
  .article-pic {
    display: block;
    width: 100%;
    margin: 15px 0;
  }
  .z-height {
    overflow: hidden;
  }
  .composition-name {
    font-size: 12px;
    font-family: PingFang SC Medium, PingFang SC Medium-Medium;
    font-weight: 500;
    color: #666666;
  }
  .composition-words {
    font-size: 12px;
    font-family: PingFang SC Medium, PingFang SC Medium-Medium;
    font-weight: 500;
    text-align: left;
    color: #666666;
    margin-left: 20px;
    position: relative;
    &::before {
      content: '';
      width: 1px; /*no */
      height: 11px;
      background: #d6d6d6;
      display: inline-block;
      position: absolute;
      top: 32%;
      left: -28%;
    }
  }
  .composition-make-more {
    width: 100%;
    height: 106px;
    background: url(../../assets/upload/click-more-back.png);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    margin-top: -50px;
    position: relative;
    display: flex;
    text-align: center;
    flex-direction: column;
    // align-items: flex-end;
    .composition-make-down {
      width: 20px;
      height: 20px;
      background-size: contain;
      background: url(../../assets/upload/down.png);
      margin: 0 auto 0;
      margin-top: 50px;
    }
    .composition-make-text {
      font-size: 14px;
      font-family: PingFang SC Medium, PingFang SC Medium-Medium;
      font-weight: 500;
      text-align: center;
      color: #666666;
      margin: 0 auto 0;
    }
  }
  .composition-label {
    height: 20px;
    line-height: 20px;
    overflow: hidden;
    font-size: 12px;
    // margin-top: 15px;
    padding-top: 8px;
    .composition-title {
      float: left;
      color: #999999;
    }
    .composition-cele {
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
  .composition-wrap {
    width: 100%;
    margin: 0 auto 0;
    // border-bottom: 1px solid #f6f6f6;
    .composition-title {
      padding-top: 5px;
      font-size: 18px;
      color: #333;
      // width: 100%;
      // overflow: hidden;
      // text-overflow: ellipsis;
    }
    .composition-contant {
      margin: 8px 0 0 0;
      padding-bottom: 15px;
      font-size: 12px;
      color: #777;
      width: 100%;
      height: 20px;
      line-height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .composition-label {
      padding-bottom: 8px;
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
  .videoList-during {
    width: 35px;
    text-align: center;
    height: 13px;
    padding: 2px;
    font-size: 12px;
    color: #fefefe;
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 60%;
    left: 60%;
    line-height: normal;
    border-radius: 3px;
  }
  .videoList-img {
    width: 112px;
    height: 63px;
    position: relative;
  }
  .yq-header {
    justify-content: center;
  }
  .yq-header {
    justify-content: center;
  }
  .pc-pic-inter-con {
    height: 15.333vw;
  }
  .pc-line {
    width: 100%;
    height: 1px; /*no */
    background: #f2f2f2;
  }
}
/* 电脑端自定义滚动条 */
@media screen and (min-width: 900px) {
  .pic-inter-con {
    height: 8.333vw !important;
  }
}
</style>
