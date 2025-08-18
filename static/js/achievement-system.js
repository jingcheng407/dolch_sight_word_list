/**
 * 成就系统和学习进度管理
 * 跟踪用户的学习进度，管理成就和解锁系统
 */

class AchievementSystem {
    constructor() {
        this.achievements = new Map();
        this.userProgress = {
            totalWordsLearned: 0,
            levelsCompleted: [],
            bubbleExplorationCompleted: false,
            gamesUnlocked: {
                bubbleExploration: true,
                memoryGame: false,
                spellingGame: false,
                wordCatchGame: false,
                wordSpeedGame: false
            },
            streaks: {
                current: 0,
                longest: 0
            },
            timeSpent: 0,
            achievements: []
        };
        
        this.initAchievements();
        this.loadProgress();
        
        console.log('🏆 AchievementSystem 初始化完成');
    }

    /**
     * 初始化成就定义
     */
    initAchievements() {
        const achievementDefinitions = [
            // 基础学习成就
            {
                id: 'first_word',
                name: '🌟 第一个单词',
                description: '学习你的第一个单词！',
                condition: (progress) => progress.totalWordsLearned >= 1,
                points: 10,
                category: 'learning'
            },
            {
                id: 'five_words',
                name: '⭐ 小小词汇家',
                description: '学会了5个单词',
                condition: (progress) => progress.totalWordsLearned >= 5,
                points: 25,
                category: 'learning'
            },
            {
                id: 'ten_words',
                name: '🎯 词汇达人',
                description: '学会了10个单词',
                condition: (progress) => progress.totalWordsLearned >= 10,
                points: 50,
                category: 'learning'
            },
            {
                id: 'twenty_words',
                name: '📚 单词大师',
                description: '学会了20个单词',
                condition: (progress) => progress.totalWordsLearned >= 20,
                points: 100,
                category: 'learning'
            },
            
            // 气泡探索成就
            {
                id: 'bubble_explorer',
                name: '🫧 气泡探险家',
                description: '完成气泡探索模块',
                condition: (progress) => progress.bubbleExplorationCompleted,
                points: 100,
                category: 'exploration'
            },
            
            // 游戏成就
            {
                id: 'memory_master',
                name: '🧠 记忆大师',
                description: '在记忆游戏中获得完美分数',
                condition: (progress) => progress.achievements.includes('perfect_memory'),
                points: 75,
                category: 'gaming'
            },
            {
                id: 'spelling_champion',
                name: '✏️ 拼写冠军',
                description: '连续拼对10个单词',
                condition: (progress) => progress.achievements.includes('spelling_streak_10'),
                points: 80,
                category: 'gaming'
            },
            {
                id: 'speed_demon',
                name: '⚡ 速度恶魔',
                description: '在竞速游戏中得分超过1000',
                condition: (progress) => progress.achievements.includes('speed_1000'),
                points: 90,
                category: 'gaming'
            },
            {
                id: 'catch_expert',
                name: '🎯 捕捉专家',
                description: '在单词捕捉中达到10级',
                condition: (progress) => progress.achievements.includes('catch_level_10'),
                points: 85,
                category: 'gaming'
            },
            
            // 连续学习成就
            {
                id: 'daily_streak_3',
                name: '🔥 连续学习',
                description: '连续3天学习',
                condition: (progress) => progress.streaks.current >= 3,
                points: 30,
                category: 'consistency'
            },
            {
                id: 'daily_streak_7',
                name: '🌟 一周坚持',
                description: '连续7天学习',
                condition: (progress) => progress.streaks.current >= 7,
                points: 75,
                category: 'consistency'
            },
            {
                id: 'daily_streak_30',
                name: '🏆 月度冠军',
                description: '连续30天学习',
                condition: (progress) => progress.streaks.current >= 30,
                points: 200,
                category: 'consistency'
            },
            
            // 完成度成就
            {
                id: 'pre_primer_complete',
                name: '🎯 学前达成',
                description: '完成Pre-primer级别',
                condition: (progress) => progress.levelsCompleted.includes('pre_primer'),
                points: 150,
                category: 'completion'
            },
            {
                id: 'primer_complete',
                name: '📖 启蒙完成',
                description: '完成Primer级别',
                condition: (progress) => progress.levelsCompleted.includes('primer'),
                points: 200,
                category: 'completion'
            },
            {
                id: 'first_grade_complete',
                name: '🎓 一年级毕业',
                description: '完成1st Grade级别',
                condition: (progress) => progress.levelsCompleted.includes('first_grade'),
                points: 300,
                category: 'completion'
            },
            {
                id: 'second_grade_complete',
                name: '🌟 二年级达人',
                description: '完成2nd Grade级别',
                condition: (progress) => progress.levelsCompleted.includes('second_grade'),
                points: 400,
                category: 'completion'
            },
            {
                id: 'all_levels_complete',
                name: '👑 全能王者',
                description: '完成所有级别！',
                condition: (progress) => progress.levelsCompleted.length >= 4,
                points: 1000,
                category: 'completion'
            }
        ];

        achievementDefinitions.forEach(achievement => {
            this.achievements.set(achievement.id, achievement);
        });
    }

