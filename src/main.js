import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

import App from './components/App.vue'


Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(ElementUI)

const routes = []

const router = new VueRouter({routes})

const app = new Vue({
    el: '#app',
    router,
    render (h) {
        return h(App)
    }
})
