import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChallengeCard } from './ChallengeCard';
import { QuestionBubble } from './QuestionBubble';
import { AnswerOption } from './AnswerOption';
import { useWords } from '@/hooks/useWords';
import { useAudio } from '@/hooks/useAudio';
import { useProgress } from '@/hooks/useProgress';
import { QuizDifficulty, Word } from '@/types/word';
import { ArrowLeft, Trophy, Star, Target } from 'lucide-react';

interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
}

const challenges = [
  {
    id: 'easy',
    title: '听音识词',
    description: '听音频选择正确的单词，适合初学者',
    icon: '🎵',
    difficulty: 'beginner' as const,
    questionsCount: 5,
    timeLimit: '无时间限制',
    color: 'green' as const,
    bestScore: 88
  },
  {
    id: 'medium',
    title: '词汇挑战',
    description: '中等难度的词汇测试，考验你的记忆',
    icon: '🎯',
    difficulty: 'intermediate' as const,
    questionsCount: 8,
    timeLimit: '每题15秒',
    color: 'blue' as const,
    bestScore: 75
  },
  {
    id: 'hard',
    title: '极速问答',
    description: '高难度快速问答，挑战你的反应速度',
    icon: '⚡',
    difficulty: 'advanced' as const,
    questionsCount: 10,
    timeLimit: '每题10秒',
    color: 'red' as const,
    bestScore: 60
  },
  {
    id: 'expert',
    title: '专家模式',
    description: '最高难度挑战，只有真正的专家才能通过',
    icon: '👑',
    difficulty: 'advanced' as const,
    questionsCount: 15,
    timeLimit: '每题8秒',
    color: 'purple' as const,
    isLocked: true
  }
];

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
    hard: 10,
    expert: 15
  };

  const startQuiz = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.isLocked) return;
    
    setDifficulty(challengeId as QuizDifficulty);
    const questionCount = challenge.questionsCount;
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
      <div className="max-w-4xl mx-auto py-6">
        {/* 头部标题 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-duolingo-heading mb-2">词汇挑战</h1>
          <p className="text-duolingo-subheading">
            选择一个挑战测试你的词汇掌握程度
          </p>
        </div>

        {/* 挑战卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              id={challenge.id}
              title={challenge.title}
              description={challenge.description}
              icon={challenge.icon}
              difficulty={challenge.difficulty}
              questionsCount={challenge.questionsCount}
              timeLimit={challenge.timeLimit}
              color={challenge.color}
              bestScore={challenge.bestScore}
              isLocked={challenge.isLocked}
              onClick={() => startQuiz(challenge.id)}
            />
          ))}
        </div>

        {/* 底部提示 */}
        <div className="text-center">
          <div className="bg-duolingo-yellow/10 rounded-2xl p-6 border border-duolingo-yellow/20">
            <h3 className="text-lg font-bold text-duolingo-yellow mb-2">
              挑战贴士
            </h3>
            <p className="text-sm text-muted-foreground">
              听音频后选择正确答案，每个挑战都有不同的难度和时间限制
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (quizEnded) {
    const percentage = Math.round((score / questions.length) * 100);
    const challenge = challenges.find(c => c.id === difficulty);
    
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <div className="text-center bg-card rounded-2xl p-8 max-w-md border border-border shadow-lg">
          {/* 结果图标 */}
          <div className="text-6xl mb-4">
            {percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
          </div>
          
          {/* 挑战完成标题 */}
          <h2 className="text-duolingo-heading mb-2">挑战完成！</h2>
          <h3 className="text-lg font-semibold text-muted-foreground mb-4">
            {challenge?.title}
          </h3>
          
          {/* 分数显示 */}
          <div className="bg-duolingo-green/10 rounded-xl p-4 mb-6">
            <div className="text-3xl font-bold text-duolingo-green mb-1">
              {percentage}分
            </div>
            <p className="text-sm text-muted-foreground">
              答对 {score} / {questions.length} 题
            </p>
          </div>
          
          {/* 成就信息 */}
          {percentage >= 80 && (
            <div className="flex items-center justify-center gap-2 mb-4 text-duolingo-green">
              <Star className="w-5 h-5" />
              <span className="font-medium">获得新成就！</span>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button 
              onClick={() => startQuiz(difficulty)} 
              variant="outline"
              className="flex-1"
            >
              再试一次
            </Button>
            <Button 
              onClick={resetQuiz}
              className="btn-duolingo-primary flex-1"
            >
              返回挑战
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const current = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const challenge = challenges.find(c => c.id === difficulty);

  return (
    <div className="h-full flex flex-col">
      {/* 头部导航和进度 */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <Button
          variant="ghost"
          onClick={resetQuiz}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          退出
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-medium text-muted-foreground">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{challenge?.title}</span>
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-duolingo-green" />
              <span className="text-duolingo-green font-medium">得分: {score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col justify-center p-6">
        {/* 问题气泡 */}
        <QuestionBubble
          question="听音频，选择正确的单词"
          hint={current.word.example}
          onPlayAudio={() => speakWord(current.word.word)}
          className="mb-8"
        />

        {/* 答案选项 */}
        <div className="max-w-2xl mx-auto w-full space-y-3">
          {current.options.map((option, index) => (
            <AnswerOption
              key={option}
              text={option}
              index={index}
              isSelected={selectedAnswer === option}
              isCorrect={option === current.correctAnswer}
              isRevealed={showFeedback}
              disabled={showFeedback}
              onClick={() => handleAnswerSelect(option)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}