import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IPMAT_SYLLABUS } from '../lib/constants';
import { ChevronDown, ChevronRight, CheckSquare, Square, Book, FileText, BarChart, Sparkles } from 'lucide-react';

export const IpmatPage: React.FC = () => {
  const { ipmatProgress, updateIpmatChapter } = useApp();
  
  // Track open/collapsed state of accordion sections
  // Default first 3 expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'verbal': true,
    'di': true,
    'number_sys': true
  });

  const toggleSection = (code: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  // Helper to get progress for a specific chapter
  const getChapterProgress = (chapterId: string) => {
    const prog = ipmatProgress.find(p => p.chapterId === chapterId);
    return {
      bookCompleted: prog ? prog.bookCompleted : false,
      worksheetCompleted: prog ? prog.worksheetCompleted : false,
    };
  };

  // Calculate stats for a section
  const calculateSectionStats = (sectionCode: string) => {
    const section = IPMAT_SYLLABUS.find(s => s.code === sectionCode);
    if (!section) return { bookPct: 0, wsPct: 0, overallPct: 0, totalChapters: 0, completedChapters: 0 };

    const totalChapters = section.chapters.length;
    let booksChecked = 0;
    let wsChecked = 0;
    let completedChapters = 0;

    section.chapters.forEach(chap => {
      const { bookCompleted, worksheetCompleted } = getChapterProgress(chap.id);
      if (bookCompleted) booksChecked++;
      if (worksheetCompleted) wsChecked++;
      if (bookCompleted && worksheetCompleted) completedChapters++;
    });

    const bookPct = totalChapters > 0 ? Math.round((booksChecked / totalChapters) * 100) : 0;
    const wsPct = totalChapters > 0 ? Math.round((wsChecked / totalChapters) * 100) : 0;
    const overallPct = totalChapters > 0 ? Math.round(((booksChecked + wsChecked) / (totalChapters * 2)) * 100) : 0;

    return {
      bookPct,
      wsPct,
      overallPct,
      totalChapters,
      completedChapters
    };
  };

  // Calculate Overall IPMAT Completion
  const calculateOverallStats = () => {
    let totalChapters = 0;
    let booksChecked = 0;
    let wsChecked = 0;

    IPMAT_SYLLABUS.forEach(section => {
      section.chapters.forEach(chap => {
        totalChapters++;
        const { bookCompleted, worksheetCompleted } = getChapterProgress(chap.id);
        if (bookCompleted) booksChecked++;
        if (worksheetCompleted) wsChecked++;
      });
    });

    const bookPct = totalChapters > 0 ? Math.round((booksChecked / totalChapters) * 100) : 0;
    const wsPct = totalChapters > 0 ? Math.round((wsChecked / totalChapters) * 100) : 0;
    const overallPct = totalChapters > 0 ? Math.round(((booksChecked + wsChecked) / (totalChapters * 2)) * 100) : 0;

    return {
      bookPct,
      wsPct,
      overallPct
    };
  };

  const handleCheckboxToggle = async (
    sectionCode: string,
    chapterId: string,
    type: 'book' | 'worksheet'
  ) => {
    const current = getChapterProgress(chapterId);
    let newBook = current.bookCompleted;
    let newWs = current.worksheetCompleted;

    if (type === 'book') {
      newBook = !newBook;
    } else {
      newWs = !newWs;
    }

    await updateIpmatChapter(sectionCode, chapterId, newBook, newWs);
  };

  const overallStats = calculateOverallStats();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Page Title & Overall Completion Card */}
      <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-1.5 bg-[#F4F4F3] dark:bg-neutral-800 rounded text-neutral-800 dark:text-neutral-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider">
              IPMAT Syllabus Tracker
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-white leading-none mt-1">
              IPMAT Prep Syllabus
            </h1>
          </div>
        </div>

        {/* Global Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 pt-5 border-t border-[#EBEBE9] dark:border-neutral-800/60">
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#8E8E8D] mb-1 uppercase tracking-wider">
              <span className="flex items-center"><Book className="h-3 w-3 mr-1" /> Book Complete</span>
              <span>{overallStats.bookPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#F4F4F3] dark:bg-[#252524] rounded overflow-hidden">
              <div className="h-full bg-black dark:bg-[#ECECEC] transition-all duration-300" style={{ width: `${overallStats.bookPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#8E8E8D] mb-1 uppercase tracking-wider">
              <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Worksheets Complete</span>
              <span>{overallStats.wsPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#F4F4F3] dark:bg-[#252524] rounded overflow-hidden">
              <div className="h-full bg-black dark:bg-[#ECECEC] transition-all duration-300" style={{ width: `${overallStats.wsPct}%` }} />
            </div>
          </div>

          <div className="bg-[#F4F4F3] dark:bg-neutral-950/40 rounded p-3 border border-[#EBEBE9] dark:border-neutral-800/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#1A1A1A] dark:text-[#ECECEC] uppercase tracking-wider">
              <span>Overall Completion</span>
              <span className="text-xs font-extrabold">{overallStats.overallPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded mt-1.5 overflow-hidden">
              <div className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300" style={{ width: `${overallStats.overallPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse All buttons */}
      <div className="flex justify-end space-x-1.5">
        <button
          onClick={() => {
            const all: Record<string, boolean> = {};
            IPMAT_SYLLABUS.forEach(s => all[s.code] = true);
            setExpandedSections(all);
          }}
          className="text-[10px] font-bold text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer"
        >
          Expand All
        </button>
        <span className="text-[#EBEBE9] dark:text-[#252524] text-xs">•</span>
        <button
          onClick={() => setExpandedSections({})}
          className="text-[10px] font-bold text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-white cursor-pointer"
        >
          Collapse All
        </button>
      </div>

      {/* Accordion list */}
      <div className="space-y-3">
        {IPMAT_SYLLABUS.map(section => {
          const isOpen = expandedSections[section.code];
          const stats = calculateSectionStats(section.code);

          return (
            <div
              key={section.code}
              className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-lg shadow-xs overflow-hidden transition-all duration-150"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(section.code)}
                className="w-full px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-left hover:bg-[#F4F4F3]/30 dark:hover:bg-neutral-900/40 cursor-pointer border-b border-transparent data-[open=true]:border-[#EBEBE9] dark:data-[open=true]:border-[#252524]"
                data-open={isOpen}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="text-neutral-400">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-50 text-sm">
                      {section.title}
                    </h3>
                    <p className="text-[11px] text-[#8E8E8D] mt-0.5">
                      {stats.completedChapters} of {stats.totalChapters} chapters fully complete
                    </p>
                  </div>
                </div>

                {/* Section stats summary */}
                <div className="flex flex-wrap items-center gap-4 mt-2 sm:mt-0 text-[11px] text-[#8E8E8D]">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-neutral-400">Book</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.bookPct}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-neutral-400">Worksheet</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stats.wsPct}%</span>
                  </div>
                  <div className="bg-[#F4F4F3] dark:bg-neutral-850 px-2 py-1 rounded border border-[#EBEBE9] dark:border-neutral-850 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
                    {stats.overallPct}% Overall
                  </div>
                </div>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="divide-y divide-[#EBEBE9] dark:divide-[#252524]">
                  {/* Table headers */}
                  <div className="hidden sm:grid grid-cols-12 px-5 py-2 bg-[#F4F4F3]/30 dark:bg-neutral-950/20 text-[9px] uppercase font-bold text-[#8E8E8D] tracking-wider">
                    <div className="col-span-6">Chapter</div>
                    <div className="col-span-2 text-center">Book</div>
                    <div className="col-span-2 text-center">Worksheet</div>
                    <div className="col-span-2 text-right">Completion</div>
                  </div>

                  {section.chapters.map(chap => {
                    const { bookCompleted, worksheetCompleted } = getChapterProgress(chap.id);
                    
                    // calculate chapter completion %
                    let chapterPct = 0;
                    if (bookCompleted && worksheetCompleted) chapterPct = 100;
                    else if (bookCompleted || worksheetCompleted) chapterPct = 50;

                    return (
                      <div
                        key={chap.id}
                        className="grid grid-cols-1 sm:grid-cols-12 px-4 py-2.5 items-center hover:bg-[#F4F4F3]/10 dark:hover:bg-neutral-900/10 transition-colors"
                      >
                        {/* Chapter name */}
                        <div className="col-span-6 font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                          {chap.name}
                        </div>

                        {/* Book Checkbox */}
                        <div className="col-span-2 flex items-center justify-start sm:justify-center mt-2 sm:mt-0">
                          <button
                            onClick={() => handleCheckboxToggle(section.code, chap.id, 'book')}
                            className="flex items-center space-x-1.5 text-[11px] text-[#6B6B69] dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                          >
                            {bookCompleted ? (
                              <CheckSquare className="h-4 w-4 text-black dark:text-[#ECECEC]" />
                            ) : (
                              <Square className="h-4 w-4 text-neutral-300 dark:text-neutral-700" />
                            )}
                            <span className="sm:hidden font-semibold">Book</span>
                          </button>
                        </div>

                        {/* Worksheet Checkbox */}
                        <div className="col-span-2 flex items-center justify-start sm:justify-center mt-2 sm:mt-0">
                          <button
                            onClick={() => handleCheckboxToggle(section.code, chap.id, 'worksheet')}
                            className="flex items-center space-x-1.5 text-[11px] text-[#6B6B69] dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                          >
                            {worksheetCompleted ? (
                              <CheckSquare className="h-4 w-4 text-black dark:text-[#ECECEC]" />
                            ) : (
                              <Square className="h-4 w-4 text-neutral-300 dark:text-neutral-700" />
                            )}
                            <span className="sm:hidden font-semibold">Worksheet</span>
                          </button>
                        </div>

                        {/* Individual completion percentage */}
                        <div className="col-span-2 text-left sm:text-right mt-2 sm:mt-0">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            chapterPct === 100 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                              : chapterPct === 50 
                              ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' 
                              : 'bg-neutral-50 text-neutral-400 border-neutral-100 dark:bg-neutral-850 dark:text-neutral-500 dark:border-neutral-800'
                          }`}>
                            {chapterPct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
