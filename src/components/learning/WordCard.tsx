import { Card, CardContent } from '@/components/ui/card';
import { Word } from '@/types/word';
import { useAudio } from '@/hooks/useAudio';
import { useProgress } from '@/hooks/useProgress';
import { cn } from '@/lib/utils';

interface WordCardProps {
  word: Word;
  onClick?: (word: Word) => void;
  className?: string;
}


export function WordCard({ word, onClick, className }: WordCardProps) {
  const { speakWord } = useAudio();
  const { isWordLearned, markWordLearned } = useProgress();
  const learned = isWordLearned(word.word);

  const handleClick = () => {
    speakWord(word.word);
    if (!learned) {
      markWordLearned(word.word);
    }
    onClick?.(word);
  };

  return (
    <div 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 w-full h-full flex flex-col min-h-0 min-w-0 rounded-2xl shadow-lg overflow-hidden",
        className
      )}
      onClick={handleClick}
      style={{ 
        minHeight: '75px',
        minWidth: '75px',
        background: learned 
          ? 'linear-gradient(135deg, #58CC02 0%, #45A102 100%)'
          : 'linear-gradient(135deg, #1CB0F6 0%, #1899D6 100%)'
      }}
    >
      <div className="p-3 text-center relative h-full flex flex-col justify-center text-white">
        {learned && (
          <div className="absolute top-1 right-1 text-lg filter drop-shadow-sm">
            ⭐
          </div>
        )}
        
        <div className="flex flex-col justify-center items-center space-y-1">
          <h3 className="font-bold leading-tight text-center filter drop-shadow-sm" style={{ fontSize: 'clamp(12px, 2.5vw, 16px)' }}>
            {word.word}
          </h3>
          <div 
            className="text-white/80 leading-tight text-center"
            style={{ fontSize: 'clamp(9px, 1.8vw, 12px)' }}
          >
            {word.pronunciation}
          </div>
        </div>
      </div>
    </div>
  );
}