import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/hooks/useProgress';

export function StatsTab() {
  const { progress, getProgressPercentage } = useProgress();

  const getAchievementIcon = (achievementId: string) => {
    const iconMap: Record<string, string> = {
      'first-word': '🌟',
      'ten-words': '📚',
      'all-words': '🏆',
      'perfect-quiz': '💯',
      'streak-7': '🔥'
    };
    return iconMap[achievementId] || '🎖️';
  };

  const resetProgress = () => {
    if (confirm('确定要重置所有进度吗？这将清除所有学习记录。')) {
      localStorage.removeItem('dolch-progress');
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Welcome */}
      <div className="text-center bg-white/60 rounded-xl p-3 mb-3 flex-shrink-0">
        <div className="text-3xl mb-1">🎉</div>
        <h2 className="text-lg font-bold mb-1">我的学习宝箱</h2>
        <p className="text-xs text-gray-600">看看你获得了多少星星！</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Overall Progress */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📊</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">学习进度</h3>
                <Progress value={getProgressPercentage()} className="mb-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>已学会 {progress.wordsLearned} 个单词</span>
                  <span>{getProgressPercentage()}% 完成</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Stats */}
        <Card className="bg-gradient-to-r from-green-50 to-teal-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-3xl">🎮</div>
              <h3 className="text-lg font-bold text-gray-800">游戏统计</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{progress.gameStats.gamesPlayed}</div>
                <div className="text-xs text-gray-600">游戏次数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{progress.gameStats.bestScore}</div>
                <div className="text-xs text-gray-600">最高分</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{progress.gameStats.totalScore}</div>
                <div className="text-xs text-gray-600">总分</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(progress.gameStats.averageScore) || 0}
                </div>
                <div className="text-xs text-gray-600">平均分</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-3xl">🏆</div>
              <h3 className="text-lg font-bold text-gray-800">我的成就</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {progress.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl mb-1 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {getAchievementIcon(achievement.id)}
                    </div>
                    <div className="text-xs font-medium text-gray-800 mb-1">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-gray-600 leading-tight">
                      {achievement.description}
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-800">
                        已获得
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Word Progress */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-3xl">📝</div>
              <h3 className="text-lg font-bold text-gray-800">单词掌握</h3>
            </div>
            {progress.wordProgress.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {progress.wordProgress
                  .filter(wp => wp.learned)
                  .slice(0, 10)
                  .map((wordProgress) => (
                    <div key={wordProgress.word} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{wordProgress.word}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓ {wordProgress.correctCount}</span>
                        {wordProgress.wrongCount > 0 && (
                          <span className="text-red-600">✗ {wordProgress.wrongCount}</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <div className="text-2xl mb-2">🌱</div>
                <p className="text-sm">还没有学习记录，快去学习单词吧！</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reset Button */}
        <div className="text-center pb-4">
          <Button 
            onClick={resetProgress}
            variant="outline" 
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <span className="mr-2">🔄</span>
            重置进度
          </Button>
        </div>
      </div>
    </div>
  );
}