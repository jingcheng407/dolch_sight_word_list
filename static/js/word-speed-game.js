/**
 * 单词竞速游戏
 * 快速识别和点击正确单词的竞速挑战
 */

class WordSpeedGame {
    constructor() {
        this.container = null;
        this.words = [];
        this.currentWord = null;
        this.choices = [];
        this.score = 0;
        this.timeLeft = 60; // 60秒倒计时
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.isGameActive = false;
        this.level = 'pre_primer';
        
        // 定时器
        this.gameTimer = null;
        this.questionTimer = null;
        this.countdownTimer = null;
        
        // 游戏配置
        this.questionTimeLimit = 5; // 每题5秒
        this.currentQuestionTime = 0;
        this.baseScore = 10;
        this.comboMultiplier = 1;
        
        console.log('⚡ WordSpeedGame 初始化完成');
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
        this.level = level;
        
        this.render();
        console.log(`🎮 单词竞速游戏初始化 - 等级: ${level}, 单词数: ${words.length}`);
    }

    /**
     * 渲染游戏界面
     */
    render() {
        const html = `
            <div class="word-speed-container" data-level="${this.level}">
                <div class="word-speed-header">
                    <h2 class="word-speed-title">⚡ 单词竞速挑战</h2>
                    <p class="word-speed-subtitle">快速找到正确的单词，挑战你的反应速度！</p>
                </div>
                
                <div class="word-speed-stats">
                    <div class="word-speed-stat-card">
                        <span class="word-speed-stat-emoji">⏱️</span>
                        <span class="word-speed-stat-value" id="speed-time">${this.timeLeft}</span>
                        <div class="word-speed-stat-label">剩余时间</div>
                    </div>
                    <div class="word-speed-stat-card">
                        <span class="word-speed-stat-emoji">🏆</span>
                        <span class="word-speed-stat-value" id="speed-score">${this.score}</span>
                        <div class="word-speed-stat-label">总分</div>
                    </div>
                    <div class="word-speed-stat-card">
                        <span class="word-speed-stat-emoji">🎯</span>
                        <span class="word-speed-stat-value" id="speed-accuracy">0%</span>
                        <div class="word-speed-stat-label">准确率</div>
                    </div>
                    <div class="word-speed-stat-card">
                        <span class="word-speed-stat-emoji">🔥</span>
                        <span class="word-speed-stat-value" id="speed-combo">0</span>
                        <div class="word-speed-stat-label">连击</div>
                    </div>
                </div>
                
                <div class="word-speed-progress">
                    <div class="word-speed-progress-label">题目进度</div>
                    <div class="word-speed-progress-bar">
                        <div class="word-speed-progress-fill" id="speed-progress-fill"></div>
                    </div>
                </div>
                
                <div class="word-speed-target" id="speed-target" style="display: none;">
                    <div class="word-speed-target-label">🔊 听到的单词是：</div>
                    <div class="word-speed-target-word" id="target-word">开始游戏</div>
                    <div class="word-speed-target-pronunciation" id="target-pronunciation"></div>
                </div>
                
                <div class="word-speed-choices" id="speed-choices">
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                        点击"开始挑战"开始游戏
                    </div>
                </div>
                
                <div class="word-speed-controls">
                    <button class="word-speed-control-btn" onclick="wordSpeedGame.startGame()">
                        🚀 开始挑战
                    </button>
                    <button class="word-speed-control-btn secondary" onclick="wordSpeedGame.pauseGame()" id="pause-btn">
                        ⏸️ 暂停
                    </button>
                    <button class="word-speed-control-btn secondary" onclick="wordSpeedGame.resetGame()">
                        🔄 重新开始
                    </button>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    /**
     * 开始游戏
     */
    startGame() {
        this.showCountdown(() => {
            this.resetGameState();
            this.isGameActive = true;
            this.startMainTimer();
            this.nextQuestion();
            
            console.log('🎮 单词竞速游戏开始');
        });
    }

    /**
     * 显示倒计时
     */
    showCountdown(callback) {
        let count = 3;
        const countdownElement = document.createElement('div');
        countdownElement.className = 'word-speed-countdown';
        countdownElement.textContent = count;
        
        document.body.appendChild(countdownElement);
        
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownElement.textContent = count;
                this.playCountdownSound();
            } else {
                countdownElement.textContent = 'GO!';
                this.playStartSound();
                
                setTimeout(() => {
                    countdownElement.remove();
                    callback();
                }, 500);
                
                clearInterval(countdownInterval);
            }
        }, 1000);
        
        this.playCountdownSound();
    }

    /**
     * 重置游戏状态
     */
    resetGameState() {
        this.score = 0;
        this.timeLeft = 60;
        this.totalQuestions = 0;
        this.correctAnswers = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.comboMultiplier = 1;
        
        this.clearAllTimers();
        this.updateStats();
        
        // 显示目标单词区域
        const targetElement = document.getElementById('speed-target');
        if (targetElement) {
            targetElement.style.display = 'block';
        }
    }

    /**
     * 重置游戏
     */
    resetGame() {
        this.clearAllTimers();
        this.isGameActive = false;
        this.render();
        console.log('🔄 单词竞速游戏已重置');
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        if (!this.isGameActive) return;
        
        // 简单的暂停实现
        alert('游戏暂停中，点击确定继续');
    }

    /**
     * 开始主计时器
     */
    startMainTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            
            if (this.timeLeft <= 10) {
                // 时间警告
                this.container.classList.add('time-warning');
            }
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            } else {
                this.updateStats();
            }
        }, 1000);
    }

    /**
     * 下一个问题
     */
    nextQuestion() {
        if (!this.isGameActive || this.timeLeft <= 0) return;
        
        this.totalQuestions++;
        this.currentQuestionTime = this.questionTimeLimit;
        
        // 选择目标单词
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        
        // 生成选择项（包括正确答案和3个干扰项）
        this.generateChoices();
        
        // 更新UI
        this.updateTargetDisplay();
        this.renderChoices();
        
        // 播放单词发音
        setTimeout(() => {
            this.speakWord(this.currentWord.word);
        }, 500);
        
        // 开始问题计时器
        this.startQuestionTimer();
        
        console.log(`❓ 第${this.totalQuestions}题: ${this.currentWord.word}`);
    }

    /**
     * 生成选择项
     */
    generateChoices() {
        this.choices = [this.currentWord];
        
        // 添加3个干扰项
        const otherWords = this.words.filter(w => w.word !== this.currentWord.word);
        
        for (let i = 0; i < 3; i++) {
            if (otherWords.length > 0) {
                const randomIndex = Math.floor(Math.random() * otherWords.length);
                this.choices.push(otherWords.splice(randomIndex, 1)[0]);
            }
        }
        
        // 打乱顺序
        this.choices = this.choices.sort(() => Math.random() - 0.5);
    }

    /**
     * 更新目标显示
     */
    updateTargetDisplay() {
        const targetWord = document.getElementById('target-word');
        const targetPronunciation = document.getElementById('target-pronunciation');
        
        if (targetWord) {
            targetWord.textContent = '🔊 听音识词';
        }
        
        if (targetPronunciation && this.currentWord.pronunciation) {
            targetPronunciation.textContent = this.currentWord.pronunciation;
        }
    }

    /**
     * 渲染选择项
     */
    renderChoices() {
        const choicesContainer = document.getElementById('speed-choices');
        if (!choicesContainer) return;
        
        choicesContainer.innerHTML = '';
        
        this.choices.forEach((choice, index) => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'word-speed-choice';
            choiceElement.textContent = choice.word;
            choiceElement.dataset.word = choice.word;
            choiceElement.dataset.index = index;
            
            choiceElement.addEventListener('click', () => {
                this.handleChoice(choice, choiceElement);
            });
            
            choicesContainer.appendChild(choiceElement);
        });
    }

    /**
     * 开始问题计时器
     */
    startQuestionTimer() {
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        this.questionTimer = setInterval(() => {
            this.currentQuestionTime--;
            
            if (this.currentQuestionTime <= 0) {
                // 时间到，自动跳过
                this.handleTimeout();
            }
        }, 1000);
    }

    /**
     * 处理选择
     */
    handleChoice(choice, choiceElement) {
        if (!this.isGameActive) return;
        
        // 清除问题计时器
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
        }
        
        // 禁用所有选择项
        const allChoices = document.querySelectorAll('.word-speed-choice');
        allChoices.forEach(el => el.classList.add('disabled'));
        
        const isCorrect = choice.word === this.currentWord.word;
        
        if (isCorrect) {
            this.handleCorrectAnswer(choiceElement);
        } else {
            this.handleWrongAnswer(choiceElement);
        }
        
        // 1.5秒后继续下一题
        setTimeout(() => {
            if (this.isGameActive) {
                this.nextQuestion();
            }
        }, 1500);
    }

    /**
     * 处理正确答案
     */
    handleCorrectAnswer(choiceElement) {
        choiceElement.classList.add('correct');
        
        // 增加连击
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // 计算分数（基础分数 × 连击倍数）
        this.comboMultiplier = 1 + (this.combo - 1) * 0.2;
        const points = Math.round(this.baseScore * this.comboMultiplier);
        
        this.score += points;
        this.correctAnswers++;
        
        // 显示连击效果
        if (this.combo >= 3) {
            this.showCombo();
            this.showEffect(`+${points} 🔥${this.combo}连击!`, 'combo');
        } else {
            this.showEffect(`+${points} ✅`, 'correct');
        }
        
        // 播放成功音效
        this.playSuccessSound();
        
        // 朗读单词
        setTimeout(() => {
            this.speakWord(this.currentWord.word);
        }, 300);
        
        console.log(`✅ 正确! 连击: ${this.combo}, 得分: +${points}`);
    }

    /**
     * 处理错误答案
     */
    handleWrongAnswer(choiceElement) {
        choiceElement.classList.add('wrong');
        
        // 重置连击
        this.combo = 0;
        this.comboMultiplier = 1;
        
        // 高亮正确答案
        const correctChoice = document.querySelector(`[data-word="${this.currentWord.word}"]`);
        if (correctChoice) {
            correctChoice.classList.add('correct');
        }
        
        this.showEffect('❌ 错误', 'wrong');
        this.playErrorSound();
        
        // 朗读正确单词
        setTimeout(() => {
            this.speakWord(this.currentWord.word);
        }, 500);
        
        console.log(`❌ 错误! 正确答案: ${this.currentWord.word}`);
    }

    /**
     * 处理超时
     */
    handleTimeout() {
        // 重置连击
        this.combo = 0;
        this.comboMultiplier = 1;
        
        // 高亮正确答案
        const correctChoice = document.querySelector(`[data-word="${this.currentWord.word}"]`);
        if (correctChoice) {
            correctChoice.classList.add('correct');
        }
        
        // 禁用所有选择项
        const allChoices = document.querySelectorAll('.word-speed-choice');
        allChoices.forEach(el => el.classList.add('disabled'));
        
        this.showEffect('⏰ 时间到!', 'wrong');
        this.playTimeoutSound();
        
        // 朗读正确单词
        this.speakWord(this.currentWord.word);
        
        // 1.5秒后继续下一题
        setTimeout(() => {
            if (this.isGameActive) {
                this.nextQuestion();
            }
        }, 1500);
        
        console.log(`⏰ 超时! 正确答案: ${this.currentWord.word}`);
    }

    /**
     * 显示连击效果
     */
    showCombo() {
        // 移除现有连击显示
        const existingCombo = this.container.querySelector('.word-speed-combo');
        if (existingCombo) {
            existingCombo.remove();
        }
        
        const comboElement = document.createElement('div');
        comboElement.className = 'word-speed-combo';
        comboElement.textContent = `🔥 ${this.combo} 连击!`;
        
        this.container.appendChild(comboElement);
        
        // 3秒后移除
        setTimeout(() => {
            if (comboElement.parentNode) {
                comboElement.parentNode.removeChild(comboElement);
            }
        }, 3000);
    }

    /**
     * 显示特效
     */
    showEffect(text, type) {
        const effect = document.createElement('div');
        effect.className = `word-speed-effect ${type}`;
        effect.textContent = text;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);
    }

    /**
     * 游戏结束
     */
    gameOver() {
        this.isGameActive = false;
        this.clearAllTimers();
        
        const accuracy = this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
        const wpm = Math.round(this.correctAnswers); // 简化的单词/分钟计算
        
        // 显示游戏结束弹窗
        const modal = document.createElement('div');
        modal.className = 'memory-game-complete'; // 复用样式
        modal.innerHTML = `
            <div class="memory-complete-modal">
                <div class="memory-complete-title">⚡ 挑战完成！</div>
                <div class="memory-complete-stats">
                    <div class="memory-complete-stat">
                        <span>🏆 最终得分:</span>
                        <span>${this.score}</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>🎯 准确率:</span>
                        <span>${accuracy}%</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>⚡ 答题速度:</span>
                        <span>${wpm} 词/分</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>🔥 最高连击:</span>
                        <span>${this.maxCombo}连击</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>📊 总题数:</span>
                        <span>${this.totalQuestions}题</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>⭐ 评价:</span>
                        <span>${this.getPerformanceRating()}</span>
                    </div>
                </div>
                <div class="memory-game-controls">
                    <button class="memory-control-btn" onclick="wordSpeedGame.startGame(); this.closest('.memory-game-complete').remove();">
                        🚀 再次挑战
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
        
        console.log(`🏁 游戏结束! 得分: ${this.score}, 准确率: ${accuracy}%, 最高连击: ${this.maxCombo}`);
    }

