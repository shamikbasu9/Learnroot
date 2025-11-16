const express = require('express')
const router = express.Router()

// TODO: Implement ${route} routes

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '${route} endpoint - coming soon',
    data: []
  })
})

module.exports = router
