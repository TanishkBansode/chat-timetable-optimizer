
import { Constraint, Schedule, ScheduleItem, Day, TimeSlot, Class, Teacher } from './types';

export const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const TIME_SLOTS: TimeSlot[] = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export const SUBJECTS = [
  'Mathematics', 
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

// Sample teachers
export const TEACHERS: Teacher[] = [
  { id: '1', name: 'Dr. Smith', subjects: ['Mathematics', 'Physics'] },
  { id: '2', name: 'Prof. Johnson', subjects: ['Chemistry', 'Biology'] },
  { id: '3', name: 'Mr. Brown', subjects: ['History', 'Literature'] },
  { id: '4', name: 'Ms. Davis', subjects: ['Computer Science'] },
  { id: '5', name: 'Mrs. Wilson', subjects: ['Physical Education', 'Art', 'Music'] },
];

// Generate a unique ID for items
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Colors for subjects (pastel colors)
export const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': 'rgba(114, 190, 229, 0.8)',
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

// Find suitable teacher for a subject
export const findTeacherForSubject = (subject: string): string => {
  const teacher = TEACHERS.find(t => t.subjects.includes(subject));
  return teacher ? teacher.name : 'Unassigned';
};

// Generate an initial sample schedule with classes and teachers
export const generateSampleSchedule = (): Schedule => {
  const schedule: Schedule = [];
  
  // Add classes for each class group
  CLASSES.forEach(classGroup => {
    // Add a few subjects for each class
    const classSubjects = classGroup.subjects.slice(0, 4);
    classSubjects.forEach(subject => {
      const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
      const randomTimeSlot = TIME_SLOTS[Math.floor(Math.random() * (TIME_SLOTS.length - 1))];
      
      if (isTimeSlotAvailable(schedule, randomDay, randomTimeSlot, classGroup.name)) {
        schedule.push({
          id: generateId(),
          subject,
          day: randomDay,
          timeSlot: randomTimeSlot,
          color: SUBJECT_COLORS[subject],
          className: classGroup.name,
          teacherName: findTeacherForSubject(subject)
        });
      }
    });
  });
  
  return schedule;
};

// Process a constraint and update the schedule using Gemini API
export const processConstraint = (constraint: Constraint, currentSchedule: Schedule): Schedule => {
  // In a real implementation, this would call the Gemini API
  // For now, we'll log the constraint and return the current schedule
  console.log(`Processing constraint: ${constraint.text} (${constraint.type})`);
  return currentSchedule;
};

// Check if a time slot is available for a specific class
export const isTimeSlotAvailable = (
  schedule: Schedule, 
  day: Day, 
  timeSlot: TimeSlot,
  className?: string
): boolean => {
  if (className) {
    return !schedule.some(item => 
      item.day === day && 
      item.timeSlot === timeSlot && 
      item.className === className
    );
  }
  return !schedule.some(item => item.day === day && item.timeSlot === timeSlot);
};

// Get a schedule item at a specific day and time slot if it exists
export const getScheduleItem = (
  schedule: Schedule, 
  day: Day, 
  timeSlot: TimeSlot,
  className?: string
): ScheduleItem | undefined => {
  if (className) {
    return schedule.find(item => 
      item.day === day && 
      item.timeSlot === timeSlot && 
      item.className === className
    );
  }
  return schedule.find(item => item.day === day && item.timeSlot === timeSlot);
};

// Get all schedule items for a specific day and time slot
export const getScheduleItems = (
  schedule: Schedule,
  day: Day,
  timeSlot: TimeSlot
): ScheduleItem[] => {
  return schedule.filter(item => item.day === day && item.timeSlot === timeSlot);
};

// Add a new subject to the schedule
export const addSubjectToSchedule = (
  schedule: Schedule, 
  subject: string, 
  day: Day, 
  timeSlot: TimeSlot,
  className: string
): Schedule => {
  // Check if the slot is available for this class
  if (isTimeSlotAvailable(schedule, day, timeSlot, className)) {
    const newItem: ScheduleItem = {
      id: generateId(),
      subject,
      day,
      timeSlot,
      color: SUBJECT_COLORS[subject] || 'rgba(200, 200, 200, 0.8)',
      className,
      teacherName: findTeacherForSubject(subject)
    };
    
    return [...schedule, newItem];
  }
  
  // If not available, return the original schedule
  return schedule;
};

// Remove a subject from the schedule
export const removeSubjectFromSchedule = (schedule: Schedule, itemId: string): Schedule => {
  return schedule.filter(item => item.id !== itemId);
};

// Format time for display
export const formatTime = (timeSlot: TimeSlot): string => {
  return timeSlot;
};

// Simple text responses for the chatbot
export const getChatbotResponse = (userInput: string): string => {
  const lowerInput = userInput.toLowerCase();
  
  if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    return "Hello! I'm your scheduling assistant. How can I help with your timetable today?";
  }
  
  if (lowerInput.includes('help')) {
    return "I can help you create a schedule based on your preferences. Try telling me constraints like 'No math after lunch' or 'I prefer chemistry in the morning'.";
  }
  
  if (lowerInput.includes('thank')) {
    return "You're welcome! Is there anything else you'd like to adjust in your schedule?";
  }
  
  // Default response for constraint-like inputs
  return `I've added your constraint: "${userInput}". Would you like to see the updated schedule or add more constraints?`;
};

// Extract constraint type from text (simplified)
export const detectConstraintType = (text: string): 'hard' | 'soft' => {
  const lowerText = text.toLowerCase();
  
  if (
    lowerText.includes('must') || 
    lowerText.includes('always') || 
    lowerText.includes('never') || 
    lowerText.includes('should not')
  ) {
    return 'hard';
  }
  
  return 'soft';
};
