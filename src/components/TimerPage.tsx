import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StudySession } from '../types';
import { SUBJECT_MAP } from '../lib/constants';
import { 
  Play, 
  Pause, 
  Check, 
  Trash2, 
  Clock, 
  History, 
  Plus, 
  Search, 
  X, 
  Sparkles,
  ArrowUpDown,
  Filter
} from 'lucide-react';

export const TimerPage: React.FC = () => {
  const { 
    activeTimer, 
    startActiveTimer, 
    pauseActiveTimer, 
    resumeActiveTimer, 
    completeActiveTimer, 
    stopActiveTimer,
    studySessions,
    deleteStudySession
  } = useApp();

  // Timer Dialog popup state
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedSessionName, setSelectedSessionName] = useState('Revision');
  const [timerType, setTimerType] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [countdownMinutes, setCountdownMinutes] = useState(60);

  // History states
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterSubject, setHistoryFilterSubject] = useState('all');
  const [historySortOrder, setHistorySortOrder] = useState<'newest' | 'oldest'>('newest');

  // Seconds elapsed state for current active timer
  const [seconds, setSeconds] = useState(0);

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (!activeTimer) {
      setSeconds(0);
      return;
    }
    setSeconds(activeTimer.accumulatedSeconds);

    if (!activeTimer.isRunning) return;

    const interval = setInterval(() => {
      const start = activeTimer.startTime || Date.now();
      const elapsedSinceStart = Math.floor((Date.now() - start) / 1000);
      setSeconds(activeTimer.accumulatedSeconds + elapsedSinceStart);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  // Monitor countdown timer completion
  useEffect(() => {
    if (activeTimer && activeTimer.timerType === 'countdown' && activeTimer.durationSeconds) {
      if (seconds >= activeTimer.durationSeconds) {
        // Countdown finished!
        const playAlarm = async () => {
          try {
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
            await audio.play();
          } catch (e) {
            console.log("Audio deferred", e);
          }
        };
        playAlarm();
        alert("⏰ Study session complete! Your focus time has been recorded.");
        completeActiveTimer();
      }
    }
  }, [seconds, activeTimer, completeActiveTimer]);

  const formatTimerDigits = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
  };

  const handleStartClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationSecs = timerType === 'countdown' ? countdownMinutes * 60 : 0;
    startActiveTimer(selectedSubject, selectedSessionName, timerType, durationSecs);
    setIsPopupOpen(false);
  };

  const handleCancelTimer = () => {
    setConfirmModal({
      title: "Cancel Timer Session",
      message: "Are you sure you want to cancel the current session? No progress will be saved.",
      onConfirm: () => {
        stopActiveTimer();
        setConfirmModal(null);
      }
    });
  };

  const handleDeleteSession = async (id?: string) => {
    if (!id) return;
    setConfirmModal({
      title: "Delete Study Session",
      message: "Delete this study session record? This will also deduct from your cumulative subject hours.",
      onConfirm: async () => {
        await deleteStudySession(id);
        setConfirmModal(null);
      }
    });
  };

  const getSubjectColorClasses = (code: string) => {
    const maps: Record<string, string> = {
      math: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
      eco: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
      bm: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
      eng: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
      hindi: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
      ess: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
      ipmat: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
    };
    return maps[code] || 'bg-neutral-100 text-neutral-700';
  };

  // Process and filter study history
  const filteredHistory = studySessions
    .filter(session => {
      // Search query (matches session name or subject description)
      const subjectName = SUBJECT_MAP[session.subject] || session.subject;
      const matchesSearch = session.sessionName.toLowerCase().includes(historySearch.toLowerCase()) || 
                            subjectName.toLowerCase().includes(historySearch.toLowerCase());
      
      // Filter by subject
      const matchesSubject = historyFilterSubject === 'all' || session.subject === historyFilterSubject;

      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.startTime || '00:00:00'}`).getTime();
      const timeB = new Date(`${b.date}T${b.startTime || '00:00:00'}`).getTime();
      return historySortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const formatDurationReadable = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    let res = '';
    if (h > 0) res += `${h}h `;
    if (m > 0) res += `${m}m `;
    if (s > 0 || secs === 0) res += `${s}s`;
    return res.trim();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      
      {/* 1. HERO TIMER STAGE */}
      <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-6 sm:p-10 shadow-xs flex flex-col items-center text-center">
        {activeTimer ? (
          <div className="space-y-5 w-full">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Active Focus Session
              </span>
              <p className="text-lg font-bold text-[#1A1A1A] dark:text-white mt-1.5">
                {SUBJECT_MAP[activeTimer.subjectCode] || activeTimer.subjectCode}
              </p>
              <p className="text-[11px] text-[#8E8E8D] font-bold uppercase tracking-wider">
                Type: {activeTimer.sessionName}
              </p>
            </div>

            {/* Timer Output Display */}
            <div className="py-4">
              <p className="text-4xl sm:text-6xl font-mono font-medium tracking-wider text-black dark:text-white select-none">
                {formatTimerDigits(
                  activeTimer.timerType === 'countdown' && activeTimer.durationSeconds
                    ? Math.max(0, activeTimer.durationSeconds - seconds)
                    : seconds
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {activeTimer.isRunning ? (
                <button
                  onClick={pauseActiveTimer}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded text-xs font-semibold cursor-pointer"
                >
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={resumeActiveTimer}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded text-xs font-semibold cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Resume</span>
                </button>
              )}

              <button
                onClick={completeActiveTimer}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Finish & Log</span>
              </button>

              <button
                onClick={handleCancelTimer}
                className="flex items-center space-x-1.5 px-4 py-2 border border-[#EBEBE9] dark:border-[#252524] hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 rounded text-xs font-semibold text-[#6B6B69] dark:text-neutral-300 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-12 w-12 bg-[#F4F4F3] dark:bg-neutral-900 rounded-lg flex items-center justify-center text-[#8E8E8D] mx-auto border border-[#EBEBE9] dark:border-[#252524]">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                Ready to Study?
              </h2>
              <p className="text-xs text-[#8E8E8D] max-w-xs mx-auto mt-1 leading-relaxed">
                Start a timed focus session. LOCKTFIN automatically counts and attributes hours to your IBDP subject cumulative statistics.
              </p>
            </div>
            <button
              onClick={handleStartClick}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded text-xs font-semibold cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start focus session</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. HISTORY LISTING STAGE */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5">
            <History className="h-4.5 w-4.5 text-[#8E8E8D]" />
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white">
              Study History
            </h3>
          </div>

          {/* History Search / Filter / Sort controllers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full max-w-[180px]">
              <Search className="absolute left-2.5 top-2 h-3 w-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-[#151514] text-xs text-[#1A1A1A] dark:text-[#ECECEC] placeholder-neutral-400 focus:outline-none"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>

            {/* Filter by Subject */}
            <div className="flex items-center space-x-1 bg-[#F4F4F3] dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded px-2 py-1.5 text-xs text-[#6B6B69] dark:text-neutral-300">
              <Filter className="h-3 w-3 text-[#8E8E8D]" />
              <select
                value={historyFilterSubject}
                onChange={(e) => setHistoryFilterSubject(e.target.value)}
                className="bg-transparent border-none text-[11px] focus:outline-none font-semibold cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {Object.entries(SUBJECT_MAP).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            {/* Sort order toggle */}
            <div className="flex items-center space-x-1 bg-[#F4F4F3] dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded px-2 py-1.5 text-xs text-[#6B6B69] dark:text-neutral-300">
              <ArrowUpDown className="h-3 w-3 text-[#8E8E8D]" />
              <button
                onClick={() => setHistorySortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                className="text-[11px] font-semibold cursor-pointer"
              >
                {historySortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </button>
            </div>
          </div>
        </div>

        {/* History Table/List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl py-10 px-4 text-center text-xs text-neutral-400">
            No study sessions found. Start studying to record history!
          </div>
        ) : (
          <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl overflow-hidden shadow-xs">
            <div className="divide-y divide-[#EBEBE9] dark:divide-[#252524]">
              {filteredHistory.map(session => (
                <div
                  key={session.id}
                  className="group p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4F4F3]/30 dark:hover:bg-neutral-900/10 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    {/* Subject badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getSubjectColorClasses(session.subject)}`}>
                      {SUBJECT_MAP[session.subject] || session.subject}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate">
                        {session.sessionName}
                      </p>
                      <p className="text-[10px] text-[#8E8E8D] mt-0.5">
                        {session.date} • {session.startTime || 'unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300 text-xs">
                      {formatDurationReadable(session.duration)}
                    </span>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-[#F4F4F3]/80 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Start Session Setup Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[15vh]">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-neutral-900/35 dark:bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsPopupOpen(false)} />

          {/* Dialog Card */}
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] shadow-lg p-5 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBEBE9] dark:border-[#252524]">
              <h3 className="font-bold text-[#1A1A1A] dark:text-white text-sm flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-[#8E8E8D]" />
                <span>Configure focus session</span>
              </h3>
              <button 
                onClick={() => setIsPopupOpen(false)}
                className="p-1 text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-white rounded hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePopupSubmit} className="mt-3.5 space-y-3.5">
              {/* Subject Selector */}
              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Select Subject
                </label>
                <select
                  className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-2 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white cursor-pointer"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {Object.entries(SUBJECT_MAP).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Session type selector */}
              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Session Category
                </label>
                <select
                  className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-2 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white cursor-pointer"
                  value={selectedSessionName}
                  onChange={(e) => setSelectedSessionName(e.target.value)}
                >
                  <option value="Revision">Revision</option>
                  <option value="Worksheet">Worksheet</option>
                  <option value="Past Paper">Past Paper</option>
                  <option value="Notes">Notes</option>
                </select>
              </div>

              {/* Timer Mode Selector */}
              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Timer Mode
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setTimerType('stopwatch')}
                    className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      timerType === 'stopwatch'
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'border-[#EBEBE9] dark:border-[#252524] text-neutral-600 dark:text-neutral-400 hover:bg-[#F4F4F3] dark:hover:bg-neutral-800'
                    }`}
                  >
                    Stopwatch
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimerType('countdown')}
                    className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer ${
                      timerType === 'countdown'
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                        : 'border-[#EBEBE9] dark:border-[#252524] text-neutral-600 dark:text-neutral-400 hover:bg-[#F4F4F3] dark:hover:bg-neutral-800'
                    }`}
                  >
                    Countdown
                  </button>
                </div>
              </div>

              {/* Countdown Duration (Only visible if Countdown selected) */}
              {timerType === 'countdown' && (
                <div className="space-y-2 animate-fade-in">
                  <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                    Duration (Minutes)
                  </label>
                  
                  {/* Presets */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[25, 50, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setCountdownMinutes(mins)}
                        className={`py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                          countdownMinutes === mins
                            ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-black dark:border-neutral-100'
                            : 'border-neutral-200 dark:border-[#252524] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                        }`}
                      >
                        {mins === 60 ? '1 hr' : `${mins}m`}
                      </button>
                    ))}
                  </div>

                  {/* Custom minutes input */}
                  <div className="mt-1">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={countdownMinutes}
                      onChange={(e) => setCountdownMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                      placeholder="Custom minutes"
                      className="w-full px-2.5 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 text-neutral-900 dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPopupOpen(false)}
                  className="px-3 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded text-xs font-semibold text-[#6B6B69] hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded text-xs font-semibold transition-opacity cursor-pointer"
                >
                  Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
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
