# Login/Registration Troubleshooting - Step by Step

## API Endpoints Comparison

### Summary - Everything Should Match ✅

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| **Register** | POST /api/users | POST /users | ✅ Match |
| **Login** | GET /api/users/email/:email | GET /users/email/:email | ✅ Match |
| **Data Fields** | {name, email} | Expects {name, email} | ✅ Match |
| **Response** | r.data._id, r.data.name | Returns user object | ✅ Match |

---

## Debugging Steps (Follow in Order)

### Step 1: Check Backend is Running
**Local testing:**
```bash
# In BookmarkBackend folder
npm run dev

# You should see:
# ╔════════════════════════════════════════╗
# ║   🎯 Bookmark Backend Server Running   ║
# ╚════════════════════════════════════════╝
#   🌐 Server: http://localhost:5000
#   📊 Health: http://localhost:5000/health
```

**Test endpoints in browser:**
- http://localhost:5000/ → Should return JSON with status
- http://localhost:5000/health → Should return OK status
- http://localhost:5000/api/test → Should return CORS info

✅ If all 3 work, backend is fine

---

### Step 2: Check Frontend Environment Variable

**Frontend:**
```bash
# Check .env.local exists
cat BookmarkFrontend/.env.local

# Should contain:
# VITE_API_URL=http://localhost:5000
```

**Or check in browser console:**
```javascript
console.log(import.meta.env.VITE_API_URL)
// Should print: http://localhost:5000 (or your Vercel URL in production)
```

---

### Step 3: Test Registration

**Open browser DevTools (F12):**

1. **Go to Console tab** and run:
```javascript
import { userAPI } from './src/api/api.js'

userAPI.createUser({
  name: 'Test User',
  email: 'test@example.com'
})
.then(r => {
  console.log('✅ Registration Success:', r.data)
})
.catch(e => {
  console.error('❌ Registration Failed:', e.response?.data || e.message)
})
```

**Expected Success Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Test User",
  "email": "test@example.com",
  "createdAt": "2026-05-12T10:30:00.000Z"
}
```

**Possible Error Responses:**
| Error | Meaning | Fix |
|-------|---------|-----|
| `Email already exists` | User was already registered | Use different email |
| `CORS error` | Backend CORS not set | Check server.js CORS origin |
| `404 Not Found` | Wrong API URL | Check VITE_API_URL |
| `500 Internal Server Error` | MongoDB error | Check MongoDB connection |
| `Network error` | Can't reach backend | Check backend is running |

---

### Step 4: Check MongoDB

**MongoDB Atlas:**
1. Go to Collections
2. Find `users` collection
3. You should see your test user

**If no users exist:**
- Registration is failing silently
- Check backend console for error messages
- MongoDB connection might be wrong

---

### Step 5: Test Login

**After successful registration, test login:**

```javascript
userAPI.getUserByEmail('test@example.com')
.then(r => {
  console.log('✅ Login Success:', r.data)
})
.catch(e => {
  console.error('❌ Login Failed:', e.response?.data || e.message)
})
```

**Expected Response:** Same user object

---

### Step 6: Monitor Backend Console

**Backend should show logs like:**

```
📝 Registration attempt: { name: 'Test User', email: 'test@example.com' }
✅ User registered successfully: 507f1f77bcf86cd799439011

🔍 Login attempt for email: test@example.com
✅ User found for login: 507f1f77bcf86cd799439011
```

**If you see errors**, copy them and check the fixes below.

---

## Common Issues & Fixes

### Issue: "Email already exists"
**Cause**: Email was already registered
**Fix**: Register with different email or delete the user from MongoDB

### Issue: CORS error in console
**Cause**: Frontend URL not whitelisted in backend

**Fix in server.js:**
```javascript
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://full-stack-bookmark-xxx.vercel.app"
  ],
  credentials: true
}));
```

### Issue: 404 Not Found
**Cause**: API endpoint doesn't exist

**Check**:
```javascript
// This should work:
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`

// Verify routes in backend:
// POST /users → ✅
// GET /users/email/:email → ✅
```

### Issue: 500 Internal Server Error
**Check backend console** for detailed error

**Common causes:**
- Missing MONGODB_URI environment variable
- Invalid MongoDB connection string
- Network error reaching MongoDB

### Issue: Response is undefined
**Frontend sees:**
```javascript
r.data._id → TypeError: Cannot read property '_id' of undefined
```

**Cause**: Backend didn't return user object

**Check**: Backend must return user object, not a string

```javascript
// ✅ Correct
res.status(201).json(user)  // Returns object

// ❌ Wrong
res.send("User created")    // Returns string
```

---

## Production Debugging (Vercel)

### Check Vercel Logs

**For Frontend:**
1. Go to https://vercel.com/dashboard
2. Select your frontend deployment
3. Click "Logs" → check for errors

**For Backend:**
1. Go to https://vercel.com/dashboard
2. Select your backend deployment
3. Click "Logs" → check for MongoDB/CORS errors

### Check Environment Variables

**Vercel Dashboard:**
1. Settings → Environment Variables
2. Verify VITE_API_URL points to correct backend URL
3. Verify MONGODB_URI is set in backend
4. Verify FRONTEND_URL is set in backend

### Test Production API

**In browser console on production site:**
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL)

// Should print your backend Vercel URL
// NOT localhost
```

---

## Network Tab Debugging

**Open DevTools → Network tab → Try to register**

**You should see:**
1. Request: `POST https://your-backend.vercel.app/api/users`
   - Status: `201` (created) or `400`/`500` (error)
   - Request headers: `Content-Type: application/json`
   - Request body: `{name: "...", email: "..."}`
   - Response: `{_id, name, email, createdAt}`

**If request doesn't appear:**
- Frontend API call not working
- CORS blocking the request

**If request shows 404:**
- Wrong URL
- Routes not registered

**If request shows 500:**
- Backend error (check backend console)

---

## Quick Test Commands

```bash
# Test registration (using curl)
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test123@example.com"}'

# Test login (using curl)
curl http://localhost:5000/api/users/email/test123@example.com

# Test CORS
curl -H "Origin: http://localhost:3000" \
  http://localhost:5000/api/test
```

---

## Next Actions

1. **Run backend locally** with `npm run dev`
2. **Check console output** for any errors
3. **Try registration** using the step-by-step console commands
4. **Check MongoDB** for user records
5. **Share any error messages** you see

Once local works, Vercel should work automatically!

---

## Still Having Issues?

**Check these files are updated:**
- ✅ `BookmarkBackend/server.js` - Has console logging
- ✅ `BookmarkBackend/controllers/userController.js` - Has console logs
- ✅ `BookmarkBackend/config/db.js` - Better error messages
- ✅ `BookmarkFrontend/.env.local` - Has VITE_API_URL
- ✅ `BookmarkBackend/.env` - Has MONGODB_URI

**Share the following when asking for help:**
1. Backend console output (all logs)
2. Browser console errors (F12)
3. Network tab showing failed requests
4. MongoDB showing if users collection is empty
