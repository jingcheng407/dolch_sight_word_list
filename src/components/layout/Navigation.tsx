import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabType } from '@/types/word';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'learn' as TabType, icon: '🎯', label: '学单词' },
  { id: 'practice' as TabType, icon: '🎮', label: '玩游戏' },
  { id: 'quiz' as TabType, icon: '🧩', label: '小测试' },
  { id: 'stats' as TabType, icon: '🏆', label: '我的奖杯' }
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabType)} className="w-full flex-shrink-0">
      <TabsList className="grid w-full grid-cols-4 bg-white/80 rounded-xl p-1 mb-2 h-14">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex flex-col items-center gap-0 p-2 rounded-lg data-[state=active]:bg-gradient-to-b data-[state=active]:from-yellow-200 data-[state=active]:to-orange-200 data-[state=active]:shadow-lg transition-all duration-200"
          >
            <div className="text-lg">{tab.icon}</div>
            <span className="text-xs font-medium">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}