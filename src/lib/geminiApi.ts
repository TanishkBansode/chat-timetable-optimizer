
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
    // Create a prompt that instructs Gemini to return a structured response
    const prompt = `
You are a school timetable assistant. Analyze this constraint: "${constraintText}"

Current schedule:
${JSON.stringify(currentSchedule, null, 2)}

Return a JSON response with these fields:
1. "explanation": Brief explanation of how you'll modify the schedule
2. "action": One of ["remove_subject", "add_subject", "change_time", "change_teacher", "no_change"]
3. "details": Object with details specific to the action type

Example response formats:
For removing subjects:
{
  "explanation": "Removing all Chemistry classes as requested",
  "action": "remove_subject",
  "details": {
    "subjects": ["Chemistry"]
  }
}

For changing teacher:
{
  "explanation": "Updating Biology teacher to Prof. Johnny",
  "action": "change_teacher",
  "details": {
    "subject": "Biology",
    "teacherName": "Prof. Johnny"
  }
}

For time constraints:
{
  "explanation": "Moving Math classes to morning slots only",
  "action": "change_time",
  "details": {
    "subject": "Mathematics",
    "allowedTimeSlots": ["9:00", "10:00", "11:00"]
  }
}

Analyze the constraint and return the appropriate structured response.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
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
    
    // Extract the AI response text
    let aiResponse = '';
    let structuredResponse = null;
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      if (data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        aiResponse = data.candidates[0].content.parts[0].text || '';
        
        // Try to parse the structured JSON response
        try {
          // Extract JSON object from the response if it's wrapped in code blocks or other text
          const jsonMatch = aiResponse.match(/```json\n([\s\S]*)\n```/) || 
                           aiResponse.match(/```\n([\s\S]*)\n```/) ||
                           aiResponse.match(/(\{[\s\S]*\})/);
                           
          const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
          structuredResponse = JSON.parse(jsonString.trim());
          console.log('Parsed structured response:', structuredResponse);
        } catch (e) {
          console.warn('Failed to parse structured response:', e);
          // We'll fall back to text processing if JSON parsing fails
        }
      }
    }
    
    if (!aiResponse) {
      console.error('Unexpected Gemini API response format:', data);
      aiResponse = "I processed your constraint, but I'm not sure how to update the schedule.";
    }

    // Process the constraint to update the schedule based on the structured response
    let processedSchedule = [...currentSchedule];
    
    if (structuredResponse) {
      const { action, details } = structuredResponse;
      
      switch (action) {
        case 'remove_subject':
          // Remove specified subjects
          if (details.subjects && Array.isArray(details.subjects)) {
            processedSchedule = processedSchedule.filter(item => 
              !details.subjects.some(subject => 
                item.subject.toLowerCase() === subject.toLowerCase()
              )
            );
          }
          break;
          
        case 'change_teacher':
          // Update teacher for a subject
          if (details.subject && details.teacherName) {
            processedSchedule = processedSchedule.map(item => {
              if (item.subject.toLowerCase() === details.subject.toLowerCase()) {
                return { ...item, teacherName: details.teacherName };
              }
              return item;
            });
          }
          break;
          
        case 'change_time':
          // Filter schedule items based on allowed time slots
          if (details.subject && details.allowedTimeSlots && Array.isArray(details.allowedTimeSlots)) {
            processedSchedule = processedSchedule.filter(item => {
              if (item.subject.toLowerCase() === details.subject.toLowerCase()) {
                return details.allowedTimeSlots.includes(item.timeSlot);
              }
              return true;
            });
          }
          break;
          
        case 'add_subject':
          // This would require more complex logic to find available slots
          // We would need to implement this based on the application's requirements
          console.log('Add subject action not fully implemented yet');
          break;
          
        case 'no_change':
        default:
          // No changes to the schedule
          break;
      }
    } else {
      // If structured response parsing failed, include a message in the response
      aiResponse = `${aiResponse}\n\nNote: I couldn't structure my response properly. Please try rephrasing your constraint.`;
    }

    return {
      processedSchedule,
      response: structuredResponse?.explanation || aiResponse
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
