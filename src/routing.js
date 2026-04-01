import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/home.vue'
import QrcodeRedeem from './views/QrcodeRedeem.vue'
import QrcodesView from './views/QrcodesView.vue'
import QrcodesList from './views/QrcodesList.vue'
import QrcodeNewView from './views/QrcodeNewView.vue'
import QrcodeEditView from './views/QrcodeEditView.vue'

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
          path: '/qrcodes/new',
          name: 'qrcodes_new',
          component: QrcodeNewView,
        },
        {
          path: '/qrcodes/edit/:id',
          name: 'qrcodes_edit',
          component: QrcodeEditView,
        },
        {
          path: '/qrcodes',
          name: 'qrcodes_admin',
          component: QrcodesList,
        },
        {
          path: '/qrcodes/:code',
          name: 'qrcode_by_code',
            component: QrcodesView,
        },
      ],
    })
  }
}
