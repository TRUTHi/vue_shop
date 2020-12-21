import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 全局样式表
import './assets/css/global.css'
// 字体图标
import './assets/fonts/iconfont.css'

import TreeTable from 'vue-table-with-tree-grid'
// 文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 文本编辑器 样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import axios from 'axios'
// 根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截
axios.interceptors.request.use(config => {
  // 为请求头添加，验证 token 的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$axios = axios

Vue.component('tree-table', TreeTable)

Vue.use(VueQuillEditor)

Vue.config.productionTip = false

Vue.filter('dateFormat', function (origin) {
  const date = new Date(origin)

  const year = date.getFullYear() // 年
  const month = (date.getMonth() + 1 + '').padStart(2, '0') // 月
  const day = (date.getDate() + '').padStart(2, '0') // 日

  const hours = (date.getHours() + '').padStart(2, '0') // 时
  const minutes = (date.getMinutes() + '').padStart(2, '0') // 分
  const seconds = (date.getSeconds() + '').padStart(2, '0') // 秒

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
