const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const { pool } = require('../config/database.js')
const { authenticateToken, authorizeRole } = require('../middleware/auth.js')

const router = express.Router()

// Get all teachers (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [teachers] = await pool.execute(`
      SELECT t.*, u.id as user_id, u.name as user_name, u.email as user_email, u.created_at
      FROM teachers t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.role IN ('moderator', 'teacher') OR t.role IS NULL
      ORDER BY t.created_at DESC
    `)
    
    res.json({
      success: true,
      data: teachers
    })
  } catch (error) {
    console.error('Get teachers error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Add new teacher (school admin only)
router.post('/', authenticateToken, authorizeRole('school_admin'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('grade').notEmpty().withMessage('Grade is required'),
  body('subject').notEmpty().withMessage('Subject is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password, grade, subject } = req.body

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Start transaction
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Create user account
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'moderator']
      )

      const userId = userResult.insertId

      // Create teacher profile
      await connection.execute(
        `INSERT INTO teachers (user_id, name, email, grade, subjects, joining_date, role) 
         VALUES (?, ?, ?, ?, ?, CURDATE(), 'teacher')`,
        [userId, name, email, grade, subject]
      )

      await connection.commit()

      res.json({
        success: true,
        message: 'Teacher added successfully',
        data: {
          id: userId,
          name,
          email,
          grade,
          subject
        }
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Add teacher error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Update teacher (school admin only)
router.put('/:id', authenticateToken, authorizeRole('school_admin'), [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('grade').optional().notEmpty().withMessage('Grade is required'),
  body('subject').optional().notEmpty().withMessage('Subject is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { id } = req.params
    const { name, email, grade, subject } = req.body

    // Check if teacher exists
    const [teachers] = await pool.execute(
      'SELECT id FROM users WHERE id = ? AND role IN (?, ?)',
      [id, 'moderator', 'teacher']
    )

    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      })
    }

    // Check if email already exists (if updating email)
    if (email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      )

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        })
      }
    }

    // Update user info
    const updateFields = []
    const updateValues = []

    if (name) {
      updateFields.push('name = ?')
      updateValues.push(name)
    }
    if (email) {
      updateFields.push('email = ?')
      updateValues.push(email)
    }

    if (updateFields.length > 0) {
      updateValues.push(id)
      await pool.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
    }

    // Update teacher profile
    if (grade || subject) {
      const updateFields = []
      const updateValues = []
      
      if (grade) {
        updateFields.push('grade = ?')
        updateValues.push(grade)
      }
      
      if (subject) {
        updateFields.push('subjects = ?')
        updateValues.push(subject)
      }
      
      if (updateFields.length > 0) {
        updateValues.push(id)
        await pool.execute(
          `UPDATE teachers SET ${updateFields.join(', ')} WHERE user_id = ?`,
          updateValues
        )
      }
    }

    res.json({
      success: true,
      message: 'Teacher updated successfully'
    })
  } catch (error) {
    console.error('Update teacher error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Delete teacher (school admin only)
router.delete('/:id', authenticateToken, authorizeRole('school_admin'), async (req, res) => {
  try {
    const { id } = req.params

    // Check if teacher exists
    const [teachers] = await pool.execute(
      'SELECT id FROM users WHERE id = ? AND role IN (?, ?)',
      [id, 'moderator', 'teacher']
    )

    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      })
    }

    // Delete teacher (will cascade delete from teachers table)
    await pool.execute('DELETE FROM users WHERE id = ?', [id])

    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    })
  } catch (error) {
    console.error('Delete teacher error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Get teacher by ID (protected route)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const [teachers] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.created_at, t.phone, t.gender, 
             t.qualification, t.experience_years, t.grade, t.subjects, t.joining_date, 
             t.salary, t.address, t.status
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      WHERE u.id = ? AND u.role IN ('moderator', 'teacher')
    `, [id])

    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      })
    }

    res.json({
      success: true,
      data: teachers[0]
    })
  } catch (error) {
    console.error('Get teacher error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router
