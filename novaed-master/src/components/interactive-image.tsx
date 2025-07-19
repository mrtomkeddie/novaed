"use client";

import { cn } from '@/lib/utils';

interface Target {
  name: string;
  x: number;
  y: number;
  radius: number;
}

interface InteractiveImageProps {
  imageUrl: string;
  targets: Target[];
  onTargetClick: (name: string) => void;
  animationState: { target: string | null; type: 'correct' | 'incorrect' | null };
}

export function InteractiveImage({ imageUrl, targets, onTargetClick, animationState }: InteractiveImageProps) {
  return (
    <div className="relative w-full max-w-lg mx-auto mt-4 aspect-square">
      {/* Replaced next/image with a standard <img> tag to handle temporary, signed URLs from DALL-E */}
      <img
        src={imageUrl}
        alt="Interactive educational diagram"
        className="rounded-lg object-contain w-full h-full"
      />
      {targets.map((target, index) => (
        <button
          key={index}
          className={cn(
            "absolute rounded-full bg-primary/20 border-2 border-primary/80 transition-all hover:bg-primary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            animationState.target === target.name && (animationState.type === 'correct' ? 'animate-correct' : 'animate-incorrect')
          )}
          style={{
            left: `${target.x}%`,
            top: `${target.y}%`,
            width: `${target.radius * 2}%`,
            height: `${target.radius * 2}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => onTargetClick(target.name)}
          aria-label={`Select ${target.name}`}
        />
      ))}
    </div>
  );
}
