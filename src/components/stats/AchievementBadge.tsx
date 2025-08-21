"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AchievementBadgeProps = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
};

export const AchievementBadge = ({
  id,
  name,
  description,
  icon,
  unlocked,
  unlockedAt
}: AchievementBadgeProps) => {
  return (
    <div className={cn(
      "relative p-4 rounded-2xl border-2 transition-all duration-200",
      "hover:scale-105 cursor-pointer",
      unlocked 
        ? "bg-gradient-to-br from-duolingo-yellow/10 to-duolingo-yellow/5 border-duolingo-yellow/30 shadow-lg" 
        : "bg-muted/30 border-muted grayscale opacity-60"
    )}>
      {/* 徽章图标 */}
      <div className="text-center mb-3">
        <div className={cn(
          "text-4xl mb-2 transition-all duration-200",
          unlocked ? "animate-bounce-soft" : ""
        )}>
          {icon}
        </div>
        
        {/* 解锁效果 */}
        {unlocked && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-duolingo-green rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>

      {/* 徽章信息 */}
      <div className="text-center">
        <h4 className="font-bold text-sm text-foreground mb-1">
          {name}
        </h4>
        <p className="text-xs text-muted-foreground leading-tight mb-2">
          {description}
        </p>

        {/* 状态标记 */}
        {unlocked ? (
          <Badge className="bg-duolingo-green/10 text-duolingo-green border-duolingo-green/20">
            已获得
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            未解锁
          </Badge>
        )}

        {/* 解锁时间 */}
        {unlocked && unlockedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};