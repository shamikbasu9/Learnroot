<template>
  <DashboardLayout>
    <div class="p-6 space-y-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Dashboard Overview
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Welcome back, {{ authStore.userName }}! Here's what's happening at your school.
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8">
        <!-- Statistics Cards -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Statistics Overview</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 rounded-lg dark:bg-blue-900">
                  <Users class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="ml-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ dashboardData.statistics.totalStudents }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg dark:bg-green-900">
                  <GraduationCap class="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div class="ml-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Total Teachers</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ dashboardData.statistics.totalTeachers }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 rounded-lg dark:bg-purple-900">
                  <BookOpen class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div class="ml-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ dashboardData.statistics.totalClasses }}
                  </p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
              <div class="flex items-center">
                <div class="p-3 bg-orange-100 rounded-lg dark:bg-orange-900">
                  <Calendar class="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div class="ml-4">
                  <p class="text-sm text-gray-600 dark:text-gray-400">Total Subjects</p>
                  <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                    {{ dashboardData.statistics.totalSubjects }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              @click="$router.push('/classes?action=add')"
              class="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900 transition-colors"
            >
              <Plus class="h-8 w-8 text-gray-400 mb-2" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Add Class</span>
            </button>

            <button
              @click="$router.push('/teachers?action=add')"
              class="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900 transition-colors"
            >
              <UserPlus class="h-8 w-8 text-gray-400 mb-2" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Add Teacher</span>
            </button>

            <button
              @click="$router.push('/timetable?action=create')"
              class="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900 transition-colors"
            >
              <Clock class="h-8 w-8 text-gray-400 mb-2" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Create Timetable</span>
            </button>

            <button
              @click="$router.push('/calendar?action=add')"
              class="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900 transition-colors"
            >
              <CalendarPlus class="h-8 w-8 text-gray-400 mb-2" />
              <span class="text-sm text-gray-600 dark:text-gray-400">Add Event</span>
            </button>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Student Strength Chart -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Student Strength by Grade</h2>
            <div class="space-y-4">
              <div v-for="segment in studentSegments" :key="segment.name" class="flex items-center">
                <div class="w-20 text-sm text-gray-600 dark:text-gray-400">{{ segment.name }}</div>
                <div class="flex-1 mx-4">
                  <div class="bg-gray-200 rounded-full h-6 dark:bg-gray-700">
                    <div
                      class="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                      :style="{ width: segment.percentage + '%' }"
                    >
                      <span class="text-xs text-white font-medium">{{ segment.count }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {{ segment.percentage }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance Snapshot -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Today's Attendance</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Present</span>
                <div class="flex items-center">
                  <div class="w-32 bg-gray-200 rounded-full h-4 mr-3 dark:bg-gray-700">
                    <div class="bg-green-500 h-4 rounded-full" style="width: 0%"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">0%</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Absent</span>
                <div class="flex items-center">
                  <div class="w-32 bg-gray-200 rounded-full h-4 mr-3 dark:bg-gray-700">
                    <div class="bg-red-500 h-4 rounded-full" style="width: 0%"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">0%</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Leave</span>
                <div class="flex items-center">
                  <div class="w-32 bg-gray-200 rounded-full h-4 mr-3 dark:bg-gray-700">
                    <div class="bg-yellow-500 h-4 rounded-full" style="width: 0%"></div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          <div v-if="recentActivities.length === 0" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="p-2 bg-gray-100 rounded-lg dark:bg-gray-600">
                <component :is="activity.icon" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm text-gray-900 dark:text-white">{{ activity.description }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '../components/DashboardLayout.vue'
import { useAuthStore } from '../stores/auth'
import api from '../utils/api'
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Plus,
  UserPlus,
  Clock,
  CalendarPlus,
  UserCheck,
  FileText,
  Bell
} from 'lucide-vue-next'

const authStore = useAuthStore()

// Dashboard data
const dashboardData = ref({
  statistics: {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0
  },
  recentAnnouncements: [],
  upcomingEvents: [],
  classDistribution: [],
  teacherStatus: {
    active: 0,
    inactive: 0,
    unknown: 0
  },
  recentActivity: []
})

const loading = ref(true)
const error = ref(null)

// Student segments data from API
const studentSegments = ref([])

// Recent activities data from API
const recentActivities = ref([])

// Format time ago helper
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Unknown time'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return date.toLocaleDateString()
}

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true
    const response = await api.get('/dashboard')
    dashboardData.value = response.data.data
    
    // Process grades and class distribution data for student segments
    if (response.data.data.allGrades && response.data.data.allGrades.length > 0) {
      // Create student segments from all grades
      const allGradesData = response.data.data.allGrades
      const classDistributionData = response.data.data.classDistribution || []
      
      // Calculate total classes for percentage
      const totalClasses = classDistributionData.reduce((sum, grade) => sum + grade.class_count, 0)
      
      // Merge grades with class distribution data
      studentSegments.value = allGradesData.map(grade => {
        const classData = classDistributionData.find(c => c.grade_name === grade.name)
        return {
          name: grade.name,
          count: classData ? classData.class_count : 0,
          percentage: totalClasses > 0 && classData ? Math.round((classData.class_count / totalClasses) * 100) : 0
        }
      })
    } else {
      studentSegments.value = []
    }
    
    // Process recent activity data
    if (response.data.data.recentActivity && response.data.data.recentActivity.length > 0) {
      recentActivities.value = response.data.data.recentActivity.map(activity => {
        const iconMap = {
          'student': UserCheck,
          'teacher': UserCheck,
          'class': BookOpen,
          'subject': BookOpen,
          'announcement': Bell,
          'event': Calendar
        }
        
        return {
          id: activity.id || activity.type + activity.name,
          description: `${activity.type === 'student' ? 'New student registration' : 'New teacher registration'}: ${activity.name}`,
          time: formatTimeAgo(activity.created_at),
          icon: iconMap[activity.type] || UserCheck
        }
      })
    } else {
      recentActivities.value = []
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    error.value = 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
