"use client";

import { Button } from "@/components/ui/button";
import { Play, Star, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

type GameCardProps = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: "green" | "blue" | "yellow" | "red" | "purple";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  isLocked?: boolean;
  bestScore?: number;
  onClick: () => void;
};

const colorVariants = {
  green: "from-duolingo-green to-duolingo-green/80",
  blue: "from-duolingo-blue to-duolingo-blue/80",
  yellow: "from-duolingo-yellow to-duolingo-yellow/80",
  red: "from-duolingo-red to-duolingo-red/80",
  purple: "from-duolingo-purple to-duolingo-purple/80"
};

const difficultyColors = {
  beginner: "text-duolingo-green",
  intermediate: "text-duolingo-yellow",
  advanced: "text-duolingo-red"
};

const difficultyLabels = {
  beginner: "初级",
  intermediate: "中级", 
  advanced: "高级"
};

export const GameCard = ({
  id,
  title,
  description,
  icon,
  color,
  difficulty,
  estimatedTime,
  isLocked = false,
  bestScore,
  onClick
}: GameCardProps) => {
  return (
    <div className="w-full">
      <Button
        onClick={onClick}
        disabled={isLocked}
        className={cn(
          "w-full h-auto p-0 bg-transparent hover:bg-transparent",
          "focus:outline-none focus:ring-2 focus:ring-duolingo-green/50"
        )}
      >
        <div className={cn(
          "w-full bg-card rounded-2xl border-2 transition-all duration-200 overflow-hidden",
          "hover:shadow-xl hover:scale-105",
          isLocked ? "border-muted opacity-60" : "border-border shadow-lg"
        )}>
          {/* 头部渐变区域 */}
          <div className={cn(
            "h-20 flex items-center justify-center relative overflow-hidden",
            isLocked ? "bg-muted" : `bg-gradient-to-r ${colorVariants[color]}`
          )}>
            <div className="text-4xl">{icon}</div>
            
            {/* 最佳分数标记 */}
            {bestScore && !isLocked && (
              <div className="absolute top-2 right-2 bg-white/20 rounded-full px-2 py-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-bold">{bestScore}</span>
                </div>
              </div>
            )}
          </div>

          {/* 内容区域 */}
          <div className="p-4 space-y-3">
            {/* 标题和描述 */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-tight">{description}</p>
            </div>

            {/* 游戏信息 */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span className={difficultyColors[difficulty]}>
                  {difficultyLabels[difficulty]}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{estimatedTime}</span>
              </div>
            </div>

            {/* 开始按钮 */}
            {!isLocked && (
              <div className="pt-2">
                <div className={cn(
                  "w-full py-2 px-4 rounded-lg text-white font-medium text-sm",
                  "flex items-center justify-center gap-2 transition-all",
                  `bg-gradient-to-r ${colorVariants[color]} hover:scale-105`
                )}>
                  <Play className="w-4 h-4" />
                  开始游戏
                </div>
              </div>
            )}

            {/* 锁定状态 */}
            {isLocked && (
              <div className="pt-2 text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 完成更多课程解锁
                </p>
              </div>
            )}
          </div>
        </div>
      </Button>
    </div>
  );
};