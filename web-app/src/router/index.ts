import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/lists',
      name: 'lists',
      component: () => import('@/views/ListsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/lists/new',
      name: 'create-list',
      component: () => import('@/views/CreateListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/lists/:id',
      name: 'list-detail',
      component: () => import('@/views/ListDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('@/views/TasksView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shopping',
      name: 'shopping',
      component: () => import('@/views/ShoppingView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shopping-lists',
      name: 'shopping-lists',
      component: () => import('@/views/ShoppingListsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shopping-list/:id',
      name: 'shopping-list',
      component: () => import('@/views/ShoppingListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/calls',
      name: 'calls',
      component: () => import('@/views/CallsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/meetings',
      name: 'meetings',
      component: () => import('@/views/MeetingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: () => import('@/views/AppointmentsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/appointment-lists',
      name: 'appointment-lists',
      component: () => import('@/views/AppointmentsListsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/appointment-list/:id',
      name: 'appointment-list',
      component: () => import('@/views/AppointmentListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/repairs',
      name: 'repairs',
      component: () => import('@/views/RepairsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ideas-lists',
      name: 'ideas-lists',
      component: () => import('@/views/IdeasListsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/ideas-list/:id',
      name: 'ideas-list',
      component: () => import('@/views/IdeasListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/NotificationsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/voice',
      name: 'voice',
      component: () => import('@/views/VoiceView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/media-gallery',
      name: 'media-gallery',
      component: () => import('@/views/MediaGalleryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Load user data if not already loaded and token exists
  if (!userStore.user && localStorage.getItem('token')) {
    try {
      await userStore.loadUser()
    } catch (error) {
      // If loading user fails, clear token and continue
      localStorage.removeItem('token')
    }
  }
  
  // Prevent infinite redirects
  if (to.path === from.path) {
    next()
    return
  }
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && userStore.isAuthenticated) {
    next('/')
  } else if (to.path === '/' && !userStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
