import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import classRoutes from './routes/classes.js'
import subjectRoutes from './routes/subjects.js'
import teacherRoutes from './routes/teachers.js'
import studentRoutes from './routes/students.js'
import timetableRoutes from './routes/timetable.js'
import calendarRoutes from './routes/calendar.js'
import announcementRoutes from './routes/announcements.js'
import reportRoutes from './routes/reports.js'
import settingRoutes from './routes/settings.js'

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

app.listen(PORT, () => {
  console.log(`🚀 Learnroot API server running on port ${PORT}`)
})
