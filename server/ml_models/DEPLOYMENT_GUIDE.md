# 🚀 ML API Deployment Guide

This guide shows you how to deploy the Flask-based Disease Prediction API separately from the Node.js backend.

## 📋 Architecture

- **Node.js Backend** → Handles main API, Socket.IO, payments, bookings (deployed on Render)
- **Flask ML API** → Handles disease predictions only (deployed separately on Render)
- **Frontend** → Hosted on Firebase (calls Node.js backend, which calls Flask ML API)

## 🏃 Local Development

### 1. Install Python Dependencies

```bash
cd server/ml_models
pip install -r requirements.txt
```

### 2. Run the Flask API

```bash
# This will start on port 5002 by default
python flask_api.py
```

You should see:
```
🚀 Disease Prediction API starting on port 5002...
 * Running on http://0.0.0.0:5002
```

### 3. Test the API

```bash
curl -X POST http://localhost:5002/predict \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "vomiting", "lethargy"],
    "animal_type": "Dog",
    "age": 3,
    "weight": 20
  }'
```

### 4. Run the Node.js Backend

In another terminal:

```bash
cd server
npm install
npm start
```

The Node.js backend will call the Flask API at `http://localhost:5002` by default.

## 🌐 Render Deployment

### Option 1: Deploy via Render Dashboard (EASIEST)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repo** and select it

4. **Configure the service:**
   - **Name**: `petcarehub-ml-api`
   - **Root Directory**: `server/ml_models`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -b 0.0.0.0:$PORT flask_api:app`

5. **Click "Create Web Service"**

6. **Wait for deployment** (5-10 minutes)

7. **Copy your ML API URL** (e.g., `https://petcarehub-ml-api.onrender.com`)

8. **Update Node.js Backend Environment Variable:**
   - Go to your Node.js backend service on Render
   - Go to "Environment" tab
   - Add: `ML_API_URL` = `https://petcarehub-ml-api.onrender.com`
   - Click "Save Changes"

### Option 2: Deploy via render.yaml

If you used the render.yaml approach, add this to your root `render.yaml`:

```yaml
services:
  # Your existing Node.js backend
  - type: web
    name: petcarehub-backend
    runtime: node
    # ... your existing config ...

  # New ML API service
  - type: web
    name: petcarehub-ml-api
    runtime: python3
    rootDir: server/ml_models
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn -b 0.0.0.0:$PORT flask_api:app
    healthCheckPath: /
```

## 🧪 Testing After Deployment

### 1. Test ML API Directly

```bash
curl -X POST https://your-ml-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "vomiting"],
    "animal_type": "Dog",
    "age": 3,
    "weight": 20
  }'
```

Should return:
```json
{
  "predictions": [
    {
      "disease": "Parvovirus",
      "confidence": "85%",
      "severity": "High",
      "recommendation": "Immediate veterinary attention required..."
    }
  ],
  "status": "success"
}
```

### 2. Test via Node.js Backend

```bash
curl -X POST https://petcarehub-backend.onrender.com/api/predict-disease \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "vomiting"],
    "animal_type": "Dog",
    "age": 3,
    "weight": 20,
    "user_id": 1
  }'
```

### 3. Test from Frontend

Go to your disease predictor page and submit symptoms. It should work end-to-end!

## 🔧 Troubleshooting

### ML API returns 503 "Service Unavailable"

**Problem**: Flask API is down or sleeping (free tier)

**Solution**: 
- Visit the ML API URL directly to wake it up
- Consider upgrading to a paid Render plan for 24/7 uptime
- Or implement a health check endpoint that pings it every 10 minutes

### Node.js backend can't reach ML API

**Problem**: `ECONNREFUSED` or `ETIMEDOUT` errors

**Solution**:
- Verify `ML_API_URL` environment variable is set correctly
- Check ML API logs on Render
- Ensure ML API is deployed and running

### Python import errors

**Problem**: `ModuleNotFoundError: No module named 'joblib'`

**Solution**:
- Check requirements.txt is in `server/ml_models/` directory
- Verify build command is `pip install -r requirements.txt`
- Check Render build logs for errors

### Model file not found

**Problem**: `FileNotFoundError: disease_model.pkl`

**Solution**:
- Ensure `disease_model.pkl` and `severity_mapping.json` are in `server/ml_models/`
- Check they're not in `.gitignore`
- Verify they're being deployed (check Render logs)

## 📊 Free Tier Limitations

Render's free tier has limitations:

- **Sleep after 15 minutes** of inactivity
- **First request slow** (cold start ~30-60 seconds)
- **Limited CPU/RAM**

**Workarounds:**
1. Use a cron job to ping the API every 10 minutes
2. Show a loading message: "Waking up prediction service..."
3. Upgrade to paid tier ($7/month) for 24/7 uptime

## 🎯 Next Steps

1. ✅ Deploy Flask ML API to Render
2. ✅ Get ML API URL
3. ✅ Add `ML_API_URL` to Node.js backend environment variables
4. ✅ Test end-to-end from frontend
5. 🚀 You're live!

## 📝 Environment Variables Summary

**Node.js Backend** (petcarehub-backend):
```env
ML_API_URL=https://petcarehub-ml-api.onrender.com
# ... all your other vars ...
```

**Flask ML API** (petcarehub-ml-api):
```
No environment variables needed!
```

## 🔗 Useful Links

- **Render Docs**: https://render.com/docs
- **Flask Docs**: https://flask.palletsprojects.com/
- **Gunicorn Docs**: https://gunicorn.org/

---

Need help? Check the Node.js backend logs and Flask ML API logs on Render dashboard!

