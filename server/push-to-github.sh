#!/bin/bash

# Quick script to push backend to GitHub
# Usage: ./push-to-github.sh YOUR-GITHUB-USERNAME

if [ -z "$1" ]; then
  echo "❌ Error: Please provide your GitHub username"
  echo "Usage: ./push-to-github.sh YOUR-GITHUB-USERNAME"
  exit 1
fi

USERNAME=$1
REPO_NAME="petcarehub-backend"

echo "🚀 Setting up GitHub remote..."
git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git"

echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your backend is now on GitHub:"
echo "   https://github.com/$USERNAME/$REPO_NAME"
echo ""
echo "🎯 Next step: Deploy to Render"
echo "   1. Go to https://dashboard.render.com"
echo "   2. Click 'New +' → 'Web Service'"
echo "   3. Connect this repository"
echo "   4. Follow RENDER_QUICK_START.md for details"


