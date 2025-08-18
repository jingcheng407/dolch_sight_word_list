/**
 * 单词拼写游戏
 * 听音拼写游戏，锻炼拼写能力和单词记忆
 */

class SpellingGame {
    constructor() {
        this.container = null;
        this.words = [];
        this.currentWordIndex = 0;
        this.currentWord = null;
        this.playerInput = [];
        this.score = 0;
        this.totalWords = 0;
        this.correctWords = 0;
        this.hints = 3;
        this.isGameActive = false;
        this.level = 'pre_primer';
        
        // 键盘布局
        this.keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
        ];
        
        console.log('✏️ SpellingGame 初始化完成');
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
        this.totalWords = Math.min(this.words.length, 10); // 最多10个单词
        
        this.render();
        console.log(`🎮 拼写游戏初始化 - 等级: ${level}, 单词数: ${this.totalWords}`);
    }

    /**
     * 渲染游戏界面
     */
    render() {
        const html = `
            <div class="spelling-game-container" data-level="${this.level}">
                <div class="spelling-game-header">
                    <h2 class="spelling-game-title">✏️ 单词拼写游戏</h2>
                    <p class="spelling-game-subtitle">听声音，拼出正确的单词！</p>
                </div>
                
                <div class="spelling-game-stats">
                    <div class="spelling-stat-item">
                        <span class="spelling-stat-emoji">📝</span>
                        <span class="spelling-stat-value" id="spelling-progress">0/${this.totalWords}</span>
                    </div>
                    <div class="spelling-stat-item">
                        <span class="spelling-stat-emoji">✅</span>
                        <span class="spelling-stat-value" id="spelling-correct">0</span>
                    </div>
                    <div class="spelling-stat-item">
                        <span class="spelling-stat-emoji">💡</span>
                        <span class="spelling-stat-value" id="spelling-hints">${this.hints}</span>
                    </div>
                    <div class="spelling-stat-item">
                        <span class="spelling-stat-emoji">🏆</span>
                        <span class="spelling-stat-value" id="spelling-score">${this.score}</span>
                    </div>
                </div>
                
                <div class="spelling-progress">
                    <div class="spelling-progress-bar">
                        <div class="spelling-progress-fill" id="spelling-progress-fill"></div>
                    </div>
                </div>
                
                <div class="spelling-word-display">
                    <div class="spelling-word-sound" onclick="spellingGame.playCurrentWord()" id="sound-button">
                        <div class="spelling-sound-icon">🔊</div>
                    </div>
                    <div class="spelling-word-hint" id="word-hint">
                        点击喇叭听单词发音
                    </div>
                </div>
                
                <div class="spelling-input-area">
                    <div class="spelling-letter-boxes" id="letter-boxes">
                        <!-- 字母框将在这里生成 -->
                    </div>
                </div>
                
                <div class="spelling-feedback" id="spelling-feedback">
                    <div class="spelling-feedback-message" id="feedback-message"></div>
                </div>
                
                <div class="spelling-keyboard" id="spelling-keyboard">
                    <!-- 虚拟键盘将在这里生成 -->
                </div>
                
                <div class="spelling-game-controls">
                    <button class="spelling-control-btn" onclick="spellingGame.startGame()">
                        🚀 开始游戏
                    </button>
                    <button class="spelling-control-btn secondary" onclick="spellingGame.getHint()">
                        💡 提示 (${this.hints})
                    </button>
                    <button class="spelling-control-btn secondary" onclick="spellingGame.skipWord()">
                        ⏭️ 跳过
                    </button>
                    <button class="spelling-control-btn secondary" onclick="spellingGame.resetGame()">
                        🔄 重新开始
                    </button>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.renderKeyboard();
    }

    /**
     * 渲染虚拟键盘
     */
    renderKeyboard() {
        const keyboard = document.getElementById('spelling-keyboard');
        if (!keyboard) return;

        keyboard.innerHTML = '';
        
        this.keyboardLayout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'spelling-keyboard-row';
            
            row.forEach(key => {
                const keyBtn = document.createElement('button');
                keyBtn.className = 'spelling-key';
                keyBtn.textContent = key;
                
                if (key === '⌫') {
                    keyBtn.classList.add('backspace');
                    keyBtn.onclick = () => this.deleteLetter();
                } else {
                    keyBtn.onclick = () => this.inputLetter(key);
                }
                
                rowDiv.appendChild(keyBtn);
            });
            
            keyboard.appendChild(rowDiv);
        });

        // 添加物理键盘支持
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    /**
     * 开始游戏
     */
    startGame() {
        this.resetGameState();
        this.selectRandomWords();
        this.loadNextWord();
        this.isGameActive = true;
        
        console.log('🎮 拼写游戏开始');
    }

    /**
     * 重置游戏状态
     */
    resetGameState() {
        this.currentWordIndex = 0;
        this.currentWord = null;
        this.playerInput = [];
        this.score = 0;
        this.correctWords = 0;
        this.hints = 3;
        this.isGameActive = false;
        
        this.updateStats();
        this.clearFeedback();
    }

    /**
     * 重置游戏
     */
    resetGame() {
        this.resetGameState();
        this.render();
        console.log('🔄 拼写游戏已重置');
    }

    /**
     * 选择随机单词
     */
    selectRandomWords() {
        this.words = this.words
            .sort(() => Math.random() - 0.5)
            .slice(0, this.totalWords);
        
        console.log(`📚 选择了 ${this.words.length} 个单词`);
    }

    /**
     * 加载下一个单词
     */
    loadNextWord() {
        if (this.currentWordIndex >= this.words.length) {
            this.gameComplete();
            return;
        }

        this.currentWord = this.words[this.currentWordIndex];
        this.playerInput = [];
        
        this.renderLetterBoxes();
        this.updateStats();
        this.clearFeedback();
        
        // 自动播放单词
        setTimeout(() => {
            this.playCurrentWord();
        }, 500);
        
        console.log(`📝 当前单词: ${this.currentWord.word}`);
    }

    /**
     * 渲染字母输入框
     */
    renderLetterBoxes() {
        const container = document.getElementById('letter-boxes');
        if (!container || !this.currentWord) return;

        container.innerHTML = '';
        const wordLength = this.currentWord.word.length;
        
        for (let i = 0; i < wordLength; i++) {
            const box = document.createElement('div');
            box.className = 'spelling-letter-box';
            box.dataset.index = i;
            
            if (i === this.playerInput.length) {
                box.classList.add('current');
            }
            
            if (this.playerInput[i]) {
                box.textContent = this.playerInput[i];
                box.classList.add('filled');
            }
            
            container.appendChild(box);
        }
    }

    /**
     * 播放当前单词发音
     */
    playCurrentWord() {
        if (!this.currentWord) return;
        
        const button = document.getElementById('sound-button');
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
        }
        
        this.speakWord(this.currentWord.word);
        
        // 显示例句作为提示
        const hint = document.getElementById('word-hint');
        if (hint && this.currentWord.example) {
            hint.textContent = `例句: ${this.currentWord.example}`;
        }
    }

    /**
     * 输入字母
     */
    inputLetter(letter) {
        if (!this.isGameActive || !this.currentWord) return;
        
        if (this.playerInput.length >= this.currentWord.word.length) {
            return; // 已经输入完整个单词
        }
        
        this.playerInput.push(letter.toLowerCase());
        this.renderLetterBoxes();
        
        // 检查是否输入完整
        if (this.playerInput.length === this.currentWord.word.length) {
            setTimeout(() => {
                this.checkSpelling();
            }, 300);
        }
    }

    /**
     * 删除字母
     */
    deleteLetter() {
        if (!this.isGameActive || this.playerInput.length === 0) return;
        
        this.playerInput.pop();
        this.renderLetterBoxes();
    }

    /**
     * 处理物理键盘输入
     */
    handleKeyPress(event) {
        if (!this.isGameActive) return;
        
        const key = event.key.toUpperCase();
        
        if (key >= 'A' && key <= 'Z') {
            event.preventDefault();
            this.inputLetter(key);
        } else if (key === 'BACKSPACE') {
            event.preventDefault();
            this.deleteLetter();
        } else if (key === 'ENTER') {
            event.preventDefault();
            if (this.playerInput.length === this.currentWord.word.length) {
                this.checkSpelling();
            }
        }
    }

    /**
     * 检查拼写
     */
    checkSpelling() {
        if (!this.currentWord) return;
        
        const playerWord = this.playerInput.join('').toLowerCase();
        const correctWord = this.currentWord.word.toLowerCase();
        
        if (playerWord === correctWord) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    /**
     * 处理正确答案
     */
    handleCorrectAnswer() {
        this.correctWords++;
        this.score += 10;
        
        // 显示正确反馈
        this.showFeedback('🎉 正确！干得好！', 'success');
        
        // 高亮所有字母框
        const boxes = document.querySelectorAll('.spelling-letter-box');
        boxes.forEach(box => box.classList.add('correct'));
        
        // 播放成功音效
        this.playSuccessSound();
        
        // 朗读单词
        setTimeout(() => {
            this.speakWord(this.currentWord.word);
        }, 500);
        
        // 显示庆祝动画
        this.showCelebration('🎉');
        
        // 继续下一个单词
        setTimeout(() => {
            this.nextWord();
        }, 2000);
        
        console.log(`✅ 正确拼写: ${this.currentWord.word}`);
    }

    /**
     * 处理错误答案
     */
    handleWrongAnswer() {
        const playerWord = this.playerInput.join('').toLowerCase();
        
        // 显示错误反馈
        this.showFeedback(`❌ 错误! 正确答案是 "${this.currentWord.word}"`, 'error');
        
        // 高亮错误的字母
        const boxes = document.querySelectorAll('.spelling-letter-box');
        boxes.forEach((box, index) => {
            const playerLetter = this.playerInput[index];
            const correctLetter = this.currentWord.word[index];
            
            if (playerLetter && playerLetter.toLowerCase() !== correctLetter.toLowerCase()) {
                box.classList.add('wrong');
            } else if (playerLetter && playerLetter.toLowerCase() === correctLetter.toLowerCase()) {
                box.classList.add('correct');
            }
        });
        
        // 播放错误音效
        this.playErrorSound();
        
        // 显示正确答案
        setTimeout(() => {
            boxes.forEach((box, index) => {
                box.textContent = this.currentWord.word[index].toLowerCase();
                box.classList.remove('wrong');
                box.classList.add('correct');
            });
            
            // 朗读正确单词
            this.speakWord(this.currentWord.word);
        }, 1000);
        
        // 继续下一个单词
        setTimeout(() => {
            this.nextWord();
        }, 3000);
        
        console.log(`❌ 错误拼写: ${playerWord} → ${this.currentWord.word}`);
    }

    /**
     * 下一个单词
     */
    nextWord() {
        this.currentWordIndex++;
        this.loadNextWord();
    }

    /**
     * 跳过当前单词
     */
    skipWord() {
        if (!this.isGameActive) return;
        
        this.showFeedback(`⏭️ 跳过了 "${this.currentWord.word}"`, 'hint');
        
        // 显示正确答案
        const boxes = document.querySelectorAll('.spelling-letter-box');
        boxes.forEach((box, index) => {
            box.textContent = this.currentWord.word[index].toLowerCase();
            box.classList.add('correct');
        });
        
        // 朗读单词
        this.speakWord(this.currentWord.word);
        
        setTimeout(() => {
            this.nextWord();
        }, 2000);
    }

    /**
     * 获取提示
     */
    getHint() {
        if (!this.isGameActive || this.hints <= 0 || !this.currentWord) return;
        
        this.hints--;
        const nextLetterIndex = this.playerInput.length;
        
        if (nextLetterIndex < this.currentWord.word.length) {
            const hintLetter = this.currentWord.word[nextLetterIndex];
            this.inputLetter(hintLetter);
            
            this.showFeedback(`💡 提示: 下一个字母是 "${hintLetter.toUpperCase()}"`, 'hint');
        } else {
            this.showFeedback('💡 已经没有更多提示了', 'hint');
        }
        
        this.updateStats();
        console.log(`💡 使用提示，剩余: ${this.hints}`);
    }

    /**
     * 游戏完成
     */
    gameComplete() {
        this.isGameActive = false;
        
        const accuracy = Math.round((this.correctWords / this.totalWords) * 100);
        const grade = this.getGrade(accuracy);
        
        // 显示完成弹窗
        const modal = document.createElement('div');
        modal.className = 'memory-game-complete'; // 复用样式
        modal.innerHTML = `
            <div class="memory-complete-modal">
                <div class="memory-complete-title">🏆 拼写游戏完成！</div>
                <div class="memory-complete-stats">
                    <div class="memory-complete-stat">
                        <span>📝 总单词:</span>
                        <span>${this.totalWords}</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>✅ 正确:</span>
                        <span>${this.correctWords}</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>🎯 准确率:</span>
                        <span>${accuracy}%</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>🏆 总分:</span>
                        <span>${this.score}</span>
                    </div>
                    <div class="memory-complete-stat">
                        <span>⭐ 等级:</span>
                        <span>${grade}</span>
                    </div>
                </div>
                <div class="memory-game-controls">
                    <button class="memory-control-btn" onclick="spellingGame.startGame(); this.closest('.memory-game-complete').remove();">
                        🚀 再玩一次
                    </button>
                    <button class="memory-control-btn secondary" onclick="this.closest('.memory-game-complete').remove();">
                        ✅ 完成
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // 播放完成音效
        this.playVictorySound();
        
        console.log(`🏆 游戏完成! 准确率: ${accuracy}%, 得分: ${this.score}`);
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const progressElement = document.getElementById('spelling-progress');
        const correctElement = document.getElementById('spelling-correct');
        const hintsElement = document.getElementById('spelling-hints');
        const scoreElement = document.getElementById('spelling-score');
        const progressFill = document.getElementById('spelling-progress-fill');

        if (progressElement) {
            progressElement.textContent = `${this.currentWordIndex}/${this.totalWords}`;
        }
        
        if (correctElement) {
            correctElement.textContent = this.correctWords;
        }
        
        if (hintsElement) {
            hintsElement.textContent = this.hints;
        }
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        if (progressFill) {
            const progress = (this.currentWordIndex / this.totalWords) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    /**
     * 显示反馈信息
     */
    showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedback-message');
        if (!feedbackElement) return;

        feedbackElement.textContent = message;
        feedbackElement.className = `spelling-feedback-message ${type} show`;
        
        setTimeout(() => {
            feedbackElement.classList.remove('show');
        }, 3000);
    }

    /**
     * 清除反馈信息
     */
    clearFeedback() {
        const feedbackElement = document.getElementById('feedback-message');
        if (feedbackElement) {
            feedbackElement.classList.remove('show');
        }
    }

    /**
     * 显示庆祝动画
     */
    showCelebration(emoji) {
        const celebration = document.createElement('div');
        celebration.className = 'spelling-celebration';
        celebration.textContent = emoji;
        
        this.container.appendChild(celebration);
        
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.parentNode.removeChild(celebration);
            }
        }, 2000);
    }

    /**
     * 获取成绩等级
     */
    getGrade(accuracy) {
        if (accuracy >= 90) {
            return '🏆 完美';
        } else if (accuracy >= 80) {
            return '⭐ 优秀';
        } else if (accuracy >= 70) {
            return '👍 良好';
        } else if (accuracy >= 60) {
            return '💪 及格';
        } else {
            return '📚 继续努力';
        }
    }

    /**
     * 音效播放
     */
    playSuccessSound() {
        const notes = [523, 659, 783]; // C, E, G
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 200), index * 100);
        });
    }

    playErrorSound() {
        this.playTone(220, 500);
    }

    playVictorySound() {
        const notes = [523, 659, 783, 1047]; // C, E, G, C
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 300), index * 150);
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
            utterance.rate = 0.7;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    /**
     * 销毁游戏
     */
    destroy() {
        this.resetGameState();
        
        // 移除键盘监听
        document.removeEventListener('keydown', this.handleKeyPress);
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('🗑️ SpellingGame 已销毁');
    }
}

// 创建全局实例
window.SpellingGame = SpellingGame;
window.spellingGame = new SpellingGame();

console.log('✏️ SpellingGame 模块加载完成');