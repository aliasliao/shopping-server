<template>
    <div>
        <div class="loading" v-if="loading">
            <img src="../image/index.rotating-balls-spinner.svg">
        </div>
        <el-card v-else v-for="(item, index) in orders" :key="index">
            <el-row>
                <el-col :lg="{span:4, offset:3}">{{ item.time }}</el-col>
                <el-col :lg="{span:4, offset:1}">订单号：{{ item.id }}</el-col>
            </el-row>
            <el-row>
                <el-col :lg="{span:4, offset:3}">
                    <img :src="item.goodsImageUrl" alt="image not found">
                </el-col>
                <el-col :lg="{span:6, offset:0}">
                    <div>{{ item.goodsName }}</div>
                    <div>商品号：{{ item.goodsId }}</div>
                </el-col>
                <el-col :lg="{span:4, offset:0}">
                    <div>￥{{ item.goodsPrice }}</div>
                    <div>客户ID：{{ item.consumerId }}</div>
                </el-col>
                <el-col :lg="{span:6, offset:0}">
                    <div>{{ item.state }}</div>
                    <div><el-button type="success">更新状态</el-button></div>
                </el-col>
            </el-row>
        </el-card>

        <div class="empty" v-if="!orders.length && !loading">
            没有订单可以显示
        </div>
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        data () {
            return {
                orders: [],
                loading: false
            }
        },
        created () {
            this.loading = true
            axios.get('/merchant/order').then(res => {
                this.loading = false
                this.orders = res.data
            }).catch(err => { console.log(err) })
        }
    }
</script>

<style lang="scss" scoped>
    .loading {
        text-align: center;
        margin-top: 12em;
    }
    .empty {
        text-align: center;
        margin-top: 6em;
        font-size: 2em;
        font-weight: bold;
        color: #324157;
    }
</style>