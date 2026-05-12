# Vercel Deployment - Permission Denied Fix

## Problem
```
sh: line 1: /vercel/path0/BookmarkFrontend/node_modules/.bin/vite: Permission denied
Error: Command "npm run build" exited with 126
```

Exit code 126 = Permission Denied
This happens when `node_modules` is committed to Git with incorrect file permissions.

## Solution

### Step 1: Remove node_modules from Git Tracking

Open terminal in `d:\bookmark_organisation` and run:

```bash
# Remove node_modules from git cache (don't delete local files)
git rm -r --cached BookmarkFrontend/node_modules
git rm -r --cached BookmarkBackend/node_modules

# Check status
git status
```

### Step 2: Commit the Changes

```bash
git add -A
git commit -m "Remove node_modules from git tracking"
git push origin main
```

### Step 3: Verify .gitignore

Your `.gitignore` should contain:
```
node_modules/
.env
dist/
build/
```

✅ Already configured correctly in your project

### Step 4: Redeploy on Vercel

After pushing changes:
1. Go to Vercel dashboard
2. Vercel will automatically redeploy
3. This time, it will:
   - Clone your repo WITHOUT node_modules
   - Run `npm install` to reinstall with correct permissions
   - Build successfully

### Step 5: Verify Configuration Files (Already Done ✅)

Created files:
- `BookmarkFrontend/vercel.json` - Build output: `dist`
- `BookmarkFrontend/.vercelignore` - Ignores node_modules during build
- `BookmarkBackend/.vercelignore` - Same for backend

## Alternative: If Above Doesn't Work

Clear Vercel build cache:

```bash
# In Vercel dashboard:
1. Go to Settings → Git
2. Scroll to "Vercel for Git"
3. Click "Redeploy" button → "Redeploy with cleared cache"
```

Or via Vercel CLI:
```bash
vercel rebuild --prod
```

## How to Prevent This

Going forward, follow these practices:
1. **Always add `node_modules/` to .gitignore BEFORE first commit**
2. **Never commit node_modules** (only commit package.json & package-lock.json)
3. **Use .vercelignore** to tell Vercel to skip certain files
4. **Let Vercel rebuild node_modules** during deployment

## Files Committed vs Not Committed

### ✅ SHOULD BE Committed:
- `package.json`
- `package-lock.json`
- `src/` folder
- `public/` folder
- `vercel.json`
- `.vercelignore`

### ❌ SHOULD NOT BE Committed:
- `node_modules/` ← Most Important!
- `.env` (use environment variables in Vercel dashboard)
- `dist/` (build output)
- `.next/` (Next.js build)
- `build/` (build folder)
- `.vercel/` (Vercel cache)

## Checking What's Currently Tracked

```bash
# See all files git is tracking
git ls-files | grep node_modules

# If this shows node_modules, run Step 1 above
```
