<template>
    <div>
        <div class="loading" v-if="loading">
            <img src="../image/index.rotating-balls-spinner.svg">
        </div>

        <div v-else>
            <el-row>
                <el-col :lg="{span:20, offset:2}">
                    <el-card class="card" :body-style="{padding:0}" v-for="(item, index) in orders" :key="index">
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
                                <div><el-button @click="modifyState(index)" type="success">更新状态</el-button></div>
                            </el-col>
                        </el-row>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <el-dialog title="修改订单状态" :visible.sync="showStateDialog">
            <el-form :model="stateForm"
                     :rules="stateRules"
                     ref="stateForm"
                     label-width="5em">
                <el-form-item label="订单状态" prop="state">
                    <el-input v-model="stateForm.state"></el-input>
                </el-form-item>
                <el-form-item label="快速填写">
                    <el-select v-model="stateForm.fastState" placeholder="选择常用订单选项">
                        <el-option label="商家已接单" value="商家已接单"></el-option>
                        <el-option label="正在配货" value="正在配货"></el-option>
                        <el-option label="已配货" value="已配货"></el-option>
                        <el-option label="已发货" value="已发货"></el-option>
                        <el-option label="已送达" value="已送达"></el-option>
                        <el-option label="交易成功" value="交易成功"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <img v-if="pending" class="pending" src="../image/index.rotating-balls-spinner.svg">
                <el-button type="primary" @click="confirm">确认修改</el-button>
                <el-button @click="abort">放弃修改</el-button>
            </div>
        </el-dialog>

        <div class="empty" v-if="!orders.length && !loading">
            没有订单可以显示
        </div>
    </div>
</template>

<script>
    import axios from 'axios'

    export default {
        data () {
            let validateState = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入订单状态'))
                }
                else if (value.length < 2 || value.length > 16) {
                    callback(new Error('订单状态长度在2到16个字符之间'))
                }
                else {
                    callback()
                }
            }

            return {
                orders: [],
                loading: false,
                stateForm: {
                    state: '',
                    fastState: ''
                },
                showStateDialog: false,
                currentOrderIndex: 0,
                pending: false,
                stateRules: {
                    state: [{ validator: validateState, trigger: 'blur' }]
                }
            }
        },
        created () {
            this.loading = true
            axios.get('/merchant/order').then(res => {
                this.loading = false
                this.orders = res.data
            }).catch(err => { console.log(err) })
        },
        methods: {
            modifyState (index) {
                this.showStateDialog = true
                this.currentOrderIndex = index
                this.stateForm.state = ''
                this.stateForm.fastState = ''
                this.$refs.stateForm.resetFields()
            },
            confirm () {
                this.pending = true

                this.$refs.stateForm.validate(valid => {
                    if (valid) {
                        let order = this.orders[this.currentOrderIndex]
                        let postData = { id: order.id, state: this.stateForm.state }

                        axios.post('/merchant/updateOrder', postData).then(res => {
                            this.pending = false

                            if (res.data === 'success') {
                                this.$notify.success({
                                    title: '修改成功',
                                    message: `订单状态修改为 ${this.stateForm.state}`
                                })

                                this.orders[this.currentOrderIndex].state = this.stateForm.state
                            }
                            else {
                                this.$notify.error({
                                    title: '修改失败',
                                    message: res.data
                                })
                            }
                        }).catch(err => {
                            console.log(err)
                            this.$notify.error({
                                title: '修改失败',
                                message: err.message
                            })
                        })

                        this.showStateDialog = false
                    }
                    else { console.log('state form invalid!') }
                })
            },
            abort () {
                this.showStateDialog = false
            }
        },
        watch: {
            'stateForm.fastState' () {
                this.stateForm.state = this.stateForm.fastState
            }
        }
    }
</script>

<style lang="scss" scoped>
    .loading {
        text-align: center;
        margin-top: 12em;
    }
    .pending {
        width: 1.5em;
        height: 1.5em;
    }
    .card {
        margin-top: 2em;
        opacity: 0.9;
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
                color: darkcyan;
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
                font-size: 1.3em;
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
                padding: 0.3em;
                font-size: 1.5em;
                font-weight: bold;
            }
            .consumerId {
                padding: 1.5em 1em;
                .cid {
                    font-weight: bold;
                    color: darkcyan;
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