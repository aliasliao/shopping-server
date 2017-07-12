<template>
    <div>
        <el-menu default-active="/homepage/login" theme="dark" mode="horizontal" router>
            <el-row>
                <el-col :lg="{span:6, offset:2}">
                    <el-menu-item index="/homepage/login">
                        <span class="logo">快捷购物</span>商户中心
                    </el-menu-item>
                </el-col>
                <el-col v-if="!loggedIn" :lg="{span:4, offset:12}">
                    <el-menu-item index="/homepage/login" v-if="homepageLogin" >
                        <el-button @click="switchHomepageLogin" type="warning">切换到注册</el-button>
                    </el-menu-item>
                    <el-menu-item index="/homepage/register" v-else>
                        <el-button @click="switchHomepageLogin" type="success">切换到登录</el-button>
                    </el-menu-item>
                </el-col>
                <el-col v-else :lg="{span:6, offset:10}">
                    <el-menu-item index="/goods">商品录入</el-menu-item>
                    <el-menu-item index="/info">商家信息</el-menu-item>
                    <el-menu-item index="" @click="logOut">注销</el-menu-item>
                </el-col>
            </el-row>
        </el-menu>

        <router-view></router-view>
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        name: 'app',
        data () {
            return {
                homepageLogin: true
            }
        },
        created () {
        },
        computed: {
            loggedIn () {
                return this.$store.state.loggedIn
            }
        },
        methods: {
            switchHomepageLogin () {
                this.homepageLogin = !this.homepageLogin
            },
            logOut () {}
        }
    }
</script>

<style lang="scss" scoped>
    .logo {
        font-size: 2em;
    }
</style>

<style>
    body {
        margin: 0;
    }
</style>