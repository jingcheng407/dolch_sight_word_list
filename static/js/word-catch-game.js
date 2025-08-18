/**
 * 单词捕捉游戏
 * 从天空掉落的单词，玩家需要点击听到的正确单词
 */

class WordCatchGame {
    constructor() {
        this.container = null;
        this.words = [];
        this.gameArea = null;
        this.currentTargetWord = null;
        this.score = 0;
        this.lives = 5;
        this.level = 1;
        this.speed = 1;
        this.isGameActive = false;
        this.isPaused = false;
        this.wordCount = 0;
        this.correctCaught = 0;
        this.wordsPerLevel = 10;
        
        // 游戏定时器
        this.gameLoop = null;
        this.wordSpawnInterval = null;
        this.currentLevel = 'pre_primer';
        
        // 掉落的单词数组
        this.fallingWords = [];
        this.wordSpawnRate = 2000; // 每2秒生成一个单词
        
        console.log('🎯 WordCatchGame 初始化完成');
    }

    /**
     * 初始化游戏
     */
    init(container, words, level = 'pre_primer') {
        if (!container) {
            console.error('❌ 容器元素未找到');
            return;
        }

        this.container = container;
        this.words = words || [];
        this.currentLevel = level;
        
        this.render();
        console.log(`🎮 单词捕捉游戏初始化 - 等级: ${level}, 单词数: ${words.length}`);
    }

