"use client";

import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: "green" | "blue" | "yellow" | "red" | "purple";
  className?: string;
};

const colorVariants = {
  green: "from-duolingo-green/20 to-duolingo-green/10 border-duolingo-green/30",
  blue: "from-duolingo-blue/20 to-duolingo-blue/10 border-duolingo-blue/30",
  yellow: "from-duolingo-yellow/20 to-duolingo-yellow/10 border-duolingo-yellow/30",
  red: "from-duolingo-red/20 to-duolingo-red/10 border-duolingo-red/30",
  purple: "from-duolingo-purple/20 to-duolingo-purple/10 border-duolingo-purple/30"
};

const textColors = {
  green: "text-duolingo-green",
  blue: "text-duolingo-blue",
  yellow: "text-duolingo-yellow",
  red: "text-duolingo-red",
  purple: "text-duolingo-purple"
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  className
}: StatCardProps) => {
  return (
    <div className={cn(
      "bg-gradient-to-br rounded-2xl border p-6 transition-all duration-200 hover:scale-105",
      colorVariants[color],
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </h3>
          <div className={cn(
            "text-2xl font-bold mb-1",
            textColors[color]
          )}>
            {value}
          </div>
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};