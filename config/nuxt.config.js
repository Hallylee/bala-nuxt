const resolve = require('path').resolve;
require('dotenv').config();

const defaultOption = {
  dev: true,
  env: {
    baseURL: process.env.SERVICE,
    baseLoginURL: process.env.SERVICE_LOGIN
  },
  server: {
    host: '0.0.0.0',
    port: '7001'
  },
  mode: 'universal',
  head: {
    title: '扒拉扒拉-让兴趣连接知识的问答社区',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width,maximum-scale=1,initial-scale=1.0,user-scalable=no'
      },
      {
        hid: 'description',
        name: 'description',
        content:
          '扒拉扒拉是一个基于兴趣的深度问答社区，在此你可以找到兴趣的的深度的知识，还能找到一批同好交流，包括各种硬核的科技科普，人文历史及语言技能学习知识，各种趣味科学实验等'
      },
      {
        hid: 'keywords',
        name: 'keywords',
        content: '知识问答,科技科普,人文历史,语言学习,扒拉扒拉'
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  loading: { color: '#00c2a0' },
  css: ['@/assets/style/m-disease.css', '@/style/public.less'],
  plugins: [
    { src: '@/plugins/vant' },
    { src: '@/plugins/vue-cookies' },
    { src: '@/plugins/common-header' },
    { src: '@/plugins/test.js', ssr: false }
  ],
  buildModules: ['@nuxtjs/eslint-module'],
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/style-resources',
    [
      '@nuxtjs/dotenv',
      {
        path: resolve(__dirname, '..')
      }
    ]
  ],
  styleResources: {
    less: resolve(__dirname, '..', 'resource/style/common/*.less')
  },
  build: {
    extractCSS: true,
    publicPath: '/static/',
    loaders: {
      imgUrl: {
        outputPath: 'images'
      }
    },
    postcss: {
      preset: {
        autoprefixer: {}
      }
    },
    // 添加这个是关键，添加后babel才会处理依赖包vant里面的代码
    transpile: [/vant.*?less/],
    babel: {
      plugins: [
        [
          'import',
          {
            libraryName: 'vant',
            style: (name) => {
              return `${name}/style/less.js`;
            }
          },
          'vant'
        ]
      ]
    }
  },
  srcDir: resolve(__dirname, '..', 'resource')
};

if (process.env.NODE_ENV !== 'development') {
  defaultOption.dev = false;
}

module.exports = defaultOption;
