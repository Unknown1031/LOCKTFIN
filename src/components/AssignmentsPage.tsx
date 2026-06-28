import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Assignment } from '../types';
import { IB_SUBJECTS, SUBJECT_MAP } from '../lib/constants';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  Calendar, 
  Bookmark, 
  Filter, 
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  ia_draft: 'IA Draft',
  homework: 'School Homework',
  project: 'Project',
  test: 'Test',
  deadline: 'Submission Deadline'
};

const TYPE_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  ia_draft: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200/50 dark:border-indigo-800/30' },
  homework: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200/50 dark:border-amber-800/30' },
  project: { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200/50 dark:border-sky-800/30' },
  test: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200/50 dark:border-rose-800/30' },
  deadline: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200/50 dark:border-purple-800/30' }
};

export const AssignmentsPage: React.FC = () => {
  const { assignments, addAssignment, updateAssignment, deleteAssignment } = useApp();

  // Search, Subject Filter, Type Filter states
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignSubject, setAssignSubject] = useState('math');
  const [assignType, setAssignType] = useState<'ia_draft' | 'homework' | 'project' | 'test' | 'deadline'>('homework');

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const applyFiltersAndSearch = (list: Assignment[]) => {
    return list
      .filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                              (a.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesSubject = filterSubject === 'all' || a.subjectCode === filterSubject;
        const matchesType = filterType === 'all' || a.type === filterType;
        return matchesSearch && matchesSubject && matchesType;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const pendingAssignments = applyFiltersAndSearch(assignments.filter(a => !a.completed));
  const completedAssignments = applyFiltersAndSearch(assignments.filter(a => a.completed));

  const handleOpenAddForm = () => {
    setEditingAssignment(null);
    setAssignTitle('');
    setAssignDesc('');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7); // Default due in 1 week
    setAssignDueDate(defaultDate.toISOString().split('T')[0]);
    setAssignSubject('math');
    setAssignType('homework');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (assign: Assignment) => {
    setEditingAssignment(assign);
    setAssignTitle(assign.title);
    setAssignDesc(assign.description || '');
    setAssignDueDate(assign.dueDate);
    setAssignSubject(assign.subjectCode);
    setAssignType(assign.type);
    setIsFormOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignDueDate) return;

    const data = {
      subjectCode: assignSubject,
      title: assignTitle.trim(),
      description: assignDesc.trim(),
      dueDate: assignDueDate,
      type: assignType,
      completed: editingAssignment ? editingAssignment.completed : false
    };

    try {
      if (editingAssignment?.id) {
        await updateAssignment(editingAssignment.id, data);
      } else {
        await addAssignment(data);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (assign: Assignment) => {
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
      {/* Header */}
      <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-[#F4F4F3] dark:bg-neutral-800 rounded text-neutral-850 dark:text-neutral-200">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider">
              Assignments Workspace
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-white mt-1 leading-none">
              Combined Assignments
            </h1>
          </div>
        </div>
        <div className="bg-[#F4F4F3] dark:bg-neutral-950/40 border border-[#EBEBE9] dark:border-[#252524] rounded px-4 py-2 text-center shrink-0">
          <p className="text-[9px] text-[#8E8E8D] dark:text-neutral-500 font-bold uppercase tracking-wider">Long-Term Assignments</p>
          <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#ECECEC] mt-0.5">
            {assignments.filter(a => !a.completed).length} pending
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
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

        {/* Filters and Add button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Subject */}
          <div className="flex items-center space-x-1.5 bg-[#F4F4F3] dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded px-2.5 py-1.5 text-xs text-[#6B6B69] dark:text-neutral-300">
            <Filter className="h-3 w-3 text-[#8E8E8D]" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="bg-transparent border-none text-[11px] focus:outline-none font-semibold cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {IB_SUBJECTS.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Type */}
          <div className="flex items-center space-x-1.5 bg-[#F4F4F3] dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded px-2.5 py-1.5 text-xs text-[#6B6B69] dark:text-neutral-300">
            <Filter className="h-3 w-3 text-[#8E8E8D]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-[11px] focus:outline-none font-semibold cursor-pointer"
            >
              <option value="all">All Types</option>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Add button */}
          <button
            onClick={handleOpenAddForm}
            className="flex items-center space-x-1.5 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 font-semibold text-xs px-3 py-1.5 rounded transition-opacity cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Assignment Lists */}
      <div className="space-y-6">
        {/* Pending Assignments */}
        <div>
          <h3 className="text-[10px] font-bold text-[#8E8E8D] dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
            Pending Assignments ({pendingAssignments.length})
          </h3>

          {pendingAssignments.length === 0 ? (
            <div className="bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] rounded-xl py-10 px-4 text-center">
              <CheckCircle className="h-6 w-6 text-emerald-500/80 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#1A1A1A] dark:text-[#ECECEC]">All clear! No pending assignments.</p>
              <p className="text-[10px] text-[#8E8E8D] mt-0.5 max-w-[280px] mx-auto leading-relaxed">Long-term academic projects and drafts are fully sorted.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingAssignments.map(assign => {
                const colorTheme = TYPE_COLORS[assign.type] || { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-200' };
                return (
                  <div
                    key={assign.id}
                    className="group bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] hover:border-neutral-400 dark:hover:border-neutral-600 rounded-lg p-4 flex items-start space-x-3.5 transition-colors duration-150"
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(assign)}
                      className="mt-0.5 h-4 w-4 rounded border border-[#EBEBE9] dark:border-[#252524] hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-[#F4F4F3] dark:hover:bg-neutral-850 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      <Check className="h-2.5 w-2.5 text-transparent group-hover:text-neutral-400" />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-300">
                            {SUBJECT_MAP[assign.subjectCode] || assign.subjectCode}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border}`}>
                            {TYPE_LABELS[assign.type]}
                          </span>
                        </div>
                        <div className="flex items-center text-[10px] text-neutral-500 font-medium">
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

                    {/* Operations */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 shrink-0 transition-opacity">
                      <button
                        onClick={() => handleOpenEditForm(assign)}
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

        {/* Completed Assignments */}
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
                    onClick={() => handleToggleComplete(assign)}
                    className="mt-0.5 h-4 w-4 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 transition-all cursor-pointer text-emerald-600 dark:text-emerald-400"
                  >
                    <Check className="h-2.5 w-2.5" />
                  </button>

                  <div className="flex-1 min-w-0 opacity-60">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500">
                        {SUBJECT_MAP[assign.subjectCode] || assign.subjectCode}
                      </span>
                      <span className="text-[9px] text-neutral-400 font-medium">
                        Completed
                      </span>
                    </div>
                    <h4 className="font-semibold text-[#1A1A1A] dark:text-neutral-300 text-xs leading-snug truncate line-through mt-1">
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

      {/* Add / Edit Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[15vh]">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-neutral-900/35 dark:bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />

          {/* Dialog Container */}
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl bg-white dark:bg-[#151514] border border-[#EBEBE9] dark:border-[#252524] shadow-lg p-5 transition-all animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBEBE9] dark:border-[#252524]">
              <h3 className="font-bold text-[#1A1A1A] dark:text-white text-sm">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-[#8E8E8D] hover:text-[#1A1A1A] dark:hover:text-white rounded hover:bg-[#F4F4F3] dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="mt-3.5 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Subject
                </label>
                <select
                  className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-1.5 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white cursor-pointer"
                  value={assignSubject}
                  onChange={(e) => setAssignSubject(e.target.value)}
                >
                  {IB_SUBJECTS.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E8E8D] uppercase tracking-wider">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IA Final Draft Revision"
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
                  placeholder="Add details, links, or task criteria..."
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
                    Assignment Type
                  </label>
                  <select
                    className="w-full mt-1 border border-[#EBEBE9] dark:border-[#252524] rounded bg-white dark:bg-neutral-950 p-1.5 text-xs text-[#1A1A1A] dark:text-[#ECECEC] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white cursor-pointer"
                    value={assignType}
                    onChange={(e) => setAssignType(e.target.value as any)}
                  >
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
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
                  {editingAssignment ? 'Save Changes' : 'Create Assignment'}
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
