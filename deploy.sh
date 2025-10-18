#!/bin/bash

# Firebase Hosting Deployment Script
# Usage: ./deploy.sh [options]
# Options:
#   --skip-build    Skip the build step (use existing build)
#   --preview       Deploy to preview channel
#   --functions     Also deploy functions

set -e

echo "🚀 Starting Firebase Deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_BUILD=false
PREVIEW=false
DEPLOY_FUNCTIONS=false

for arg in "$@"
do
    case $arg in
        --skip-build)
        SKIP_BUILD=true
        shift
        ;;
        --preview)
        PREVIEW=true
        shift
        ;;
        --functions)
        DEPLOY_FUNCTIONS=true
        shift
        ;;
    esac
done

# Build the app
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${BLUE}📦 Building React app...${NC}"
    npm run build
    echo -e "${GREEN}✅ Build completed!${NC}"
else
    echo -e "${YELLOW}⏩ Skipping build step${NC}"
fi

# Deploy
if [ "$PREVIEW" = true ]; then
    echo -e "${BLUE}🌐 Deploying to preview channel...${NC}"
    firebase hosting:channel:deploy preview
elif [ "$DEPLOY_FUNCTIONS" = true ]; then
    echo -e "${BLUE}🌐 Deploying hosting and functions...${NC}"
    firebase deploy --only hosting,functions
else
    echo -e "${BLUE}🌐 Deploying to Firebase Hosting...${NC}"
    firebase deploy --only hosting
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}🔗 Your app is live at: https://fyppp-5b4f0.web.app${NC}"

