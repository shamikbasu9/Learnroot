const { testConnection, initializeDatabase } = require('./src/config/database.js')

const initDatabase = async () => {
  console.log('🔍 Testing database connection...')
  await testConnection()

  console.log('🏗️  Initializing database tables...')
  await initializeDatabase()

  console.log('✅ Database setup complete!')
  process.exit(0)
}

initDatabase().catch(error => {
  console.error('❌ Database initialization failed:', error)
  process.exit(1)
})
