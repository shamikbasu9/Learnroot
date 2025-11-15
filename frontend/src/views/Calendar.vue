<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">${view}</h1>
        <p class="text-gray-600 dark:text-gray-400">
          ${view} management module - coming soon
        </p>
      </div>
      
      <div class="card">
        <div class="text-center py-12">
          <div class="mx-auto h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <Settings class="h-6 w-6 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Under Development
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            This module is currently being built and will be available soon.
          </p>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../components/DashboardLayout.vue'
import { Settings } from 'lucide-vue-next'
</script>
