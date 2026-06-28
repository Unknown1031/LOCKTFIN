import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sun, 
  Moon, 
  Monitor, 
  LogOut, 
  Trash2, 
  Download, 
  Upload, 
  Settings as SettingsIcon, 
  User, 
  ShieldAlert, 
  Check, 
  Copy, 
  FileJson
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    user, 
    logout, 
    settings, 
    updateTheme, 
    exportUserData, 
    importUserData, 
    deleteUserAccount 
  } = useApp();

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(settings?.theme || 'system');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setThemeMode(theme);
    await updateTheme(theme);
    
    // Apply theme immediately
    const root = window.document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleExport = async () => {
    try {
      const dataStr = await exportUserData();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `locktfin-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err: any) {
      alert("Failed to export data: " + err.message);
    }
  };

  const handleCopyBackup = async () => {
    try {
      const dataStr = await exportUserData();
      await navigator.clipboard.writeText(dataStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      alert("Failed to copy: " + err.message);
    }
  };

  const handleImportFile = async (file: File) => {
    setImportStatus({ type: 'loading' });
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        await importUserData(text);
        setImportStatus({ type: 'success', message: "Data imported successfully! Your dashboard has updated." });
        setTimeout(() => setImportStatus({ type: 'idle' }), 5000);
      } catch (err: any) {
        setImportStatus({ type: 'error', message: "Invalid backup file: " + err.message });
      }
    };
    reader.onerror = () => {
      setImportStatus({ type: 'error', message: "Error reading file." });
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImportFile(files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImportFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE MY WORKSPACE") {
      alert("Please type 'DELETE MY WORKSPACE' exactly to confirm.");
      return;
    }

    try {
      await deleteUserAccount();
      alert("Your account and all associated study data have been permanently deleted.");
    } catch (err: any) {
      alert("Failed to delete account. You may need to log in again to perform this sensitive operation.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div>
        <span className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider">
          User Settings
        </span>
        <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-white mt-1">
          Settings & Preferences
        </h1>
        <p className="text-[11px] text-[#8E8E8D] mt-0.5">
          Configure visual themes, data replication backups, and account deletion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left Side: Theme Options */}
        <div className="md:col-span-1 space-y-5">
          <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider flex items-center">
              <Sun className="h-4 w-4 mr-2" /> Theme Customization
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded border text-xs transition-all cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-black text-white border-black dark:bg-[#ECECEC] dark:text-black dark:border-[#ECECEC] font-bold'
                    : 'bg-white text-neutral-700 border-[#EBEBE9] hover:bg-[#F4F4F3] dark:bg-[#151514] dark:text-neutral-300 dark:border-[#252524] dark:hover:bg-neutral-800'
                }`}
              >
                <span className="flex items-center"><Sun className="h-3.5 w-3.5 mr-2" /> Light Mode</span>
                {themeMode === 'light' && <Check className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded border text-xs transition-all cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-black text-white border-black dark:bg-[#ECECEC] dark:text-black dark:border-[#ECECEC] font-bold'
                    : 'bg-white text-neutral-700 border-[#EBEBE9] hover:bg-[#F4F4F3] dark:bg-[#151514] dark:text-neutral-300 dark:border-[#252524] dark:hover:bg-neutral-800'
                }`}
              >
                <span className="flex items-center"><Moon className="h-3.5 w-3.5 mr-2" /> Dark Mode</span>
                {themeMode === 'dark' && <Check className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={() => handleThemeChange('system')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded border text-xs transition-all cursor-pointer ${
                  themeMode === 'system'
                    ? 'bg-black text-white border-black dark:bg-[#ECECEC] dark:text-black dark:border-[#ECECEC] font-bold'
                    : 'bg-white text-neutral-700 border-[#EBEBE9] hover:bg-[#F4F4F3] dark:bg-[#151514] dark:text-neutral-300 dark:border-[#252524] dark:hover:bg-neutral-800'
                }`}
              >
                <span className="flex items-center"><Monitor className="h-3.5 w-3.5 mr-2" /> System Defaults</span>
                {themeMode === 'system' && <Check className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider flex items-center">
              <User className="h-4 w-4 mr-2" /> Student Account
            </h3>
            <div className="text-xs text-[#6B6B69] dark:text-neutral-400 space-y-1 truncate">
              <p className="font-bold text-[#1A1A1A] dark:text-white">{user?.displayName || 'Student'}</p>
              <p className="text-[11px] font-medium">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full mt-2 flex items-center justify-center space-x-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50/50 dark:border-rose-950/45 dark:text-rose-400 dark:hover:bg-rose-950/20 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Right Side: Data Backup Replications */}
        <div className="md:col-span-2 space-y-5">
          {/* Export / Import Section */}
          <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-5 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white flex items-center">
                <FileJson className="h-4 w-4 mr-2 text-[#8E8E8D]" /> Database Portability
              </h3>
              <p className="text-[11px] text-[#8E8E8D] mt-0.5 leading-normal">
                Your study data remains stored permanently in Cloud Firestore. Download a standard JSON replication file to back up or restore your study logs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export Container */}
              <div className="border border-[#EBEBE9] dark:border-[#252524] rounded-lg p-4 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white">Export Backup</h4>
                  <p className="text-[11px] text-[#8E8E8D] mt-1 leading-normal">Save all focus histories, milestones, and syllabus checkboxes into a single portability file.</p>
                </div>
                <div className="flex space-x-1.5">
                  <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded text-xs font-semibold cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={handleCopyBackup}
                    className="p-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 text-[#8E8E8D] transition-all cursor-pointer"
                    title="Copy Backup to Clipboard"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Import Container (Drag & Drop) */}
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={triggerFileInput}
                className={`border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-colors ${
                  isDragOver 
                    ? 'border-black bg-neutral-50 dark:border-[#ECECEC] dark:bg-neutral-800/30' 
                    : 'border-[#EBEBE9] dark:border-[#252524] hover:border-neutral-400 dark:hover:border-neutral-700'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onFileChange} 
                  accept=".json" 
                  className="hidden" 
                />
                <Upload className="h-5 w-5 text-neutral-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white">Import / Restore</h4>
                  <p className="text-[10px] text-[#8E8E8D] mt-0.5 leading-normal">Drag and drop export JSON, or click to upload.</p>
                </div>
              </div>
            </div>

            {/* Import Status Messages */}
            {importStatus.type !== 'idle' && (
              <div className={`p-2.5 rounded border text-[11px] font-medium ${
                importStatus.type === 'loading'
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-600'
                  : importStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                  : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
              }`}>
                {importStatus.type === 'loading' && "Importing and parsing backup data..."}
                {importStatus.type === 'success' && importStatus.message}
                {importStatus.type === 'error' && importStatus.message}
              </div>
            )}
          </div>

          {/* Delete Account Warning Stage */}
          <div className="bg-rose-50/20 dark:bg-rose-950/5 border border-rose-200/40 dark:border-rose-800/20 rounded-xl p-5 space-y-3.5">
            <div className="flex items-start space-x-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                  Danger: Delete Workspace
                </h3>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/70 mt-1 leading-normal">
                  This action is permanent and completely irreversible. It will instantly delete your user record and purge all associated subjects, study sessions, milestone checklists, and progress states from Cloud Firestore.
                </p>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Begin Account Purge Flow</span>
              </button>
            ) : (
              <div className="space-y-2.5 pt-3 border-t border-rose-200/20">
                <p className="text-[11px] font-bold text-rose-800 dark:text-rose-400">
                  Type <span className="font-mono bg-rose-100 dark:bg-rose-900/40 px-1 py-0.5 rounded">DELETE MY WORKSPACE</span> below to confirm.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-2.5 py-1.5 border border-rose-300 dark:border-rose-800 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-[#ECECEC] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs"
                    placeholder="DELETE MY WORKSPACE"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                  />
                  <button
                    onClick={handleDeleteAccount}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Purge
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInput('');
                    }}
                    className="px-2.5 py-1.5 border border-[#EBEBE9] dark:border-[#252524] text-neutral-600 dark:text-neutral-300 hover:bg-[#F4F4F3] rounded text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
