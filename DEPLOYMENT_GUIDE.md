# Deployment & Hosting Guide

## Overview

This guide covers deploying both frontend and backend to production services:
- **Backend**: Render (Free tier available)
- **Frontend**: Vercel or Netlify (Free tier available)
- **Database**: MongoDB Atlas (Free tier available)

## Prerequisites

- GitHub account (for version control)
- Email address
- Credit card (free tier usually doesn't require, but needed for fallback)

## Step 1: Prepare Code for Deployment

### Backend Preparation

1. **Update .env for Production**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=generate_a_strong_random_key_here_at_least_32_chars
   MONGODB_URI=mongodb_atlas_connection_string
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **Commit to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

### Frontend Preparation

1. **Update API URL in js/api.js**
   ```javascript
   const API_BASE_URL = 'https://your-backend-api.com/api';
   ```

2. **Commit to GitHub**
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push origin main
   ```

## Step 2: Setup MongoDB Atlas (Database)

### Create MongoDB Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account with email
4. Verify email
5. Accept terms

### Create Cluster

1. Choose "Shared" (free tier)
2. Select cloud provider (AWS recommended)
3. Select region closest to your users
4. Click "Create"
5. Wait for cluster to deploy (5-10 minutes)

### Get Connection String

1. Click "Connect"
2. Choose "Connect your application"
3. Select Node.js driver
4. Copy connection string
5. Replace `<password>` with your password
6. Example:
   ```
   mongodb+srv://username:password@cluster0.abc123.mongodb.net/meal_attendance?retryWrites=true&w=majority
   ```

### Setup Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and password
4. Choose "Built-in Role: Database Owner"
5. Click "Add User"

### Allow Network Access

1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

**Note:** In production, restrict to your app's IP for better security.

## Step 3: Deploy Backend to Render

### Prepare Backend

1. Ensure `server.js` exists in root
2. Ensure `package.json` has all dependencies
3. Commit all changes to GitHub

### Deploy Steps

1. Go to https://render.com
2. Sign up / Login with GitHub account
3. Click "New +"
4. Select "Web Service"
5. Connect GitHub repository
6. Configure service:
   ```
   Name: meal-attendance-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
7. Click "Advanced" and add Environment Variables:
   ```
   MONGODB_URI: mongodb+srv://username:password@cluster.mongodb.net/meal_attendance
   JWT_SECRET: your_secret_key_here
   NODE_ENV: production
   FRONTEND_URL: https://your-frontend-domain.com
   ```
8. Click "Create Web Service"
9. Wait for deployment (3-5 minutes)
10. Get your API URL from Render dashboard (e.g., `https://meal-api.onrender.com`)

### Verify Deployment

```bash
# Test health endpoint
curl https://meal-api.onrender.com/api/health

# Response should be:
# {"success":true,"message":"Server is running",...}
```

**Important:** Free tier services on Render go to sleep after 15 minutes of inactivity. Consider upgrading for production use.

## Step 4: Deploy Frontend to Vercel

### Vercel Deployment

1. Go to https://vercel.com
2. Sign up / Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   ```
   Framework: Other (static HTML)
   Root Directory: ./frontend
   ```
6. Add environment variable:
   ```
   Name: API_BASE_URL
   Value: https://your-backend-api.onrender.com/api
   ```
7. Click "Deploy"
8. Wait for deployment (1-2 minutes)
9. Get your frontend URL (e.g., `https://meal-app.vercel.app`)

### Update Backend FRONTEND_URL

1. Go to Render dashboard
2. Select your service
3. Go to "Settings" → "Environment"
4. Update FRONTEND_URL to your Vercel domain
5. Service restarts automatically

## Step 5: Configure CORS

### Update Backend CORS

Edit `backend/server.js`:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Automatically uses env variable
    credentials: true,
  })
);
```

Deploy the change:
```bash
git add .
git commit -m "Update CORS for production domains"
git push
```

Render auto-deploys on push.

## Step 6: Final Testing

### Test Authentication
```bash
# Register new user
curl -X POST https://meal-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Teacher",
    "email": "test@school.com",
    "phone": "9876543210",
    "school": "Test School",
    "password": "test123",
    "passwordConfirm": "test123"
  }'

# Should return token
```

### Test Frontend
1. Open `https://your-frontend-domain.com`
2. Click "Login"
3. Test Register flow
4. Test Login flow
5. Add record
6. View records
7. Test face detection (camera)

## Alternative Frontend Hosting Options

### Netlify

1. Go to https://netlify.com
2. Sign up with GitHub
3. Add new site
4. Select repository
5. Configure build:
   ```
   Base directory: frontend
   Build command: (leave empty)
   Publish directory: frontend
   ```
6. Add environment variable: API_BASE_URL
7. Deploy

### GitHub Pages

For static hosting only:

1. Push frontend to `gh-pages` branch
2. Update repository settings
3. Enable GitHub Pages
4. Automatic deployment

