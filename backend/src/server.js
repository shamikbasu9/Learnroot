const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { initializeDatabase } = require('./config/database.js')
const authRoutes = require('./routes/auth.js')
const classRoutes = require('./routes/classes.js')
const subjectRoutes = require('./routes/subjects.js')
const teacherRoutes = require('./routes/teachers.js')
const studentRoutes = require('./routes/students.js')
const timetableRoutes = require('./routes/timetable.js')
const calendarRoutes = require('./routes/calendar.js')
const announcementRoutes = require('./routes/announcements.js')
const reportRoutes = require('./routes/reports.js')
const settingRoutes = require('./routes/settings.js')
const gradeRoutes = require('./routes/grades.js')
const dashboardRoutes = require('./routes/dashboard.js')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/timetable', timetableRoutes)
app.use('/api/calendar', calendarRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/settings', settingRoutes)
app.use('/api/grades', gradeRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Learnroot API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  })
})

app.listen(PORT, async () => {
  console.log(`🚀 Learnroot API server running on port ${PORT}`)
  
  // Initialize database tables and migrations
  try {
    await initializeDatabase()
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
  }
})
