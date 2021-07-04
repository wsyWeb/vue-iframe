import VueRouter from "vue-router";

import Home from "../views/Home.vue";

const routes = [
    {
        path: "/",
        redirect: "home",
        component: () => import(/* webpackChunkName: "about" */ "../views"),
        children: [
            {
                name: "主页",
                path: "/home",
                id: "0",
                component: Home,
            },
            {
                path: "/echart",
                name: "echart",
                redirect: "EchartMultiaxial",
                id: "1",
                children: [
                    {
                        name: "echart多轴",
                        id: "1-1",
                        path: "EchartMultiaxial",
                        component: () =>
                            import(
                                /* webpackChunkName: "about" */ "../views/EchartMultiaxial.vue"
                            ),
                    },
                ],
            },
            {
                path: "/ant-design-vue",
                name: "design-vue",
                redirect: "calendar",
                id: "2",
                children: [
                    {
                        name: "日历周期设置",
                        id: "2-1",
                        path: "calendar",
                        // component: () => import(/* webpackChunkName: "about" */ '../views/Calendar.vue')
                    },
                ],
            },
            // {
            //     path: '/openlaers',
            //     name: 'openlaers',
            //     id: '2',
            // }
        ],
    },
];

const router = new VueRouter({
  routes: routes,
  mode: "history",
});

export default router;
