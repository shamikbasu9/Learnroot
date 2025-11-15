<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 lg:flex">
    <!-- Mobile sidebar backdrop -->
    <div
      v-if="sidebarOpen && isMobile"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen class="h-5 w-5 text-white" />
            </div>
            <span class="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              Learnroot
            </span>
          </div>
          <button
            @click="sidebarOpen = false"
            class="lg:hidden"
          >
            <X class="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              $route.path === item.href
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 mr-3" />
            {{ item.name }}
          </router-link>
        </nav>

        <!-- User menu -->
        <div class="border-t border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center">
            <div class="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User class="h-5 w-5 text-gray-600" />
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ authStore.userName }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {{ authStore.userRole }}
              </p>
            </div>
            <button
              @click="handleLogout"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <LogOut class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col lg:pl-0">
      <!-- Top bar -->
      <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden"
          >
            <Menu class="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>

          <div class="flex items-center space-x-4">
            <!-- Search -->
            <div class="hidden md:block">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <!-- Notifications -->
            <button class="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Bell class="h-5 w-5" />
              <span class="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <!-- Dark mode toggle -->
            <button
              @click="toggleDarkMode"
              class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Sun v-if="!isDark" class="h-5 w-5" />
              <Moon v-else class="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  BookOpen,
  LayoutDashboard,
  Users,
  BookOpen as SubjectIcon,
  GraduationCap,
  Award,
  Calendar,
  Clock,
  Megaphone,
  FileText,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  Sun,
  Moon
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const isMobile = ref(false)
const isDark = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Classes', href: '/classes', icon: Users },
  { name: 'Subjects', href: '/subjects', icon: SubjectIcon },
  { name: 'Grades', href: '/grades', icon: Award },
  { name: 'Teachers', href: '/teachers', icon: GraduationCap },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Timetable', href: '/timetable', icon: Clock },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('darkMode', isDark.value)
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Check for saved dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>
