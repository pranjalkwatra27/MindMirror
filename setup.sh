#!/bin/bash
# HireMind - Setup Script
# This script automates the initial setup of HireMind

echo "🧠 HireMind - AI Interview + Placement Prep Coach"
echo "=================================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi
echo "  Node version: $(node --version)"
echo ""

# Check npm
echo "✓ Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi
echo "  npm version: $(npm --version)"
echo ""

# Navigate to backend
cd backend || exit 1

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo ""
    echo "Create backend/.env with:"
    cat << 'EOF'
MONGODB_URI=mongodb://localhost:27017/hiremind
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
EOF
    echo ""
    echo "Get GEMINI_API_KEY from: https://aistudio.google.com/"
    echo ""
else
    echo "✓ .env file found"
fi

echo ""
echo "🚀 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start MongoDB: mongod (or use MongoDB Atlas URL in .env)"
echo "2. Start backend: npm start (in backend/ directory)"
echo "3. Start frontend: python -m http.server 5500 (in frontend/ directory)"
echo "4. Open browser: http://localhost:5500"
echo ""
