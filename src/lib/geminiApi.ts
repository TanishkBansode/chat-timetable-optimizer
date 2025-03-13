
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
    // Updated to use gemini-2.0-flash model instead of gemini-pro
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

    // Process the constraint to update the schedule
    let processedSchedule = [...currentSchedule];
    
    // Apply the constraint based on the AI response or the constraint text
    const lowerConstraint = constraintText.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    // Handle common constraint patterns
    if (lowerConstraint.includes('no ') || lowerResponse.includes('remove')) {
      // Extract subject names to remove (assuming they start with capital letters)
      const subjectMatches = constraintText.match(/no\s+([A-Z][a-z]+)/gi) || [];
      const subjects = subjectMatches.map(match => 
        match.replace(/^no\s+/i, '').trim()
      );
      
      // Also try to extract subjects from the AI response
      const responseSubjectMatches = aiResponse.match(/remove.+?([A-Z][a-z]+)/gi) || [];
      const responseSubjects = responseSubjectMatches.map(match => {
        const subjectMatch = match.match(/([A-Z][a-z]+)/);
        return subjectMatch ? subjectMatch[0] : '';
      }).filter(Boolean);
      
      // Combine both sources of subjects
      const allSubjects = [...subjects, ...responseSubjects];
      
      if (allSubjects.length > 0) {
        processedSchedule = processedSchedule.filter(item => {
          return !allSubjects.some(subject => 
            item.subject.toLowerCase().includes(subject.toLowerCase())
          );
        });
      }
    }
    
    // Handle time-based constraints
    if (lowerConstraint.includes('morning') || lowerConstraint.includes('afternoon')) {
      const morningSlots = ['9:00', '10:00', '11:00'];
      const afternoonSlots = ['13:00', '14:00', '15:00', '16:00', '17:00'];
      
      // Check for subject + time constraints
      const subjectMatches = constraintText.match(/([A-Z][a-z]+) (only in|in the) (morning|afternoon)/i);
      if (subjectMatches) {
        const subject = subjectMatches[1];
        const timeOfDay = subjectMatches[3].toLowerCase();
        
        processedSchedule = processedSchedule.filter(item => {
          if (item.subject === subject) {
            if (timeOfDay === 'morning') {
              return morningSlots.includes(item.timeSlot);
            } else if (timeOfDay === 'afternoon') {
              return afternoonSlots.includes(item.timeSlot);
            }
          }
          return true;
        });
      }
    }
    
    // Handle teacher-based constraints
    if (lowerConstraint.includes('teacher')) {
      const teacherMatches = constraintText.match(/([A-Z][a-z]+ [A-Z][a-z]+)'s name is ([A-Z][a-z]+ [A-Z][a-z]+)/i);
      if (teacherMatches) {
        const subject = teacherMatches[1];
        const teacherName = teacherMatches[2];
        
        // Update teacher name for the subject
        processedSchedule = processedSchedule.map(item => {
          if (item.subject.toLowerCase() === subject.toLowerCase()) {
            return { ...item, teacherName };
          }
          return item;
        });
      }
    }
    
    // If we haven't made any changes but we got a successful response,
    // try to implement a more generic filter based on the constraint text
    if (JSON.stringify(processedSchedule) === JSON.stringify(currentSchedule)) {
      // Look for subject mentions in the constraint
      const subjectMentions = currentSchedule
        .map(item => item.subject)
        .filter(subject => lowerConstraint.includes(subject.toLowerCase()));
      
      if (subjectMentions.length > 0) {
        // Apply some change based on the most mentioned subject
        const subjectToModify = subjectMentions[0];
        
        if (lowerConstraint.includes('remove') || lowerConstraint.includes('no ')) {
          // Remove the subject
          processedSchedule = processedSchedule.filter(item => 
            item.subject !== subjectToModify
          );
        }
      }
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
