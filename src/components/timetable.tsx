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
    // Find the maximum number of periods in any day to determine the number of rows.
    const maxPeriods = Math.max(...timetableData.map(d => d.periods.length));

    return (
        <div className="w-full">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead className="w-[100px] text-muted-foreground">Lesson</TableHead>
                      {timetableData.map((dayData) => (
                          <TableHead key={dayData.day} className="text-center">{dayData.day}</TableHead>
                      ))}
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {Array.from({ length: maxPeriods }).map((_, periodIndex) => (
                      <TableRow key={periodIndex}>
                          <TableCell className="font-medium text-muted-foreground text-center">
                              {periodIndex + 1}
                          </TableCell>
                          {timetableData.map((dayData) => {
                              const period = dayData.periods[periodIndex];
                              if (!period) {
                                  return <TableCell key={dayData.day}></TableCell>; // Empty cell if no lesson
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
                                  <TableCell key={dayData.day} className="text-center">
                                      <div className="font-semibold" style={style}>
                                          {mainText}
                                          {subText && (
                                              <span className="mt-1 block font-normal text-muted-foreground text-xs">{subText}</span>
                                          )}
                                      </div>
                                  </TableCell>
                              );
                          })}
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </div>
    );
}
