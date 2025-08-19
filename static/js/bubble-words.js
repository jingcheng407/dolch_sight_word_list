/**
 * 气泡单词系统 - 有趣的互动学习体验
 * 点击气泡显示单词，增加学习趣味性
 */

class BubbleWordsManager {
    constructor() {
        this.bubbles = new Map(); // 存储气泡和对应的单词
        this.revealedBubbles = new Set(); // 已揭示的气泡
        this.themes = ['theme-1', 'theme-2', 'theme-3', 'theme-4', 'theme-5', 'theme-6', 'theme-7', 'theme-8'];
        this.patterns = ['pattern-1', 'pattern-2', 'pattern-3', 'pattern-4', 'pattern-5', 'pattern-6', 'pattern-7', 'pattern-8', 'pattern-9', 'pattern-10', 'pattern-11', 'pattern-12', 'pattern-13', 'pattern-14', 'pattern-15', 'pattern-16', 'pattern-17', 'pattern-18', 'pattern-19', 'pattern-20'];
        
        // 音效支持
        this.soundEnabled = true;
        this.audioContext = null;
        this.initAudio();
        
        // 学习进度跟踪
        this.currentLevel = 'pre_primer';
        this.totalWords = 0;
        
        console.log('🫧 BubbleWordsManager 初始化完成');
    }

