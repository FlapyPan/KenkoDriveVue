import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAppConfig } from '@/stores/app-config'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '主页',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        title: '登录',
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: '关于',
      },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: {
        title: '设置',
      },
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/TestView.vue'),
      meta: {
        title: '测试',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        title: '404',
      },
    },
  ],
})

router.beforeEach((to, from) => {
  const config = useAppConfig()
  // 未登录则跳转到登录页
  // if (!config.isLoggedIn && to.name !== 'login') {
  //   return { name: 'login' }
  // }

  // 返回 false 以取消导航
  return true
})

// 显示加载条
router.beforeEach(async (to) => {
  window.$loadingbar.start()
})

router.afterEach((to: any, from) => {
  if (to.name === 'not-found') {
    window.$loadingbar.error()
  } else {
    window.$loadingbar.finish()
  }

  // 修改标题
  const baseTitle = 'Kenko Drive'
  const subTitle: string = to.meta?.title?.trim() || ''
  document.title = subTitle ? `${baseTitle} | ${subTitle}` : baseTitle
})

router.afterEach(async (to: any) => {
  // 修改当前路由名称
  const config = useAppConfig()
  config.currentRouteName = to.name
})

router.onError((error: any) => {
  window.$loadingbar.error()
  console.log(error)
})

router.isReady().then(() => {
  // 初始化完成
  const config = useAppConfig()
  router.push({ name: config.currentRouteName ?? 'home' })
})
export default router
