<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Teachers Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Manage teacher accounts and information
          </p>
        </div>
        <button
          v-if="isSchoolAdmin"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          <UserPlus class="h-5 w-5 mr-2" />
          Add Teacher
        </button>
      </div>

      <!-- Teachers List -->
      <div class="card">
        <!-- Permission warning for non-admin users -->
        <div v-if="!isSchoolAdmin" class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-800 dark:text-yellow-200">
                You have view-only access. Only school administrators can add, edit, or delete teachers.
              </p>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Teacher
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Grade
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subject
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="7" class="px-6 py-4 text-center">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
              <tr v-else-if="teachers.length === 0">
                <td colspan="7" class="px-6 py-8 text-center">
                  <GraduationCap class="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p class="text-gray-500 dark:text-gray-400">No teachers added yet</p>
                  <button
                    v-if="isSchoolAdmin"
                    @click="showAddModal = true"
                    class="mt-2 text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Add your first teacher
                  </button>
                </td>
              </tr>
              <tr v-for="teacher in teachers" :key="teacher.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span class="text-sm font-medium text-blue-600">
                          {{ teacher.name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ teacher.name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        ID: {{ teacher.id }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">{{ teacher.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">{{ getGradeName(teacher.grade) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ getSubjectName(teacher.subject) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="teacher.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
                    {{ teacher.status || 'active' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(teacher.joining_date || teacher.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    v-if="isSchoolAdmin"
                    @click="editTeacher(teacher)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    v-if="isSchoolAdmin"
                    @click="deleteTeacher(teacher)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                  <span v-if="!isSchoolAdmin" class="text-gray-400 text-sm">
                    No permissions
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Teacher Modal -->
      <div v-if="showAddModal || editingTeacher" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

          <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form @submit.prevent="handleSubmit">
              <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  {{ editingTeacher ? 'Edit Teacher' : 'Add New Teacher' }}
                </h3>
                
                <!-- Error message -->
                <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
                </div>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name *
                    </label>
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address *
                    </label>
                    <input
                      v-model="form.email"
                      type="email"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="teacher@school.com"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password *
                    </label>
                    <input
                      v-model="form.password"
                      type="password"
                      required
                      minlength="6"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Grade *
                    </label>
                    <select
                      v-model="form.grade"
                      required
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select Grade</option>
                      <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                        {{ grade.name }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject *
                    </label>
                    <select
                      v-model="form.subject"
                      required
                      :disabled="!form.grade"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select Subject</option>
                      <option v-for="subject in availableSubjects" :key="subject.id" :value="subject.id">
                        {{ subject.name }}
                      </option>
                    </select>
                    <p v-if="!form.grade" class="mt-1 text-sm text-gray-500">
                      Please select a grade first
                    </p>
                    <p v-else-if="availableSubjects.length === 0" class="mt-1 text-sm text-gray-500">
                      No subjects available for this grade
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  :disabled="submitting"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  <span v-if="submitting">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ editingTeacher ? 'Updating...' : 'Adding...' }}
                  </span>
                  <span v-else>
                    {{ editingTeacher ? 'Update Teacher' : 'Add Teacher' }}
                  </span>
                </button>
                <button
                  type="button"
                  @click="closeModal"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout.vue'
import { UserPlus, GraduationCap } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth.js'

const API_BASE_URL = '/api'
const authStore = useAuthStore()

// Check if user is school admin
const isSchoolAdmin = computed(() => authStore.userRole === 'school_admin')

const teachers = ref([])
const grades = ref([])
const subjects = ref([])
const loading = ref(false)
const showAddModal = ref(false)
const editingTeacher = ref(null)
const submitting = ref(false)
const error = ref('')

const form = ref({
  name: '',
  email: '',
  password: '',
  grade: '',
  subject: ''
})

const fetchTeachers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await axios.get(`${API_BASE_URL}/teachers`)
    teachers.value = response.data.data || []
  } catch (err) {
    console.error('Error fetching teachers:', err)
    if (err.response?.status === 401) {
      error.value = 'Please login to view teachers'
    } else if (err.response?.status === 403) {
      error.value = 'You do not have permission to view teachers'
    } else {
      // For other errors, don't show them automatically
      // error.value = 'Failed to load teachers'
    }
  } finally {
    loading.value = false
  }
}

const fetchGrades = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/grades`)
    grades.value = response.data.data || []
  } catch (err) {
    console.error('Error fetching grades:', err)
  }
}

const fetchSubjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subjects`)
    subjects.value = response.data.data || []
  } catch (err) {
    console.error('Error fetching subjects:', err)
  }
}

const availableSubjects = computed(() => {
  if (!form.value.grade) return []
  const selectedGrade = grades.value.find(g => g.id === form.value.grade)
  if (!selectedGrade || !selectedGrade.subjects) return []
  
  return subjects.value.filter(subject => 
    selectedGrade.subjects.includes(subject.id)
  )
})

const getGradeName = (gradeId) => {
  const grade = grades.value.find(g => g.id === gradeId)
  return grade ? grade.name : gradeId || 'Not assigned'
}

const getSubjectName = (subjectId) => {
  const subject = subjects.value.find(s => s.id === subjectId)
  return subject ? subject.name : subjectId || 'Not assigned'
}

const handleSubmit = async () => {
  if (!isSchoolAdmin.value) {
    error.value = 'You do not have permission to perform this action'
    return
  }
  
  submitting.value = true
  error.value = ''
  
  try {
    if (editingTeacher.value) {
      // Update teacher
      await axios.put(`${API_BASE_URL}/teachers/${editingTeacher.value.id}`, {
        name: form.value.name,
        email: form.value.email,
        grade: form.value.grade,
        subject: form.value.subject
      })
    } else {
      // Add new teacher
      await axios.post(`${API_BASE_URL}/teachers`, form.value)
    }
    
    await fetchTeachers()
    closeModal()
  } catch (err) {
    console.error('Error saving teacher:', err)
    if (err.response?.status === 403) {
      error.value = 'You do not have permission to perform this action'
    } else {
      error.value = err.response?.data?.message || 'Failed to save teacher'
    }
  } finally {
    submitting.value = false
  }
}

const editTeacher = (teacher) => {
  editingTeacher.value = teacher
  form.value = {
    name: teacher.name,
    email: teacher.email,
    password: '',
    grade: teacher.grade || '',
    subject: teacher.subject || ''
  }
}

const deleteTeacher = async (teacher) => {
  if (!isSchoolAdmin.value) {
    error.value = 'You do not have permission to perform this action'
    return
  }
  
  if (!confirm(`Are you sure you want to delete ${teacher.name}? This action cannot be undone.`)) {
    return
  }
  
  try {
    await axios.delete(`${API_BASE_URL}/teachers/${teacher.id}`)
    await fetchTeachers()
  } catch (err) {
    console.error('Error deleting teacher:', err)
    if (err.response?.status === 403) {
      error.value = 'You do not have permission to perform this action'
    } else {
      error.value = 'Failed to delete teacher'
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingTeacher.value = null
  form.value = {
    name: '',
    email: '',
    password: '',
    grade: '',
    subject: ''
  }
  error.value = ''
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

onMounted(() => {
  fetchTeachers()
  fetchGrades()
  fetchSubjects()
})
</script>
