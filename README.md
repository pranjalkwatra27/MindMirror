## MindMirror - AI Interview + Placement Prep Coach 🧠

A comprehensive AI-powered platform that helps candidates ace interviews and land jobs. Featuring resume analysis, AI-powered interview simulations, voice/confidence analysis, real-time performance tracking, and DSA weakness mapping.

## 🚀 Core Features

### 1. **Resume Analyzer** 📋
- Automatic resume parsing and analysis
- AI-powered scoring across multiple dimensions
- ATS optimization suggestions
- Industry-specific improvement recommendations
- Technical skills extraction and tagging

### 2. **AI Interview Simulator** 🎤
- 4 interview modes: HR, Technical, Behavioral, Rapid-Fire DSA
- Gemini-powered question generation
- Intelligent answer evaluation with detailed feedback
- Real-time scoring and comparative analytics
- Complete interview history tracking

### 3. **Voice + Confidence Analysis** 🗣️
- Filler word detection and frequency analysis
- Speaking speed assessment (optimal 120-150 WPM)
- Confidence scoring via sentiment analysis
- Pause detection and speech pattern recognition
- Real-time actionable delivery feedback

### 4. **Performance Dashboard** 📊
- Aggregate interview statistics and trends
- Score progression visualization
- Interview mode distribution breakdown
- Weak areas identification with frequency tracking
- Placement readiness score (0-100)

### 5. **DSA Weakness Mapper** 🎯
- Automatic topic extraction from DSA interviews
- Weakness frequency tracking
- Personalized study progression (Easy→Medium→Hard)
- Resource suggestions and learning paths
- Topic-wise performance metrics

## 📋 Tech Stack

**Backend:**
- **Runtime**: Node.js + Express.js 5.2.1
- **Database**: MongoDB 8.0.0 + Mongoose ORM
- **AI**: Google Generative AI (Gemini)
- **Authentication**: JWT + bcryptjs password hashing
- **File Handling**: Multer 2.0.2 (resume PDF uploads)
- **Analysis**: Sentiment library, voice analysis utilities

**Frontend:**
- **HTML5** semantic markup with responsive design
- **CSS3** with CSS variables, flexbox, grid layouts
- **Vanilla JavaScript** (no framework dependencies)
- **Chart.js** 4.4.0 for data visualization
- **Font Awesome** 6.4.0 for icons
- **Web Audio API** for voice recording

**Architecture:**
- RESTful API with `/api` prefix
- MVC pattern: Models (data) → Controllers (logic) → Routes (endpoints)
- Service layer for voice analysis and AI integration
- Modular directory structure for scalability
- JWT middleware for protected endpoints

## 🛠️ Installation & Setup

### 1. Clone & Install Dependencies

```bash
cd backend
npm install

cd ../frontend
# No npm install needed - vanilla JS only
```

### 2. Configure Environment Variables

Create `backend/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/hiremind
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
GEMINI_API_KEY=your_api_key_from_google_ai_studio
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
```

**Getting the API Keys:**

