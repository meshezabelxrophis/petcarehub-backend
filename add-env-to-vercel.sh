#!/bin/bash

echo "🔐 Adding environment variables to Vercel..."
echo ""

# Extract values
STRIPE_KEY=$(cat .vercel-env-vars.txt | grep "STRIPE_SECRET_KEY=" | cut -d= -f2)
GEMINI_KEY=$(cat .vercel-env-vars.txt | grep "GEMINI_API_KEY=" | cut -d= -f2)
FIREBASE_SA=$(cat .vercel-env-vars.txt | grep "FIREBASE_SERVICE_ACCOUNT=" | cut -d= -f2-)

echo "1️⃣  Adding STRIPE_SECRET_KEY..."
printf "%s\ny\ny\ny\n" "$STRIPE_KEY" | npx vercel env add STRIPE_SECRET_KEY production

echo ""
echo "2️⃣  Adding GEMINI_API_KEY..."
printf "%s\ny\ny\ny\n" "$GEMINI_KEY" | npx vercel env add GEMINI_API_KEY production

echo ""
echo "3️⃣  Adding FIREBASE_SERVICE_ACCOUNT..."
printf "%s\ny\ny\ny\n" "$FIREBASE_SA" | npx vercel env add FIREBASE_SERVICE_ACCOUNT production

echo ""
echo "✅ All environment variables added!"
echo ""
echo "🚀 Redeploying to production..."
npx vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing endpoints..."
node test-vercel-deployment.js

