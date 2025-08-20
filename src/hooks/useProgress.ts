import { useState, useEffect } from 'react';
import { UserProgress, Achievement } from '@/types/word';

const STORAGE_KEY = 'dolch-progress';

const initialAchievements: Achievement[] = [
  {
    id: 'first-word',
    name: '第一个单词',
    description: '学会第一个单词',
    icon: '🌟',
    unlocked: false
  },
  {
    id: 'ten-words',
    name: '小学霸',
    description: '学会10个单词',
    icon: '📚',
    unlocked: false
  },
  {
    id: 'all-words',
    name: '单词大师',
    description: '学会所有单词',
    icon: '🏆',
    unlocked: false
  },
  {
    id: 'perfect-quiz',
    name: '完美答题',
    description: '测验获得满分',
    icon: '💯',
    unlocked: false
  },
  {
    id: 'streak-7',
    name: '连续学习',
    description: '连续学习7天',
    icon: '🔥',
    unlocked: false
  }
];

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>({
    wordsLearned: 0,
    totalWords: 40,
    currentStreak: 0,
    longestStreak: 0,
    achievements: initialAchievements,
    gameStats: {
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      averageScore: 0
    },
    wordProgress: []
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedProgress = JSON.parse(saved);
        setProgress(prev => ({
          ...prev,
          ...parsedProgress,
          achievements: initialAchievements.map(achievement => ({
            ...achievement,
            ...(parsedProgress.achievements?.find((a: Achievement) => a.id === achievement.id) || {})
          }))
        }));
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, []);

  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  const markWordLearned = (word: string) => {
    const newProgress = { ...progress };
    const existingProgress = newProgress.wordProgress.find(w => w.word === word);
    
    if (existingProgress) {
      existingProgress.learned = true;
      existingProgress.correctCount += 1;
      existingProgress.lastPracticed = new Date();
    } else {
      newProgress.wordProgress.push({
        word,
        learned: true,
        correctCount: 1,
        wrongCount: 0,
        lastPracticed: new Date()
      });
    }
    
    newProgress.wordsLearned = newProgress.wordProgress.filter(w => w.learned).length;
    
    // Check for achievements
    checkAchievements(newProgress);
    
    saveProgress(newProgress);
  };

  const updateGameStats = (score: number) => {
    const newProgress = { ...progress };
    newProgress.gameStats.gamesPlayed += 1;
    newProgress.gameStats.totalScore += score;
    newProgress.gameStats.bestScore = Math.max(newProgress.gameStats.bestScore, score);
    newProgress.gameStats.averageScore = newProgress.gameStats.totalScore / newProgress.gameStats.gamesPlayed;
    
    // Check for perfect score achievement
    if (score === 100) {
      unlockAchievement(newProgress, 'perfect-quiz');
    }
    
    saveProgress(newProgress);
  };

  const checkAchievements = (newProgress: UserProgress) => {
    if (newProgress.wordsLearned >= 1) {
      unlockAchievement(newProgress, 'first-word');
    }
    if (newProgress.wordsLearned >= 10) {
      unlockAchievement(newProgress, 'ten-words');
    }
    if (newProgress.wordsLearned >= newProgress.totalWords) {
      unlockAchievement(newProgress, 'all-words');
    }
  };

  const unlockAchievement = (newProgress: UserProgress, achievementId: string) => {
    const achievement = newProgress.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();
    }
  };

  const getProgressPercentage = () => {
    return Math.round((progress.wordsLearned / progress.totalWords) * 100);
  };

  const isWordLearned = (word: string) => {
    return progress.wordProgress.find(w => w.word === word)?.learned || false;
  };

  return {
    progress,
    markWordLearned,
    updateGameStats,
    getProgressPercentage,
    isWordLearned,
    saveProgress
  };
}