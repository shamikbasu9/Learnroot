const express = require('express')
const { pool } = require('../config/database.js')
const { authenticateToken, authorizeRole } = require('../middleware/auth.js')

const router = express.Router()

// Get dashboard statistics (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get total students count
    const [studentsCount] = await pool.execute('SELECT COUNT(*) as count FROM students')
    
    // Get total teachers count
    const [teachersCount] = await pool.execute('SELECT COUNT(*) as count FROM teachers WHERE role = "teacher" OR role IS NULL')
    
    // Get total classes count
    const [classesCount] = await pool.execute('SELECT COUNT(*) as count FROM classes')
    
    // Get total subjects count
    const [subjectsCount] = await pool.execute('SELECT COUNT(*) as count FROM subjects')
    
    // Get recent announcements
    const [recentAnnouncements] = await pool.execute(`
      SELECT id, title, content as message, created_at
      FROM announcements
      ORDER BY created_at DESC
      LIMIT 5
    `)
    
    // Get upcoming events (from calendar)
    const [upcomingEvents] = await pool.execute(`
      SELECT id, title, description, event_date, event_type
      FROM calendar
      WHERE event_date >= CURDATE()
      ORDER BY event_date ASC
      LIMIT 5
    `)
    
    // Get class distribution by grade
    const [classDistribution] = await pool.execute(`
      SELECT g.name as grade_name, COUNT(c.id) as class_count
      FROM grades g
      LEFT JOIN classes c ON g.name = c.grade
      GROUP BY g.id, g.name
      ORDER BY g.segment, g.name
    `)
    
    // Get all grades for student strength chart
    const [allGrades] = await pool.execute(`
      SELECT name, segment
      FROM grades
      ORDER BY segment, name
    `)
    
    // Get teacher status distribution
    const [teacherStatus] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status IS NULL THEN 1 ELSE 0 END) as unknown
      FROM teachers
      WHERE role = 'teacher' OR role IS NULL
    `)
    
    // Get recent activity (latest registrations)
    const [recentActivity] = await pool.execute(`
      (SELECT 'student' as type, name, created_at FROM students ORDER BY created_at DESC LIMIT 3)
      UNION ALL
      (SELECT 'teacher' as type, name, created_at FROM teachers ORDER BY created_at DESC LIMIT 3)
      ORDER BY created_at DESC
      LIMIT 5
    `)

    res.json({
      success: true,
      data: {
        statistics: {
          totalStudents: studentsCount[0].count,
          totalTeachers: teachersCount[0].count,
          totalClasses: classesCount[0].count,
          totalSubjects: subjectsCount[0].count
        },
        recentAnnouncements,
        upcomingEvents,
        classDistribution,
        allGrades,
        teacherStatus: teacherStatus[0],
        recentActivity
      }
    })
  } catch (error) {
    console.error('Get dashboard data error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router
