# System Architecture & Design Documentation

## Overview

The Digital Attendance & Mid-Day Meal Management System is a modern, scalable web application built to digitize classroom attendance and mid-day meal tracking in government schools. This document explains the architecture, design decisions, and system components.

## Technology Stack

### Backend
- **Runtime**: Node.js 14+
- **Web Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, bcryptjs
- **CORS**: cors middleware

### Frontend
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 (Grid, Flexbox, Animations)
- **Communication**: Fetch API
- **Face Detection**: face-api.js (TinyFaceDetector)
- **Storage**: localStorage (Browser)

### Deployment
- **Backend**: Render (Node.js container)
- **Frontend**: Vercel (Static files)
- **Database**: MongoDB Atlas (Cloud)
- **CDN**: face-api.js from CDN

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           FRONTEND (index.html)                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Views (Dashboard, Records, Forms)           │   │   │
│  │  │ - UI Components & Pages                     │   │   │
│  │  │ - User Interactions                         │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │              ↓↑ (Data Flow)                         │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ JavaScript Modules                          │   │   │
│  │  │ - app.js (Logic & Events)                   │   │   │
│  │  │ - api.js (Backend Communication)            │   │   │
│  │  │ - faceDetection.js (ML - Face API)          │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │              ↓↑ (HTTP Requests)                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ localStorage (Client-side Data)             │   │   │
│  │  │ - JWT Token                                 │   │   │
│  │  │ - Cached Form Data                          │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │  HTTPS Communication   │
            │  (Fetch API)            │
            └────────────┬────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              BACKEND (Node.js + Express)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         API Routing & Controllers                  │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │ routes/                                    │    │  │
│  │  │ - authRoutes.js (Auth endpoints)           │    │  │
│  │  │ - recordRoutes.js (Record endpoints)       │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  │              ↓↑                                    │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │ controllers/                               │    │  │
│  │  │ - authController.js (Auth Logic)           │    │  │
│  │  │ - recordController.js (CRUD Operations)    │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  │              ↓↑ (Data Operations)                  │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │ Middleware/                                │    │  │
│  │  │ - auth.js (JWT Verification)               │    │  │
│  │  │ - errorHandler.js (Error Handling)         │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  │              ↓↑ (Database Operations)              │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │ models/                                    │    │  │
│  │  │ - Teacher.js (User Schema)                 │    │  │
│  │  │ - Record.js (Attendance/Meal Schema)       │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  │              ↓↑ (Mongoose ODM)                     │  │
│  │  ┌────────────────────────────────────────────┐    │  │
│  │  │ config/db.js (MongoDB Connection)          │    │  │
│  │  └────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ MongoDB Wire Protocol
                         │
┌────────────────────────▼────────────────────────────────────┐
│              MONGODB ATLAS (Cloud Database)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Database: meal_attendance                   │  │
│  │  ┌─────────────────┐        ┌─────────────────┐    │  │
│  │  │   Teachers      │        │    Records      │    │  │
│  │  ├─────────────────┤        ├─────────────────┤    │  │
│  │  │ _id             │        │ _id             │    │  │
│  │  │ name            │        │ date            │    │  │
│  │  │ email (unique)  │        │ classGroup1to5  │    │  │
│  │  │ phone           │        │ classGroup6to8  │    │  │
│  │  │ school          │        │ students        │    │  │
│  │  │ password        │        │ beneficiaries   │    │  │
│  │  │ role            │        │ mealType        │    │  │
│  │  │ isActive        │        │ teacherId(ref)  │    │  │
│  │  │ createdAt       │        │ notes           │    │  │
│  │  │ updatedAt       │        │ createdAt       │    │  │
│  │  │                 │        │ updatedAt       │    │  │
│  │  └─────────────────┘        └─────────────────┘    │  │
│  │      Indexes:                   Indexes:          │  │
│  │      - email (unique)           - date (ASC)      │  │
│  │      - createdAt                - teacherId       │  │
│  │                                 - date + teacher  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration/Login Flow

```
User Input (Form)
    ↓
Frontend Validation
    ↓
API Call (auth/register or auth/login)
    ↓
Backend Controller: authController.js
    ├─ Validate input
    ├─ Hash password (bcryptjs)
    ├─ Check if exists
    └─ Create/Verify in MongoDB
    ↓
Generate JWT Token
    ↓
Return Token to Frontend
    ↓
Store in localStorage
    ↓
Update UI
    ↓
Ready to use app
```

### 2. Record Creation Flow

