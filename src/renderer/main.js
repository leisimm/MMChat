import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Router from './router'
import VueExtend from './vue-extend'
import App from './app.vue'
import './assets/style.css'

Vue.use(VueExtend)

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    currentChatId: undefined
  },
  mutations: {
    CHANGE_CURRENT_CHAT_ID: (state, chatId) => {
      state.currentChatId = chatId
    }
  }
})

Vue.use(VueRouter)

new Vue({
  el: '#app',
  render: (h) => h(App),
  router: Router(),
  created() {
    this.$router.push('/')
  },
  store
})
