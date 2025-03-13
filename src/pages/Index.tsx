
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TimetableView from '../components/TimetableView';
import ConstraintList from '../components/ConstraintList';
import ChatInterface from '../components/ChatInterface';
import { ApiKeySettings } from '@/components/ApiKeySettings';
import TeacherList from '../components/TeacherList';
import { Constraint, Message, Schedule } from '../lib/types';
import { 
  generateId, 
  generateSampleSchedule, 
  processConstraint,
  detectConstraintType
} from '../lib/timetableUtils';
import { processConstraintWithGemini, createConstraintFromText } from '../lib/geminiApi';
import { Calendar, MessageSquare, List } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  // State
  const [schedule, setSchedule] = useState<Schedule>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'constraints' | 'chat'>('chat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  
  // Initialize with sample data
  useEffect(() => {
    const initialSchedule = generateSampleSchedule();
    setSchedule(initialSchedule);
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: generateId(),
      text: "Hello! I'm your scheduling assistant. Tell me your scheduling preferences and I'll help you create the perfect timetable. What constraints would you like to add?",
      sender: 'system',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // Handle sending a message
  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Show processing indicator
    setIsProcessing(true);
    
    try {
      // Process the constraint with Gemini API
      const { processedSchedule, response } = await processConstraintWithGemini(text, schedule);
      
      // Add the constraint
      const newConstraint = createConstraintFromText(text);
      setConstraints(prev => [...prev, newConstraint]);
      
      // Update the schedule
      setSchedule(processedSchedule);
      
      // Add system response
      const systemResponse: Message = {
        id: generateId(),
        text: response,
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, systemResponse]);
      
      // Show toast notification
      toast({
        title: "Constraint processed",
        description: "Your timetable has been updated.",
      });
    } catch (error) {
      console.error('Error processing constraint:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: generateId(),
        text: "I'm sorry, I couldn't process that constraint. Please try again with different wording.",
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to process your constraint.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle removing a constraint
  const handleRemoveConstraint = (id: string) => {
    setConstraints(prev => prev.filter(c => c.id !== id));
    
    // Add system message acknowledging removal
    const systemMessage: Message = {
      id: generateId(),
      text: "I've removed that constraint. Your schedule has been updated.",
      sender: 'system',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    // Show toast notification
    toast({
      title: "Constraint removed",
      description: "Your timetable has been updated.",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 md:p-6 gap-6">
        {/* Timetable Section */}
        <section className="lg:flex-1 lg:max-w-[65%] flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Your Timetable
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              Settings
            </Button>
          </div>
          
          {showSettings ? (
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <ApiKeySettings />
            </div>
          ) : (
            <TimetableView schedule={schedule} />
          )}
        </section>
        
        {/* Chat & Constraints Section */}
        <section className="lg:w-[35%] flex flex-col glass-panel rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              className={`flex-1 py-3 px-4 flex justify-center items-center space-x-2 transition-colors ${
                activeTab === 'chat' 
                  ? 'border-b-2 border-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={18} />
              <span>Chat Assistant</span>
            </button>
            
            <button
              className={`flex-1 py-3 px-4 flex justify-center items-center space-x-2 transition-colors ${
                activeTab === 'constraints' 
                  ? 'border-b-2 border-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('constraints')}
            >
              <List size={18} />
              <span>Constraints ({constraints.length})</span>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' ? (
              <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
              />
            ) : (
              <div className="p-4 h-full overflow-y-auto">
                <ConstraintList 
                  constraints={constraints} 
                  onRemoveConstraint={handleRemoveConstraint} 
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
