/**
 * 动态响应式文字系统
 * 确保文字在所有分辨率和容器大小下都能完整显示
 */

class ResponsiveTextManager {
    constructor() {
        this.initialized = false;
        this.observer = null;
        this.debounceTimer = null;
        
        // 配置参数
        this.config = {
            minFontSize: 12,           // 最小字体大小 (px)
            maxFontSize: 36,           // 最大字体大小 (px)
            containerRatio: 0.12,      // 字体大小 = 容器宽度 * 12%
            longWordThreshold: 8,      // 长单词阈值
            veryLongWordThreshold: 12, // 超长单词阈值
            resizeDebounce: 100,       // 调整大小防抖间隔 (ms)
            
            // 不同屏幕尺寸的基准比例
            screenRatios: {
                small: { max: 480, ratio: 0.15 },    // 小屏幕用更大比例
                medium: { max: 768, ratio: 0.13 },   // 中等屏幕
                large: { max: 1024, ratio: 0.12 },   // 大屏幕
                xlarge: { max: Infinity, ratio: 0.10 } // 超大屏幕用较小比例
            }
        };
    }

    /**
     * 初始化响应式文字系统
     */
    init() {
        if (this.initialized) return;
        
        console.log('🔤 Initializing Responsive Text Manager...');
        
        // 等待DOM准备
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        this.initialized = true;
    }

    /**
     * 设置系统
     */
    setup() {
        // 初始调整所有文字
        this.adjustAllText();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.debouncedAdjust());
        
