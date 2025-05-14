import React from "react";
import { MacroProgress } from "@/components/ui/MacroProgress";

interface MacroProgressSectionProps {
  entry: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  className?: string;
}

const macroTargets = {
  calories: 2361,
  protein: 225,
  carbs: 201,
  fat: 73,
};

export function MacroProgressSection({ entry, className }: MacroProgressSectionProps) {
  return (
    <div className={`flex flex-col gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 ${className ?? ''}`}>
      <MacroProgress label="Calories" value={entry.calories} target={macroTargets.calories} color="#f59e42" />
      <MacroProgress label="Protein" value={entry.protein} target={macroTargets.protein} color="#60a5fa" />
      <MacroProgress label="Carbs" value={entry.carbs} target={macroTargets.carbs} color="#34d399" />
      <MacroProgress label="Fat" value={entry.fat} target={macroTargets.fat} color="#f472b6" />
    </div>
  );
} 