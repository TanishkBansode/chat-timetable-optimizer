
import { Constraint, Schedule } from './types';
import { detectConstraintType, generateId } from './timetableUtils';

// This would normally use the actual Gemini API
// For demo purposes, we'll simulate the API response
export const processConstraintWithGemini = async (
  constraintText: string,
  currentSchedule: Schedule
): Promise<{
  processedSchedule: Schedule;
  response: string;
}> => {
  console.log('Processing with Gemini API:', constraintText);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Simple constraint processing logic
  let response = '';
  let processedSchedule = [...currentSchedule];
  
  const lowerText = constraintText.toLowerCase();
  
  // No math after lunch
  if (lowerText.includes('no math') && (lowerText.includes('after lunch') || lowerText.includes('afternoon'))) {
    processedSchedule = processedSchedule.filter(item => {
      // Consider 13:00 and after to be "after lunch"
      const isAfterLunch = ['13:00', '14:00', '15:00', '16:00', '17:00'].includes(item.timeSlot);
      const isMath = item.subject.toLowerCase().includes('math');
      return !(isAfterLunch && isMath);
    });
    response = "I've removed all mathematics classes scheduled after lunch.";
  }
  // No back-to-back physics and chemistry
  else if (lowerText.includes('no back-to-back') && 
           lowerText.includes('physics') && 
           lowerText.includes('chemistry')) {
    // This would require a more complex algorithm in a real implementation
    // For demo, we'll just acknowledge it
    response = "I understand you don't want Physics and Chemistry back-to-back. I'll avoid scheduling them in consecutive slots.";
  }
  // No classes after 3 PM / 15:00
  else if (lowerText.includes('no classes after') && 
          (lowerText.includes('3') || lowerText.includes('15'))) {
    processedSchedule = processedSchedule.filter(item => {
      return !['15:00', '16:00', '17:00'].includes(item.timeSlot);
    });
    response = "I've removed all classes scheduled after 3 PM.";
  }
  // Prefer math in the morning
  else if ((lowerText.includes('math') || lowerText.includes('mathematics')) && 
           (lowerText.includes('morning') || lowerText.includes('before lunch'))) {
    // This would involve a more complex rescheduling algorithm
    // For demo, we'll just acknowledge it
    response = "I'll try to schedule Mathematics classes in the morning when possible.";
  }
  // Default response
  else {
    response = "I've noted your constraint. This may require manual adjustments or more specific instructions.";
  }
  
  return {
    processedSchedule,
    response
  };
};

export const createConstraintFromText = (text: string): Constraint => {
  return {
    id: generateId(),
    text,
    type: detectConstraintType(text),
    timestamp: new Date()
  };
};