        // 监听方向变化 (移动设备)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.adjustAllText(), 300); // 方向变化后稍作延迟
        });
        
        // 使用 Intersection Observer 监听元素可见性变化
        this.setupIntersectionObserver();
        
        // 使用 ResizeObserver 监听容器大小变化 (现代浏览器)
        this.setupResizeObserver();
        
        console.log('✅ Responsive Text Manager initialized');
    }

    /**
     * 设置交叉观察器
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.adjustTextInElement(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // 观察所有单词卡片
        document.querySelectorAll('.word-card').forEach(card => {
            observer.observe(card);
        });
        
        this.intersectionObserver = observer;
    }

    /**
     * 设置尺寸观察器
     */
    setupResizeObserver() {
        if (!('ResizeObserver' in window)) return;
        
        const resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                this.adjustTextInElement(entry.target);
            });
        });
        
        // 观察容器
        const container = document.querySelector('.words-grid-kids, .words-grid, #words-grid');
        if (container) {
            resizeObserver.observe(container);
        }
        
        this.resizeObserver = resizeObserver;
    }

    /**
     * 防抖调整
     */
    debouncedAdjust() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.adjustAllText();
        }, this.config.resizeDebounce);
    }

    /**
     * 调整所有文字大小
     */
    adjustAllText() {
        const wordCards = document.querySelectorAll('.word-card');
        
        if (wordCards.length === 0) {
            console.warn('⚠️ No word cards found for text adjustment');
            return;
        }
        
        console.log(`🔄 Adjusting text for ${wordCards.length} word cards`);
        
        wordCards.forEach(card => this.adjustTextInElement(card));
    }

    /**
     * 调整单个元素内的文字大小
     */
    adjustTextInElement(card) {
        const wordText = card.querySelector('.word-text');
        const categoryText = card.querySelector('.word-category');
        
        if (!wordText) return;
        
        // 获取卡片尺寸
        const cardRect = card.getBoundingClientRect();
        const containerWidth = cardRect.width;
        const containerHeight = cardRect.height;
        
        if (containerWidth <= 0 || containerHeight <= 0) return;
        
        // 获取单词长度
        const wordLength = wordText.textContent?.length || 0;
        const word = wordText.textContent || '';
        
        // 设置单词长度属性用于CSS选择器
        if (wordLength > this.config.veryLongWordThreshold) {
            wordText.setAttribute('data-length', 'very-long');
        } else if (wordLength > this.config.longWordThreshold) {
            wordText.setAttribute('data-length', 'long');
        } else {
            wordText.removeAttribute('data-length');
        }
        
        // 计算基础字体大小
        let baseFontSize = this.calculateBaseFontSize(containerWidth, wordLength);
        
        // 应用字体大小到单词文字
        const finalWordSize = this.fitTextToContainer(wordText, baseFontSize, containerWidth * 0.9);
        wordText.style.fontSize = `${finalWordSize}px`;
        
        // 调整分类文字大小
        if (categoryText) {
            const categorySize = Math.max(
                this.config.minFontSize * 0.7,
                finalWordSize * 0.5
            );
            categoryText.style.fontSize = `${categorySize}px`;
        }
        
        // 调试信息
        if (word.length > 10) {
            console.log(`📏 Long word "${word}": ${finalWordSize}px in ${containerWidth}px container`);
        }
    }

    /**
     * 计算基础字体大小
     */
    calculateBaseFontSize(containerWidth, wordLength) {
        // 根据屏幕大小选择比例
        const screenWidth = window.innerWidth;
        let ratio = this.config.containerRatio;
        
        for (const [key, config] of Object.entries(this.config.screenRatios)) {
            if (screenWidth <= config.max) {
                ratio = config.ratio;
                break;
            }
        }
        
        // 基于容器宽度计算
        let fontSize = containerWidth * ratio;
        
        // 根据单词长度调整
        if (wordLength > this.config.veryLongWordThreshold) {
            fontSize *= 0.7;
        } else if (wordLength > this.config.longWordThreshold) {
            fontSize *= 0.8;
        }
        
        // 应用最小最大限制
        return Math.max(
            this.config.minFontSize,
            Math.min(fontSize, this.config.maxFontSize)
        );
    }

    /**
     * 使文字适合容器
     */
    fitTextToContainer(textElement, startingSize, maxWidth) {
        let fontSize = startingSize;
        const minSize = this.config.minFontSize;
        
        // 临时设置字体大小来测量
        textElement.style.fontSize = `${fontSize}px`;
        
        // 二分查找最优字体大小
        let low = minSize;
        let high = fontSize;
        let bestSize = minSize;
        
        for (let i = 0; i < 10 && high > low + 1; i++) { // 最多迭代10次
            const midSize = (low + high) / 2;
            textElement.style.fontSize = `${midSize}px`;
            
            const textWidth = textElement.scrollWidth;
            
            if (textWidth <= maxWidth) {
                bestSize = midSize;
                low = midSize;
            } else {
                high = midSize;
            }
        }
        
        return Math.max(bestSize, minSize);
    }

    /**
     * 手动触发调整（供外部调用）
     */
    refresh() {
        console.log('🔄 Manual text adjustment triggered');
        this.adjustAllText();
    }

    /**
     * 清理资源
     */
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        clearTimeout(this.debounceTimer);
        
        window.removeEventListener('resize', this.debouncedAdjust);
        window.removeEventListener('orientationchange', this.adjustAllText);
        
        this.initialized = false;
        console.log('🧹 Responsive Text Manager destroyed');
    }

    /**
     * 获取调试信息
     */
    getDebugInfo() {
        const wordCards = document.querySelectorAll('.word-card');
        const debugInfo = {
            totalCards: wordCards.length,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            cards: []
        };
        
        wordCards.forEach((card, index) => {
            const wordText = card.querySelector('.word-text');
            const rect = card.getBoundingClientRect();
            
            if (wordText) {
                debugInfo.cards.push({
                    index,
                    word: wordText.textContent,
                    fontSize: window.getComputedStyle(wordText).fontSize,
                    containerSize: {
                        width: rect.width,
                        height: rect.height
                    }
                });
            }
        });
        
        return debugInfo;
    }
}

// 创建全局实例
window.ResponsiveTextManager = ResponsiveTextManager;

// 自动初始化
const responsiveTextManager = new ResponsiveTextManager();
responsiveTextManager.init();

// 暴露到全局作用域供调试使用
window.textManager = responsiveTextManager;