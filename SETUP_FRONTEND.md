# Frontend Setup Guide

## Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Local HTTP server or VS Code Live Server extension
- Backend running on `http://localhost:5000` or update API_BASE_URL

## Quick Start (3 Methods)

### Method 1: Using Python (Simplest)

```bash
cd frontend

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Open: `http://localhost:8000`

### Method 2: Using Node.js

```bash
cd frontend

# Install http-server globally (one-time)
npm install -g http-server

# Start server
http-server

# With specific port
http-server -p 8000
```

Open: `http://localhost:8000`

### Method 3: VS Code Live Server

1. Install **Live Server** extension in VS Code
2. Right-click `index.html`
3. Click "Open with Live Server"
4. Opens automatically in browser

## Configuration

### Update Backend URL

Edit `frontend/js/api.js`:

```javascript
// Line 6
const API_BASE_URL = 'http://localhost:5000/api';

// For production:
// const API_BASE_URL = 'https://your-backend-domain.com/api';
```

## UI Components Overview

### Header
- Logo and title
- Login/Logout button
- Teacher info display

### Tab Navigation (Bottom)
- 📊 Dashboard Tab
- 📝 View Records Tab
- ✏️ Record Data Tab

### Dashboard Tab
- Statistics cards (Total Students, Meals Served, etc.)
- Most served meals list
- Real-time updates

### View Records Tab
- Date range search
- Records table with sorting
- Pagination controls
- Delete functionality

### Record Data Tab
- Date picker (default = today)
- Class group selection (1-5, 6-8 checkboxes)
- Student count inputs (Class 1-5)
- Meal beneficiary inputs (Class 1-5)
- Meal type dropdown
- Face detection button
- Additional notes
- Save and Reset buttons

### Camera Modal
- Live video feed
- Capture photo button
- Face detection status
- Auto-fill student counts
- Error handling

## Features Explained

### Authentication Flow

1. **Login**
   - Enter email and password
   - Backend validates credentials
   - JWT token stored in localStorage
   - UI updates to show teacher profile

2. **Register**
   - Enter personal details
   - Password validation
   - Account created with hashed password
   - Automatic login after registration

3. **Guest Login**
   - No registration required
   - Temporary access (24 hours)
   - Limited to 1 user per session

### Face Detection Workflow

1. Click "📷 Capture Attendance" button
2. Browser requests camera permission
3. Video stream shows in modal
4. Click "📸 Capture Photo"
5. face-api.js detects faces
6. System shows: "Detected X students"
7. Student count auto-fills
8. Modal closes automatically
9. You can adjust counts manually

### Data Validation

**Before saving, system checks:**
- At least one class group selected
- All student counts filled
- All beneficiary counts filled
- Beneficiaries ≤ Students (per class)
- Meal type selected
- Valid date (not future)

**Error messages display if validation fails**

### Search Functionality

1. Go to "View Records" tab
2. Select start and end date
3. Click "🔍 Search"
4. Table filters to show matching records
5. Statistics update for date range
6. Click "Reset" to show all records

## File Structure

```
frontend/
├── index.html           # Main HTML file
│   └── Contains all UI markup, modals, forms
│
├── css/
│   └── styles.css       # All styling (2000+ lines)
│       ├── Root variables (colors, shadows, etc.)
│       ├── Global styles
│       ├── Component styles (buttons, forms, cards)
│       ├── Layout styles (grid, flexbox)
│       ├── Responsive media queries
│       └── Animations
│
└── js/
    ├── app.js           # Main application logic
    │   ├── UI interactions
    │   ├── Event listeners
    │   ├── Tab navigation
    │   ├── Form handling
    │   ├── Data display
    │   └── Alert management
    │
    ├── api.js           # Backend communication
    │   ├── Fetch wrapper
    │   ├── Authentication endpoints
    │   ├── Record endpoints
    │   ├── Token management
    │   └── Local storage helpers
    │
    └── faceDetection.js # Face detection module
        ├── Camera access handling
        ├── Video stream management
        ├── Face detection logic
        ├── Photo capture
        ├── Auto-fill functionality
        └── Error handling
```

## CSS Classes Reference

### Layout Classes
- `.container` - Max-width container
- `.main-content` - Main area
- `.form-container` - Form wrapper
- `.modal` - Modal overlay

### Button Classes
- `.btn` - Base button
- `.btn-primary` - Green primary button
- `.btn-secondary` - Gray button
- `.btn-camera` - Camera button
- `.btn-large` - Large button

### Form Classes
- `.form-group` - Form field wrapper
- `.form-section` - Section in form
- `.input-grid` - Grid of inputs
- `.radio-label` - Radio/checkbox label

### Display Classes
- `.view` - Tab view (hidden by default)
- `.view.active` - Active view (visible)
- `.modal.active` - Active modal

## JavaScript Functions

### UI Functions
```javascript
switchTab(tabIndex)         // Switch between tabs (0, 1, 2)
showAlert(message, type)    // Show notification alert
resetForm()                 // Clear form fields
toggleAuthForms()           // Switch login/register
```

