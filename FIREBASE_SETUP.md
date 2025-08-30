# Firebase Setup Guide

## Step 1: Install Firebase
Since npm commands are blocked on your work PC, you need to install Firebase manually:

**Option A: Use a different terminal (if available)**
```bash
npm install firebase
```

**Option B: Manual installation**
1. Download Firebase from: https://unpkg.com/firebase@10.7.0/dist/
2. Place the files in your `node_modules/firebase/` folder

## Step 2: Test the App
1. **Start the app locally**: `npm run dev`
2. **Go to Availability page** as a worker
3. **Try to save constraints** - should work with Firebase now!

## What Firebase Gives You:
✅ **Real-time sync** between all devices  
✅ **No schema cache issues** (unlike Supabase)  
✅ **Works immediately** after setup  
✅ **Cross-device functionality**  

## If You Still Can't Install Firebase:
**Alternative: Use the existing localStorage approach**
- Workers can save locally
- Data persists on their device
- Managers can see data when workers are on same device

## Current Status:
- ✅ Firebase configuration created
- ✅ Firebase store created  
- ✅ Availability page updated
- ✅ App routing fixed
- ❌ Firebase package needs installation

**Install Firebase and test!** 🚀
