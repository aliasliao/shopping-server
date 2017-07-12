import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

import App from './components/App.vue'
import Homepage from './components/Homepage.vue'


Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(ElementUI)


const store = new Vuex.Store({
    state: {
        loggedIn: false,
        info: {
            id: null,
            name: null,
            imageUrl: null
        }
    },
    mutations: {
        login (state) {
            state.loggedIn = true
        },
        logout (state) {
            state.loggedIn = false
            state.info.id = null
            state.info.name = null
            state.info.imageUrl = null
        },
        setInfo (state, info) {
            state.info = info
        },
    }
})

const router = new VueRouter({routes: [
    {
        path: '/',
        redirect: to => {
            if (store.state.loggedIn) { return '/order' }
            else { return '/homepage/login' }
        }
    },
    {
        path: '/homepage/:action',
        component: Homepage,
        meta: {requiresAuth:false},
    }
]})

const app = new Vue({
    el: '#app',
    store,
    router,
    render (h) {
        return h(App)
    }
})
