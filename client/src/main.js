import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Inventory from './views/Inventory.vue'
import Orders from './views/Orders.vue'
import Demand from './views/Demand.vue'
import Spending from './views/Spending.vue'
import Reports from './views/Reports.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard, meta: { nav: { labelKey: 'nav.overview', icon: 'overview', order: 1 } } },
    { path: '/inventory', component: Inventory, meta: { nav: { labelKey: 'nav.inventory', icon: 'inventory', order: 2 } } },
    { path: '/orders', component: Orders, meta: { nav: { labelKey: 'nav.orders', icon: 'orders', order: 3 } } },
    { path: '/demand', component: Demand, meta: { nav: { labelKey: 'nav.demandForecast', icon: 'demand', order: 5 } } },
    { path: '/spending', component: Spending, meta: { nav: { labelKey: 'nav.finance', icon: 'finance', order: 4 } } },
    { path: '/reports', component: Reports, meta: { nav: { labelKey: 'nav.reports', icon: 'reports', order: 6 } } }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
