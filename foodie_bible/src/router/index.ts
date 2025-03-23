import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Search from '../views/Search.vue'
import FoodDetail from '@/views/FoodDetail.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import AccountView from '@/views/AccountView.vue'
import RecommendView from '@/views/RecommendView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/search',
      name: 'search',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: Search
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      props: true
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      props: true
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      props: true
    },
    {
      path: '/search/:id',
      name: 'food-detail-view',
      component: FoodDetail,
      props: true
    },
    {
      path: '/bookmark/:id',
      name: 'bookmark-recommend',
      component: RecommendView,
      props: true
    }
  ],
})

export default router
