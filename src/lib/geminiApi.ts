
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
  
  try {
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
              text: `As a scheduling assistant, analyze this constraint and suggest how to modify the schedule: "${constraintText}". Current schedule: ${JSON.stringify(currentSchedule, null, 2)}`,
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`API responded with status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    
    // Check for various response formats
    let aiResponse = '';
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      if (data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        aiResponse = data.candidates[0].content.parts[0].text || '';
      }
    }
    
    if (!aiResponse) {
      console.error('Unexpected Gemini API response format:', data);
      aiResponse = "I processed your constraint, but I'm not sure how to update the schedule.";
    }

    // Apply simple filtering to the original schedule based on the constraint text
    // This is a fallback implementation when we can't actually parse the AI's response
    let processedSchedule = [...currentSchedule];
    
    // Implement basic constraint processing logic here as a fallback
    const lowerConstraint = constraintText.toLowerCase();
    
    // Example: Process constraints about specific subjects
    if (lowerConstraint.includes('no math') || lowerConstraint.includes('mathematics')) {
      processedSchedule = processedSchedule.filter(item => {
        if (lowerConstraint.includes('afternoon') && item.subject === 'Mathematics') {
          const hour = parseInt(item.timeSlot.split(':')[0]);
          return hour < 12; // Only keep morning math classes
        }
        return true;
      });
    }

    return {
      processedSchedule,
      response: aiResponse
    };
  } catch (error) {
    console.error('Error in Gemini API processing:', error);
    throw new Error('Failed to process constraint with Gemini API');
  }
};

export const createConstraintFromText = (text: string): Constraint => {
  return {
    id: generateId(),
    text,
    type: detectConstraintType(text),
    timestamp: new Date()
  };
};
