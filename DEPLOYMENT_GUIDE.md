# 🚀 CivicSense Deployment Guide (Free)

This guide will help you deploy your full-stack project for free using **Render** (Backend) and **Vercel** (Frontend).

## 🛠️ Step 1: Backend Deployment (Render)

1. **Create a Account**: Go to [Render.com](https://render.com/) and sign up with GitHub.
2. **New Web Service**: Click **New +** -> **Web Service**.
3. **Connect Repo**: Select your `CivicSenseN` repository.
4. **Settings**:
   - **Name**: `civicsense-backend`
   - **Environment**: `Node`
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. **Environment Variables**: Click **Advanced** -> **Add Environment Variable**:
   - `MONGODB_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (Your secret key)
   - `OPENAI_API_KEY`: (Your OpenAI key)
   - `HUGGING_FACE_TOKEN`: (Your Hugging Face token)
   - `FRONTEND_URL`: (You will get this after Step 2)
   - `PORT`: `10000` (Render default)

## 🎨 Step 2: Frontend Deployment (Vercel)

1. **Create Account**: Go to [Vercel.com](https://vercel.com/) and sign up with GitHub.
2. **Import Project**: Click **Add New** -> **Project**.
3. **Connect Repo**: Select your `CivicSenseN` repository.
4. **Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**: Add:
   - `VITE_API_BASE_URL`: (The URL you get from Render in Step 1, e.g., `https://civicsense-backend.onrender.com`)
6. **Deploy**: Click **Deploy**.

## 🔄 Step 3: Connect Them

Once your Frontend is deployed (e.g., `https://civicsense.vercel.app`):
1. Go back to your **Render Backend Dashboard**.
2. Add/Update the `FRONTEND_URL` environment variable with your Vercel URL.
3. Restart the Backend service.

---

### 📝 Important Notes:
- **Free Tier Sleep**: Render's free tier "sleeps" after 15 minutes of inactivity. The first request after a break might take 30-50 seconds to wake up the server.
- **MongoDB Atlas**: Ensure your MongoDB Atlas Network Access is set to `0.0.0.0/0` (Allow access from anywhere) so Render can connect.
