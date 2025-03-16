
import React, { useState, useEffect } from 'react';
import { CLASSES, SUBJECTS, generateId } from '@/lib/timetableUtils';
import { Class } from '@/lib/types';
import { Edit, Plus, Save, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ClassManagerProps {
  onClassesChange?: (classes: Class[]) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ onClassesChange }) => {
  const [classes, setClasses] = useState<Class[]>(CLASSES);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Update parent component when classes change
  useEffect(() => {
    if (onClassesChange) {
      onClassesChange(classes);
    }
  }, [classes, onClassesChange]);

  const handleAddClass = () => {
    if (!newClassName.trim()) {
      toast({
        title: "Error",
        description: "Class name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (selectedSubjects.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one subject",
        variant: "destructive"
      });
      return;
    }

    const newClass: Class = {
      id: generateId(),
      name: newClassName.trim(),
      subjects: selectedSubjects
    };

    setClasses([...classes, newClass]);
    setNewClassName('');
    setSelectedSubjects([]);
    setIsAddOpen(false);

    toast({
      title: "Success",
      description: `Class "${newClassName}" has been added`,
    });
  };

  const handleEditClass = () => {
    if (!selectedClass) return;
    
    if (!newClassName.trim()) {
      toast({
        title: "Error",
        description: "Class name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (selectedSubjects.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one subject",
        variant: "destructive"
      });
      return;
    }

    const updatedClasses = classes.map(cls => 
      cls.id === selectedClass.id 
        ? { ...cls, name: newClassName, subjects: selectedSubjects }
        : cls
    );

    setClasses(updatedClasses);
    setIsEditOpen(false);
    
    toast({
      title: "Success",
      description: `Class has been renamed to "${newClassName}"`,
    });
  };

  const openEditSheet = (classItem: Class) => {
    setSelectedClass(classItem);
    setNewClassName(classItem.name);
    setSelectedSubjects(classItem.subjects);
    setIsEditOpen(true);
  };

  const openAddSheet = () => {
    setNewClassName('');
    setSelectedSubjects(SUBJECTS.slice(0, 4)); // Default to first 4 subjects
    setIsAddOpen(true);
  };

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Classes</h3>
        <Button size="sm" onClick={openAddSheet}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((classItem) => (
          <div 
            key={classItem.id}
            className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{classItem.name}</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => openEditSheet(classItem)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground">Subjects:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {classItem.subjects.slice(0, 4).map((subject) => (
                  <span 
                    key={subject} 
                    className="px-2 py-0.5 text-xs rounded-full bg-primary/10"
                  >
                    {subject}
                  </span>
                ))}
                {classItem.subjects.length > 4 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                    +{classItem.subjects.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Class Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Class</SheetTitle>
            <SheetDescription>
              Update the class name and subjects.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <FormLabel>Class Name</FormLabel>
              <Input 
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Enter class name"
              />
            </div>
            
            <div className="space-y-2">
              <FormLabel>Subjects</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map((subject) => (
                  <div 
                    key={subject}
                    className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                      selectedSubjects.includes(subject) 
                        ? 'border-primary bg-primary/10' 
                        : 'border-input'
                    }`}
                    onClick={() => toggleSubject(subject)}
                  >
                    <div className={`w-4 h-4 rounded-sm border ${
                      selectedSubjects.includes(subject) 
                        ? 'bg-primary border-primary' 
                        : 'border-input'
                    }`}>
                      {selectedSubjects.includes(subject) && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-4 h-4">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <SheetFooter>
            <Button onClick={handleEditClass}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Class Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New Class</SheetTitle>
            <SheetDescription>
              Create a new class with selected subjects.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <FormLabel>Class Name</FormLabel>
              <Input 
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Enter class name"
              />
            </div>
            
            <div className="space-y-2">
              <FormLabel>Subjects</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map((subject) => (
                  <div 
                    key={subject}
                    className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                      selectedSubjects.includes(subject) 
                        ? 'border-primary bg-primary/10' 
                        : 'border-input'
                    }`}
                    onClick={() => toggleSubject(subject)}
                  >
                    <div className={`w-4 h-4 rounded-sm border ${
                      selectedSubjects.includes(subject) 
                        ? 'bg-primary border-primary' 
                        : 'border-input'
                    }`}>
                      {selectedSubjects.includes(subject) && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-4 h-4">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <SheetFooter>
            <Button onClick={handleAddClass}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClassManager;
