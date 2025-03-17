
import { Constraint, Schedule, ScheduleItem, Day, TimeSlot, Class, Teacher } from './types';

// Constants that were previously in constants.ts
export const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const TIME_SLOTS: TimeSlot[] = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export const SUBJECTS = [
  'Maths', 
  'Physics', 
  'Chemistry', 
  'Biology', 
  'History', 
  'Literature', 
  'Computer Science', 
  'Physical Education',
  'Art',
  'Music'
];

// Sample classes
export const CLASSES: Class[] = [
  { id: '1', name: 'Class 10A', subjects: SUBJECTS },
  { id: '2', name: 'Class 10B', subjects: SUBJECTS },
  { id: '3', name: 'Class 11A', subjects: SUBJECTS.slice(0, 8) },
  { id: '4', name: 'Class 11B', subjects: SUBJECTS.slice(0, 8) },
];

// Sample teachers - Ensuring Dr. Smith teaches Maths (not Mathematics)
export const TEACHERS: Teacher[] = [
  { id: '1', name: 'Dr. Smith', subjects: ['Maths', 'Physics'] },
  { id: '2', name: 'Prof. Johnson', subjects: ['Chemistry', 'Biology'] },
  { id: '3', name: 'Mr. Brown', subjects: ['History', 'Literature'] },
  { id: '4', name: 'Ms. Davis', subjects: ['Computer Science'] },
  { id: '5', name: 'Mrs. Wilson', subjects: ['Physical Education', 'Art', 'Music'] },
];

// Colors for subjects (pastel colors)
export const SUBJECT_COLORS: Record<string, string> = {
  'Maths': 'rgba(114, 190, 229, 0.8)',
  'Physics': 'rgba(245, 171, 112, 0.8)',
  'Chemistry': 'rgba(149, 186, 131, 0.8)',
  'Biology': 'rgba(196, 159, 204, 0.8)',
  'History': 'rgba(250, 208, 137, 0.8)',
  'Literature': 'rgba(173, 216, 230, 0.8)',
  'Computer Science': 'rgba(174, 198, 207, 0.8)',
  'Physical Education': 'rgba(179, 222, 193, 0.8)',
  'Art': 'rgba(225, 170, 203, 0.8)',
  'Music': 'rgba(168, 190, 226, 0.8)'
};

// Format time for display (keeping this here as it's a simple utility)
export const formatTime = (timeSlot: string): string => {
  return timeSlot;
};

// Generate a unique ID (keeping this here as it's used across multiple files)
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Import necessary functions from scheduleUtils and constraintUtils
export * from './scheduleUtils';
export * from './constraintUtils';