    /**
     * 渲染游戏界面
     */
    render() {
        const html = `
            <div class="word-catch-container" data-level="${this.currentLevel}">
                <div class="word-catch-header">
                    <h2 class="word-catch-title">🎯 单词捕捉大作战</h2>
                    <p class="word-catch-subtitle">听音找词，快速点击天空中正确的单词！</p>
                </div>
                
                <div class="word-catch-stats">
                    <div class="word-catch-stat-item">
                        <span class="word-catch-stat-emoji">🏆</span>
                        <span class="word-catch-stat-value" id="catch-score">${this.score}</span>
                    </div>
                    <div class="word-catch-stat-item">
                        <span class="word-catch-stat-emoji">❤️</span>
                        <span class="word-catch-stat-value" id="catch-lives">${this.lives}</span>
                    </div>
                    <div class="word-catch-stat-item">
                        <span class="word-catch-stat-emoji">⚡</span>
                        <span class="word-catch-stat-value" id="catch-level">${this.level}</span>
                    </div>
                    <div class="word-catch-stat-item">
                        <span class="word-catch-stat-emoji">🎯</span>
                        <span class="word-catch-stat-value" id="catch-progress">${this.correctCaught}/${this.wordsPerLevel}</span>
                    </div>
                </div>
                
                <div class="word-catch-target" id="target-display">
                    <div class="word-catch-target-title">🔊 寻找这个单词：</div>
                    <div class="word-catch-target-word" id="target-word">点击开始游戏</div>
                    <div class="word-catch-target-pronunciation" id="target-pronunciation"></div>
                    <button class="word-catch-play-btn" id="play-target-btn" onclick="wordCatchGame.playTargetWord()">
                        🔊
                    </button>
                </div>
                
                <div class="word-catch-game-area" id="catch-game-area">
                    <!-- 掉落的单词将在这里生成 -->
                </div>
                
                <div class="word-catch-controls">
                    <button class="word-catch-control-btn" onclick="wordCatchGame.startGame()">
                        🚀 开始游戏
                    </button>
                    <button class="word-catch-control-btn secondary" onclick="wordCatchGame.pauseGame()" id="pause-btn">
                        ⏸️ 暂停
                    </button>
                    <button class="word-catch-control-btn secondary" onclick="wordCatchGame.resetGame()">
                        🔄 重新开始
                    </button>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.gameArea = document.getElementById('catch-game-area');
    }

    /**
     * 开始游戏
     */
    startGame() {
        this.resetGameState();
        this.selectNewTargetWord();
        this.startWordSpawning();
        this.startGameLoop();
        this.isGameActive = true;
        this.isPaused = false;
        
        // 更新按钮状态
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = '⏸️ 暂停';
            pauseBtn.onclick = () => this.pauseGame();
        }
        
        console.log('🎮 单词捕捉游戏开始');
    }

    /**
     * 重置游戏状态
     */
    resetGameState() {
        this.score = 0;
        this.lives = 5;
        this.level = 1;
        this.speed = 1;
        this.wordCount = 0;
        this.correctCaught = 0;
        this.fallingWords = [];
        
        this.clearAllTimers();
        this.clearFallingWords();
        this.updateStats();
    }

    /**
     * 重置游戏
     */
    resetGame() {
        this.clearAllTimers();
        this.isGameActive = false;
        this.isPaused = false;
        this.render();
        console.log('🔄 单词捕捉游戏已重置');
    }

    /**
     * 暂停/恢复游戏
     */
    pauseGame() {
        if (!this.isGameActive) return;
        
        const pauseBtn = document.getElementById('pause-btn');
        
        if (this.isPaused) {
            // 恢复游戏
            this.isPaused = false;
            this.startWordSpawning();
            this.startGameLoop();
            
            if (pauseBtn) {
                pauseBtn.textContent = '⏸️ 暂停';
            }
            
            // 移除暂停遮罩
            const overlay = document.querySelector('.word-catch-pause-overlay');
            if (overlay) {
                overlay.remove();
            }
            
            console.log('▶️ 游戏恢复');
        } else {
            // 暂停游戏
            this.isPaused = true;
            this.clearAllTimers();
            
            if (pauseBtn) {
                pauseBtn.textContent = '▶️ 继续';
            }
            
            // 显示暂停遮罩
            this.showPauseOverlay();
            
            console.log('⏸️ 游戏暂停');
        }
    }

    /**
     * 显示暂停遮罩
     */
    showPauseOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'word-catch-pause-overlay';
        overlay.innerHTML = `
            <div class="word-catch-pause-content">
                <h3 class="word-catch-pause-title">游戏暂停</h3>
                <p>点击"继续"按钮恢复游戏</p>
            </div>
        `;
        
        this.container.appendChild(overlay);
    }

    /**
     * 选择新的目标单词
     */
    selectNewTargetWord() {
        if (this.words.length === 0) return;
        
        this.currentTargetWord = this.words[Math.floor(Math.random() * this.words.length)];
        
        const targetWordElement = document.getElementById('target-word');
        const targetPronunciation = document.getElementById('target-pronunciation');
        
        if (targetWordElement) {
            targetWordElement.textContent = this.currentTargetWord.word;
        }
        
        if (targetPronunciation && this.currentTargetWord.pronunciation) {
            targetPronunciation.textContent = this.currentTargetWord.pronunciation;
        }
        
        // 自动播放目标单词
        setTimeout(() => {
            this.playTargetWord();
        }, 500);
    }

    /**
     * 播放目标单词发音
     */
    playTargetWord() {
        if (!this.currentTargetWord) return;
        
        this.speakWord(this.currentTargetWord.word);
        
        // 按钮动画效果
        const btn = document.getElementById('play-target-btn');
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        }
    }

    /**
     * 开始单词生成循环
     */
    startWordSpawning() {
        if (this.wordSpawnInterval) {
            clearInterval(this.wordSpawnInterval);
        }
        
        this.wordSpawnInterval = setInterval(() => {
            if (this.isGameActive && !this.isPaused) {
                this.spawnWord();
            }
        }, this.wordSpawnRate / this.speed);
    }

    /**
     * 生成掉落的单词
     */
    spawnWord() {
        if (!this.gameArea || !this.currentTargetWord) return;
        
        // 随机选择单词（50%概率是目标单词）
        let wordData;
        const isTarget = Math.random() < 0.5;
        
        if (isTarget) {
            wordData = this.currentTargetWord;
        } else {
            // 选择其他单词
            const otherWords = this.words.filter(w => w.word !== this.currentTargetWord.word);
            wordData = otherWords[Math.floor(Math.random() * otherWords.length)];
        }
        
        // 创建掉落单词元素
        const wordElement = document.createElement('div');
        wordElement.className = `falling-word ${isTarget ? 'target' : ''}`;
        wordElement.textContent = wordData.word;
        wordElement.dataset.word = wordData.word;
        wordElement.dataset.isTarget = isTarget;
        
        // 随机水平位置
        const maxWidth = this.gameArea.clientWidth - 100;
        const leftPosition = Math.random() * maxWidth;
        wordElement.style.left = `${leftPosition}px`;
        
        // 设置下降速度
        const fallDuration = (4000 - (this.speed - 1) * 500) / this.speed;
        wordElement.style.animationDuration = `${fallDuration}ms`;
        
        // 添加点击事件
        wordElement.addEventListener('click', (e) => {
            this.catchWord(wordElement, isTarget, e);
        });
        
        this.gameArea.appendChild(wordElement);
        this.fallingWords.push(wordElement);
        
        // 设置自动移除（如果没有被点击）
        setTimeout(() => {
            if (wordElement.parentNode && !wordElement.classList.contains('caught-correct') && !wordElement.classList.contains('caught-wrong')) {
                this.missWord(wordElement, isTarget);
            }
        }, fallDuration);
    }

    /**
     * 捕捉单词
     */
    catchWord(wordElement, isTarget, event) {
        event.stopPropagation();
        
        // 移除点击事件
        wordElement.style.pointerEvents = 'none';
        
        if (isTarget) {
            // 正确捕捉
            this.handleCorrectCatch(wordElement);
        } else {
            // 错误捕捉
            this.handleWrongCatch(wordElement);
        }
        
        // 从数组中移除
        const index = this.fallingWords.indexOf(wordElement);
        if (index > -1) {
            this.fallingWords.splice(index, 1);
        }
    }

    /**
     * 处理正确捕捉
     */
    handleCorrectCatch(wordElement) {
        wordElement.classList.add('caught-correct');
        
        // 增加分数
        this.score += 10 * this.level;
        this.correctCaught++;
        this.wordCount++;
        
        // 播放成功音效
        this.playSuccessSound();
        
        // 显示特效
        this.showCatchEffect(wordElement, '🎉 正确!', 'correct');
        
        // 朗读单词
        setTimeout(() => {
            this.speakWord(this.currentTargetWord.word);
        }, 300);
        
        // 检查是否升级
        if (this.correctCaught >= this.wordsPerLevel) {
            this.levelUp();
        } else {
            // 选择新的目标单词
            setTimeout(() => {
                this.selectNewTargetWord();
            }, 1500);
        }
        
        this.updateStats();
        console.log(`✅ 正确捕捉: ${this.currentTargetWord.word}`);
    }

    /**
     * 处理错误捕捉
     */
    handleWrongCatch(wordElement) {
        wordElement.classList.add('caught-wrong');
        
        // 减少生命值
        this.lives--;
        
        // 播放错误音效
        this.playErrorSound();
        
        // 显示特效
        this.showCatchEffect(wordElement, '❌ 错误!', 'wrong');
        
        // 检查游戏结束
        if (this.lives <= 0) {
            setTimeout(() => {
                this.gameOver();
            }, 1000);
        }
        
        this.updateStats();
        console.log(`❌ 错误捕捉: ${wordElement.textContent}`);
    }

    /**
     * 处理错过单词
     */
    missWord(wordElement, isTarget) {
        if (isTarget) {
            // 错过目标单词
            this.lives--;
            this.showCatchEffect(wordElement, '💔 错过了!', 'wrong');
            this.playErrorSound();
            
            if (this.lives <= 0) {
                setTimeout(() => {
                    this.gameOver();
                }, 1000);
            }
            
            this.updateStats();
        }
        
        // 移除单词
        if (wordElement.parentNode) {
            wordElement.parentNode.removeChild(wordElement);
        }
        
        // 从数组中移除
        const index = this.fallingWords.indexOf(wordElement);
        if (index > -1) {
            this.fallingWords.splice(index, 1);
        }
    }

    /**
     * 升级
     */
    levelUp() {
        this.level++;
        this.speed += 0.2;
        this.correctCaught = 0;
        this.wordSpawnRate = Math.max(1000, this.wordSpawnRate - 200);
        
        // 显示升级特效
        this.showLevelUpEffect();
        
        // 重新开始单词生成
        this.startWordSpawning();
        
        // 选择新目标单词
        setTimeout(() => {
            this.selectNewTargetWord();
        }, 2000);
        
        this.updateStats();
        console.log(`🎉 升级到第${this.level}级！`);
    }

    /**
     * 显示升级特效
     */
    showLevelUpEffect() {
        const effect = document.createElement('div');
        effect.className = 'word-catch-effect correct';
        effect.textContent = `🎉 升级到第${this.level}级！`;
        effect.style.left = '50%';
        effect.style.top = '50%';
        effect.style.transform = 'translateX(-50%)';
        effect.style.fontSize = '28px';
        
        this.gameArea.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);
    }

    /**
     * 显示捕捉特效
     */
    showCatchEffect(wordElement, text, type) {
        const rect = wordElement.getBoundingClientRect();
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        
        const effect = document.createElement('div');
        effect.className = `word-catch-effect ${type}`;
        effect.textContent = text;
        effect.style.left = `${rect.left - gameAreaRect.left + rect.width / 2}px`;
        effect.style.top = `${rect.top - gameAreaRect.top}px`;
        
        this.gameArea.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);
    }

    /**
     * 开始游戏循环
     */
    startGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        this.gameLoop = setInterval(() => {
            if (this.isGameActive && !this.isPaused) {
                this.updateGame();
            }
        }, 100);
    }

    /**
     * 更新游戏状态
     */
    updateGame() {
        // 检查掉落单词的状态，移除已经超出屏幕的单词
        this.fallingWords = this.fallingWords.filter(word => {
            if (word.parentNode && parseInt(word.style.top || 0) > 450) {
                word.parentNode.removeChild(word);
                return false;
            }
            return word.parentNode;
        });
    }

    /**
     * 清除所有定时器
     */
    clearAllTimers() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        if (this.wordSpawnInterval) {
            clearInterval(this.wordSpawnInterval);
            this.wordSpawnInterval = null;
        }
    }

    /**
     * 清除所有掉落的单词
     */
    clearFallingWords() {
        this.fallingWords.forEach(word => {
            if (word.parentNode) {
                word.parentNode.removeChild(word);
            }
        });
        this.fallingWords = [];
    }

    /**
     * 游戏结束
     */
    gameOver() {
        this.isGameActive = false;
        this.isPaused = false;
        this.clearAllTimers();
        this.clearFallingWords();
        
        // 显示游戏结束弹窗
        const modal = document.createElement('div');
        modal.className = 'memory-game-complete'; // 复用样式
        modal.innerHTML = `
            <div class="memory-complete-modal">
                <div class="memory-complete-title">🎮 游戏结束！</div>
                <div class="memory-complete-stats">
                    <div class="memory-complete-stat">
                        <span>🏆 最终得分:</span>
                        <span>${this.score}</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>⚡ 到达级别:</span>
                        <span>第${this.level}级</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>🎯 捕捉正确:</span>
                        <span>${this.wordCount}个单词</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>⭐ 评价:</span>
                        <span>${this.getScoreRating()}</span>
                    </div>
                </div>
                <div class="memory-game-controls">
                    <button class="memory-control-btn" onclick="wordCatchGame.startGame(); this.closest('.memory-game-complete').remove();">
                        🚀 再玩一次
                    </button>
                    <button class="memory-control-btn secondary" onclick="this.closest('.memory-game-complete').remove();">
                        ✅ 完成
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // 播放游戏结束音效
        this.playGameOverSound();
        
        console.log(`🏁 游戏结束! 最终得分: ${this.score}, 级别: ${this.level}`);
    }

