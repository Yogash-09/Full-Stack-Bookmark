# Deployment Checklist - Vercel

## Step 1: Prepare MongoDB Atlas
- [ ] Create/Login to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
- [ ] Create a cluster (Free tier available)
- [ ] Create database user with username & password
- [ ] Copy connection string
- [ ] Add Vercel IP ranges to whitelist (or use 0.0.0.0/0)
- [ ] Connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

## Step 2: Update Backend for Production
- [ ] Verify `server.js` has proper CORS configuration
- [ ] Ensure `vercel.json` is in BookmarkBackend root
- [ ] Check all dependencies in `package.json`
- [ ] Create `.env.example` (already done)

## Step 3: Update Frontend for Production
- [ ] Verify `vite.config.js` exists
- [ ] Ensure `.env.example` is created (already done)
- [ ] Check `src/api/api.js` uses `VITE_API_URL` (already configured ✓)

## Step 4: Deploy Backend
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
cd BookmarkBackend
vercel --prod
```

**Note:** Copy the Vercel URL from the output (e.g., `https://bookmark-backend-xxx.vercel.app`)

## Step 5: Add Environment Variables to Vercel
**For Backend (Vercel Dashboard):**
1. Go to Settings → Environment Variables
2. Add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `FRONTEND_URL`: Your frontend Vercel URL (will get after frontend deploy)
   - `NODE_ENV`: production

**For Frontend (Vercel Dashboard):**
1. Go to Settings → Environment Variables
2. Add:
   - `VITE_API_URL`: https://your-backend-url.vercel.app (the URL from backend deployment)

## Step 6: Deploy Frontend
```bash
cd BookmarkFrontend
vercel --prod
```

## Step 7: Test Deployment
- [ ] Visit frontend URL in browser
- [ ] Test login/register functionality
- [ ] Create a bookmark
- [ ] Check browser console for errors
- [ ] Test API calls with network tab open

## Dependencies Summary

**Backend Production Dependencies:**
- express@4.18.2
- mongoose@7.0.3
- cors@2.8.5
- dotenv@16.0.3

**Frontend Production Dependencies:**
- react@18.2.0
- react-dom@18.2.0
- react-router-dom@6.8.1
- axios@1.3.4

**Dev Dependencies (not needed in production):**
- Backend: nodemon@2.0.22
- Frontend: vite, @vitejs/plugin-react, eslint

## Important Notes

⚠️ **CORS Configuration**
- Update from `origin: '*'` to specific domain after testing
- Example: `origin: process.env.FRONTEND_URL`

⚠️ **MongoDB Atlas Security**
- Always use connection string with authentication
- Don't use admin user for application
- Enable IP whitelist
- Use strong passwords

⚠️ **Environment Variables**
- Never commit `.env` files
- Always use Vercel dashboard for secrets
- Keep MongoDB credentials safe

✅ **Vercel Node.js Support**
- Supports Node.js 16, 18, 20+
- Default functions: 60 second timeout (Pro: 900 seconds)
- Auto-scales with traffic

## Troubleshooting

**MongoDB Connection Issues:**
- Check IP whitelist in MongoDB Atlas
- Verify connection string format
- Ensure credentials are correct
- Check network access is enabled

**API Not Responding:**
- Verify CORS origin setting
- Check environment variables in Vercel dashboard
- View function logs in Vercel dashboard
- Test endpoint directly: `https://your-backend.vercel.app/`

**Frontend Not Loading:**
- Check build output in Vercel
- Verify VITE_API_URL is set
- Clear browser cache
- Check browser console for errors

## Useful Commands

```bash
# View Vercel deployment logs
vercel logs --prod

# Redeploy
vercel --prod

# View environment variables
vercel env ls

# Remove deployment
vercel remove
```

## Links
- Vercel: https://vercel.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Express Deployment: https://expressjs.com/en/advanced/best-practice-performance.html
