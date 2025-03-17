
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TimetableView from '../components/TimetableView';
import ConstraintList from '../components/ConstraintList';
import ChatInterface from '../components/ChatInterface';
import { ApiKeySettings } from '@/components/ApiKeySettings';
import TeacherList from '../components/TeacherList';
import ClassManager from '@/components/ClassManager';
import { Constraint, Message, Schedule, Class } from '../lib/types';
import { 
  generateId, 
  generateSampleSchedule, 
  processConstraint,
  detectConstraintType,
  TEACHERS,
  CLASSES
} from '../lib/timetableUtils';
import { processConstraintWithGemini, createConstraintFromText } from '../lib/geminiApi';
import { Calendar, MessageSquare, List, Users, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index: React.FC = () => {
  // State
  const [schedule, setSchedule] = useState<Schedule>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'constraints' | 'chat'>('chat');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'apiKey' | 'teachers' | 'classes'>('apiKey');
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
        text: response || "I've updated your schedule based on your constraint.",
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, systemResponse]);
      
      // Show toast notification
      toast({
        title: "Constraint processed",
        description: "Your timetable has been updated.",
      });
      
      // Force a refresh of the teachers list by re-rendering the component
      // This ensures that the teachers column in the timetable gets updated
      if (text.toLowerCase().includes('teacher') || 
          text.toLowerCase().includes('dr.') || 
          text.toLowerCase().includes('prof.') || 
          text.toLowerCase().includes('mr.') || 
          text.toLowerCase().includes('mrs.') || 
          text.toLowerCase().includes('ms.')) {
        // Using a forceUpdate-like pattern
        setSchedule([...processedSchedule]);
      }
      
    } catch (error) {
      console.error('Error processing constraint:', error);
      
      // Check if error is related to missing API key
      const errorMessage: Message = {
        id: generateId(),
        text: error.message?.includes('API key') 
          ? "You need to set your Gemini API key in the settings first. Click the Settings button above the timetable." 
          : "I couldn't process that constraint. There might be an issue with the Gemini API connection. Please check your API key or try again later.",
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Show error toast
      toast({
        title: "Error",
        description: error.message?.includes('API key') 
          ? "Please set your Gemini API key in settings" 
          : "Failed to process your constraint",
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
              <Tabs defaultValue="apiKey" value={activeSettingsTab} onValueChange={(v) => setActiveSettingsTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="apiKey">API Key</TabsTrigger>
                  <TabsTrigger value="teachers">Teachers</TabsTrigger>
                  <TabsTrigger value="classes">Classes</TabsTrigger>
                </TabsList>
                <TabsContent value="apiKey" className="mt-4">
                  <ApiKeySettings />
                </TabsContent>
                <TabsContent value="teachers" className="mt-4">
                  <TeacherList />
                </TabsContent>
                <TabsContent value="classes" className="mt-4">
                  <ClassManager />
                </TabsContent>
              </Tabs>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <Users className="h-4 w-4 mr-1 text-primary" />
                      Teacher Quick View
                    </h3>
                    <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {TEACHERS.map(teacher => (
                        <div key={teacher.id} className="flex justify-between">
                          <span>{teacher.name}</span>
                          <span className="text-muted-foreground">{teacher.subjects.length} subjects</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <BookOpen className="h-4 w-4 mr-1 text-primary" />
                      Class Quick View
                    </h3>
                    <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {CLASSES.map(cls => (
                        <div key={cls.id} className="flex justify-between">
                          <span>{cls.name}</span>
                          <span className="text-muted-foreground">{cls.subjects.length} subjects</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
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
