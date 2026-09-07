#!/bin/bash
# MindMirror - Setup Script
# Automates dependencies and setup for MindMirror

echo "🧠 MindMirror - AI Interview + Placement Prep Coach"
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

# Install dependencies
echo "📦 Installing root, backend, and frontend dependencies..."
npm install
(cd backend && npm install)
(cd frontend && npm install)
echo "✓ Dependencies installed"
echo ""

echo "🚀 Setup Complete!"
echo ""
echo "To run the application:"
echo "  npm run dev"
echo ""
echo "- Frontend: http://localhost:3000"
echo "- Backend:  http://localhost:5001"
echo ""
