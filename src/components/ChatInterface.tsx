
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../lib/types';
import { Send, Loader2, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isProcessing?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages,
  onSendMessage,
  isProcessing = false
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = () => {
    if (inputText.trim() && !isProcessing) {
      onSendMessage(inputText);
      setInputText('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const exampleConstraints = [
    "No Chemistry classes",
    "Change Dr. Smith's name to Dr. Smooth",
    "Math only in the morning",
    "No classes on Friday afternoon"
  ];
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={message.sender === 'user' ? 'user-message' : 'system-message'}
              style={{
                // Slightly stagger animation delays based on position
                animationDelay: `${messages.indexOf(message) * 0.1}s`
              }}
            >
              {message.text}
            </div>
          ))}
          
          {isProcessing && (
            <div className="system-message flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing your request...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your scheduling constraint..."
            className="w-full py-2 px-4 bg-secondary/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
            disabled={isProcessing}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="absolute right-14 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Example constraints"
                >
                  <HelpCircle size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-medium mb-2">Example constraints:</p>
                <ul className="text-xs space-y-1">
                  {exampleConstraints.map((example, i) => (
                    <li key={i} className="cursor-pointer hover:text-primary" 
                        onClick={() => {
                          setInputText(example);
                        }}>
                      • {example}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isProcessing}
            className={`p-2 rounded-full bg-primary text-white transform transition-all duration-300 ${
              inputText.trim() && !isProcessing ? 'opacity-100 translate-x-0' : 'opacity-70 translate-x-2'
            }`}
            aria-label="Send message"
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
