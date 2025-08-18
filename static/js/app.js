class DolchApp {
    constructor() {
        this.words = [];
        this.learnedWords = new Set(JSON.parse(localStorage.getItem('learnedWords') || '[]'));
        this.currentPracticeWords = [];
        this.currentQuiz = null;
        this.quizIndex = 0;
        this.quizScore = 0;
        this.speechSupported = 'speechSynthesis' in window;
        this.audioEnabled = true;
        
        // iPad布局相关
        this.layoutManager = null;
        this.wordsPagination = null;
        this.currentLayout = 'mobile';
        
        // 响应式网格管理器
        this.gridManager = null;
        
        // 气泡单词管理器
        this.bubbleManager = null;
        this.useBubbleMode = true; // 启用气泡模式
        
        this.init();
    }

    async init() {
        try {
            console.log('Starting initialization...');
            this.showLoading(true);
            
            // 等待DOM完全加载
            await this.ensureDOMReady();
            console.log('DOM ready');
            
            // 验证必要的DOM元素存在
            if (!this.validateDOMElements()) {
                throw new Error('Required DOM elements not found');
            }
            console.log('DOM elements validated');
            
            await this.loadWords();
            console.log('Words loaded:', this.words.length);
            
            this.setupEventListeners();
            console.log('Event listeners setup');
            
            // 初始化布局管理器
            this.initLayoutManager();
            console.log('Layout manager initialized');
            
            // 初始化气泡管理器
            this.initBubbleManager();
            console.log('Bubble manager initialized');
            
            this.showLearnTab();
            this.updateProgress();
            this.showLoading(false);
            console.log('Initialization complete');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError(`加载失败: ${error.message}`);
            this.showLoading(false);
        }
    }
    
    async ensureDOMReady() {
        if (document.readyState === 'complete') {
            return;
        }
        
        return new Promise((resolve) => {
            const checkReady = () => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    setTimeout(checkReady, 10);
                }
            };
            checkReady();
        });
    }
    
    validateDOMElements() {
        const requiredIds = ['words-grid', 'progress-fill', 'progress-text', 'shuffle-btn', 'category-filter', 'audio-toggle'];
        for (const id of requiredIds) {
            if (!document.getElementById(id)) {
                console.error(`Missing required element: ${id}`);
                return false;
            }
        }
        return true;
    }

    async loadWords() {
        try {
            console.log('Fetching words from API...');
            const response = await fetch('/api/words');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Raw API response:', data);
            
            if (!this.validateWordsData(data)) {
                throw new Error('Invalid words data format');
            }
            
            this.words = data;
            console.log('Words validation passed. Loaded words:', this.words.length);
            
            // 验证每个单词对象
            const validWords = this.words.filter(word => this.isValidWord(word));
            if (validWords.length !== this.words.length) {
                console.warn(`Filtered out ${this.words.length - validWords.length} invalid words`);
                this.words = validWords;
            }
            
        } catch (error) {
            console.error('Error loading words:', error);
            // 提供fallback数据
            this.words = this.getFallbackWords();
            throw error;
        }
    }
    
    validateWordsData(data) {
        if (!Array.isArray(data)) {
            console.error('Words data is not an array:', typeof data);
            return false;
        }
        
        if (data.length === 0) {
            console.error('Words data is empty');
            return false;
        }
        
        console.log('Words data validation passed');
        return true;
    }
    
    isValidWord(word) {
        if (!word || typeof word !== 'object') {
            console.warn('Invalid word object:', word);
            return false;
        }
        
        if (!word.word || typeof word.word !== 'string' || word.word.trim() === '') {
            console.warn('Invalid word text:', word);
            return false;
        }
        
        if (!word.category || typeof word.category !== 'string') {
            console.warn('Invalid word category:', word);
            return false;
        }
        
        return true;
    }
    
    getFallbackWords() {
        console.log('Using fallback words data');
        return [
            { word: 'a', category: 'article', pronunciation: '/eɪ/', example: 'I have a cat.' },
            { word: 'and', category: 'conjunction', pronunciation: '/ænd/', example: 'Red and blue' },
            { word: 'the', category: 'article', pronunciation: '/ðə/', example: 'The cat' },
            { word: 'is', category: 'verb', pronunciation: '/ɪz/', example: 'This is big' },
            { word: 'it', category: 'pronoun', pronunciation: '/ɪt/', example: 'It is red' }
        ];
    }

    setupEventListeners() {
        // 儿童友好的标签切换
        document.querySelectorAll('.tab-btn-kids').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab || e.target.closest('.tab-btn-kids').dataset.tab;
                this.switchTab(tab);
            });
        });

        // 学习控制按钮
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.shuffleWords();
            this.showSuccess('🎲 单词顺序打乱了！');
        });
        document.getElementById('category-filter').addEventListener('click', () => this.showCategoryFilter());
        document.getElementById('audio-toggle').addEventListener('click', () => this.toggleAudio());

        // 练习模式按钮
        document.querySelectorAll('.mode-btn-kids').forEach(btn => {
            btn.addEventListener('click', (e) => this.startPractice(e.target.dataset.mode));
        });

        // 测验选择
        document.querySelectorAll('.quiz-difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectQuizDifficulty(e.target.closest('.quiz-difficulty')));
        });
        
        document.getElementById('start-quiz').addEventListener('click', () => this.startQuiz());
        document.getElementById('next-question').addEventListener('click', () => this.nextQuestion());

        // 儿童友好的弹窗
        document.querySelector('.close-kids').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-speak').addEventListener('click', () => this.speakModalWord());
        document.getElementById('modal-practice').addEventListener('click', () => this.practiceModalWord());

        // 点击弹窗外部关闭
        document.getElementById('word-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('word-modal')) {
                this.closeModal();
            }
        });
    }
    
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--success-color), var(--secondary-color));
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: 700;
            z-index: 1500;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(149, 225, 211, 0.4);
        `;
        
        document.body.appendChild(successDiv);
        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => document.body.removeChild(successDiv), 300);
        }, 2000);
    }
    
    selectQuizDifficulty(btn) {
        document.querySelectorAll('.quiz-difficulty').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }

    switchTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn-kids').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 显示对应内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // 根据标签执行相应操作
        switch(tabName) {
            case 'learn':
                this.showLearnTab();
                break;
            case 'practice':
                this.showPracticeTab();
                break;
            case 'quiz':
                this.showQuizTab();
                break;
            case 'stats':
                this.showStatsTab();
                break;
        }
    }

    showLearnTab() {
        this.renderWordsGrid();
    }

    renderWordsGrid(wordsToShow = null) {
        const words = wordsToShow || this.words;
        const grid = document.getElementById('words-grid');
        
        console.log('Rendering words:', words ? words.length : 'null', words && words[0] ? words[0] : 'no first word');
        
        // 检查grid元素是否存在
        if (!grid) {
            console.error('Grid element not found!');
            return;
        }
        
        if (!words || !Array.isArray(words) || words.length === 0) {
            grid.innerHTML = '<div class="error-message">暂无词汇数据</div>';
            return;
        }
        
        // 如果启用气泡模式，使用气泡渲染
        if (this.useBubbleMode && this.bubbleManager) {
            this.bubbleManager.createBubbleGrid(words, grid);
            return;
        }
        
        // 清空现有内容
        grid.innerHTML = '';
        
        // 使用document fragment提高性能
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            
            if (!word || !word.word || typeof word.word !== 'string') {
                console.error('Invalid word object at index', i, ':', word);
                continue;
            }
            
            // 创建card元素
            const cardDiv = document.createElement('div');
            cardDiv.className = 'word-card';
            
            // 检查是否已学习
            if (this.learnedWords.has(word.word)) {
                cardDiv.classList.add('learned');
            }
            
            // 设置数据属性
            cardDiv.setAttribute('data-word', word.word);
            
            // 创建word-text元素
            const textDiv = document.createElement('div');
            textDiv.className = 'word-text';
            textDiv.textContent = word.word;
            
            // 创建category元素
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'word-category';
            categoryDiv.textContent = word.category || 'unknown';
            
            // 组装元素
            cardDiv.appendChild(textDiv);
            cardDiv.appendChild(categoryDiv);
            fragment.appendChild(cardDiv);
        }
        
        // 添加到DOM
        grid.appendChild(fragment);

        // 添加点击事件
        grid.querySelectorAll('.word-card').forEach(card => {
            card.addEventListener('click', () => this.showWordModal(card.dataset.word));
        });

        // 添加动画效果
        grid.querySelectorAll('.word-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('bounce-in');
            }, index * 50);
        });
        
        // 触发响应式文字调整
        if (window.textManager) {
            setTimeout(() => {
                window.textManager.refresh();
            }, 100); // 稍作延迟确保DOM渲染完成
        }
    }

    shuffleWords() {
        const shuffled = [...this.words].sort(() => Math.random() - 0.5);
        this.renderWordsGrid(shuffled);
    }

    showCategoryFilter() {
        const categories = [...new Set(this.words.map(w => w.category))];
        const categoryMenu = document.createElement('div');
        categoryMenu.className = 'category-menu';
        categoryMenu.innerHTML = `
            <div class="category-options">
                <button class="category-option" data-category="all">全部</button>
                ${categories.map(cat => `
                    <button class="category-option" data-category="${cat}">${cat}</button>
                `).join('')}
            </div>
        `;

        document.body.appendChild(categoryMenu);

        categoryMenu.querySelectorAll('.category-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const filteredWords = category === 'all' ? 
                    this.words : 
                    this.words.filter(w => w.category === category);
                this.renderWordsGrid(filteredWords);
                document.body.removeChild(categoryMenu);
            });
        });

        // 点击外部关闭
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!categoryMenu.contains(e.target)) {
                    document.body.removeChild(categoryMenu);
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 100);
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        const btn = document.getElementById('audio-toggle');
        const icon = btn.querySelector('i');
        
        if (this.audioEnabled) {
            icon.className = 'fas fa-volume-up';
            btn.style.background = 'var(--secondary-color)';
            btn.style.color = 'white';
        } else {
            icon.className = 'fas fa-volume-mute';
            btn.style.background = 'var(--card-bg)';
            btn.style.color = 'var(--primary-color)';
        }
    }

    showWordModal(wordText) {
        const word = this.words.find(w => w.word === wordText);
        if (!word) return;

        document.getElementById('modal-word').textContent = word.word;
        document.getElementById('modal-pronunciation').textContent = word.pronunciation;
        document.getElementById('modal-category').textContent = word.category;
        document.getElementById('modal-example').textContent = `例句: ${word.example}`;

        document.getElementById('word-modal').style.display = 'block';
        
        // 自动发音
        if (this.audioEnabled) {
            setTimeout(() => this.speak(word.word), 300);
        }

        // 标记为已学习
        if (!this.learnedWords.has(word.word)) {
            this.learnedWords.add(word.word);
            this.saveProgress();
            this.updateProgress();
            this.updateWordCardAppearance(word.word);
        }
    }

    closeModal() {
        document.getElementById('word-modal').style.display = 'none';
    }

    speakModalWord() {
        const word = document.getElementById('modal-word').textContent;
        this.speak(word);
    }

    practiceModalWord() {
        const word = document.getElementById('modal-word').textContent;
        this.closeModal();
        this.switchTab('practice');
        this.startPractice('flashcard', [word]);
    }

    speak(text) {
        if (!this.speechSupported || !this.audioEnabled) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.7;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        
        // 尝试使用英语语音
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Female')
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        speechSynthesis.speak(utterance);
    }

    updateProgress() {
        const total = this.words.length;
        const learned = this.learnedWords.size;
        const percentage = (learned / total) * 100;

        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `${learned}/${total}`;
    }

    updateWordCardAppearance(wordText) {
        const card = document.querySelector(`[data-word="${wordText}"]`);
        if (card) {
            card.classList.add('learned');
            card.classList.add('pulse');
            setTimeout(() => card.classList.remove('pulse'), 1000);
        }
    }

    saveProgress() {
        localStorage.setItem('learnedWords', JSON.stringify([...this.learnedWords]));
    }

    // 练习模式
    showPracticeTab() {
        document.getElementById('practice-area').innerHTML = `
            <div class="practice-placeholder-kids">
                <div class="placeholder-emoji">🐰</div>
                <h3>选择你喜欢的游戏</h3>
                <p>点击上面的翻卡片开始玩吧！</p>
            </div>
        `;
    }

    async startPractice(mode, specificWords = null) {
        this.showLoading(true);
        
        try {
            const practiceWords = specificWords || await this.getRandomWords(8); // 减少到8个词，适合小朋友
            this.currentPracticeWords = practiceWords;

            switch(mode) {
                case 'flashcard':
                    this.startFlashcardPractice();
                    break;
                default:
                    console.log('Practice mode not supported:', mode);
                    break;
            }
        } catch (error) {
            console.error('启动练习失败:', error);
            this.showError('游戏启动失败，请重试');
        }
        
        this.showLoading(false);
    }

    async getRandomWords(count) {
        const response = await fetch(`/api/words/random?count=${count}`);
        return await response.json();
    }

    startFlashcardPractice() {
        let currentIndex = 0;
        const words = this.currentPracticeWords;
        
        const renderFlashcard = () => {
            const word = words[currentIndex];
            document.getElementById('practice-area').innerHTML = `
                <div class="flashcard-container-kids">
                    <div class="flashcard-progress">
                        <span class="progress-emoji">🌟</span>
                        <span class="card-counter-kids">${currentIndex + 1} / ${words.length}</span>
                    </div>
                    
                    <div class="flashcard-kids" id="flashcard">
                        <div class="flashcard-front-kids">
                            <div class="card-decoration">✨</div>
                            <h2 class="flashcard-word">${word.word}</h2>
                            <p class="flip-hint">点击卡片翻个面！</p>
                            <div class="tap-icon">👆</div>
                        </div>
                        <div class="flashcard-back-kids">
                            <div class="card-decoration">🎈</div>
                            <h3 class="flashcard-word-back">${word.word}</h3>
                            <p class="pronunciation-kids">${word.pronunciation}</p>
                            <p class="example-kids">"${word.example}"</p>
                            <button class="speak-btn-flashcard" onclick="app.speak('${word.word}')">
                                <span class="btn-emoji">🔊</span> 听发音
                            </button>
                        </div>
                    </div>
                    
                    <div class="flashcard-controls-kids">
                        <button id="prev-card" class="nav-btn-kids ${currentIndex === 0 ? 'disabled' : ''}">
                            <span class="btn-emoji">⬅️</span>
                            <span>上一个</span>
                        </button>
                        
                        <button class="shuffle-cards-btn" onclick="app.speak('${word.word}')">
                            <span class="btn-emoji">🔊</span>
                            <span>再听一遍</span>
                        </button>
                        
                        <button id="next-card" class="nav-btn-kids ${currentIndex === words.length - 1 ? 'disabled' : ''}">
                            <span class="btn-emoji">➡️</span>
                            <span>下一个</span>
                        </button>
                    </div>
                </div>
            `;

            // 添加翻转功能
            document.getElementById('flashcard').addEventListener('click', function() {
                this.classList.toggle('flipped');
            });

            // 控制按钮
            document.getElementById('prev-card').addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    renderFlashcard();
                }
            });

            document.getElementById('next-card').addEventListener('click', () => {
                if (currentIndex < words.length - 1) {
                    currentIndex++;
                    renderFlashcard();
                }
            });
        };

        renderFlashcard();
        
        // 自动播放第一个单词的发音
        setTimeout(() => {
            this.speak(words[0].word);
        }, 500);
    }

    // 已删除记忆游戏和拼写练习 - 专为5岁儿童简化

    // 测验模式
    showQuizTab() {
        document.getElementById('quiz-area').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';
    }

    async startQuiz() {
        this.showLoading(true);
        
        try {
            // 获取选中的难度
            const selectedDifficulty = document.querySelector('.quiz-difficulty.selected');
            const count = selectedDifficulty ? selectedDifficulty.dataset.count : 8;
            
            const response = await fetch(`/api/quiz?count=${count}`);
            this.currentQuiz = await response.json();
            this.quizIndex = 0;
            this.quizScore = 0;

            document.getElementById('quiz-area').style.display = 'block';
            document.getElementById('quiz-results').style.display = 'none';
            
            this.showQuizQuestion();
            this.showSuccess('🦁 测验开始！加油哦！');
        } catch (error) {
            console.error('开始测验失败:', error);
            this.showError('测验启动失败，请重试');
        }

        this.showLoading(false);
    }

    showQuizQuestion() {
        const question = this.currentQuiz[this.quizIndex];
        
        document.getElementById('question-counter').textContent = 
            `${this.quizIndex + 1}/${this.currentQuiz.length}`;
        document.getElementById('quiz-score').textContent = `得分: ${this.quizScore}`;

        document.getElementById('question-card').innerHTML = `
            <div class="question-text">${question.question}</div>
            <div class="options-grid">
                ${question.options.map(option => `
                    <button class="option-btn" data-option="${option}">
                        ${option}
                    </button>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectQuizOption(e.target, question));
        });

        document.getElementById('next-question').disabled = true;
    }

    selectQuizOption(button, question) {
        const selectedOption = button.dataset.option;
        const isCorrect = selectedOption === question.correct_answer;

        // 禁用所有选项
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.option === question.correct_answer) {
                btn.classList.add('correct');
            } else if (btn === button && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.quizScore++;
            document.getElementById('quiz-score').textContent = `得分: ${this.quizScore}`;
            this.speak(question.correct_answer);
        }

        document.getElementById('next-question').disabled = false;
    }

    nextQuestion() {
        this.quizIndex++;
        
        if (this.quizIndex < this.currentQuiz.length) {
            this.showQuizQuestion();
        } else {
            this.showQuizResults();
        }
    }

    showQuizResults() {
        const totalQuestions = this.currentQuiz.length;
        const percentage = Math.round((this.quizScore / totalQuestions) * 100);
        
        let grade, message;
        if (percentage >= 90) {
            grade = 'A+';
            message = '太棒了！你已经完全掌握了这些单词！';
        } else if (percentage >= 80) {
            grade = 'A';
            message = '很好！继续保持！';
        } else if (percentage >= 70) {
            grade = 'B';
            message = '不错！还有提升空间。';
        } else {
            grade = 'C';
            message = '需要更多练习哦！';
        }

        document.getElementById('quiz-area').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';
        document.getElementById('quiz-results').innerHTML = `
            <div class="results-container">
                <h2>测验完成！</h2>
                <div class="grade-display">
                    <div class="grade">${grade}</div>
                    <div class="percentage">${percentage}%</div>
                </div>
                <div class="score-details">
                    <p>正确答案: ${this.quizScore} / ${totalQuestions}</p>
                    <p>${message}</p>
                </div>
                <div class="results-actions">
                    <button onclick="location.reload()">重新测验</button>
                    <button onclick="app.switchTab('learn')">继续学习</button>
                </div>
            </div>
        `;
    }

    // 统计模式
    async showStatsTab() {
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            this.renderStats(stats);
        } catch (error) {
            console.error('加载统计失败:', error);
            this.showError('统计加载失败');
        }
        
        this.showLoading(false);
    }

    renderStats(stats) {
        const learnedCount = this.learnedWords.size;
        const learnedPercentage = Math.round((learnedCount / stats.total_words) * 100);

        document.getElementById('word-stats').innerHTML = `
            <div class="stat-item">
                <span class="stat-label">总单词数</span>
                <span class="stat-value">${stats.total_words}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">已学习</span>
                <span class="stat-value">${learnedCount} (${learnedPercentage}%)</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">动词</span>
                <span class="stat-value">${stats.categories.verbs}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">形容词</span>
                <span class="stat-value">${stats.categories.adjectives}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">代词</span>
                <span class="stat-value">${stats.categories.pronouns}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">介词</span>
                <span class="stat-value">${stats.categories.prepositions}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">其他</span>
                <span class="stat-value">${stats.categories.others}</span>
            </div>
        `;

        const achievements = this.getAchievements(learnedCount, stats.total_words);
        document.getElementById('achievements').innerHTML = achievements.map(achievement => `
            <div class="achievement ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <i class="fas ${achievement.icon}"></i>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `).join('');
    }

    getAchievements(learned, total) {
        return [
            {
                title: '初学者',
                description: '学习了第一个单词',
                icon: 'fa-star',
                unlocked: learned >= 1
            },
            {
                title: '学习能手',
                description: '学习了10个单词',
                icon: 'fa-medal',
                unlocked: learned >= 10
            },
            {
                title: '词汇达人',
                description: '学习了20个单词',
                icon: 'fa-trophy',
                unlocked: learned >= 20
            },
            {
                title: '完美主义者',
                description: '学完所有单词',
                icon: 'fa-crown',
                unlocked: learned === total
            }
        ];
    }

    // 工具方法
    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        alert(`错误: ${message}`);
    }

    // iPad布局管理方法
    initLayoutManager() {
        if (window.ResponsiveLayoutManager) {
            this.layoutManager = new window.ResponsiveLayoutManager();
            this.currentLayout = this.layoutManager.getCurrentLayoutType();
            
            // 设置布局变化回调
            this.onLayoutChange = this.handleLayoutChange.bind(this);
        }
        
        // 从布局管理器获取网格管理器引用
        if (this.layoutManager && this.layoutManager.gridManager) {
            this.gridManager = this.layoutManager.gridManager;
            
            // 设置网格变化回调
            this.onGridChange = this.handleGridChange.bind(this);
            
            console.log('Grid manager integrated into app');
        }
    }
    
    // 处理网格变化
    handleGridChange(gridInfo) {
        console.log('Grid changed:', gridInfo);
        
        // 如果有分页控制器，更新每页物品数量
        if (this.wordsPagination) {
            this.wordsPagination.updateItemsPerPage(gridInfo.itemsPerPage);
        }
        
        // 如果当前在学习标签页，重新渲染单词网格
        const learnTab = document.getElementById('learn');
        if (learnTab && learnTab.classList.contains('active')) {
            this.showLearnTab();
        }
    }

    handleLayoutChange(newLayoutType) {
        console.log('Layout changed to:', newLayoutType);
        this.currentLayout = newLayoutType;
        
        if (newLayoutType === 'ipad-landscape') {
            this.initIPadLandscapeMode();
        } else {
            this.cleanupIPadMode();
        }
    }

    initIPadLandscapeMode() {
        console.log('Initializing iPad landscape mode');
        
        // 初始化分页控制器
        if (this.words.length > 0) {
            this.wordsPagination = new window.PaginationController(this.words, 6);
            this.wordsPagination.onPageChange = this.handleWordsPageChange.bind(this);
        }
        
        // 重新渲染单词网格使用分页
        this.renderWordsGridIPad();
    }

    cleanupIPadMode() {
        console.log('Cleaning up iPad mode');
        
        if (this.wordsPagination) {
            this.wordsPagination = null;
        }
        
        // 恢复原有的单词网格渲染
        this.renderWordsGrid();
    }

    handleWordsPageChange(items, currentPage, totalPages) {
        console.log(`Page changed: ${currentPage + 1}/${totalPages}`);
        this.renderWordsGridIPad(items);
        this.updatePaginationControls(currentPage, totalPages);
    }

    renderWordsGridIPad(wordsToShow = null) {
        if (this.currentLayout !== 'ipad-landscape') {
            return this.renderWordsGrid(wordsToShow);
        }

        const words = wordsToShow || (this.wordsPagination ? this.wordsPagination.getCurrentPageItems() : this.words);
        const grid = document.getElementById('words-grid');
        
        if (!grid || !words || !Array.isArray(words)) {
            return;
        }
        
        // 使用响应式网格类名
        grid.className = 'words-grid-ipad responsive-grid responsive-content';
        grid.innerHTML = '';
        
        // 创建单词卡片
        const fragment = document.createDocumentFragment();
        
        words.forEach(word => {
            if (!word || !word.word) return;
            
            const cardDiv = document.createElement('div');
            cardDiv.className = 'word-card-ipad responsive-card';
            
            if (this.learnedWords.has(word.word)) {
                cardDiv.classList.add('learned');
            }
            
            cardDiv.setAttribute('data-word', word.word);
            
            cardDiv.innerHTML = `
                <div class="word-text-ipad responsive-word-text">${word.word}</div>
                <div class="word-category-ipad responsive-category">${word.category || 'unknown'}</div>
            `;
            
            fragment.appendChild(cardDiv);
        });
        
        grid.appendChild(fragment);
        
        // 添加点击事件
        grid.querySelectorAll('.word-card-ipad').forEach(card => {
            card.addEventListener('click', () => this.showWordModal(card.dataset.word));
        });
        
        // 添加分页控制器
        this.addPaginationControls();
        
        // 动画效果
        grid.querySelectorAll('.word-card-ipad').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('bounce-in');
            }, index * 50);
        });
        
        // 触发响应式文字调整
        if (window.textManager) {
            setTimeout(() => {
                window.textManager.refresh();
            }, 100); // 稍作延迟确保DOM渲染完成
        }
    }

    addPaginationControls() {
        if (!this.wordsPagination || this.currentLayout !== 'ipad-landscape') {
            return;
        }

        // 检查是否已存在分页控制器
        let paginationContainer = document.querySelector('.pagination-controls');
        
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-controls';
            
            const contentArea = document.querySelector('.content-area-ipad');
            if (contentArea) {
                contentArea.appendChild(paginationContainer);
            }
        }

        const totalPages = this.wordsPagination.getTotalPages();
        const currentPage = this.wordsPagination.getCurrentPageIndex();
        
        paginationContainer.innerHTML = `
            <button class="pagination-btn" id="prev-page" ${currentPage === 0 ? 'disabled' : ''}>
                ◀
            </button>
            <div class="pagination-dots">
                ${Array.from({length: totalPages}, (_, i) => 
                    `<div class="pagination-dot ${i === currentPage ? 'active' : ''}" data-page="${i}"></div>`
                ).join('')}
            </div>
            <button class="pagination-btn" id="next-page" ${currentPage === totalPages - 1 ? 'disabled' : ''}>
                ▶
            </button>
        `;

        // 添加事件监听器
        document.getElementById('prev-page')?.addEventListener('click', () => {
            this.wordsPagination.prevPage();
        });
        
        document.getElementById('next-page')?.addEventListener('click', () => {
            this.wordsPagination.nextPage();
        });
        
        document.querySelectorAll('.pagination-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const pageIndex = parseInt(e.target.dataset.page);
                this.wordsPagination.goToPage(pageIndex);
            });
        });
    }

    updatePaginationControls(currentPage, totalPages) {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const dots = document.querySelectorAll('.pagination-dot');
        
        if (prevBtn) {
            prevBtn.disabled = currentPage === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentPage === totalPages - 1;
        }
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });
    }

    // 重写shuffleWords方法支持iPad分页
    shuffleWords() {
        const shuffled = [...this.words].sort(() => Math.random() - 0.5);
        
        if (this.currentLayout === 'ipad-landscape' && this.wordsPagination) {
            this.wordsPagination.updateItems(shuffled);
        } else {
            this.renderWordsGrid(shuffled);
        }
    }

    // 重写renderWordsGrid方法检查布局
    renderWordsGrid(wordsToShow = null) {
        if (this.currentLayout === 'ipad-landscape') {
            return this.renderWordsGridIPad(wordsToShow);
        }

        // 保持原有逻辑
        const words = wordsToShow || this.words;
        const grid = document.getElementById('words-grid');
        
        console.log('Rendering words:', words ? words.length : 'null', words && words[0] ? words[0] : 'no first word');
        
        if (!grid) {
            console.error('Grid element not found!');
            return;
        }
        
        if (!words || !Array.isArray(words) || words.length === 0) {
            grid.innerHTML = '<div class="error-message">暂无词汇数据</div>';
            return;
        }
        
        // 恢复原有网格类名
        grid.className = 'words-grid-kids';
        grid.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            
            if (!word || !word.word || typeof word.word !== 'string') {
                console.error('Invalid word object at index', i, ':', word);
                continue;
            }
            
            const cardDiv = document.createElement('div');
            cardDiv.className = 'word-card';
            
            if (this.learnedWords.has(word.word)) {
                cardDiv.classList.add('learned');
            }
            
            cardDiv.setAttribute('data-word', word.word);
            
            const textDiv = document.createElement('div');
            textDiv.className = 'word-text';
            textDiv.textContent = word.word;
            
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'word-category';
            categoryDiv.textContent = word.category || 'unknown';
            
            cardDiv.appendChild(textDiv);
            cardDiv.appendChild(categoryDiv);
            fragment.appendChild(cardDiv);
        }
        
        grid.appendChild(fragment);

        grid.querySelectorAll('.word-card').forEach(card => {
            card.addEventListener('click', () => this.showWordModal(card.dataset.word));
        });

        grid.querySelectorAll('.word-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('bounce-in');
            }, index * 50);
        });
    }
}

