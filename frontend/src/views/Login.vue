<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <div class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <BookOpen class="h-8 w-8 text-white" />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Learnroot Admin
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your admin dashboard
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="admin@learnroot.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <button
            type="button"
            @click="showForgotPassword = true"
            class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Forgot password?
          </button>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full btn btn-primary py-3 text-lg"
        >
          <span v-if="authStore.isLoading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>

        <div class="mt-6 text-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
          </span>
          <button
            type="button"
            @click="showRegister = true"
            class="ml-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
          >
            Sign up
          </button>
        </div>
      </form>

      <!-- Registration Modal -->
      <div v-if="showRegister" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold mb-4 dark:text-white">Create Admin Account</h3>
          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                v-model="registerForm.name"
                type="text"
                required
                placeholder="John Doe"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                v-model="registerForm.email"
                type="email"
                required
                placeholder="admin@learnroot.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                v-model="registerForm.password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                v-model="registerForm.role"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="super_admin">Super Admin</option>
                <option value="school_admin">School Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            <div v-if="registerError" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {{ registerError }}
            </div>
            <div class="flex space-x-3">
              <button
                type="submit"
                :disabled="authStore.isLoading"
                class="flex-1 btn btn-primary"
              >
                <span v-if="authStore.isLoading">Creating...</span>
                <span v-else>Create Account</span>
              </button>
              <button
                type="button"
                @click="showRegister = false"
                class="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Forgot Password Modal -->
      <div v-if="showForgotPassword" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 class="text-lg font-semibold mb-4 dark:text-white">Reset Password</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <input
            v-model="forgotEmail"
            type="email"
            placeholder="your@email.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <div class="flex space-x-3">
            <button
              @click="handleForgotPassword"
              class="flex-1 btn btn-primary"
            >
              Send Reset Link
            </button>
            <button
              @click="showForgotPassword = false"
              class="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { BookOpen } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const error = ref('')
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const showRegister = ref(false)
const registerError = ref('')
const registerForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'super_admin'
})

const handleLogin = async () => {
  error.value = ''
  
  const result = await authStore.login({
    email: form.value.email,
    password: form.value.password
  })

  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.message
  }
}

const handleForgotPassword = async () => {
  if (!forgotEmail.value) return
  
  const result = await authStore.forgotPassword(forgotEmail.value)
  
  if (result.success) {
    showForgotPassword.value = false
    forgotEmail.value = ''
    // Show success message
  } else {
    error.value = result.message
  }
}

const handleRegister = async () => {
  registerError.value = ''
  
  const result = await authStore.register({
    name: registerForm.value.name,
    email: registerForm.value.email,
    password: registerForm.value.password,
    role: registerForm.value.role
  })

  if (result.success) {
    showRegister.value = false
    registerForm.value = {
      name: '',
      email: '',
      password: '',
      role: 'super_admin'
    }
    // Show success message and optionally log them in
    error.value = 'Account created successfully! You can now sign in.'
  } else {
    registerError.value = result.message
  }
}
</script>
