# ⚡ Quick Start - ML API

## 🏠 Local Development

```bash
# 1. Install dependencies
cd server/ml_models
pip install -r requirements.txt

# 2. Run Flask API (port 5002)
python flask_api.py

# 3. In another terminal, run Node.js backend
cd ..
npm start

# 4. Test it!
curl -X POST http://localhost:5002/predict \
  -H "Content-Type: application/json" \
  -d '{"symptoms":["fever","vomiting"],"animal_type":"Dog","age":3,"weight":20}'
```

## 🚀 Deploy to Render

1. **Create new Web Service** on Render dashboard
2. **Settings:**
   - Root Directory: `server/ml_models`
   - Runtime: `Python 3`
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn -b 0.0.0.0:$PORT flask_api:app`
3. **Deploy!**
4. **Add ML_API_URL** to your Node.js backend env vars

That's it! 🎉

