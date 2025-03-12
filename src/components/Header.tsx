
import React from 'react';
import { Calendar, MessageSquare } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-border z-10 shadow-sm animate-fade-in">
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">Timetable Assistant</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="text-sm px-3 py-1 rounded-full bg-secondary text-muted-foreground">
          <span className="mr-1">●</span> Intelligent Scheduling
        </div>
      </div>
    </header>
  );
};

export default Header;
