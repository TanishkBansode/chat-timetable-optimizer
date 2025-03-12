
import React, { useState } from 'react';
import { Schedule, Day, TimeSlot } from '../lib/types';
import { DAYS, TIME_SLOTS, getScheduleItem, formatTime } from '../lib/timetableUtils';

interface TimetableViewProps {
  schedule: Schedule;
}

const TimetableView: React.FC<TimetableViewProps> = ({ schedule }) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const handleCellHover = (day: Day, timeSlot: TimeSlot) => {
    setHoveredCell(`${day}-${timeSlot}`);
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className="w-full overflow-auto pb-4 animate-scale-in">
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
                  const item = getScheduleItem(schedule, day, timeSlot);
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
                          className="w-full h-full p-3 flex items-center justify-center text-center transition-all duration-300"
                          style={{ 
                            backgroundColor: item.color,
                            boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          <span className="text-sm font-medium">{item.subject}</span>
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
    </div>
  );
};

export default TimetableView;
