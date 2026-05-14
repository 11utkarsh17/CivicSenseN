# 🚀 CivicSense Deployment Guide (Vercel Only - Recommended)

Since Render's free tier can be unstable (502 errors), you can now deploy **both** your Frontend and Backend to Vercel for a much smoother experience.

## 🎨 Step 1: Deploy Everything to Vercel

1. **Create Account**: Go to [Vercel.com](https://vercel.com/) and sign up with GitHub.
2. **Import Project**: Click **Add New** -> **Project**.
3. **Connect Repo**: Select your `CivicSenseN` repository.
4. **Settings**:
   - **Framework Preset**: `Other` (Vercel will use the `vercel.json` we created).
   - **Root Directory**: Select the **Project Root** (not the Frontend or Backend folders).
5. **Environment Variables**: Add all your keys here:
   - `MONGODB_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (Your secret key)
   - `OPENAI_API_KEY`: (Your OpenAI key)
   - `HUGGING_FACE_TOKEN`: (Your Hugging Face token)
   - `NODE_ENV`: `production`
   - `VITE_API_BASE_URL`: (Leave empty or set to `/` if using Vercel for both)
6. **Deploy**: Click **Deploy**.

## 🔄 Step 2: Benefits of Vercel Backend
- **No 502 Errors**: Vercel uses Serverless Functions, which scale automatically.
- **No Sleep**: Your API will respond faster than Render's free tier.
- **Unified URL**: Your Frontend and Backend will live on the same domain (e.g., `https://civicsense.vercel.app/api/...`).

---

## 🛠️ (Optional) If you still want to use Render for Backend
If you prefer Render for the backend:
1. Ensure your **Root Directory** is set to `Backend`.
2. Check your **Logs** on Render to see why it's crashing.
3. Make sure `MONGODB_URI` is correct; if it can't connect, the server will exit and give a 502.



---

### 📝 Important Notes:
- **Free Tier Sleep**: Render's free tier "sleeps" after 15 minutes of inactivity. The first request after a break might take 30-50 seconds to wake up the server.
- **MongoDB Atlas**: Ensure your MongoDB Atlas Network Access is set to `0.0.0.0/0` (Allow access from anywhere) so Render can connect.
