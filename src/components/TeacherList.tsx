
import React, { useState } from 'react';
import { TEACHERS, CLASSES } from '@/lib/timetableUtils';
import { Teacher } from '@/lib/types';
import { Edit, Plus, Info, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TeacherList: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const { toast } = useToast();

  const handleViewTeacherInfo = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsInfoOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Teachers</h3>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell className="font-medium">{teacher.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject) => (
                      <span 
                        key={subject} 
                        className="px-2 py-0.5 text-xs rounded-full bg-primary/10"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleViewTeacherInfo(teacher)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Teacher Info Sheet */}
      <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedTeacher?.name}</SheetTitle>
            <SheetDescription>
              Teacher Information
            </SheetDescription>
          </SheetHeader>
          
          {selectedTeacher && (
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Subjects</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedTeacher.subjects.map((subject) => (
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
                <h4 className="text-sm font-medium mb-2">Classes</h4>
                <div className="flex flex-wrap gap-1">
                  {CLASSES.filter(cls => 
                    cls.subjects.some(subject => selectedTeacher.subjects.includes(subject))
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
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TeacherList;
