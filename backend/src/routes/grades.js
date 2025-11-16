const express = require('express')
const { body, validationResult } = require('express-validator')
const { pool } = require('../config/database.js')
const { authenticateToken, authorizeRole } = require('../middleware/auth.js')

const router = express.Router()

// Get all grades (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [grades] = await pool.execute(`
      SELECT g.*
      FROM grades g
      ORDER BY g.segment, g.name
    `)
    
    // Parse subjects JSON strings back to arrays and fetch subject details
    const gradesWithParsedSubjects = await Promise.all(grades.map(async (grade) => {
      const subjectIds = grade.subjects ? JSON.parse(grade.subjects) : []
      
      let subjectsDetails = []
      if (subjectIds.length > 0) {
        const placeholders = subjectIds.map(() => '?').join(',')
        const [subjects] = await pool.execute(
          `SELECT id, name FROM subjects WHERE id IN (${placeholders}) ORDER BY name`,
          subjectIds
        )
        subjectsDetails = subjects
      }
      
      return {
        ...grade,
        subjects: subjectIds,
        subjects_details: subjectsDetails
      }
    }))
    
    res.json({
      success: true,
      data: gradesWithParsedSubjects
    })
  } catch (error) {
    console.error('Get grades error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Get grade by ID (protected route)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const [grades] = await pool.execute(`
      SELECT g.*
      FROM grades g
      WHERE g.id = ?
    `, [id])

    if (grades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      })
    }

    // Parse subjects JSON string back to array and fetch subject details
    const grade = grades[0]
    const subjectIds = grade.subjects ? JSON.parse(grade.subjects) : []
    
    let subjectsDetails = []
    if (subjectIds.length > 0) {
      const placeholders = subjectIds.map(() => '?').join(',')
      const [subjects] = await pool.execute(
        `SELECT id, name FROM subjects WHERE id IN (${placeholders}) ORDER BY name`,
        subjectIds
      )
      subjectsDetails = subjects
    }
    
    grade.subjects = subjectIds
    grade.subjects_details = subjectsDetails

    res.json({
      success: true,
      data: grade
    })
  } catch (error) {
    console.error('Get grade error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Add new grade (school admin or super admin only)
router.post('/', authenticateToken, authorizeRole('school_admin', 'super_admin'), [
  body('name').notEmpty().withMessage('Grade name is required'),
  body('segment').isIn(['primary', 'secondary', 'sr_secondary']).withMessage('Invalid segment'),
  body('subjects').isArray().withMessage('Subjects must be an array'),
  body('subjects.*').isInt().withMessage('Each subject must be a valid ID')
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

    const { name, segment, subjects, description } = req.body

    // Check if grade name already exists
    const [existingGrades] = await pool.execute(
      'SELECT id FROM grades WHERE name = ?',
      [name]
    )

    if (existingGrades.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade name already exists'
      })
    }

    // Verify all subjects exist
    if (subjects && subjects.length > 0) {
      const placeholders = subjects.map(() => '?').join(',')
      const [validSubjects] = await pool.execute(
        `SELECT id FROM subjects WHERE id IN (${placeholders})`,
        subjects
      )

      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more subjects are invalid'
        })
      }
    }

    // Create grade
    const [result] = await pool.execute(
      'INSERT INTO grades (name, segment, subjects, description) VALUES (?, ?, ?, ?)',
      [name, segment, JSON.stringify(subjects || []), description || null]
    )

    res.status(201).json({
      success: true,
      message: 'Grade added successfully',
      data: {
        id: result.insertId,
        name,
        segment,
        subjects,
        description
      }
    })
  } catch (error) {
    console.error('Add grade error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Update grade (school admin or super admin only)
router.put('/:id', authenticateToken, authorizeRole('school_admin', 'super_admin'), [
  body('name').optional().notEmpty().withMessage('Grade name cannot be empty'),
  body('segment').optional().isIn(['primary', 'secondary', 'sr_secondary']).withMessage('Invalid segment'),
  body('subjects').optional().isArray().withMessage('Subjects must be an array'),
  body('subjects.*').optional().isInt().withMessage('Each subject must be a valid ID')
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
    const { name, segment, subjects, description } = req.body

    // Check if grade exists
    const [grades] = await pool.execute(
      'SELECT id FROM grades WHERE id = ?',
      [id]
    )

    if (grades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      })
    }

    // Check if grade name already exists (if updating name)
    if (name) {
      const [existingGrades] = await pool.execute(
        'SELECT id FROM grades WHERE name = ? AND id != ?',
        [name, id]
      )

      if (existingGrades.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Grade name already exists'
        })
      }
    }

    // Verify all subjects exist (if updating subjects)
    if (subjects && subjects.length > 0) {
      const placeholders = subjects.map(() => '?').join(',')
      const [validSubjects] = await pool.execute(
        `SELECT id FROM subjects WHERE id IN (${placeholders})`,
        subjects
      )

      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more subjects are invalid'
        })
      }
    }

    // Update grade
    const updateFields = []
    const updateValues = []

    if (name) {
      updateFields.push('name = ?')
      updateValues.push(name)
    }

    if (segment) {
      updateFields.push('segment = ?')
      updateValues.push(segment)
    }

    if (subjects !== undefined) {
      updateFields.push('subjects = ?')
      updateValues.push(JSON.stringify(subjects))
    }

    if (description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(description)
    }

    if (updateFields.length > 0) {
      updateValues.push(id)
      await pool.execute(
        `UPDATE grades SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
    }

    res.json({
      success: true,
      message: 'Grade updated successfully'
    })
  } catch (error) {
    console.error('Update grade error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Delete grade (school admin or super admin only)
router.delete('/:id', authenticateToken, authorizeRole('school_admin', 'super_admin'), async (req, res) => {
  try {
    const { id } = req.params

    // Check if grade exists
    const [grades] = await pool.execute(
      'SELECT id FROM grades WHERE id = ?',
      [id]
    )

    if (grades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      })
    }

    // Delete grade
    await pool.execute('DELETE FROM grades WHERE id = ?', [id])

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    })
  } catch (error) {
    console.error('Delete grade error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

module.exports = router
