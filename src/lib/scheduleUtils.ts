
import { Schedule, Day, TimeSlot, ScheduleItem } from './types';
import { SUBJECT_COLORS, TEACHERS, CLASSES, DAYS, TIME_SLOTS } from './constants';
import { generateId } from './timetableUtils';

// Find suitable teacher for a subject
export const findTeacherForSubject = (subject: string): string => {
  const teacher = TEACHERS.find(t => t.subjects.includes(subject));
  return teacher ? teacher.name : 'Unassigned';
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
  
  return schedule;
};

// Remove a subject from the schedule
export const removeSubjectFromSchedule = (schedule: Schedule, itemId: string): Schedule => {
  return schedule.filter(item => item.id !== itemId);
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
