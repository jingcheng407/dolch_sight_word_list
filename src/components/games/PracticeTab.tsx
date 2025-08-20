import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FlashCardGame } from './FlashCardGame';
import { MemoryGame } from './MemoryGame';
import { GameMode } from '@/types/word';

const games = [
  {
    id: 'flashcard' as GameMode,
    icon: '🎴',
    name: '翻卡片',
    description: '看例句猜单词，测试你的记忆！'
  },
  {
    id: 'memory' as GameMode,
    icon: '🧠',
    name: '记忆翻牌',
    description: '找到单词和例句的配对！'
  },
  {
    id: 'bubble' as GameMode,
    icon: '🫧',
    name: '泡泡单词',
    description: '点击正确的单词泡泡！'
  },
  {
    id: 'speed' as GameMode,
    icon: '⚡',
    name: '闪电拼写',
    description: '快速拼写单词，挑战速度极限！'
  }
];

export function PracticeTab() {
  const [selectedGame, setSelectedGame] = useState<GameMode | null>(null);

  const renderGame = () => {
    switch (selectedGame) {
      case 'flashcard':
        return <FlashCardGame />;
      case 'memory':
        return <MemoryGame />;
      case 'bubble':
      case 'speed':
        return (
          <div className="flex flex-col h-full justify-center items-center">
            <div className="text-center bg-white/60 rounded-xl p-6 max-w-md">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-2">敬请期待</h2>
              <p className="text-gray-600 mb-4">这个游戏正在开发中...</p>
              <Button onClick={() => setSelectedGame(null)} variant="outline">
                <span className="mr-2">🏠</span>
                返回选择
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (selectedGame) {
    return renderGame();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Welcome Message */}
      <div className="text-center bg-white/60 rounded-xl p-4 mb-4 flex-shrink-0">
        <div className="text-4xl mb-2">🐰</div>
        <h2 className="text-xl font-bold mb-1">和小兔子一起玩游戏！</h2>
        <p className="text-sm text-gray-600">选择一个游戏开始吧！</p>
      </div>

      {/* Game Modes */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 h-full">
          {games.map((game) => (
            <Button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              variant="outline"
              className="h-full bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 border-2 hover:border-purple-300 transition-all duration-200"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{game.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{game.name}</h3>
                <p className="text-xs text-gray-600 leading-tight">{game.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}