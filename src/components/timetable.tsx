
'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from './ui/button';
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

export const colorMap: { [key: string]: string } = {
    'maths (core)': '#529E72',
    'maths (applied)': '#C77D48',
    'english a (grammar)': '#E65B58',
    'english b (comprehension)': '#379AD3',
    'biology': '#9D68D3',
    'physics': '#D8A7B1',
    'chemistry': '#A8B5A2',
    'synthesis': '#4AB473', // A new color for Synthesis
};

const lessonTimes = ['9:30 - 9:55 AM', '10:00 - 10:25 AM', '10:30 - 10:55 AM'];

export function Timetable() {
    const [selectedWeek, setSelectedWeek] = useState(1);
    
    const weekData = timetableData.find(w => w.week === selectedWeek);

    return (
        <div className="w-full">
            <div className="flex items-center justify-end gap-2 mb-4">
                <Button
                    variant={selectedWeek === 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedWeek(1)}
                >
                    Week 1
                </Button>
                    <Button
                    variant={selectedWeek === 2 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedWeek(2)}
                >
                    Week 2
                </Button>
            </div>
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
                  {weekData?.days.map((dayData) => (
                      <TableRow key={dayData.day}>
                          <TableCell className="font-medium text-muted-foreground">
                              {dayData.day}
                          </TableCell>
                          {dayData.periods.map((period, periodIndex) => {
                                if (!period) {
                                    return <TableCell key={periodIndex}></TableCell>; // Empty cell if no lesson
                                }

                                const lookupKey = period.toLowerCase().trim();
                                const colorValue = colorMap[lookupKey];
                                const style: React.CSSProperties = colorValue ? { color: colorValue } : {};

                                const match = period.match(/(.+) \((.+)\)/);
                                let mainText = period;
                                let subText: string | null = null;

                                if (match) {
                                    mainText = match[1].trim();
                                    subText = `(${match[2].trim()})`;
                                }
                                
                                return (
                                    <TableCell key={periodIndex} className="text-center">
                                         <div className="font-semibold" style={style}>
                                            {mainText}
                                            {subText && (
                                                <span className="mt-1 block font-normal text-muted-foreground text-xs">{subText}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                )
                          })}
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </div>
    );
}
