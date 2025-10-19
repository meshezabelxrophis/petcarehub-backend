# 🧠 Fix ML Service Deployment on Render

## Problem
The ML service can't find `requirements.txt` because Render is looking in the wrong directory.

**Error:**
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'requirements.txt'
```

## Solution: Update Root Directory

### For Existing ML Service

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click on your ML service** (probably named `petcarehub-ml-api`)
3. **Click "Settings"**
4. **Find "Build & Deploy" section**
5. **Update these fields:**

```
Root Directory:    server/ml_models
Build Command:     pip install -r requirements.txt
Start Command:     gunicorn -b 0.0.0.0:$PORT flask_api:app
```

6. **Click "Save Changes"**
7. **Click "Manual Deploy" → "Deploy latest commit"**

### For New ML Service (Recommended)

If you haven't created the ML service yet, or want to recreate it:

1. **Go to Render Dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repo:** `meshezabelxrophis/petcarehub-backend`
4. **Configure manually:**
   - **Name:** `petcarehub-ml-api`
   - **Region:** Choose closest to your main backend
   - **Branch:** `main`
   - **Root Directory:** `server/ml_models` ⚠️ **IMPORTANT**
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -b 0.0.0.0:$PORT flask_api:app`
   - **Plan:** Free
5. **Add Environment Variables:**
   - `PYTHON_VERSION`: `3.11.0`
6. **Click "Create Web Service"**

## Project Structure

```
petcarehub-backend/
├── server/
│   ├── index.js               ← Main backend (Node.js)
│   ├── package.json
│   └── ml_models/             ← ML service (Python)
│       ├── flask_api.py       ← Entry point
│       ├── requirements.txt   ← Dependencies
│       ├── disease_model.pkl  ← Trained model
│       └── render.yaml        ← Config (now updated)
└── render.yaml                ← Root config
```

## Verification

After successful deployment, test the ML API:

```bash
curl https://your-ml-service.onrender.com/
```

Expected response:
```json
{
  "message": "PetCareHub ML API is running",
  "endpoints": {
    "predict": "/predict",
    "health": "/"
  }
}
```

Test disease prediction:
```bash
curl -X POST https://your-ml-service.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "species": "dog",
    "breed": "labrador",
    "age": 5,
    "symptoms": ["lethargy", "vomiting"]
  }'
```

## Common Issues

### Issue: Python version mismatch
**Solution:** The service uses Python 3.13.4 by default. If you need 3.11, add this to Environment Variables:
- `PYTHON_VERSION`: `3.11.0`

### Issue: Gunicorn not found
**Solution:** Make sure `requirements.txt` includes `gunicorn==23.0.0`

### Issue: Model file not found
**Solution:** Make sure `disease_model.pkl` is committed to git:
```bash
git add server/ml_models/disease_model.pkl
git commit -m "Add trained model file"
git push
```

## Integration with Main Backend

Once both services are deployed, update your main backend environment variables:

**In main backend service settings, add:**
- `ML_API_URL`: `https://your-ml-service.onrender.com`

Then your main backend can call the ML API:
```javascript
const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, {
  species: "dog",
  symptoms: ["lethargy"]
});
```

## Both Services Checklist

- [ ] ✅ Main Backend deployed (Node.js at `server/`)
- [ ] ✅ ML Service configured with Root Directory: `server/ml_models`
- [ ] ✅ ML Service deployed successfully
- [ ] ✅ Main backend has `ML_API_URL` environment variable set
- [ ] ✅ Both services are accessible via curl/browser

---

**Once you update the Root Directory to `server/ml_models`, your ML service will deploy successfully!** 🚀

