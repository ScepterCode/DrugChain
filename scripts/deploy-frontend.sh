#!/bin/bash

# DrugChain Frontend Deployment Script for Vercel

echo "🚀 Deploying DrugChain Frontend to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set production environment
echo "🔧 Setting up production environment..."
export NODE_ENV=production

# Build the project
echo "🏗️  Building the project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Update your backend CORS_ORIGINS with the new Vercel URL"
echo "   2. Test all functionality on the deployed site"
echo "   3. Update any documentation with the new URLs"