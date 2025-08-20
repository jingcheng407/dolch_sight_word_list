export interface Word {
  word: string;
  pronunciation: string;
  category: string;
  example: string;
}

export interface WordProgress {
  word: string;
  learned: boolean;
  correctCount: number;
  wrongCount: number;
  lastPracticed?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface GameStats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
}

export interface UserProgress {
  wordsLearned: number;
  totalWords: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  gameStats: GameStats;
  wordProgress: WordProgress[];
}

export type TabType = 'learn' | 'practice' | 'quiz' | 'stats';
export type GameMode = 'flashcard' | 'bubble' | 'memory' | 'speed' | 'catch';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';