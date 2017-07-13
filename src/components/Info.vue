<template>
    <el-row>
        <el-col :lg="{span:12, offset:6}">
            <el-card class="panel">
                <div class="image">
                    <img width="160px" height="160px" :src="info.imageUrl" alt="iamge not found">
                </div>
                <div class="desc">
                    <div class="row id"><span class="label">&nbsp;&nbsp;商户ID</span>{{ info.id }}</div>
                    <div class="row name"><span class="label">&nbsp;&nbsp;注册名</span>{{ info.name }}</div>
                    <div class="row accountNum"><span class="label">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;账号</span>{{ info.accountNum }}</div>
                    <div class="row money"><span class="label">账户余额</span>{{ info.money }}</div>
                    <div class="row email"><span class="label">电子邮箱</span>{{ info.email }}</div>
                    <div class="row phone"><span class="label">联系电话</span>{{ info.phone }}</div>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import axios from 'axios'

    export default {
        data () {
            return {
                info: {
                    imageUrl: '',
                    id: '',
                    name: '',
                    accountNum: '',
                    money: '',
                    email: '',
                    phone: ''
                }
            }
        },
        created () {
            axios.get('/merchant/info').then(res => {
                this.info = res.data
            }).catch(err => { console.log(err.message) })
        }
    }
</script>

<style lang="scss" scoped>
    .panel {
        margin-top: 4em;
        padding-bottom: 2em;
        .image {
            text-align: center;
        }
        .desc {
            margin-left: 8em;
            .row {
                margin-bottom: 1em;
                color: darkcyan;
                font-weight: bold;
            }
            .label {
                font-size: 0.8em;
                font-weight: bold;
                color: darkgrey;
                margin-right: 1em;
            }
        }
    }
</style>