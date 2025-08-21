"use client";

import { useState, useEffect } from 'react';

type LevelProgress = {
  level: string;
  learnedWords: string[];
  totalWords: number;
  isUnlocked: boolean;
};

type LearningProgress = {
  [key: string]: LevelProgress;
};

export const useLearningProgress = () => {
  const [progress, setProgress] = useState<LearningProgress>({});

  // 初始化进度数据
  useEffect(() => {
    const savedProgress = localStorage.getItem('dolch-learning-progress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    } else {
      // 初始状态：只有pre_primer解锁
      const initialProgress: LearningProgress = {
        pre_primer: {
          level: 'pre_primer',
          learnedWords: [],
          totalWords: 40,
          isUnlocked: true
        },
        primer: {
          level: 'primer', 
          learnedWords: [],
          totalWords: 52,
          isUnlocked: false
        },
        grade_1: {
          level: 'grade_1',
          learnedWords: [],
          totalWords: 41,
          isUnlocked: false
        },
        grade_2: {
          level: 'grade_2',
          learnedWords: [],
          totalWords: 46,
          isUnlocked: false
        },
        grade_3: {
          level: 'grade_3',
          learnedWords: [],
          totalWords: 41,
          isUnlocked: false
        }
      };
      setProgress(initialProgress);
    }
  }, []);

  // 保存进度到localStorage
  const saveProgress = (newProgress: LearningProgress) => {
    setProgress(newProgress);
    localStorage.setItem('dolch-learning-progress', JSON.stringify(newProgress));
  };

  // 标记单词为已学习
  const markWordAsLearned = (level: string, word: string) => {
    const updatedProgress = { ...progress };
    const levelProgress = updatedProgress[level];
    
    if (levelProgress && !levelProgress.learnedWords.includes(word)) {
      levelProgress.learnedWords = [...levelProgress.learnedWords, word];
      
      // 检查是否完成当前级别
      const completionRate = levelProgress.learnedWords.length / levelProgress.totalWords;
      if (completionRate >= 0.8) { // 80%完成率解锁下一级别
        const levels = ['pre_primer', 'primer', 'grade_1', 'grade_2', 'grade_3'];
        const currentIndex = levels.indexOf(level);
        if (currentIndex < levels.length - 1) {
          const nextLevel = levels[currentIndex + 1];
          if (updatedProgress[nextLevel]) {
            updatedProgress[nextLevel].isUnlocked = true;
          }
        }
      }
      
      saveProgress(updatedProgress);
    }
  };

  // 计算级别完成百分比
  const getLevelProgress = (level: string): number => {
    const levelData = progress[level];
    if (!levelData) return 0;
    return Math.round((levelData.learnedWords.length / levelData.totalWords) * 100);
  };

  // 检查级别是否解锁
  const isLevelUnlocked = (level: string): boolean => {
    return progress[level]?.isUnlocked || false;
  };

  // 获取已学习的单词数量
  const getLearnedWordsCount = (level: string): number => {
    return progress[level]?.learnedWords.length || 0;
  };

  // 重置进度
  const resetProgress = () => {
    localStorage.removeItem('dolch-learning-progress');
    setProgress({});
  };

  return {
    progress,
    markWordAsLearned,
    getLevelProgress,
    isLevelUnlocked,
    getLearnedWordsCount,
    resetProgress
  };
};