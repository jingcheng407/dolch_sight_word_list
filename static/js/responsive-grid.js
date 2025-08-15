// 响应式网格计算系统 - 智能适应任何分辨率

class ResponsiveGridManager {
    constructor() {
        this.currentGrid = { cols: 3, rows: 2 };
        this.observer = null;
        this.debounceTimer = null;
        this.itemsPerPage = 6;
        this.initialized = false;
        
        this.init();
    }

    init() {
        if (this.initialized) return;
        
        // 监听视窗变化
        this.setupViewportObserver();
        
        // 监听方向变化
        this.setupOrientationObserver();
        
        // 初始计算
        this.calculateAndApplyGrid();
        
        this.initialized = true;
        console.log('ResponsiveGridManager initialized');
    }

    setupViewportObserver() {
        // 防抖处理视窗变化，减少性能消耗
        const handleResize = () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                // 使用 requestAnimationFrame 优化性能
                requestAnimationFrame(() => {
                    try {
                        this.calculateAndApplyGrid();
                    } catch (error) {
                        console.warn('Grid calculation error:', error);
                    }
                });
            }, 150); // 150ms防抖
        };

        // 被动监听以提高滚动性能
        window.addEventListener('resize', handleResize, { passive: true });
        
        // 使用ResizeObserver监听容器变化（如果支持）
        if (window.ResizeObserver) {
            try {
                this.observer = new ResizeObserver(entries => {
                    for (let entry of entries) {
                        if (entry.target.classList.contains('responsive-content')) {
                            clearTimeout(this.debounceTimer);
                            this.debounceTimer = setTimeout(() => {
                                requestAnimationFrame(() => {
                                    try {
                                        this.calculateGridForContainer(entry.contentRect);
                                    } catch (error) {
                                        console.warn('ResizeObserver grid calculation error:', error);
                                    }
                                });
                            }, 100);
                        }
                    }
                });
            } catch (error) {
                console.warn('ResizeObserver initialization failed:', error);
            }
        } else {
            console.log('ResizeObserver not supported, using fallback');
        }
    }

    setupOrientationObserver() {
        // 监听屏幕方向变化
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                // 方向变化后延迟计算，等待布局稳定
                setTimeout(() => {
                    this.calculateAndApplyGrid();
                }, 300);
            });
        } else {
            // 降级方案
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.calculateAndApplyGrid();
                }, 500);
            });
        }
    }

    calculateAndApplyGrid() {
        const containerElement = document.querySelector('.responsive-content') || document.body;
        
        if (this.observer && containerElement) {
            this.observer.observe(containerElement);
        }

        const rect = containerElement.getBoundingClientRect();
        const grid = this.calculateGridForContainer(rect);
        
        if (this.gridChanged(grid)) {
            this.applyGrid(grid);
            this.notifyGridChange(grid);
        }
    }

    calculateGridForContainer(rect) {
        const { width, height } = rect;
        const aspectRatio = width / height;
        const area = width * height;
        
        // 设备类型检测
        const deviceType = this.detectDeviceType(width, height);
        
        // 根据设备类型和屏幕特征计算最优网格
        let grid = this.getOptimalGrid(width, height, aspectRatio, deviceType);
        
        // 确保网格合理性
        grid = this.validateAndAdjustGrid(grid, width, height);
        
        // 计算每页显示的物品数量
        const itemsPerPage = grid.cols * grid.rows;
        
        console.log(`Grid calculated: ${grid.cols}x${grid.rows} (${itemsPerPage} items) for ${width}x${height} (${deviceType})`);
        
        return {
            ...grid,
            itemsPerPage,
            containerWidth: width,
            containerHeight: height,
            aspectRatio,
            deviceType
        };
    }

    detectDeviceType(width, height) {
        const pixelRatio = window.devicePixelRatio || 1;
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // 超小屏幕
        if (width < 480) {
            return isTouch ? 'mobile-portrait' : 'mini-desktop';
        }
        
        // 小屏幕
        if (width < 768) {
            return isTouch ? 'mobile-landscape' : 'small-desktop';
        }
        
        // 中等屏幕
        if (width < 1024) {
            return isTouch ? 'tablet-portrait' : 'medium-desktop';
        }
        
        // 大屏幕
        if (width < 1440) {
            return isTouch ? 'tablet-landscape' : 'desktop';
        }
        
        // 超大屏幕
        if (width < 1920) {
            return 'large-desktop';
        }
        
        // 超宽屏
        if (width >= 1920) {
            return width / height > 2.5 ? 'ultrawide' : 'xl-desktop';
        }
        
        return 'desktop';
    }

    getOptimalGrid(width, height, aspectRatio, deviceType) {
        // 基于设备类型的基础网格配置
        const deviceGrids = {
            'mobile-portrait': { cols: 1, rows: 4 },
            'mobile-landscape': { cols: 2, rows: 2 },
            'tablet-portrait': { cols: 2, rows: 3 },
            'tablet-landscape': { cols: 3, rows: 2 },
            'desktop': { cols: 3, rows: 2 },
            'large-desktop': { cols: 4, rows: 2 },
            'xl-desktop': { cols: 4, rows: 2 },
            'ultrawide': { cols: 5, rows: 2 },
            'mini-desktop': { cols: 2, rows: 2 },
            'small-desktop': { cols: 3, rows: 2 },
            'medium-desktop': { cols: 3, rows: 2 }
        };

        let baseGrid = deviceGrids[deviceType] || { cols: 3, rows: 2 };

        // 基于宽高比的细微调整
        if (aspectRatio > 3) {
            // 超宽屏：增加列数
            baseGrid = { ...baseGrid, cols: Math.min(baseGrid.cols + 1, 6) };
        } else if (aspectRatio < 0.7) {
            // 超高屏：增加行数
            baseGrid = { ...baseGrid, rows: Math.min(baseGrid.rows + 1, 4) };
        }

        // 基于可用空间的动态调整
        const minCardWidth = 120; // 最小卡片宽度
        const minCardHeight = 100; // 最小卡片高度
        const gap = 20; // 网格间距
        
        // 计算实际可容纳的列数和行数
        const maxCols = Math.floor((width + gap) / (minCardWidth + gap));
        const maxRows = Math.floor((height + gap) / (minCardHeight + gap));
        
        // 限制网格不超过实际容纳能力
        baseGrid.cols = Math.min(baseGrid.cols, Math.max(1, maxCols));
        baseGrid.rows = Math.min(baseGrid.rows, Math.max(1, maxRows));

        return baseGrid;
    }

    validateAndAdjustGrid(grid, width, height) {
        // 确保网格参数合理
        const minCols = 1;
        const maxCols = 6;
        const minRows = 1;
        const maxRows = 5;

        grid.cols = Math.max(minCols, Math.min(maxCols, grid.cols));
        grid.rows = Math.max(minRows, Math.min(maxRows, grid.rows));

        // 确保不超过总单词数量限制
        const totalItems = grid.cols * grid.rows;
        if (totalItems > 12) {
            // 如果网格太大，优先减少行数
            while (grid.cols * grid.rows > 12 && grid.rows > 1) {
                grid.rows--;
            }
            // 如果还是太大，减少列数
            while (grid.cols * grid.rows > 12 && grid.cols > 1) {
                grid.cols--;
            }
        }

        // 确保至少有6个位置（一页的基本要求）
        if (totalItems < 4) {
            if (width > height) {
                grid = { cols: 2, rows: 2 };
            } else {
                grid = { cols: 2, rows: 2 };
            }
        }

        return grid;
    }

    gridChanged(newGrid) {
        return newGrid.cols !== this.currentGrid.cols || 
               newGrid.rows !== this.currentGrid.rows;
    }

    applyGrid(grid) {
        this.currentGrid = grid;
        this.itemsPerPage = grid.itemsPerPage;
        
        // 应用CSS网格
        const gridElement = document.querySelector('.responsive-grid');
        if (gridElement) {
            gridElement.style.gridTemplateColumns = `repeat(${grid.cols}, 1fr)`;
            gridElement.style.gridTemplateRows = `repeat(${grid.rows}, 1fr)`;
            
            // 设置网格容器的数据属性，供CSS使用
            gridElement.setAttribute('data-cols', grid.cols);
            gridElement.setAttribute('data-rows', grid.rows);
            gridElement.setAttribute('data-device-type', grid.deviceType);
            
            console.log(`Applied grid: ${grid.cols}x${grid.rows} to element`);
        }

        // 更新CSS自定义属性
        document.documentElement.style.setProperty('--dynamic-grid-cols', grid.cols);
        document.documentElement.style.setProperty('--dynamic-grid-rows', grid.rows);
        document.documentElement.style.setProperty('--dynamic-items-per-page', grid.itemsPerPage);
    }

    notifyGridChange(grid) {
        // 通知其他组件网格已改变
        const event = new CustomEvent('gridChanged', {
            detail: {
                cols: grid.cols,
                rows: grid.rows,
                itemsPerPage: grid.itemsPerPage,
                deviceType: grid.deviceType,
                containerWidth: grid.containerWidth,
                containerHeight: grid.containerHeight
            }
        });
        
        window.dispatchEvent(event);
        
        // 如果存在应用实例，直接通知
        if (window.app && typeof window.app.onGridChange === 'function') {
            window.app.onGridChange(grid);
        }
    }

    // 获取当前网格信息
    getCurrentGrid() {
        return this.currentGrid;
    }

    // 获取当前每页物品数量
    getItemsPerPage() {
        return this.itemsPerPage;
    }

    // 强制重新计算网格
    recalculate() {
        this.calculateAndApplyGrid();
    }

    // 销毁实例
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        this.initialized = false;
    }

    // 获取推荐的卡片尺寸
    getRecommendedCardSize() {
        const container = document.querySelector('.responsive-content');
        if (!container) return { width: 200, height: 160 };

        const rect = container.getBoundingClientRect();
        const gap = 20;
        
        const availableWidth = rect.width - (this.currentGrid.cols - 1) * gap - 40; // 减去padding
        const availableHeight = rect.height - (this.currentGrid.rows - 1) * gap - 100; // 减去其他元素高度
        
        const cardWidth = availableWidth / this.currentGrid.cols;
        const cardHeight = availableHeight / this.currentGrid.rows;
        
        return {
            width: Math.max(120, cardWidth),
            height: Math.max(100, cardHeight)
        };
    }

    // 检查是否为极端宽高比
    isExtremeAspectRatio() {
        const container = document.querySelector('.responsive-content');
        if (!container) return false;

        const rect = container.getBoundingClientRect();
        const aspectRatio = rect.width / rect.height;
        
        return aspectRatio > 3 || aspectRatio < 0.5;
    }

    // 获取调试信息
    getDebugInfo() {
        const container = document.querySelector('.responsive-content');
        const rect = container ? container.getBoundingClientRect() : { width: 0, height: 0 };
        
        return {
            currentGrid: this.currentGrid,
            itemsPerPage: this.itemsPerPage,
            containerSize: { width: rect.width, height: rect.height },
            aspectRatio: rect.width / rect.height,
            deviceType: this.detectDeviceType(rect.width, rect.height),
            recommendedCardSize: this.getRecommendedCardSize(),
            isExtremeAspectRatio: this.isExtremeAspectRatio()
        };
    }
}