```
User Fills Form
    ├─ Select Classes
    ├─ Enter Student Counts
    ├─ Enter Beneficiary Counts
    ├─ Select Meal Type
    └─ Optional: Capture Photo
        ├─ Open Camera (getUserMedia)
        ├─ Capture Frame
        ├─ Detect Faces (face-api.js)
        └─ Auto-fill Counts
    ↓
Frontend Validation
    ├─ Check all fields filled
    ├─ Validate numbers
    └─ Check beneficiaries ≤ students
    ↓
API POST to /api/records
    (Include JWT Token in header)
    ↓
Backend recordController.js
    ├─ Validate input again
    ├─ Create Record object
    └─ Save to MongoDB
    ↓
Return created record
    ↓
Frontend success message
    ↓
Refresh display
```

### 3. Record Retrieval Flow

```
User clicks "View Records"
    ↓
API GET /api/records?page=1&limit=10
    ↓
Backend recordController.js
    ├─ Query MongoDB
    ├─ Sort by date (descending)
    ├─ Apply pagination
    └─ Return data
    ↓
Frontend receives data
    ↓
Create table rows dynamically
    ↓
Display with formatting
    ↓
Attach delete event listeners
```

## Component Explanation

### Frontend Components

#### 1. HTML Structure (`index.html`)
- **Header**: Logo, navigation, auth button
- **Tab Navigation**: Bottom tabs for switching views
- **Views**: Dashboard, Records, Form
- **Modals**: Auth modal, Camera modal
- **Alert Container**: For notifications

#### 2. Styling (`css/styles.css`)
- **Root Variables**: Colors, shadows, spacing
- **Responsive Design**: Mobile-first approach
- **Animations**: Fade-in, slide-in effects
- **Grid Layouts**: For forms, statistics
- **Gradient Effects**: Modern UI aesthetics

#### 3. Logic (`js/app.js`)
- **Initialization**: Setup on page load
- **Event Listeners**: Form, button, modal events
- **Tab Switching**: Navigate between views
- **Data Display**: Populate tables, forms
- **Authentication State**: Manage logged-in state

#### 4. API Client (`js/api.js`)
- **Fetch Wrapper**: Handle HTTP requests
- **Auth endpoints**: Register, login, guest
- **Record endpoints**: CRUD operations
- **Token Management**: Store/retrieve JWT
- **Error Handling**: Centralized error catching

#### 5. Face Detection (`js/faceDetection.js`)
- **Model Loading**: Load face detection model
- **Camera Access**: Request permission
- **Photo Capture**: Extract frame from stream
- **Face Analysis**: Count detected faces
- **Auto-fill**: Update form fields
- **Error Recovery**: Fallback to manual entry

### Backend Components

#### 1. Server (`server.js`)
- **Express Setup**: Middleware initialization
- **Database Connection**: Connect to MongoDB
- **Route Registration**: Register API endpoints
- **Error Handling**: Global error middleware
- **Port Listener**: Start HTTP server

#### 2. Controllers
- **authController.js**
  - Register teacher
  - Login teacher
  - Guest login
  - Get current user
  
- **recordController.js**
  - Create record (POST)
  - Get all records (GET with pagination)
  - Get by date/range
  - Get single record
  - Update record (PUT)
  - Delete record (DELETE)
  - Get statistics

#### 3. Models
- **Teacher.js**
  - Schema definition
  - Validations
  - Password hashing hook
  - Password comparison method
  
- **Record.js**
  - Schema definition
  - Data validations
  - Indexes for performance
  - Nested objects for classes

#### 4. Middleware
- **auth.js**
  - JWT verification
  - Token extraction
  - User attachment to request
  - Role-based checks
  
- **errorHandler.js**
  - Error type detection
  - Consistent error responses
  - Status code mapping
  - Error logging

#### 5. Routes
- **authRoutes.js**
  - POST /register
  - POST /login
  - POST /guest-login
  - GET /me (protected)
  
- **recordRoutes.js**
  - POST / (create)
  - GET / (all)
  - GET /date/:date
  - GET /range (by date)
  - GET /stats/dashboard
  - GET /:id (single)
  - PUT /:id (update)
  - DELETE /:id (delete)

#### 6. Config
- **db.js**
  - MongoDB connection
  - Error logging
  - Connection pooling

## Security Architecture

### Authentication
- **JWT Tokens**: Stateless authentication
- **Email + Password**: Standard credentials
- **Password Hashing**: bcryptjs (salt rounds: 10)
- **Token Expiration**: Configurable (default 7 days)

### Authorization
- **Protected Routes**: Verify token for sensitive operations
- **Role-based Access**: Admin vs teacher roles (extensible)
- **Request Validation**: Express-validator for input

### Data Protection
- **HTTPS**: Required for production
- **CORS**: Restrict to configured frontend domain
- **Helmet**: HTTP security headers
- **Input Sanitization**: Validation before database

