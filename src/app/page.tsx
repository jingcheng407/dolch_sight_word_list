'use client';

import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
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
    <Container>
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {renderTabContent()}
      </main>
    </Container>
  );
}
