# API Endpoint Matching & Troubleshooting

## Current Architecture

### Frontend API Configuration
- **Base URL**: `${VITE_API_URL}/api` (e.g., `https://your-backend.vercel.app/api`)
- **Authentication**: Email-based (no password)
- **Storage**: localStorage (userId, userName)

---

## Registration & Login Flow

### REGISTRATION ✅
**Frontend Call:**
```javascript
userAPI.createUser({ name, email })
// POST: /api/users
```

**Backend Route:**
```
POST /users → createUser controller
```

**Expected Response:**
```json
{
  "_id": "user_id_here",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-05-12T..."
}
```

**Frontend stores:**
```javascript
localStorage.setItem('userId', response.data._id)
localStorage.setItem('userName', response.data.name)
navigate('/dashboard')
```

---

### LOGIN ✅
**Frontend Call:**
```javascript
userAPI.getUserByEmail(email)
// GET: /api/users/email/:email
```

**Backend Route:**
```
GET /users/email/:email → getUserByEmail controller
```

**Expected Response:**
```json
{
  "_id": "user_id_here",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-05-12T..."
}
```

**Frontend stores:**
```javascript
localStorage.setItem('userId', response.data._id)
localStorage.setItem('userName', response.data.name)
navigate('/dashboard')
```

---

## Possible Issues & Fixes

### Issue 1: CORS Error
**Symptom**: Network tab shows 0 response or CORS error

**Cause**: Frontend domain not whitelisted in backend CORS

**Solution**: Update `BookmarkBackend/server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
```

**Or for all domains (dev only):**
```javascript
app.use(cors({
  origin: "*",
  credentials: false
}));
```

---

### Issue 2: 404 Not Found
**Symptom**: Network tab shows 404 error

**Check**:
1. API_BASE_URL is correct: `https://your-backend.vercel.app/api`
2. Routes are registered in `server.js`:
   ```javascript
   app.use('/api/users', userRoutes);
   ```

**Debug**: Test directly in browser:
- `https://your-backend.vercel.app/` → Should say "Backend Running"
- `https://your-backend.vercel.app/api/users/email/test@test.com` → Should return user or 404

---

### Issue 3: Undefined Response
**Symptom**: Error like `Cannot read property '_id' of undefined`

**Cause**: Response structure mismatch

**Fix in frontend**: Log the response:
```javascript
const r = await userAPI.createUser(form)
console.log('Full response:', r)
console.log('User data:', r.data)
```

**Expected**: `r.data` should have `_id`, `name`, `email`

---

### Issue 4: Email Not Found on Login
**Symptom**: Always shows "No account found with that email"

**Causes**:
1. User never registered
2. Email mismatch (case sensitivity)
3. User didn't save to MongoDB

**Fixes**:
1. Register first with exact email
2. Check MongoDB for user data
3. Add password to User model for proper authentication

---

## Database Verification

### Check if User Exists in MongoDB

**Using MongoDB Atlas:**
1. Go to Collections → `users` collection
2. Search for the email you registered
3. You should see a document with `_id`, `name`, `email`, `createdAt`

**If no users exist**: Registration is failing silently

---

## Testing Checklist

### Local Testing (Before Production)
- [ ] Start backend: `npm run dev` (port 5000)
- [ ] Start frontend: `npm run dev` (port 3000)
- [ ] Open http://localhost:3000
- [ ] Register with test@example.com
- [ ] Check browser DevTools Console for errors
- [ ] Check MongoDB to confirm user was created
- [ ] Try logging in with same email
- [ ] Verify localStorage has userId and userName

### Production Testing
- [ ] Frontend loads from Vercel URL
- [ ] Check `.env` has correct VITE_API_URL
- [ ] Open browser DevTools → Network tab
- [ ] Try registration
- [ ] Watch for:
  - CORS errors
  - 404 errors
  - 500 errors
  - Empty responses

---

## Environment Variables Required

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
PORT=5000
```

### Frontend (.env.local)
```
VITE_API_URL=https://your-backend.vercel.app
```

---

## Recommended Improvements

### Add Password Authentication
Current system: Email-only (no password)
Recommendation: Add password for security

**New User Model:**
```javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,  // Add this
  createdAt: { type: Date, default: Date.now }
});
```

### Add Login Endpoint
Create dedicated login route instead of using getUserByEmail

```javascript
// routes/userRoutes.js
router.post('/login', login);  // NEW

// controllers/userController.js
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  // Verify password (use bcrypt in production)
  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  res.json({ token: generateToken(user._id), user });
};
```

### Add JWT Token
Use JWT for better security:
```javascript
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
localStorage.setItem('token', token);
```

---

## Quick Debug Commands

### Test Backend Endpoints

```bash
# Test if backend is running
curl https://your-backend.vercel.app/

# Test user creation
curl -X POST https://your-backend.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'

# Test user lookup
curl https://your-backend.vercel.app/api/users/email/test@example.com
```

### Frontend Console Debugging

```javascript
// Check API URL
console.log('API Base:', import.meta.env.VITE_API_URL)

// Check localStorage
console.log('UserId:', localStorage.getItem('userId'))
console.log('UserName:', localStorage.getItem('userName'))

// Test API call directly
import { userAPI } from './api/api'
userAPI.createUser({name: 'Test', email: 'test@example.com'})
  .then(r => console.log('Success:', r.data))
  .catch(e => console.log('Error:', e))
```

---

## Contact API Endpoints (Reference)

| Action | Method | Endpoint | Frontend Call |
|--------|--------|----------|---|
| Register | POST | `/api/users` | `userAPI.createUser()` |
| Login | GET | `/api/users/email/:email` | `userAPI.getUserByEmail()` |
| Get User | GET | `/api/users/:id` | `userAPI.getUser()` |
| Logout | POST | `/api/users/logout` | `userAPI.logout()` |

---

## Next Steps

1. **Check Browser Console** for any errors (F12 → Console tab)
2. **Check Network Tab** (F12 → Network tab):
   - Look for requests to `/api/users`
   - Check response status (200, 404, 500, etc.)
   - Check response payload
3. **Check MongoDB** to see if users are being created
4. **Add console.log** in backend controllers to debug

Let me know what errors you see!