    /**
     * 初始化音频系统
     */
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('音频系统不支持:', e);
            this.soundEnabled = false;
        }
    }

    /**
     * 播放气泡点击音效
     */
    playBubbleSound(frequency = 800, duration = 200) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.warn('音效播放失败:', e);
        }
    }

    /**
     * 创建气泡单词网格
     */
    createBubbleGrid(words, container, level = 'pre_primer') {
        if (!container) {
            console.error('容器未找到');
            return;
        }

        // 清空现有内容
        container.innerHTML = '';
        this.bubbles.clear();
        this.revealedBubbles.clear();
        
        // 设置当前级别和单词总数
        this.currentLevel = level;
        this.totalWords = words.length;
        
        // 从localStorage加载已学习的单词列表
        const learnedWords = this.loadLearnedWords(level);

        // 创建气泡容器
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = 'bubble-words-container';

        // 添加进度指示器
        const progressIndicator = this.createProgressIndicator();
        bubbleContainer.appendChild(progressIndicator);

        const wordsGrid = document.createElement('div');
        wordsGrid.className = 'words-grid-bubbles';

        // 为每个单词创建气泡
        words.forEach((wordData, index) => {
            const bubble = this.createBubble(wordData, index);
            wordsGrid.appendChild(bubble);
            
            // 如果这个单词已经学习过，恢复其状态
            if (learnedWords.includes(wordData.word)) {
                const bubbleId = `bubble-${index}`;
                this.revealedBubbles.add(bubbleId);
                bubble.classList.add('revealed', 'learned');
                console.log(`✅ 恢复已学习单词: ${wordData.word}`);
            }
        });

        bubbleContainer.appendChild(wordsGrid);
        container.appendChild(bubbleContainer);
        
        // 更新进度显示
        this.updateProgressIndicator();

        console.log(`🫧 创建了 ${words.length} 个气泡 - 级别: ${level}`);
    }

    /**
     * 创建单个气泡
     */
    createBubble(wordData, index) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble-word-card';
        bubble.dataset.wordId = `bubble-${index}`;
        bubble.dataset.word = wordData.word;
        
        // 随机选择主题和装饰图案
        const theme = this.themes[Math.floor(Math.random() * this.themes.length)];
        const pattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];
        
        bubble.classList.add(theme);
        
        // 设置随机动画延迟
        bubble.style.setProperty('--animation-delay', `${Math.random() * 2}s`);
        
        // 创建装饰层
        const decoration = document.createElement('div');
        decoration.className = `bubble-decoration ${pattern}`;
        
        // 创建单词文字层
        const wordText = document.createElement('div');
        wordText.className = 'bubble-word-text';
        wordText.textContent = wordData.word;
        
        // 处理长单词
        if (wordData.word.length > 8) {
            wordText.classList.add('long-word');
        }
        
        // 组装气泡
        bubble.appendChild(decoration);
        bubble.appendChild(wordText);
        
        // 添加点击事件
        bubble.addEventListener('click', (e) => {
            this.handleBubbleClick(bubble, wordData, e);
        });
        
        // 存储映射
        this.bubbles.set(bubble.dataset.wordId, {
            element: bubble,
            wordData: wordData,
            theme: theme,
            pattern: pattern
        });
        
        return bubble;
    }

    /**
     * 处理气泡点击事件
     */
    handleBubbleClick(bubble, wordData, event) {
        event.preventDefault();
        
        const bubbleId = bubble.dataset.wordId;
        
        // 播放音效
        const frequency = 600 + Math.random() * 400; // 随机频率
        this.playBubbleSound(frequency, 300);
        
        // 聚焦当前气泡（居中放大，其他虚化）
        this.focusBubble(bubble);
        
        // 添加点击动画
        bubble.classList.add('clicked');
        setTimeout(() => {
            bubble.classList.remove('clicked');
        }, 600);
        
        // 揭示单词
        if (!this.revealedBubbles.has(bubbleId)) {
            this.revealWord(bubble, wordData);
            this.revealedBubbles.add(bubbleId);
            
            // 触发学习事件
            this.onWordRevealed(wordData);
        } else {
            // 如果已经揭示，播放语音（如果支持）
            this.speakWord(wordData.word);
        }
        
        // 3秒后恢复正常状态
        setTimeout(() => {
            this.resetBubbleFocus();
        }, 3000);
    }

    /**
     * 揭示单词
     */
    revealWord(bubble, wordData) {
        console.log(`🫧 揭示单词: ${wordData.word}`);
        
        // 添加揭示状态
        bubble.classList.add('revealed');
        
        // 创建揭示动画
        setTimeout(() => {
            // 可以添加粒子效果或其他特殊动画
            this.createSparkleEffect(bubble);
        }, 200);
        
        // 语音播放
        setTimeout(() => {
            this.speakWord(wordData.word);
        }, 400);
    }

    /**
     * 创建闪烁特效
     */
    createSparkleEffect(bubble) {
        const sparkles = ['✨', '⭐', '💫', '🌟'];
        const sparkleCount = 5;
        
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
                sparkle.style.cssText = `
                    position: absolute;
                    top: ${Math.random() * 100}%;
                    left: ${Math.random() * 100}%;
                    font-size: 16px;
                    pointer-events: none;
                    z-index: 1000;
                    animation: sparkleFloat 1s ease-out forwards;
                `;
                
                bubble.appendChild(sparkle);
                
                // 删除闪烁元素
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1000);
            }, i * 100);
        }
    }

    /**
     * 语音播放单词
     */
    speakWord(word) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1.2;
            utterance.volume = 0.7;
            
            speechSynthesis.speak(utterance);
        }
    }

    /**
     * 单词揭示回调
     */
    onWordRevealed(wordData) {
        // 保存已学习的单词到localStorage
        this.saveLearnedWord(wordData.word, this.currentLevel);
        
        // 记录到成就系统
        if (window.achievementSystem) {
            window.achievementSystem.recordWordLearned(wordData, this.currentLevel);
        }
        
        console.log(`📚 学习了单词: ${wordData.word}`);
        
        // 触发自定义事件
        const event = new CustomEvent('wordRevealed', {
            detail: { wordData: wordData, level: this.currentLevel }
        });
        document.dispatchEvent(event);
        
        // 检查是否完成气泡探索
        this.checkBubbleExplorationCompletion();
    }

    /**
     * 标记单词为已学习
     */
    markWordAsLearned(word) {
        this.bubbles.forEach((bubbleInfo, bubbleId) => {
            if (bubbleInfo.wordData.word === word) {
                bubbleInfo.element.classList.add('learned');
                console.log(`🎓 单词 "${word}" 标记为已学习`);
            }
        });
    }

    /**
     * 重置所有气泡
     */
    resetAllBubbles() {
        this.revealedBubbles.clear();
        
        this.bubbles.forEach((bubbleInfo) => {
            bubbleInfo.element.classList.remove('revealed', 'learned', 'clicked');
        });
        
        console.log('🔄 所有气泡已重置');
    }

    /**
     * 获取学习统计
     */
    getStats() {
        return {
            totalBubbles: this.bubbles.size,
            revealedBubbles: this.revealedBubbles.size,
            learnedBubbles: document.querySelectorAll('.bubble-word-card.learned').length,
            progress: this.bubbles.size > 0 ? (this.revealedBubbles.size / this.bubbles.size * 100).toFixed(1) : 0
        };
    }

    /**
     * 切换音效
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log(`🔊 音效${this.soundEnabled ? '开启' : '关闭'}`);
        return this.soundEnabled;
    }

    /**
     * 聚焦气泡（居中放大，其他虚化）
     */
    focusBubble(targetBubble) {
        const container = targetBubble.closest('.bubble-words-container');
        if (!container) return;
        
        // 添加聚焦状态到容器
        container.classList.add('bubble-focused');
        
        // 为所有气泡添加虚化效果
        this.bubbles.forEach((bubbleInfo) => {
            const bubble = bubbleInfo.element;
            if (bubble !== targetBubble) {
                bubble.classList.add('blurred');
            } else {
                bubble.classList.add('focused', 'enlarged');
            }
        });
        
        // 将目标气泡垂直居中显示，保持水平位置左对齐
        // 移除 inline 参数以避免水平滚动引起的"右移感"
        // iOS Safari 对 inline 参数支持不一致，完全移除更安全
        targetBubble.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
        });
        
        console.log(`🎯 聚焦气泡: ${targetBubble.dataset.word}`);
    }
    
    /**
     * 重置气泡聚焦状态
     */
    resetBubbleFocus() {
        const container = document.querySelector('.bubble-words-container.bubble-focused');
        if (!container) return;
        
        // 移除容器的聚焦状态
        container.classList.remove('bubble-focused');
        
        // 移除所有气泡的特殊状态
        this.bubbles.forEach((bubbleInfo) => {
            const bubble = bubbleInfo.element;
            bubble.classList.remove('blurred', 'focused', 'enlarged');
        });
        
        console.log('🔄 气泡聚焦状态已重置');
    }

    /**
     * 创建进度指示器
     */
    createProgressIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'progress-indicator';
        indicator.innerHTML = `
            <div class="progress-title">🫧 气泡探索进度</div>
            <div class="progress-stats">
                <div class="progress-stat-card">
                    <span class="progress-stat-icon">🎯</span>
                    <span class="progress-stat-value" id="words-learned">0</span>
                    <div class="progress-stat-label">已学单词</div>
                </div>
                <div class="progress-stat-card">
                    <span class="progress-stat-icon">📚</span>
                    <span class="progress-stat-value" id="total-words">${this.totalWords}</span>
                    <div class="progress-stat-label">总单词数</div>
                </div>
                <div class="progress-stat-card">
                    <span class="progress-stat-icon">📊</span>
                    <span class="progress-stat-value" id="progress-percent">0%</span>
                    <div class="progress-stat-label">完成进度</div>
                </div>
                <div class="progress-stat-card">
                    <span class="progress-stat-icon">🏆</span>
                    <span class="progress-stat-value" id="achievement-score">0</span>
                    <div class="progress-stat-label">总分数</div>
                </div>
            </div>
        `;
        return indicator;
    }

    /**
     * 更新进度显示
     */
    updateProgressIndicator() {
        const wordsLearnedElement = document.getElementById('words-learned');
        const progressPercentElement = document.getElementById('progress-percent');
        const achievementScoreElement = document.getElementById('achievement-score');
        
        if (wordsLearnedElement) {
            wordsLearnedElement.textContent = this.revealedBubbles.size;
        }
        
        if (progressPercentElement && this.totalWords > 0) {
            const percent = Math.round((this.revealedBubbles.size / this.totalWords) * 100);
            progressPercentElement.textContent = `${percent}%`;
        }
        
        if (achievementScoreElement && window.achievementSystem) {
            achievementScoreElement.textContent = window.achievementSystem.getTotalScore();
        }
    }

    /**
     * 检查气泡探索完成度
     */
    checkBubbleExplorationCompletion() {
        if (!window.achievementSystem) return;
        
        // 更新进度指示器
        this.updateProgressIndicator();
        
        // 检查是否达到完成条件
        const minimumWords = window.achievementSystem.getMinimumWordsForLevel(this.currentLevel);
        const currentLearned = this.revealedBubbles.size;
        
        if (currentLearned >= minimumWords) {
            // 延迟一秒显示完成效果，让用户看到最后一个单词
            setTimeout(() => {
                window.achievementSystem.completeBubbleExploration(this.currentLevel, currentLearned);
            }, 1000);
        }
        
        console.log(`📊 气泡探索进度: ${currentLearned}/${this.totalWords} (需要 ${minimumWords} 个解锁游戏)`);
    }

    /**
     * 保存已学习的单词
     */
    saveLearnedWord(word, level) {
        try {
            const key = `learned_words_${level}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            if (!existing.includes(word)) {
                existing.push(word);
                localStorage.setItem(key, JSON.stringify(existing));
                console.log(`💾 保存已学习单词: ${word} (级别: ${level})`);
                
                // 同时保存学习时间戳
                const timestampKey = `learned_words_timestamp_${level}`;
                const timestamps = JSON.parse(localStorage.getItem(timestampKey) || '{}');
                timestamps[word] = new Date().getTime();
                localStorage.setItem(timestampKey, JSON.stringify(timestamps));
            } else {
                console.log(`📝 单词已存在于已学习列表: ${word}`);
            }
        } catch (e) {
            console.warn('无法保存已学习单词:', e);
        }
    }

    /**
     * 从localStorage加载已学习的单词
     */
    loadLearnedWords(level) {
        try {
            const key = `learned_words_${level}`;
            const learnedWords = JSON.parse(localStorage.getItem(key) || '[]');
            
            console.log(`📚 准备加载 ${learnedWords.length} 个已学习单词 - 级别: ${level}`);
            console.log('已学习单词列表:', learnedWords);
            
            return learnedWords;
        } catch (e) {
            console.warn('无法加载已学习单词:', e);
            return [];
        }
    }

    /**
     * 恢复已学习单词的显示状态（已弃用，功能合并到createBubbleGrid中）
     */
    restoreLearnedWordsDisplay() {
        // 此方法已不再需要，功能已合并到 createBubbleGrid 中
        console.log('⚠️ restoreLearnedWordsDisplay 方法已弃用');
    }

    /**
     * 获取已学习的单词列表
     */
    getLearnedWords(level = null) {
        const targetLevel = level || this.currentLevel;
        try {
            const key = `learned_words_${targetLevel}`;
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) {
            console.warn('无法获取已学习单词:', e);
            return [];
        }
    }

    /**
     * 获取所有级别的已学习单词
     */
    getAllLearnedWords() {
        const levels = ['pre_primer', 'primer', 'first_grade', 'second_grade'];
        const allLearned = [];
        
        levels.forEach(level => {
            const words = this.getLearnedWords(level);
            allLearned.push(...words);
        });
        
        return [...new Set(allLearned)]; // 去重
    }

    /**
     * 销毁管理器
     */
    destroy() {
        this.bubbles.clear();
        this.revealedBubbles.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('🫧 BubbleWordsManager 已销毁');
    }
}

// 添加闪烁动画CSS
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-30px) scale(1.2);
        }
    }
`;
document.head.appendChild(sparkleStyle);

// 导出到全局
window.BubbleWordsManager = BubbleWordsManager;