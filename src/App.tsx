import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './components/DashboardPage';
import { SubjectPage } from './components/SubjectPage';
import { AssignmentsPage } from './components/AssignmentsPage';
import { IpmatPage } from './components/IpmatPage';
import { TimerPage } from './components/TimerPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { SettingsPage } from './components/SettingsPage';
import { SUBJECT_MAP } from './lib/constants';
import { testConnection } from './lib/firebase';
import { Loader2 } from 'lucide-react';

function Dashboard() {
  const { user, authLoading, settings } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Sync theme preference on load/change
  useEffect(() => {
    if (!settings) return;
    const root = window.document.documentElement;
    const theme = settings.theme;
    
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  // Test database connection once
  useEffect(() => {
    testConnection();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
        <p className="text-xs text-neutral-400 font-medium">Restoring student focus session...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Helper trigger to delegate "Add Task" command palette request
  const handleAddTaskClick = () => {
    // Navigate to mathematics by default, which has task creations
    setCurrentPage('math');
  };

  const handleStartTimerClick = () => {
    setCurrentPage('timer');
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage setCurrentPage={setCurrentPage} />;
      case 'math':
      case 'eco':
      case 'bm':
      case 'eng':
      case 'hindi':
      case 'ess':
        return (
          <SubjectPage 
            key={currentPage} 
            subjectCode={currentPage} 
            subjectName={SUBJECT_MAP[currentPage]} 
          />
        );
      case 'assignments':
        return <AssignmentsPage />;
      case 'ipmat':
        return <IpmatPage />;
      case 'timer':
        return <TimerPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <AppLayout 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage}
      onAddTaskClick={handleAddTaskClick}
      onStartTimerClick={handleStartTimerClick}
    >
      {renderPageContent()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
