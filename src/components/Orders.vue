<template>
    <div>
        <div class="loading" v-if="loading">
            <img src="../image/index.rotating-balls-spinner.svg">
        </div>
        <el-card class="card" :body-style="{padding:0}" v-else v-for="(item, index) in orders" :key="index">
            <el-row class="header">
                <el-col :lg="{span:5, offset:2}">
                    <span class="parsed">{{ item.parsedTime }}</span>
                    <span class="time">{{ item.time }}</span>
                </el-col>
                <el-col :lg="{span:3, offset:0}">
                    <span class="label">订单号：</span>
                    <span class="orderId">{{ item.id }}</span>
                </el-col>
            </el-row>
            <el-row class="body">
                <el-col :lg="{span:4, offset:2}">
                    <img class="image" :src="item.goodsImageUrl" alt="image not found">
                </el-col>
                <el-col :lg="{span:8, offset:0}">
                    <div class="goodsName">{{ item.goodsName }}</div>
                    <div class="goodsId">
                        <span class="label">商品号：</span>
                        <span class="gid">{{ item.goodsId }}</span></div>
                </el-col>
                <el-col :lg="{span:5, offset:0}">
                    <div class="goodsPrice">￥{{ item.goodsPrice }}</div>
                    <div class="consumerId">
                        <span class="label">客户ID：</span>
                        <span class="cid">{{ item.consumerId }}</span></div>
                </el-col>
                <el-col :lg="{span:3, offset:0}">
                    <div class="state">{{ item.state }}</div>
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
    .card {
        margin: 2em 5em 0 5em;
        opacity: 0.8;
        .label {
            color: grey;
            font-size: 0.8em;
        }
        .header {
            padding: 1em 0;
            background-color: #eaf8ff;
            .parsed {
                font-weight: bold;
                color: orangered;
            }
            .time {
                font-size: 0.8em;
                font-weight: bold;
                color: grey
            }
            .orderId {
                font-weight: bold;
                color: green;
            }
        }
        .body {
            padding: 0.5em 0;
            .image {
                width: 10em;
                height: 10em;
            }
            .goodsName {
                padding: 0.5em 0;
                font-size: 1.5em;
                font-weight: bold;
                color: orangered;
            }
            .goodsId {
                padding: 1em 0;
                .gid {
                    font-weight: bold;
                    color: darkcyan;
                }
            }
            .goodsPrice {
                padding: 0.2em;
                font-size: 2.5em;
                font-weight: bold;
            }
            .consumerId {
                padding: 1.5em 1em;
                .cid {
                    font-weight: bold;
                    color: deeppink;
                }
            }
            .state {
                padding: 1.5em 0;
                font-size: 1.3em;
                font-weight: bold;
                color: red;
            }
        }
    }
    .empty {
        text-align: center;
        margin-top: 6em;
        font-size: 2em;
        font-weight: bold;
        color: #324157;
    }
</style>