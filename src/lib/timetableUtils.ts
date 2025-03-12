
import { Constraint, Schedule, ScheduleItem, Day, TimeSlot } from './types';

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

// Generate an initial sample schedule
export const generateSampleSchedule = (): Schedule => {
  const schedule: Schedule = [];
  
  // Add a few random classes
  SUBJECTS.slice(0, 6).forEach(subject => {
    const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
    const randomTimeSlot = TIME_SLOTS[Math.floor(Math.random() * (TIME_SLOTS.length - 1))];
    
    schedule.push({
      id: generateId(),
      subject,
      day: randomDay,
      timeSlot: randomTimeSlot,
      color: SUBJECT_COLORS[subject]
    });
  });
  
  return schedule;
};

// Process a constraint and update the schedule accordingly (simplified version)
export const processConstraint = (constraint: Constraint, currentSchedule: Schedule): Schedule => {
  // In a real implementation, this would have complex logic to interpret and apply constraints
  // For this demo, we'll just return the current schedule
  
  console.log(`Processing constraint: ${constraint.text}`);
  return currentSchedule;
};

// Check if a time slot is available in the schedule
export const isTimeSlotAvailable = (schedule: Schedule, day: Day, timeSlot: TimeSlot): boolean => {
  return !schedule.some(item => item.day === day && item.timeSlot === timeSlot);
};

// Get a schedule item at a specific day and time slot if it exists
export const getScheduleItem = (schedule: Schedule, day: Day, timeSlot: TimeSlot): ScheduleItem | undefined => {
  return schedule.find(item => item.day === day && item.timeSlot === timeSlot);
};

// Add a new subject to the schedule
export const addSubjectToSchedule = (
  schedule: Schedule, 
  subject: string, 
  day: Day, 
  timeSlot: TimeSlot
): Schedule => {
  // Check if the slot is available
  if (isTimeSlotAvailable(schedule, day, timeSlot)) {
    const newItem: ScheduleItem = {
      id: generateId(),
      subject,
      day,
      timeSlot,
      color: SUBJECT_COLORS[subject] || 'rgba(200, 200, 200, 0.8)'
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