// 添加CSS样式用于练习模式
const additionalStyles = `
<style>
.flashcard-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
}

.flashcard {
    width: 300px;
    height: 200px;
    position: relative;
    cursor: pointer;
    perspective: 1000px;
}

.flashcard-front, .flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--card-bg);
    border: 2px solid var(--primary-color);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
    backface-visibility: hidden;
    transition: transform 0.6s;
}

.flashcard-back {
    transform: rotateY(180deg);
    background: var(--primary-color);
    color: white;
}

.flashcard.flipped .flashcard-front {
    transform: rotateY(-180deg);
}

.flashcard.flipped .flashcard-back {
    transform: rotateY(0);
}

.flashcard-controls {
    display: flex;
    align-items: center;
    gap: 20px;
}

.memory-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    max-width: 400px;
    margin: 20px auto;
}

.memory-card {
    width: 80px;
    height: 80px;
    position: relative;
    cursor: pointer;
    perspective: 1000px;
}

.card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    backface-visibility: hidden;
    transition: transform 0.3s;
}

.card-back {
    transform: rotateY(180deg);
    background: var(--primary-color);
    color: white;
    font-size: 0.8rem;
}

.memory-card.flipped .card-front {
    transform: rotateY(-180deg);
}

.memory-card.flipped .card-back {
    transform: rotateY(0);
}

.memory-card.matched {
    opacity: 0.6;
    pointer-events: none;
}

.memory-card.matched .card-front,
.memory-card.matched .card-back {
    background: var(--secondary-color);
    color: white;
}

.typing-input {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
}

.typing-input input {
    padding: 12px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1.1rem;
    min-width: 200px;
}

.typing-input input:focus {
    border-color: var(--primary-color);
    outline: none;
}

.result {
    padding: 15px;
    border-radius: 8px;
    margin: 15px 0;
    font-weight: bold;
}

.result.correct {
    background: var(--secondary-color);
    color: white;
}

.result.incorrect {
    background: var(--danger-color);
    color: white;
}

.result.skipped {
    background: var(--accent-color);
    color: white;
}

.category-menu {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--card-bg);
    padding: 20px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    z-index: 1000;
}

.category-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.category-option {
    padding: 10px 20px;
    border: 1px solid var(--border-color);
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: var(--transition);
}

.category-option:hover {
    background: var(--primary-color);
    color: white;
}

.results-container {
    text-align: center;
    padding: 40px;
}

.grade-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin: 30px 0;
}

.grade {
    font-size: 4rem;
    font-weight: bold;
    color: var(--secondary-color);
}

.percentage {
    font-size: 2rem;
    color: var(--primary-color);
}

.achievement {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    margin: 10px 0;
    border-radius: 8px;
    border: 2px solid var(--border-color);
}

.achievement.unlocked {
    background: linear-gradient(135deg, var(--secondary-color)10, transparent);
    border-color: var(--secondary-color);
}

.achievement.locked {
    opacity: 0.5;
    filter: grayscale(1);
}

.achievement i {
    font-size: 2rem;
    color: var(--accent-color);
}

.achievement.unlocked i {
    color: var(--secondary-color);
}
</style>
`;

}

// 气泡管理器初始化方法 (临时放在类外部，稍后修复)
DolchApp.prototype.initBubbleManager = function() {
    if (typeof BubbleWordsManager !== 'undefined') {
        this.bubbleManager = new BubbleWordsManager();
        
        // 监听单词揭示事件
        document.addEventListener('wordRevealed', (event) => {
            const wordData = event.detail.wordData;
            this.learnedWords.add(wordData.word);
            localStorage.setItem('learnedWords', JSON.stringify([...this.learnedWords]));
            this.updateProgress();
        });
        
        console.log('✅ 气泡管理器初始化完成');
    } else {
        console.warn('⚠️ BubbleWordsManager 未找到，使用传统模式');
        this.useBubbleMode = false;
    }
};

document.head.insertAdjacentHTML('beforeend', additionalStyles);

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    window.app = new DolchApp();
});