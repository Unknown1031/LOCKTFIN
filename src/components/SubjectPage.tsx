import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Assignment } from '../types';
import { PRIORITY_COLORS } from '../lib/constants';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  CheckCircle, 
  AlertCircle,
  FolderPlus,
  ArrowUpDown,
  Filter,
  X,
  Eye,
  EyeOff,
  Briefcase
} from 'lucide-react';

const ASSIGN_TYPE_LABELS: Record<string, string> = {
  ia_draft: 'IA Draft',
  homework: 'School Homework',
  project: 'Project',
  test: 'Test',
  deadline: 'Submission Deadline'
};

const ASSIGN_TYPE_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  ia_draft: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200/50 dark:border-indigo-800/30' },
  homework: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200/50 dark:border-amber-800/30' },
  project: { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200/50 dark:border-sky-800/30' },
  test: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200/50 dark:border-rose-800/30' },
  deadline: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200/50 dark:border-purple-800/30' }
};

interface SubjectPageProps {
  subjectCode: string;
  subjectName: string;
}

export const SubjectPage: React.FC<SubjectPageProps> = ({ subjectCode, subjectName }) => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    subjects, 
    assignments, 
    addAssignment, 
    updateAssignment, 
    deleteAssignment 
  } = useApp();

  // Active workspace tab: Tasks vs Assignments
  const [activeTab, setActiveTab] = useState<'tasks' | 'assignments'>('tasks');

  // Focus Mode state (enabled by default)
  const [isFocusMode, setIsFocusMode] = useState(true);
  const [laterExpanded, setLaterExpanded] = useState(false);

  // Search, Sort, Filter state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // Task Dialog/Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Assignment Dialog/Form state
  const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignType, setAssignType] = useState<'ia_draft' | 'homework' | 'project' | 'test' | 'deadline'>('homework');

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Find cumulative study time for this subject
  const currentSubject = subjects.find(s => s.code === subjectCode);
  const studySeconds = currentSubject ? currentSubject.totalStudyTime : 0;

  const formatStudyTime = (totalSecs: number) => {
    if (totalSecs === 0) return '0 minutes';
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    
    let res = '';
    if (hours > 0) {
      res += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0 || hours === 0) {
      res += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return res.trim();
  };

  // Filter tasks belonging to this subject
  const subjectTasks = tasks.filter(t => t.subjectCode === subjectCode);

  // Filter & Search pending and completed tasks
  const applyFiltersAndSearch = (taskList: Task[]) => {
    return taskList
      .filter(t => {
        // Search filter
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            (t.description || '').toLowerCase().includes(search.toLowerCase());
        // Priority filter
        const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
        return matchSearch && matchPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else {
          // Priority sort: high -> medium -> low
          const priorityVal = { high: 3, medium: 2, low: 1 };
          return priorityVal[b.priority] - priorityVal[a.priority];
        }
      });
  };

  const pendingTasks = applyFiltersAndSearch(subjectTasks.filter(t => !t.completed));
  const completedTasks = applyFiltersAndSearch(subjectTasks.filter(t => t.completed));

  // Focus Mode grouping logic
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const overdueFocusTasks = pendingTasks.filter(t => t.dueDate < todayStr);
  const todayFocusTasks = pendingTasks.filter(t => t.dueDate === todayStr);
  const tomorrowFocusTasks = pendingTasks.filter(t => t.dueDate === tomorrowStr);
  const laterFocusTasks = pendingTasks.filter(t => t.dueDate > tomorrowStr);

  // Filter assignments belonging to this subject
  const subjectAssignments = assignments.filter(a => a.subjectCode === subjectCode);

  const applyAssignFiltersAndSearch = (assignList: Assignment[]) => {
    return assignList
      .filter(a => {
        const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                            (a.description || '').toLowerCase().includes(search.toLowerCase());
        return matchSearch;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const pendingAssignments = applyAssignFiltersAndSearch(subjectAssignments.filter(a => !a.completed));
  const completedAssignments = applyAssignFiltersAndSearch(subjectAssignments.filter(a => a.completed));

  const handleOpenAddForm = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTaskDueDate(tomorrow.toISOString().split('T')[0]);
    setTaskPriority('medium');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskDueDate(task.dueDate);
    setTaskPriority(task.priority);
    setIsFormOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) return;

    const taskData = {
      subjectCode,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      dueDate: taskDueDate,
      priority: taskPriority,
      completed: editingTask ? editingTask.completed : false,
    };

    try {
      if (editingTask && editingTask.id) {
        await updateTask(editingTask.id, taskData);
      } else {
        await addTask(taskData);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    if (!task.id) return;
    const completed = !task.completed;
    await updateTask(task.id, {
      completed,
      completedAt: completed ? new Date().toISOString() : undefined
    });
  };

  const handleDeleteTask = async (taskId?: string) => {
    if (!taskId) return;
    setConfirmModal({
      title: "Delete Task",
      message: "Are you sure you want to delete this task?",
      onConfirm: async () => {
        await deleteTask(taskId);
        setConfirmModal(null);
      }
    });
  };

  // Assignment handlers
  const handleOpenAddAssignForm = () => {
    setEditingAssignment(null);
    setAssignTitle('');
    setAssignDesc('');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setAssignDueDate(defaultDate.toISOString().split('T')[0]);
    setAssignType('homework');
    setIsAssignFormOpen(true);
  };

  const handleOpenEditAssignForm = (assign: Assignment) => {
    setEditingAssignment(assign);
    setAssignTitle(assign.title);
    setAssignDesc(assign.description || '');
    setAssignDueDate(assign.dueDate);
    setAssignType(assign.type);
    setIsAssignFormOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignDueDate) return;

    const assignData = {
      subjectCode,
      title: assignTitle.trim(),
      description: assignDesc.trim(),
      dueDate: assignDueDate,
      type: assignType,
      completed: editingAssignment ? editingAssignment.completed : false,
    };

    try {
      if (editingAssignment && editingAssignment.id) {
        await updateAssignment(editingAssignment.id, assignData);
      } else {
        await addAssignment(assignData);
      }
      setIsAssignFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompleteAssign = async (assign: Assignment) => {
    if (!assign.id) return;
    const completed = !assign.completed;
    await updateAssignment(assign.id, {
      completed,
      completedAt: completed ? new Date().toISOString() : undefined
    });
  };

  const handleDeleteAssignment = async (id?: string) => {
    if (!id) return;
    setConfirmModal({
      title: "Delete Assignment",
      message: "Are you sure you want to delete this assignment?",
      onConfirm: async () => {
        await deleteAssignment(id);
        setConfirmModal(null);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header Stat & Title Card */}
      <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider">
            Subject Workspace
          </span>
          <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-white mt-1">
            {subjectName}
          </h1>
        </div>
        <div className="bg-[#F4F4F3] dark:bg-neutral-950/40 border border-[#EBEBE9] dark:border-[#252524] rounded px-4 py-2 flex items-center gap-3 shrink-0">
          <Clock className="h-4 w-4 text-[#8E8E8D]" />
          <div>
            <p className="text-[9px] text-[#8E8E8D] dark:text-neutral-500 font-bold uppercase tracking-wider">Cumulative Study Time</p>
            <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#ECECEC] mt-0.5">
              {formatStudyTime(studySeconds)}
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Tab Switcher */}
      <div className="flex border-b border-[#EBEBE9] dark:border-[#252524]">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-black dark:border-white text-black dark:text-white font-bold'
              : 'border-transparent text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-[#ECECEC]'
          }`}
        >
          Study Tasks
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'assignments'
              ? 'border-black dark:border-white text-black dark:text-white font-bold'
              : 'border-transparent text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-[#ECECEC]'
          }`}
        >
          Assignments ({pendingAssignments.length})
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <>
          {/* Task Filters & Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-8 pr-8 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-[#151514] text-xs text-[#1A1A1A] dark:text-[#ECECEC] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')} 
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filters/Sort & Add Task button */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Focus Mode Toggle */}
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded text-xs transition-colors cursor-pointer ${
                  isFocusMode 
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold' 
                    : 'bg-[#F4F4F3] text-[#6B6B69] dark:bg-[#151514] dark:text-neutral-300'
                }`}
                title={isFocusMode ? "Disable Focus Mode" : "Enable Focus Mode"}
              >
                {isFocusMode ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>Focus Mode</span>
              </button>

              {/* Filter Priority */}
              <div className="flex items-center space-x-1.5 bg-[#F4F4F3] dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded px-2.5 py-1.5 text-xs text-[#6B6B69] dark:text-neutral-300">
                <Filter className="h-3 w-3 text-[#8E8E8D]" />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-transparent border-none text-[11px] focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Sort Control */}
              <div className="flex items-center space-x-1.5 bg-[#F4F4F3] dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded px-2.5 py-1.5 text-xs text-[#6B6B69] dark:text-neutral-300">
                <ArrowUpDown className="h-3 w-3 text-[#8E8E8D]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority')}
                  className="bg-transparent border-none text-[11px] focus:outline-none font-semibold cursor-pointer"
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>

              {/* Add Task button */}
              <button
                onClick={handleOpenAddForm}
                className="flex items-center space-x-1.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-semibold text-xs px-3 py-1.5 rounded transition-opacity cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Task List Grid/Layout */}
          <div className="space-y-6">
            {isFocusMode ? (
              /* Focus Mode Layout: Overdue, Today, Tomorrow, Later collapsible */
              <div className="space-y-6">
                {/* Overdue section */}
                {overdueFocusTasks.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-rose-500" />
                      Overdue Tasks ({overdueFocusTasks.length})
                    </h3>
                    <div className="space-y-1.5">
                      {overdueFocusTasks.map(task => renderTaskCard(task))}
                    </div>
                  </div>
                )}

                {/* Today section */}
                <div>
                  <h3 className="text-[10px] font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider mb-2 px-1">
                    Today ({todayFocusTasks.length})
                  </h3>
                  {todayFocusTasks.length === 0 ? (
                    <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl py-6 px-4 text-center">
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">Nothing due today. Everything is under control.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {todayFocusTasks.map(task => renderTaskCard(task))}
                    </div>
                  )}
                </div>

                {/* Tomorrow section */}
                <div>
                  <h3 className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
                    Tomorrow ({tomorrowFocusTasks.length})
                  </h3>
                  {tomorrowFocusTasks.length === 0 ? (
                    <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl py-6 px-4 text-center">
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Nothing tomorrow.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {tomorrowFocusTasks.map(task => renderTaskCard(task))}
                    </div>
                  )}
                </div>

                {/* Later collapsible section */}
                <div>
                  <button
                    onClick={() => setLaterExpanded(!laterExpanded)}
                    className="w-full flex items-center justify-between text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider mb-2 px-1 cursor-pointer"
                  >
                    <span>Later ({laterFocusTasks.length})</span>
                    {laterExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                  {laterExpanded && (
                    <div className="space-y-1.5 mt-1">
                      {laterFocusTasks.length === 0 ? (
                        <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl py-6 px-4 text-center">
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">No tasks scheduled for later.</p>
                        </div>
                      ) : (
                        laterFocusTasks.map(task => renderTaskCard(task))
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Flat List Layout */
              <div>
                <h3 className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
                  Pending Tasks ({pendingTasks.length})
                </h3>
                {pendingTasks.length === 0 ? (
                  <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl py-8 px-4 text-center">
                    <FolderPlus className="h-6 w-6 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-[#1A1A1A] dark:text-[#ECECEC]">No pending tasks</p>
                    <p className="text-[10px] text-[#8E8E8D] mt-0.5 max-w-[280px] mx-auto leading-relaxed">Get ahead! Add a study milestone, worksheet, or revision goal.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {pendingTasks.map(task => renderTaskCard(task))}
                  </div>
                )}
              </div>
            )}

            {/* Completed Section */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
                  Completed Tasks ({completedTasks.length})
                </h3>
                <div className="space-y-1.5">
                  {completedTasks.map(task => (
                    <div
                      key={task.id}
                      className="group bg-[#F4F4F3]/50 dark:bg-neutral-900/30 border border-[#EBEBE9] dark:border-[#252524] rounded-lg p-2.5 flex items-start space-x-3"
                    >
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className="mt-0.5 h-4 w-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 transition-all cursor-pointer text-emerald-600 dark:text-emerald-400"
                      >
                        <Check className="h-2.5 w-2.5" />
                      </button>

                      <div className="flex-1 min-w-0 opacity-60">
                        <h4 className="font-sans text-[#1A1A1A] dark:text-neutral-300 text-xs leading-snug truncate line-through">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[10px] text-[#8E8E8D] mt-0.5 truncate">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 transition-opacity">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-[#8E8E8D] hover:text-rose-650 rounded transition-colors cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Assignments View Tab */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                className="w-full pl-8 pr-8 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-[#151514] text-xs text-[#1A1A1A] dark:text-[#ECECEC] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')} 
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleOpenAddAssignForm}
              className="flex items-center space-x-1.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-semibold text-xs px-3 py-1.5 rounded transition-opacity cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Assignment</span>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
                Pending Assignments ({pendingAssignments.length})
              </h3>
              {pendingAssignments.length === 0 ? (
                <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl py-10 px-4 text-center">
                  <CheckCircle className="h-6 w-6 text-emerald-500/80 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#1A1A1A] dark:text-[#ECECEC]">No pending assignments</p>
                  <p className="text-[10px] text-[#8E8E8D] mt-0.5 max-w-[280px] mx-auto leading-relaxed">No active homework, IA drafts, or projects for {subjectName}.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {pendingAssignments.map(assign => {
                    const colorTheme = ASSIGN_TYPE_COLORS[assign.type] || { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-200' };
                    return (
                      <div
                        key={assign.id}
                        className="group bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] hover:border-neutral-400 dark:hover:border-neutral-600 rounded-lg p-3.5 flex items-start space-x-3.5 transition-colors duration-150"
                      >
                        <button
                          onClick={() => handleToggleCompleteAssign(assign)}
                          className="mt-0.5 h-4 w-4 rounded border border-[#EBEBE9] dark:border-[#252524] hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-[#F4F4F3] dark:hover:bg-neutral-850 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        >
                          <Check className="h-2.5 w-2.5 text-transparent group-hover:text-neutral-400" />
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border}`}>
                              {ASSIGN_TYPE_LABELS[assign.type]}
                            </span>
                            <div className="flex items-center text-[9px] text-[#8E8E8D] font-semibold">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>Due: {assign.dueDate}</span>
                            </div>
                          </div>

                          <h4 className="font-semibold text-[#1A1A1A] dark:text-[#ECECEC] text-xs leading-snug mt-2">
                            {assign.title}
                          </h4>

                          {assign.description && (
                            <p className="text-[11px] text-[#6B6B69] dark:text-neutral-400 mt-1 leading-relaxed break-words">
                              {assign.description}
                            </p>
                          )}
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 shrink-0 transition-opacity">
                          <button
                            onClick={() => handleOpenEditAssignForm(assign)}
                            className="p-1 text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-[#ECECEC] rounded hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Edit Assignment"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assign.id)}
                            className="p-1 text-[#8E8E8D] hover:text-rose-600 rounded hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Delete Assignment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {completedAssignments.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
                  Completed Assignments ({completedAssignments.length})
                </h3>
                <div className="space-y-1.5">
                  {completedAssignments.map(assign => (
                    <div
                      key={assign.id}
                      className="group bg-[#F4F4F3]/50 dark:bg-neutral-900/30 border border-[#EBEBE9] dark:border-[#252524] rounded-lg p-3 flex items-start space-x-3.5"
                    >
                      <button
                        onClick={() => handleToggleCompleteAssign(assign)}
                        className="mt-0.5 h-4 w-4 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 transition-all cursor-pointer text-emerald-600 dark:text-emerald-400"
                      >
                        <Check className="h-2.5 w-2.5" />
                      </button>

                      <div className="flex-1 min-w-0 opacity-60">
                        <span className="text-[9px] text-neutral-400 font-medium">
                          {ASSIGN_TYPE_LABELS[assign.type]} completed
                        </span>
                        <h4 className="font-semibold text-[#1A1A1A] dark:text-neutral-300 text-xs leading-snug truncate line-through mt-0.5">
                          {assign.title}
                        </h4>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 transition-opacity">
                        <button
                          onClick={() => handleDeleteAssignment(assign.id)}
                          className="p-1 text-[#8E8E8D] hover:text-rose-650 rounded transition-colors cursor-pointer"
                          title="Delete Assignment"
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
        </div>
      )}

      {/* Task Card helper renderer */}
      {isFormOpen && renderTaskForm()}
      {isAssignFormOpen && renderAssignForm()}

      {/* Custom Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/35 dark:bg-neutral-950/60 backdrop-blur-xs" onClick={() => setConfirmModal(null)} />
          <div className="relative w-full max-w-xs overflow-hidden rounded-xl bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] shadow-lg p-5 z-10">
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderTaskCard(task: Task) {
    const priorityStyle = PRIORITY_COLORS[task.priority];
    return (
      <div
        key={task.id}
        className="group bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] hover:border-neutral-400 dark:hover:border-neutral-600 rounded-lg p-3 flex items-start space-x-3 transition-colors duration-150"
      >
        {/* Checkbox button */}
        <button
          onClick={() => handleToggleComplete(task)}
          className="mt-0.5 h-4 w-4 rounded border border-[#EBEBE9] dark:border-[#252524] hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-[#F4F4F3] dark:hover:bg-neutral-850 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        >
          <Check className="h-2.5 w-2.5 text-transparent group-hover:text-neutral-400" />
        </button>

        {/* Task Title and Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-[#1A1A1A] dark:text-[#ECECEC] text-xs leading-snug truncate">
              {task.title}
            </h4>
            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${priorityStyle.bg} shrink-0`}>
              <span className={`h-1 w-1 rounded-full ${priorityStyle.dot}`} />
              <span className="capitalize">{task.priority}</span>
            </span>
          </div>
          
          {task.description && (
            <p className="text-[11px] text-[#6B6B69] dark:text-neutral-400 mt-1 leading-relaxed break-words">
              {task.description}
            </p>
          )}

          <div className="flex items-center space-x-3 mt-2 text-[10px] text-[#8E8E8D] font-medium">
            <div className="flex items-center space-x-1.5">
              <Calendar className="h-3 w-3" />
              <span>Due: {task.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Task Operations */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 shrink-0 transition-opacity">
          <button
            onClick={() => handleOpenEditForm(task)}
            className="p-1 text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-[#ECECEC] rounded hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Edit Task"
          >
            <Edit3 className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="p-1 text-[#8E8E8D] hover:text-rose-600 rounded hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  function renderTaskForm() {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[15vh]">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-neutral-900/35 dark:bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />

        {/* Dialog Container */}
        <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] shadow-lg p-5 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBEBE9] dark:border-[#252524]">
            <h3 className="font-bold text-[#1A1A1A] dark:text-white text-sm">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="p-1 text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-white rounded hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSaveTask} className="mt-3.5 space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Read Chapter 4 and solve worksheet"
                className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-2 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                Description <span className="text-neutral-400">(Optional)</span>
              </label>
              <textarea
                placeholder="Add details, links, or sub-tasks..."
                rows={2}
                className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-2 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-1.5 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Priority
                </label>
                <select
                  className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-1.5 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white cursor-pointer"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded text-xs font-semibold text-[#6B6B69] hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded text-xs font-semibold transition-opacity cursor-pointer"
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderAssignForm() {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[15vh]">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-neutral-900/35 dark:bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsAssignFormOpen(false)} />

        {/* Dialog Container */}
        <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] shadow-lg p-5 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBEBE9] dark:border-[#252524]">
            <h3 className="font-bold text-[#1A1A1A] dark:text-white text-sm">
              {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
            </h3>
            <button 
              onClick={() => setIsAssignFormOpen(false)}
              className="p-1 text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-white rounded hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSaveAssignment} className="mt-3.5 space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IA draft revision"
                className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-2 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                Description <span className="text-neutral-400">(Optional)</span>
              </label>
              <textarea
                placeholder="Add details, criteria or checklists..."
                rows={2}
                className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-2 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                value={assignDesc}
                onChange={(e) => setAssignDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-1.5 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Type
                </label>
                <select
                  className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-1.5 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white cursor-pointer"
                  value={assignType}
                  onChange={(e) => setAssignType(e.target.value as any)}
                >
                  {Object.entries(ASSIGN_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAssignFormOpen(false)}
                className="px-3 py-1.5 border border-[#EBEBE9] dark:border-[#252524] rounded text-xs font-semibold text-[#6B6B69] hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded text-xs font-semibold transition-opacity cursor-pointer"
              >
                {editingAssignment ? 'Save Changes' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};
