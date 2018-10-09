import Vue from 'vue'
import Router from 'vue-router'
import mqhome from '@/pages/macroquarter/macroQuarterHome'
import swindex from '@/pages/swindex/swhome'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: mqhome
    },
    {
      path: '/swindex',
      name: 'SwIndex',
      component: swindex
    }
  ]
})
