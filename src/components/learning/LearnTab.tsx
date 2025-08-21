import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WordCard } from './WordCard';
import { WordModal } from './WordModal';
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
      {/* Welcome Message */}
      <div 
        className="text-center rounded-2xl p-4 mb-4 flex-shrink-0 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #58CC02 0%, #1CB0F6 100%)',
          color: 'white'
        }}
      >
        <span className="text-3xl mb-2 block filter drop-shadow-lg">👋</span>
        <p className="text-base font-medium text-white/95">点击单词卡片，听听怎么读吧！</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center mb-4 flex-shrink-0">
        <button
          onClick={shuffleWords}
          className="px-4 py-2 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #CE82FF 0%, #B568E8 100%)'
          }}
        >
          <span className="mr-2">🎲</span>
          打乱
        </button>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-xl border-0 font-semibold shadow-lg text-white outline-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #FFC800 0%, #E6B400 100%)'
          }}
        >
          <option value="all">🌈 所有类型</option>
          {categories.map(category => (
            <option key={category} value={category} className="bg-yellow-500 text-white">
              {category}
            </option>
          ))}
        </select>

        <button
          onClick={toggleAudio}
          className={`px-4 py-2 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
          style={{
            background: isEnabled 
              ? 'linear-gradient(135deg, #58CC02 0%, #45A102 100%)'
              : 'linear-gradient(135deg, #FF4B4B 0%, #E03A3A 100%)'
          }}
        >
          <span className="mr-2">{isEnabled ? '🔊' : '🔇'}</span>
          {isEnabled ? '关闭' : '开启'}
        </button>
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