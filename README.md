# 🎓 LearnMate AI - Study Smarter. Learn Faster.

Welcome to **LearnMate AI**, a state-of-the-art full-stack student productivity ecosystem designed to help you organize lecture materials, automate active retrieval testing, get instant doubts resolved, and structure cognitive learning timelines. 

It functions as an all-in-one AI-powered student workspace, transforming passive slide reading into game-like practice tests and prioritized revision agendas.

---

## 🚀 Key Innovations & Features

### 1. 🧠 AI Notes Summarizer (PDF / Text)
- **Direct PDF Uploads:** Leverages PyPDF binary parsers to extract raw text content from uploaded lecture sheets or slideshow decks.
- **Cognitive Outlining:** Compiles notes into high-value overview paragraphs, isolated core key concepts with clear explanations, and quick study recall bullets.

### 2. 🎮 Interactive MCQ Quiz Generator
- **Active Recall Mechanics:** Generate multiple-choice quizzes automatically from study materials to challenge your understanding.
- **Game-Like UI:** Renders immediate visual correctness feedback (green/red overlays), tracks active score parameters, and prompts custom reward overlays upon completion.

### 3. 💬 Gemini Academic Doubt Solver
- **Multi-Turn Chat Interface:** Talk contextually to an AI tutor. Ask math questions, history dates, computer science algorithms, or biology reactions.
- **Quick Query Tag Shortcuts:** Ready-made academic tags to instantly explain difficult operating system kernels or photosynthesis reactions.

### 4. 📅 Smart Focus Study Planner
- **Target Deadline Schedules:** Inputs exam dates, lists of subjects, and daily study hour ceilings to generate a balanced 5-day cognitive review calendar.
- **Daily Focus Guidelines:** Equips every day's review session with optimized Pomodoro time splits and science-backed cognitive learning tips.

### 5. 🎯 Exam Prep Mode
- **Critical Weight Matrix:** Evaluates source study slides to isolate high/critical difficulty topics that are highly likely to be tested on midterm exams.
- **Strategic Action Plan:** Maps out concrete preparation checklists and countdown reviews.

### 6. ⏱️ Integrated Pomodoro Focus Stopwatch
- **Interval Attention Boost:** Tracks standard 25-minute study slices followed by 5-minute cognitive breaks using a premium digital stopwatch built right into the main workspace.

---

## 🛠️ Technology Architecture

### Frontend (Modern SaaS UI)
- **Vite React.js** (React 19 framework scaffolding)
- **Tailwind CSS** (Futuristic deep dark glassmorphism system with custom neon glows and grid grids)
- **Framer Motion** (Smooth structural page animations and active tab sliders)
- **Lucide Icons** (Premium vector iconography)

### Backend (Robust Services API)
- **Flask (Python)** (Clean micro-services endpoints, fully integrated CORS headers)
- **SQLite & Flask-SQLAlchemy** (Persistent local storage records to preserve your academic library history)
- **PyPDF** (In-memory binary PDF document text parsers)
- **Google Gemini Generative AI Client** (`gemini-1.5-flash` client, equipped with a backup fallback mock database to run seamlessly off-grid)

---

## 📂 Repository File System Structure

```text
LearnMateAI/
├── backend/
│   ├── app.py                # Main Flask Server & Database Migrations
│   ├── models.py             # SQLite SQLAlchemy Database Schemas
│   ├── utils_gemini.py       # Gemini API client prompts & intelligent mock fallbacks
│   ├── requirements.txt      # Python library dependencies
│   └── .env                  # Port, Env, and GEMINI_API_KEY template config
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main stateful React dashboard & landing page
│   │   ├── index.css         # Tailwind directives, animations & custom glass panel styles
│   │   ├── main.jsx          # Scaffolder React app mounter
│   │   └── App.css           # Purged setup file
│   ├── public/
│   │   └── hero.png          # Generated premium illustration asset
│   ├── tailwind.config.js    # Customized color system (Purple/Blue/Cyan glows)
│   ├── postcss.config.js     # PostCSS autoprefixer compilation
│   ├── vite.config.js        # Port 3000 mapping & Reverse Proxy configuration
│   └── package.json          # Node modules, scripts, and libraries
└── README.md                 # Complete documentation handbook
```

---

## 🚀 Execution & Setup Guides

### 1. Backend Server Setup
Make sure Python 3.10+ is installed on your computer.

1. Move to the backend folder:
   ```bash
   cd backend
   ```
2. Install Python library dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your Google Gemini API key:
   - Duplicate or open the `.env` file in the `backend/` directory.
   - Replace the key variable value:
     ```env
     GEMINI_API_KEY=AIzaSy...your_gemini_key_from_google_ai_studio
     ```
   *(If you run the project without a Gemini Key, LearnMate AI automatically triggers its **Academic Fallback Engine** which generates highly realistic, context-dependent mock responses for Photosynthesis and Computer Science queries so you can run flawless live hackathon demos!)*
4. Initiate the Flask API engine:
   ```bash
   python app.py
   ```
   The database tables will be built immediately inside `database.db` and the microservice will listen on: `http://localhost:5000`.

### 2. Frontend Workspace Setup
Make sure Node.js (v18+) is installed.

1. Move to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development hot reload server:
   ```bash
   npm run dev
   ```
   Vite will spin up the modern portal at: `http://localhost:3000` with active reverse proxies mapping `/api` endpoints directly to port 5000.

---

## 🔮 Future Roadmap (SaaS Extension)
- **Speech-to-Text lecture recording:** Record audios of live college lectures and synthesize notes in real-time.
- **Collaborative Study Rooms:** Allow class peers to join interactive multiplayer quiz lobbies using WebSockets.
- **Spaced Repetition Flashcards:** Flashcard deck decks with automated calendar popups using Anki-inspired SuperMemo scheduling formulas.