    /**
     * 获取分数评级
     */
    getScoreRating() {
        if (this.score >= 500) {
            return '🏆 传奇大师';
        } else if (this.score >= 300) {
            return '⭐ 优秀';
        } else if (this.score >= 150) {
            return '👍 良好';
        } else if (this.score >= 50) {
            return '💪 加油';
        } else {
            return '🌱 继续努力';
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const scoreElement = document.getElementById('catch-score');
        const livesElement = document.getElementById('catch-lives');
        const levelElement = document.getElementById('catch-level');
        const progressElement = document.getElementById('catch-progress');

        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        if (livesElement) {
            livesElement.textContent = this.lives;
        }
        
        if (levelElement) {
            levelElement.textContent = this.level;
        }
        
        if (progressElement) {
            progressElement.textContent = `${this.correctCaught}/${this.wordsPerLevel}`;
        }
    }

    /**
     * 音效播放
     */
    playSuccessSound() {
        const notes = [523, 659, 783]; // C, E, G
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 150), index * 80);
        });
    }

    playErrorSound() {
        this.playTone(220, 400);
    }

    playGameOverSound() {
        const notes = [392, 330, 262]; // G, E, C
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 400), index * 200);
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
            utterance.pitch = 1.1;
            utterance.volume = 0.7;
            speechSynthesis.speak(utterance);
        }
    }

    /**
     * 销毁游戏
     */
    destroy() {
        this.clearAllTimers();
        this.clearFallingWords();
        this.isGameActive = false;
        this.isPaused = false;
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('🗑️ WordCatchGame 已销毁');
    }
}

// 创建全局实例
window.WordCatchGame = WordCatchGame;
window.wordCatchGame = new WordCatchGame();

console.log('🎯 WordCatchGame 模块加载完成');