import Link from "next/link";
import type { Subject } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SubjectCardProps {
  subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const Icon = subject.icon;
  const totalLessons = subject.lessons.length;
  const completedLessons = subject.lessons.filter(l => l.completed).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="font-headline text-lg">{subject.name}</CardTitle>
            <CardDescription className="mt-1">{subject.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 [&>div]:bg-accent" />
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-btn-gradient text-accent-foreground hover:opacity-90">
          <Link href={subject.href}>
            Start Lesson
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
