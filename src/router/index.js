import { createRouter, createWebHistory } from 'vue-router'

import Home from '../pages/Home.vue'
import About from '../pages/About.vue'
import Services from '../pages/Services.vue'
import Contact from '../pages/Contact.vue'

import Talleres from '../pages/Talleres.vue'

const routes = [
  { path: '/', component: Home, name: 'Home' },
  { path: '/about', component: About, name: 'About' },
  { path: '/services', component: Services, name: 'Services' },
  { path: '/contact', component: Contact, name: 'Contact' },
  { path: '/talleres', component: Talleres, name: 'Talleres' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router