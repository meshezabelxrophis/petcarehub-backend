#!/bin/bash

# Add environment variables to Vercel
# This script reads from .vercel-env-vars.txt and adds them to Vercel

echo "🔐 Adding environment variables to Vercel..."
echo ""

# Extract values
STRIPE_KEY=$(cat .vercel-env-vars.txt | grep "STRIPE_SECRET_KEY=" | cut -d= -f2)
GEMINI_KEY=$(cat .vercel-env-vars.txt | grep "GEMINI_API_KEY=" | cut -d= -f2)
FIREBASE_SA=$(cat .vercel-env-vars.txt | grep "FIREBASE_SERVICE_ACCOUNT=" | cut -d= -f2)

# Add STRIPE_SECRET_KEY
echo "1. Adding STRIPE_SECRET_KEY..."
echo "$STRIPE_KEY" | npx vercel env add STRIPE_SECRET_KEY production

echo ""
echo "2. Adding GEMINI_API_KEY..."
echo "$GEMINI_KEY" | npx vercel env add GEMINI_API_KEY production

echo ""
echo "3. Adding FIREBASE_SERVICE_ACCOUNT..."
echo "$FIREBASE_SA" | npx vercel env add FIREBASE_SERVICE_ACCOUNT production

echo ""
echo "✅ Environment variables added!"
echo ""
echo "Now redeploying to apply changes..."
npx vercel --prod

echo ""
echo "✅ Deployment complete!"

