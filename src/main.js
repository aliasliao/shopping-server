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
        loggedIn: false
    },
    mutations: {
        changeLogState (state) {
            state.loggedIn = !state.loggedIn
        }
    }
})

const router = new VueRouter({routes: [
    { path: '/homepage/:action', component: Homepage, meta: {requiresAuth:false} }
]})

const app = new Vue({
    el: '#app',
    store,
    router,
    render (h) {
        return h(App)
    }
})
