import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/home.vue'
import QrcodeRedeem from './views/QrcodeRedeem.vue'
import QrcodesView from './views/QrcodesView.vue'

export class Routing {
  static createRouter() {
    return createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: Home,
        },
        {
          path: '/users/:uid/redeem',
          name: 'qrcode_redeem',
          component: QrcodeRedeem,
        },
        {
          path: '/qrcodes/:code',
          name: 'qrcodes',
          component: QrcodesView,
        },
      ],
    })
  }
}
