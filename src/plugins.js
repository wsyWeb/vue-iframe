import Vue from "vue";
import VueRouter from "vue-router";
import Vuex from "vuex";
import {
  AutoComplete,
  Button,
  Menu,
  Icon,
  Table,
  Tabs,
  Select,
  Radio,
  InputNumber,
  Input,
  Spin,
  DatePicker,
  Modal,
  Pagination,
  Tag,
  Divider,
  ConfigProvider,
  Form,
  FormModel,
  Breadcrumb,
  Checkbox,
  Tooltip,
  Card,
  Row,
  Col,
  Switch,
  notification,
  message,
  Upload,
  Tree,
  Progress,
  Calendar,
  Dropdown,
  List,
  Descriptions,
  Cascader,
  Popconfirm,
  Steps,
  Result,
  Layout,
  TreeSelect,
} from "ant-design-vue";
import "ant-design-vue/dist/antd.less";

//第三方库
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(AutoComplete);
Vue.use(Button);
Vue.use(Menu);
Vue.use(Icon);
Vue.use(Table);
Vue.use(Tabs);
Vue.use(Select);
Vue.use(Radio);
Vue.use(InputNumber);
Vue.use(Input);
Vue.use(Spin);
Vue.use(DatePicker);
Vue.use(Modal);
Vue.use(Pagination);
Vue.use(Tag);
Vue.use(Divider);
Vue.use(ConfigProvider);
Vue.use(Form);
Vue.use(FormModel);
Vue.use(Breadcrumb);
Vue.use(Checkbox);
Vue.use(Tooltip);
Vue.use(Card);
Vue.use(Row);
Vue.use(Col);
Vue.use(Switch);
Vue.use(Upload);
Vue.use(Tree);
Vue.use(Progress);
Vue.use(Calendar);
Vue.use(Dropdown);
Vue.use(List);
Vue.use(Descriptions);
Vue.use(Cascader);
Vue.use(Popconfirm);
Vue.use(Steps);
Vue.use(Result);
Vue.use(Layout);
Vue.use(TreeSelect);

// Vue.use(Viewer);
// Viewer.setDefaults({
//     Options: { "inline": true, "button": true, "navbar": false, "title": true, "toolbar": true, "tooltip": true, "movable": true, "zoomable": true, "rotatable": true, "scalable": true, "transition": true, "fullscreen": true, "keyboard": true, "url": "data-source" }
// });

notification.config({
  placement: "bottom",
});
Vue.prototype.$notification = notification;
Vue.prototype.$message = message;

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};
