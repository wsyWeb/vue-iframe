import Vue from 'vue'
import './plugins'
import App from './App'
import 'ant-design-vue/dist/antd.css'
import './common/common.less'
import router from './router'
import store from './store'
import '@/assets/css/base.css'

const vue = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
})
window.$vue = vue
