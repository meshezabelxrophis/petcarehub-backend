#!/bin/bash

# Vercel Deployment Script
# This script helps deploy your backend API to Vercel

set -e

echo "🚀 PetCareHub Vercel Deployment Script"
echo "═══════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI is not installed.${NC}"
    echo ""
    echo "Please install it using one of these methods:"
    echo ""
    echo "  Method 1 (npm):"
    echo "    sudo npm install -g vercel"
    echo ""
    echo "  Method 2 (Homebrew - macOS):"
    echo "    brew install vercel-cli"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI is installed${NC}"
echo ""

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}📝 You need to login to Vercel${NC}"
    echo ""
    vercel login
    echo ""
fi

echo -e "${GREEN}✅ Logged in to Vercel${NC}"
echo ""

# Check if environment variables file exists
if [ ! -f ".vercel-env-vars.txt" ]; then
    echo -e "${YELLOW}⚠️  Environment variables file not found${NC}"
    echo ""
    echo "Generating environment variables..."
    node scripts/prepare-vercel-env.js
    echo ""
fi

echo -e "${BLUE}📋 Environment Variables Ready${NC}"
echo ""
echo "Make sure you've added these to Vercel:"
echo "  - STRIPE_SECRET_KEY"
echo "  - GEMINI_API_KEY"
echo "  - FIREBASE_SERVICE_ACCOUNT"
echo ""
read -p "Have you added all environment variables to Vercel? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Please add environment variables first:${NC}"
    echo ""
    echo "  1. Go to your Vercel project settings"
    echo "  2. Navigate to Environment Variables"
    echo "  3. Add the variables from .vercel-env-vars.txt"
    echo ""
    echo "Or use the CLI:"
    echo "  vercel env add STRIPE_SECRET_KEY"
    echo "  vercel env add GEMINI_API_KEY"
    echo "  vercel env add FIREBASE_SERVICE_ACCOUNT"
    echo ""
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
echo ""

# Deploy
vercel --prod

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Test your API endpoints"
echo "  2. Update your React frontend to use the new API URL"
echo "  3. Redeploy your frontend to Firebase Hosting"
echo ""
echo "Run 'node scripts/test-api.js' to test your endpoints"
echo ""

