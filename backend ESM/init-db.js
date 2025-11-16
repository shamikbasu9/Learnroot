import { testConnection, initializeDatabase } from './src/config/database.js'

console.log('🔍 Testing database connection...')
await testConnection()

console.log('🏗️  Initializing database tables...')
await initializeDatabase()

console.log('✅ Database setup complete!')
process.exit(0)