// 导出供其他模块使用
window.ResponsiveGridManager = ResponsiveGridManager;

// CSS工具函数
class ResponsiveCSSUtils {
    // 动态计算clamp值
    static dynamicClamp(min, preferred, max, viewport = 'vw') {
        return `clamp(${min}px, ${preferred}${viewport}, ${max}px)`;
    }
    
    // 基于容器查询的字体大小
    static containerBasedFontSize(baseSize, containerQuery = '5cqi') {
        return `clamp(${baseSize * 0.7}rem, ${containerQuery}, ${baseSize * 1.5}rem)`;
    }
    
    // 智能间距计算
    static smartSpacing(base, factor = 1) {
        const min = base * 0.5 * factor;
        const max = base * 2 * factor;
        const preferred = base * factor;
        return `clamp(${min}px, ${preferred / 16}rem + ${preferred * 0.1}vw, ${max}px)`;
    }
    
    // 自适应阴影
    static adaptiveShadow(intensity = 1) {
        const blur = Math.round(10 * intensity);
        const spread = Math.round(5 * intensity);
        return `0 clamp(2px, 0.5vw, 6px) clamp(${blur}px, ${blur * 0.1}vw, ${blur * 2}px) rgba(0,0,0,${0.1 * intensity})`;
    }
}