- **Gemini API**: Get free API key from [Google AI Studio](https://aistudio.google.com/)
- **MongoDB**: Local setup OR [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

### 3. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### 4. Start Backend Server

```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

### 5. Start Frontend (Development)

```bash
# Option A: Use Python's simple server
cd frontend
python -m http.server 5500

# Option B: Use Node.js http-server
npx http-server frontend -p 5500

# Option C: Use VS Code Live Server extension
```

Open browser to `http://localhost:5500`

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register         - Create new account
POST   /api/auth/login            - Login & get JWT token
GET    /api/auth/profile          - Get user profile
PUT    /api/auth/profile          - Update user profile
```

### Resume Analysis
```
POST   /api/resume/analyze        - Upload & analyze resume (multipart/form-data)
GET    /api/resume/:resumeId      - Get previous analysis
```

### Interview Simulation
```
POST   /api/interview/start       - Begin interview session
POST   /api/interview/submit-answer - Submit answer to question
POST   /api/interview/:id/complete - Finalize interview
GET    /api/interview/history     - Get interview history
```

### Voice Analysis
```
POST   /api/voice/analyze         - Analyze voice transcript & audio (multipart/form-data)
```

### Dashboard & Progress
```
GET    /api/dashboard             - Main dashboard stats
GET    /api/dashboard/progress    - Detailed progress metrics
POST   /api/dashboard/placement-score - Calculate placement readiness
```

## 📊 Database Schema

**User Model**
```javascript
{
  email, password (hashed), name,
  targetRole, interviewHistory, progressMetrics
}
```

**Resume Model**
```javascript
{
  userId, fileName, originalText,
  analysis: {
    scores: { technical_depth, impact, clarity, project_strength, ats_compatibility },
    skills: [...], recommendations: [...]
  }
}
```

**Interview Model**
```javascript
{
  userId, mode, questions: [{ question, category, difficulty, userAnswer, score, feedback }],
  voiceAnalysis: { fillerWords, speakingSpeed, confidence, pauses },
  weaknessesIdentified: [...]
}
```

**Progress Model**
```javascript
{
  userId,
  placementReadiness: { score: 0-100, breakdown: {...} },
  weeklyMetrics: [...],
  weakAreas: [...],
  learningRoadmap: [...]
}
```

## 🎯 Key Features Deep Dive

### Voice Analysis Engine

Analyzes 4 dimensions of interview delivery:

1. **Filler Words** - Detects "um", "like", "you know", "basically"
   - Scores 0-100 (lower is better)
   
2. **Speaking Speed** - Measures words per minute
   - Optimal: 120-150 WPM
   - Scoring based on deviance from optimal range
   
3. **Confidence** - Sentiment analysis of keywords
   - Positive indicators: "I'm confident", "I know", "I believe"
   - Negative indicators: "I think", "maybe", "I guess"
   - Hexive expression analysis
   
4. **Pause Analysis** - Detects silence patterns
   - Frequency and duration of pauses
   - Suggests comfortable silence thresholds

### AI-Powered Question Generation

Uses Gemini API to generate:
- Context-aware questions based on user resume
- Mode-specific questions matching difficulty
- Industry-relevant DSA problems
- Customized follow-up questions

### Placement Readiness Score

Formula:
```
Readiness = (Technical * 0.35) + (Communication * 0.25) + (Behavioral * 0.25) + (DSA * 0.15)
```

Breakdown:
- **Technical** (0-100): Depth, tools, project impact
- **Communication** (0-100): Clarity, confidence, delivery
- **Behavioral** (0-100): Problem-solving, teamwork, adaptability
- **DSA** (0-100): Algorithm knowledge, problem-solving approach

## 🚀 Development Workflow

### File Structure

```
project/
├── backend/
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Resume.js
│   │   ├── Interview.js
│   │   ├── Question.js
│   │   └── Progress.js
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   ├── interviewController.js
│   │   ├── voiceController.js
│   │   └── dashboardController.js
│   ├── routes/              # API endpoints
│   │   ├── authRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── voiceRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/               # Services & helpers
│   │   ├── voiceAnalysis.js
│   │   └── aiService.js
│   ├── config/              # Configuration
│   │   ├── database.js
│   │   └── auth.js
│   ├── server.js            # Express app
│   ├── package.json
│   └── .env
├── frontend/
│   ├── utils/
│   │   └── api.js           # API client wrapper
│   ├── styles/
│   │   └── main.css         # Comprehensive styling
│   ├── index.html           # Main HTML structure
│   ├── app.js              # Application logic
│   └── script.js           # Legacy (to be deprecated)
└── README.md
```

### Making Code Changes

1. **Backend**: Edit controller files in `/controllers` - changes reload on save with nodemon
2. **Frontend**: Edit `app.js` for logic, `styles/main.css` for styling
3. **Database**: Mongoose will auto-create collections on first write

### Testing API Endpoints

Use Postman or curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'

# Start Interview
curl -X POST http://localhost:3000/api/interview/start \
  -H "Authorization: Bearer JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"mode":"technical"}'
```

## 🐛 Troubleshooting

### "Cannot find module 'mongoose'"
```bash
cd backend && npm install
```

### "MONGODB_URI not found"
- Create `.env` file in `backend/` with MongoDB connection string

### "GEMINI_API_KEY not configured"
- Get free API key from [Google AI Studio](https://aistudio.google.com/)
- Add to `.env`: `GEMINI_API_KEY=sk_xxx_xxx...`

### "CORS errors from frontend"
- Ensure `FRONTEND_URL` in .env matches your frontend URL
- Check server.js CORS middleware is configured

### "No microphone access"
- Use HTTPS (even localhost: with `https://` prefix)
- Grant microphone permission in browser settings

## 📈 Future Enhancements

- [ ] Real-time WebSocket for live interview feedback
- [ ] Machine learning for personalized weak area detection
- [ ] Video recording with facial expression analysis
- [ ] Peer comparison dashboard (anonymized benchmarking)
- [ ] Company-specific interview question bank
- [ ] Automated mock interview scheduling
- [ ] Export reports as PDF
- [ ] Mobile app (React Native)
- [ ] Integration with job portals (LinkedIn, Indeed)

## 📄 License

MIT License

### Setup

1. **Clone and navigate to project**
   ```bash
   cd Evolve.ai-main
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Configure OpenAI API Key**
   ```bash
   # Copy the example .env file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   # OPENAI_API_KEY=sk-...
   ```
   
   Get your API key from: https://platform.openai.com/api-keys

4. **Start Backend Server**
   ```bash
   node server.js
   # Server runs on http://localhost:3000
   ```

5. **Start Frontend Server** (in a new terminal)
   ```bash
   cd frontend
   python -m http.server 8000
   # Frontend accessible at http://localhost:8000
   ```

## 📖 Usage

### Resume Analysis
1. Open http://localhost:8000
2. Click "📄 Resume Analysis" tab
3. Upload your PDF resume
4. Get detailed feedback and improvements

### Voice Interview Analysis
1. Open http://localhost:8000
2. Click "🎤 Interview Voice Analysis" tab
3. Click "🎤 Start Recording"
4. Speak your interview response (e.g., "Tell me about yourself")
5. Click "⏹ Stop Recording"
6. Click "📊 Analyze Voice"
7. View your detailed dashboard with:
   - Confidence & Clarity scores
   - Filler word breakdown
   - Speaking speed metrics
   - Personalized suggestions
   - Full transcript

## 📊 Voice Analysis Metrics

### Confidence Score (0-100%)
**What it measures**: How confident and assured you sound
- Analyzes positive vs hesitation keywords
- Sentiment analysis of your words
- Absence of filler words boosts score
- Clear, declarative language increases score

**Industry Standard**: 75%+ = Excellent

### Clarity Score (0-100%)
**What it measures**: Speech quality, pacing, and flow
- **Speaking Speed**: Optimal is 120-150 WPM
  - Slow (<100 WPM) = harder to engage
  - Fast (>180 WPM) = harder to follow
- **Filler Word Impact**: Each filler word reduces clarity
- **Pause Patterns**: Long silences reduce clarity
- **Overall Flow**: Smooth delivery boosts score

**Industry Standard**: 70%+ = Good

### Filler Words
**What we detect**: 
- uh, um, like, you know
- basically, actually, literally
- sort of, kind of, I mean
- I think, I feel, well

**Why it matters**: 
- Makes you sound less confident
- Reduces clarity and professionalism
- Industry standard: <5 instances for 60s speech

### Speaking Speed (Words Per Minute)
- **Slow** (80-100 WPM): Could lose attention
- **Optimal** (120-150 WPM): Engaging and clear ✓
- **Fast** (150-180 WPM): People struggle to keep up
- **Very Fast** (180+ WPM): Hard to understand

### Sentiment Analysis
Detects:
- **Confidence Keywords**: "confident", "achieved", "delivered", "excellent"
- **Hesitation Keywords**: "maybe", "perhaps", "not sure", "unclear"
- Calculates overall sentiment tone

## 🛠️ Technology Stack

### Backend
- **Express.js**: API server
- **Multer**: File upload handling
- **OpenAI Whisper**: Audio transcription
- **Sentiment.js**: Sentiment analysis
- **pdf-parse**: PDF text extraction
- **Ollama**: Local AI (for resume analysis)

### Frontend
- **Vanilla JavaScript**: Recording & DOM manipulation
- **MediaRecorder API**: Audio capture
- **LocalStorage**: Result persistence
- **CSS3**: Modern UI with gradients

## 🔧 API Endpoints

### Resume Analysis
```
POST /upload
- Upload PDF resume
- Returns: Detailed analysis with scores and suggestions
```

### Voice Analysis
```
POST /analyze-voice
- Upload WAV audio file
- Returns: Confidence/clarity scores, filler words, transcript, suggestions
```

## 📁 Project Structure
```
Evolve.ai-main/
├── backend/
│   ├── server.js              # Main API server
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   └── uploads/               # Temporary file storage
│
├── frontend/
│   ├── index.html             # Main UI (tabs)
│   ├── report.html            # Resume report
│   ├── voice-report.html      # Voice analysis dashboard
│   ├── script.js              # All logic (recording, analysis)
│   └── style.css              # Modern styling
```

## 🎯 Tips for Better Voice Analysis

### Before Recording
1. Test your microphone in browser settings
2. Find a quiet environment
3. Speak clearly and slowly
4. Take a breath before starting

### While Recording
1. **Avoid Filler Words**: Replace "um" with silent pause
2. **Maintain Pace**: Aim for 120-150 WPM
3. **Be Confident**: Use strong, decisive language
4. **Avoid Hedging**: Say "I did" not "I kind of did"
5. **Minimize Pauses**: Maintain steady flow

### Sample Good Response
*"I'm a software engineer with 5 years of experience in full-stack development. I've successfully delivered 3 major projects that increased user engagement by 40%. I'm confident in my technical abilities and excited about solving complex problems."*

❌ **Filler Words**: 0  
⚡ **Speed**: 140 WPM  
😊 **Confidence**: High  
✅ **Score**: 85/100

## 🔐 Security Notes
- Audio files are temporarily stored and automatically deleted after analysis
- Your OpenAI API key should be kept private in the `.env` file
- Never commit `.env` file to version control

## 🐛 Troubleshooting

### "Microphone access denied"
- Check browser permissions
- Allow microphone access for localhost
- Refresh the page and try again

### "OpenAI API key not configured"
- Make sure `.env` file exists in backend folder
- Verify `OPENAI_API_KEY=` is set correctly
- Restart the backend server

### "Failed to transcribe audio"
- Check your OpenAI API limit
- Ensure audio quality is good
- Maximum file size: 25MB for Whisper API

### No transcript generated
- Ensure your audio is clear
- Speak loud enough for the microphone
- Use a supported audio format (WAV, MP3, OGG, etc)

## 📊 Sample Score Interpretation

| Score | Interpretation |
|-------|-----------------|
| 90-100 | Excellent - Professional delivery |
| 80-89 | Very Good - Confident and clear |
| 70-79 | Good - Acceptable, minor improvements needed |
| 60-69 | Fair - Several areas need work |
| Below 60 | Needs Improvement - Focus on confidence & clarity |

## 🚀 Advanced Usage

### Export Results
- Downloaded text reports for each analysis
- Track progress over time
- Share reports with mentors

### Practice Tips
1. Record multiple responses
2. Compare scores to track improvement
3. Focus on reducing filler words
4. Practice maintaining 120-150 WPM pace

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all dependencies are installed: `npm list`
3. Check browser console for errors: F12 → Console tab
4. Ensure backend server is running on port 3000

## 📝 License

This project is provided as-is for educational purposes.

---

**Happy analyzing! 🎉** Get feedback, practice, and ace your interviews!
