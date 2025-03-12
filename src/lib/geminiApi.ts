import { Constraint, Schedule } from './types';
import { detectConstraintType, generateId } from './timetableUtils';

const getApiKey = () => {
  return localStorage.getItem('gemini-api-key');
};

export const processConstraintWithGemini = async (
  constraintText: string,
  currentSchedule: Schedule
): Promise<{
  processedSchedule: Schedule;
  response: string;
}> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Please set your Gemini API key in the settings first.');
  }

  console.log('Processing with Gemini API:', constraintText);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As a scheduling assistant, analyze this constraint and suggest how to modify the schedule: "${constraintText}". Current schedule: ${JSON.stringify(currentSchedule)}`,
          }]
        }]
      })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to process constraint with Gemini API');
  }

  const data = await response.json();
  const aiResponse = data.candidates[0].content.parts[0].text;

  // For now, return the current schedule with the AI's response
  // You can enhance this later to actually modify the schedule based on the AI's response
  return {
    processedSchedule: currentSchedule,
    response: aiResponse
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
