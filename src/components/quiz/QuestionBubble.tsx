"use client";

import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type QuestionBubbleProps = {
  question: string;
  hint?: string;
  onPlayAudio?: () => void;
  className?: string;
};

export const QuestionBubble = ({ 
  question, 
  hint, 
  onPlayAudio, 
  className 
}: QuestionBubbleProps) => {
  return (
    <div className={cn("relative max-w-md mx-auto", className)}>
      {/* 吉祥物头像 */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-duolingo-green rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl">🦉</span>
        </div>
      </div>

      {/* 对话气泡 */}
      <div className="relative bg-card rounded-2xl p-6 border border-border shadow-lg">
        {/* 气泡尖角 */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-card border-l border-t border-border rotate-45"></div>
        
        {/* 问题内容 */}
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{question}</h2>
          
          {/* 音频播放按钮 */}
          {onPlayAudio && (
            <Button
              onClick={onPlayAudio}
              className="btn-duolingo-primary flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              播放音频
            </Button>
          )}
          
          {/* 提示信息 */}
          {hint && (
            <p className="text-sm text-muted-foreground border-t border-border pt-3">
              💡 提示：{hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};