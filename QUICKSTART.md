# Quick Start Guide

Get the Meal Management System running in minutes!

## ⚡ 5-Minute Quick Start

### For Immediate Testing (No Backend Setup)

1. **Open Frontend**
   ```bash
   # Option A: Using Python
   cd frontend
   python -m http.server 8000
   
   # Option B: Open directly
   # Windows: Double-click frontend/index.html
   # Mac/Linux: Right-click → Open with Browser
   ```

2. **Open in Browser**
   - Go to: `http://localhost:8000`
   - Or: Just open `frontend/index.html` in any browser

3. **Login**
   - Click "Login" button
   - Click "Continue as Guest"
   - Start using the app!

**Note:** With guest login, data is NOT saved (demo only)

---

## 🔧 Full Setup (10 Minutes)

### Step 1: Install Node.js (Skip if Already Installed)

1. Go to https://nodejs.org/
2. Download LTS version
3. Run installer, click "Next" → "Install" → "Finish"
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: MongoDB Setup (Choose One)

**Option A: Local MongoDB (Recommended for Development)**

1. Download from https://www.mongodb.com/try/download/community
2. Run installer
3. Accept defaults
4. MongoDB runs automatically

**Option B: MongoDB Atlas Cloud (No Installation)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with email
3. Create free cluster
4. Get connection string
5. Copy and save for later

### Step 3: Start Backend

```bash
cd backend

# Install dependencies (one-time)
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB connection
# (Open .env in text editor and modify MONGODB_URI)

# Start backend
npm run dev
```

**Backend will run on:** `http://localhost:5000`

**You should see:**
```
📡 Server running at http://localhost:5000
🔧 Environment: development
📊 Database: mongodb://localhost:27017/meal_attendance
```

### Step 4: Start Frontend

**In a NEW terminal:**

```bash
cd frontend

# Option A: Python
python -m http.server 8000

# Option B: Node
npm install -g http-server
http-server -p 8000

# Option C: VS Code
# Right-click index.html → Open with Live Server
```

**Frontend will run on:** `http://localhost:8000`

### Step 5: Test the Application

1. Open `http://localhost:8000` in browser
2. Click "Login"
3. Click "Continue as Guest"
4. Click "✏️ Record Data" tab
5. Fill in form:
   - Select both class groups (1-5 and 6-8)
   - Enter student counts: 30, 28, 32, 25, 27
   - Enter beneficiary counts: 29, 27, 30, 24, 26
   - Select meal type: "Khichdi"
6. Click "💾 Save Data"
7. Go to "📝 View Records" tab
8. You should see your record!

**Congratulations! The system is working!** 🎉

---

## 📱 Next Steps

### Create Teacher Account

1. Click "Login" button
2. Click "Register" link
3. Fill in details:
   - Full Name: Your Name
   - Email: your@school.com
   - Phone: Your phone number
   - School Name: Your school
   - Password: Create password
4. Click "Register"
5. Automatically logged in!

### Use Face Detection

1. Go to "✏️ Record Data" tab
2. Click "📷 Capture Attendance" button
3. Allow camera access
4. Frame students in camera
5. Click "📸 Capture Photo"
6. Wait for detection
7. Count auto-fills!

### Search Records

1. Go to "📝 View Records" tab
2. Select date range
3. Click "🔍 Search"
4. View filtered records

### View Dashboard

1. Click "📊 Dashboard" tab
2. See statistics:
   - Total students tracked
   - Total meals served
   - Beneficiary percentage
   - Most served meals

---

## 🚀 Deploy to Internet

### Deploy Backend (Render)

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 2. Go to https://render.com
# 3. Connect GitHub account
# 4. Create new Web Service
# 5. Set environment variables
# 6. Deploy (automatic!)
```

Takes ~5 minutes, free tier available.

### Deploy Frontend (Vercel)

```bash
# 1. Push to GitHub
# 2. Go to https://vercel.com
# 3. Import project
# 4. Deploy (automatic!)
```

Takes ~2 minutes, free tier available.

---

## 📚 File Reference

### Backend Files

| File | Purpose |
|------|---------|
| `server.js` | Main app entry point |
| `config/db.js` | MongoDB connection |
| `models/Teacher.js` | User/teacher schema |
| `models/Record.js` | Attendance/meal schema |
| `controllers/authController.js` | Login/registration logic |
| `controllers/recordController.js` | Data CRUD operations |
| `middleware/auth.js` | JWT verification |
| `.env` | Configuration (create from .example) |

### Frontend Files

| File | Purpose |
|------|---------|
| `index.html` | All UI markup |
| `css/styles.css` | All styling |
| `js/app.js` | Main application logic |
| `js/api.js` | Backend communication |
| `js/faceDetection.js` | Face detection logic |

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/guest-login` - Temporary access

