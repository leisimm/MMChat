import Vue from 'vue'
import VueExtend from './vue-extend'
import add_chat from './add_chat.vue'
import './assets/style.css'

Vue.use(VueExtend)

new Vue({
  el: '#add-chat',
  render: (h) => h(add_chat)
})
