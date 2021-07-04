<template>
    <div class="container main-box">
        <Header/>

        <div class="flex" style="height: 100%;">
            <Menu/>
            <div class="flex-1" style="overflow: auto;">
                <a-spin :spinning="loading">
                    <!-- <BreadcrumbLayout/> -->
                    <div id="platform" class="p-sm platform" style="padding-top: 40px;height: 100%;">
                        <router-view></router-view>
                    </div>
                </a-spin>
            </div>
        </div>
    </div>
</template>

<script>
import Menu from '../components/Menu'
import Header from '../components/Header'
// import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN';
export default {
    components: {Menu, Header},
    data() {
        return{
            // zh_CN,
            loading: false
        }
        
    }
}
</script>
<style lang="less">
.container {
    height: 100%;
    flex-direction: column;
    background: #eee;

    .platform {
        overflow: scroll;
    }
}
</style>
