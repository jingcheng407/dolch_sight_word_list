'use client';

import { useState } from 'react';
import { DuolingoLayout } from '@/components/layout/DuolingoLayout';
import { LearnTab } from '@/components/learning/LearnTab';
import { PracticeTab } from '@/components/games/PracticeTab';
import { QuizTab } from '@/components/quiz/QuizTab';
import { StatsTab } from '@/components/stats/StatsTab';
import { TabType } from '@/types/word';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('learn');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'learn':
        return <LearnTab />;
      case 'practice':
        return <PracticeTab />;
      case 'quiz':
        return <QuizTab />;
      case 'stats':
        return <StatsTab />;
      default:
        return <LearnTab />;
    }
  };

  return (
    <DuolingoLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </DuolingoLayout>
  );
}
