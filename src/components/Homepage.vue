<template>
    <div class="homeWrapper">
        <el-row>
            <el-col :lg="{span:15}" class="slogan">
                <div class="header">加入快购宝，开店赚大钱</div>
                <el-row class="statsRow">
                    <el-col :span="5" :offset="2">
                        <div class="stat">
                            <div class="data"><span class="number">24</span>小时</div>
                            <div class="desc">极速开店</div>
                        </div>
                    </el-col>
                    <el-col :span="5">
                        <div class="stat">
                            <div class="data"><span class="number">900</span>万</div>
                            <div class="desc">每日订单</div>
                        </div>
                    </el-col>
                    <el-col :span="5">
                        <div class="stat">
                            <div class="data"><span class="number">150</span>万</div>
                            <div class="desc">优质商家</div>
                        </div>
                    </el-col>
                    <el-col :span=5>
                        <div class="stat">
                            <div class="data"><span class="number">700</span>个城市</div>
                            <div class="desc">全国覆盖</div>
                        </div>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :lg="{span:9}">
                <el-row>
                    <el-col :lg="{span:18, offset:0}">
                        <el-card class="panel loginPanel" v-if="showLogin">
                            <el-form class="form"
                                     ref="loginForm"
                                     label-width="5em"
                                     key="loginForm"
                                     :model="loginForm"
                                     :rules="loginRules">
                                <el-form-item label="商家名" prop="name">
                                    <el-input v-model="loginForm.name"></el-input>
                                </el-form-item>
                                <el-form-item label="密码" prop="password">
                                    <el-input type="password" v-model="loginForm.password"></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="submitLoginForm">登录</el-button>
                                    <el-button @click="resetForm('loginForm')">重置</el-button>
                                </el-form-item>
                            </el-form>
                        </el-card>
                        <el-card class="panel registerPanel" v-else>
                            <el-form class="form"
                                     ref="registerForm"
                                     label-width="5em"
                                     key="registerForm"
                                     :model="registerForm"
                                     :rules="registerRules">
                                <el-form-item label="商家名" prop="name">
                                    <el-input v-model="registerForm.name"></el-input>
                                </el-form-item>
                                <el-form-item label="密码" prop="password">
                                    <el-input type="password" v-model="registerForm.password"></el-input>
                                </el-form-item>
                                <el-form-item label="确认密码" prop="confirmPassword">
                                    <el-input type="password" v-model="registerForm.confirmPassword"></el-input>
                                </el-form-item>
                                <el-form-item label="银行卡号" prop="accountNum">
                                    <el-input v-model="registerForm.accountNum"></el-input>
                                </el-form-item>
                                <el-form-item label="联系电话" prop="phone">
                                    <el-input v-model="registerForm.phone"></el-input>
                                </el-form-item>
                                <el-form-item label="电子邮箱" prop="email">
                                    <el-input type="email" v-model="registerForm.email"></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="submitRegisterForm">注册</el-button>
                                    <el-button @click="resetForm('registerForm')">重置</el-button>
                                </el-form-item>
                            </el-form>
                        </el-card>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        beforeRouteEnter (to, from, next) {
            axios.get('/merchant/checkState').then(res => {
                if (res.data.status === 'loggedIn') {
                    this.$store.commit('login')
                    this.$store.commit('setInfo', {
                        id: res.data.id,
                        name: this.loginForm.name,
                        imageUrl: res.data.imageUrl
                    })

                    if (to.query.redirect !== undefined) {
                        next(to.query.redirect)
                    }
                    else {
                        next('/orders')
                    }
                }
                else {
                    next()
                }
            }).catch(err => { console.log(err) })
        },
        data () {
            let validateName = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入商家名'))
                }
                else if (value.length < 2 || value.length > 64) {
                    callback(new Error('用户名长度在2到64个字符之间'))
                }
                else {
                    callback()
                }
            }
            let validatePassword = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码'))
                }
                else if (value.length < 6 || value.length > 32) {
                    callback(new Error('密码长度在8到32个字符之间'))
                }
                else {
                    callback()
                }
            }
            let validateConfirmPassword = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请再次输入密码'))
                }
                else if (value !== this.registerForm.password) {
                    callback(new Error('两次输入的密码不一致！'))
                }
                else {
                    callback()
                }
            }
            let validateAccountNum = (rule, value, callback) => {
                let pattern = /^\d{8,19}$/

                if (value === '') {
                    callback(new Error('请输入银行卡号'))
                }
                else if (pattern.test(value) === false) {
                    callback(new Error('银行卡号必须为8位到19位的数字！'))
                }
                else {
                    callback()
                }
            }
            let validatePhone = (rule, value, callback) => {
                let pattern = /^\d+-?\d+$/

                if (value === '') {
                    callback(new Error('请输入电话号码'))
                }
                else if (pattern.test(value) === false) {
                    callback(new Error('电话号码不合法！'))
                }
                else if (value.length < 8 || value.length > 16) {
                    callback(new Error('号码长度在8到16位之间'))
                }
                else {
                    callback()
                }
            }
            let validateEmail = (rule, value, callback) => {
                let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

                if (value === '') {
                    callback(new Error('请输入电子邮箱地址'))
                }
                else if (pattern.test(value) === false) {
                    callback(new Error('电子邮箱地址不合法！'))
                }
                else if(value.length > 128) {
                    callback(new Error('电子邮箱地址不能超过128位'))
                }
                else {
                    callback()
                }
            }



            return {
                loginForm: {
                    name: '',
                    password: ''
                },
                registerForm: {
                    name: '',
                    password: '',
                    confirmPassword: '',
                    accountNum: '',
                    phone: '',
                    email: '',
                },
                showLogin: true,
                loginRules: {
                    name: [
                        {validator: validateName, trigger: 'blur'}
                    ],
                    password: [
                        {validator: validatePassword, trigger: 'blur'}
                    ],
                },
                registerRules: {
                    name: [
                        {validator: validateName, trigger: 'blur'}
                    ],
                    password: [
                        {validator: validatePassword, trigger: 'blur'}
                    ],
                    confirmPassword: [
                        {validator: validateConfirmPassword, trigger: 'blur'}
                    ],
                    accountNum: [
                        {validator: validateAccountNum, trigger: 'blur'}
                    ],
                    phone: [
                        {validator: validatePhone, trigger: 'blur'}
                    ],
                    email: [
                        {validator: validateEmail, trigger: 'blur'}
                    ]
                },


            }
        },
        methods: {
            submitLoginForm () {
                console.log(JSON.stringify(this.loginForm))
                this.$refs.loginForm.validate(valid => {
                    if (valid) {
                        axios.post('/merchant/login', this.loginForm).then(res => {
                            if (res.data.status === 'success') {
                                this.$notify.success({
                                    title: '登录成功',
                                    message: `欢迎回来，${this.loginForm.name}`,
                                    offset: 100
                                })
                                this.$store.commit('login')  // TODO: try to get id from cookie
                                this.$store.commit('setInfo', {
                                    id: res.data.id,
                                    name: this.loginForm.name,
                                    imageUrl: res.data.imageUrl
                                })
                                this.$router.push('/orders')
                            }
                            else {
                                this.$notify.error({
                                    title: '登录失败',
                                    message: res.data.status,
                                    offset: 100
                                })
                            }
                        }).catch(err => { console.log(err) })
                    }
                    else {
                        console.log('login form invalid')
                    }
                })
            },
            submitRegisterForm () {
                console.log(JSON.stringify(this.registerForm))
                this.$refs.registerForm.validate(valid => {
                    if (valid) {
                        axios.post('/merchant/register', this.registerForm).then(res => {
                            if (res.data.status === 'success') {
                                this.$notify.success({
                                    title: '注册成功',
                                    message: `欢迎加入，${this.registerForm.name}`,
                                    offset: 100
                                })
                                this.$store.commit('login')  // TODO: try to get id from cookie
                                this.$store.commit('setInfo', {
                                    id: res.data.id,
                                    name: this.registerForm.name,
                                    imageUrl: 'http://123.206.186.94:3000/image/face0.jpg'
                                })
                                this.$router.push('/orders')
                            }
                            else {
                                this.$notify.error({
                                    title: '注册失败',
                                    message: res.data.status,
                                    offset: 100
                                })
                            }
                        }).catch(err => { console.log(err) })
                    }
                    else {
                        console.log('register form invalid')
                    }
                })
            },
            resetForm (formName) {
                this.$refs[formName].resetFields()
            }
        },
        watch: {
            '$route' () {
                this.showLogin = this.$route.params.action === 'login'
            }
        },
    }
</script>

<style lang="scss" scoped>
    .homeWrapper {
        background: url(../image/header-bg.jpg) no-repeat bottom;
        background-size: cover;
        overflow: hidden;
        padding-top: 2em;
    }
    .slogan {
        text-align: center;
        .header {
            margin-top: 2em;
            font-size: 3.5em;
            font-weight: 300;
            color: white;
        }
        .statsRow {
            margin-top: 4em;
            .data {
                color: #fff000;
                font-size: 1.5em;
                .number {
                    font-size: 2em;
                    font-weight: bold;
                }
            }
            .desc {
                color: white;
            }
        }
    }
    .panel {
        background-color: rgba(255,255,255,0.8);
        border-width: 0;
    }
    .loginPanel {
        margin-top: 7em;
        margin-bottom: 10em;
    }
    .registerPanel {
        margin-top: 2em;
        margin-bottom: 4em;
    }
    .form {
        margin-top: 3em;
        margin-bottom: 3em;
        margin-right: 1.5em;
    }
</style>