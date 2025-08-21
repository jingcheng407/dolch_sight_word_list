import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StatCard } from './StatCard';
import { AchievementBadge } from './AchievementBadge';
import { useProgress } from '@/hooks/useProgress';
import { Trophy, Target, Calendar, TrendingUp } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* 头部标题 */}
      <div className="text-center">
        <div className="text-5xl mb-4">📊</div>
        <h1 className="text-duolingo-heading mb-2">学习统计</h1>
        <p className="text-duolingo-subheading">
          查看你的学习进度和成就
        </p>
      </div>

      {/* 整体进度卡片 */}
      <Card className="bg-gradient-to-br from-duolingo-green/10 to-duolingo-blue/10 border-duolingo-green/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-duolingo-green rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-3">总体学习进度</h3>
              <Progress value={getProgressPercentage()} className="h-4 mb-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  已学会 <span className="font-bold text-duolingo-green">{progress.wordsLearned}</span> 个单词
                </span>
                <span className="font-bold text-duolingo-green">
                  {getProgressPercentage()}% 完成
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计数据网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="游戏次数"
          value={progress.gameStats.gamesPlayed}
          subtitle="总练习次数"
          icon="🎮"
          color="green"
        />
        <StatCard
          title="最高分数"
          value={`${progress.gameStats.bestScore}分`}
          subtitle="单次最佳表现"
          icon="🏆"
          color="blue"
        />
        <StatCard
          title="累计分数"
          value={progress.gameStats.totalScore}
          subtitle="历史总分"
          icon="⭐"
          color="yellow"
        />
        <StatCard
          title="平均分数"
          value={`${Math.round(progress.gameStats.averageScore) || 0}分`}
          subtitle="平均表现"
          icon="📈"
          color="purple"
        />
      </div>

      {/* 成就系统 */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-duolingo-yellow" />
          <h2 className="text-xl font-bold text-foreground">我的成就</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {progress.achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              id={achievement.id}
              name={achievement.name}
              description={achievement.description}
              icon={getAchievementIcon(achievement.id)}
              unlocked={achievement.unlocked}
              unlockedAt={achievement.unlockedAt}
            />
          ))}
        </div>
      </div>

      {/* 单词掌握情况 */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-duolingo-blue" />
          <h2 className="text-xl font-bold text-foreground">单词掌握情况</h2>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {progress.wordProgress.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {progress.wordProgress
                  .filter(wp => wp.learned)
                  .slice(0, 20)
                  .map((wordProgress) => (
                    <div key={wordProgress.word} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium text-foreground">{wordProgress.word}</span>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-duolingo-green">
                          <span>✓</span>
                          <span className="font-medium">{wordProgress.correctCount}</span>
                        </div>
                        {wordProgress.wrongCount > 0 && (
                          <div className="flex items-center gap-1 text-duolingo-red">
                            <span>✗</span>
                            <span className="font-medium">{wordProgress.wrongCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  还没有学习记录
                </h3>
                <p className="text-muted-foreground">
                  开始学习单词来查看你的进度！
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 重置按钮 */}
      <div className="text-center pt-8">
        <Button 
          onClick={resetProgress}
          variant="outline" 
          className="text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          重置所有进度
        </Button>
      </div>
    </div>
  );
}