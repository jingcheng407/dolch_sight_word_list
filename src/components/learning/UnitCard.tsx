"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type UnitCardProps = {
  title: string;
  description: string;
  progress: number;
  totalWords: number;
  learnedWords: number;
  isLocked: boolean;
  color: "green" | "blue" | "yellow" | "red" | "purple";
  onClick: () => void;
};

const colorVariants = {
  green: "bg-duolingo-green",
  blue: "bg-duolingo-blue", 
  yellow: "bg-duolingo-yellow",
  red: "bg-duolingo-red",
  purple: "bg-duolingo-purple"
};

const colorBorders = {
  green: "border-duolingo-green",
  blue: "border-duolingo-blue",
  yellow: "border-duolingo-yellow", 
  red: "border-duolingo-red",
  purple: "border-duolingo-purple"
};

export const UnitCard = ({ 
  title, 
  description, 
  progress, 
  totalWords, 
  learnedWords, 
  isLocked, 
  color,
  onClick 
}: UnitCardProps) => {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* 连接线（除了第一个卡片） */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border"></div>
      
      <Button
        onClick={onClick}
        disabled={isLocked}
        className={cn(
          "w-full h-auto p-0 bg-transparent hover:bg-transparent",
          "focus:outline-none focus:ring-2 focus:ring-duolingo-green/50"
        )}
      >
        <div className={cn(
          "w-full bg-card rounded-2xl p-6 border-2 transition-all duration-200",
          "hover:shadow-xl hover:scale-105",
          isLocked ? "border-muted opacity-60" : colorBorders[color],
          !isLocked && "shadow-lg"
        )}>
          {/* 顶部图标区域 */}
          <div className="flex justify-center mb-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              isLocked ? "bg-muted" : colorVariants[color]
            )}>
              {isLocked ? (
                <Lock className="w-8 h-8 text-muted-foreground" />
              ) : progress === 100 ? (
                <Star className="w-8 h-8 text-white" />
              ) : (
                <BookOpen className="w-8 h-8 text-white" />
              )}
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* 进度信息 */}
          {!isLocked && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">进度</span>
                <span className="font-medium text-foreground">
                  {learnedWords}/{totalWords} 词汇
                </span>
              </div>
              
              <Progress 
                value={progress} 
                className="h-2"
              />
              
              <div className="text-center">
                <span className="text-xs text-muted-foreground">
                  {progress === 100 ? "已完成！" : `${Math.round(progress)}% 完成`}
                </span>
              </div>
            </div>
          )}

          {/* 锁定状态提示 */}
          {isLocked && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                完成上一级别解锁
              </p>
            </div>
          )}
        </div>
      </Button>
    </div>
  );
};