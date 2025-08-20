import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WordCard } from './WordCard';
import { WordModal } from './WordModal';
import { GridDebugger } from '@/components/debug/GridDebugger';
import { useWords } from '@/hooks/useWords';
import { useAudio } from '@/hooks/useAudio';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { Word } from '@/types/word';

export function LearnTab() {
  const { filteredWords, categories, selectedCategory, setSelectedCategory, shuffleWords } = useWords();
  const { isEnabled, toggleAudio } = useAudio();
  const { columns, rows, maxItems } = useResponsiveGrid();
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GridDebugger />
      {/* Welcome Message */}
      <div className="text-center bg-white/60 rounded-xl p-2 mb-2 flex-shrink-0">
        <span className="text-xl mb-1 block">👋</span>
        <p className="text-sm text-gray-700">点击单词卡片，听听怎么读吧！</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-center mb-2 flex-shrink-0">
        <Button
          onClick={shuffleWords}
          variant="outline"
          className="bg-white/80 hover:bg-white text-xs px-3 py-1 h-8"
        >
          <span className="mr-1">🎲</span>
          打乱
        </Button>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-2 py-1 text-xs rounded-lg border border-gray-300 bg-white/80 hover:bg-white transition-colors"
        >
          <option value="all">🌈 所有类型</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <Button
          onClick={toggleAudio}
          variant="outline"
          className={`bg-white/80 hover:bg-white text-xs px-3 py-1 h-8 ${isEnabled ? 'text-green-600' : 'text-red-600'}`}
        >
          <span className="mr-1">{isEnabled ? '🔊' : '🔇'}</span>
          {isEnabled ? '关闭' : '开启'}
        </Button>
      </div>

      {/* Words Grid */}
      <div className="flex-1 overflow-hidden p-1">
        <div 
          className="grid gap-2 h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(75px, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(75px, 1fr))`,
            maxHeight: '100%',
            maxWidth: '100%'
          }}
        >
          {filteredWords.slice(0, maxItems).map((word) => (
            <div key={word.word} className="min-h-0 min-w-0">
              <WordCard
                word={word}
                onClick={setSelectedWord}
              />
            </div>
          ))}
          
          {/* 填充空白格子确保布局完整 */}
          {Array.from({ length: Math.max(0, maxItems - filteredWords.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-0 min-w-0"></div>
          ))}
        </div>
      </div>

      {/* Word Modal */}
      {selectedWord && (
        <WordModal
          word={selectedWord}
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}