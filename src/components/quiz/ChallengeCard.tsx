"use client";

import { Button } from "@/components/ui/button";
import { Trophy, Target, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type ChallengeCardProps = {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  questionsCount: number;
  timeLimit?: string;
  color: "green" | "blue" | "yellow" | "red" | "purple";
  bestScore?: number;
  isLocked?: boolean;
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

export const ChallengeCard = ({
  id,
  title,
  description,
  icon,
  difficulty,
  questionsCount,
  timeLimit,
  color,
  bestScore,
  isLocked = false,
  onClick
}: ChallengeCardProps) => {
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
            "h-24 flex items-center justify-center relative overflow-hidden",
            isLocked ? "bg-muted" : `bg-gradient-to-r ${colorVariants[color]}`
          )}>
            <div className="text-5xl">{icon}</div>
            
            {/* 最佳分数 */}
            {bestScore && !isLocked && (
              <div className="absolute top-2 right-2 bg-white/20 rounded-full px-3 py-1">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-bold">{bestScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* 内容区域 */}
          <div className="p-6 space-y-4">
            {/* 标题和描述 */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>

            {/* 挑战信息 */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 justify-center">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className={difficultyColors[difficulty]}>
                  {difficultyLabels[difficulty]}
                </span>
              </div>
              
              <div className="flex items-center gap-2 justify-center text-muted-foreground">
                <span className="font-medium">{questionsCount}题</span>
              </div>
            </div>

            {/* 时间限制 */}
            {timeLimit && !isLocked && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{timeLimit}</span>
              </div>
            )}

            {/* 开始按钮 */}
            {!isLocked && (
              <div className="pt-2">
                <div className={cn(
                  "w-full py-3 px-4 rounded-lg text-white font-medium",
                  "flex items-center justify-center gap-2 transition-all",
                  `bg-gradient-to-r ${colorVariants[color]} hover:scale-105`
                )}>
                  开始挑战
                </div>
              </div>
            )}

            {/* 锁定状态 */}
            {isLocked && (
              <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground">
                  🔒 完成前置挑战解锁
                </p>
              </div>
            )}
          </div>
        </div>
      </Button>
    </div>
  );
};