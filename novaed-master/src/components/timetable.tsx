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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// The timetable data is now hardcoded here for simplicity and reliability.
export const timetableData = [
    {
      day: 'Monday',
      periods: ['Maths (Core)', 'English A (Grammar)', 'Biology', 'Physics', 'Chemistry'],
    },
    {
      day: 'Tuesday',
      periods: ['Maths (Applied)', 'English B (Comprehension)', 'Maths (Core)', 'Biology', 'Physics'],
    },
    {
      day: 'Wednesday',
      periods: ['English A (Grammar)', 'Chemistry', 'Maths (Applied)', 'English B (Comprehension)', 'Biology'],
    },
    {
      day: 'Thursday',
      periods: ['Physics', 'Maths (Core)', 'English A (Grammar)', 'Chemistry', 'Maths (Applied)'],
    },
    {
      day: 'Friday',
      periods: ['English B (Comprehension)', 'Biology', 'Maths (Applied)', 'Physics', 'Chemistry'],
    },
];

export const colorMap: { [key: string]: string } = {
    'maths (core)': '#529E72',
    'maths (applied)': '#C77D48',
    'english a (grammar)': '#E65B58',
    'english b (comprehension)': '#379AD3',
    'biology': '#9D68D3',
    'physics': '#D8A7B1',
    'chemistry': '#A8B5A2',
};

export function Timetable() {
    const [selectedDay, setSelectedDay] = React.useState('Monday');
    
    React.useEffect(() => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const validDays = timetableData.map(d => d.day);
      if (validDays.includes(today)) {
        setSelectedDay(today);
      }
    }, []);

    const daySchedule = timetableData.find(d => d.day === selectedDay);

    return (
        <div className="w-full">
            <div className="flex justify-center mt-4 mb-2">
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {timetableData.map((dayData) => (
                    <SelectItem key={dayData.day} value={dayData.day}>
                      {dayData.day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {daySchedule && (
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="w-[100px]">Lesson</TableHead>
                          <TableHead>Subject</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {daySchedule.periods.map((period, index) => {
                          const lookupKey = period.toLowerCase().trim();
                          const colorValue = colorMap[lookupKey];
                          const style: React.CSSProperties = colorValue ? { color: colorValue, fontWeight: 600 } : {};

                          const match = period.match(/(.+) \((.+)\)/);
                          let mainText = period;
                          let subText: string | null = null;

                          if (match) {
                              mainText = match[1].trim();
                              subText = `(${match[2].trim()})`;
                          }

                          return (
                              <TableRow key={index}>
                                  <TableCell className="font-medium text-muted-foreground">Lesson {index + 1}</TableCell>
                                  <TableCell>
                                       <div className="font-semibold" style={style}>
                                          {mainText}
                                          {subText && (
                                              <span className="mt-1 block font-normal text-muted-foreground text-xs">{subText}</span>
                                          )}
                                      </div>
                                  </TableCell>
                              </TableRow>
                          );
                      })}
                  </TableBody>
              </Table>
            )}
        </div>
    );
}
