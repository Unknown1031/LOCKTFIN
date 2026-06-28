import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  googleProvider,
  auth,
  db
} from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { Subject, Task, Assignment, StudySession, IpmatProgress, Settings } from '../types';
import { IB_SUBJECTS, IPMAT_SYLLABUS } from '../lib/constants';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  subjects: Subject[];
  tasks: Task[];
  assignments: Assignment[];
  studySessions: StudySession[];
  ipmatProgress: IpmatProgress[];
  settings: Settings | null;
  
  // Auth actions
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Subject actions
  updateSubjectTime: (subjectCode: string, secondsToAdd: number) => Promise<void>;
  
  // Task actions
  addTask: (task: Omit<Task, 'userId' | 'createdAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Assignment actions
  addAssignment: (assignment: Omit<Assignment, 'userId' | 'createdAt'>) => Promise<void>;
  updateAssignment: (assignmentId: string, updates: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
  
  // Study Session actions
  addStudySession: (session: Omit<StudySession, 'userId' | 'createdAt'>) => Promise<void>;
  deleteStudySession: (sessionId: string) => Promise<void>;
  
  // IPMAT progress actions
  updateIpmatChapter: (sectionCode: string, chapterId: string, bookCompleted: boolean, worksheetCompleted: boolean) => Promise<void>;
  
  // Settings actions
  updateTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  exportUserData: () => Promise<string>;
  importUserData: (jsonData: string) => Promise<void>;
  deleteUserAccount: () => Promise<void>;

  // Timer states
  activeTimer: {
    isRunning: boolean;
    startTime: number | null; // Timestamp
    subjectCode: string;
    sessionName: string;
    accumulatedSeconds: number;
    timerType?: 'stopwatch' | 'countdown';
    durationSeconds?: number;
  } | null;
  startActiveTimer: (subjectCode: string, sessionName: string, timerType?: 'stopwatch' | 'countdown', durationSeconds?: number) => void;
  pauseActiveTimer: () => void;
  resumeActiveTimer: () => void;
  stopActiveTimer: () => void;
  saveActiveTimerSeconds: (seconds: number) => void;
  completeActiveTimer: () => Promise<void>;

  // Global Confetti Trigger
  triggerConfetti: () => void;
  confettiTrigger: number;
  completedSectionName: string | null;
  setCompletedSectionName: (name: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [ipmatProgress, setIpmatProgress] = useState<IpmatProgress[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [completedSectionName, setCompletedSectionName] = useState<string | null>(null);

  // Timer state
  const [activeTimer, setActiveTimer] = useState<{
    isRunning: boolean;
    startTime: number | null;
    subjectCode: string;
    sessionName: string;
    accumulatedSeconds: number;
    timerType?: 'stopwatch' | 'countdown';
    durationSeconds?: number;
  } | null>(null);

  const triggerConfetti = () => setConfettiTrigger(prev => prev + 1);

  // Listen to Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        // Reset states on logout
        setSubjects([]);
        setTasks([]);
        setAssignments([]);
        setStudySessions([]);
        setIpmatProgress([]);
        setSettings(null);
        setActiveTimer(null);
      }
    });
    return unsubscribe;
  }, []);

  // Sync Data on Auth Change
  useEffect(() => {
    if (!user) return;

    const userId = user.uid;

    // 1. Sync settings
    const settingsDocRef = doc(db, 'settings', userId);
    const unsubSettings = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as Settings);
      } else {
        // Create default settings
        const defaultSettings: Settings = { userId, theme: 'system' };
        setDoc(settingsDocRef, defaultSettings);
        setSettings(defaultSettings);
      }
    });

    // 2. Sync subjects
    const subjectsQuery = query(collection(db, 'subjects'), where('userId', '==', userId));
    const unsubSubjects = onSnapshot(subjectsQuery, (querySnap) => {
      const list: Subject[] = [];
      querySnap.forEach((doc) => {
        list.push(doc.data() as Subject);
      });
      
      // If subjects don't exist in Firestore, initialize them
      if (list.length === 0) {
        IB_SUBJECTS.forEach((subj) => {
          const sRef = doc(db, 'subjects', `${userId}_${subj.code}`);
          setDoc(sRef, {
            userId,
            code: subj.code,
            name: subj.name,
            totalStudyTime: 0
          });
        });
      } else {
        setSubjects(list);
      }
    });

    // 3. Sync Tasks
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', userId));
    const unsubTasks = onSnapshot(tasksQuery, (querySnap) => {
      const list: Task[] = [];
      querySnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      setTasks(list);
    });

    // 3b. Sync Assignments
    const assignmentsQuery = query(collection(db, 'assignments'), where('userId', '==', userId));
    const unsubAssignments = onSnapshot(assignmentsQuery, (querySnap) => {
      const list: Assignment[] = [];
      querySnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Assignment);
      });
      setAssignments(list);
    });

    // 4. Sync Study Sessions
    const sessionsQuery = query(collection(db, 'study_sessions'), where('userId', '==', userId));
    const unsubSessions = onSnapshot(sessionsQuery, (querySnap) => {
      const list: StudySession[] = [];
      querySnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as StudySession);
      });
      setStudySessions(list);
    });

    // 5. Sync IPMAT Progress
    const ipmatQuery = query(collection(db, 'ipmat_progress'), where('userId', '==', userId));
    const unsubIpmat = onSnapshot(ipmatQuery, (querySnap) => {
      const list: IpmatProgress[] = [];
      querySnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as IpmatProgress);
      });
      setIpmatProgress(list);
    });

    return () => {
      unsubSettings();
      unsubSubjects();
      unsubTasks();
      unsubAssignments();
      unsubSessions();
      unsubIpmat();
    };
  }, [user]);

  // Handle active timer local recovery
  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`timer_${user.uid}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // If it was running, calculate elapsed time since start
        if (parsed.isRunning && parsed.startTime) {
          const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
          parsed.accumulatedSeconds += elapsed;
          parsed.startTime = Date.now(); // reset start to now
        }
        setActiveTimer(parsed);
      } catch (e) {
        console.error("Failed to parse stored timer", e);
      }
    }
  }, [user]);

  // Persist timer states on change
  useEffect(() => {
    if (!user) return;
    if (activeTimer) {
      localStorage.setItem(`timer_${user.uid}`, JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem(`timer_${user.uid}`);
    }
  }, [activeTimer, user]);

  // Periodically update active timer accumulatedSeconds if it's running (auto-save style)
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return;
    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev || !prev.isRunning || !prev.startTime) return prev;
        const now = Date.now();
        const elapsed = Math.floor((now - prev.startTime) / 1000);
        return {
          ...prev,
          startTime: now,
          accumulatedSeconds: prev.accumulatedSeconds + elapsed
        };
      });
    }, 5000); // Save state every 5 seconds
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Auth Operations
  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      // Create user document
      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name,
        createdAt: new Date().toISOString()
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Subject Cumulative Update
  const updateSubjectTime = async (subjectCode: string, secondsToAdd: number) => {
    if (!user) return;
    const sRef = doc(db, 'subjects', `${user.uid}_${subjectCode}`);
    const currentSubject = subjects.find(s => s.code === subjectCode);
    const currentTime = currentSubject ? currentSubject.totalStudyTime : 0;
    await updateDoc(sRef, {
      totalStudyTime: currentTime + secondsToAdd
    });
  };

  // Task Operations
  const addTask = async (task: Omit<Task, 'userId' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), {
      ...task,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    const tRef = doc(db, 'tasks', taskId);
    await updateDoc(tRef, updates);
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const tRef = doc(db, 'tasks', taskId);
    await deleteDoc(tRef);
  };

  // Assignment Operations
  const addAssignment = async (assignment: Omit<Assignment, 'userId' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'assignments'), {
      ...assignment,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
  };

  const updateAssignment = async (assignmentId: string, updates: Partial<Assignment>) => {
    if (!user) return;
    const aRef = doc(db, 'assignments', assignmentId);
    await updateDoc(aRef, updates);
  };

  const deleteAssignment = async (assignmentId: string) => {
    if (!user) return;
    const aRef = doc(db, 'assignments', assignmentId);
    await deleteDoc(aRef);
  };

  // Study Session Operations
  const addStudySession = async (session: Omit<StudySession, 'userId' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, 'study_sessions'), {
      ...session,
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
    // Update the subject's total study time
    await updateSubjectTime(session.subject, session.duration);
  };

  const deleteStudySession = async (sessionId: string) => {
    if (!user) return;
    try {
      const session = studySessions.find(s => s.id === sessionId);
      if (!session) return;
      
      const sRef = doc(db, 'subjects', `${user.uid}_${session.subject}`);
      const currentSubject = subjects.find(s => s.code === session.subject);
      if (currentSubject) {
        try {
          await updateDoc(sRef, {
            totalStudyTime: Math.max(0, currentSubject.totalStudyTime - session.duration)
          });
        } catch (subErr) {
          console.error("Failed to update subject time during deletion:", subErr);
        }
      }
      
      const tRef = doc(db, 'study_sessions', sessionId);
      await deleteDoc(tRef);
    } catch (err) {
      console.error("Failed to delete study session:", err);
    }
  };

  // IPMAT progress operations
  const updateIpmatChapter = async (
    sectionCode: string, 
    chapterId: string, 
    bookCompleted: boolean, 
    worksheetCompleted: boolean
  ) => {
    if (!user) return;
    const docId = `${user.uid}_${chapterId}`;
    const pRef = doc(db, 'ipmat_progress', docId);
    
    await setDoc(pRef, {
      userId: user.uid,
      sectionCode,
      chapterId,
      bookCompleted,
      worksheetCompleted
    });

    // Check if the entire section has reached 100% completion
    const section = IPMAT_SYLLABUS.find(s => s.code === sectionCode);
    if (section) {
      const otherChaptersComplete = section.chapters
        .filter(chap => chap.id !== chapterId)
        .every(chap => {
          const prog = ipmatProgress.find(p => p.chapterId === chap.id);
          return prog && prog.bookCompleted && prog.worksheetCompleted;
        });

      const thisChapterCompleteNow = bookCompleted && worksheetCompleted;

      const wasAlreadyFullyComplete = section.chapters.every(chap => {
        const prog = ipmatProgress.find(p => p.chapterId === chap.id);
        return prog && prog.bookCompleted && prog.worksheetCompleted;
      });

      if (!wasAlreadyFullyComplete && otherChaptersComplete && thisChapterCompleteNow) {
        setCompletedSectionName(section.title);
      }
    }
  };

  // Settings operations
  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    if (!user) return;
    const settingsDocRef = doc(db, 'settings', user.uid);
    await setDoc(settingsDocRef, { userId: user.uid, theme });
  };

  // Timer Actions
  const startActiveTimer = (
    subjectCode: string, 
    sessionName: string, 
    timerType: 'stopwatch' | 'countdown' = 'stopwatch', 
    durationSeconds: number = 0
  ) => {
    setActiveTimer({
      isRunning: true,
      startTime: Date.now(),
      subjectCode,
      sessionName,
      accumulatedSeconds: 0,
      timerType,
      durationSeconds
    });
  };

  const pauseActiveTimer = () => {
    setActiveTimer(prev => {
      if (!prev || !prev.isRunning || !prev.startTime) return prev;
      return {
        ...prev,
        isRunning: false,
        accumulatedSeconds: prev.accumulatedSeconds + Math.floor((Date.now() - prev.startTime) / 1000),
        startTime: null
      };
    });
  };

  const resumeActiveTimer = () => {
    setActiveTimer(prev => {
      if (!prev || prev.isRunning) return prev;
      return {
        ...prev,
        isRunning: true,
        startTime: Date.now()
      };
    });
  };

  const stopActiveTimer = () => {
    setActiveTimer(null);
  };

  const saveActiveTimerSeconds = (seconds: number) => {
    setActiveTimer(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        accumulatedSeconds: seconds
      };
    });
  };

  const completeActiveTimer = async () => {
    if (!user || !activeTimer) return;
    let finalSeconds = activeTimer.accumulatedSeconds;
    if (activeTimer.isRunning && activeTimer.startTime) {
      finalSeconds += Math.floor((Date.now() - activeTimer.startTime) / 1000);
    }
    
    if (finalSeconds > 0) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const startTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const dateStr = now.toISOString().split('T')[0];

      await addStudySession({
        subject: activeTimer.subjectCode,
        sessionName: activeTimer.sessionName,
        duration: finalSeconds,
        date: dateStr,
        startTime: startTimeStr
      });
    }

    setActiveTimer(null);
  };

  // Export all user data as JSON string
  const exportUserData = async () => {
    if (!user) throw new Error("Must be logged in to export data.");
    const data = {
      subjects,
      tasks,
      assignments,
      studySessions,
      ipmatProgress,
      settings,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  // Import user data from JSON string and sync with Firestore
  const importUserData = async (jsonData: string) => {
    if (!user) throw new Error("Must be logged in to import data.");
    const parsed = JSON.parse(jsonData);
    const userId = user.uid;
    const batch = writeBatch(db);

    // Validate structure slightly
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      for (const t of parsed.tasks) {
        const newTaskRef = doc(collection(db, 'tasks'));
        batch.set(newTaskRef, {
          userId,
          subjectCode: t.subjectCode || 'math',
          title: t.title || 'Untitled Task',
          description: t.description || '',
          dueDate: t.dueDate || new Date().toISOString().split('T')[0],
          priority: t.priority || 'medium',
          completed: !!t.completed,
          createdAt: t.createdAt || new Date().toISOString()
        });
      }
    }

    if (parsed.assignments && Array.isArray(parsed.assignments)) {
      for (const a of parsed.assignments) {
        const newAssignmentRef = doc(collection(db, 'assignments'));
        batch.set(newAssignmentRef, {
          userId,
          subjectCode: a.subjectCode || 'math',
          title: a.title || 'Untitled Assignment',
          type: a.type || 'ia_draft',
          description: a.description || '',
          dueDate: a.dueDate || new Date().toISOString().split('T')[0],
          completed: !!a.completed,
          createdAt: a.createdAt || new Date().toISOString()
        });
      }
    }

    if (parsed.studySessions && Array.isArray(parsed.studySessions)) {
      for (const s of parsed.studySessions) {
        const newSessionRef = doc(collection(db, 'study_sessions'));
        batch.set(newSessionRef, {
          userId,
          subject: s.subject || 'math',
          sessionName: s.sessionName || 'Revision',
          duration: Number(s.duration) || 0,
          date: s.date || new Date().toISOString().split('T')[0],
          startTime: s.startTime || '00:00:00',
          createdAt: s.createdAt || new Date().toISOString()
        });
      }
    }

    if (parsed.ipmatProgress && Array.isArray(parsed.ipmatProgress)) {
      for (const p of parsed.ipmatProgress) {
        if (p.chapterId && p.sectionCode) {
          const docId = `${userId}_${p.chapterId}`;
          const pRef = doc(db, 'ipmat_progress', docId);
          batch.set(pRef, {
            userId,
            sectionCode: p.sectionCode,
            chapterId: p.chapterId,
            bookCompleted: !!p.bookCompleted,
            worksheetCompleted: !!p.worksheetCompleted
          });
        }
      }
    }

    if (parsed.subjects && Array.isArray(parsed.subjects)) {
      for (const s of parsed.subjects) {
        const sRef = doc(db, 'subjects', `${userId}_${s.code}`);
        batch.set(sRef, {
          userId,
          code: s.code,
          name: s.name,
          totalStudyTime: Number(s.totalStudyTime) || 0
        });
      }
    }

    if (parsed.settings && parsed.settings.theme) {
      const settingsDocRef = doc(db, 'settings', userId);
      batch.set(settingsDocRef, {
        userId,
        theme: parsed.settings.theme
      });
    }

    await batch.commit();
  };

  // Delete User Account
  const deleteUserAccount = async () => {
    if (!user) return;
    const userId = user.uid;

    // Delete Firestore documents
    const batch = writeBatch(db);

    // Delete settings
    batch.delete(doc(db, 'settings', userId));

    // Get and delete tasks
    const tasksSnap = await getDocs(query(collection(db, 'tasks'), where('userId', '==', userId)));
    tasksSnap.forEach((doc) => batch.delete(doc.ref));

    // Get and delete assignments
    const assignmentsSnap = await getDocs(query(collection(db, 'assignments'), where('userId', '==', userId)));
    assignmentsSnap.forEach((doc) => batch.delete(doc.ref));

    // Get and delete study sessions
    const sessionsSnap = await getDocs(query(collection(db, 'study_sessions'), where('userId', '==', userId)));
    sessionsSnap.forEach((doc) => batch.delete(doc.ref));

    // Get and delete subjects
    const subjectsSnap = await getDocs(query(collection(db, 'subjects'), where('userId', '==', userId)));
    subjectsSnap.forEach((doc) => batch.delete(doc.ref));

    // Get and delete ipmat_progress
    const ipmatSnap = await getDocs(query(collection(db, 'ipmat_progress'), where('userId', '==', userId)));
    ipmatSnap.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();

    // Finally delete user in auth
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.delete();
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      authLoading,
      subjects,
      tasks,
      assignments,
      studySessions,
      ipmatProgress,
      settings,
      
      loginWithGoogle,
      loginWithEmail,
      signupWithEmail,
      logout,
      
      updateSubjectTime,
      addTask,
      updateTask,
      deleteTask,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      addStudySession,
      deleteStudySession,
      updateIpmatChapter,
      
      updateTheme,
      exportUserData,
      importUserData,
      deleteUserAccount,

      activeTimer,
      startActiveTimer,
      pauseActiveTimer,
      resumeActiveTimer,
      stopActiveTimer,
      saveActiveTimerSeconds,
      completeActiveTimer,
      
      triggerConfetti,
      confettiTrigger,
      completedSectionName,
      setCompletedSectionName
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
