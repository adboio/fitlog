import React from "react";

export function MacroProgress({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const percent = Math.min((value / target) * 100, 100);
  const overTarget = value > target;
  const barColor = overTarget ? '#ef4444' : color; // Tailwind red-500
  const labelColor = overTarget ? 'text-red-700' : '';
  return (
    <div className="flex flex-col gap-1">
      <div className={`flex justify-between text-xs font-medium ${labelColor}`}>
        <span>{label}</span>
        <span>{value} / {target}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
} 