### Data Functions
```javascript
loadRecords(page)           // Load records from backend
loadDashboardStats()        // Load statistics
searchRecords()             // Search by date range
deleteRecord(id)            // Delete a record
handleFormSubmit(e)         // Save new record
```

### Camera Functions
```javascript
openCameraModal()           // Open camera
closeCameraModal()          // Close camera
capturePhoto()              // Capture and detect faces
```

### Authentication Functions
```javascript
handleLogin(e)              // Process login
handleRegister(e)           // Process registration
guestLogin()                // Guest login
handleLogout()              // Logout
```

## Styling Customization

### Colors
Edit CSS variables in `styles.css`:

```css
:root {
  --primary: #4a7c59;           /* Main green */
  --secondary: #f39c12;          /* Orange accent */
  --danger: #e74c3c;             /* Red for danger */
  --success: #27ae60;            /* Green for success */
  /* ... more colors */
}
```

### Fonts
```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

### Fonts for Marathi Support
Add in `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari&display=swap" rel="stylesheet">
```

## Responsive Breakpoints

```css
/* Desktop > 1024px */
/* Tablet 768px - 1024px */
@media (max-width: 768px) { ... }

/* Mobile 480px - 768px */
@media (max-width: 480px) { ... }

/* Extra small < 480px */
```

## Common Customizations

### Change Theme Color
```css
:root {
  --primary: #1e5631;        /* Dark green */
  --primary-light: #2d7a3a;  /* Light green */
  --primary-dark: #0f3618;   /* Very dark */
}
```

### Add Marathi Labels
In HTML, use:
```html
<label>कक्षा 1</label>  <!-- Class 1 in Marathi -->
<label>दैनिक भोजन</label>  <!-- Daily Meal -->
```

### Disable Face Detection
In `app.js`, comment out:
```javascript
// document.getElementById('cameraBtn').addEventListener(...)
```

### Change Meal Types
In `index.html`, edit:
```html
<select id="mealType">
  <option value="Khichdi">Khichdi</option>
  <option value="Dal">Dal</option>
  <!-- Add/remove options -->
</select>
```

## Troubleshooting

### Issue: API Not Connecting
**Solution:**
- Check backend is running on port 5000
- Verify API_BASE_URL in api.js
- Check browser console for errors
- Enable CORS on backend

### Issue: Camera Not Working
**Solution:**
- Browser requires HTTPS for camera (except localhost)
- Check camera permissions in browser settings
- Try different browser
- Restart browser

### Issue: Face Detection Not Loading
**Solution:**
- Check internet connection (models load from CDN)
- Clear browser cache
- Check browser console for CDN errors
- Fallback to manual entry

### Issue: Form Not Submitting
**Solution:**
- Check all validation rules
- Verify beneficiaries ≤ students
- Ensure meal type selected
- Check browser console for errors

### Issue: Data Not Displaying
**Solution:**
- Refresh page (F5)
- Clear localStorage: `localStorage.clear()`
- Check backend is running
- Check API connection

## Local Storage

Application uses browser localStorage:

```javascript
// Stored data:
localStorage.token              // JWT authentication token
localStorage.formData           // Cached form data (optional)

// Clear all:
localStorage.clear()

// Clear specific:
localStorage.removeItem('token')
```

## Keyboard Shortcuts (Optional)

Add to `app.js` for productivity:

```javascript
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    document.getElementById('mainForm').dispatchEvent(new Event('submit'));
  }
  
  // Ctrl/Cmd + R to reset
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    resetForm();
  }
});
```

## Performance Tips

1. **Lazy Load Images** - Add later if adding logos
2. **Compress CSS** - Minify for production
3. **Cache API Calls** - Consider service workers
4. **Optimize Face Detection** - Use TinyFaceDetector (already done)
5. **Reduce Bundle Size** - face-api.js loaded from CDN

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer (Not supported)

**Required Features:**
- ES6 JavaScript
- CSS Grid and Flexbox
- LocalStorage
- Fetch API
- getUserMedia (for camera)

## Deployment

### Deploy to Vercel

1. Create GitHub repository
2. Go to vercel.com
3. Import project
4. No build command needed (static files)
5. Update API_BASE_URL to production backend
6. Deploy

### Deploy to Netlify

1. Push to GitHub
2. Connect to Netlify
3. Deploy site
4. Update API_BASE_URL

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

## Production Checklist

- [ ] Update API_BASE_URL to production API
- [ ] Test all features on target devices
- [ ] Verify HTTPS is enabled
- [ ] Test camera permissions
- [ ] Check CSS loads correctly
- [ ] Verify fonts display correctly
- [ ] Test auth flows (login, register, logout)
- [ ] Test data saving and retrieval
- [ ] Test on mobile devices
- [ ] Test face detection on slow internet
- [ ] Add analytics tracking
- [ ] Setup error monitoring

---

**Frontend Setup Complete!** 🎉

Your application is ready to use. Open the HTML file in browser and start managing attendance!
