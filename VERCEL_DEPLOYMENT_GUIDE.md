# Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- MongoDB Atlas cluster (Free tier available)
- Git repository pushed to GitHub

## Deployment Steps

### 1. MongoDB Atlas Setup
- Create a MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Create a database user with credentials
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### 2. Backend Deployment (Express.js + MongoDB)

**Update CORS for Frontend Domain:**
```javascript
// In server.js - Replace:
app.use(cors({
  origin: '*'
}));

// With:
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
```

**Deploy Backend:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to BookmarkBackend
cd BookmarkBackend

# 3. Deploy
vercel --prod

# 4. Add environment variables in Vercel dashboard:
#    - MONGODB_URI: your_mongodb_atlas_connection_string
#    - FRONTEND_URL: your_frontend_vercel_url
```

### 3. Frontend Deployment (React + Vite)

**Update API URL:**
In `src/api/api.js`, ensure it uses the environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

**Deploy Frontend:**
```bash
# 1. Navigate to BookmarkFrontend
cd ../BookmarkFrontend

# 2. Deploy
vercel --prod

# 3. Add environment variables in Vercel dashboard:
#    - VITE_API_URL: https://your-backend-domain.vercel.app/api
```

## Dependencies Verification

### Backend Dependencies:
✅ express (4.18.2) - Web framework
✅ mongoose (7.0.3) - MongoDB ODM
✅ cors (2.8.5) - Cross-origin support
✅ dotenv (16.0.3) - Environment variables
✅ nodemon (2.0.22) - Dev tool (dev only)

**Required for Production:**
- Node.js 16+ (Vercel default)
- MongoDB Atlas connection

### Frontend Dependencies:
✅ react (18.2.0) - UI library
✅ react-dom (18.2.0) - React renderer
✅ react-router-dom (6.8.1) - Routing
✅ axios (1.3.4) - HTTP client
✅ vite (4.3.2) - Build tool
✅ @vitejs/plugin-react (3.1.0) - React support

## Environment Variables Required

### Backend (.env):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend (.env.local):
```
VITE_API_URL=https://your-backend-domain.vercel.app/api
```

## Security & Permissions

✅ **MongoDB Atlas:**
- Use IP whitelist (allow Vercel IPs or use 0.0.0.0/0 for flexibility)
- Create dedicated database user (not admin)
- Use strong passwords

✅ **CORS:**
- Update from `'*'` to specific domain after deployment
- This prevents unauthorized API access

✅ **Environment Variables:**
- Never commit .env files
- Use Vercel dashboard to set production secrets
- Keep MongoDB credentials safe

## Verification Checklist

- [ ] MongoDB Atlas cluster running
- [ ] Connection string copied securely
- [ ] Backend deploys without errors
- [ ] Frontend builds successfully
- [ ] Environment variables set in Vercel
- [ ] CORS configured for frontend domain
- [ ] API calls working from frontend
- [ ] Database queries executing properly

## Troubleshooting

**Backend fails to deploy:**
- Check `vercel.json` syntax
- Ensure `server.js` is in root
- Verify all dependencies in package.json

**Frontend API calls fail:**
- Verify VITE_API_URL environment variable
- Check CORS settings in backend
- Test API endpoint directly in browser

**MongoDB connection fails:**
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Ensure credentials are correct
- Check network access is enabled

## Useful Links
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Vite Deploy Guide: https://vitejs.dev/guide/static-deploy.html
