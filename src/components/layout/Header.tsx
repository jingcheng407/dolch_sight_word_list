import { Progress } from '@/components/ui/progress';
import { useProgress } from '@/hooks/useProgress';

export function Header() {
  const { progress, getProgressPercentage } = useProgress();

  return (
    <header className="bg-gradient-to-r from-pink-200 to-blue-200 p-3 rounded-xl mb-3 flex-shrink-0">
      <div className="text-center">
        <div className="flex justify-center items-center gap-1 mb-1">
          <span className="text-lg">⭐</span>
          <span className="text-lg">💖</span>
          <span className="text-lg">⭐</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          <span className="text-xl mr-1">🌈</span>
          快乐学单词
          <span className="text-xl ml-1">🎈</span>
        </h1>
        
        <p className="text-sm text-gray-600 mb-2">和小熊一起学英语！</p>
        
        {/* 可爱的进度熊 */}
        <div className="flex items-center justify-center gap-3 bg-white/50 rounded-full p-2 max-w-sm mx-auto">
          <div className="text-xl">🐻</div>
          <div className="flex-1">
            <Progress value={getProgressPercentage()} className="h-2 mb-1" />
            <span className="text-xs font-medium text-gray-700">
              {progress.wordsLearned}/{progress.totalWords} ⭐
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}