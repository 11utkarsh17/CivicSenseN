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
   - `FRONTEND_URL`: `https://civic-sense-n.vercel.app`
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
   - `VITE_API_BASE_URL`: `https://civicsensen.onrender.com`
6. **Deploy**: Click **Deploy**.

## 🔄 Step 3: Final Verification

Once both are deployed:
1. Visit [https://civic-sense-n.vercel.app/](https://civic-sense-n.vercel.app/)
2. Try to **Login** or **Register**.
3. If the login works, your full-stack deployment is successful!


---

### 📝 Important Notes:
- **Free Tier Sleep**: Render's free tier "sleeps" after 15 minutes of inactivity. The first request after a break might take 30-50 seconds to wake up the server.
- **MongoDB Atlas**: Ensure your MongoDB Atlas Network Access is set to `0.0.0.0/0` (Allow access from anywhere) so Render can connect.
