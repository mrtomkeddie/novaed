
'use client';

import type { Lesson } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurriculumMapProps {
  lessons: Lesson[];
}

export function CurriculumMap({ lessons }: CurriculumMapProps) {
  
  const getStageVariant = (stage: Lesson['stage']) => {
    switch (stage) {
      case 'Foundation':
        return 'default';
      case 'Development':
        return 'secondary';
      case 'Mastery':
        return 'destructive'; // This will likely need a new variant color
      default:
        return 'outline';
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px]">Stage</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {lessons.map((lesson) => {
                    const isCompleted = lesson.completed;
                    
                    return (
                        <TableRow key={lesson.id} className={cn(isCompleted && "bg-secondary/30")}>
                            <TableCell>
                                <Badge variant={getStageVariant(lesson.stage)}>{lesson.stage}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <p className={cn("font-medium", isCompleted && "text-muted-foreground line-through")}>{lesson.title}</p>
                                </div>
                                {lesson.description && <p className="text-sm text-muted-foreground md:hidden mt-2">{lesson.description}</p>}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                {lesson.description}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </div>
  );
}
