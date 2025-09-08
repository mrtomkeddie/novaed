
import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type Icon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export type Lesson = {
  id: string;
  title: string;
  content?: string;
  completed: boolean;
};

export type Subject = {
  id: string;
  name: string;
  description: string;
  icon: Icon;
  href: string;
  lessons: Lesson[];
};

export type UserProfile = {
    displayName: string;
}
