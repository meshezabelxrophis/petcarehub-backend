#!/bin/bash
# Keep ML API alive by pinging it every 10 minutes
# Run this with: ./keep-ml-alive.sh
# Or use a cron job or uptime monitoring service like UptimeRobot

ML_API_URL="https://petcarehub-ml-api.onrender.com"

echo "🔄 Keeping ML API alive at $ML_API_URL"
echo "Press Ctrl+C to stop"

while true; do
    echo "⏰ $(date): Pinging ML API..."
    curl -s "$ML_API_URL/" > /dev/null && echo "✅ ML API is alive" || echo "❌ ML API is down"
    sleep 600  # Wait 10 minutes (600 seconds)
done

