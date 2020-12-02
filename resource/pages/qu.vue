<template>
  <div id="group-index">
    <common-header
      page-type="h5_interest"
      desc="back_top"
      title="兴趣圈"
      back
      share
      border
    ></common-header>

    <div class="interest-banner-wrap">
      <div class="banner-inter">
        <img src="@/assets/images/702913236888_690.jpg" />
      </div>
    </div>
    <div class="circle-main">
      <div
        v-for="(item, index) in groupList"
        ref="groupCategory"
        :key="index"
        class="circle-item"
      >
        <template v-if="item.listCircle && item.listCircle.length">
          <h2 class="circle-title">
            {{ item.categoryName }}
          </h2>
          <div class="circle-list-wrap">
            <ul
              class="circle-list"
              :class="{
                'circle-list-hide': !item.showAll && item.listCircle.length > 4
              }"
            >
              <li
                v-for="group in item.listCircle"
                :key="group.id"
                class="list-item"
                data-load="0"
                @click="statClick('h5_interest', 'interest_item')"
              >
                <a :href="'/q/' + group.id" class="list-link">
                  <img :src="'http://pic.iask.cn/fimg/' + group.pagePicId" />
                  <p class="text">{{ group.title }}</p>
                </a>
              </li>
            </ul>

            <template v-if="item.listCircle.length > 4">
              <div
                v-if="!item.showAll"
                class="list-show"
                @click="showGroupAll(index)"
              >
                <span class="show-text">点击展开</span>
              </div>
              <div v-else class="list-less" @click="showGroupAll(index)">
                <span class="show-text">点击收起</span>
              </div>
            </template>
          </div>
        </template>
      </div>
      <div v-if="!noMore" class="yq-loading">
        <span class="loading-text">努力加载中..</span>
      </div>
    </div>
  </div>
</template>

<script>
import { statClick, statLoad } from '@/common/stat';
import { deepClone } from '@/common/util';
import { GroupService } from '@/service';

export default {
  name: 'GroupIndex',
  async asyncData({ error }) {
    try {
      const { data: results } = await GroupService.getGroupList();

      if (results && results.length) {
        return {
          groupList: results,
          noMore: results.length < 10
        };
      }

      return {
        noMore: true
      };
    } catch (err) {
      error({ statusCode: err.code, message: err.message });
    }
  },
  data() {
    return {
      groupList: [],
      noMore: false,
      loading: false,
      groupTotal: 0, // 圈子总数
      loadTotal: 0 // 曝光总数
    };
  },
  head() {
    return {
      title: '兴趣圈-趣味知识-扒拉扒拉',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            '扒拉扒拉的兴趣圈频道汇集了科技科普,人文历史,野生技术以及影视文化等各类趣味知识，通过知识问答互动的方式让各类兴趣爱好者在快乐中触达并学到更多专业相关知识。'
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: '兴趣圈,趣味知识,知识问答,扒拉扒拉'
        }
      ]
    };
  },
  mounted() {
    const _self = this;
    const groupList = deepClone(_self.groupList.slice(0));
    document.body.style.backgroundColor = '#fff';

    if (groupList && groupList.length) {
      _self.groupList = groupList.map((i) => {
        if (i.listCircle) {
          _self.groupTotal = _self.groupTotal + i.listCircle.length;
        }
        i.showAll = false;
        return i;
      });
      _self.addScrollListener();
    }
  },
  beforeDestroy() {
    this.removeScrollListener();
  },
  beforeRouteLeave(to, from, next) {
    document.body.style.backgroundColor = '';
    next();
  },
  methods: {
    statClick,
    showGroupAll(index) {
      this.groupList[index].showAll = !this.groupList[index].showAll;
    },
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll);
    },
    removeScrollListener() {
      window.removeEventListener('scroll', this.handleScroll);
    },
    async fetchData() {
      const _self = this;

      try {
        const { data: results } = await GroupService.getGroupList();

        if (results.length) {
          if (results.length < 10) {
            _self.noMore = true;
          }
          const list = results.map((i) => {
            _self.groupTotal = _self.groupTotal + i.listCircle.length;
            i.showAll = false;
            return i;
          });

          _self.groupList.push(...list);
        } else {
          _self.noMore = true;
        }
      } catch (err) {
        this.$toast(err.message);
      }
    },
    async handleScroll() {
      const _self = this;
      // 列表项曝光事件
      if (_self.loadTotal < _self.groupTotal) {
        const groupList = _self.groupList;
        const category = _self.$refs.groupCategory;
        const windowHeight = window.innerHeight || document.body.clientHeight;
        // 遍历分类
        category.forEach((i, index) => {
          // 判断是否展开全部
          const groupListLength =
            groupList[index].showAll || groupList[index].listCircle.length < 4
              ? groupList[index].listCircle.length
              : 4;
          const list = Array.prototype.slice.apply(
            i.querySelectorAll('.list-item'),
            [0, groupListLength]
          );

          list.forEach((i) => {
            const isLoad = i.dataset.load === '1';
            // 判断是否已经曝光
            if (isLoad) {
              return;
            }
            const itemTop = i.getBoundingClientRect().top;
            if (itemTop < windowHeight) {
              _self.loadTotal = _self.loadTotal + 1;
              i.dataset.load = '1';
              statLoad('h5_interest', 'interest_item');
            }
          });
        });
      }

      if (!_self.loading && !_self.noMore) {
        _self.loading = true;
        await _self.fetchData();
        _self.loading = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.circle-main {
  padding-bottom: 20px;
}
.list-show {
  margin-top: 10px;
  display: block;
}
.list-less {
  display: block;
}
.circle-list-hide {
  height: calc(50vw + 10px);
}
</style>