    /**
     * 记录单词学习
     */
    recordWordLearned(wordData, level) {
        this.userProgress.totalWordsLearned++;
        
        // 检查成就
        this.checkAchievements();
        
        // 保存进度
        this.saveProgress();
        
        // 触发事件
        this.dispatchEvent('wordLearned', { wordData, level, totalWords: this.userProgress.totalWordsLearned });
        
        console.log(`📚 学习了单词: ${wordData.word}, 总计: ${this.userProgress.totalWordsLearned}`);
    }

    /**
     * 完成气泡探索
     */
    completeBubbleExploration(level, wordsLearned) {
        const minimumWords = this.getMinimumWordsForLevel(level);
        
        if (wordsLearned >= minimumWords) {
            this.userProgress.bubbleExplorationCompleted = true;
            
            // 解锁其他游戏
            this.unlockGames();
            
            // 检查成就
            this.checkAchievements();
            
            // 保存进度
            this.saveProgress();
            
            // 显示完成通知
            this.showCompletionNotification(level, wordsLearned);
            
            console.log(`🫧 完成气泡探索 - 级别: ${level}, 学习单词: ${wordsLearned}`);
        }
    }

    /**
     * 获取级别所需最小单词数
     */
    getMinimumWordsForLevel(level) {
        const minimums = {
            'pre_primer': 15,  // 40个单词的40%
            'primer': 20,      // 52个单词的40%
            'first_grade': 16,  // 41个单词的40%
            'second_grade': 18  // 46个单词的40%
        };
        return minimums[level] || 10;
    }

    /**
     * 解锁游戏
     */
    unlockGames() {
        this.userProgress.gamesUnlocked.memoryGame = true;
        this.userProgress.gamesUnlocked.spellingGame = true;
        this.userProgress.gamesUnlocked.wordCatchGame = true;
        this.userProgress.gamesUnlocked.wordSpeedGame = true;
        
        // 显示解锁通知
        this.showUnlockNotification();
    }

    /**
     * 检查游戏是否解锁
     */
    isGameUnlocked(gameType) {
        return this.userProgress.gamesUnlocked[gameType] || false;
    }

    /**
     * 记录游戏成就
     */
    recordGameAchievement(achievementId, data) {
        if (!this.userProgress.achievements.includes(achievementId)) {
            this.userProgress.achievements.push(achievementId);
            this.checkAchievements();
            this.saveProgress();
        }
    }

    /**
     * 检查成就
     */
    checkAchievements() {
        let newAchievements = [];
        
        for (let [id, achievement] of this.achievements) {
            if (!this.userProgress.achievements.includes(`achievement_${id}`) && 
                achievement.condition(this.userProgress)) {
                
                newAchievements.push(achievement);
                this.userProgress.achievements.push(`achievement_${id}`);
            }
        }
        
        // 显示新成就
        if (newAchievements.length > 0) {
            this.showAchievementNotification(newAchievements);
        }
    }

