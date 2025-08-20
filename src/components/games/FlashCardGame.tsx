import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWords } from '@/hooks/useWords';
import { useAudio } from '@/hooks/useAudio';
import { useProgress } from '@/hooks/useProgress';
import { Word } from '@/types/word';

export function FlashCardGame() {
  const { getRandomWords } = useWords();
  const { speakWord, playSuccessSound, playErrorSound } = useAudio();
  const { markWordLearned, updateGameStats } = useProgress();
  
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const startGame = () => {
    const words = getRandomWords(10);
    setGameWords(words);
    setCurrentIndex(0);
    setShowAnswer(false);
    setScore(0);
    setGameStarted(true);
    setGameEnded(false);
  };

  const handleKnow = () => {
    playSuccessSound();
    setScore(prev => prev + 10);
    markWordLearned(gameWords[currentIndex].word);
    nextCard();
  };

  const handleDontKnow = () => {
    playErrorSound();
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < gameWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameEnded(true);
    updateGameStats(Math.round((score / (gameWords.length * 10)) * 100));
  };

  const flipCard = () => {
    setShowAnswer(!showAnswer);
    if (!showAnswer) {
      speakWord(gameWords[currentIndex].word);
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <div className="text-center bg-white/60 rounded-xl p-6 max-w-md">
          <div className="text-6xl mb-4">🎴</div>
          <h2 className="text-2xl font-bold mb-2">翻卡片游戏</h2>
          <p className="text-gray-600 mb-4">看到中文点击翻卡片，知道就点&ldquo;认识&rdquo;，不知道就点&ldquo;不认识&rdquo;</p>
          <Button onClick={startGame} className="bg-green-500 hover:bg-green-600">
            <span className="mr-2">🚀</span>
            开始游戏
          </Button>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <div className="text-center bg-white/60 rounded-xl p-6 max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">游戏结束！</h2>
          <div className="text-3xl font-bold text-green-600 mb-2">{score} 分</div>
          <p className="text-gray-600 mb-4">
            正确率: {Math.round((score / (gameWords.length * 10)) * 100)}%
          </p>
          <div className="flex gap-2">
            <Button onClick={startGame} variant="outline">
              <span className="mr-2">🔄</span>
              再玩一次
            </Button>
            <Button onClick={() => setGameStarted(false)}>
              <span className="mr-2">🏠</span>
              返回选择
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = gameWords[currentIndex];
  const progress = ((currentIndex + 1) / gameWords.length) * 100;

  return (
    <div className="flex flex-col h-full p-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-4">
        <Progress value={progress} className="flex-1" />
        <span className="text-sm font-medium">
          {currentIndex + 1}/{gameWords.length}
        </span>
        <div className="text-sm font-medium">
          分数: {score}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center">
        <Card 
          className="w-80 h-60 cursor-pointer transition-all duration-300 hover:shadow-xl"
          onClick={flipCard}
        >
          <CardContent className="h-full flex items-center justify-center p-6">
            {!showAnswer ? (
              <div className="text-center">
                <div className="text-6xl mb-4">🤔</div>
                <p className="text-xl text-gray-600">点击翻卡片</p>
                <p className="text-2xl font-bold mt-2">&ldquo;{currentWord.example}&rdquo;</p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">
                  {currentWord.word}
                </h2>
                <p className="text-lg text-gray-600 mb-2">
                  {currentWord.pronunciation}
                </p>
                <p className="text-sm text-gray-500 italic">
                  {currentWord.category}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      {showAnswer && (
        <div className="flex gap-4 justify-center mt-4">
          <Button 
            onClick={handleDontKnow} 
            variant="outline"
            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-300"
          >
            <span className="mr-2">❌</span>
            不认识
          </Button>
          <Button 
            onClick={handleKnow}
            className="bg-green-500 hover:bg-green-600"
          >
            <span className="mr-2">✅</span>
            认识
          </Button>
        </div>
      )}
    </div>
  );
}