**Note:** GitHub Pages doesn't support environment variables, update API_BASE_URL manually.

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting --project=your-project
# Choose public directory: frontend
firebase deploy
```

## Monitoring & Maintenance

### Monitor Backend

**Render Dashboard:**
- View logs: Click "Logs" tab
- Check status: Should show green
- Monitor memory usage
- View error logs

```bash
# View live logs
# In Render dashboard → Logs tab
```

### Monitor Database

**MongoDB Atlas:**
- Metrics tab: View CPU, memory, storage
- Performance tab: Query statistics
- Alerts: Set up alerts for high usage

### Debugging Production

**Backend Logs**
- Render: Shows in Logs tab
- Check for errors and exceptions

**Frontend Debugging**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls
- Check Application tab for localStorage

## Common Deployment Issues

### Issue: CORS Error
**Solution:**
- Verify FRONTEND_URL in backend .env matches deployed frontend URL
- Wait for backend to restart
- Clear browser cache

### Issue: API Returns 404
**Solution:**
- Verify backend is running (Render dashboard)
- Check API_BASE_URL in frontend
- Verify routes exist in backend

### Issue: Authentication Failing
**Solution:**
- Check JWT_SECRET is set in backend .env
- Verify MongoDB is accessible
- Check MONGODB_URI in .env

### Issue: Face Detection Not Working
**Solution:**
- Face detection loads from CDN (needs internet)
- Requires HTTPS in production (except localhost)
- Check browser console for errors
- Fallback to manual data entry

### Issue: Render Free Tier Goes to Sleep
**Solution:**
- Upgrade to Paid plan
- Use Uptime Robot to ping service periodically
- Consider other providers (Railway, Heroku alternatives)

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Use strong MongoDB password
- [ ] Enable HTTPS everywhere
- [ ] Restrict MongoDB network access (production IP only)
- [ ] Enable firewall on server
- [ ] Use environment variables for all secrets
- [ ] Never commit .env to GitHub
- [ ] Implement rate limiting (future)
- [ ] Add input validation sanitization
- [ ] Regular security audits

## Performance Optimization

### Database
- Add indexes (already in models)
- Use pagination (already in API)
- Cache frequently accessed data

### Backend
- Enable gzip compression
- Use CDN for assets (if any)
- Optimize database queries

### Frontend
- Minify CSS and JavaScript (use build tool)
- Lazy load images
- Use service workers for caching
- Optimize face detection models

## Scaling for Growth

### Database
- If data grows: Upgrade MongoDB plan
- Archive old records to separate collection
- Implement data retention policy

### Backend
- Monitor memory usage
- If CPU spikes: Upgrade Render plan
- Implement caching layer (Redis)
- Consider load balancing

### Frontend
- Use CDN for distribution (Cloudflare, AWS CloudFront)
- Enable browser caching

## Backup Strategy

### Database Backups
```bash
# Render provides automated backups for 7 days

# MongoDB Atlas: Backup and Restore tab
# Automatic daily backups with 7-day retention
```

### Code Backups
- GitHub is your version control (automatic backup)
- Keep local git repository updated

## Disaster Recovery

If something goes wrong:

1. **Revert Backend Code**
   ```bash
   git revert <commit-hash>
   git push
   ```

2. **Revert Database**
   - MongoDB Atlas: Restore from backup
   - Render: Deploy previous version

3. **Check Logs**
   - Backend: Render Logs tab
   - Frontend: Browser DevTools

## Cost Breakdown

### Free Tier Costs
- **MongoDB Atlas**: Free (512MB storage)
- **Render**: Free ($0 but limited resources)
- **Vercel**: Free
- **Total**: $0/month

### Recommended Production Setup
- **MongoDB Atlas**: $10-20/month
- **Render**: $7-12/month
- **Vercel**: Free (or Pro at $20/month)
- **Total**: $17-52/month

## Production Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Connection string obtained and tested
- [ ] Backend API deployed to Render
- [ ] Frontend deployed to Vercel/Netlify
- [ ] API endpoints tested in production
- [ ] CORS configured correctly
- [ ] Authentication tested (login, register)
- [ ] Face detection working
- [ ] Data saving working
- [ ] Search working
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] Error logging enabled
- [ ] Favicon added
- [ ] Meta tags in HTML
- [ ] Security headers enabled

## Next Steps After Deployment

1. Share URL with first users for testing
2. Gather feedback
3. Fix any issues found
4. Plan for scaling
5. Consider advanced features:
   - Email notifications
   - SMS updates
   - Mobile app
   - Advanced analytics

---

**Deployment Complete!** 🎉

Your application is now live and accessible from anywhere!

**Frontend URL:** `https://your-frontend-domain.com`

**Backend API:** `https://your-backend-api.onrender.com`

**Database:** MongoDB Atlas (secure in cloud)

Start sharing with teachers and students!
