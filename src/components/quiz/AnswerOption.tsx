"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AnswerOptionProps = {
  text: string;
  index: number;
  isSelected?: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export const AnswerOption = ({
  text,
  index,
  isSelected = false,
  isCorrect = false,
  isRevealed = false,
  disabled = false,
  onClick
}: AnswerOptionProps) => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D

  const getButtonStyles = () => {
    if (!isRevealed) {
      return isSelected 
        ? "border-duolingo-blue bg-duolingo-blue/10 text-duolingo-blue" 
        : "border-border hover:border-duolingo-blue/50 hover:bg-duolingo-blue/5";
    }

    if (isCorrect) {
      return "border-duolingo-green bg-duolingo-green/10 text-duolingo-green";
    }

    if (isSelected && !isCorrect) {
      return "border-duolingo-red bg-duolingo-red/10 text-duolingo-red";
    }

    return "border-muted bg-muted/20 text-muted-foreground";
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className={cn(
        "w-full h-auto p-4 text-left justify-start transition-all duration-200",
        "hover:scale-105 active:scale-95",
        getButtonStyles()
      )}
    >
      <div className="flex items-center gap-3 w-full">
        {/* 选项字母 */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
          !isRevealed && isSelected && "bg-duolingo-blue text-white",
          !isRevealed && !isSelected && "bg-muted text-muted-foreground",
          isRevealed && isCorrect && "bg-duolingo-green text-white",
          isRevealed && isSelected && !isCorrect && "bg-duolingo-red text-white",
          isRevealed && !isSelected && !isCorrect && "bg-muted text-muted-foreground"
        )}>
          {isRevealed ? (
            isCorrect ? <Check className="w-4 h-4" /> : 
            isSelected ? <X className="w-4 h-4" /> : letter
          ) : (
            letter
          )}
        </div>

        {/* 选项文本 */}
        <span className="text-base font-medium flex-1">{text}</span>
      </div>
    </Button>
  );
};