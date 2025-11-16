<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Subjects Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Manage subjects and their properties
          </p>
        </div>
        <button
          v-if="isSchoolAdmin"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          <Plus class="h-5 w-5 mr-2" />
          Add Subject
        </button>
      </div>

      <!-- Filters -->
      <div class="card p-4">
        <div class="flex flex-wrap gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Stream
            </label>
            <select v-model="filters.stream" @change="fetchSubjects" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
              <option value="">All Streams</option>
              <option value="science">Science</option>
              <option value="commerce">Commerce</option>
              <option value="humanities">Humanities</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select v-model="filters.type" @change="fetchSubjects" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
              <option value="">All Types</option>
              <option value="core">Core</option>
              <option value="elective">Elective</option>
              <option value="optional">Optional</option>
            </select>
          </div>
        </div>
      </div>

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
              You have view-only access. Only school administrators can add, edit, or delete subjects.
            </p>
          </div>
        </div>
      </div>

      <!-- Subjects List -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subject Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stream
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="6" class="px-6 py-4 text-center">
                  <div class="spinner"></div>
                </td>
              </tr>
              <tr v-else-if="subjects.length === 0">
                <td colspan="6" class="px-6 py-8 text-center">
                  <div class="text-gray-500 dark:text-gray-400">
                    <BookOpen class="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No subjects found</p>
                    <button
                      v-if="isSchoolAdmin"
                      @click="showAddModal = true"
                      class="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Add your first subject
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-for="subject in subjects" :key="subject.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ subject.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ subject.code }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getTypeClass(subject.type)"
                  >
                    {{ subject.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getStreamClass(subject.stream)"
                  >
                    {{ subject.stream }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ subject.description || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    v-if="isSchoolAdmin"
                    @click="editSubject(subject)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    v-if="isSchoolAdmin"
                    @click="deleteSubject(subject)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-black opacity-50" @click="closeModal"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {{ showEditModal ? 'Edit Subject' : 'Add New Subject' }}
            </h3>
            
            <form @submit.prevent="handleSubmit">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject Name
                  </label>
                  <input
                    v-model="formData.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="e.g., Mathematics, Physics"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject Code
                  </label>
                  <input
                    v-model="formData.code"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="e.g., MATH, PHY"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select v-model="formData.type" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                    <option value="">Select type</option>
                    <option value="core">Core</option>
                    <option value="elective">Elective</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stream
                  </label>
                  <select v-model="formData.stream" required class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400">
                    <option value="">Select stream</option>
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="humanities">Humanities</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description (optional)
                  </label>
                  <textarea
                    v-model="formData.description"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Subject description..."
                  ></textarea>
                </div>
              </div>

              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="submitting"
                  class="btn btn-primary"
                >
                  {{ submitting ? 'Saving...' : (showEditModal ? 'Update' : 'Add') }}
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import api from '../utils/api'
import DashboardLayout from '../components/DashboardLayout.vue'
import { Plus, BookOpen } from 'lucide-vue-next'

const authStore = useAuthStore()

const isSchoolAdmin = computed(() => 
  authStore.user?.role === 'school_admin' || authStore.user?.role === 'super_admin'
)

const subjects = ref([])
const loading = ref(true)
const submitting = ref(false)

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingSubject = ref(null)

const filters = ref({
  stream: '',
  type: ''
})

const formData = ref({
  name: '',
  code: '',
  type: '',
  stream: '',
  description: ''
})

const getTypeClass = (type) => {
  const classes = {
    core: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    elective: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    optional: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }
  return classes[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const getStreamClass = (stream) => {
  const classes = {
    science: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    commerce: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    humanities: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  return classes[stream] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const fetchSubjects = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams()
    
    if (filters.value.stream) {
      params.append('stream', filters.value.stream)
    }
    
    if (filters.value.type) {
      params.append('type', filters.value.type)
    }
    
    const response = await api.get(`/subjects?${params.toString()}`)
    subjects.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching subjects:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    code: '',
    type: '',
    stream: '',
    description: ''
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingSubject.value = null
  resetForm()
}

const editSubject = (subject) => {
  editingSubject.value = subject
  formData.value = {
    name: subject.name,
    code: subject.code,
    type: subject.type,
    stream: subject.stream,
    description: subject.description || ''
  }
  showEditModal.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    if (showEditModal.value) {
      await api.put(`/subjects/${editingSubject.value.id}`, formData.value)
    } else {
      await api.post('/subjects', formData.value)
    }
    
    await fetchSubjects()
    closeModal()
  } catch (error) {
    console.error('Error saving subject:', error)
  } finally {
    submitting.value = false
  }
}

const deleteSubject = async (subject) => {
  if (!confirm(`Are you sure you want to delete "${subject.name}"?`)) {
    return
  }
  
  try {
    await api.delete(`/subjects/${subject.id}`)
    await fetchSubjects()
  } catch (error) {
    console.error('Error deleting subject:', error)
  }
}

onMounted(() => {
  fetchSubjects()
})
</script>
