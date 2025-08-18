/**
 * 已学习单词过滤器
 * 为游戏提供已学习单词的筛选功能
 */

class LearnedWordsFilter {
    constructor() {
        this.bubbleManager = null;
        console.log('🎯 LearnedWordsFilter 初始化完成');
    }

    /**
     * 设置气泡管理器引用
     */
    setBubbleManager(bubbleManager) {
        this.bubbleManager = bubbleManager;
    }

    /**
     * 获取指定级别的已学习单词
     */
    getLearnedWords(level) {
        if (this.bubbleManager) {
            return this.bubbleManager.getLearnedWords(level);
        }
        
        // 备用方法：直接从localStorage读取
        try {
            const key = `learned_words_${level}`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            console.warn('无法获取已学习单词:', e);
            return [];
        }
    }

    /**
     * 从单词列表中过滤出已学习的单词
     */
    filterLearnedWords(allWords, level) {
        const learnedWordsList = this.getLearnedWords(level);
        
        if (learnedWordsList.length === 0) {
            console.warn(`⚠️ 级别 ${level} 没有已学习的单词，返回前5个单词用于游戏`);
            // 如果没有已学习的单词，返回前几个单词让游戏能正常进行
            return allWords.slice(0, 5);
        }

        const learnedWords = allWords.filter(wordData => 
            learnedWordsList.includes(wordData.word)
        );

        console.log(`🎮 过滤出 ${learnedWords.length} 个已学习单词用于游戏 - 级别: ${level}`);
        return learnedWords;
    }

    /**
     * 检查是否有足够的已学习单词开始游戏
     */
    hasEnoughWordsForGame(level, minimumWords = 4) {
        const learnedWords = this.getLearnedWords(level);
        return learnedWords.length >= minimumWords;
    }

    /**
     * 获取游戏推荐的最小单词数
     */
    getMinimumWordsForGame(gameType) {
        const requirements = {
            'memory': 6,      // 记忆游戏需要至少6个单词（3对）
            'spelling': 5,    // 拼写游戏需要至少5个单词
            'wordCatch': 4,   // 单词捕捉需要至少4个单词
            'wordSpeed': 8    // 单词竞速需要至少8个单词
        };
        
        return requirements[gameType] || 4;
    }

    /**
     * 验证游戏是否可以开始
     */
    canStartGame(level, gameType) {
        const minimumWords = this.getMinimumWordsForGame(gameType);
        const hasEnough = this.hasEnoughWordsForGame(level, minimumWords);
        
        if (!hasEnough) {
            console.warn(`⚠️ 游戏 ${gameType} 需要至少 ${minimumWords} 个已学习单词，当前只有 ${this.getLearnedWords(level).length} 个`);
        }
        
        return hasEnough;
    }

    /**
     * 为记忆游戏创建配对
     */
    createMemoryPairs(learnedWords, pairCount = 6) {
        if (learnedWords.length < pairCount) {
            console.warn(`⚠️ 已学习单词不足，无法创建 ${pairCount} 对记忆卡片`);
            pairCount = Math.max(2, Math.floor(learnedWords.length / 2) * 2);
        }

        const selectedWords = learnedWords.slice(0, pairCount);
        const pairs = [];
        
        selectedWords.forEach(wordData => {
            // 每个单词创建两张卡片
            pairs.push(wordData, wordData);
        });
        
        // 打乱顺序
        return this.shuffleArray(pairs);
    }

    /**
     * 为拼写游戏选择单词
     */
    selectWordsForSpelling(learnedWords, count = 10) {
        const availableCount = Math.min(count, learnedWords.length);
        return this.shuffleArray([...learnedWords]).slice(0, availableCount);
    }

    /**
     * 为单词捕捉游戏选择单词
     */
    selectWordsForCatch(learnedWords) {
        // 单词捕捉游戏可以使用所有已学习的单词
        return this.shuffleArray([...learnedWords]);
    }

    /**
     * 为单词竞速游戏选择单词
     */
    selectWordsForSpeed(learnedWords) {
        // 单词竞速游戏可以使用所有已学习的单词
        return this.shuffleArray([...learnedWords]);
    }

    /**
     * 数组打乱工具函数
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 显示单词不足的提示
     */
    showInsufficientWordsMessage(gameType, required, current) {
        const gameNames = {
            'memory': '记忆翻卡',
            'spelling': '单词拼写',
            'wordCatch': '单词捕捉',
            'wordSpeed': '单词竞速'
        };

        const modal = document.createElement('div');
        modal.className = 'achievement-notification';
        modal.innerHTML = `
            <div class="achievement-modal">
                <div class="achievement-header">
                    <div class="achievement-icon">📚</div>
                    <h3>需要更多单词</h3>
                </div>
                <div class="achievement-content">
                    <h4>${gameNames[gameType] || gameType} 需要更多已学习单词</h4>
                    <p>当前已学习单词：<strong>${current}</strong> 个</p>
                    <p>游戏需要至少：<strong>${required}</strong> 个</p>
                    <p>💡 请先到气泡探索学习更多单词！</p>
                </div>
                <button class="achievement-close" onclick="this.closest('.achievement-notification').remove()">
                    🫧 去学习单词
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 播放提示音
        if (window.achievementSystem) {
            window.achievementSystem.playTone([440, 330], 400);
        }
    }

    /**
     * 获取学习进度统计
     */
    getProgressStats(level) {
        const learnedWords = this.getLearnedWords(level);
        const gameRequirements = {
            'memory': this.getMinimumWordsForGame('memory'),
            'spelling': this.getMinimumWordsForGame('spelling'),
            'wordCatch': this.getMinimumWordsForGame('wordCatch'),
            'wordSpeed': this.getMinimumWordsForGame('wordSpeed')
        };

        const availableGames = Object.keys(gameRequirements).filter(game =>
            learnedWords.length >= gameRequirements[game]
        );

        return {
            learnedCount: learnedWords.length,
            availableGames: availableGames.length,
            totalGames: Object.keys(gameRequirements).length,
            canPlay: availableGames
        };
    }
}

// 创建全局实例
window.LearnedWordsFilter = LearnedWordsFilter;
window.learnedWordsFilter = new LearnedWordsFilter();

console.log('🎯 LearnedWordsFilter 模块加载完成');