
import React, { useState } from 'react';
import { Schedule, Day, TimeSlot, Class } from '../lib/types';
import { 
  DAYS, 
  TIME_SLOTS, 
  getScheduleItems, 
  formatTime, 
  CLASSES,
  TEACHERS
} from '../lib/timetableUtils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Edit, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface TimetableViewProps {
  schedule: Schedule;
}

const TimetableView: React.FC<TimetableViewProps> = ({ schedule }) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>(CLASSES[0].name);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [currentEditClass, setCurrentEditClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>(CLASSES);
  const { toast } = useToast();

  const handleCellHover = (day: Day, timeSlot: TimeSlot) => {
    setHoveredCell(`${day}-${timeSlot}`);
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  const handleEditClass = (classItem: Class) => {
    setCurrentEditClass(classItem);
    setEditClassName(classItem.name);
    setIsEditOpen(true);
  };

  const handleAddClass = () => {
    setIsAddOpen(true);
    setNewClassName('');
  };

  const submitEditClass = () => {
    if (!editClassName.trim() || !currentEditClass) {
      toast({
        title: "Error",
        description: "Class name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // Update the class name in the state
    const updatedClasses = classes.map(c => 
      c.id === currentEditClass.id ? {...c, name: editClassName} : c
    );
    setClasses(updatedClasses);
    
    // Update the selected class if it was renamed
    if (selectedClass === currentEditClass.name) {
      setSelectedClass(editClassName);
    }
    
    toast({
      title: "Class updated",
      description: `Class renamed from ${currentEditClass.name} to ${editClassName}`
    });
    
    setIsEditOpen(false);
  };

  const submitAddClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: "Error",
        description: "Class name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // Add the new class to the state
    const newClass = {
      id: Math.random().toString(36).substring(2, 9),
      name: newClassName,
      subjects: CLASSES[0].subjects.slice() // Copy subjects from first class
    };
    
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    setSelectedClass(newClassName); // Switch to the new class
    
    toast({
      title: "Class added",
      description: `New class ${newClassName} added`
    });
    
    setIsAddOpen(false);
  };

  return (
    <div className="w-full overflow-auto pb-4 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <Tabs defaultValue={classes[0].name} value={selectedClass} onValueChange={setSelectedClass} className="w-full">
          <div className="flex items-center justify-between mb-2">
            <TabsList className="justify-start">
              {classes.map((classItem) => (
                <TabsTrigger 
                  key={classItem.id} 
                  value={classItem.name}
                >
                  {classItem.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleEditClass(classes.find(c => c.name === selectedClass) || classes[0])}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleAddClass}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {classes.map((classItem) => (
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
                      <th className="p-3 border-b border-border text-center font-medium">
                        Teachers
                      </th>
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
                        <td className="border-b border-border p-3">
                          <div className="flex flex-col gap-1 text-xs">
                            {/* Find relevant teachers who teach this class's subjects without repetition */}
                            {TEACHERS
                              .filter(teacher => 
                                teacher.subjects.some(subject => 
                                  classItem.subjects.includes(subject)
                                )
                              )
                              .map(teacher => {
                                // Get relevant subjects this teacher teaches for this class
                                const relevantSubjects = teacher.subjects
                                  .filter(s => classItem.subjects.includes(s))
                                  .join(', ');
                                
                                return (
                                  <div key={teacher.id} className="flex items-center justify-between">
                                    <span>{teacher.name}</span>
                                    <span className="text-muted-foreground">{relevantSubjects}</span>
                                  </div>
                                );
                              })
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Edit Class Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Class</SheetTitle>
            <SheetDescription>
              Change the class name
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="class-name" className="text-sm font-medium">
                  Class Name
                </label>
                <Input
                  id="class-name"
                  placeholder="Enter class name"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={submitEditClass}>
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Class Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Class</SheetTitle>
            <SheetDescription>
              Create a new class
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-class-name" className="text-sm font-medium">
                  Class Name
                </label>
                <Input
                  id="new-class-name"
                  placeholder="Enter class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={submitAddClass}>
              Add Class
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TimetableView;
