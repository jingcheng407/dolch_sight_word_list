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
    description: '看例句猜单词，测试你的记忆！',
    colors: {
      from: '#58CC02',
      to: '#45A102'
    }
  },
  {
    id: 'memory' as GameMode,
    icon: '🧠',
    name: '记忆翻牌',
    description: '找到单词和例句的配对！',
    colors: {
      from: '#1CB0F6',
      to: '#1899D6'
    }
  },
  {
    id: 'bubble' as GameMode,
    icon: '🫧',
    name: '泡泡单词',
    description: '点击正确的单词泡泡！',
    colors: {
      from: '#CE82FF',
      to: '#B568E8'
    }
  },
  {
    id: 'speed' as GameMode,
    icon: '⚡',
    name: '闪电拼写',
    description: '快速拼写单词，挑战速度极限！',
    colors: {
      from: '#FFC800',
      to: '#E6B400'
    }
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
      <div 
        className="text-center rounded-2xl p-6 mb-6 flex-shrink-0 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #58CC02 0%, #1CB0F6 100%)',
          color: 'white'
        }}
      >
        <div className="text-5xl mb-3">🐰</div>
        <h2 className="text-2xl font-bold mb-2">和小兔子一起玩游戏！</h2>
        <p className="text-sm text-white/90">选择一个游戏开始吧！</p>
      </div>

      {/* Game Modes */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-4 h-full">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className="h-full p-0 border-0 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${game.colors.from} 0%, ${game.colors.to} 100%)`,
              }}
            >
              <div className="text-center p-6 h-full flex flex-col justify-center text-white">
                <div className="text-5xl mb-4 filter drop-shadow-lg">{game.icon}</div>
                <h3 className="text-xl font-bold mb-2 drop-shadow-sm">{game.name}</h3>
                <p className="text-sm text-white/90 leading-relaxed">{game.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}