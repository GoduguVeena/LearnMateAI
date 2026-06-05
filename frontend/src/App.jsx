import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Brain,
  GraduationCap,
  Clock,
  Award,
  BookOpen,
  MessageSquare,
  Calendar,
  ChevronRight,
  Upload,
  Trash2,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Send,
  Plus,
  X,
  Menu,
  BookOpenCheck,
  History,
  Activity,
  LogOut,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Helper to parse standard markdown bold ** and bullet items * dynamically in the UI
const renderFormattedText = (text) => {
  if (!text) return null;
  
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    let content = line;
    
    // Check if it's a list item starting with * or -
    const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
    if (isBullet) {
      content = line.trim().substring(2);
    }
    
    // Parse double asterisks for bolding
    const parts = content.split("**");
    const renderedLine = parts.map((part, partIdx) => {
      if (partIdx % 2 === 1) {
        return <strong key={partIdx} className="font-extrabold text-white">{part}</strong>;
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex gap-2.5 items-start mt-1.5 pl-2 text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-2 shrink-0"></span>
          <span className="flex-1 text-dark-text">{renderedLine}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className={lineIdx > 0 ? "mt-2 text-left" : "text-left"}>
        {renderedLine}
      </p>
    );
  });
};

function App() {
  // Global States
  const [activeTab, setActiveTab] = useState("landing"); // landing, dashboard, summarizer, quiz, chat, planner, examprep
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [historyData, setHistoryData] = useState({
    summaries: [],
    quizzes: [],
    chats: [],
    planners: [],
    exam_preps: []
  });
  
  // UI States
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Summarizer States
  const [summaryInput, setSummaryInput] = useState("");
  const [summaryTitle, setSummaryTitle] = useState("");
  const [summarizedResult, setSummarizedResult] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const fileInputRef = useRef(null);

  // Quiz States
  const [quizInput, setQuizInput] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({}); // questionIdx -> selectedOption
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hi there! I'm your LearnMate AI Doubt Solver. Paste any textbook concept, equation, or doubt here and I'll explain it simply and contextually!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const chatEndRef = useRef(null);

  // Study Planner States
  const [planDate, setPlanDate] = useState("");
  const [planSubjects, setPlanSubjects] = useState("");
  const [planHours, setPlanHours] = useState(4);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  // Exam Prep States
  const [prepInput, setPrepInput] = useState("");
  const [prepTitle, setPrepTitle] = useState("");
  const [generatedPrep, setGeneratedPrep] = useState(null);

  // Pomodoro Stopwatch States
  const [pomodoroMode, setPomodoroMode] = useState("work"); // work (25m), shortBreak (5m), longBreak (15m)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const timerRef = useRef(null);

  // Quick Doubt Box State
  const [quickDoubt, setQuickDoubt] = useState("");

  // Toast Helper
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch SQLite History from Flask Backend
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
      }
    } catch (error) {
      console.error("Failed to connect to backend history api:", error);
    }
  };

  // Run on load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
    // Setup initial Pomodoro timer countdown
    return () => clearInterval(timerRef.current);
  }, []);

  // Pomodoro Logic
  useEffect(() => {
    if (pomodoroRunning) {
      timerRef.current = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setPomodoroRunning(false);
            showToast(`Pomodoro ${pomodoroMode === "work" ? "Session Completed!" : "Break Finished!"}`, "info");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [pomodoroRunning, pomodoroMode]);

  const changePomodoroMode = (mode) => {
    setPomodoroRunning(false);
    setPomodoroMode(mode);
    if (mode === "work") setPomodoroTime(25 * 60);
    else if (mode === "shortBreak") setPomodoroTime(5 * 60);
    else if (mode === "longBreak") setPomodoroTime(15 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Delete history item
  const deleteHistoryItem = async (type, id) => {
    try {
      const response = await fetch(`${API_BASE}/history/${type}/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        showToast("Record successfully archived.");
        fetchHistory();
      } else {
        showToast("Failed to archive study record.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Backend connection issue.", "error");
    }
  };

  // API Call: Summarizer
  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!summaryInput && !pdfFile) {
      showToast("Please enter notes content or upload a PDF file first.", "warning");
      return;
    }

    setLoading(true);
    setLoadingMessage("LearnMate AI is parsing your concepts and structuring bullet points...");
    
    try {
      let response;
      if (pdfFile) {
        // PDF Multipart form upload
        const formData = new FormData();
        formData.append("file", pdfFile);
        response = await fetch(`${API_BASE}/summarize`, {
          method: "POST",
          body: formData
        });
      } else {
        // Plain text JSON post
        response = await fetch(`${API_BASE}/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: summaryInput,
            title: summaryTitle || "Pasted Study Notes"
          })
        });
      }

      const resData = await response.json();
      if (response.ok) {
        setSummarizedResult(resData.record.summary_data);
        showToast("AI Summary compiled beautifully!");
        fetchHistory();
        
        // Auto prime the quiz and exam mode inputs with the newly summarized content
        const actualText = resData.record.raw_content || summaryInput || `Summary content of ${pdfFile?.name || "Uploaded PDF"}`;
        setQuizInput(actualText);
        setQuizTitle(`Quiz - ${pdfFile?.name ? pdfFile.name.replace(".pdf", "") : (summaryTitle || "Pasted Notes")}`);
        setPrepInput(actualText);
        setPrepTitle(`Exam Prep - ${pdfFile?.name ? pdfFile.name.replace(".pdf", "") : (summaryTitle || "Pasted Notes")}`);
      } else {
        showToast(resData.error || "Failed to generate summary.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Could not communicate with Flask API server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setPdfFile(file);
        setSummaryTitle(file.name.replace(".pdf", ""));
        showToast(`PDF loaded: ${file.name}`);
      } else {
        showToast("Unsupported format. Please select a valid PDF file.", "error");
      }
    }
  };

  // API Call: Quiz Generator
  const handleGenerateQuiz = async (e) => {
    if (e) e.preventDefault();
    if (!quizInput) {
      showToast("Please supply study content to generate a quiz.", "warning");
      return;
    }

    setLoading(true);
    setLoadingMessage("Gemini is constructing multiple choice practice items with solutions...");
    
    try {
      const response = await fetch(`${API_BASE}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: quizInput,
          title: quizTitle || "Custom Academic Quiz"
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setActiveQuiz(resData.record);
        setQuizAnswers({});
        setQuizSubmitted(false);
        showToast("Interactive MCQ Quiz generated!");
        fetchHistory();
      } else {
        showToast(resData.error || "Failed to compile quiz.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Could not connect to Flask API server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = () => {
    if (!activeQuiz) return;
    let score = 0;
    activeQuiz.quiz_data.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_answer) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    showToast(`Quiz completed! You scored ${score}/${activeQuiz.quiz_data.length}`, "info");
  };

  // API Call: Doubt Solver (Chat)
  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // Set temporary typing bubble
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: "...",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        typing: true
      }
    ]);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage })
      });

      const resData = await response.json();
      setChatMessages((prev) => prev.filter((msg) => !msg.typing));

      if (response.ok) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: resData.record.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        fetchHistory();
      } else {
        showToast("Error processing academic chat doubt.", "error");
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => prev.filter((msg) => !msg.typing));
      showToast("Doubt solver backend is offline.", "error");
    }
  };

  const loadQuickDoubt = async (e) => {
    e.preventDefault();
    if (!quickDoubt.trim()) return;
    
    // Jump to chat tab
    setActiveTab("chat");
    setChatInput(quickDoubt);
    setQuickDoubt("");
    showToast("Opening doubt solver console...");
  };

  // API Call: Study Planner
  const handleGeneratePlanner = async (e) => {
    e.preventDefault();
    if (!planDate || !planSubjects) {
      showToast("Please provide your target exam date and core subjects list.", "warning");
      return;
    }

    setLoading(true);
    setLoadingMessage("Gemini is mapping out your subjects and balancing daily focus hours...");

    try {
      const response = await fetch(`${API_BASE}/planner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_date: planDate,
          subjects: planSubjects,
          available_hours: planHours
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setGeneratedPlan(resData.record);
        showToast("Personalized study plan created!");
        fetchHistory();
      } else {
        showToast(resData.error || "Failed to make schedule.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Backend planner system is currently offline.", "error");
    } finally {
      setLoading(false);
    }
  };

  // API Call: Exam Prep Mode
  const handleGenerateExamPrep = async (e) => {
    e.preventDefault();
    if (!prepInput) {
      showToast("Please input study notes or past exam details to evaluate.", "warning");
      return;
    }

    setLoading(true);
    setLoadingMessage("Gemini is compiling high-priority concepts and calculating revision schedules...");

    try {
      const response = await fetch(`${API_BASE}/exam-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: prepInput,
          title: prepTitle || "Custom Exam Strategy"
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setGeneratedPrep(resData.record.prep_data);
        showToast("Strategic Prep Mode active!");
        fetchHistory();
      } else {
        showToast(resData.error || "Failed to enter Exam Mode.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Exam prep mode engine is currently offline.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Navigation Shortcut helpers
  const handleQuickQuizFromSummary = (content, title) => {
    setQuizInput(content);
    setQuizTitle(`Quiz - ${title}`);
    setActiveTab("quiz");
    showToast("Primed notes for quiz testing.");
  };

  const handleQuickExamFromSummary = (content, title) => {
    setPrepInput(content);
    setPrepTitle(`Exam Prep - ${title}`);
    setActiveTab("examprep");
    showToast("Primed notes for exam mode review.");
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative flex flex-col antialiased selection:bg-brand-purple/30 font-sans">
      {/* Glow Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-purple/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-blue/10 blur-[120px] pointer-events-none z-0"></div>

      {/* Global Toast System */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-xl flex items-center gap-3 shadow-lg pointer-events-auto border ${
                t.type === "success"
                  ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
                  : t.type === "error"
                  ? "bg-rose-950/80 border-rose-500/30 text-rose-300"
                  : t.type === "warning"
                  ? "bg-amber-950/80 border-amber-500/30 text-amber-300"
                  : "bg-slate-900/80 border-slate-700/50 text-slate-300"
              }`}
            >
              {t.type === "success" && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {t.type === "warning" && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              {t.type === "info" && <Sparkles className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-medium">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Global AI Loading Spinner Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#06050F]/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full border-2 border-brand-purple/20 border-t-brand-purple animate-spin"></div>
              <Brain className="w-10 h-10 text-brand-purple absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
              Consulting LearnMate Core Engine
            </h3>
            <p className="text-dark-textMuted text-sm max-w-md cursor-blink px-2 py-1">
              {loadingMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          1. LANDING PAGE
          ========================================================================= */}
      {activeTab === "landing" && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-[#06050F]/80 backdrop-blur-md border-b border-dark-border py-4 px-6 md:px-12 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("landing")}>
              <div className="bg-gradient-to-tr from-brand-purple to-brand-blue p-2 rounded-xl text-white shadow-glow-purple">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-purple via-brand-accent to-brand-cyan bg-clip-text text-transparent">
                LEARNMATE AI
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-dark-textMuted">
              <a href="#features" className="hover:text-brand-purple transition-colors">Features</a>
              <a href="#benefits" className="hover:text-brand-purple transition-colors">Benefits</a>
              <a href="#how-it-works" className="hover:text-brand-purple transition-colors">How It Works</a>
            </nav>
            <button
              onClick={() => {
                setActiveTab("dashboard");
                showToast("Welcome to your dashboard space!");
              }}
              className="btn-premium py-2 px-5 text-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </header>

          {/* Hero Section */}
          <section className="relative py-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1 z-10">
            <div className="flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full border border-brand-purple/30 bg-brand-purple/10 text-brand-accent text-xs font-semibold uppercase tracking-wider self-start">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Student Hub
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none text-white">
                Study Smarter.<br />
                <span className="bg-gradient-to-r from-brand-purple via-brand-accent to-brand-cyan bg-clip-text text-transparent">
                  Learn Faster.
                </span>
              </h1>
              <p className="text-dark-textMuted text-lg md:text-xl max-w-lg leading-relaxed">
                LearnMate AI is the ultimate student-focused SaaS platform. Leverage generative Gemini AI to summarize notes, auto-generate interactive MCQ quizzes, solve doubts instantly, and layout optimized focus study schedules.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    showToast("Opening workspace dashboard...");
                  }}
                  className="btn-premium text-base py-3.5 px-8"
                >
                  Enter Workspace
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </button>
                <a
                  href="#features"
                  className="btn-secondary text-base py-3.5 px-8"
                >
                  Explore Features
                </a>
              </div>
              
              {/* Quick Trust Badges */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-dark-border/60">
                <div>
                  <h4 className="text-2xl font-bold text-white">98.7%</h4>
                  <p className="text-xs text-dark-textMuted uppercase font-semibold">Recall Boost</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">10x</h4>
                  <p className="text-xs text-dark-textMuted uppercase font-semibold">Faster Review</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">50k+</h4>
                  <p className="text-xs text-dark-textMuted uppercase font-semibold">SaaS Enrolls</p>
                </div>
              </div>
            </div>

            {/* Futuristic Hero Banner Image */}
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-purple/20 to-brand-cyan/20 rounded-3xl blur-3xl z-0"></div>
              <motion.img
                src="/hero.png"
                alt="LearnMate AI Student productivity mockup"
                className="rounded-3xl border border-dark-border shadow-glow-purple max-w-full h-auto z-10 object-cover transform hover:scale-[1.02] transition-transform duration-500"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </section>

          {/* Features Cards Grid */}
          <section id="features" className="py-24 bg-[#0a081a]/50 border-t border-dark-border px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl font-extrabold text-white mb-4">Core Cognitive Utilities</h2>
                <p className="text-dark-textMuted text-lg">
                  Every tool you need to maximize recall, streamline reading, and crush college exams.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Card 1: Summarizer */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 text-left hover:border-brand-purple/40 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple border border-brand-purple/20">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-purple transition-colors">AI Notes Summarizer</h3>
                  <p className="text-dark-textMuted text-sm leading-relaxed">
                    Upload long academic PDF slide decks or copy-paste lecture transcripts. AI extracts terms, core thesis statements, and bullet reviews.
                  </p>
                </div>

                {/* Card 2: Quiz Generator */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 text-left hover:border-brand-blue/40 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                    <BookOpenCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-blue transition-colors">MCQ Quiz Generator</h3>
                  <p className="text-dark-textMuted text-sm leading-relaxed">
                    Convert raw lecture content directly into interactive multi-choice exams complete with scoreboards, timers, and detailed rationales.
                  </p>
                </div>

                {/* Card 3: Doubt Solver */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 text-left hover:border-brand-cyan/40 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan border border-brand-cyan/20">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-cyan transition-colors">AI Doubt Solver</h3>
                  <p className="text-dark-textMuted text-sm leading-relaxed">
                    Get clear, simple answers to tough science, technology, math, or history problems. Ask contextually and learn instantly.
                  </p>
                </div>

                {/* Card 4: Smart Scheduler */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 text-left hover:border-amber-500/40 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">Smart Focus Planner</h3>
                  <p className="text-dark-textMuted text-sm leading-relaxed">
                    Enter exam deadlines, subject names, and daily limits. The AI arranges balanced timelines complete with study guidelines.
                  </p>
                </div>

                {/* Card 5: Exam Prep Mode */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 text-left hover:border-rose-500/40 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-rose-500 transition-colors">Exam Prep Mode</h3>
                  <p className="text-dark-textMuted text-sm leading-relaxed">
                    Deep dive notes to isolate critical concepts, design targeted cram checklists, and score strategies based on highest academic weight.
                  </p>
                </div>

                {/* Card 6: Pomodoro Focus clock */}
                <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 text-left hover:border-emerald-500/40 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-500 transition-colors">Pomodoro Focus Meter</h3>
                  <p className="text-dark-textMuted text-sm leading-relaxed">
                    Stay lock-in with a beautiful dashboard stopwatch. Divide learning intervals into 25-minute sprints to double attention efficiency.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section id="benefits" className="py-20 max-w-7xl mx-auto px-6 md:px-12 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-brand-purple font-semibold text-sm tracking-wider uppercase">Built for Modern Academia</span>
                <h2 className="text-4xl font-extrabold text-white mt-2 mb-6">Why Students Excel with LearnMate AI</h2>
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Passive to Active Learning</h4>
                      <p className="text-dark-textMuted text-sm mt-1">Don't just reread static PDFs. Create active recall MCQ tests automatically to test your grey matter instantly.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Cognitive Time Slices Saved</h4>
                      <p className="text-dark-textMuted text-sm mt-1">Skip drafting calendar slots. AI aligns available hours with your syllabus in 5 seconds flat.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Unified SQLite Library</h4>
                      <p className="text-dark-textMuted text-sm mt-1">Keep summaries, planners, and quizzes safe. Your personal review dashboard is saved permanently.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border-brand-purple/20">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-purple/20 rounded-full blur-2xl"></div>
                <h3 className="text-2xl font-bold text-white mb-4">Sample AI Summary Feed</h3>
                <div className="bg-[#0b0918]/60 p-4 rounded-xl border border-dark-border mb-4 text-xs font-mono">
                  <div className="text-brand-accent mb-2">{"{"}</div>
                  <div className="pl-4"><span className="text-brand-cyan">"summary"</span>: "Photosynthesis converts light to sugars..."</div>
                  <div className="pl-4"><span className="text-brand-cyan">"key_concepts"</span>: [</div>
                  <div className="pl-8">{"{ "}<span className="text-brand-accent">"concept"</span>: "Calvin Cycle", <span className="text-brand-accent">"detail"</span>: "stroma carbon fixation"{" }"}</div>
                  <div className="pl-4">]</div>
                  <div className="text-brand-accent">{"}"}</div>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-white">
                  <span>Structured Output Stream</span>
                  <span className="text-emerald-400 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> 100% Correct JSON</span>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-auto border-t border-dark-border bg-[#06050F] py-8 px-6 text-center text-sm text-dark-textMuted">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-purple" />
                <span className="font-bold text-white">LearnMate AI</span>
              </div>
              <p>© 2026 LearnMate AI. Hackathon Demo Ready. Study Smarter. Learn Faster.</p>
              <div className="flex gap-4">
                <span className="text-xs border border-brand-purple/30 text-brand-accent py-1 px-2.5 rounded-full bg-brand-purple/10">SQLite Enabled</span>
                <span className="text-xs border border-brand-cyan/30 text-brand-cyan py-1 px-2.5 rounded-full bg-brand-cyan/10">Gemini Powered</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* =========================================================================
          2. DASHBOARD / WORKSPACE LAYOUT
          ========================================================================= */}
      {activeTab !== "landing" && (
        <div className="flex-1 flex flex-col md:flex-row">
          {/* SIDEBAR NAVIGATION */}
          <aside className={`bg-dark-card border-r border-dark-border flex flex-col transition-all duration-300 z-30 ${
            sidebarOpen ? "w-64" : "w-20"
          }`}>
            {/* Sidebar Logo Header */}
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              {sidebarOpen ? (
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("landing")}>
                  <GraduationCap className="w-6 h-6 text-brand-purple" />
                  <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-brand-purple to-brand-cyan bg-clip-text text-transparent">
                    LEARNMATE AI
                  </span>
                </div>
              ) : (
                <GraduationCap className="w-6 h-6 text-brand-purple mx-auto cursor-pointer" onClick={() => setActiveTab("landing")} />
              )}
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="flex-1 p-4 flex flex-col gap-2">
              {[
                { id: "dashboard", label: "Dashboard Hub", icon: Brain },
                { id: "summarizer", label: "AI Summarizer", icon: Upload },
                { id: "quiz", label: "Quiz Generator", icon: BookOpenCheck },
                { id: "chat", label: "AI Doubt Solver", icon: MessageSquare },
                { id: "planner", label: "Smart Planner", icon: Calendar },
                { id: "examprep", label: "Exam Prep Mode", icon: Target }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3.5 py-3 px-4 rounded-xl transition-all font-semibold ${
                      isSelected
                        ? "bg-gradient-to-r from-brand-purple/20 to-brand-blue/15 border border-brand-purple/35 text-white"
                        : "text-dark-textMuted hover:text-white hover:bg-dark-border/40 border border-transparent"
                    } ${sidebarOpen ? "justify-start" : "justify-center"}`}
                    title={item.label}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? "text-brand-purple" : ""}`} />
                    {sidebarOpen && <span className="text-sm">{item.label}</span>}
                  </button>
                );
              })}
            </nav>

            {/* Toggle open/close */}
            <div className="p-4 border-t border-dark-border">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full py-2.5 rounded-xl border border-dark-border text-dark-textMuted hover:text-white hover:bg-dark-border/40 transition-colors flex items-center justify-center"
              >
                {sidebarOpen ? "Collapse Side Panel" : "Open"}
              </button>
              
              <button
                onClick={() => {
                  setActiveTab("landing");
                  showToast("Returned to home page.");
                }}
                className="w-full mt-2 py-2.5 rounded-xl border border-rose-950/40 text-rose-400 hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                {sidebarOpen && <span>Exit Workspace</span>}
              </button>
            </div>
          </aside>

          {/* MAIN CONTAINER WORKSPACE */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#06050F] relative z-10">
            {/* Header banner */}
            <header className="border-b border-dark-border py-4 px-6 md:px-8 bg-dark-card/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-dark-border/50 text-white"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h2 className="text-xl md:text-2xl font-bold text-white capitalize">
                  {activeTab === "dashboard" ? "Academic Dashboard" : activeTab.replace("examprep", "Exam Prep Mode").replace("summarizer", "AI Summarizer").replace("quiz", "Quiz Generator").replace("chat", "AI Doubt Solver").replace("planner", "Smart Focus Planner")}
                </h2>
              </div>

              {/* Status Display Widgets */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="hidden sm:inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Gemini API Fallback Ready
                </span>
                
                <span className="hidden sm:inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-accent">
                  <History className="w-3.5 h-3.5" />
                  SQLite DB Active
                </span>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-bold text-sm text-white shadow-glow-purple">
                    U
                  </div>
                </div>
              </div>
            </header>

            {/* CONTENT MODULE PANELS */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
              {/* =========================================================================
                  PANEL A: DASHBOARD HOME
                  ========================================================================= */}
              {activeTab === "dashboard" && (
                <div className="flex flex-col gap-8">
                  {/* Top Quote card */}
                  <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-brand-purple/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Study Smarter. Learn Faster.</h3>
                      <p className="text-dark-textMuted text-sm mt-1">"The best way to predict your exam performance is to build interactive practice quizzes." - LearnMate AI</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("summarizer")}
                      className="btn-premium shrink-0 text-xs py-2.5 px-4"
                    >
                      <Plus className="w-4 h-4" />
                      Add Study Notes
                    </button>
                  </div>

                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-1 border-brand-purple/20 hover:border-brand-purple/40 transition-colors">
                      <span className="text-dark-textMuted text-xs font-semibold uppercase">Total Notes Summarized</span>
                      <h4 className="text-3xl font-extrabold text-white mt-1">{historyData.summaries.length}</h4>
                      <span className="text-xs text-brand-purple mt-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Study Library</span>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-1 border-brand-blue/20 hover:border-brand-blue/40 transition-colors">
                      <span className="text-dark-textMuted text-xs font-semibold uppercase">Practice Quizzes Generated</span>
                      <h4 className="text-3xl font-extrabold text-white mt-1">{historyData.quizzes.length}</h4>
                      <span className="text-xs text-brand-blue mt-1 flex items-center gap-1"><Award className="w-3 h-3" /> Active Recall</span>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-1 border-brand-cyan/20 hover:border-brand-cyan/40 transition-colors">
                      <span className="text-dark-textMuted text-xs font-semibold uppercase">Doubt Questions Solved</span>
                      <h4 className="text-3xl font-extrabold text-white mt-1">{historyData.chats.length}</h4>
                      <span className="text-xs text-brand-cyan mt-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> AI Chatbot</span>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-1 border-amber-500/20 hover:border-amber-500/40 transition-colors">
                      <span className="text-dark-textMuted text-xs font-semibold uppercase">Planned Calendars</span>
                      <h4 className="text-3xl font-extrabold text-white mt-1">{historyData.planners.length}</h4>
                      <span className="text-xs text-amber-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Study Slots</span>
                    </div>
                  </div>

                  {/* Core Double Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Recent Library history */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-left">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-brand-purple" />
                            Your Academic Study Library
                          </h3>
                          <span className="text-xs text-dark-textMuted font-medium">SQLite Database</span>
                        </div>

                        {historyData.summaries.length === 0 ? (
                          <div className="py-12 text-center flex flex-col items-center gap-3">
                            <Brain className="w-12 h-12 text-dark-border animate-pulse" />
                            <p className="text-dark-textMuted text-sm">No notes summarized yet. Drag and drop notes to get started!</p>
                            <button
                              onClick={() => setActiveTab("summarizer")}
                              className="btn-secondary text-xs py-2 px-4"
                            >
                              Go to Summarizer
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {historyData.summaries.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="bg-[#100e23]/60 p-4 rounded-xl border border-dark-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-purple/40 transition-colors"
                              >
                                <div className="text-left">
                                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                  <p className="text-xs text-dark-textMuted mt-1">
                                    Summarized on {new Date(item.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => {
                                      setSummarizedResult(item.summary_data);
                                      setSummaryInput(item.raw_content);
                                      setSummaryTitle(item.title);
                                      setActiveTab("summarizer");
                                    }}
                                    className="btn-secondary py-1.5 px-3 text-xs"
                                  >
                                    View Summary
                                  </button>
                                  
                                  <button
                                    onClick={() => handleQuickQuizFromSummary(item.raw_content, item.title)}
                                    className="btn-secondary py-1.5 px-3 text-xs border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10"
                                  >
                                    Take Quiz
                                  </button>

                                  <button
                                    onClick={() => deleteHistoryItem("summary", item.id)}
                                    className="text-dark-textMuted hover:text-rose-400 p-1.5 rounded-lg hover:bg-dark-border/40 transition-colors"
                                    title="Delete from Library"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quick Doubt Box */}
                      <div className="glass-panel p-6 rounded-2xl text-left">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-brand-cyan" />
                          Rapid Doubt Solver query
                        </h3>
                        <p className="text-dark-textMuted text-sm mb-4">
                          Stuck on a tricky paragraph or definition? Paste it here for an instant simplified explanation.
                        </p>
                        <form onSubmit={loadQuickDoubt} className="flex gap-3">
                          <input
                            type="text"
                            value={quickDoubt}
                            onChange={(e) => setQuickDoubt(e.target.value)}
                            placeholder="Ask LearnMate: 'Explain operating systems system calls vs virtual memory'..."
                            className="flex-1 bg-[#0b0918] border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted"
                          />
                          <button
                            type="submit"
                            className="btn-premium py-2.5 px-5 text-sm"
                          >
                            Solve Doubt
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Right Column: Pomodoro stopwatch widget */}
                    <div className="flex flex-col gap-6">
                      <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 self-start">
                          <Clock className="w-5 h-5 text-emerald-400" />
                          Pomodoro Focus Clock
                        </h3>
                        
                        {/* Pomodoro Timer Circle display */}
                        <div className="w-40 h-40 rounded-full border-4 border-emerald-500/20 flex flex-col justify-center items-center my-4 relative shadow-glow-blue">
                          <div className="absolute inset-2 rounded-full border border-emerald-400/10 animate-pulse"></div>
                          <span className="text-3xl font-extrabold tracking-widest text-white font-mono">
                            {formatTime(pomodoroTime)}
                          </span>
                          <span className="text-xs uppercase text-dark-textMuted font-bold mt-1">
                            {pomodoroMode === "work" ? "Lock In" : "Break Mode"}
                          </span>
                        </div>

                        {/* Mode selectors */}
                        <div className="flex gap-2 mb-6">
                          <button
                            onClick={() => changePomodoroMode("work")}
                            className={`py-1.5 px-3 rounded-lg text-xs font-semibold ${
                              pomodoroMode === "work"
                                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                                : "bg-dark-card border border-dark-border text-dark-textMuted"
                            }`}
                          >
                            Focus (25m)
                          </button>
                          <button
                            onClick={() => changePomodoroMode("shortBreak")}
                            className={`py-1.5 px-3 rounded-lg text-xs font-semibold ${
                              pomodoroMode === "shortBreak"
                                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                                : "bg-dark-card border border-dark-border text-dark-textMuted"
                            }`}
                          >
                            Rest (5m)
                          </button>
                        </div>

                        {/* Start/Stop toggles */}
                        <div className="flex gap-4">
                          <button
                            onClick={() => setPomodoroRunning(!pomodoroRunning)}
                            className="btn-premium py-2 px-5 text-xs bg-emerald-600 hover:bg-emerald-500"
                          >
                            {pomodoroRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {pomodoroRunning ? "Pause Timer" : "Start Focus"}
                          </button>
                          <button
                            onClick={() => changePomodoroMode(pomodoroMode)}
                            className="btn-secondary py-2 px-3 text-xs"
                            title="Reset Timer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Active Quiz Score widget */}
                      <div className="glass-panel p-6 rounded-2xl text-left border-brand-blue/20">
                        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4 text-brand-blue" />
                          Self Study Score Tracker
                        </h3>
                        <p className="text-xs text-dark-textMuted leading-relaxed">
                          Your active study scores and MCQ test results generated in the session.
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20 font-bold">
                            {(historyData.quizzes.length * 5)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">Points Garnered</h4>
                            <p className="text-xs text-dark-textMuted">MCQs solved in history database</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  PANEL B: AI SUMMARIZER
                  ========================================================================= */}
              {activeTab === "summarizer" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left block: input section */}
                  <div className="glass-panel p-6 md:p-8 rounded-2xl text-left flex flex-col gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Upload Notes / Copy Lecture Sheets</h3>
                      <p className="text-dark-textMuted text-xs">
                        Enter raw textbook details or select an academic PDF from your desktop. LearnMate AI compiles standard summaries.
                      </p>
                    </div>

                    <form onSubmit={handleSummarize} className="flex flex-col gap-5">
                      {/* Note Title */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">Note Document Title</label>
                        <input
                          type="text"
                          value={summaryTitle}
                          onChange={(e) => setSummaryTitle(e.target.value)}
                          placeholder="e.g. Bio 101 - Lecture on Chloroplast structure..."
                          className="bg-[#0b0918] border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted"
                        />
                      </div>

                      {/* PDF Upload container */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">File Attachment (PDF)</label>
                        
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                            pdfFile
                              ? "border-brand-purple/60 bg-brand-purple/5"
                              : "border-dark-border hover:border-brand-purple/50 bg-[#0b0918]"
                          }`}
                        >
                          <Upload className={`w-8 h-8 ${pdfFile ? "text-brand-purple" : "text-dark-textMuted"}`} />
                          {pdfFile ? (
                            <div>
                              <p className="text-sm font-bold text-white">{pdfFile.name}</p>
                              <p className="text-xs text-dark-textMuted mt-1">
                                {(pdfFile.size / 1024).toFixed(1)} KB • Click to replace file
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-white">Drag & drop or Click to browse</p>
                              <p className="text-xs text-dark-textMuted mt-1">Supports standard PDF study notes</p>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePdfUpload}
                            accept="application/pdf"
                            className="hidden"
                          />
                        </div>
                        {pdfFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setPdfFile(null);
                              setSummaryTitle("");
                            }}
                            className="text-xs text-rose-400 hover:underline self-end flex items-center gap-1 mt-1"
                          >
                            <X className="w-3.5 h-3.5" /> Remove PDF selection
                          </button>
                        )}
                      </div>

                      {/* Raw text text area */}
                      {!pdfFile && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-white uppercase tracking-wider">Paste raw notes instead</label>
                          <textarea
                            value={summaryInput}
                            onChange={(e) => setSummaryInput(e.target.value)}
                            placeholder="Paste academic definitions, slides contents, or textbook formulas here (minimum 10 chars)...&#10;&#10;PRO TIP: Type 'Photosynthesis calvin cycle thylakoid' to invoke specific Biology mock responses if Gemini API Key isn't provided."
                            rows={8}
                            className="bg-[#0b0918] border border-dark-border rounded-xl p-4 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted font-sans resize-none"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn-premium text-sm py-3.5 mt-2"
                      >
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Compile Smart Summary
                      </button>
                    </form>
                  </div>

                  {/* Right block: output results */}
                  <div className="glass-panel p-6 md:p-8 rounded-2xl text-left flex flex-col gap-6 relative min-h-[400px]">
                    {!summarizedResult ? (
                      <div className="absolute inset-0 m-auto flex flex-col justify-center items-center p-6 text-center max-w-sm">
                        <Brain className="w-16 h-16 text-dark-border animate-pulse mb-4" />
                        <h4 className="text-base font-bold text-white mb-2">No Summary Generated Yet</h4>
                        <p className="text-xs text-dark-textMuted">
                          Configure notes, click compile, and the generated summary (paragraphs, bullet points, key concepts) will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {/* Brief summary block */}
                        <div>
                          <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">AI Synoptic Overview</span>
                          <p className="text-dark-text text-sm leading-relaxed mt-2 bg-[#0b0918]/60 p-4 rounded-xl border border-dark-border">
                            {summarizedResult.summary}
                          </p>
                        </div>

                        {/* Key Concepts grid */}
                        <div>
                          <span className="text-xs font-bold text-brand-purple uppercase tracking-wider block mb-3">Key Academic Concepts</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {summarizedResult.key_concepts && summarizedResult.key_concepts.map((concept, idx) => (
                              <div key={idx} className="bg-[#100e23]/60 p-4 rounded-xl border border-dark-border hover:border-brand-purple/30 transition-colors">
                                <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
                                  {concept.concept}
                                </h5>
                                <p className="text-xs text-dark-textMuted mt-1.5 leading-relaxed">{concept.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bullet reviews */}
                        <div>
                          <span className="text-xs font-bold text-brand-purple uppercase tracking-wider block mb-3">Recall Bullet Points</span>
                          <ul className="flex flex-col gap-2.5">
                            {summarizedResult.bullet_points && summarizedResult.bullet_points.map((pt, idx) => (
                              <li key={idx} className="flex gap-2.5 text-sm leading-relaxed text-dark-text">
                                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cohesive CTAs */}
                        <div className="pt-6 border-t border-dark-border/60 flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleQuickQuizFromSummary(summaryInput || `Summary content of ${summaryTitle}`, summaryTitle)}
                            className="btn-premium flex-1 py-2.5 text-xs bg-brand-blue hover:shadow-glow-blue"
                          >
                            <BookOpenCheck className="w-4 h-4" />
                            Take Self MCQ Test
                          </button>
                          <button
                            onClick={() => handleQuickExamFromSummary(summaryInput || `Summary content of ${summaryTitle}`, summaryTitle)}
                            className="btn-secondary flex-1 py-2.5 text-xs border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-300"
                          >
                            <Target className="w-4 h-4" />
                            Analyze Exam Strategy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  PANEL C: QUIZ GENERATOR
                  ========================================================================= */}
              {activeTab === "quiz" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                  {/* Left column config */}
                  <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 h-fit">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Generate Practice Test</h3>
                      <p className="text-dark-textMuted text-xs">
                        Generate 5 Multiple Choice Questions (MCQs) instantly to benchmark your text memory recall.
                      </p>
                    </div>

                    <form onSubmit={handleGenerateQuiz} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">Quiz Topic/Title</label>
                        <input
                          type="text"
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                          placeholder="e.g. Photosynthesis Chloroplast MCQ Practice..."
                          className="bg-[#0b0918] border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">Study Notes material</label>
                        <textarea
                          value={quizInput}
                          onChange={(e) => setQuizInput(e.target.value)}
                          placeholder="Paste study material text to extract MCQs...&#10;&#10;PRO TIP: Paste a recent summary or write 'Operating system scheduling paging deadlock' to invoke computer science mock databases!"
                          rows={10}
                          className="bg-[#0b0918] border border-dark-border rounded-xl p-4 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted resize-none"
                        />
                      </div>

                      {/* 1-click import shortcut */}
                      {historyData.summaries.length > 0 && !quizInput && (
                        <button
                          type="button"
                          onClick={() => {
                            const latest = historyData.summaries[0];
                            setQuizInput(latest.raw_content);
                            setQuizTitle(`Quiz - ${latest.title}`);
                            showToast("Loaded notes from latest library!");
                          }}
                          className="text-xs text-brand-accent hover:underline flex items-center gap-1 self-start"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> 1-Click Import latest summarized notes
                        </button>
                      )}

                      <button
                        type="submit"
                        className="btn-premium text-sm py-3 mt-1 bg-gradient-to-r from-brand-blue to-brand-cyan shadow-glow-blue"
                      >
                        <BookOpenCheck className="w-4 h-4" />
                        Compile MCQ Game
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Quiz sheet game */}
                  <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-2xl relative min-h-[400px]">
                    {!activeQuiz ? (
                      <div className="absolute inset-0 m-auto flex flex-col justify-center items-center p-6 text-center max-w-sm">
                        <BookOpenCheck className="w-16 h-16 text-dark-border animate-pulse mb-4" />
                        <h4 className="text-base font-bold text-white mb-2">No Active Practice Exam</h4>
                        <p className="text-xs text-dark-textMuted">
                          Configure study notes, hit compile, and an interactive MCQ sheet with radio buttons will render here.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center border-b border-dark-border pb-4">
                          <div>
                            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">Active MCQ Sheet</span>
                            <h4 className="text-lg font-bold text-white mt-1">{activeQuiz.title}</h4>
                          </div>
                          <span className="text-xs border border-brand-blue/30 text-brand-blue py-1 px-2.5 rounded-full bg-brand-blue/10 font-bold">
                            5 Questions
                          </span>
                        </div>

                        {/* Interactive MCQ Sheet list */}
                        <div className="flex flex-col gap-8">
                          {activeQuiz.quiz_data.map((item, qIdx) => {
                            const chosenOption = quizAnswers[qIdx];
                            return (
                              <div key={qIdx} className="flex flex-col gap-3">
                                <h5 className="text-sm font-bold text-white flex gap-2">
                                  <span>{qIdx + 1}.</span>
                                  <span>{item.question}</span>
                                </h5>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                                  {item.options.map((opt, oIdx) => {
                                    const isSelected = chosenOption === opt;
                                    const isCorrect = item.correct_answer === opt;
                                    
                                    let optionStyle = "border-dark-border bg-[#0b0918]/60 text-dark-text hover:border-brand-blue/30";
                                    
                                    if (isSelected && !quizSubmitted) {
                                      optionStyle = "border-brand-blue bg-brand-blue/10 text-white";
                                    } else if (quizSubmitted) {
                                      if (isCorrect) {
                                        optionStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold";
                                      } else if (isSelected && !isCorrect) {
                                        optionStyle = "border-rose-500 bg-rose-950/40 text-rose-300";
                                      } else {
                                        optionStyle = "border-dark-border bg-[#0b0918]/30 text-dark-textMuted pointer-events-none";
                                      }
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        disabled={quizSubmitted}
                                        onClick={() => {
                                          setQuizAnswers((prev) => ({
                                            ...prev,
                                            [qIdx]: opt
                                          }));
                                        }}
                                        className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${optionStyle}`}
                                      >
                                        <span>{opt}</span>
                                        {quizSubmitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                                        {quizSubmitted && isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Submission panel */}
                        <div className="pt-6 border-t border-dark-border/60 flex items-center justify-between gap-4">
                          {!quizSubmitted ? (
                            <>
                              <p className="text-xs text-dark-textMuted">
                                Answer all 5 multiple choice questions before submitting for scoring review.
                              </p>
                              <button
                                onClick={submitQuiz}
                                className="btn-premium py-2.5 px-6 text-xs bg-brand-blue hover:shadow-glow-blue"
                              >
                                Submit Answers
                              </button>
                            </>
                          ) : (
                            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#100e23]/60 p-4 rounded-xl border border-dark-border">
                              <div>
                                <h4 className="text-sm font-bold text-white">Quiz Score Summary</h4>
                                <p className="text-xs text-dark-textMuted mt-1">
                                  You scored <span className="text-brand-blue font-bold">{quizScore} / {activeQuiz.quiz_data.length}</span> (
                                  {Math.round((quizScore / activeQuiz.quiz_data.length) * 100)}%)
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setActiveQuiz(null);
                                  setQuizAnswers({});
                                  setQuizSubmitted(false);
                                  showToast("Quiz sheet reset.");
                                }}
                                className="btn-secondary py-2 px-5 text-xs"
                              >
                                Try Another Notesheet
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  PANEL D: AI DOUBT SOLVER CHAT
                  ========================================================================= */}
              {activeTab === "chat" && (
                <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col h-[650px] text-left">
                  {/* Chat top header info */}
                  <div className="flex justify-between items-center border-b border-dark-border pb-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Gemini Academic Doubt Solver</h3>
                      <p className="text-dark-textMuted text-xs mt-0.5">
                        Multi-turn student chat console. Explains code debugs, history debates, bio reactions, or formulas simply.
                      </p>
                    </div>
                    
                    <span className="text-xs border border-brand-cyan/30 text-brand-cyan py-1 px-2.5 rounded-full bg-brand-cyan/10 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Direct Chat Session
                    </span>
                  </div>

                  {/* Suggested Quick Prompt tags */}
                  <div className="flex flex-wrap gap-2.5 mb-4">
                    <span className="text-xs text-dark-textMuted font-bold self-center">Popular doubt queries:</span>
                    {[
                      "Explain photosynthesis in easy steps",
                      "What is an Operating System Kernel?",
                      "How does virtual memory paging work?",
                      "Give study strategies for hard exams"
                    ].map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setChatInput(tag);
                          showToast("Loaded query tag.");
                        }}
                        className="py-1 px-2.5 rounded-lg border border-dark-border bg-[#0b0918]/60 hover:bg-dark-border/40 hover:border-brand-cyan/40 text-xs text-dark-textMuted hover:text-white transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Chat bubbles list stream */}
                  <div className="flex-1 overflow-y-auto pr-2 mb-4 flex flex-col gap-4 scrollbar">
                    {chatMessages.map((msg, idx) => {
                      const isAi = msg.sender === "ai";
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col max-w-[80%] ${isAi ? "self-start text-left" : "self-end text-right"}`}
                        >
                          <div
                            className={`p-4 rounded-2xl text-sm leading-relaxed ${
                              isAi
                                ? "bg-[#100e23]/80 border border-dark-border text-dark-text shadow-sm"
                                : "bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-glow-purple font-medium"
                            }`}
                          >
                            {msg.typing ? (
                              <div className="flex items-center gap-1.5 py-1 justify-center">
                                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-bounce"></span>
                                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-bounce [animation-delay:0.4s]"></span>
                              </div>
                            ) : (
                              <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                            )}
                          </div>
                          <span className="text-[10px] text-dark-textMuted font-semibold mt-1 px-2.5">
                            {isAi ? "LearnMate AI" : "You"} • {msg.time}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef}></div>
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleChat} className="flex gap-3 border-t border-dark-border/60 pt-4">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask academic doubt here (e.g. 'What are the 4 Coffman conditions for deadlocks?')..."
                      className="flex-1 bg-[#0b0918] border border-dark-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="btn-premium py-3 px-6 text-sm shrink-0"
                    >
                      <span>Send</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* =========================================================================
                  PANEL E: SMART FOCUS PLANNER
                  ========================================================================= */}
              {activeTab === "planner" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                  {/* Left setup card */}
                  <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 h-fit">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Create Focus Study Calendar</h3>
                      <p className="text-dark-textMuted text-xs">
                        Provide your exam date, subjects, and available hours, and the AI maps out balanced weekly intervals.
                      </p>
                    </div>

                    <form onSubmit={handleGeneratePlanner} className="flex flex-col gap-4">
                      {/* Target Exam Date */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">Target Exam Date</label>
                        <input
                          type="date"
                          value={planDate}
                          onChange={(e) => setPlanDate(e.target.value)}
                          className="bg-[#0b0918] border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted font-mono"
                        />
                      </div>

                      {/* Subject List */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">Subjects to study</label>
                        <input
                          type="text"
                          value={planSubjects}
                          onChange={(e) => setPlanSubjects(e.target.value)}
                          placeholder="e.g. Chemistry, Biology, Computer Science..."
                          className="bg-[#0b0918] border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted"
                        />
                      </div>

                      {/* Focus Hours slider */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-white uppercase tracking-wider">Daily Study Hours Limit</label>
                          <span className="text-xs font-bold text-brand-purple">{planHours} Hours</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="12"
                          value={planHours}
                          onChange={(e) => setPlanHours(parseInt(e.target.value))}
                          className="w-full accent-brand-purple bg-[#0b0918]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-premium text-sm py-3 mt-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Generate Focus Timetable
                      </button>
                    </form>
                  </div>

                  {/* Right schedule viewer */}
                  <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-2xl relative min-h-[400px]">
                    {!generatedPlan ? (
                      <div className="absolute inset-0 m-auto flex flex-col justify-center items-center p-6 text-center max-w-sm">
                        <Calendar className="w-16 h-16 text-dark-border animate-pulse mb-4" />
                        <h4 className="text-base font-bold text-white mb-2">No Study Planner Generated</h4>
                        <p className="text-xs text-dark-textMuted">
                          Configure exam details on the left, hit compile, and an organized day-by-day weekly study calendar will load here.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        <div className="border-b border-dark-border pb-4 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-brand-purple uppercase tracking-wider">Generated Schedule Roadmap</span>
                            <h4 className="text-lg font-bold text-white mt-1">
                              Timetable targeting exam date {planDate}
                            </h4>
                          </div>
                          <span className="text-xs border border-brand-purple/30 text-brand-purple py-1 px-2.5 rounded-full bg-brand-purple/10 font-bold">
                            5 Day Review
                          </span>
                        </div>

                        {/* Timetable schedule grid */}
                        <div className="flex flex-col gap-5">
                          {generatedPlan.timetable_data && Array.isArray(generatedPlan.timetable_data) && generatedPlan.timetable_data.map((day, dIdx) => (
                            <div key={dIdx} className="bg-[#100e23]/60 p-4 rounded-xl border border-dark-border">
                              <h5 className="text-sm font-bold text-brand-purple flex justify-between items-center">
                                <span>{day.day}</span>
                                <span className="text-[10px] text-dark-textMuted uppercase font-semibold">Active Review Session</span>
                              </h5>

                              {/* Task items under Day */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                {day.tasks && Array.isArray(day.tasks) && day.tasks.map((task, tIdx) => (
                                  <div key={tIdx} className="bg-[#0b0918]/60 p-3 rounded-lg border border-dark-border flex justify-between items-center gap-3">
                                    <div className="text-left">
                                      <span className="text-[10px] uppercase font-bold text-brand-accent tracking-wider bg-brand-purple/15 border border-brand-purple/20 px-2 py-0.5 rounded-full">
                                        {task.subject}
                                      </span>
                                      <h6 className="text-xs font-bold text-white mt-1.5">{task.topic}</h6>
                                    </div>
                                    <span className="text-xs text-dark-textMuted font-mono shrink-0 flex items-center gap-1 bg-[#100e23] border border-dark-border px-2 py-1 rounded">
                                      <Clock className="w-3 h-3 text-brand-cyan" /> {task.focus_minutes}m
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <p className="text-xs text-dark-textMuted italic mt-3 bg-[#0b0918]/40 p-2.5 rounded border border-dark-border/40">
                                💡 Focus tip: {day.daily_focus_tip}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  PANEL F: EXAM PREP MODE
                  ========================================================================= */}
              {activeTab === "examprep" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                  {/* Left form config */}
                  <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 h-fit">
                    <div>
                      <h3 className="text-lg font-bold text-rose-400 mb-1 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Exam Prep Analyzer
                      </h3>
                      <p className="text-dark-textMuted text-xs">
                        Isolate critical syllabus concepts, construct high-priority topic weight matrices, and formulate targeted cram strategies.
                      </p>
                    </div>

                    <form onSubmit={handleGenerateExamPrep} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">Exam Title/Syllabus</label>
                        <input
                          type="text"
                          value={prepTitle}
                          onChange={(e) => setPrepTitle(e.target.value)}
                          placeholder="e.g. Midterm 2 - Operating Systems CPU/Deadlocks..."
                          className="bg-[#0b0918] border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-white uppercase tracking-wider">Study Notes for Analysis</label>
                        <textarea
                          value={prepInput}
                          onChange={(e) => setPrepInput(e.target.value)}
                          placeholder="Paste notes details to extract topics...&#10;&#10;PRO TIP: Paste a recent summary or write 'operating systems virtual memory paging scheduler' to load target priority matrix grids!"
                          rows={10}
                          className="bg-[#0b0918] border border-dark-border rounded-xl p-4 text-sm text-white focus:outline-none focus:border-brand-purple/50 placeholder:text-dark-textMuted resize-none"
                        />
                      </div>

                      {/* 1-click import shortcut */}
                      {historyData.summaries.length > 0 && !prepInput && (
                        <button
                          type="button"
                          onClick={() => {
                            const latest = historyData.summaries[0];
                            setPrepInput(latest.raw_content);
                            setPrepTitle(`Exam Prep - ${latest.title}`);
                            showToast("Loaded notes from latest library!");
                          }}
                          className="text-xs text-brand-accent hover:underline flex items-center gap-1 self-start"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> 1-Click Import latest summarized notes
                        </button>
                      )}

                      <button
                        type="submit"
                        className="btn-premium text-sm py-3 mt-1 bg-gradient-to-r from-rose-600 to-brand-purple border-rose-500/40 hover:shadow-glow-purple"
                      >
                        <Target className="w-4 h-4" />
                        Analyze Exam Strategy
                      </button>
                    </form>
                  </div>

                  {/* Right strategy viewer */}
                  <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-2xl relative min-h-[400px]">
                    {!generatedPrep ? (
                      <div className="absolute inset-0 m-auto flex flex-col justify-center items-center p-6 text-center max-w-sm">
                        <Target className="w-16 h-16 text-dark-border animate-pulse mb-4" />
                        <h4 className="text-base font-bold text-white mb-2">Exam Strategy Mode Standby</h4>
                        <p className="text-xs text-dark-textMuted">
                          Upload syllabus notes, run analysis, and LearnMate AI isolates critical test weight tags, revision guides, and cram lists here.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        <div className="border-b border-dark-border pb-4 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Exam Strategy Map</span>
                            <h4 className="text-lg font-bold text-white mt-1">
                              Strategic study recommendations
                            </h4>
                          </div>
                          <span className="text-xs border border-rose-500/30 text-rose-400 py-1 px-2.5 rounded-full bg-rose-500/10 font-bold">
                            Revision Mode
                          </span>
                        </div>

                        {/* High priority concept matrix */}
                        <div>
                          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-3">Critical Core Topic Matrix</span>
                          
                          <div className="flex flex-col gap-3">
                            {generatedPrep.high_priority_concepts.map((concept, idx) => (
                              <div key={idx} className="bg-[#100e23]/60 p-4 rounded-xl border border-dark-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="text-left max-w-lg">
                                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                    {concept.concept}
                                  </h5>
                                  <p className="text-xs text-dark-textMuted mt-1 leading-relaxed">{concept.why}</p>
                                </div>
                                <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${
                                  concept.priority === "Critical"
                                    ? "bg-rose-950/80 border-rose-500/40 text-rose-400"
                                    : "bg-amber-950/80 border-amber-500/40 text-amber-400"
                                }`}>
                                  {concept.priority} Weight
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Revision Strategy steps */}
                        <div>
                          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-3">Targeted Revision Strategy Action Plan</span>
                          
                          <ul className="flex flex-col gap-3">
                            {generatedPrep.revision_strategy.map((item, idx) => (
                              <li key={idx} className="flex gap-3 bg-[#0b0918]/60 p-3 rounded-lg border border-dark-border text-xs text-dark-text leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                                  {idx + 1}
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Extracted Topics tags */}
                        <div>
                          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2.5">Extracted Sub-Chapters</span>
                          <div className="flex flex-wrap gap-2">
                            {generatedPrep.extracted_topics.map((topic, idx) => (
                              <span key={idx} className="bg-[#100e23] border border-dark-border px-3 py-1 rounded-lg text-xs font-semibold text-dark-text">
                                📖 {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
