/**
 * Dolch等级选择器
 * 用于选择不同的sight word等级
 */

class LevelSelector {
    constructor() {
        this.levels = [];
        this.selectedLevel = 'pre_primer'; // 默认选择
        this.onLevelChange = null; // 回调函数
        this.isLoading = false;
        
        // 等级配置
        this.levelConfig = {
            'pre_primer': {
                emoji: '🌟',
                difficulty: 1,
                theme: 'green'
            },
            'primer': {
                emoji: '🎈',
                difficulty: 2,
                theme: 'blue'
            },
            'first_grade': {
                emoji: '🚀',
                difficulty: 3,
                theme: 'orange'
            },
            'second_grade': {
                emoji: '🏆',
                difficulty: 4,
                theme: 'purple'
            }
        };
        
        console.log('🎯 LevelSelector 初始化完成');
    }

    /**
     * 初始化等级选择器
     */
    async init(container, onLevelChangeCallback = null) {
        if (!container) {
            console.error('❌ 容器元素未找到');
            return;
        }

        this.container = container;
        this.onLevelChange = onLevelChangeCallback;

        try {
            await this.loadLevels();
            this.render();
            console.log('✅ 等级选择器初始化成功');
        } catch (error) {
            console.error('❌ 等级选择器初始化失败:', error);
            this.renderError();
        }
    }

    /**
     * 从API加载等级数据
     */
    async loadLevels() {
        this.isLoading = true;
        this.renderLoading();

        try {
            console.log('📡 加载等级数据...');
            const response = await fetch('/api/levels');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.levels = await response.json();
            console.log('✅ 等级数据加载成功:', this.levels);
            
        } catch (error) {
            console.error('❌ 加载等级数据失败:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 渲染等级选择器
     */
    render() {
        if (this.isLoading) {
            this.renderLoading();
            return;
        }

        const html = `
            <div class="level-selector-container">
                <div class="level-selector-header">
                    <h2 class="level-selector-title">🎓 选择学习等级</h2>
                    <p class="level-selector-subtitle">选择适合年龄的Dolch sight words等级</p>
                </div>
                
                <div class="level-cards-grid">
                    ${this.levels.map((level, index) => this.renderLevelCard(level, index)).join('')}
                </div>
                
                <div class="level-select-actions">
                    <button class="select-level-btn" onclick="levelSelector.confirmSelection()">
                        🚀 开始学习选定等级
                    </button>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // 添加动画效果
        setTimeout(() => {
            const cards = this.container.querySelectorAll('.level-card');
            cards.forEach(card => {
                card.classList.add('animate-in');
            });
        }, 100);
    }

    /**
     * 渲染单个等级卡片
     */
    renderLevelCard(level, index) {
        const config = this.levelConfig[level.key] || { emoji: '📚', difficulty: 1 };
        const isSelected = level.key === this.selectedLevel;

        return `
            <div class="level-card ${isSelected ? 'selected' : ''}" 
                 data-level="${level.key}" 
                 data-difficulty="${config.difficulty}"
                 onclick="levelSelector.selectLevel('${level.key}')">
                
                <div class="level-card-header">
                    <div>
                        <h3 class="level-title">${level.level}</h3>
                        <span class="level-age-range">${level.age_range}</span>
                    </div>
                    <div class="level-emoji">${config.emoji}</div>
                </div>
                
                <div class="level-description">
                    ${level.description}
                </div>
                
                <div class="level-stats">
                    <div class="level-word-count">
                        📝 ${level.word_count} 个单词
                    </div>
                    <div class="level-difficulty">
                        ${Array.from({length: 4}, (_, i) => 
                            `<div class="difficulty-dot"></div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染加载状态
     */
    renderLoading() {
        this.container.innerHTML = `
            <div class="level-selector-container">
                <div class="level-selector-loading">
                    <div class="level-loading-spinner"></div>
                    <div class="level-loading-text">正在加载等级数据...</div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染错误状态
     */
    renderError() {
        this.container.innerHTML = `
            <div class="level-selector-container">
                <div class="level-selector-loading">
                    <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
                    <div class="level-loading-text" style="color: #ea4335;">
                        加载失败，请刷新页面重试
                    </div>
                    <button onclick="location.reload()" 
                            style="margin-top: 15px; padding: 10px 20px; 
                                   background: #4285f4; color: white; 
                                   border: none; border-radius: 8px; cursor: pointer;">
                        🔄 刷新页面
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 选择等级
     */
    selectLevel(levelKey) {
        console.log(`🎯 选择等级: ${levelKey}`);
        
        // 更新选中状态
        const previousCard = this.container.querySelector('.level-card.selected');
        if (previousCard) {
            previousCard.classList.remove('selected');
        }
        
        const newCard = this.container.querySelector(`[data-level="${levelKey}"]`);
        if (newCard) {
            newCard.classList.add('selected');
        }
        
        // 更新内部状态
        this.selectedLevel = levelKey;
        
        // 更新按钮文本
        const button = this.container.querySelector('.select-level-btn');
        const selectedLevelData = this.levels.find(l => l.key === levelKey);
        if (button && selectedLevelData) {
            button.textContent = `🚀 开始学习 ${selectedLevelData.level} (${selectedLevelData.word_count}个单词)`;
        }
    }

    /**
     * 确认选择并开始学习
     */
    async confirmSelection() {
        const selectedLevelData = this.levels.find(l => l.key === this.selectedLevel);
        
        if (!selectedLevelData) {
            console.error('❌ 未找到选中的等级数据');
            return;
        }
        
        console.log(`✅ 确认选择等级: ${selectedLevelData.level}`);
        
        // 加载该等级的单词数据
        try {
            const response = await fetch(`/api/words/${this.selectedLevel}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // 调用回调函数，传递等级数据
            if (this.onLevelChange) {
                this.onLevelChange({
                    level: this.selectedLevel,
                    levelInfo: data.level_info,
                    words: data.words
                });
            }
            
        } catch (error) {
            console.error('❌ 加载等级单词数据失败:', error);
            alert('加载失败，请重试');
        }
    }

    /**
     * 获取当前选中的等级
     */
    getSelectedLevel() {
        return this.selectedLevel;
    }

    /**
     * 设置选中的等级（程序化设置）
     */
    setSelectedLevel(levelKey) {
        if (this.levels.some(l => l.key === levelKey)) {
            this.selectLevel(levelKey);
        }
    }

    /**
     * 获取等级统计信息
     */
    getLevelStats() {
        return this.levels.map(level => ({
            key: level.key,
            name: level.level,
            wordCount: level.word_count,
            ageRange: level.age_range
        }));
    }

    /**
     * 销毁选择器
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.levels = [];
        this.selectedLevel = 'pre_primer';
        this.onLevelChange = null;
        console.log('🗑️ LevelSelector 已销毁');
    }
}

// 创建全局实例
window.LevelSelector = LevelSelector;
window.levelSelector = new LevelSelector();

console.log('📚 LevelSelector 模块加载完成');