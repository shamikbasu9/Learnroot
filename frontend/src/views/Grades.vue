<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Grades Management
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Manage grade levels and subjects
          </p>
        </div>
        <button
          v-if="isSchoolAdmin"
          @click="showAddModal = true"
          class="btn btn-primary"
        >
          <Plus class="h-5 w-5 mr-2" />
          Add Grade
        </button>
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
              You have view-only access. Only school administrators can add, edit, or delete grades.
            </p>
          </div>
        </div>
      </div>

      <!-- Grades List -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Grade Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Segment
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subjects
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
                <td colspan="5" class="px-6 py-4 text-center">
                  <div class="spinner"></div>
                </td>
              </tr>
              <tr v-else-if="grades.length === 0">
                <td colspan="5" class="px-6 py-8 text-center">
                  <div class="text-gray-500 dark:text-gray-400">
                    <GraduationCap class="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No grades found</p>
                    <button
                      v-if="isSchoolAdmin"
                      @click="showAddModal = true"
                      class="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Add your first grade
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-for="grade in grades" :key="grade.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ grade.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getSegmentClass(grade.segment)"
                  >
                    {{ grade.segment }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">
                    <span
                      v-for="(subject, index) in grade.subjects_details"
                      :key="subject.id"
                      class="inline-block mr-2 mb-1"
                    >
                      <span
                        class="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {{ subject.name }}
                      </span>
                    </span>
                    <span v-if="!grade.subjects_details || grade.subjects_detail.length === 0" class="text-gray-400">
                      No subjects
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ grade.description || '-' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    v-if="isSchoolAdmin"
                    @click="editGrade(grade)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    v-if="isSchoolAdmin"
                    @click="deleteGrade(grade)"
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
              {{ showEditModal ? 'Edit Grade' : 'Add New Grade' }}
            </h3>
            
            <form @submit.prevent="handleSubmit">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Grade Name
                  </label>
                  <input
                    v-model="formData.name"
                    type="text"
                    required
                    class="form-input"
                    placeholder="e.g., Grade 1, Class 10A"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Segment
                  </label>
                  <select v-model="formData.segment" required class="form-input">
                    <option value="">Select segment</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="sr_secondary">Senior Secondary</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subjects
                  </label>
                  <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                    <div v-for="subject in availableSubjects" :key="subject.id" class="flex items-center">
                      <input
                        type="checkbox"
                        :id="'subject-' + subject.id"
                        v-model="formData.subjects"
                        :value="subject.id"
                        class="mr-2"
                      />
                      <label :for="'subject-' + subject.id" class="text-sm">
                        {{ subject.name }} ({{ subject.type }})
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description (optional)
                  </label>
                  <textarea
                    v-model="formData.description"
                    rows="3"
                    class="form-input"
                    placeholder="Grade description..."
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
import { Plus, GraduationCap } from 'lucide-vue-next'

const authStore = useAuthStore()

const isSchoolAdmin = computed(() => 
  authStore.user?.role === 'school_admin' || authStore.user?.role === 'super_admin'
)

const grades = ref([])
const subjects = ref([])
const loading = ref(true)
const submitting = ref(false)

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingGrade = ref(null)

const formData = ref({
  name: '',
  segment: '',
  subjects: [],
  description: ''
})

const availableSubjects = computed(() => subjects.value)

const getSegmentClass = (segment) => {
  const classes = {
    primary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    secondary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    sr_secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
  return classes[segment] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const fetchGrades = async () => {
  try {
    const response = await api.get('/grades')
    grades.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching grades:', error)
  } finally {
    loading.value = false
  }
}

const fetchSubjects = async () => {
  try {
    const response = await api.get('/subjects')
    subjects.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching subjects:', error)
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    segment: '',
    subjects: [],
    description: ''
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingGrade.value = null
  resetForm()
}

const editGrade = (grade) => {
  editingGrade.value = grade
  formData.value = {
    name: grade.name,
    segment: grade.segment,
    subjects: grade.subjects || [],
    description: grade.description || ''
  }
  showEditModal.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    if (showEditModal.value) {
      await api.put(`/grades/${editingGrade.value.id}`, formData.value)
    } else {
      await api.post('/grades', formData.value)
    }
    
    await fetchGrades()
    closeModal()
  } catch (error) {
    console.error('Error saving grade:', error)
  } finally {
    submitting.value = false
  }
}

const deleteGrade = async (grade) => {
  if (!confirm(`Are you sure you want to delete "${grade.name}"?`)) {
    return
  }
  
  try {
    await api.delete(`/grades/${grade.id}`)
    await fetchGrades()
  } catch (error) {
    console.error('Error deleting grade:', error)
  }
}

onMounted(async () => {
  await Promise.all([fetchGrades(), fetchSubjects()])
})
</script>
