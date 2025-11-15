import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = '/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isLoading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    userName: (state) => state.user?.name || null
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials)
        const { token, user } = response.data.data
        
        this.token = token
        this.user = user
        localStorage.setItem('token', token)
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Login failed' 
        }
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      this.isLoading = true
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData)
        return { success: true, message: 'Registration successful' }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Registration failed' 
        }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await axios.post(`${API_BASE_URL}/auth/logout`)
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }
    },

    async checkAuth() {
      if (!this.token) return

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        const response = await axios.get(`${API_BASE_URL}/auth/me`)
        this.user = response.data.data.user
      } catch (error) {
        this.logout()
      }
    },

    async forgotPassword(email) {
      try {
        await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email })
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Request failed' 
        }
      }
    },

    async resetPassword(token, newPassword) {
      try {
        await axios.post(`${API_BASE_URL}/auth/reset-password`, { 
          token, 
          password: newPassword 
        })
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Reset failed' 
        }
      }
    }
  }
})
