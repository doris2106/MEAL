# Backend Setup Guide

## Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- MongoDB (local or MongoDB Atlas cloud)
- Git for version control

## Installation Steps

### 1. Install Node.js Dependencies

```bash
cd backend
npm install
```

**Packages installed:**
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variables
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `express-validator`: Input validation
- `helmet`: Security headers
- `nodemon`: Auto-reload in development

### 2. Setup MongoDB

#### Option A: MongoDB Local Installation
```bash
# Windows
# Download and install from https://www.mongodb.com/try/download/community

# macOS (with Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas Cloud (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Use connection string as MONGODB_URI

### 3. Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/meal_attendance

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production_12345
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Start Development Server

```bash
# With auto-reload (recommended)
npm run dev

# Manual start
npm start
```

Server will output:
```
╔═════════════════════════════════════════════════════════════╗
║        Digital Attendance & Mid-Day Meal Management         ║
║                      Backend Server                          ║
╚═════════════════════════════════════════════════════════════╝
📡 Server running at http://localhost:5000
```

### 5. Test Backend

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Response:
# {"success":true,"message":"Server is running","timestamp":"2024-01-15T..."}
```

## API Endpoints Reference

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register      # Register new teacher
POST /api/auth/login         # Login teacher
POST /api/auth/guest-login   # Guest login
GET  /api/auth/me            # Get current user (requires token)
```

### Records
```
GET  /api/records                    # Get all records
GET  /api/records/:id                # Get single record
GET  /api/records/date/:date         # Get records by date
GET  /api/records/range              # Get records by date range
GET  /api/records/stats/dashboard    # Get statistics
POST /api/records                    # Create record
PUT  /api/records/:id                # Update record
DELETE /api/records/:id              # Delete record
```

## Database Models

### Teacher
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  school: String,
  password: String (hashed),
  role: String, // 'teacher' or 'admin'
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Record
```javascript
{
  _id: ObjectId,
  date: Date,
  classGroup1to5: Boolean,
  classGroup6to8: Boolean,
  students: {
    class1: Number,
    class2: Number,
    class3: Number,
    class4: Number,
    class5: Number
  },
  beneficiaries: {
    class1: Number,
    class2: Number,
    class3: Number,
    class4: Number,
    class5: Number
  },
  mealType: String, // 'Khichdi', 'Dal', 'Rice', 'Bread', 'Vegetables', 'Milk', 'Other'
  teacherId: ObjectId,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Project Structure Explanation

```
backend/
├── config/
│   └── db.js                 # MongoDB connection setup
│
├── controllers/
│   ├── authController.js     # User registration, login, JWT generation
│   └── recordController.js   # CRUD operations for records
│
├── middleware/
│   ├── auth.js               # JWT verification middleware
│   └── errorHandler.js       # Global error handling
│
├── models/
│   ├── Teacher.js            # Teacher schema with password hashing
│   └── Record.js             # Record/Attendance schema with validations
│
├── routes/
│   ├── authRoutes.js         # Authentication endpoints
│   └── recordRoutes.js       # Record management endpoints
│
├── server.js                 # Main app, middleware setup, port listener
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (git ignored)
└── .env.example              # Example environment file
```

## Error Handling

The application has centralized error handling in `errorHandler.js`:

**Common Errors:**
- **ValidationError**: Invalid input data
- **MongoDB Duplicate Key**: Email already registered
- **JWT Errors**: Invalid or expired tokens
- **Not Found**: Resource doesn't exist

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Field error 1", "Field error 2"]
}
```

## Development Tips

### Hot Reload
Using `npm run dev` with nodemon watches file changes:
```bash
npm run dev
# Saves file -> Server automatically restarts
```

### Testing Endpoints
Use curl or Postman:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Teacher",
    "email": "test@school.com",
    "phone": "9876543210",
    "school": "Test School",
    "password": "test123",
    "passwordConfirm": "test123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@school.com",
    "password": "test123"
  }'
```

### Debugging
Enable console logs:
```javascript
// In server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

View in console when requests are made.

## Common Issues & Solutions

### Issue: MONGODB_URI Connection Failed
**Solution:**
- Check MongoDB is running: `mongod`
- Verify connection string in .env
- For MongoDB Atlas: Allow IP in firewall

### Issue: Port 5000 Already in Use
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue: CORS Errors in Frontend
**Solution:**
- Verify frontend URL in .env matches FRONTEND_URL
- Check browser console for specific CORS error
- Allow localhost in development

### Issue: Token Expired
**Solution:**
- Tokens expire after JWT_EXPIRE time (default 7d)
- Users need to login again
- Implement token refresh in production

## Production Deployment

### Before Deploying

1. **Security Checklist:**
   - Change JWT_SECRET to strong random key
   - Use MongoDB Atlas with strong password
   - Set NODE_ENV=production
   - Enable HTTPS only
   - Set FRONTEND_URL to production domain

2. **Performance:**
   - Add database indexes (already in models)
   - Use connection pooling
   - Enable caching headers
   - Monitor memory usage

3. **Testing:**
   - Test all API endpoints
   - Verify error handling
   - Test authentication flow

### Deploy to Render

1. Push code to GitHub
2. Go to https://render.com
3. New → Web Service → Connect GitHub
4. Select repository
5. Configure:
   - Name: meal-attendance-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add Environment Variables:
   ```
   MONGODB_URI = mongodb+srv://...
   JWT_SECRET = [strong_secret_key]
   NODE_ENV = production
   FRONTEND_URL = https://your-frontend.com
   ```
7. Deploy

### Monitoring
- Check server logs regularly
- Monitor MongoDB usage
- Track deployment status in Render dashboard
- Setup error alerts

## Maintenance

### Regular Tasks
- Monitor disk space
- Check database size
- Review error logs
- Update npm packages monthly

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update specific package
npm update express
```

### Backup MongoDB
```bash
# Local backup
mongodump --db meal_attendance --out ./backups

# Restore
mongorestore --db meal_attendance ./backups/meal_attendance
```

---

**Backend Setup Complete!** 🚀

Next: Setup Frontend and connect to this backend.
