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
import { CheckCircle, Circle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface CurriculumMapProps {
  lessons: Lesson[];
}

export function CurriculumMap({ lessons }: CurriculumMapProps) {
  const lastCompletedIndex = lessons.findLastIndex(lesson => lesson.completed);
  const currentIndex = lastCompletedIndex + 1; // This will be 0 if none are completed.

  return (
    <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px] text-center">Status</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {lessons.map((lesson, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex && currentIndex < lessons.length;
                    
                    const title = lesson.title;
                    const colonIndex = title.indexOf(':');
                    const topic = colonIndex !== -1 ? title.substring(0, colonIndex).trim() : title.trim();
                    const description = colonIndex !== -1 ? title.substring(colonIndex + 1).trim() : '';
                    
                    let statusIcon: React.ReactNode;
                    let statusText: string;

                    if (isCurrent) {
                        statusIcon = <MapPin className="h-5 w-5 text-accent animate-pulse" />;
                        statusText = "Current";
                    } else if (isCompleted) {
                        statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
                        statusText = "Completed";
                    } else {
                        statusIcon = <Circle className="h-5 w-5 text-muted-foreground/30" />;
                        statusText = "Upcoming";
                    }

                    return (
                        <TableRow key={lesson.id} className={cn(isCurrent && "bg-secondary")}>
                            <TableCell className="text-center">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex justify-center">{statusIcon}</div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{statusText}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell>
                                <p className={cn("font-semibold", !isCompleted && !isCurrent && "text-muted-foreground")}>{topic}</p>
                                {description && <p className="text-sm text-muted-foreground md:hidden mt-1">{description}</p>}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                {description}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </div>
  );
}
