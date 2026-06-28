export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export interface Subject {
  userId: string;
  code: string; // e.g. 'math', 'eco', 'bm', 'eng', 'hindi', 'ess', 'ipmat'
  name: string;
  totalStudyTime: number; // in seconds
}

export interface Task {
  id?: string;
  userId: string;
  subjectCode: string; // e.g. 'math', 'eco', etc.
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: string; // ISO String
  createdAt: string; // ISO String
}

export interface Assignment {
  id?: string;
  userId: string;
  subjectCode: string;
  title: string;
  type: 'ia_draft' | 'homework' | 'project' | 'test' | 'deadline';
  description?: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO String
  createdAt: string; // ISO String
}

export interface StudySession {
  id?: string;
  userId: string;
  subject: string; // code
  sessionName: string; // Revision, Worksheet, Past Paper, Notes
  duration: number; // in seconds
  createdAt: string; // ISO String
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
}

export interface IpmatProgress {
  id?: string;
  userId: string;
  sectionCode: string; // e.g. 'verbal', 'di', 'number', 'lr', 'arithmetic', 'modern', 'algebra', 'geometry'
  chapterId: string; // unique ID for chapter
  bookCompleted: boolean;
  worksheetCompleted: boolean;
}

export interface Settings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
}

export interface IPMATChapter {
  id: string;
  name: string;
}

export interface IPMATSection {
  code: string;
  title: string;
  chapters: IPMATChapter[];
}
