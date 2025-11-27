
import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type Icon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export type Lesson = {
  id: string;
  title: string;
  description?: string; // Added description
  stage: 'Foundation' | 'Development' | 'Mastery'; // Added stage
  content?: string;
  completed: boolean;
  isRecap?: boolean;
  prerequisites?: string[];
};

export type Subject = {
  id: string;
  name: string;
  description: string;
  icon: Icon;
  href: string;
  lessons: Lesson[];
  isExternal?: boolean;
};

export type UserProfile = {
    displayName: string;
    tutorTheme?: 'mario' | 'sonic';
}