    /**
     * 获取表现评级
     */
    getPerformanceRating() {
        const accuracy = this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0;
        
        if (accuracy >= 90 && this.maxCombo >= 10) {
            return '🏆 传说级';
        } else if (accuracy >= 80 && this.maxCombo >= 7) {
            return '⭐ 大师级';
        } else if (accuracy >= 70 && this.maxCombo >= 5) {
            return '🥇 专家级';
        } else if (accuracy >= 60) {
            return '👍 熟练级';
        } else {
            return '💪 练习级';
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const timeElement = document.getElementById('speed-time');
        const scoreElement = document.getElementById('speed-score');
        const accuracyElement = document.getElementById('speed-accuracy');
        const comboElement = document.getElementById('speed-combo');
        const progressElement = document.getElementById('speed-progress-fill');

        if (timeElement) {
            timeElement.textContent = this.timeLeft;
        }
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        if (accuracyElement && this.totalQuestions > 0) {
            const accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);
            accuracyElement.textContent = `${accuracy}%`;
        }
        
        if (comboElement) {
            comboElement.textContent = this.combo;
        }
        
        if (progressElement) {
            // 简单的进度显示，基于已答题目数
            const progress = Math.min((this.totalQuestions / 20) * 100, 100);
            progressElement.style.width = `${progress}%`;
        }
    }

    /**
     * 清除所有定时器
     */
    clearAllTimers() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
        
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }

    /**
     * 音效播放
     */
    playCountdownSound() {
        this.playTone(800, 200);
    }

    playStartSound() {
        const notes = [523, 659, 783, 1047]; // C, E, G, C
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 150), index * 100);
        });
    }

    playSuccessSound() {
        const notes = [659, 783]; // E, G
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 100), index * 50);
        });
    }

    playErrorSound() {
        this.playTone(220, 300);
    }

    playTimeoutSound() {
        this.playTone(196, 500);
    }

    playGameOverSound() {
        const notes = [523, 494, 440, 392]; // C, B, A, G
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
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    /**
     * 销毁游戏
     */
    destroy() {
        this.clearAllTimers();
        this.isGameActive = false;
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('🗑️ WordSpeedGame 已销毁');
    }
}

// 创建全局实例
window.WordSpeedGame = WordSpeedGame;
window.wordSpeedGame = new WordSpeedGame();

console.log('⚡ WordSpeedGame 模块加载完成');