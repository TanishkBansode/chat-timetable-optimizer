
export type ConstraintType = 'hard' | 'soft';

export interface Constraint {
  id: string;
  text: string;
  type: ConstraintType;
  timestamp: Date;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export type TimeSlot = 
  | '9:00' | '10:00' | '11:00' | '12:00' 
  | '13:00' | '14:00' | '15:00' | '16:00' | '17:00';

export interface ScheduleItem {
  id: string;
  subject: string;
  day: Day;
  timeSlot: TimeSlot;
  color?: string;
}

export type Schedule = ScheduleItem[];