window.ResponsiveCSSUtils = ResponsiveCSSUtils;

// ===== 兼容性检查和初始化 =====

// 检查必要的API支持
function checkCompatibility() {
    const features = {
        'CSS Grid': CSS && CSS.supports && CSS.supports('display', 'grid'),
        'CSS Custom Properties': CSS && CSS.supports && CSS.supports('--test', '1'),
        'ResizeObserver': 'ResizeObserver' in window,
        'requestAnimationFrame': 'requestAnimationFrame' in window,
        'matchMedia': 'matchMedia' in window
    };
    
    console.log('Browser compatibility check:', features);
    
    // 如果缺少关键特性，添加polyfill或降级处理
    if (!features['requestAnimationFrame']) {
        window.requestAnimationFrame = function(callback) {
            return setTimeout(callback, 16);
        };
        console.log('Added requestAnimationFrame polyfill');
    }
    
    if (!features['matchMedia']) {
        // 简单的 matchMedia polyfill
        window.matchMedia = function(query) {
            return {
                matches: false,
                addListener: function() {},
                removeListener: function() {}
            };
        };
        console.log('Added matchMedia polyfill');
    }
    
    return features;
}

// 性能监控
function monitorPerformance() {
    if ('performance' in window && performance.mark) {
        performance.mark('responsive-system-start');
        
        window.addEventListener('load', () => {
            performance.mark('responsive-system-end');
            performance.measure('responsive-system-init', 'responsive-system-start', 'responsive-system-end');
            
            const measures = performance.getEntriesByName('responsive-system-init');
            if (measures.length > 0) {
                console.log(`Responsive system initialized in ${measures[0].duration.toFixed(2)}ms`);
            }
        });
    }
}

// 错误处理
window.addEventListener('error', (event) => {
    if (event.filename && event.filename.includes('responsive')) {
        console.error('Responsive system error:', {
            message: event.message,
            filename: event.filename,
            line: event.lineno,
            column: event.colno
        });
    }
});

// 内存泄漏预防
window.addEventListener('beforeunload', () => {
    // 清理全局实例
    if (window.responsiveGridManager) {
        window.responsiveGridManager.destroy();
    }
});

// 初始化
const compatibility = checkCompatibility();
monitorPerformance();

console.log('Responsive Grid System loaded with compatibility checks');

// 在DOM准备好后自动初始化（可选）
if (document.readyState === 'complete') {
    console.log('DOM already loaded, responsive system ready');
} else {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, responsive system ready');
    });
}