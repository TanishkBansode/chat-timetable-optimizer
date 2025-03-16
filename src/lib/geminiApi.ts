
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
    // Create a prompt that instructs Gemini to analyze and modify the schedule
    const prompt = `
You are a school timetable assistant. Analyze this constraint: "${constraintText}"

Current schedule:
${JSON.stringify(currentSchedule, null, 2)}

Please return a JSON response with:
1. An "explanation" of what changes you'll make
2. The complete "updatedSchedule" array with all necessary modifications applied

Your response should be a valid JSON object containing both these fields. The "updatedSchedule" should be the complete, modified version of the schedule with all changes applied based on the constraint.

For example, if asked to change a teacher's name, update all relevant entries in the schedule.
If asked to remove a subject, filter out those entries.
If asked to change time slots, move the relevant entries to appropriate time slots.

Return the complete modified schedule as a JSON array. Don't just describe the changes - actually make them.
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
            maxOutputTokens: 2048,
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
    
    let aiResponse = '';
    let updatedSchedule = [...currentSchedule];
    
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
          const parsedResponse = JSON.parse(jsonString.trim());
          
          console.log('Parsed Gemini response:', parsedResponse);
          
          if (parsedResponse.updatedSchedule && Array.isArray(parsedResponse.updatedSchedule)) {
            updatedSchedule = parsedResponse.updatedSchedule;
            aiResponse = parsedResponse.explanation || "I've updated the schedule based on your constraint.";
          } else {
            console.warn('Response did not contain a valid updatedSchedule array:', parsedResponse);
            aiResponse = "I understood your request, but couldn't update the schedule properly. Please try rephrasing.";
          }
        } catch (e) {
          console.warn('Failed to parse structured response:', e);
          aiResponse = "I couldn't process your constraint properly. Please try rephrasing or being more specific.";
        }
      }
    }
    
    if (!aiResponse) {
      console.error('Unexpected Gemini API response format:', data);
      aiResponse = "I processed your constraint, but I'm not sure how to update the schedule.";
    }

    return {
      processedSchedule: updatedSchedule,
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
