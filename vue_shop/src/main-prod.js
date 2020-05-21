import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
import '../src/assets/css/global.css'
import '../src/assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入NProgress包对应的JS和CSS
import NProgress from 'nprogress'

Vue.use(VueQuillEditor)
Vue.config.productionTip = false

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 在request拦截器中，展示进度条NProgress.start()
axios.interceptors.request.use(config => {
  NProgress.start();
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 在最后必须return config
  return config
})
// 在response拦截器中，隐藏进度条NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  // 在最后必须return config
  return config
})



// 全局过滤器
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + '').padStart(2, 0);//padStart表示至少是两位数，没有两位数在后面补个零
  const d = (dt.getDate() + '').padStart(2, 0);
  const hh = (dt.getHours() + '').padStart(2, 0);
  const mm = (dt.getMinutes() + '').padStart(2, 0);
  const ss = (dt.getSeconds() + '').padStart(2, 0);
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
