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
                    <el-col :lg="{span:15, offset:0}">
                        <el-card v-if="login" class="loginPanel">
                            <el-form class="form"
                                     ref="homepageLogin"
                                     label-width="5em"
                                     :model="loginForm"
                                     :rules="loginRules">
                                <el-form-item label="商家名" prop="name">
                                    <el-input v-model="loginForm.name"></el-input>
                                </el-form-item>
                                <el-form-item label="密码" prop="password">
                                    <el-input type="password" v-model="loginForm.password"></el-input>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="submitForm">登录</el-button>
                                    <el-button @click="resetForm('loginForm')">重置</el-button>
                                </el-form-item>
                            </el-form>
                        </el-card>
                        <el-card class="registerPanel" v-else>
                            <el-form class="form"
                                     ref="homepageRegister"
                                     label-width="5em"
                                     :model="registerForm"
                                     :rules="registerRules">
                                <el-form-item label="商家名" prop="name">
                                    <el-input v-model="registerForm.name"></el-input>
                                </el-form-item>
                                <el-form-item label="密码" prop="password">
                                    <el-input type="password" v-model="registerForm.password"></el-input>
                                </el-form-item>
                                <el-form-item label="确认密码" prop="password">
                                    <el-input type="password" v-model="registerForm.confirmPassword"></el-input>
                                </el-form-item>
                                <el-form-item label="联系电话" prop="phone">
                                    <el-input v-model="registerForm.phone"></el-input>
                                </el-form-item>
                                <el-form-item label="电子邮箱" prop="email">
                                    <el-input v-model="registerForm.email"></el-input>
                                </el-form-item>
                                <el-form-item label="地址" prop="address">
                                    <el-input v-model="registerForm.address"></el-input>
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
    export default {
        data () {
            // TODO: refactor these func to a file
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


            return {
                loginForm: {
                    name: '',
                    password: ''
                },
                registerForm: {
                    name: '',
                    password: '',
                    confirmPassword: '',
                    phone: '',
                    email: '',
                    address: '',
                },
                login: true,
                loginRules: {
                    name: [
                        {validator: validateName, trigger: 'blur'}
                    ],
                    password: [
                        {validator: validatePassword, trigger: 'blur'}
                    ],
                },
                registerRules: {}

            }
        },
        methods: {
            submitForm () {
                console.log(this.form)
            },
            resetForm (formName) {
                this.$refs[formName].resetFields()
            }
        },
        watch: {
            '$route' () {
                this.login = $route.params.action === 'login'
            }
        }
    }
</script>

<style lang="scss" scoped>
    .homeWrapper {
        background: url(../image/header-bg.jpg) no-repeat bottom;
        background-size: cover;
        overflow: hidden;
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
    .loginPanel {
        margin-top: 7em;
        margin-bottom: 10em;
        background-color: rgba(255,255,255,0.8);
        border-width: 0;
        .form {
            margin-top: 3em;
            margin-bottom: 3em;
            margin-right: 1.5em;
        }
    }
</style>