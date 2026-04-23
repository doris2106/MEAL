# Digital Attendance & Mid-Day Meal Management System

A comprehensive full-stack web application for government schools to digitally track attendance and mid-day meal distribution. Built with the MERN stack (MongoDB, Express, Node.js, React/Vanilla JS).

## 🎯 Features

### Core Features
- ✅ **Digital Attendance Tracking** - Replace manual registers with digital tracking
- ✅ **Meal Management** - Track meal beneficiaries per class
- ✅ **Face Detection** - ML-powered student count detection using face-api.js
- ✅ **Real-time Dashboard** - View statistics and analytics
- ✅ **Date-based Search** - Find records by specific date or date range
- ✅ **Data Export** - Export records for reports
- ✅ **Authentication** - Teacher login/registration with JWT
- ✅ **Mobile Responsive** - Works seamlessly on all devices
- ✅ **Professional UI** - Government-friendly design with Marathi support

### Advanced Features
- 📊 Dashboard with statistics (total students, meals served, beneficiary rate)
- 🔐 JWT Authentication with role-based access control
- 🎨 Gradient modern UI with card-based design
- 📱 Mobile-first responsive design
- 🔍 Search and filter functionality
- 📋 Pagination for large datasets
- ⚡ Optimized for low-end devices with TinyFaceDetector

## 📁 Project Structure

```
MEAL/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── recordController.js   # Record CRUD operations
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── errorHandler.js       # Error handling
│   ├── models/
│   │   ├── Record.js             # Attendance/Meal schema
│   │   └── Teacher.js            # Teacher schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── recordRoutes.js       # Record endpoints
│   ├── package.json
│   ├── server.js                 # Main server file
│   └── .env.example              # Environment variables template
│
└── frontend/
    ├── index.html                # Main HTML file
    ├── css/
    │   └── styles.css            # All styling
    └── js/
        ├── app.js                # Main app logic
        ├── api.js                # API client
        └── faceDetection.js      # Face detection module
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn
- Modern web browser with camera access

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Setup Environment Variables**
```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/meal_attendance
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_secret_key_here
FRONTEND_URL=http://localhost:3000
```

3. **Start MongoDB**
```bash
# Using MongoDB locally
mongod

# Or use MongoDB Atlas cloud service
# Update MONGODB_URI in .env
```

4. **Start Backend Server**
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Open in Browser**
Simply open `frontend/index.html` in a web browser or use a local server:

```bash
cd frontend
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx http-server

# Or using Live Server extension in VS Code
```

Frontend will be available at `http://localhost:8000` or `http://127.0.0.1:5500`

## 📖 API Documentation

### Authentication Endpoints

#### Register Teacher
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@school.com",
  "phone": "9876543210",
  "school": "Government School",
  "password": "password123",
  "passwordConfirm": "password123"
}

Response: { "success": true, "token": "jwt_token", "teacher": {...} }
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@school.com",
  "password": "password123"
}

Response: { "success": true, "token": "jwt_token", "teacher": {...} }
```

#### Guest Login
```http
POST /api/auth/guest-login

Response: { "success": true, "token": "guest_token", "isGuest": true }
```

### Record Endpoints

#### Create Record
```http
POST /api/records
Content-Type: application/json
Authorization: Bearer {token}

{
  "date": "2024-01-15",
  "classGroup1to5": true,
  "classGroup6to8": false,
  "students": {
    "class1": 30,
    "class2": 28,
    "class3": 32,
    "class4": 25,
    "class5": 27
  },
  "beneficiaries": {
    "class1": 29,
    "class2": 27,
    "class3": 30,
    "class4": 24,
    "class5": 26
  },
  "mealType": "Khichdi",
  "notes": "All students present"
}
```

#### Get All Records
```http
GET /api/records?page=1&limit=10

Response: { "success": true, "data": [...], "pagination": {...} }
```

#### Get Records by Date
```http
GET /api/records/date/2024-01-15

Response: { "success": true, "date": "2024-01-15", "count": 2, "data": [...] }
```

#### Get Records by Date Range
```http
GET /api/records/range?startDate=2024-01-01&endDate=2024-01-31

Response: { "success": true, "statistics": {...}, "data": [...] }
```

#### Update Record
```http
PUT /api/records/{id}
Authorization: Bearer {token}

{ "mealType": "Dal", "notes": "Updated" }
```

#### Delete Record
```http
DELETE /api/records/{id}
Authorization: Bearer {token}
```

#### Dashboard Statistics
```http
GET /api/records/stats/dashboard

