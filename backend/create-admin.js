const bcrypt = require('bcryptjs')
const { pool } = require('./src/config/database.js')

const createAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash('admin123', salt)

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@learnroot.com', hashedPassword, 'super_admin']
    )

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@learnroot.com')
    console.log('🔑 Password: admin123')
    console.log('🆔 User ID:', result.insertId)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  Admin user already exists')
      console.log('📧 Email: admin@learnroot.com')
      console.log('🔑 Password: admin123')
    } else {
      console.error('❌ Error creating admin:', error.message)
    }
  } finally {
    await pool.end()
    process.exit(0)
  }
}

createAdmin()
