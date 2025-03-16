
import React from 'react';
import { TEACHERS, CLASSES } from '@/lib/timetableUtils';

const TeacherList: React.FC = () => {
  return (
    <div className="space-y-4">
      {TEACHERS.map((teacher) => (
        <div 
          key={teacher.id} 
          className="p-3 rounded-lg bg-secondary/20 border border-border"
        >
          <h4 className="font-medium text-sm mb-2">{teacher.name}</h4>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Subjects:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {teacher.subjects.map((subject) => (
                  <span 
                    key={subject} 
                    className="px-2 py-0.5 text-xs rounded-full bg-primary/10"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground">Classes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {CLASSES.filter(cls => 
                  cls.subjects.some(subject => teacher.subjects.includes(subject))
                ).map(cls => (
                  <span 
                    key={cls.id} 
                    className="px-2 py-0.5 text-xs rounded-full bg-secondary/30"
                  >
                    {cls.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherList;