Response: {
  "success": true,
  "statistics": {
    "totalRecords": 45,
    "totalStudents": 2250,
    "totalBeneficiaries": 2180,
    "beneficiaryPercentage": 97,
    "mealTypes": { "Khichdi": 15, "Dal": 12, ... }
  }
}
```

## 🎨 UI Features

### Dashboard
- Real-time statistics cards
- Most served meals chart
- Total students and beneficiaries tracking
- Beneficiary rate percentage

### Records View
- Searchable table of all records
- Filter by date range
- Pagination support
- Delete functionality
- Date formatting

### Data Entry Form
- Date selector (defaults to today)
- Class group selection (1-5, 6-8)
- Student count per class (1-5)
- Meal beneficiaries per class
- Meal type dropdown
- Additional notes field
- Save and Reset buttons

### Face Detection
- 📷 Capture Attendance button
- Live camera preview
- Automatic face detection
- Auto-fill student counts
- Error handling for permission denied/no camera
- Support for low-end devices

## 🔐 Security Features

- ✅ JWT Authentication for protected endpoints
- ✅ Password hashing with bcryptjs
- ✅ Input validation and sanitization
- ✅ CORS enabled with frontend URL restriction
- ✅ Helmet for HTTP headers security
- ✅ Error handling middleware
- ✅ Environment variables for sensitive data

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Adaptive grid layouts
- Touch-friendly buttons
- Optimized for screens < 480px, 480-768px, 768-1024px, and > 1024px
- Bottom tab navigation for easy thumb access

## 🤖 Face Detection Technology

### How It Works
1. User clicks "📷 Capture Attendance" button
2. Browser requests camera permission
3. Video stream opens in modal
4. User captures a photo
5. face-api.js with TinyFaceDetector analyzes the image
6. Detects number of faces (students)
7. Auto-fills student count fields
8. User can manually adjust if needed

### Supported Detectors
- **TinyFaceDetector**: Lightweight, optimized for low-end devices
- Minimum detection confidence: 0.7

### Model Requirements
- TinyFaceDetector model (~200KB)
- Loaded from CDN on first use

## 🗄️ Database Schema

### Record Collection
```javascript
{
  date: Date,
  classGroup1to5: Boolean,
  classGroup6to8: Boolean,
  students: {
    class1-5: Number (0-100)
  },
  beneficiaries: {
    class1-5: Number (0-100)
  },
  mealType: String (enum),
  teacherId: ObjectId (ref: Teacher),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Teacher Collection
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  school: String,
  password: String (hashed),
  role: String (teacher/admin),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 📊 Validation Rules

1. **At least one class group must be selected**
2. **All class fields required** (students and beneficiaries)
3. **No negative numbers allowed**
4. **Beneficiaries ≤ Students for each class**
5. **Meal type is mandatory**
6. **Valid date required** (not in future)

## 🚢 Deployment

### Backend Deployment (Render)

1. Push code to GitHub
2. Connect GitHub to Render
3. Create new Web Service
4. Set environment variables:
   ```
   MONGODB_URI = [Your MongoDB Atlas URL]
   JWT_SECRET = [Generate strong secret]
   NODE_ENV = production
   FRONTEND_URL = https://your-frontend-domain.com
   ```
5. Deploy

### Frontend Deployment (Vercel/Netlify)

#### Using Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Configure build settings (if needed)
4. Deploy

#### Using Netlify
1. Connect GitHub to Netlify
2. Set build command: `npm run build` (if using build tools)
3. Deploy

### Update API Base URL
In `frontend/js/api.js`, update:
```javascript
const API_BASE_URL = 'https://your-backend-api.com/api';
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meal_attendance
PORT=5000
NODE_ENV=production
JWT_SECRET=use_a_strong_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=https://your-app.com
```

### CORS Configuration
Edit `server.js` to allow your frontend domain:
```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Check MONGODB_URI and network access
- **Port Already in Use**: Change PORT in .env or kill process on port 5000
- **CORS Error**: Verify FRONTEND_URL matches browser origin

### Frontend Issues
- **API Not Connecting**: Check backend is running and API_BASE_URL is correct
- **Camera Not Working**: 
  - Check browser permissions
  - Ensure HTTPS for production (camera requires secure context)
  - Test with http://localhost for development
- **Face Detection Not Working**:
  - Check browser console for errors
  - Verify face-api.js CDN is accessible
  - Models load from CDN on first use

### Data Issues
- **Beneficiaries > Students**: Validation prevents this, check form validation
- **Records Not Saving**: Check token validity and backend logs
- **Search Not Working**: Verify date format (YYYY-MM-DD)

## 📝 Usage Examples

### Example 1: Adding Today's Record
1. Open application in browser
2. Login or continue as guest
3. Navigate to "✏️ Record Data" tab
4. Select classes (1-5, 6-8)
5. Enter student counts per class
6. Enter meal beneficiary numbers
7. Select meal type (Khichdi, Dal, etc.)
8. Click "💾 Save Data"

### Example 2: Using Face Detection
1. Navigate to "✏️ Record Data" tab
2. Click "📷 Capture Attendance" button
3. Allow camera access
4. Frame students in camera
5. Click "📸 Capture Photo"
6. Wait for face detection
7. System auto-fills student count
8. Review and adjust if needed
9. Save record

### Example 3: Searching Records
1. Navigate to "📝 View Records" tab
2. Select start date and end date
3. Click "🔍 Search"
4. View filtered records in table
5. See statistics for date range

## 🤝 Contributing

To contribute improvements:
1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Create pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and support:
- Check troubleshooting section above
- Review backend logs: `tail -f /path/to/error.log`
- Check browser console for frontend errors
- Verify all dependencies are installed

## 🎓 Educational Use

This system is designed for government schools and can be customized for:
- Private schools
- Educational NGOs
- Training centers
- Any institution needing attendance + meal tracking

## 🔄 Future Enhancements

- SMS/Email notifications for daily reports
- WhatsApp integration for instant updates
- Mobile app (React Native)
- Advanced analytics and reporting
- Parent portal for meal tracking
- Staff management system
- Biometric attendance integration
- Multi-school management dashboard

---

**Built with ❤️ for Digital India**

*Developed to reduce teacher workload and ensure accurate record keeping in government schools.*
