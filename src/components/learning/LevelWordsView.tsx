"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WordCard } from './WordCard';
import { WordModal } from './WordModal';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { Word } from '@/types/word';
import wordsData from '@/data/words.json';

type LevelWordsViewProps = {
  level: string;
  onBack: () => void;
};

export const LevelWordsView = ({ level, onBack }: LevelWordsViewProps) => {
  const { 
    getLevelProgress, 
    getLearnedWordsCount, 
    markWordAsLearned 
  } = useLearningProgress();
  
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  useEffect(() => {
    // 根据level加载对应的单词数据
    const levelData = (wordsData as any)[level];
    if (levelData && levelData.words) {
      setWords(levelData.words);
    }
  }, [level]);

  const handleWordSelect = (word: Word) => {
    setSelectedWord(word);
    // 标记单词为已学习
    markWordAsLearned(level, word.word);
  };

  const progress = getLevelProgress(level);
  const learnedWords = getLearnedWordsCount(level);
  const totalWords = words.length;

  const levelTitles: { [key: string]: string } = {
    pre_primer: 'Pre-primer',
    primer: 'Primer', 
    grade_1: 'Grade 1',
    grade_2: 'Grade 2',
    grade_3: 'Grade 3'
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      {/* 头部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回路径
        </Button>
        
        <div className="flex-1">
          <h1 className="text-duolingo-heading">{levelTitles[level]}</h1>
          <p className="text-duolingo-subheading">
            点击单词卡片开始学习
          </p>
        </div>
      </div>

      {/* 进度信息 */}
      <div className="bg-card rounded-2xl p-6 mb-6 border border-border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-duolingo-green rounded-full flex items-center justify-center">
            {progress === 100 ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <BookOpen className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-foreground">
                学习进度
              </span>
              <span className="text-sm text-muted-foreground">
                {learnedWords}/{totalWords} 词汇
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>
        
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {progress === 100 ? '🎉 恭喜完成本级别！' : `${Math.round(progress)}% 完成`}
          </span>
        </div>
      </div>

      {/* 单词网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {words.map((word) => (
          <WordCard
            key={word.word}
            word={word}
            onClick={handleWordSelect}
            className="transition-all duration-200 hover:scale-105"
          />
        ))}
      </div>

      {/* 单词详情模态框 */}
      {selectedWord && (
        <WordModal
          word={selectedWord}
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
};