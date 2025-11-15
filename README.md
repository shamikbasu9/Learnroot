# Learnroot Admin Dashboard

A comprehensive school management system admin dashboard built with Vue.js and Node.js.

## Features

- **Authentication**: JWT-based login with role-based access (Super Admin, School Admin, Moderator)
- **Dashboard**: Overview cards, quick actions, charts, and recent activity
- **Academic Management**: Classes, Subjects, Teachers, Students management
- **Timetable**: Drag-drop scheduling with conflict detection
- **Calendar**: Events, holidays, exams, PTM management
- **Communication**: Announcements and notice board
- **Reports**: Analytics and export functionality
- **Settings**: System configuration and preferences

## Tech Stack

### Frontend
- Vue.js 3 with Composition API
- Vue Router for navigation
- Pinia for state management
- Tailwind CSS for styling
- Lucide icons
- Axios for API calls

### Backend
- Node.js with Express
- MySQL database
- JWT authentication
- bcryptjs for password hashing
- Express validation
- CORS enabled

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd learnroot
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && npm install
   \`\`\`

3. **Database Setup**
   - Create a MySQL database named \`learnroot_db\`
   - Copy \`backend/.env.example\` to \`backend/.env\`
   - Update database credentials in \`.env\` file

4. **Environment Configuration**
   
   Backend \`.env\` file:
   \`\`\`
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=learnroot_db
   JWT_SECRET=your-super-secret-jwt-key
   \`\`\`

5. **Initialize Database**
   
   The database tables will be automatically created when you start the backend server.

6. **Start Development Servers**
   
   **Option 1: Run both servers simultaneously**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   **Option 2: Run servers separately**
   \`\`\`bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   \`\`\`

## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Default Admin Account

The admin account has been automatically created for you:

**Login Credentials:**
- **Email:** admin@learnroot.com
- **Password:** admin123

You can use these credentials to log into the admin dashboard at http://localhost:3000

## Project Structure

```bash
learnroot/
├── frontend/                 # Vue.js frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── views/           # Page components
│   │   ├── stores/          # Pinia stores
│   │   ├── router/          # Vue Router configuration
│   │   └── assets/          # CSS and images
│   └── package.json
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
\`\`\`

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/register - Register new user
- GET /api/auth/me - Get current user
- POST /api/auth/logout - User logout
- POST /api/auth/forgot-password - Forgot password
- POST /api/auth/reset-password - Reset password

### Academic Management
- GET/POST /api/classes - Class management
- GET/POST /api/subjects - Subject management
- GET/POST /api/teachers - Teacher management
- GET/POST /api/students - Student management
- GET/POST /api/timetable - Timetable management
- GET/POST /api/calendar - Calendar events
- GET/POST /api/announcements - Announcements
- GET /api/reports - Reports and analytics
- GET/POST /api/settings - System settings

## Development

### Adding New Modules

1. **Backend**: Create route file in \`backend/src/routes/\`
2. **Frontend**: Create view component in \`frontend/src/views/\`
3. **Navigation**: Add to router configuration in \`frontend/src/router/index.js\`
4. **Sidebar**: Add to navigation array in \`DashboardLayout.vue\`

### Database Migrations

Database tables are automatically created on server startup. For schema changes:
1. Update \`backend/src/config/database.js\`
2. Consider using a migration tool for production

## Production Deployment

### Environment Variables
Set the following in production:
- \`NODE_ENV=production\`
- Secure \`JWT_SECRET\`
- Database credentials
- Email configuration (if using)

### Build Frontend
\`\`\`bash
npm run build
\`\`\`

### Start Production Server
\`\`\`bash
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
