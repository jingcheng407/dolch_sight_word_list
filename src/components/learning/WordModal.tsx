import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Word } from '@/types/word';
import { useAudio } from '@/hooks/useAudio';

interface WordModalProps {
  word: Word;
  isOpen: boolean;
  onClose: () => void;
}

export function WordModal({ word, isOpen, onClose }: WordModalProps) {
  const { speakWord } = useAudio();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <span className="text-2xl">✨</span>
            <span className="text-2xl">⭐</span>
          </div>
          <DialogTitle className="text-3xl font-bold text-gray-800">
            {word.word}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-lg text-gray-600">
            {word.pronunciation}
          </p>
          
          <Badge variant="secondary" className="text-sm">
            {word.category}
          </Badge>
          
          <p className="text-gray-700 italic">
            &ldquo;{word.example}&rdquo;
          </p>
          
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={() => speakWord(word.word)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <span className="mr-2">🔊</span>
              听发音
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
            >
              <span className="mr-2">🎮</span>
              去练习
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}