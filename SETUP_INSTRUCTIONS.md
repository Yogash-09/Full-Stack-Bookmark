# Local Development Environment Setup

## Backend (.env for development)

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/bookmark_db?retryWrites=true&w=majority
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
PORT=5000
```

**Steps:**
1. Create `.env` file in `BookmarkBackend` root
2. Replace credentials with your MongoDB Atlas connection string
3. Run: `npm run dev`

## Frontend (.env.local for development)

```
VITE_API_URL=http://localhost:5000
```

**Steps:**
1. Create `.env.local` file in `BookmarkFrontend` root
2. Run: `npm run dev`
3. Visit: `http://localhost:3000`

## Getting MongoDB Atlas Connection String

1. Go to https://www.mongodb.com/cloud/atlas
2. Create/Login to account
3. Create a cluster (Free tier M0)
4. Create database user with username & password
5. Click "Connect" → "Drivers" → copy connection string
6. Replace `<username>` and `<password>` with your credentials
7. Replace `<dbname>` with `bookmark_db` (or your choice)

## Testing Locally

```bash
# Terminal 1 - Backend
cd BookmarkBackend
npm install
npm run dev

# Terminal 2 - Frontend
cd BookmarkFrontend
npm install
npm run dev
```

Visit: http://localhost:3000

## For Production (Vercel)

After local testing works, follow `DEPLOYMENT_CHECKLIST.md` for deployment.

**Key differences:**
- Use Vercel dashboard for environment variables (not .env files)
- Use MongoDB Atlas connection string (same as local)
- Update CORS to specific domain
- Update Frontend URL to Vercel deployment URL
