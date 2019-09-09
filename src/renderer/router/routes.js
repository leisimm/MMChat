import Login from '../components/login.vue'
import Main from '../components/main.vue'
import Secondary from '../components/secondary.vue'
import ChatContent from '../components/chat-content.vue'

export default [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/app',
    component: Main,
    children: [
      {
        path: 'chat',
        components: {
          secondary: Secondary,
          content: ChatContent
        }
      },
      {
        path: 'contact'
      }
    ]
  }
]
