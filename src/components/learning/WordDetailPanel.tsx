import { Badge } from '@/components/ui/badge';
import { Word } from '@/types/word';
import { useAudio } from '@/hooks/useAudio';

interface WordDetailPanelProps {
  word: Word | null;
  onGoToPractice?: () => void;
}

export function WordDetailPanel({ word, onGoToPractice }: WordDetailPanelProps) {
  const { speakWord } = useAudio();

  if (!word) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center text-center p-6">
        <div 
          className="rounded-2xl p-8 shadow-lg w-full"
          style={{
            background: 'linear-gradient(135deg, #1CB0F6 0%, #CE82FF 100%)'
          }}
        >
          <div className="text-white">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">选择一个单词</h3>
            <p className="text-white/90 text-sm">
              点击左侧的单词卡片查看详细信息
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div 
        className="rounded-2xl p-6 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #58CC02 0%, #1CB0F6 100%)'
        }}
      >
        {/* 头部装饰 */}
        <div className="flex justify-center gap-3 mb-6">
          <span className="text-3xl filter drop-shadow-lg">⭐</span>
          <span className="text-3xl filter drop-shadow-lg">✨</span>
          <span className="text-3xl filter drop-shadow-lg">⭐</span>
        </div>

        {/* 单词标题 */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-white mb-3 filter drop-shadow-sm">
            {word.word}
          </h2>
          <p className="text-xl text-white/90 mb-4">
            {word.pronunciation}
          </p>
          <Badge 
            className="text-sm font-semibold px-3 py-1"
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {word.category}
          </Badge>
        </div>

        {/* 例句 */}
        <div className="mb-6">
          <div 
            className="bg-white/20 rounded-xl p-4 backdrop-blur-sm"
            style={{ border: '1px solid rgba(255, 255, 255, 0.3)' }}
          >
            <p className="text-white text-center italic text-lg leading-relaxed">
              &ldquo;{word.example}&rdquo;
            </p>
          </div>
        </div>

        {/* 功能按钮 */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => speakWord(word.word)}
            className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #CE82FF 0%, #B568E8 100%)'
            }}
          >
            <span className="text-xl">🔊</span>
            听发音
          </button>
          
          <button
            onClick={onGoToPractice}
            className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #FFC800 0%, #E6B400 100%)'
            }}
          >
            <span className="text-xl">🎮</span>
            去练习
          </button>
        </div>
      </div>
    </div>
  );
}