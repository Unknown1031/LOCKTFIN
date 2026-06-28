import React from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECT_MAP } from '../lib/constants';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Calendar, 
  BarChart, 
  TrendingUp, 
  Award, 
  AlertCircle
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { studySessions, tasks, subjects } = useApp();

  // 1. Total Hours Studied
  const totalSeconds = subjects.reduce((sum, s) => sum + s.totalStudyTime, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  // 2. Task Completion Stats
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const totalTasksCount = tasks.length;
  const taskCompletionRate = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // 3. Current Study Streak
  const calculateStreak = () => {
    if (studySessions.length === 0) return 0;
    
    // Get unique sorted dates in descending order
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

  const streak = calculateStreak();

  // 4. Weekly study hours (last 7 days)
  const getWeeklySeconds = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return studySessions
      .filter(s => new Date(s.date) >= sevenDaysAgo)
      .reduce((sum, s) => sum + s.duration, 0);
  };
  const weeklyHours = (getWeeklySeconds() / 3600).toFixed(1);

  // 5. Monthly study hours (last 30 days)
  const getMonthlySeconds = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return studySessions
      .filter(s => new Date(s.date) >= thirtyDaysAgo)
      .reduce((sum, s) => sum + s.duration, 0);
  };
  const monthlyHours = (getMonthlySeconds() / 3600).toFixed(1);

  // 6. Average daily study time (on days studied)
  const getAverageDailyHours = () => {
    if (studySessions.length === 0) return "0.0";
    const uniqueDays = new Set(studySessions.map(s => s.date)).size;
    const avgSecs = totalSeconds / uniqueDays;
    return (avgSecs / 3600).toFixed(1);
  };
  const averageDailyTime = getAverageDailyHours();

  // 7. Most and Least Studied Subjects
  const sortedSubjectsByTime = [...subjects]
    .sort((a, b) => b.totalStudyTime - a.totalStudyTime);

  const mostStudiedSubject = sortedSubjectsByTime[0] && sortedSubjectsByTime[0].totalStudyTime > 0
    ? sortedSubjectsByTime[0]
    : null;

  const leastStudiedSubject = sortedSubjectsByTime.length > 0
    ? [...subjects].sort((a, b) => a.totalStudyTime - b.totalStudyTime)[0]
    : null;

  // Format hours and minutes for reading
  const formatTimeReadable = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h === 0 && m === 0) return '0m';
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      
      {/* Page Header */}
      <div>
        <span className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider">
          Workspace Statistics
        </span>
        <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-white mt-1">
          Performance Analytics
        </h1>
        <p className="text-[11px] text-[#8E8E8D] mt-0.5">
          A calm, minimal breakdown of your study accomplishments.
        </p>
      </div>

      {/* Grid 1: Top Bento Core Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Streak card */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E8E8D]">Study Streak</span>
            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white">
              {streak} <span className="text-[11px] font-semibold text-neutral-400">days</span>
            </h3>
            <p className="text-[9px] text-[#8E8E8D] mt-0.5">Consecutive days logged</p>
          </div>
        </div>

        {/* Total Hours card */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E8E8D]">Total Time</span>
            <Clock className="h-3.5 w-3.5 text-[#8E8E8D]" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white">
              {totalHours} <span className="text-[11px] font-semibold text-neutral-400">hours</span>
            </h3>
            <p className="text-[9px] text-[#8E8E8D] mt-0.5">Logged study timer hours</p>
          </div>
        </div>

        {/* Tasks Completed card */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E8E8D]">Milestones</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white">
              {completedTasksCount} <span className="text-[11px] font-semibold text-neutral-400">done</span>
            </h3>
            <p className="text-[9px] text-[#8E8E8D] mt-0.5">{pendingTasksCount} tasks pending</p>
          </div>
        </div>

        {/* Avg Daily Hours card */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E8E8D]">Daily Average</span>
            <Calendar className="h-3.5 w-3.5 text-violet-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white">
              {averageDailyTime} <span className="text-[11px] font-semibold text-neutral-400">hours</span>
            </h3>
            <p className="text-[9px] text-[#8E8E8D] mt-0.5">Average logged per study day</p>
          </div>
        </div>
      </div>

      {/* Grid 2: Study Intervals & Extrema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Weekly vs Monthly focus hours */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] p-5 rounded-xl shadow-xs space-y-5">
          <h4 className="text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
            Focus Intervals
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#6B6B69] font-semibold">Last 7 Days</span>
                <span className="font-bold text-neutral-850 dark:text-neutral-200">{weeklyHours} hours</span>
              </div>
              <div className="h-1.5 w-full bg-[#F4F4F3] dark:bg-[#252524] rounded overflow-hidden">
                <div 
                  className="h-full bg-black dark:bg-[#ECECEC]" 
                  style={{ width: `${Math.min(100, (Number(weeklyHours) / 30) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#6B6B69] font-semibold">Last 30 Days</span>
                <span className="font-bold text-neutral-850 dark:text-neutral-200">{monthlyHours} hours</span>
              </div>
              <div className="h-1.5 w-full bg-[#F4F4F3] dark:bg-[#252524] rounded overflow-hidden">
                <div 
                  className="h-full bg-black dark:bg-[#ECECEC]" 
                  style={{ width: `${Math.min(100, (Number(monthlyHours) / 120) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task Complete rate banner card */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <h4 className="text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
            Task Completion Status
          </h4>
          <div className="flex items-center space-x-3 my-2">
            <div className="relative h-12 w-12 shrink-0 flex items-center justify-center font-extrabold text-neutral-850 dark:text-[#ECECEC] text-xs">
              <svg className="absolute inset-0 h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeWidth="3.5"
                  strokeDasharray={`${taskCompletionRate}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span>{taskCompletionRate}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {completedTasksCount} of {totalTasksCount} Complete
              </p>
              <p className="text-[10px] text-[#8E8E8D] mt-0.5 leading-normal">
                Keep checking tasks off your planner backlog.
              </p>
            </div>
          </div>
          <div className="border-t border-[#EBEBE9] dark:border-[#252524] pt-2.5 flex justify-between text-[10px] font-bold text-[#8E8E8D]">
            <span>Pending: {pendingTasksCount}</span>
            <span>Done: {completedTasksCount}</span>
          </div>
        </div>

        {/* Extrema Highlights */}
        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] p-5 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
          <h4 className="text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
            Subject Highlights
          </h4>
          <div className="space-y-2 flex-1">
            {mostStudiedSubject ? (
              <div className="flex items-start space-x-2">
                <div className="p-1 rounded bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 mt-0.5 shrink-0">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[9px] text-[#8E8E8D] font-bold uppercase leading-none">MOST STUDIED</p>
                  <p className="text-xs font-bold text-neutral-850 dark:text-neutral-50 leading-tight mt-1">
                    {SUBJECT_MAP[mostStudiedSubject.code] || mostStudiedSubject.code}
                  </p>
                  <p className="text-[10px] text-[#8E8E8D] mt-0.5">
                    {formatTimeReadable(mostStudiedSubject.totalStudyTime)} logged
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-neutral-400">No focus stats recorded yet.</p>
            )}

            {leastStudiedSubject && leastStudiedSubject.totalStudyTime === 0 && (
              <div className="flex items-start space-x-2 pt-2 border-t border-[#EBEBE9] dark:border-[#252524]">
                <div className="p-1 rounded bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400 mt-0.5 shrink-0">
                  <AlertCircle className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[9px] text-[#8E8E8D] font-bold uppercase leading-none">NEEDS FOCUS</p>
                  <p className="text-xs font-bold text-neutral-850 dark:text-neutral-50 leading-tight mt-1">
                    {SUBJECT_MAP[leastStudiedSubject.code] || leastStudiedSubject.code}
                  </p>
                  <p className="text-[10px] text-[#8E8E8D] mt-0.5">
                    0 minutes logged so far.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Grid 3: Flat bars per subject */}
      <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] p-5 rounded-xl shadow-xs">
        <h4 className="text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider mb-4">
          Study Time Allocation by Subject
        </h4>
        <div className="space-y-3.5">
          {subjects.map(subj => {
            const pct = totalSeconds > 0 ? (subj.totalStudyTime / totalSeconds) * 100 : 0;
            return (
              <div key={subj.code} className="group">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-800 dark:text-neutral-200">{subj.name}</span>
                  <div className="flex items-center space-x-1.5 font-mono">
                    <span className="text-neutral-500 font-semibold text-[11px]">{formatTimeReadable(subj.totalStudyTime)}</span>
                    <span className="text-neutral-300 dark:text-neutral-700">|</span>
                    <span className="text-neutral-400 text-[10px]">{Math.round(pct)}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-[#F4F4F3] dark:bg-[#252524] rounded overflow-hidden">
                  <div 
                    className="h-full bg-black dark:bg-[#ECECEC] transition-all group-hover:opacity-80" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
