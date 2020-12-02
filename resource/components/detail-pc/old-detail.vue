<template>
  <div>
    <!-- 详情页主体内容 start -->
    <div class="yq-article-wrap">
      <h1 class="article-title">
        {{ detail.title }}
      </h1>
      <div v-if="type === 'z'" class="yq-user-bar">
        <!-- 超过7天 显示2020-01-01 格式，7天内显示 'N天内' -->
        <span class="composition-name">{{ detail.userName }}</span>
        <span class="composition-words">{{ detail.contentNum }}字</span>
      </div>
      <div v-else class="yq-user-bar">
        <!-- 超过7天 显示2020-01-01 格式，7天内显示 'N天内' -->
        <span class="time">{{ detail.postDateName }}</span>
        <span class="name">{{ detail.userName }}</span>
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
        v-if="type === 'z'"
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
      <img
        v-if="type === 'k' && foot"
        class="article-pic"
        :src="basePic + detail.picId"
        alt=""
      />

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
      <div
        v-if="type === 'z'"
        class="composition-label"
        style="padding-top: 10px;"
      >
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
    <!-- 推荐阅读模块  start-->
    <div class="yq-recommend-wrap">
      <h2 class="title">
        {{ type === 'k' && !foot ? '延伸阅读' : '推荐阅读' }}
      </h2>
      <ul
        v-if="recommendList && recommendList.length && type !== 'z'"
        id="recommendList"
        class="yq-list"
      >
        <li
          v-for="(item, index) in recommendList"
          :key="index"
          ref="list-item"
          class="list-item xxxx"
          data-load="0"
          :class="!item.images || item.images.length < 1 ? 'list-no-img' : ''"
          @click="clickItem(item)"
        >
          <a class="list-link" :href="generateURL(item) + '?f=cdrqalist'">
            <div class="list-con" :class="{ 'list-no-img': !item.picId }">
              <div v-if="item.picId" class="img-wrap fr">
                <img :src="basePic + item.picId" />
              </div>
              <div class="text-con">
                <h4 class="list-title">{{ item.title }}</h4>
                <p class="text">{{ item.content.slice(0, 30) }}</p>
              </div>
            </div>
          </a>
        </li>
      </ul>
      <ul
        v-else-if="type === 'z' && recommendList && recommendList.length"
        id="recommendList"
        class="yq-list"
      >
        <li
          v-for="(item, index) in recommendList"
          :key="index"
          ref="list-item"
          class="list-item"
          data-load="0"
          :data-item="item.category_id"
          :data-type="item._typs"
          :data-itemid="item.item_id"
          :data-context="item.context"
          @click="clickItem(item)"
        >
          <a
            class="composition-wrap"
            :href="whereGo(item)"
            v-if="item._typs === 'compositionList'"
          >
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
              <span>{{ item.extra4 }}</span>
              <span>{{ item.tag }}</span>
            </div>
          </a>

          <a
            class="list-link"
            :href="whereGo(item) + '?f=cdrqalist'"
            v-if="item._typs === 'videoList'"
          >
            <div class="list-con" :class="{ 'list-no-img': !item.item_id }">
              <div class="fr videoList-img">
                <img :src="item.cover_url" />
                <span class="videoList-during">{{
                  (item.extra3 / 60).toFixed(2).replace(/\./g, ':')
                }}</span>
              </div>
              <div class="text-con">
                <h4 class="list-title">{{ item.title }}</h4>
                <!-- <p class="text">{{ item.content }}</p> -->
                <p class="text">{{ item.publish_time.split(' ')[0] }}</p>
              </div>
            </div>
          </a>

          <a
            class="list-link"
            :href="whereGo(item) + '?f=cdrqalist'"
            v-if="item._typs === 'articleList'"
          >
            <div class="list-con" :class="{ 'list-no-img': !item.item_id }">
              <div class="img-wrap fr">
                <img :src="item.cover_url" />
              </div>
              <div class="text-con">
                <h4 class="list-title">{{ item.title }}</h4>
                <p class="text">{{ item.content.slice(0, 30) }}</p>
              </div>
            </div>
          </a>
        </li>
      </ul>
      <ul
        v-else
        id="recommendList"
        class="yq-list"
        :class="{ 'yq-list-z': type === 'k' }"
      ></ul>
    </div>
    <a
      v-if="type === 'k' && watching"
      class="next-article-wrap"
      :href="generateURL(watching) + '?f=kdrqalist'"
    >
      <div class="next-inter">
        <div class="pic-inter-con">
          <img :src="basePic + watching.picId" />
          <div class="mask"></div>
          <div class="next-text-con">
            <p class="title-text">{{ watching.title }}</p>
            <p class="text">
              {{ watching.content.slice(0, 30) }}
            </p>
          </div>
        </div>
        <div class="read-all">展开阅读全文</div>
      </div>
    </a>
    <!-- 推荐阅读模块  end-->
    <div v-if="type === 'b'" class="detail-bottom">
      <nuxt-link class="btn-bottom-home" to="/">访问首页访问更多内容</nuxt-link>
    </div>
    <!--悬浮按钮 -->
    <!-- <div
      v-if="type === 'k' && foot !== 'sjx' && showShare"
      class="quick-bottom-fix"
      :class="{ kpage: type === 'k' }"
    >
      <nuxt-link to="/" class="btn-home">访问首页</nuxt-link>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'old-detail',
  methods: {
    insertParadigm() {
      const _self = this;
      // 每次执行前，先移除上次插入的代码
      document.getElementById('ParadigmSDK') &&
        document.getElementById('ParadigmSDK').remove();

      const paradigm = document.createElement('script');

      paradigm.charset = 'utf-8';
      paradigm.id = 'ParadigmSDK';
      paradigm.src = 'https://nbrecsys.4paradigm.com/sdk/js/ParadigmSDK_v3.js';
      paradigm.onload = () => {
        const scene = _self.foot ? 77632 : 76321;

        window.ParadigmSDKv3.init('e524d4faff1f407984eb469df1bfd272'); // ###SDK初始化
        window.ParadigmSDKv3.getRecommItems(69206, scene).then(function(
          recommendList
        ) {
          // #####请在这里处理推荐结果#####
          if (recommendList && recommendList.length) {
            const list = recommendList.slice(0, 3);
            const oFragment = document.createDocumentFragment();
            list.forEach(function(i, index) {
              const itemTemplate =
                '<div class="list-item" data-load="0" data-itemid="' +
                i.item_id +
                '"data-context="' +
                i.context +
                '"><a class="list-link" href="' +
                i.url +
                '?f=kdrqalist' +
                '"><div class="list-con"><div class="img-wrap fr" style="border-radius: 0"><img src="' +
                i.cover_url +
                '" /></div><div class="text-con"><h4 class="list-title">' +
                i.title +
                '</h4><p class="text" style="color:#999">' +
                i.publish_time.split(' ')[0] +
                '</p></div></div></a></div>';
              const itemTemplateHasAd =
                '<div class="_x5o3ahrqfsf" onclick="_clickpoint()"></div>' +
                '<div class="list-item" data-load="0" data-disi="0" data-itemid="' +
                i.item_id +
                '"data-context="' +
                i.context +
                '"><a class="list-link" href="' +
                i.url +
                '?f=kdrqalist' +
                '"><div class="list-con"><div class="img-wrap fr " style="border-radius: 0"><img src="' +
                i.cover_url +
                '" /></div><div class="text-con"><h4 class="list-title">' +
                i.title +
                '</h4><p class="text" style="color:#999">' +
                i.publish_time.split(' ')[0] +
                '</p></div></div></a></div>';
              //           <div class="_x5o3ahrqfsf"></div>
              const li = document.createElement('li');

              if (index === 1) {
                li.innerHTML = itemTemplateHasAd;
              } else {
                li.innerHTML = itemTemplate;
              }

              li.addEventListener('click', _self.clickItem, false);
              oFragment.appendChild(li);
            });
            const parent = document.getElementById('recommendList');
            parent.appendChild(oFragment);

            (window.slotbydup = window.slotbydup || []).push({
              id: 'u6095884',
              container: '_x5o3ahrqfsf',
              async: true
            });
            window._showAdvertising();

            window._clickpoint = function() {
              window._hmt.push([
                '_setAccount',
                '32acd7ce79ffccff4e50c22fdff8f3df'
              ]);
              window._hmt.push([
                '_trackEvent',
                'h5_kd_detail',
                'skip',
                'recommended_ad'
              ]);
            };
          }
        });
      };
      document.body.appendChild(paradigm);
    },
    // 百度广告曝光
    showAdvertising() {
      const ad =
        (document.querySelector('._x5o3ahrqfsf') &&
          document.querySelector('._x5o3ahrqfsf').offsetTop) ||
        '10000';
      if (ad === '10000') {
        return;
      }
      if (!this.isfirst) {
        return;
      }
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const windowHeight = window.innerHeight || document.body.clientHeight;

      if (windowHeight + scrollTop - ad >= 80) {
        this.isfirst = false;
        window._hmt.push(['_setAccount', '32acd7ce79ffccff4e50c22fdff8f3df']);
        window._hmt.push([
          '_trackEvent',
          'h5_kd_detail',
          'load',
          'kd_recommended_ad'
        ]);
      }
    }
  }
};
</script>
