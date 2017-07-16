<template>
    <div class="content">
        <el-menu class="header" default-active="/homepage/login" theme="dark" mode="horizontal" router>
            <el-row>
                <el-col :lg="{span:6, offset:2}" :xs="{span:12, offset:0}">
                    <el-menu-item index="/homepage/login">
                        <span class="logo">快捷购物</span>商户中心
                    </el-menu-item>
                </el-col>
                <el-col class="switchBtn" v-if="!loggedIn" :lg="{span:4, offset:10}" :xs="{span:12, offset:0}">
                    <el-menu-item index="/homepage/login" v-if="homepageLogin" >
                        <el-button @click="switchHomepageLogin" type="warning">切换到注册</el-button>
                    </el-menu-item>
                    <el-menu-item index="/homepage/register" v-else>
                        <el-button @click="switchHomepageLogin" type="success">切换到登录</el-button>
                    </el-menu-item>
                </el-col>
                <el-col class="menuBar" v-else :lg="{span:8, offset:6}">
                    <el-menu-item index="/goods">商品录入</el-menu-item>
                    <el-menu-item index="/info">商家信息 ({{ $store.state.info.id }})</el-menu-item>
                    <el-menu-item index="" @click="logOut">注销</el-menu-item>
                </el-col>
            </el-row>
        </el-menu>

        <router-view class="body"></router-view>

        <div class="footer">
            <div class="right">© 2017 快购宝 All Rights Reserved</div>
        </div>
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
            logOut () {
                axios.get('/merchant/logout').then(res => {
                    if (res.data === 'success') {
                        this.$notify.success({
                            title: '注销成功',
                            message: '账户注销成功，请重新登录',
                        })
                        this.$store.commit('logout')
                        this.$router.push('/')
                    }
                    else {
                        this.$notify.warning({
                            title: '注销失败',
                            message: res.data,
                        })
                    }
                }).catch(err => { console.log(err) })
            }
        }
    }
</script>

<style lang="scss" scoped>
    .content {
        background-image: url(../image/bg.png);
        .header {
            border-width: o;
            .logo {
                font-size: 2em;
            }
            .switchBtn {
                display: flex;
                justify-content: flex-end;
            }
            @media screen and (min-width: 1200px) {
                .menuBar {
                    display: flex;
                    justify-content: flex-end;
                }
            }
            @media screen and (max-width: 768px) {
                .menuBar {
                    display: flex;
                    justify-content: space-around;
                }
            }
        }
        @media screen and (min-width: 1200px) {
            .body {
                min-height: 40em;
            }
        }
        .footer {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 10em;
            .right {
                font-size: 0.8em;
            }
        }
    }
</style>

<style>
    body {
        margin: 0;
    }
</style>