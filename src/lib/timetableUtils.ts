import { Constraint, Schedule, ScheduleItem, Day, TimeSlot, Class, Teacher } from './types';

export * from './constants';
export * from './scheduleUtils';
export * from './constraintUtils';

// Format time for display (keeping this here as it's a simple utility)
export const formatTime = (timeSlot: string): string => {
  return timeSlot;
};

// Generate a unique ID (keeping this here as it's used across multiple files)
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
