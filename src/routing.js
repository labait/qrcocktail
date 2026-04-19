import { createRouter, createWebHistory } from 'vue-router'


import HomeView from './views/HomeView.vue'
import QrcodesView from './views/QrcodesView.vue'
import QuizView from './views/QuizView.vue'
import QrcodeRedeem from './views/QrcodeRedeem.vue'

import QrcodeView from './views/QrcodeView.vue'

import AdminQrcodesList from './views/AdminQrcodesListView.vue'
import AdminQrcodeNewView from './views/AdminQrcodesNewView.vue'
import AdminQrcodeEditView from './views/AdminQrcodesEditView.vue'

export class Routing {
  static createRouter() {
    return createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: HomeView,
        },
        {
          path: '/qrcodes',
          name: 'qrcodes',
          component: QrcodesView,
        },
        {
          path: '/qrcodes/:code',
          name: 'qrcode',
            component: QrcodeView,
        },
        {
          path: '/quiz',
          name: 'quiz',
          component: QuizView,
        },
        {
          path: '/users/:uid/redeem',
          name: 'redeem',
          component: QrcodeRedeem,
        },

        // Admin routes
        {
          path: '/admin/qrcodes/new',
          name: 'admin_qrcodes_new',
          component: AdminQrcodeNewView,
        },
        {
          path: '/admin/qrcodes/edit/:id',
          name: 'admin_qrcodes_edit',
          component: AdminQrcodeEditView,
        },
        {
          path: '/admin/qrcodes',
          name: 'admin_qrcodes_list',
          component: AdminQrcodesList,
        },
      ],
    })
  }
}
