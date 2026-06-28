import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Clock, 
  BarChart2, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  Search, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  Flame, 
  Sparkles,
  Play,
  Pause,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { IB_SUBJECTS, SUBJECT_MAP, IPMAT_SYLLABUS } from '../lib/constants';
import { CommandPalette } from './CommandPalette';
import { FramerConfetti } from './FramerConfetti';
import confetti from 'canvas-confetti';

interface AppLayoutProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  children: React.ReactNode;
  onAddTaskClick: () => void;
  onStartTimerClick: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  setCurrentPage,
  children,
  onAddTaskClick,
  onStartTimerClick
}) => {
  const { 
    user, 
    logout, 
    tasks, 
    activeTimer, 
    pauseActiveTimer, 
    resumeActiveTimer, 
    completeActiveTimer, 
    stopActiveTimer,
    studySessions,
    settings,
    confettiTrigger,
    ipmatProgress,
    completedSectionName,
    setCompletedSectionName
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Trigger canvas-confetti on confettiTrigger change
  useEffect(() => {
    if (confettiTrigger > 0) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [confettiTrigger]);

  // Handle active timer seconds ticking
  useEffect(() => {
    if (!activeTimer) {
      setSecondsElapsed(0);
      return;
    }
    setSecondsElapsed(activeTimer.accumulatedSeconds);

    if (!activeTimer.isRunning) return;

    // Track real time accurately
    const interval = setInterval(() => {
      const start = activeTimer.startTime || Date.now();
      const elapsedSinceStart = Math.floor((Date.now() - start) / 1000);
      setSecondsElapsed(activeTimer.accumulatedSeconds + elapsedSinceStart);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Compute stats for Header
  const todayStr = new Date().toISOString().split('T')[0];
  
  const pendingTasksToday = tasks.filter(t => 
    !t.completed && (t.dueDate === todayStr || t.dueDate < todayStr)
  );

  const upcomingDeadlines = tasks.filter(t => {
    if (t.completed) return false;
    const diff = Math.ceil((new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return diff > 0 && diff <= 3; // within 3 days
  });

  // Calculate Streak
  const calculateStreak = () => {
    if (studySessions.length === 0) return 0;
    
    // Get unique sorted dates in descending order
    const sessionDates = Array.from(new Set(studySessions.map(s => s.date))) as string[];
    sessionDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sessionDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If the latest study wasn't today or yesterday, streak is broken
    if (sessionDates[0] !== today && sessionDates[0] !== yesterday) {
      return 0;
    }

    let streak = 0;
    let expectedDate = new Date(sessionDates[0]);

    for (let i = 0; i < sessionDates.length; i++) {
      const d = new Date(sessionDates[i]);
      const diffTime = Math.abs(expectedDate.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        expectedDate = d;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  const getSubjectDotColor = (code: string) => {
    const maps: Record<string, string> = {
      math: 'bg-blue-500',
      eco: 'bg-emerald-500',
      bm: 'bg-amber-500',
      eng: 'bg-indigo-500',
      hindi: 'bg-rose-500',
      ess: 'bg-teal-500',
      ipmat: 'bg-violet-500'
    };
    return maps[code] || 'bg-neutral-500';
  };

  return (
    <div className="flex h-screen bg-[#FBFBFA] dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#ECECEC] font-sans select-none overflow-hidden transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#F4F4F3] dark:bg-[#151514] border-r border-[#EBEBE9] dark:border-[#252524] h-full">
        {/* Logo Section */}
        <div className="px-6 py-5 border-b border-[#EBEBE9] dark:border-[#252524] flex items-center justify-between">
          <div 
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="h-6 w-6 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shadow-xs">
              <div className="w-1.5 h-1.5 bg-white dark:bg-black rounded-full"></div>
            </div>
            <span className="font-sans font-semibold text-[#1A1A1A] dark:text-white text-sm tracking-tight">
              LOCKTFIN
            </span>
          </div>
          {currentStreak > 0 && (
            <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/50 dark:border-amber-800/30 text-[10px] font-bold">
              <Flame className="h-3 w-3 fill-current" />
              <span>{currentStreak}d</span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* IPMAT Prep */}
          <div>
            <span className="px-2 text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider block mb-2">
              IPMAT Prep
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => setCurrentPage('ipmat')}
                className={`w-full flex items-center px-2.5 py-1.5 rounded text-left text-xs transition-all duration-150 cursor-pointer ${
                  currentPage === 'ipmat'
                    ? 'bg-[#EBEBE9] dark:bg-[#252524] text-[#1A1A1A] dark:text-white font-medium'
                    : 'text-[#6B6B69] hover:text-[#1A1A1A] hover:bg-[#EBEBE9]/50 dark:text-neutral-400 dark:hover:text-[#ECECEC] dark:hover:bg-[#252524]/40'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-3 shrink-0" />
                <span>IPMAT Syllabus</span>
              </button>
            </div>
          </div>

          {/* IBDP Subjects */}
          <div>
            <span className="px-2 text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider block mb-2">
              IBDP Subjects
            </span>
            <div className="space-y-0.5">
              {IB_SUBJECTS.filter(s => s.type === 'ibdp').map(subj => {
                const isActive = currentPage === subj.code;
                return (
                  <button
                    key={subj.code}
                    onClick={() => setCurrentPage(subj.code)}
                    className={`w-full flex items-center px-2.5 py-1.5 rounded text-left text-xs transition-all duration-150 cursor-pointer ${
                      isActive 
                        ? 'bg-[#EBEBE9] dark:bg-[#252524] text-[#1A1A1A] dark:text-white font-medium' 
                        : 'text-[#6B6B69] hover:text-[#1A1A1A] hover:bg-[#EBEBE9]/50 dark:text-neutral-400 dark:hover:text-[#ECECEC] dark:hover:bg-[#252524]/40'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${getSubjectDotColor(subj.code)} mr-3 shrink-0`} />
                    <span className="truncate">{subj.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Sections */}
          <div>
            <span className="px-2 text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider block mb-2">
              Additional Stuff
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => setCurrentPage('timer')}
                className={`w-full flex items-center px-2.5 py-1.5 rounded text-left text-xs transition-all duration-150 cursor-pointer ${
                  currentPage === 'timer'
                    ? 'bg-[#EBEBE9] dark:bg-[#252524] text-[#1A1A1A] dark:text-white font-medium'
                    : 'text-[#6B6B69] hover:text-[#1A1A1A] hover:bg-[#EBEBE9]/50 dark:text-neutral-400 dark:hover:text-[#ECECEC] dark:hover:bg-[#252524]/40'
                }`}
              >
                <Clock className="h-3.5 w-3.5 mr-2 text-[#8E8E8D]" />
                <span>Study Timer</span>
              </button>
              <button
                onClick={() => setCurrentPage('analytics')}
                className={`w-full flex items-center px-2.5 py-1.5 rounded text-left text-xs transition-all duration-150 cursor-pointer ${
                  currentPage === 'analytics'
                    ? 'bg-[#EBEBE9] dark:bg-[#252524] text-[#1A1A1A] dark:text-white font-medium'
                    : 'text-[#6B6B69] hover:text-[#1A1A1A] hover:bg-[#EBEBE9]/50 dark:text-neutral-400 dark:hover:text-[#ECECEC] dark:hover:bg-[#252524]/40'
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5 mr-2 text-[#8E8E8D]" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setCurrentPage('assignments')}
                className={`w-full flex items-center px-2.5 py-1.5 rounded text-left text-xs transition-all duration-150 cursor-pointer ${
                  currentPage === 'assignments'
                    ? 'bg-[#EBEBE9] dark:bg-[#252524] text-[#1A1A1A] dark:text-white font-medium'
                    : 'text-[#6B6B69] hover:text-[#1A1A1A] hover:bg-[#EBEBE9]/50 dark:text-neutral-400 dark:hover:text-[#ECECEC] dark:hover:bg-[#252524]/40'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-[#8E8E8D]" />
                <span>Assignments</span>
              </button>
            </div>
          </div>
        </nav>

        {/* User Profile Info Footer widget */}
        <div className="p-4 border-t border-[#EBEBE9] dark:border-[#252524]">
          <div 
            onClick={() => setCurrentPage('settings')}
            className="flex items-center gap-3 bg-white dark:bg-[#1D1D1C] p-2.5 rounded-lg border border-[#EBEBE9] dark:border-[#252524] hover:bg-[#EBEBE9]/40 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] dark:bg-[#2F2F2D] flex items-center justify-center text-[10px] font-bold text-[#1A1A1A] dark:text-[#ECECEC] shrink-0">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-[#1A1A1A] dark:text-[#ECECEC] leading-none">{user?.displayName || 'Student'}</p>
              <p className="text-[10px] text-[#8E8E8D] dark:text-neutral-500 truncate mt-1 leading-none">
                {studySessions.length} logged sessions
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-[#ECECEC] p-1 rounded hover:bg-[#EBEBE9]/40 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-neutral-900/30 dark:bg-neutral-950/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />

          {/* Drawer content */}
          <div className="relative flex flex-col w-72 bg-white dark:bg-neutral-900 h-full p-4 border-r border-neutral-200 dark:border-neutral-800 z-50">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div 
                onClick={() => {
                  setCurrentPage('dashboard');
                  setSidebarOpen(false);
                }}
                className="flex items-center space-x-2 cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="h-7 w-7 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm shadow-sm">
                  L
                </div>
                <span className="font-sans font-medium text-neutral-900 dark:text-neutral-100 text-lg tracking-tight">
                  LOCKTFIN
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto pt-6 space-y-6">
              {/* IPMAT Prep on mobile */}
              <div>
                <span className="px-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
                  IPMAT Prep
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setCurrentPage('ipmat');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                      currentPage === 'ipmat'
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 font-medium'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100'
                    }`}
                  >
                    <Sparkles className="h-4 w-4 mr-3 text-neutral-400" />
                    <span>IPMAT Syllabus</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="px-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
                  IBDP
                </span>
                <div className="space-y-1">
                  {IB_SUBJECTS.filter(s => s.type === 'ibdp').map(subj => {
                    const isActive = currentPage === subj.code;
                    return (
                      <button
                        key={subj.code}
                        onClick={() => {
                          setCurrentPage(subj.code);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                          isActive 
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 font-medium' 
                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100'
                        }`}
                      >
                        <BookOpen className="h-4 w-4 mr-3 text-neutral-400" />
                        <span className="truncate">{subj.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="px-3 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
                  Additional Stuff
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setCurrentPage('timer');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                      currentPage === 'timer'
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 font-medium'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100'
                    }`}
                  >
                    <Clock className="h-4 w-4 mr-3 text-neutral-400" />
                    <span>Study Timer</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage('analytics');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                      currentPage === 'analytics'
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 font-medium'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100'
                    }`}
                  >
                    <BarChart2 className="h-4 w-4 mr-3 text-neutral-400" />
                    <span>Analytics</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage('assignments');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                      currentPage === 'assignments'
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 font-medium'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-3 text-neutral-400" />
                    <span>Assignments</span>
                  </button>
                </div>
              </div>
            </nav>

            <div 
              onClick={() => {
                setCurrentPage('settings');
                setSidebarOpen(false);
              }}
              className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 shrink-0">
                  {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate leading-tight">
                    {user?.displayName || 'Student'}
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }} 
                className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-[#1A1A1A] transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Side */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#1D1D1C]">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-[#1D1D1C] border-b border-[#EBEBE9] dark:border-[#252524] px-4 md:px-6 flex items-center justify-between shrink-0">
          {/* Mobile hamburger button */}
          <div className="flex items-center space-x-3 md:space-x-0">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded hover:bg-[#EBEBE9]/60 dark:hover:bg-neutral-800 text-neutral-500"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="font-semibold text-[#1A1A1A] dark:text-white text-sm block md:hidden">
              LOCKTFIN
            </div>
          </div>

          {/* Center search button (Trigger Command Palette) */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center space-x-2 text-[11px] text-[#8E8E8D] bg-[#F4F4F3] hover:bg-[#EBEBE9]/60 dark:bg-[#151514] dark:hover:bg-neutral-800/40 border border-[#EBEBE9] dark:border-[#252524] px-3 py-1.5 rounded w-full max-w-xs md:max-w-sm transition-all text-left cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <span className="flex-1">Search command or subject...</span>
            <span className="hidden sm:inline bg-white dark:bg-[#1D1D1C] border border-[#EBEBE9] dark:border-[#252524] text-[9px] text-[#8E8E8D] px-1.5 py-0.5 rounded shadow-2xs font-mono">
              Ctrl K
            </span>
          </button>

          {/* Streak inside header for mobile, or simple tasks notifications */}
          <div className="flex items-center space-x-3">
            {pendingTasksToday.length > 0 && (
              <div 
                onClick={() => setCurrentPage(pendingTasksToday[0].subjectCode)}
                className="flex items-center space-x-1 cursor-pointer bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] font-bold dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/30"
                title={`${pendingTasksToday.length} pending tasks today`}
              >
                <AlertCircle className="h-3 w-3" />
                <span className="hidden sm:inline">{pendingTasksToday.length} Due</span>
                <span className="inline sm:hidden">{pendingTasksToday.length}</span>
              </div>
            )}
            
            {activeTimer && (
              <div 
                onClick={() => setCurrentPage('timer')}
                className="flex items-center space-x-2 bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-xs animate-pulse"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="font-mono">{formatTime(secondsElapsed)}</span>
              </div>
            )}
          </div>
        </header>

        {/* Global Active Timer Ribbon Banner (Nice-to-have to pause/resume from anywhere!) */}
        {activeTimer && currentPage !== 'timer' && (
          <div className="bg-[#F4F4F3] dark:bg-[#151514] border-b border-[#EBEBE9] dark:border-[#252524] px-4 py-1.5 flex items-center justify-between text-xs transition-all duration-150 animate-slide-down">
            <div className="flex items-center space-x-2 overflow-hidden mr-4">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#1A1A1A] dark:text-[#ECECEC] text-[10px] uppercase tracking-wider">Timer:</span>
              <span className="text-[#6B6B69] dark:text-neutral-400 truncate text-[11px]">
                {SUBJECT_MAP[activeTimer.subjectCode] || activeTimer.subjectCode} ({activeTimer.sessionName})
              </span>
              <span className="font-mono font-bold text-[#1A1A1A] dark:text-[#ECECEC] shrink-0 text-[11px]">
                [{formatTime(secondsElapsed)}]
              </span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              {activeTimer.isRunning ? (
                <button 
                  onClick={pauseActiveTimer}
                  className="p-1 rounded bg-white dark:bg-neutral-700 border border-[#EBEBE9] dark:border-neutral-600 hover:bg-neutral-50 text-neutral-700 dark:text-neutral-200 shadow-3xs cursor-pointer"
                  title="Pause Timer"
                >
                  <Pause className="h-3 w-3" />
                </button>
              ) : (
                <button 
                  onClick={resumeActiveTimer}
                  className="p-1 rounded bg-white dark:bg-neutral-700 border border-[#EBEBE9] dark:border-neutral-600 hover:bg-neutral-50 text-neutral-700 dark:text-neutral-200 shadow-3xs cursor-pointer"
                  title="Resume Timer"
                >
                  <Play className="h-3 w-3" />
                </button>
              )}
              <button 
                onClick={completeActiveTimer}
                className="p-1 rounded bg-black dark:bg-white text-white dark:text-black hover:opacity-80 shadow-3xs flex items-center cursor-pointer"
                title="Finish and Log Session"
              >
                <Check className="h-3 w-3" />
              </button>
              <button 
                onClick={stopActiveTimer}
                className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white shadow-3xs flex items-center cursor-pointer"
                title="Cancel Session"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Main Stage Content with scroll containment and Right Sidebar */}
        <div className="flex-1 flex overflow-hidden bg-[#FBFBFA] dark:bg-[#0A0A0A]">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-colors duration-200 relative">
            {children}
          </main>

          {/* Right Sidebar for Desktop */}
          <div className="hidden xl:flex xl:w-72 flex-col gap-6 border-l border-[#EBEBE9] dark:border-[#252524] p-5 overflow-y-auto bg-white dark:bg-[#151514] shrink-0">
            {/* Active Timer Card */}
            {activeTimer ? (
              <section className="bg-black dark:bg-neutral-950 text-white p-5 rounded-xl border border-neutral-800">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Active Timer</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                </div>
                <div className="my-3 text-2xl font-mono text-center tracking-tight font-semibold">
                  {formatTime(secondsElapsed)}
                </div>
                <div className="text-center mb-4">
                  <p className="text-[10px] text-neutral-400 font-medium truncate">
                    {SUBJECT_MAP[activeTimer.subjectCode] || activeTimer.subjectCode}
                  </p>
                  <p className="text-xs font-semibold truncate mt-0.5">
                    {activeTimer.sessionName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={completeActiveTimer}
                    className="flex-1 bg-white hover:bg-neutral-100 text-black py-1.5 rounded text-xs font-semibold transition-all cursor-pointer"
                  >
                    Finish
                  </button>
                  {activeTimer.isRunning ? (
                    <button 
                      onClick={pauseActiveTimer}
                      className="px-2 bg-neutral-900 hover:bg-neutral-850 rounded text-white transition-all cursor-pointer flex items-center justify-center border border-neutral-800"
                      title="Pause"
                    >
                      <Pause className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button 
                      onClick={resumeActiveTimer}
                      className="px-2 bg-neutral-900 hover:bg-neutral-850 rounded text-white transition-all cursor-pointer flex items-center justify-center border border-neutral-800"
                      title="Resume"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setConfirmModal({
                        title: "Cancel Focus Session",
                        message: "Cancel this session? No focus hours will be saved.",
                        onConfirm: () => {
                          stopActiveTimer();
                          setConfirmModal(null);
                        }
                      });
                    }}
                    className="px-2 bg-rose-950/40 hover:bg-rose-900/40 rounded text-rose-400 transition-all cursor-pointer flex items-center justify-center border border-rose-900/30"
                    title="Cancel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </section>
            ) : (
              <section className="bg-[#F4F4F3] dark:bg-neutral-950 p-4 rounded-xl border border-[#EBEBE9] dark:border-[#252524] text-center flex flex-col items-center justify-center py-5">
                <Clock className="h-5 w-5 text-neutral-400 mb-1.5" />
                <p className="text-xs font-semibold text-[#1A1A1A] dark:text-[#ECECEC]">No active session</p>
                <p className="text-[10px] text-[#8E8E8D] mt-0.5 max-w-[180px] leading-relaxed">Start a study session timer to log your hours.</p>
                <button 
                  onClick={onStartTimerClick}
                  className="mt-2.5 px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-opacity"
                >
                  Start Timer
                </button>
              </section>
            )}

            {/* IPMAT Progress Section */}
            <section className="flex flex-col">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8D] dark:text-neutral-500 mb-3 flex items-center justify-between">
                <span>IPMAT Progress</span>
                <button 
                  onClick={() => setCurrentPage('ipmat')}
                  className="text-[10px] hover:underline normal-case font-semibold text-[#6B6B69] dark:text-neutral-400 cursor-pointer"
                >
                  View Details
                </button>
              </h3>
              <div className="space-y-3.5">
                {(() => {
                  const calculateProgress = (sectionCode: string) => {
                    const section = IPMAT_SYLLABUS.find(s => s.code === sectionCode);
                    if (!section) return { pct: 0, completed: 0, total: 0 };
                    const totalTasks = section.chapters.length * 2; // book + worksheet
                    let checked = 0;
                    section.chapters.forEach(chap => {
                      const prog = ipmatProgress.find(p => p.chapterId === chap.id);
                      if (prog?.bookCompleted) checked++;
                      if (prog?.worksheetCompleted) checked++;
                    });
                    return {
                      pct: totalTasks > 0 ? Math.round((checked / totalTasks) * 100) : 0,
                      completed: checked,
                      total: totalTasks
                    };
                  };

                  const arithmeticProg = calculateProgress('arithmetic');
                  const algebraProg = calculateProgress('algebra');
                  const geometryProg = calculateProgress('geometry');

                  return (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-[#6B6B69] dark:text-neutral-300">Arithmetic</span>
                          <span className="text-[10px] font-bold text-[#1A1A1A] dark:text-white">{arithmeticProg.pct}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#EBEBE9] dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-black dark:bg-white rounded-full transition-all" style={{ width: `${arithmeticProg.pct}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-[#6B6B69] dark:text-neutral-300">Algebra</span>
                          <span className="text-[10px] font-bold text-[#1A1A1A] dark:text-white">{algebraProg.pct}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#EBEBE9] dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-black dark:bg-white rounded-full transition-all" style={{ width: `${algebraProg.pct}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-[#6B6B69] dark:text-neutral-300">Geometry</span>
                          <span className="text-[10px] font-bold text-[#1A1A1A] dark:text-white">{geometryProg.pct}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#EBEBE9] dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-black dark:bg-white rounded-full transition-all" style={{ width: `${geometryProg.pct}%` }} />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Ctrl K Command Palette Modal */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
        setCurrentPage={setCurrentPage}
        onAddTaskClick={onAddTaskClick}
        onStartTimerClick={onStartTimerClick}
      />

      {/* Framer Confetti for section completion */}
      {completedSectionName && (
        <FramerConfetti 
          sectionName={completedSectionName} 
          onClose={() => setCompletedSectionName(null)} 
        />
      )}

      {/* Custom Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/35 dark:bg-neutral-950/60 backdrop-blur-xs" onClick={() => setConfirmModal(null)} />
          <div className="relative w-full max-w-xs overflow-hidden rounded-xl bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] shadow-lg p-5 z-10 animate-scale-up">
            <h3 className="font-bold text-[#1A1A1A] dark:text-white text-xs">
              {confirmModal.title}
            </h3>
            <p className="text-[11px] text-[#6B6B69] dark:text-neutral-400 mt-2 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="mt-4 pt-3 border-t border-[#EBEBE9] dark:border-[#252524] flex items-center justify-end space-x-1.5">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-2.5 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded text-[10px] font-bold text-[#6B6B69] hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-2.5 py-1.5 bg-rose-600 text-white dark:bg-rose-500 hover:opacity-90 rounded text-[10px] font-bold transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
