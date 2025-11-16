const mysql = require('mysql2/promise')

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'learnroot_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Database connected successfully')
    connection.release()
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection()
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`)
    await connection.query(`USE ${dbConfig.database}`)
    
    // Users table for authentication
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'school_admin', 'moderator') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    // Teachers table (must be created before classes)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        gender ENUM('male', 'female', 'other'),
        qualification VARCHAR(255),
        experience_years INT DEFAULT 0,
        subjects TEXT,
        joining_date DATE,
        salary DECIMAL(10,2),
        address TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    
    // Subjects table (must be created before timetable)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        type ENUM('core', 'elective', 'optional') DEFAULT 'core',
        stream ENUM('science', 'commerce', 'humanities', 'general'),
        grades TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Grades table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        segment ENUM('primary', 'secondary', 'sr_secondary') NOT NULL,
        subjects JSON,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    // Classes table (can reference teachers now)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        segment ENUM('primary', 'secondary', 'sr_secondary') NOT NULL,
        grade VARCHAR(20) NOT NULL,
        section VARCHAR(10),
        class_teacher_id INT,
        max_students INT DEFAULT 40,
        current_students INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
      )
    `)
    
    // Students table (can reference classes now)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admission_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        gender ENUM('male', 'female', 'other'),
        date_of_birth DATE,
        class_id INT,
        section VARCHAR(10),
        roll_number INT,
        parent_name VARCHAR(255),
        parent_phone VARCHAR(20),
        parent_email VARCHAR(255),
        address TEXT,
        admission_date DATE,
        status ENUM('active', 'inactive', 'transferred') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
      )
    `)
    
    // Timetable table (can reference classes, subjects, teachers now)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS timetable (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL,
        period_number INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        room VARCHAR(50),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        academic_year VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
        UNIQUE KEY unique_schedule (class_id, day_of_week, period_number)
      )
    `)
    
    // Events table (can reference users now)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('holiday', 'exam', 'ptm', 'activity', 'other') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        start_time TIME,
        end_time TIME,
        location VARCHAR(255),
        target_audience TEXT,
        status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    
    // Announcements table (can reference users now)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('general', 'urgent', 'academic', 'event') DEFAULT 'general',
        target_audience TEXT,
        attachments TEXT,
        expiry_date DATE,
        status ENUM('active', 'expired') DEFAULT 'active',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    
    // Migration: Add user_id column to teachers table if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE teachers 
        ADD COLUMN IF NOT EXISTS user_id INT UNIQUE,
        ADD COLUMN IF NOT EXISTS role ENUM('teacher', 'admin') DEFAULT 'teacher',
        ADD COLUMN IF NOT EXISTS grade VARCHAR(50),
        ADD FOREIGN KEY IF NOT EXISTS (user_id) REFERENCES users(id) ON DELETE SET NULL
      `)
      console.log('✅ Teachers table migration completed')
    } catch (err) {
      // Column might already exist, ignore error
      if (!err.message.includes('Duplicate column name') && !err.message.includes('already exists')) {
        console.log('⚠️ Migration warning:', err.message)
      }
    }
    
    console.log('✅ Database tables initialized successfully')
    connection.release()
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    throw error
  }
}

module.exports = { pool, testConnection, initializeDatabase }
