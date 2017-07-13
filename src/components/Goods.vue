<template>
    <el-row>
        <el-col :lg="{span:12, offset:6}">
            <el-card class="panel">
                <el-form :model="goodsForm"
                         :rules="goodsRules"
                         label-width="7em"
                         ref="goodsForm">
                    <el-form-item label="图片地址" prop="imageUrl">
                        <el-input v-model="goodsForm.imageUrl"></el-input>
                    </el-form-item>
                    <el-row>
                        <el-col :lg="{span:16}">
                            <el-form-item label="商品名" prop="name">
                                <el-input v-model="goodsForm.name"></el-input>
                            </el-form-item>
                            <el-form-item label="商品价格" prop="price">
                                <el-input v-model="goodsForm.price"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :lg="{span:6, offset:2}">
                            <div class="image">
                                <img width="160px" height="160px" :src="imageUrl" alt="image not found">
                            </div>
                        </el-col>
                    </el-row>
                    <el-form-item>
                        <el-button type="primary" @click="submit">提交</el-button>
                        <el-button @click="reset">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
    import axios from 'axios'

    export default {
        data () {
            let validateImageUrl = (rule, value, callback) => {
                let pattern = /^https?:\/\/\S+.(jpg|png|gif|svg)$/i

                if (value === '') {
                    callback(new Error('请输入图片地址'))
                }
                else if (pattern.test(value) === false) {
                    callback(new Error('不合法的地址'))
                }
                else {
                    this.loadImage = true
                    this.imageUrl = value
                    callback()
                }
            }
            let validateName = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入商品名'))
                }
                else if (value.length < 4 || value.length > 32) {
                    callback(new Error('用户名长度在4到32位之间'))
                }
                else {
                    callback()
                }
            }
            let validatePrice = (rule, value, callback) => {
                let pattern = /\d+\.\d{2}/

                if (value === '') {
                    callback(new Error('请输入价格'))
                }
                else if (pattern.test(value) === false) {
                    callback(new Error('不合法的价格'))
                }
                else {
                    callback()
                }
            }

            return {
                loadImage: false,
                goodsForm: {
                    name: '',
                    price: '',
                    imageUrl: ''
                },
                imageUrl: '',
                goodsRules: {
                    imageUrl: [
                        {validator: validateImageUrl, trigger: 'blur'}
                    ],
                    name: [
                        {validator: validateName, trigger: 'blur'}
                    ],
                    price: [
                        {validator: validatePrice, trigger: 'blur'}
                    ],
                }
            }
        },
        methods: {
            submit () {
                this.$refs.goodsForm.validate(valid => {
                    if (valid) {
                        axios.post('/merchant/addGoods', this.goodsForm).then(res => {
                            if (res.data === 'success') {
                                this.$notify.success({
                                    title: '添加成功',
                                    message: '成功添加一条记录'
                                })
                            }
                            else {
                                this.$notify.error({
                                    title: '添加失败',
                                    message: res.data
                                })
                            }
                        }).catch(err => {
                            console.log(err)
                            this.$notify.error({
                                title: '添加失败',
                                message: err.message
                            })
                        })
                    }
                    else { console.log('goods form invalid!') }
                })
            },
            reset () {
                this.$refs.goodsForm.resetFields()
            }
        }
    }
</script>

<style lang="scss" scoped>
    .panel {
        margin-top: 8em;
        padding-top: 2em;
        padding-right: 2em;
        .image {
            width: 6em;
            height: 6em;
        }
    }
</style>