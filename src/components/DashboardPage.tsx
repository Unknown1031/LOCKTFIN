import React from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECT_MAP } from '../lib/constants';
import { 
  Clock, 
  Flame, 
  CheckCircle, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  ListTodo,
  TrendingUp
} from 'lucide-react';

interface DashboardPageProps {
  setCurrentPage: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentPage }) => {
  const { 
    user, 
    tasks, 
    studySessions, 
    updateTask,
    ipmatProgress
  } = useApp();

  // Calculate stats
  const totalStudySeconds = studySessions.reduce((acc, s) => acc + s.duration, 0);
  const totalStudyHours = (totalStudySeconds / 3600).toFixed(1);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate Streak
  const calculateStreak = () => {
    if (studySessions.length === 0) return 0;
    const sessionDates = Array.from(new Set(studySessions.map(s => s.date))) as string[];
    sessionDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (sessionDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

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

  // Get total study time for each subject
  const getSubjectStudyTime = (code: string) => {
    const secs = studySessions
      .filter(s => s.subject === code)
      .reduce((acc, s) => acc + s.duration, 0);
    return (secs / 3600).toFixed(1);
  };

  // Pending Tasks
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 4);

  const getSubjectColorClasses = (code: string) => {
    const maps: Record<string, { bg: string, text: string, border: string, dot: string }> = {
      math: { bg: 'bg-indigo-50/50 dark:bg-indigo-950/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-900/20', dot: 'bg-indigo-500' },
      eco: { bg: 'bg-emerald-50/50 dark:bg-emerald-950/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/20', dot: 'bg-emerald-500' },
      bm: { bg: 'bg-rose-50/50 dark:bg-rose-950/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/20', dot: 'bg-rose-500' },
      eng: { bg: 'bg-amber-50/50 dark:bg-amber-950/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/20', dot: 'bg-amber-500' },
      hindi: { bg: 'bg-violet-50/50 dark:bg-violet-950/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-900/20', dot: 'bg-violet-500' },
      ess: { bg: 'bg-sky-50/50 dark:bg-sky-950/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-900/20', dot: 'bg-sky-500' },
      ipmat: { bg: 'bg-teal-50/50 dark:bg-teal-950/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900/20', dot: 'bg-teal-500' }
    };
    return maps[code] || { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-100', dot: 'bg-neutral-500' };
  };

  const handleToggleTask = async (id?: string, completed?: boolean) => {
    if (!id) return;
    await updateTask(id, { completed: !completed });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Student Dashboard</span>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-white mt-0.5">
            Welcome back, {user?.displayName || 'Student'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Here's a minimal summary of your academic workspace today.
          </p>
        </div>
        
        {/* Quick Study Timer Navigation Card */}
        <button
          onClick={() => setCurrentPage('timer')}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-95 transition-all rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Clock className="h-4 w-4" />
          <span>Launch Study Timer</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Minimal Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Study Time */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-4 flex items-center space-x-4 shadow-3xs">
          <div className="h-10 w-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Study Logged</p>
            <p className="text-lg font-bold text-neutral-950 dark:text-white">{totalStudyHours} hrs</p>
          </div>
        </div>

        {/* Stat 2: Streak */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-4 flex items-center space-x-4 shadow-3xs">
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500">
            <Flame className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Study Streak</p>
            <p className="text-lg font-bold text-neutral-950 dark:text-white">{currentStreak} Days</p>
          </div>
        </div>

        {/* Stat 3: Task Rate */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-4 flex items-center space-x-4 shadow-3xs">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tasks Complete</p>
            <p className="text-lg font-bold text-neutral-950 dark:text-white">{taskCompletionRate}%</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Subjects list & Pending tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Middle: Six Subjects & IPMAT (Grid of 7 Cards) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center">
              <BookOpen className="h-4 w-4 mr-2" /> Course Syllabus & Study Track
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Six subjects */}
            {Object.entries(SUBJECT_MAP).map(([code, name]) => {
              const color = getSubjectColorClasses(code);
              return (
                <div
                  key={code}
                  onClick={() => setCurrentPage(code)}
                  className={`group p-4 bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl flex items-center justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-3xs`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className={`w-2.5 h-2.5 rounded-full ${color.dot} shrink-0`} />
                    <div className="truncate">
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-[#ECECEC] truncate">
                        {name}
                      </h3>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {getSubjectStudyTime(code)} study hours
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Pending Tasks Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center">
              <ListTodo className="h-4 w-4 mr-2" /> Pending Tasks
            </h2>
            <button
              onClick={() => setCurrentPage('math')}
              className="text-[10px] font-bold text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Manage Tasks
            </button>
          </div>

          <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-4 shadow-3xs min-h-[220px] flex flex-col justify-between">
            {pendingTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                <CheckCircle className="h-8 w-8 mb-2 text-emerald-400" />
                <p className="text-xs font-medium">All tasks complete!</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Enjoy your free time or log a focus session.</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto">
                {pendingTasks.map(task => {
                  const subColor = getSubjectColorClasses(task.subjectCode);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-[#EBEBE9]/60 dark:border-neutral-800/40 hover:bg-[#F4F4F3]/30 dark:hover:bg-neutral-900/10 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <button
                          onClick={() => handleToggleTask(task.id, task.completed)}
                          className="text-neutral-400 hover:text-black dark:hover:text-white shrink-0 cursor-pointer"
                        >
                          <span className="block h-4 w-4 rounded border border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
                            {task.completed && <span className="block h-2 w-2 rounded bg-black dark:bg-white" />}
                          </span>
                        </button>
                        <div className="truncate">
                          <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                            {task.title}
                          </p>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold border mt-0.5 uppercase ${subColor.bg} ${subColor.text} ${colorBorder(task.subjectCode)}`}>
                            {SUBJECT_MAP[task.subjectCode] || task.subjectCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850 mt-3 text-center">
              <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                LOCKTFIN Focus Desk
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper for minimal border styling
function colorBorder(code: string) {
  const maps: Record<string, string> = {
    math: 'border-indigo-100 dark:border-indigo-900/10',
    eco: 'border-emerald-100 dark:border-emerald-900/10',
    bm: 'border-rose-100 dark:border-rose-900/10',
    eng: 'border-amber-100 dark:border-amber-900/10',
    hindi: 'border-violet-100 dark:border-violet-900/10',
    ess: 'border-sky-100 dark:border-sky-900/10',
    ipmat: 'border-teal-100 dark:border-teal-900/10'
  };
  return maps[code] || 'border-neutral-100';
}
