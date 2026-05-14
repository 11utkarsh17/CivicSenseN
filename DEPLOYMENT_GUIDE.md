# 🚀 CivicSense Deployment Guide (Vercel Only - Recommended)

Since Render's free tier can be unstable (502 errors), you can now deploy **both** your Frontend and Backend to Vercel for a much smoother experience.

## 🎨 Step 1: Deploy Everything to Vercel

1. **Create Account**: Go to [Vercel.com](https://vercel.com/) and sign up with GitHub.
2. **Import Project**: Click **Add New** -> **Project**.
3. **Connect Repo**: Select your `CivicSenseN` repository.
4. **Settings (CRITICAL)**:
   - **Framework Preset**: Select **"Other"**.
   - **Root Directory**: Ensure this is **empty** (Project Root).
   - **Build Command**: `npm run frontend-build`
   - **Install Command**: `npm run install-all`
   - **Output Directory**: `Frontend/dist`
5. **Environment Variables**: Add all your keys here:
   - `MONGODB_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (Your secret key)
   - `OPENAI_API_KEY`: (Your OpenAI key)
   - `HUGGING_FACE_TOKEN`: (Your Hugging Face token)
   - `NODE_ENV`: `production`
   - `VITE_API_BASE_URL`: (Leave empty or set to `/`)
6. **Deploy**: Click **Deploy**.

## 🔄 Step 2: Benefits of Vercel Backend
- **No 502 Errors**: Vercel uses Serverless Functions, which scale automatically.
- **Unified URL**: Both Frontend and Backend will live on the same domain (e.g., `https://civicsense.vercel.app/api/...`).
- **One-Click Updates**: Every time you push to GitHub, both parts are updated.

---

## 🛠️ Troubleshooting 502 Errors
If you still see "Connecting to Google..." or 502 errors:
1. **Check MongoDB Access**: Ensure your MongoDB Atlas Network Access allows `0.0.0.0/0`.
2. **Vercel Logs**: Go to the **Functions** tab in Vercel to see the backend error logs.
3. **Environment Variables**: Double-check that all keys are correctly pasted into Vercel.



---

### 📝 Important Notes:
- **Free Tier Sleep**: Render's free tier "sleeps" after 15 minutes of inactivity. The first request after a break might take 30-50 seconds to wake up the server.
- **MongoDB Atlas**: Ensure your MongoDB Atlas Network Access is set to `0.0.0.0/0` (Allow access from anywhere) so Render can connect.
