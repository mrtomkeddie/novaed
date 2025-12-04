'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

type TimetableData = {
    week: number;
    days: {
        day: string;
        periods: (string | null)[];
    }[];
}[];

// The timetable data is now hardcoded here for simplicity and reliability.
export const timetableData: TimetableData = [
    {
        week: 1,
        days: [
            { day: 'Monday', periods: ['Synthesis', 'English A (Grammar)', 'Biology'] },
            { day: 'Tuesday', periods: ['Maths (Applied)', 'English B (Comprehension)', 'Chemistry'] },
            { day: 'Wednesday', periods: ['English A (Grammar)', 'Chemistry', 'Synthesis'] },
            { day: 'Thursday', periods: ['Physics', 'Biology', 'English B (Comprehension)'] },
            { day: 'Friday', periods: ['English B (Comprehension)', 'Maths (Applied)', 'Physics'] },
        ]
    },
    {
        week: 2,
        days: [
            { day: 'Monday', periods: ['Chemistry', 'English A (Grammar)', 'Physics'] },
            { day: 'Tuesday', periods: ['Synthesis', 'Biology', 'English B (Comprehension)'] },
            { day: 'Wednesday', periods: ['English A (Grammar)', 'Synthesis', 'Maths (Applied)'] },
            { day: 'Thursday', periods: ['English B (Comprehension)', 'Chemistry', 'Biology'] },
            { day: 'Friday', periods: ['Physics', 'Maths (Applied)', 'Synthesis'] },
        ]
    }
];

const lessonTimes = ['9:30 - 9:55 AM', '10:00 - 10:25 AM', '10:30 - 10:55 AM'];

interface TimetableProps {
    selectedWeek: number;
    currentDay?: string;
    currentLessonIndex?: number;
}

export function Timetable({ selectedWeek, currentDay, currentLessonIndex }: TimetableProps) {
    const weekData = timetableData.find(w => w.week === selectedWeek);

    return (
        <div className="w-full">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead className="w-[120px]">Day</TableHead>
                      {lessonTimes.map((time, periodIndex) => (
                          <TableHead key={periodIndex} className="text-center">
                              {time}
                          </TableHead>
                      ))}
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {weekData?.days.map((dayData) => {
                      const isToday = dayData.day === currentDay;
                      return (
                      <TableRow key={dayData.day}>
                          <TableCell className="font-medium text-muted-foreground">
                              {dayData.day}
                          </TableCell>
                          {dayData.periods.map((period, periodIndex) => {
                                if (!period) {
                                    return <TableCell key={periodIndex}></TableCell>; // Empty cell if no lesson
                                }

                                const isCurrentLesson = isToday && periodIndex === currentLessonIndex;
                                
                                return (
                                    <TableCell 
                                        key={periodIndex} 
                                        className={cn(
                                            "text-center font-semibold text-foreground", // Force white/foreground text
                                            isCurrentLesson && "bg-primary/10 rounded-md" // Highlight current lesson (Subtle)
                                        )}
                                    >
                                        {period}
                                    </TableCell>
                                )
                          })}
                      </TableRow>
                  )})}
              </TableBody>
          </Table>
        </div>
    );
}