    /**
     * 显示完成通知
     */
    showCompletionNotification(level, wordsLearned) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification completion';
        notification.innerHTML = `
            <div class="achievement-modal">
                <div class="achievement-header">
                    <div class="achievement-icon">🎉</div>
                    <h3>气泡探索完成！</h3>
                </div>
                <div class="achievement-content">
                    <p>恭喜你完成了${this.getLevelName(level)}的气泡探索！</p>
                    <p>你学会了 <strong>${wordsLearned}</strong> 个单词</p>
                    <p>🎮 所有游戏已解锁！</p>
                </div>
                <button class="achievement-close" onclick="this.closest('.achievement-notification').remove()">
                    ✨ 太棒了！
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 播放成功音效
        this.playAchievementSound();
    }

    /**
     * 显示解锁通知
     */
    showUnlockNotification() {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification unlock';
        notification.innerHTML = `
            <div class="achievement-modal">
                <div class="achievement-header">
                    <div class="achievement-icon">🔓</div>
                    <h3>游戏解锁！</h3>
                </div>
                <div class="achievement-content">
                    <p>🎉 恭喜解锁所有游戏：</p>
                    <ul>
                        <li>🧠 记忆翻卡</li>
                        <li>✏️ 单词拼写</li>
                        <li>🎯 单词捕捉</li>
                        <li>⚡ 单词竞速</li>
                    </ul>
                </div>
                <button class="achievement-close" onclick="this.closest('.achievement-notification').remove()">
                    🚀 开始游戏！
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 播放解锁音效
        this.playUnlockSound();
    }

    /**
     * 显示成就通知
     */
    showAchievementNotification(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.className = 'achievement-notification';
                notification.innerHTML = `
                    <div class="achievement-modal">
                        <div class="achievement-header">
                            <div class="achievement-icon">${achievement.name.split(' ')[0]}</div>
                            <h3>成就解锁！</h3>
                        </div>
                        <div class="achievement-content">
                            <h4>${achievement.name}</h4>
                            <p>${achievement.description}</p>
                            <div class="achievement-points">+${achievement.points} 分</div>
                        </div>
                        <button class="achievement-close" onclick="this.closest('.achievement-notification').remove()">
                            ✨ 收下了！
                        </button>
                    </div>
                `;
                
                document.body.appendChild(notification);
                
                // 播放成就音效
                this.playAchievementSound();
                
                // 5秒后自动移除
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 5000);
                
            }, index * 1000);
        });
    }

    /**
     * 获取级别中文名称
     */
    getLevelName(level) {
        const names = {
            'pre_primer': 'Pre-primer (学前)',
            'primer': 'Primer (启蒙)',
            'first_grade': '1st Grade (一年级)',
            'second_grade': '2nd Grade (二年级)'
        };
        return names[level] || level;
    }

    /**
     * 获取用户总分
     */
    getTotalScore() {
        let totalScore = 0;
        for (let achievementId of this.userProgress.achievements) {
            const id = achievementId.replace('achievement_', '');
            const achievement = this.achievements.get(id);
            if (achievement) {
                totalScore += achievement.points;
            }
        }
        return totalScore;
    }

    /**
     * 获取进度统计
     */
    getProgressStats() {
        return {
            totalWordsLearned: this.userProgress.totalWordsLearned,
            achievementsUnlocked: this.userProgress.achievements.filter(a => a.startsWith('achievement_')).length,
            totalAchievements: this.achievements.size,
            totalScore: this.getTotalScore(),
            gamesUnlocked: Object.values(this.userProgress.gamesUnlocked).filter(Boolean).length,
            bubbleExplorationCompleted: this.userProgress.bubbleExplorationCompleted
        };
    }

    /**
     * 保存进度到localStorage
     */
    saveProgress() {
        try {
            localStorage.setItem('dolch_progress', JSON.stringify(this.userProgress));
            localStorage.setItem('dolch_progress_timestamp', Date.now().toString());
        } catch (e) {
            console.warn('无法保存进度:', e);
        }
    }

    /**
     * 从localStorage加载进度
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('dolch_progress');
            if (saved) {
                const savedProgress = JSON.parse(saved);
                this.userProgress = { ...this.userProgress, ...savedProgress };
                console.log('✅ 加载用户进度成功');
            }
        } catch (e) {
            console.warn('无法加载进度:', e);
        }
    }

    /**
     * 重置进度
     */
    resetProgress() {
        this.userProgress = {
            totalWordsLearned: 0,
            levelsCompleted: [],
            bubbleExplorationCompleted: false,
            gamesUnlocked: {
                bubbleExploration: true,
                memoryGame: false,
                spellingGame: false,
                wordCatchGame: false,
                wordSpeedGame: false
            },
            streaks: {
                current: 0,
                longest: 0
            },
            timeSpent: 0,
            achievements: []
        };
        
        this.saveProgress();
        console.log('🔄 进度已重置');
    }

    /**
     * 触发自定义事件
     */
    dispatchEvent(eventName, data) {
        const event = new CustomEvent(`achievement_${eventName}`, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * 播放成就音效
     */
    playAchievementSound() {
        this.playTone([523, 659, 783, 1047], 200);
    }

    /**
     * 播放解锁音效
     */
    playUnlockSound() {
        this.playTone([392, 523, 659, 783], 300);
    }

    /**
     * 播放音调
     */
    playTone(frequencies, duration = 200) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            frequencies.forEach((frequency, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration / 1000);
                }, index * 100);
            });
        } catch (e) {
            console.warn('音效播放失败:', e);
        }
    }

    /**
     * 销毁系统
     */
    destroy() {
        this.saveProgress();
        console.log('🗑️ AchievementSystem 已销毁');
    }
}

// 创建全局实例
window.AchievementSystem = AchievementSystem;
window.achievementSystem = new AchievementSystem();

console.log('🏆 AchievementSystem 模块加载完成');