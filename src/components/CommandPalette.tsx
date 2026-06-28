import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Command, BookOpen, Clock, BarChart2, Settings, Plus, Play, Sun, Moon, Sparkles } from 'lucide-react';
import { IB_SUBJECTS } from '../lib/constants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setCurrentPage: (page: string) => void;
  onAddTaskClick: () => void;
  onStartTimerClick: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setCurrentPage,
  onAddTaskClick,
  onStartTimerClick
}) => {
  const { updateTheme, subjects } = useApp();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items = [
    // Navigation
    ...IB_SUBJECTS.map(s => ({
      id: `nav-${s.code}`,
      title: `Go to ${s.name}`,
      category: 'Navigation',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => {
        setCurrentPage(s.code);
        onClose();
      }
    })),
    {
      id: 'nav-timer',
      title: 'Go to Study Timer',
      category: 'Navigation',
      icon: <Clock className="h-4 w-4" />,
      action: () => {
        setCurrentPage('timer');
        onClose();
      }
    },
    {
      id: 'nav-analytics',
      title: 'Go to Analytics',
      category: 'Navigation',
      icon: <BarChart2 className="h-4 w-4" />,
      action: () => {
        setCurrentPage('analytics');
        onClose();
      }
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      category: 'Navigation',
      icon: <Settings className="h-4 w-4" />,
      action: () => {
        setCurrentPage('settings');
        onClose();
      }
    },
    // Quick Actions
    {
      id: 'action-add-task',
      title: 'Create a New Task',
      category: 'Actions',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        onClose();
        setTimeout(onAddTaskClick, 100);
      }
    },
    {
      id: 'action-start-timer',
      title: 'Start Study Timer Session',
      category: 'Actions',
      icon: <Play className="h-4 w-4" />,
      action: () => {
        onClose();
        setTimeout(onStartTimerClick, 100);
      }
    },
    // Themes
    {
      id: 'theme-light',
      title: 'Switch to Light Theme',
      category: 'Preferences',
      icon: <Sun className="h-4 w-4" />,
      action: () => {
        updateTheme('light');
        onClose();
      }
    },
    {
      id: 'theme-dark',
      title: 'Switch to Dark Theme',
      category: 'Preferences',
      icon: <Moon className="h-4 w-4" />,
      action: () => {
        updateTheme('dark');
        onClose();
      }
    }
  ];

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[10vh]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/40 dark:bg-neutral-950/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-auto max-w-lg overflow-hidden rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[60vh] transition-all">
        {/* Search Input */}
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
          <Search className="h-5 w-5 text-neutral-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none text-sm"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-md ml-2 border border-neutral-200 dark:border-neutral-700">
            ESC
          </span>
        </div>

        {/* List of items */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-400">
              No commands found.
            </div>
          ) : (
            // Group by category
            Object.entries(
              filteredItems.reduce((acc, item) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
              }, {} as Record<string, typeof filteredItems>)
            ).map(([category, catItems]) => (
              <div key={category}>
                <div className="px-3 py-1.5 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {category}
                </div>
                {catItems.map((item) => {
                  const globalIndex = filteredItems.findIndex(fi => fi.id === item.id);
                  const isSelected = globalIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                        isSelected 
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50' 
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className={`mr-3 ${isSelected ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-400'}`}>
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.title}</span>
                      {isSelected && (
                        <span className="text-xs text-neutral-400 flex items-center">
                          Select <Command className="h-3 w-3 ml-1" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 px-4 py-2 flex items-center justify-between text-xs text-neutral-400 select-none">
          <div className="flex items-center space-x-2">
            <span>↑↓ to navigate</span>
            <span>•</span>
            <span>Enter to select</span>
          </div>
          <div>LOCKTFIN Commands</div>
        </div>
      </div>
    </div>
  );
};
