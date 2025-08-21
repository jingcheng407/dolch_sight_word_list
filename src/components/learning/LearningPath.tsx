"use client";

import { useState } from 'react';
import { UnitCard } from './UnitCard';
import { LevelWordsView } from './LevelWordsView';
import { useLearningProgress } from '@/hooks/useLearningProgress';

type LevelInfo = {
  id: string;
  title: string;
  description: string;
  color: "green" | "blue" | "yellow" | "red" | "purple";
  totalWords: number;
};

const levels: LevelInfo[] = [
  {
    id: 'pre_primer',
    title: 'Pre-primer',
    description: '40个最基础的常见词汇，适合学前儿童学习',
    color: 'green',
    totalWords: 40
  },
  {
    id: 'primer',
    title: 'Primer',
    description: '52个基础词汇，建立阅读基础',
    color: 'blue', 
    totalWords: 52
  },
  {
    id: 'grade_1',
    title: 'Grade 1',
    description: '41个一年级核心词汇',
    color: 'yellow',
    totalWords: 41
  },
  {
    id: 'grade_2',
    title: 'Grade 2', 
    description: '46个二年级进阶词汇',
    color: 'red',
    totalWords: 46
  },
  {
    id: 'grade_3',
    title: 'Grade 3',
    description: '41个三年级高级词汇',
    color: 'purple',
    totalWords: 41
  }
];

export const LearningPath = () => {
  const { 
    getLevelProgress, 
    isLevelUnlocked, 
    getLearnedWordsCount 
  } = useLearningProgress();
  
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  if (selectedLevel) {
    return (
      <LevelWordsView 
        level={selectedLevel}
        onBack={() => setSelectedLevel(null)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* 头部标题 */}
      <div className="text-center mb-8">
        <h1 className="text-duolingo-heading mb-2">学习路径</h1>
        <p className="text-duolingo-subheading">
          按顺序学习Dolch单词，掌握英语阅读基础
        </p>
      </div>

      {/* 技能树 */}
      <div className="space-y-12">
        {levels.map((level, index) => {
          const progress = getLevelProgress(level.id);
          const learnedWords = getLearnedWordsCount(level.id);
          const isLocked = !isLevelUnlocked(level.id);

          return (
            <div key={level.id} className="relative">
              {/* 第一个卡片不显示连接线 */}
              {index === 0 && (
                <style jsx>{`
                  .first-card .absolute {
                    display: none;
                  }
                `}</style>
              )}
              
              <div className={index === 0 ? "first-card" : ""}>
                <UnitCard
                  title={level.title}
                  description={level.description}
                  progress={progress}
                  totalWords={level.totalWords}
                  learnedWords={learnedWords}
                  isLocked={isLocked}
                  color={level.color}
                  onClick={() => !isLocked && setSelectedLevel(level.id)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部激励信息 */}
      <div className="mt-12 text-center">
        <div className="bg-duolingo-green/10 rounded-2xl p-6 border border-duolingo-green/20">
          <h3 className="text-lg font-bold text-duolingo-green mb-2">
            继续努力！
          </h3>
          <p className="text-sm text-muted-foreground">
            每天坚持学习，提升英语阅读能力
          </p>
        </div>
      </div>
    </div>
  );
};