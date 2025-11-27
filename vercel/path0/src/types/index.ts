export type UserProfile = {
    displayName: string;
    tutorTheme?: 'mario' | 'sonic';
}

export type Lesson = {
  id: string;
  title: string;
  description?: string;
  stage: 'Foundation' | 'Development' | 'Mastery';
  content?: string;
  completed: boolean;
  isRecap?: boolean;
  prerequisites?: string[];
};

export type Subject = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  lessons: Lesson[];
};

export type TimetableDay = {
  day: string;
  periods: string[];
};

export type TimetableData = {
  week: number;
  days: TimetableDay[];
};