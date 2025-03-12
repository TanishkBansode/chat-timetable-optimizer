
import React, { useState } from 'react';
import { Schedule, Day, TimeSlot, Class } from '../lib/types';
import { 
  DAYS, 
  TIME_SLOTS, 
  getScheduleItems, 
  formatTime, 
  CLASSES 
} from '../lib/timetableUtils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TimetableViewProps {
  schedule: Schedule;
}

const TimetableView: React.FC<TimetableViewProps> = ({ schedule }) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(CLASSES[0].name);

  const handleCellHover = (day: Day, timeSlot: TimeSlot) => {
    setHoveredCell(`${day}-${timeSlot}`);
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className="w-full overflow-auto pb-4 animate-scale-in">
      <Tabs defaultValue={CLASSES[0].name} className="w-full mb-4">
        <TabsList className="w-full justify-start">
          {CLASSES.map((classItem) => (
            <TabsTrigger 
              key={classItem.id} 
              value={classItem.name}
              onClick={() => setSelectedClass(classItem.name)}
            >
              {classItem.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {CLASSES.map((classItem) => (
          <TabsContent key={classItem.id} value={classItem.name} className="mt-4">
            <div className="min-w-[800px] glass-panel rounded-xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="p-3 border-r border-b border-border text-left font-medium text-muted-foreground">
                      Time
                    </th>
                    {DAYS.map(day => (
                      <th 
                        key={day} 
                        className="p-3 border-b border-r border-border text-center font-medium"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(timeSlot => (
                    <tr key={timeSlot}>
                      <td className="p-3 border-r border-b border-border text-sm text-muted-foreground">
                        {formatTime(timeSlot)}
                      </td>
                      {DAYS.map(day => {
                        const items = getScheduleItems(schedule, day, timeSlot);
                        const item = items.find(item => item.className === classItem.name);
                        const cellId = `${day}-${timeSlot}`;
                        const isHovered = hoveredCell === cellId;
                        
                        return (
                          <td 
                            key={`${day}-${timeSlot}`}
                            className={`border-r border-b border-border timetable-cell p-0 relative ${
                              isHovered ? 'z-10 scale-[1.02]' : ''
                            }`}
                            onMouseEnter={() => handleCellHover(day, timeSlot)}
                            onMouseLeave={handleCellLeave}
                          >
                            {item ? (
                              <div 
                                className="w-full h-full p-3 flex flex-col items-center justify-center text-center transition-all duration-300"
                                style={{ 
                                  backgroundColor: item.color,
                                  boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
                                }}
                              >
                                <span className="text-sm font-medium">{item.subject}</span>
                                {item.teacherName && (
                                  <span className="text-xs mt-1 opacity-80">{item.teacherName}</span>
                                )}
                              </div>
                            ) : (
                              <div className={`w-full h-full p-3 transition-colors duration-300 ${
                                isHovered ? 'bg-secondary/40' : ''
                              }`} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TimetableView;
