
import { Constraint, Schedule } from './types';

// Process a constraint and update the schedule
export const processConstraint = (constraint: Constraint, currentSchedule: Schedule): Schedule => {
  console.log(`Processing constraint: ${constraint.text} (${constraint.type})`);
  return currentSchedule;
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
  
  return `I've added your constraint: "${userInput}". Would you like to see the updated schedule or add more constraints?`;
};
