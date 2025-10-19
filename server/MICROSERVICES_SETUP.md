# 🎯 Microservices Setup Guide

Your backend is now split into **two separate services**:

1. **Node.js Backend** (Express + Socket.IO) - Main API
2. **Flask ML API** (Python) - Disease predictions only

This is cleaner, simpler, and easier to deploy!

---

## 📊 Architecture

```
Frontend (Firebase)
    ↓
Node.js Backend (Render)
    ↓ calls via HTTP
Flask ML API (Render)
```

---

## 🏠 LOCAL DEVELOPMENT

### Step 1: Run Flask ML API

```bash
# Terminal 1
cd server/ml_models
pip install -r requirements.txt
python flask_api.py
```

You should see:
```
🚀 Disease Prediction API starting on port 5002...
```

### Step 2: Run Node.js Backend

```bash
# Terminal 2
cd server
npm install
npm start
```

You should see:
```
Server running on port 5001
Calling ML API at http://localhost:5002/predict
```

### Step 3: Test Locally

```bash
# Test ML API directly
curl -X POST http://localhost:5002/predict \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "vomiting", "lethargy"],
    "animal_type": "Dog",
    "age": 3,
    "weight": 20
  }'

# Test through Node.js backend
curl -X POST http://localhost:5001/api/predict-disease \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "vomiting"],
    "animal_type": "Dog",
    "age": 3,
    "weight": 20,
    "user_id": 1
  }'
```

---

## 🚀 RENDER DEPLOYMENT

### Part 1: Deploy Flask ML API

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Click "New +" → "Web Service"**

3. **Connect GitHub** and select your repository

4. **Configure:**
   - **Name**: `petcarehub-ml-api`
   - **Root Directory**: `server/ml_models`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -b 0.0.0.0:$PORT flask_api:app`
   - **Plan**: Free

5. **Click "Create Web Service"**

6. **Wait for deployment** (5-10 minutes)

7. **Copy your ML API URL**: `https://petcarehub-ml-api.onrender.com`

### Part 2: Update Node.js Backend

1. **Go to your existing Node.js backend service** on Render

2. **Go to "Environment" tab**

3. **Add new environment variable:**
   - **Key**: `ML_API_URL`
   - **Value**: `https://petcarehub-ml-api.onrender.com` (your ML API URL from step 7)

4. **Click "Save Changes"**

5. **Backend will auto-redeploy** (2-3 minutes)

### Part 3: Test Production

```bash
# Test ML API
curl -X POST https://petcarehub-ml-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms":["fever"],"animal_type":"Dog","age":3,"weight":20}'

# Test through backend
curl -X POST https://petcarehub-backend.onrender.com/api/predict-disease \
  -H "Content-Type: application/json" \
  -d '{"symptoms":["fever"],"animal_type":"Dog","age":3,"weight":20,"user_id":1}'
```

---

## ✅ Verification Checklist

- [ ] Flask ML API deployed and shows "healthy" status
- [ ] Node.js backend deployed and shows "healthy" status
- [ ] `ML_API_URL` environment variable added to Node.js backend
- [ ] ML API health check works: `curl https://your-ml-api.onrender.com/`
- [ ] Backend health check works: `curl https://your-backend.onrender.com/`
- [ ] Disease prediction works through backend
- [ ] Frontend disease predictor page works end-to-end

---

## 🐛 Troubleshooting

### Problem: "ML prediction service unavailable"

**Cause**: Flask API is sleeping (free tier sleeps after 15 min inactivity)

**Solution**:
1. Visit the ML API URL directly to wake it up
2. Wait 30-60 seconds for cold start
3. Try prediction again

### Problem: "ModuleNotFoundError: No module named 'flask'"

**Cause**: Requirements not installed

**Solution**:
1. Check `requirements.txt` exists in `server/ml_models/`
2. Verify build command: `pip install -r requirements.txt`
3. Check Render build logs for errors

### Problem: "ECONNREFUSED" in Node.js logs

**Cause**: Wrong `ML_API_URL` or ML API is down

**Solution**:
1. Verify `ML_API_URL` is correct (check Render dashboard)
2. Make sure ML API service is running
3. Test ML API health endpoint directly

### Problem: Model file not found

**Cause**: `disease_model.pkl` or `severity_mapping.json` missing

**Solution**:
1. Make sure files are in `server/ml_models/` directory
2. Check they're committed to GitHub
3. Verify they're not in `.gitignore`

---

## 💡 Tips

1. **Free Tier Sleep**: Both services will sleep after 15 min of inactivity. First request will be slow (30-60 sec).

2. **Keep Alive** (Optional): Use a service like UptimeRobot to ping both services every 10 minutes.

3. **Upgrade to Paid**: For $7/month each, you get 24/7 uptime with no cold starts.

4. **Logs**: Check Render logs if something fails:
   - Flask ML API logs: Look for Python errors
   - Node.js backend logs: Look for "Error calling ML API"

5. **Local Development**: Always run both services locally for testing!

---

## 📁 File Structure

```
server/
├── index.js              # Node.js backend (calls ML API)
├── package.json          # Node.js dependencies (includes axios)
├── render.yaml           # Node.js backend deployment config
└── ml_models/
    ├── flask_api.py      # Flask ML API server
    ├── requirements.txt  # Python dependencies
    ├── render.yaml       # Flask ML API deployment config
    ├── disease_model.pkl # ML model file
    └── severity_mapping.json
```

---

## 🎉 You're Done!

Once both services are deployed and `ML_API_URL` is set:

1. ✅ Node.js backend is live
2. ✅ Flask ML API is live
3. ✅ Backend can call ML API
4. ✅ Frontend can use disease predictions

Test it on your site: **fyppp-5b4f0.web.app/disease-predictor** 🚀

---

## 📚 Additional Resources

- **Flask ML API Guide**: `server/ml_models/DEPLOYMENT_GUIDE.md`
- **Quick Start**: `server/ml_models/QUICK_START.md`
- **Main Backend Guide**: `server/RENDER_DEPLOYMENT_GUIDE.md`

Need help? Check the logs on Render dashboard! 🔍

