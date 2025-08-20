import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWords } from '@/hooks/useWords';
import { useAudio } from '@/hooks/useAudio';
import { useProgress } from '@/hooks/useProgress';

interface MemoryCard {
  id: string;
  word: string;
  type: 'word' | 'example';
  content: string;
  matched: boolean;
  flipped: boolean;
}

export function MemoryGame() {
  const { getRandomWords } = useWords();
  const { playSuccessSound, playErrorSound } = useAudio();
  const { updateGameStats } = useProgress();
  
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const startGame = () => {
    const words = getRandomWords(6); // 6对卡片
    const gameCards: MemoryCard[] = [];
    
    words.forEach((word, index) => {
      // 单词卡片
      gameCards.push({
        id: `word-${index}`,
        word: word.word,
        type: 'word',
        content: word.word,
        matched: false,
        flipped: false
      });
      
      // 例句卡片
      gameCards.push({
        id: `example-${index}`,
        word: word.word,
        type: 'example',
        content: word.example,
        matched: false,
        flipped: false
      });
    });

    // 打乱卡片顺序
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStarted(true);
    setGameEnded(false);
  };

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards.find(card => card.id === cardId)?.matched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // 翻开卡片
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, flipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard && secondCard && firstCard.word === secondCard.word) {
        // 匹配成功
        playSuccessSound();
        setCards(prev => prev.map(card => 
          card.word === firstCard.word ? { ...card, matched: true } : card
        ));
        setMatchedPairs(prev => prev + 1);
        setFlippedCards([]);
        
        // 检查游戏结束
        if (matchedPairs + 1 === 6) {
          setTimeout(() => {
            setGameEnded(true);
            const score = Math.max(100 - moves * 5, 20);
            updateGameStats(score);
          }, 500);
        }
      } else {
        // 匹配失败
        playErrorSound();
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.includes(card.id) ? { ...card, flipped: false } : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <div className="text-center bg-white/60 rounded-xl p-6 max-w-md">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold mb-2">记忆翻牌</h2>
          <p className="text-gray-600 mb-4">找到单词和例句的配对，考验你的记忆力！</p>
          <Button onClick={startGame} className="bg-purple-500 hover:bg-purple-600">
            <span className="mr-2">🚀</span>
            开始游戏
          </Button>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    const score = Math.max(100 - moves * 5, 20);
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <div className="text-center bg-white/60 rounded-xl p-6 max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">恭喜完成！</h2>
          <div className="text-3xl font-bold text-purple-600 mb-2">{score} 分</div>
          <p className="text-gray-600 mb-4">
            用了 {moves} 步完成游戏
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

  return (
    <div className="flex flex-col h-full p-4">
      {/* Game Info */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">
          已配对: {matchedPairs}/6
        </div>
        <div className="text-sm font-medium">
          步数: {moves}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-4 gap-2 h-full max-h-96">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`cursor-pointer transition-all duration-300 aspect-square ${
                card.flipped || card.matched 
                  ? 'bg-gradient-to-br from-white to-gray-100' 
                  : 'bg-gradient-to-br from-blue-200 to-purple-200 hover:from-blue-300 hover:to-purple-300'
              } ${card.matched ? 'ring-2 ring-green-400' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <CardContent className="p-2 h-full flex items-center justify-center">
                {card.flipped || card.matched ? (
                  <div className="text-center">
                    {card.type === 'word' ? (
                      <div className="text-lg font-bold text-gray-800">
                        {card.content}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 italic leading-tight">
                        &ldquo;{card.content}&rdquo;
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-2xl">❓</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}