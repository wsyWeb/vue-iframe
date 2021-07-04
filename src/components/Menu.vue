<template>
    <a-layout-sider
        id="layout-menu "
        breakpoint="lg"
        collapsed-width="0"
        @collapse="onCollapse"
        @breakpoint="onBreakpoint"
        @click="onClick"
    >
        <div class="logo" />
        <a-menu
            theme="dark"
            mode="inline"
            :default-selected-keys="['0']"
            class="menu"
        >
            <a-menu-item key="echart">
                <a-icon type="user" />
                <span class="nav-text">绘制图标多轴</span>
            </a-menu-item>
            <a-menu-item key="2">
                <a-icon type="video-camera" />
                <span class="nav-text">nav 2</span>
            </a-menu-item>
            <a-menu-item key="3">
                <a-icon type="upload" />
                <span class="nav-text">nav 3</span>
            </a-menu-item>
            <a-menu-item key="4">
                <a-icon type="user" />
                <span class="nav-text">nav 4</span>
            </a-menu-item>
        </a-menu>
    </a-layout-sider>
</template>
<script>
export default {
    methods: {
        onCollapse() {},
        onBreakpoint() {},
        onClick(obj) {
            console.log(obj.key);
        },
    },
};
</script>

<style>
.menu {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}

.ant-layout {
    flex: none;
}

.ant-layout-sider {
    background: transparent;
}

#layout-menu .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
}

#layout-menu .trigger:hover {
    color: #1890ff;
}

#layout-menu .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
}
</style>