### Database Security
- **Connection Strings**: Stored in environment variables
- **User Privileges**: Separate read/write roles (MongoDB)
- **Query Injection Prevention**: Mongoose ODM protection

## Performance Optimizations

### Database
- **Indexes**: On date, teacherId, and combinations
- **Pagination**: Limit results per request
- **Query Selection**: Only fetch needed fields
- **Connection Pooling**: MongoDB Atlas handles

### Frontend
- **Face Detection**: TinyFaceDetector (lightweight)
- **CDN Delivery**: face-api.js from CDN
- **Event Delegation**: Fewer event listeners
- **Lazy Loading**: Load resources on demand
- **LocalStorage**: Cache non-sensitive data

### Backend
- **Date Queries**: Efficient range searches with index
- **Pagination**: Prevent large response payloads
- **Error Handling**: Fast failure responses
- **Compression**: Helmet enables gzip

## Scalability Considerations

### Current Limits
- **Render Free**: Limited to 512MB RAM
- **MongoDB Atlas Free**: 512MB storage
- **Vercel Free**: 100GB bandwidth/month

### Scaling Path
1. **Increase Resources**: Upgrade paid tiers
2. **Add Caching**: Redis for frequently accessed data
3. **Database Sharding**: Partition data by school
4. **Load Balancing**: Multiple backend instances
5. **CDN**: Distribute frontend globally

## Error Handling Strategy

### Frontend
- **Validation Errors**: Show to user immediately
- **API Errors**: Display alert notifications
- **Camera Errors**: Graceful fallback to manual
- **Network Errors**: Retry or offline message

### Backend
- **Validation**: Return 400 with details
- **Authentication**: Return 401 if unauthorized
- **Not Found**: Return 404 if resource missing
- **Server Errors**: Return 500 with logging

### Logging
- **Backend Console**: Development logs
- **Error Middleware**: Catches all exceptions
- **Render Logs**: Persistent production logging
- **Browser Console**: Frontend debugging

## Testing Strategy

### Backend Testing (Could Add)
```javascript
// Example Jest tests
describe('Auth', () => {
  test('Register new teacher', async () => {
    // POST /register
    // Verify user created
    // Verify password hashed
    // Verify token returned
  });
});
```

### Frontend Testing (Could Add)
```javascript
// Example Cypress E2E tests
describe('Form Submission', () => {
  test('Submit form creates record', () => {
    // Fill form
    // Click save
    // Verify data in table
  });
});
```

### Manual Testing Checklist
- [ ] Register new teacher
- [ ] Login with credentials
- [ ] Add attendance record
- [ ] Search records by date
- [ ] Update existing record
- [ ] Delete record
- [ ] Test face detection
- [ ] Test on mobile
- [ ] Test logout

## Maintenance & Monitoring

### Regular Tasks
- **Database Backups**: MongoDB Atlas automatic backup
- **Log Review**: Check Render logs weekly
- **Performance Monitoring**: Track response times
- **Security Updates**: Keep dependencies fresh

### Metrics to Track
- **API Response Time**: Target < 200ms
- **Database Size**: Monitor growth
- **User Count**: Track adoption
- **Error Rate**: Keep < 1%

## Future Enhancements

### Phase 2
- Email notifications
- Advanced reporting
- Multi-school dashboard
- REST API versioning

### Phase 3
- Mobile app (React Native)
- Biometric integration
- SMS alerts
- Parent portal

### Phase 4
- Machine learning for insights
- Predictive analytics
- Voice interface
- Blockchain for verification

## Deployment Architecture

### Development
```
laptops → localhost:3000/8000
                ↓
        localhost:5000 (backend)
                ↓
        localhost:27017 (MongoDB)
```

### Production
```
Browser (Vercel CDN)
    ↓ HTTPS
Render (Node.js)
    ↓ MongoDB Wire Protocol
MongoDB Atlas (Cloud)
```

## Conclusion

This architecture provides:
- ✅ **Scalability**: Can handle schools growing
- ✅ **Security**: JWT authentication, password hashing
- ✅ **Maintainability**: Clean separation of concerns
- ✅ **Performance**: Indexes, pagination, CDN
- ✅ **Accessibility**: Responsive design, keyboard navigation
- ✅ **Reliability**: Error handling, validations
- ✅ **Extensibility**: Easy to add features

The modular design allows for future enhancements without major refactoring.

---

For detailed implementation, see specific documentation files:
- Backend: SETUP_BACKEND.md
- Frontend: SETUP_FRONTEND.md
- Deployment: DEPLOYMENT_GUIDE.md
- API: API_REFERENCE.md
