import express from 'express'
import { body, validationResult } from 'express-validator'
import { pool } from '../config/database.js'
import { authenticateToken, authorizeRole } from '../middleware/auth.js'

const router = express.Router()

// Get all subjects (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { stream, type } = req.query
    
    let query = `
      SELECT s.*, 
             JSON_ARRAYAGG(g.name) as grade_names
      FROM subjects s
      LEFT JOIN grades g ON JSON_CONTAINS(g.subjects, CAST(s.id AS JSON))
    `
    
    const conditions = []
    const params = []
    
    if (stream) {
      conditions.push('s.stream = ?')
      params.push(stream)
    }
    
    if (type) {
      conditions.push('s.type = ?')
      params.push(type)
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    
    query += ' GROUP BY s.id ORDER BY s.name'
    
    const [subjects] = await pool.execute(query, params)
    
    res.json({
      success: true,
      data: subjects
    })
  } catch (error) {
    console.error('Get subjects error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Get subject by ID (protected route)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const [subjects] = await pool.execute(`
      SELECT s.*, 
             JSON_ARRAYAGG(g.name) as grade_names
      FROM subjects s
      LEFT JOIN grades g ON JSON_CONTAINS(g.subjects, CAST(s.id AS JSON))
      WHERE s.id = ?
      GROUP BY s.id
    `, [id])

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      })
    }

    res.json({
      success: true,
      data: subjects[0]
    })
  } catch (error) {
    console.error('Get subject error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Add new subject (school admin or super admin only)
router.post('/', authenticateToken, authorizeRole('school_admin', 'super_admin'), [
  body('name').notEmpty().withMessage('Subject name is required'),
  body('code').notEmpty().withMessage('Subject code is required'),
  body('type').isIn(['core', 'elective', 'optional']).withMessage('Invalid type'),
  body('stream').isIn(['science', 'commerce', 'humanities', 'general']).withMessage('Invalid stream')
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

    const { name, code, type, stream, description } = req.body

    // Check if subject code already exists
    const [existingSubjects] = await pool.execute(
      'SELECT id FROM subjects WHERE code = ?',
      [code]
    )

    if (existingSubjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists'
      })
    }

    // Create subject
    const [result] = await pool.execute(
      'INSERT INTO subjects (name, code, type, stream, description) VALUES (?, ?, ?, ?, ?)',
      [name, code, type, stream, description || null]
    )

    res.status(201).json({
      success: true,
      message: 'Subject added successfully',
      data: {
        id: result.insertId,
        name,
        code,
        type,
        stream,
        description
      }
    })
  } catch (error) {
    console.error('Add subject error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Update subject (school admin or super admin only)
router.put('/:id', authenticateToken, authorizeRole('school_admin', 'super_admin'), [
  body('name').optional().notEmpty().withMessage('Subject name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Subject code cannot be empty'),
  body('type').optional().isIn(['core', 'elective', 'optional']).withMessage('Invalid type'),
  body('stream').optional().isIn(['science', 'commerce', 'humanities', 'general']).withMessage('Invalid stream')
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
    const { name, code, type, stream, description } = req.body

    // Check if subject exists
    const [subjects] = await pool.execute(
      'SELECT id FROM subjects WHERE id = ?',
      [id]
    )

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      })
    }

    // Check if subject code already exists (if updating code)
    if (code) {
      const [existingSubjects] = await pool.execute(
        'SELECT id FROM subjects WHERE code = ? AND id != ?',
        [code, id]
      )

      if (existingSubjects.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Subject code already exists'
        })
      }
    }

    // Update subject
    const updateFields = []
    const updateValues = []

    if (name) {
      updateFields.push('name = ?')
      updateValues.push(name)
    }

    if (code) {
      updateFields.push('code = ?')
      updateValues.push(code)
    }

    if (type) {
      updateFields.push('type = ?')
      updateValues.push(type)
    }

    if (stream) {
      updateFields.push('stream = ?')
      updateValues.push(stream)
    }

    if (description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(description)
    }

    if (updateFields.length > 0) {
      updateValues.push(id)
      await pool.execute(
        `UPDATE subjects SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
    }

    res.json({
      success: true,
      message: 'Subject updated successfully'
    })
  } catch (error) {
    console.error('Update subject error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Delete subject (school admin or super admin only)
router.delete('/:id', authenticateToken, authorizeRole('school_admin', 'super_admin'), async (req, res) => {
  try {
    const { id } = req.params

    // Check if subject exists
    const [subjects] = await pool.execute(
      'SELECT id FROM subjects WHERE id = ?',
      [id]
    )

    if (subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      })
    }

    // Check if subject is being used in any grades
    const [gradesUsingSubject] = await pool.execute(
      'SELECT id FROM grades WHERE JSON_CONTAINS(subjects, ?)',
      [JSON.stringify(id)]
    )

    if (gradesUsingSubject.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject that is being used in grades'
      })
    }

    // Delete subject
    await pool.execute('DELETE FROM subjects WHERE id = ?', [id])

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    })
  } catch (error) {
    console.error('Delete subject error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

export default router
