#!/bin/bash

# Bash Startup Script
# Save as: startup.sh
# Run with: bash startup.sh

echo "==========================================="
echo "Digital Twin Career Agent - Startup Script"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm $NPM_VERSION found"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the digital-twin directory?"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found!"
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  Please edit .env.local and add your API keys:"
    echo "   • GROQ_API_KEY: Get it from https://console.groq.com"
    echo "   • DATABASE_URL: Get it from https://neon.tech"
    echo ""
    echo "Opening $EDITOR .env.local..."
    ${EDITOR:-nano} .env.local
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Kill any existing node processes on port 3000
echo "🔄 Cleaning up existing processes..."
pkill -f "node.*3000" || true
echo "✅ Cleaned up existing Node processes"

# Remove .next folder
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ Cleared .next build cache"
fi

echo ""
echo "==========================================="
echo "🚀 Starting development server..."
echo "==========================================="
echo ""
echo "📖 Access your app at:"
echo "   🏠 Landing:  http://localhost:3000"
echo "   💬 Chat:     http://localhost:3000/chat"
echo "   🔐 Admin:    http://localhost:3000/admin/login"
echo ""
echo "👤 Default admin credentials:"
echo "   Email: admin@example.com"
echo "   Password: (set via API or environment)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the dev server
npm run dev
