import Vue from 'vue'
import Router from 'vue-router'
import home from '@/pages/home/home'
import swindex from '@/pages/swindex/swhome'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: home
    },
    {
      path: '/swindex',
      name: 'SwIndex',
      component: swindex
    }
  ]
})
