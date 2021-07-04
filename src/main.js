import Vue from 'vue'
import App from './App';
import 'ant-design-vue/dist/antd.css';
import router from './router'
import "./plugins";
import './common/common.less';
import store from './store'

const vue = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