### Records
- `POST /api/records` - Save record
- `GET /api/records` - Get all records
- `GET /api/records/:id` - Get one record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record
- `GET /api/records/date/:date` - Get by date
- `GET /api/records/range` - Get by date range
- `GET /api/records/stats/dashboard` - Get statistics

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check if port 5000 is used
# Windows:
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Try different port
PORT=5001 npm run dev
```

### MongoDB Connection Error

```bash
# Make sure MongoDB is running
# Windows: Services → mongod
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Frontend Not Connecting to API

1. Check backend is running (should see terminal output)
2. Verify API_BASE_URL in `js/api.js` is correct
3. Check browser console (F12) for errors

### Camera Not Working

1. Grant camera permission in browser
2. Use HTTPS (required for production)
3. Try different browser
4. Check no other app is using camera

### Data Not Saving

1. Check backend logs for errors
2. Verify MongoDB is running
3. Check browser console for JavaScript errors
4. Try guest login first (no auth)

---

## 💡 Common Tasks

### Add Custom Meal Type

Edit `index.html`:
```html
<select id="mealType">
  <option value="Khichdi">Khichdi</option>
  <option value="Dal">Dal</option>
  <option value="MyMeal">My Custom Meal</option>  <!-- Add here -->
</select>
```

### Change School Name

Edit HTML and backend - appears in multiple files:
- `index.html` - Form labels
- `README.md` - Examples

### Change Colors

Edit `css/styles.css`:
```css
:root {
  --primary: #4a7c59;  /* Change this green color */
}
```

### Add Marathi Labels

In `index.html`, wrap with Marathi text:
```html
<label>कक्षा 1 <br/> <small>(Class 1)</small></label>
```

---

## 📖 Documentation Files

- **README.md** - Full project overview
- **SETUP_BACKEND.md** - Detailed backend setup
- **SETUP_FRONTEND.md** - Frontend configuration details
- **DEPLOYMENT_GUIDE.md** - Production deployment steps
- **API_REFERENCE.md** - Complete API documentation
- **This file** - Quick start guide

---

## 🎯 Success Checklist

- [ ] Node.js installed and working
- [ ] MongoDB running (local or Atlas)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 8000
- [ ] Can open http://localhost:8000 in browser
- [ ] Can login as guest
- [ ] Can fill and save form
- [ ] Can see data in View Records tab
- [ ] Can see statistics in Dashboard tab
- [ ] Camera works for face detection

**All checked?** Congratulations! 🎉 System is ready!

---

## 🤔 FAQ

**Q: Can I test without backend?**
A: Yes! Use guest login. Data won't be saved but you can see UI.

**Q: Do I need MongoDB locally?**
A: No, use MongoDB Atlas cloud instead.

**Q: Can I use on phone?**
A: Yes! Frontend is mobile-responsive. Backend needs internet access.

**Q: How do I share with others?**
A: Deploy using Vercel (frontend) and Render (backend). See DEPLOYMENT_GUIDE.md

**Q: Can multiple schools use this?**
A: Yes! Each teacher has separate account. Multiple schools can share same instance.

**Q: Is face detection required?**
A: No, it's optional. Manual entry works fine too.

**Q: How do I backup my data?**
A: MongoDB Atlas has automatic backups. Or export manually.

---

## 🚀 You're Ready!

Start with guest login to explore, then create a teacher account for persistent data.

For production deployment, see **DEPLOYMENT_GUIDE.md**

For detailed API info, see **API_REFERENCE.md**

**Happy tracking!** 📊

---

**Need Help?**

1. Check **README.md** for full documentation
2. Check **SETUP_BACKEND.md** for backend issues
3. Check **SETUP_FRONTEND.md** for frontend issues
4. Check browser console (F12) for errors
5. Check backend console for server errors

**Problem Solved?** Great! Now help others by documenting the issue.
