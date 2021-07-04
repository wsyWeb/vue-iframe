<template>
    <div class="header flex">
        <img class="logo m-l-md m-r-sm" src="../assets/logo.png" />
        <div class="font-16 theme-color-white flex-1">xxx</div>

        <div class="user">wsy</div>
    </div>
</template>

<script>
// import {mapState} from "vuex";
import { Modal } from "ant-design-vue";

export default {
    name: "Header",
    computed: {
        // ...mapState({
        //     nickname: state => state.nickname
        // })
    },
    methods: {
        onLoginOut: function() {
            Modal.confirm({
                title: "提示",
                content: "您确定要退出登录吗？",
                onOk: () => {
                    this.$store.commit("LOGIN_OUT");
                    this.$router.replace("/login");
                    this.$notification.success({ message: "退出登录成功" });
                },
            });
        },
    },
};
</script>

<style scoped>
.header {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    displey: -webkit-flex;
    display: -ms-flex;
    width: 100%;
    height: 50px;
    align-items: center;
    background: #003366;
    z-index: 1;
}

.header .logo {
    width: 40px;
}

.user {
    color: #fff;
    padding-right: 20px;
}
</style>
