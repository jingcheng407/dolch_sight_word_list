/**
 * 记忆翻卡游戏
 * 翻牌配对游戏，锻炼记忆力和单词识别
 */

class MemoryGame {
    constructor() {
        this.container = null;
        this.words = [];
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isGameActive = false;
        this.difficulty = 'easy'; // easy, medium, hard
        this.level = 'pre_primer';
        
        // 游戏配置
        this.gameConfig = {
            easy: { pairs: 2, gridClass: 'memory-grid-2x2' },
            medium: { pairs: 3, gridClass: 'memory-grid-3x2' }, 
            hard: { pairs: 4, gridClass: 'memory-grid-4x2' }
        };
        
        console.log('🃏 MemoryGame 初始化完成');
    }

    /**
     * 初始化游戏
     */
    init(container, words, level = 'pre_primer', difficulty = 'easy') {
        if (!container) {
            console.error('❌ 容器元素未找到');
            return;
        }

        this.container = container;
        this.words = words || [];
        this.level = level;
        this.difficulty = difficulty;
        this.totalPairs = this.gameConfig[difficulty].pairs;
        
        this.render();
        console.log(`🎮 记忆游戏初始化 - 等级: ${level}, 难度: ${difficulty}`);
    }

    /**
     * 渲染游戏界面
     */
    render() {
        const config = this.gameConfig[this.difficulty];
        
        const html = `
            <div class="memory-game-container" data-level="${this.level}">
                <div class="memory-game-header">
                    <h2 class="memory-game-title">🧠 记忆翻卡游戏</h2>
                    <p class="memory-game-subtitle">翻开卡片，找到相同的单词配对！</p>
                </div>
                
                <div class="memory-game-stats">
                    <div class="memory-stat-item memory-timer">
                        <span class="memory-stat-emoji">⏰</span>
                        <span class="memory-stat-value" id="memory-timer">00:00</span>
                    </div>
                    <div class="memory-stat-item memory-moves">
                        <span class="memory-stat-emoji">🔄</span>
                        <span class="memory-stat-value" id="memory-moves">0</span>
                    </div>
                    <div class="memory-stat-item memory-matches">
                        <span class="memory-stat-emoji">✅</span>
                        <span class="memory-stat-value" id="memory-matches">0/${this.totalPairs}</span>
                    </div>
                </div>
                
                <div class="memory-cards-grid ${config.gridClass}" id="memory-cards-grid">
                    <!-- 卡片将在这里生成 -->
                </div>
                
                <div class="memory-game-controls">
                    <button class="memory-control-btn" onclick="memoryGame.startNewGame()">
                        🚀 开始游戏
                    </button>
                    <button class="memory-control-btn secondary" onclick="memoryGame.resetGame()">
                        🔄 重新开始  
                    </button>
                    <button class="memory-control-btn secondary" onclick="memoryGame.showAllCards()" 
                            id="peek-btn">
                        👀 偷看3秒
                    </button>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    /**
     * 开始新游戏
     */
    startNewGame() {
        this.resetGameState();
        this.createCards();
        this.shuffleCards();
        this.renderCards();
        this.startTimer();
        this.isGameActive = true;
        
        console.log('🎮 开始新的记忆游戏');
    }

    /**
     * 重置游戏状态
     */
    resetGameState() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.isGameActive = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.updateStats();
    }

    /**
     * 重置游戏（保持当前设置）
     */
    resetGame() {
        this.resetGameState();
        this.render();
        console.log('🔄 游戏已重置');
    }

    /**
     * 创建卡片
     */
    createCards() {
        // 随机选择指定数量的单词
        const selectedWords = this.words
            .sort(() => Math.random() - 0.5)
            .slice(0, this.totalPairs);
        
        // 创建成对的卡片
        this.cards = [];
        selectedWords.forEach((word, index) => {
            // 每个单词创建两张卡片
            for (let i = 0; i < 2; i++) {
                this.cards.push({
                    id: `${index}-${i}`,
                    word: word.word,
                    pronunciation: word.pronunciation || '',
                    wordData: word,
                    isFlipped: false,
                    isMatched: false,
                    pairId: index
                });
            }
        });
        
        console.log(`🃏 创建了 ${this.cards.length} 张卡片`);
    }

    /**
     * 打乱卡片顺序
     */
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /**
     * 渲染卡片到界面
     */
    renderCards() {
        const grid = document.getElementById('memory-cards-grid');
        if (!grid) return;

        grid.innerHTML = '';

        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.cardId = card.id;
            cardElement.dataset.pairId = card.pairId;
            
            cardElement.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-back">
                        🎴
                    </div>
                    <div class="memory-card-front">
                        <div class="memory-card-word">${card.word}</div>
                        <div class="memory-card-pronunciation">${card.pronunciation}</div>
                    </div>
                </div>
            `;

            cardElement.addEventListener('click', () => this.flipCard(index));
            grid.appendChild(cardElement);
        });
    }

    /**
     * 翻牌
     */
    flipCard(cardIndex) {
        if (!this.isGameActive) return;
        
        const card = this.cards[cardIndex];
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        
        // 不能翻开已经翻开或已匹配的卡片
        if (card.isFlipped || card.isMatched) return;
        
        // 最多只能同时翻开两张卡片
        if (this.flippedCards.length >= 2) return;

        // 翻开卡片
        card.isFlipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push(cardIndex);

        // 播放翻卡音效
        this.playFlipSound();

        // 如果翻开了两张卡片，检查是否匹配
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }

    /**
     * 检查卡片是否匹配
     */
    checkMatch() {
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        const cardElement1 = document.querySelector(`[data-card-id="${card1.id}"]`);
        const cardElement2 = document.querySelector(`[data-card-id="${card2.id}"]`);

        if (card1.pairId === card2.pairId) {
            // 匹配成功
            card1.isMatched = true;
            card2.isMatched = true;
            
            cardElement1.classList.add('matched');
            cardElement2.classList.add('matched');
            
            this.matchedPairs++;
            this.playMatchSound();
            
            // 朗读单词
            setTimeout(() => {
                this.speakWord(card1.word);
            }, 500);
            
            console.log(`✅ 匹配成功: ${card1.word}`);
            
        } else {
            // 匹配失败，翻回去
            card1.isFlipped = false;
            card2.isFlipped = false;
            
            cardElement1.classList.add('wrong');
            cardElement2.classList.add('wrong');
            
            setTimeout(() => {
                cardElement1.classList.remove('flipped', 'wrong');
                cardElement2.classList.remove('flipped', 'wrong');
            }, 500);
            
            this.playWrongSound();
            console.log(`❌ 匹配失败: ${card1.word} vs ${card2.word}`);
        }

        // 清空已翻开的卡片列表
        this.flippedCards = [];
        this.updateStats();

        // 检查游戏是否完成
        if (this.matchedPairs === this.totalPairs) {
            setTimeout(() => {
                this.gameComplete();
            }, 1000);
        }
    }

    /**
     * 游戏完成
     */
    gameComplete() {
        this.isGameActive = false;
        this.stopTimer();
        
        const timeString = this.formatTime(this.timer);
        const accuracy = Math.round((this.totalPairs / this.moves) * 100);
        
        // 显示完成弹窗
        const modal = document.createElement('div');
        modal.className = 'memory-game-complete';
        modal.innerHTML = `
            <div class="memory-complete-modal">
                <div class="memory-complete-title">🎉 恭喜完成！</div>
                <div class="memory-complete-stats">
                    <div class="memory-complete-stat">
                        <span>⏰ 用时:</span>
                        <span>${timeString}</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>🔄 步数:</span>
                        <span>${this.moves}</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>🎯 准确率:</span>
                        <span>${accuracy}%</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>⭐ 等级:</span>
                        <span>${this.getScoreLevel(accuracy, this.moves)}</span>
                    </div>
                </div>
                <div class="memory-game-controls">
                    <button class="memory-control-btn" onclick="memoryGame.startNewGame(); this.closest('.memory-game-complete').remove();">
                        🚀 再玩一次
                    </button>
                    <button class="memory-control-btn secondary" onclick="this.closest('.memory-game-complete').remove();">
                        ✅ 完成
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // 播放胜利音效
        this.playVictorySound();
        
        console.log(`🎉 游戏完成! 用时: ${timeString}, 步数: ${this.moves}, 准确率: ${accuracy}%`);
    }

    /**
     * 偷看所有卡片
     */
    showAllCards() {
        if (!this.isGameActive) return;
        
        const button = document.getElementById('peek-btn');
        button.disabled = true;
        button.textContent = '👀 偷看中...';
        
        // 翻开所有卡片
        const cardElements = document.querySelectorAll('.memory-card');
        cardElements.forEach(card => card.classList.add('flipped'));
        
        // 3秒后翻回去
        setTimeout(() => {
            cardElements.forEach(card => {
                if (!card.classList.contains('matched')) {
                    card.classList.remove('flipped');
                }
            });
            
            button.disabled = false;
            button.textContent = '👀 偷看3秒';
        }, 3000);
    }

    /**
     * 启动计时器
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateStats();
        }, 1000);
    }

    /**
     * 停止计时器
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * 更新统计信息显示
     */
    updateStats() {
        const timerElement = document.getElementById('memory-timer');
        const movesElement = document.getElementById('memory-moves');
        const matchesElement = document.getElementById('memory-matches');

        if (timerElement) {
            timerElement.textContent = this.formatTime(this.timer);
        }
        
        if (movesElement) {
            movesElement.textContent = this.moves;
        }
        
        if (matchesElement) {
            matchesElement.textContent = `${this.matchedPairs}/${this.totalPairs}`;
        }
    }

    /**
     * 格式化时间显示
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * 获取成绩等级
     */
    getScoreLevel(accuracy, moves) {
        if (accuracy >= 90 && moves <= this.totalPairs + 2) {
            return '🏆 完美';
        } else if (accuracy >= 75) {
            return '⭐ 优秀';
        } else if (accuracy >= 60) {
            return '👍 良好';
        } else {
            return '💪 加油';
        }
    }

    /**
     * 音效播放
     */
    playFlipSound() {
        // 简单的音效，可以扩展为真实音频文件
        this.playTone(440, 100);
    }

    playMatchSound() {
        // 成功匹配音效
        this.playTone(660, 200);
        setTimeout(() => this.playTone(880, 200), 150);
    }

    playWrongSound() {
        // 错误音效
        this.playTone(220, 300);
    }

    playVictorySound() {
        // 胜利音效
        const notes = [440, 554, 659, 880];
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 200), index * 150);
        });
    }

    playTone(frequency, duration) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
        } catch (e) {
            console.warn('音效播放失败:', e);
        }
    }

    /**
     * 单词朗读
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
     * 销毁游戏
     */
    destroy() {
        this.resetGameState();
        if (this.container) {
            this.container.innerHTML = '';
        }
        console.log('🗑️ MemoryGame 已销毁');
    }
}

// 创建全局实例
window.MemoryGame = MemoryGame;
window.memoryGame = new MemoryGame();

console.log('🧠 MemoryGame 模块加载完成');