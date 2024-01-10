import Vue from 'vue'
import VueRouter from 'vue-router'
import KanbanBoard from '../views/KanbanBoard.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: KanbanBoard
  },
]

const router = new VueRouter({
  mode: 'history',
  base: '',
  routes
})

export default router;
