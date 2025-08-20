import { Card, CardContent } from '@/components/ui/card';
import { Word } from '@/types/word';
import { useAudio } from '@/hooks/useAudio';
import { useProgress } from '@/hooks/useProgress';
import { cn } from '@/lib/utils';

interface WordCardProps {
  word: Word;
  onClick?: (word: Word) => void;
}


export function WordCard({ word, onClick }: WordCardProps) {
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
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50 w-full h-full flex flex-col min-h-0 min-w-0",
        learned && "ring-1 ring-green-400 bg-gradient-to-br from-green-50 to-green-100"
      )}
      onClick={handleClick}
      style={{ 
        minHeight: '75px',
        minWidth: '75px'
      }}
    >
      <CardContent className="p-2 text-center relative h-full flex flex-col justify-center">
        {learned && (
          <div className="absolute top-0 right-0 text-sm">
            ⭐
          </div>
        )}
        
        <div className="flex flex-col justify-center items-center space-y-1">
          <h3 className="font-bold text-gray-800 leading-tight text-center" style={{ fontSize: 'clamp(12px, 2.5vw, 16px)' }}>
            {word.word}
          </h3>
          <div 
            className="text-gray-500 leading-tight text-center"
            style={{ fontSize: 'clamp(9px, 1.8vw, 12px)' }}
          >
            {word.pronunciation}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}