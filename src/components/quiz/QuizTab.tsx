import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWords } from '@/hooks/useWords';
import { useAudio } from '@/hooks/useAudio';
import { useProgress } from '@/hooks/useProgress';
import { QuizDifficulty, Word } from '@/types/word';

interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
}

export function QuizTab() {
  const { getRandomWords } = useWords();
  const { speakWord, playSuccessSound, playErrorSound } = useAudio();
  const { updateGameStats, markWordLearned } = useProgress();
  
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const questionCounts = {
    easy: 5,
    medium: 8,
    hard: 10
  };

  const startQuiz = () => {
    const questionCount = questionCounts[difficulty];
    const words = getRandomWords(questionCount);
    const allWords = getRandomWords(30); // 用于生成错误选项
    
    const quizQuestions: QuizQuestion[] = words.map(word => {
      const wrongOptions = allWords
        .filter(w => w.word !== word.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.word);
      
      const options = [word.word, ...wrongOptions].sort(() => Math.random() - 0.5);
      
      return {
        word,
        options,
        correctAnswer: word.word
      };
    });

    setQuestions(quizQuestions);
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setScore(0);
    setQuizStarted(true);
    setQuizEnded(false);
    setShowFeedback(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      playSuccessSound();
      setScore(prev => prev + 1);
      markWordLearned(questions[currentQuestion].word.word);
    } else {
      playErrorSound();
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer('');
        setShowFeedback(false);
      } else {
        endQuiz();
      }
    }, 1500);
  };

  const endQuiz = () => {
    const finalScore = Math.round((score / questions.length) * 100);
    updateGameStats(finalScore);
    setQuizEnded(true);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizEnded(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setShowFeedback(false);
  };

  if (!quizStarted) {
    return (
      <div className="flex flex-col h-full">
        {/* Welcome */}
        <div className="text-center bg-white/60 rounded-xl p-4 mb-4 flex-shrink-0">
          <div className="text-4xl mb-2">🦁</div>
          <h2 className="text-xl font-bold mb-1">小狮子考考你！</h2>
          <p className="text-sm text-gray-600">听音频选择正确的单词</p>
        </div>

        {/* Difficulty Selection */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-center text-lg font-bold mb-4">选择难度</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { id: 'easy' as QuizDifficulty, icon: '😊', name: '简单', count: 5, color: 'from-green-200 to-green-300' },
              { id: 'medium' as QuizDifficulty, icon: '😃', name: '普通', count: 8, color: 'from-yellow-200 to-yellow-300' },
              { id: 'hard' as QuizDifficulty, icon: '🤗', name: '挑战', count: 10, color: 'from-red-200 to-red-300' }
            ].map(diff => (
              <Card
                key={diff.id}
                className={`cursor-pointer transition-all duration-200 ${
                  difficulty === diff.id 
                    ? `bg-gradient-to-br ${diff.color} ring-2 ring-blue-400` 
                    : 'bg-gradient-to-br from-white to-gray-100 hover:from-gray-100 hover:to-gray-200'
                }`}
                onClick={() => setDifficulty(diff.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-1">{diff.icon}</div>
                  <h4 className="font-bold text-sm mb-1">{diff.name}</h4>
                  <p className="text-xs text-gray-600">{diff.count}道题</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={startQuiz} className="bg-orange-500 hover:bg-orange-600 max-w-xs mx-auto">
            <span className="mr-2">🚀</span>
            开始答题
          </Button>
        </div>
      </div>
    );
  }

  if (quizEnded) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <div className="text-center bg-white/60 rounded-xl p-6 max-w-md">
          <div className="text-6xl mb-4">
            {percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
          </div>
          <h2 className="text-2xl font-bold mb-2">测验完成！</h2>
          <div className="text-3xl font-bold text-orange-600 mb-2">{percentage}分</div>
          <p className="text-gray-600 mb-4">
            答对 {score} / {questions.length} 题
          </p>
          <div className="flex gap-2">
            <Button onClick={startQuiz} variant="outline">
              <span className="mr-2">🔄</span>
              再测一次
            </Button>
            <Button onClick={resetQuiz}>
              <span className="mr-2">🏠</span>
              返回选择
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const current = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full p-4">
      {/* Progress */}
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        <Progress value={progress} className="flex-1" />
        <span className="text-sm font-medium">
          {currentQuestion + 1}/{questions.length}
        </span>
        <div className="text-sm font-medium">
          得分: {score}
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-6 flex-shrink-0">
        <div className="text-xl font-bold text-gray-800 mb-2">听音频，选择正确的单词</div>
        <Button 
          onClick={() => speakWord(current.word.word)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <span className="mr-2">🔊</span>
          播放音频
        </Button>
        <p className="text-sm text-gray-600 mt-2">
          提示：&ldquo;{current.word.example}&rdquo;
        </p>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 h-full max-h-80">
          {current.options.map((option, index) => (
            <Button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              variant="outline"
              disabled={showFeedback}
              className={`h-full text-lg font-medium transition-all duration-200 ${
                showFeedback
                  ? option === current.correctAnswer
                    ? 'bg-green-500 text-white border-green-500'
                    : option === selectedAnswer
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-gray-100'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">{String.fromCharCode(65 + index)}</div>
                <div>{option}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}