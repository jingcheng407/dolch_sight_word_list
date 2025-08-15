// iPad布局管理器和分页控制器

// 响应式分页控制器类
class PaginationController {
    constructor(items, itemsPerPage = 6) {
        this.items = items;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 0;
        this.maxPage = Math.ceil(items.length / itemsPerPage) - 1;
        this.onPageChange = null;
        this.gridManager = null; // 响应式网格管理器引用
        
        // 监听网格变化事件
        this.setupGridListener();
    }
    
    // 设置网格监听器
    setupGridListener() {
        window.addEventListener('gridChanged', (event) => {
            const newItemsPerPage = event.detail.itemsPerPage;
            if (newItemsPerPage !== this.itemsPerPage) {
                this.updateItemsPerPage(newItemsPerPage);
            }
        });
    }
    
    // 更新每页物品数量
    updateItemsPerPage(newItemsPerPage) {
        const oldCurrentItem = this.currentPage * this.itemsPerPage;
        this.itemsPerPage = newItemsPerPage;
        this.maxPage = Math.ceil(this.items.length / this.itemsPerPage) - 1;
        
        // 保持当前显示的内容位置
        this.currentPage = Math.floor(oldCurrentItem / this.itemsPerPage);
        this.currentPage = Math.min(this.currentPage, this.maxPage);
        
        console.log(`Updated pagination: ${newItemsPerPage} items per page, current page: ${this.currentPage}`);
        this.notifyPageChange();
    }

    getCurrentPageItems() {
        const start = this.currentPage * this.itemsPerPage;
        return this.items.slice(start, start + this.itemsPerPage);
    }

    nextPage() {
        if (this.currentPage < this.maxPage) {
            this.currentPage++;
            this.notifyPageChange();
            return true;
        }
        return false;
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.notifyPageChange();
            return true;
        }
        return false;
    }

    goToPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex <= this.maxPage) {
            this.currentPage = pageIndex;
            this.notifyPageChange();
            return true;
        }
        return false;
    }

    updateItems(newItems) {
        this.items = newItems;
        this.maxPage = Math.ceil(newItems.length / this.itemsPerPage) - 1;
        if (this.currentPage > this.maxPage) {
            this.currentPage = Math.max(0, this.maxPage);
        }
        this.notifyPageChange();
    }

    notifyPageChange() {
        if (this.onPageChange) {
            this.onPageChange(this.getCurrentPageItems(), this.currentPage, this.maxPage + 1);
        }
    }

    getTotalPages() {
        return this.maxPage + 1;
    }

    getCurrentPageIndex() {
        return this.currentPage;
    }
}

// 响应式布局管理器类
class ResponsiveLayoutManager {
    constructor() {
        this.isIPadLandscape = false;
        this.isIPadPortrait = false;
        this.isMobile = false;
        this.mediaQueries = {
            ipadLandscape: window.matchMedia('(min-width: 1024px) and (orientation: landscape)'),
            ipadPortrait: window.matchMedia('(min-width: 768px) and (max-width: 1023px)'),
            mobile: window.matchMedia('(max-width: 767px)')
        };
        
        // 集成响应式网格管理器
        this.gridManager = null;
        
        this.init();
    }

    init() {
        // 初始检测
        this.checkDeviceType();
        
        // 初始化响应式网格管理器
        if (window.ResponsiveGridManager) {
            this.gridManager = new window.ResponsiveGridManager();
            console.log('ResponsiveGridManager initialized in layout manager');
        }
        
        // 监听屏幕变化
        Object.values(this.mediaQueries).forEach(mq => {
            if (mq.addListener) {
                mq.addListener(() => this.handleScreenChange());
            } else if (mq.addEventListener) {
                mq.addEventListener('change', () => this.handleScreenChange());
            }
        });
        
        // 监听方向变化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleScreenChange(), 500);
        });
        
        this.setupLayout();
    }

    checkDeviceType() {
        this.isIPadLandscape = this.mediaQueries.ipadLandscape.matches;
        this.isIPadPortrait = this.mediaQueries.ipadPortrait.matches;
        this.isMobile = this.mediaQueries.mobile.matches;
    }

    handleScreenChange() {
        console.log('Screen change detected');
        this.checkDeviceType();
        this.setupLayout();
        
        // 通知应用布局已改变
        if (window.app) {
            if (typeof window.app.onLayoutChange === 'function') {
                window.app.onLayoutChange(this.getCurrentLayoutType());
            } else if (typeof window.app.handleLayoutChange === 'function') {
                window.app.handleLayoutChange(this.getCurrentLayoutType());
            }
        }
    }

    getCurrentLayoutType() {
        if (this.isIPadLandscape) return 'ipad-landscape';
        if (this.isIPadPortrait) return 'ipad-portrait';
        if (this.isMobile) return 'mobile';
        return 'desktop';
    }

    setupLayout() {
        const container = document.querySelector('.container');
        if (!container) return;

        // 清除之前的布局类
        container.classList.remove('layout-ipad-landscape', 'layout-ipad-portrait', 'layout-mobile');
        
        // 添加当前布局类
        if (this.isIPadLandscape) {
            container.classList.add('layout-ipad-landscape');
            this.enableIPadLandscapeLayout();
        } else if (this.isIPadPortrait) {
            container.classList.add('layout-ipad-portrait');
            this.enableIPadPortraitLayout();
        } else {
            container.classList.add('layout-mobile');
            this.enableMobileLayout();
        }
    }

    enableIPadLandscapeLayout() {
        console.log('Enabling iPad landscape layout');
        
        // 创建或显示iPad布局结构
        this.createIPadStructure();
        
        // 隐藏原有的移动端导航
        const mobileNav = document.querySelector('.nav-tabs-kids');
        if (mobileNav) {
            mobileNav.style.display = 'none';
        }
    }

    enableIPadPortraitLayout() {
        console.log('Enabling iPad portrait layout');
        this.removeIPadStructure();
        
        // 显示原有导航但优化样式
        const mobileNav = document.querySelector('.nav-tabs-kids');
        if (mobileNav) {
            mobileNav.style.display = 'grid';
        }
    }

    enableMobileLayout() {
        console.log('Enabling mobile layout');
        this.removeIPadStructure();
        
        // 恢复原有移动端布局
        const mobileNav = document.querySelector('.nav-tabs-kids');
        if (mobileNav) {
            mobileNav.style.display = 'grid';
        }
    }

    createIPadStructure() {
        // 检查是否已经存在iPad结构
        if (document.querySelector('.nav-sidebar-ipad')) {
            return;
        }

        const container = document.querySelector('.container');
        const header = document.querySelector('.header');
        
        // 为容器添加响应式类
        container.classList.add('responsive-container');
        
        // 创建左侧导航面板
        const sidebar = document.createElement('div');
        sidebar.className = 'nav-sidebar-ipad responsive-sidebar';
        sidebar.innerHTML = this.createSidebarHTML();
        
        // 创建主内容区域
        const contentArea = document.createElement('div');
        contentArea.className = 'content-area-ipad responsive-content';
        
        // 移动现有的tab内容到新的内容区域
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            contentArea.appendChild(content);
        });
        
        // 插入新结构
        container.insertBefore(sidebar, header.nextSibling);
        container.insertBefore(contentArea, sidebar.nextSibling);
        
        // 设置事件监听器
        this.setupSidebarEventListeners();
    }

    createSidebarHTML() {
        return `
            <div class="progress-section-ipad responsive-progress">
                <div class="progress-title-ipad responsive-progress-title">
                    <span class="progress-bear-ipad">🐻</span>
                    <span>学习进度</span>
                </div>
                <div class="progress-container-ipad">
                    <div class="progress-bar-ipad responsive-progress-bar">
                        <div class="progress-fill-ipad responsive-progress-fill" id="progress-fill"></div>
                    </div>
                    <span class="progress-text-ipad" id="progress-text">0/40 ⭐</span>
                </div>
            </div>

            <nav class="nav-tabs-ipad">
                <button class="tab-btn-ipad responsive-button active" data-tab="learn">
                    <div class="tab-icon-ipad">🎯</div>
                    <span class="tab-text-ipad">学单词</span>
                </button>
                <button class="tab-btn-ipad responsive-button" data-tab="practice">
                    <div class="tab-icon-ipad">🎮</div>
                    <span class="tab-text-ipad">玩游戏</span>
                </button>
                <button class="tab-btn-ipad responsive-button" data-tab="quiz">
                    <div class="tab-icon-ipad">🧩</div>
                    <span class="tab-text-ipad">小测试</span>
                </button>
                <button class="tab-btn-ipad responsive-button" data-tab="stats">
                    <div class="tab-icon-ipad">🏆</div>
                    <span class="tab-text-ipad">我的奖杯</span>
                </button>
            </nav>
            
            <div class="control-section-ipad">
                <div class="control-section-title">🎲 学习工具</div>
                <button class="control-btn-ipad responsive-button" id="shuffle-btn-ipad">
                    <span class="btn-emoji">🎲</span>
                    <span>打乱顺序</span>
                </button>
                <button class="control-btn-ipad responsive-button" id="category-filter-ipad">
                    <span class="btn-emoji">🌈</span>
                    <span>按类型筛选</span>
                </button>
                <button class="control-btn-ipad responsive-button" id="audio-toggle-ipad">
                    <span class="btn-emoji">🔊</span>
                    <span>开关声音</span>
                </button>
            </div>
        `;
    }

    setupSidebarEventListeners() {
        // 标签按钮事件
        document.querySelectorAll('.tab-btn-ipad').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab || e.target.closest('.tab-btn-ipad').dataset.tab;
                this.switchTab(tab);
            });
        });

        // 控制按钮事件
        const shuffleBtn = document.getElementById('shuffle-btn-ipad');
        const categoryBtn = document.getElementById('category-filter-ipad');
        const audioBtn = document.getElementById('audio-toggle-ipad');

        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                if (window.app && window.app.shuffleWords) {
                    window.app.shuffleWords();
                    window.app.showSuccess('🎲 单词顺序打乱了！');
                }
            });
        }

        if (categoryBtn) {
            categoryBtn.addEventListener('click', () => {
                if (window.app && window.app.showCategoryFilter) {
                    window.app.showCategoryFilter();
                }
            });
        }

        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                if (window.app && window.app.toggleAudio) {
                    window.app.toggleAudio();
                    this.updateAudioButtonState();
                }
            });
        }
    }

    switchTab(tabName) {
        // 更新侧边栏按钮状态
        document.querySelectorAll('.tab-btn-ipad').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 切换内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // 通知原有应用切换标签
        if (window.app && window.app.switchTab) {
            window.app.switchTab(tabName);
        }
    }

    updateAudioButtonState() {
        const audioBtn = document.getElementById('audio-toggle-ipad');
        if (audioBtn && window.app) {
            const emoji = audioBtn.querySelector('.btn-emoji');
            if (window.app.audioEnabled) {
                emoji.textContent = '🔊';
                audioBtn.style.background = 'linear-gradient(135deg, var(--secondary-color), var(--success-color))';
                audioBtn.style.color = 'white';
            } else {
                emoji.textContent = '🔇';
                audioBtn.style.background = 'linear-gradient(135deg, var(--card-bg), #f1f3f4)';
                audioBtn.style.color = 'var(--text-dark)';
            }
        }
    }

    removeIPadStructure() {
        const sidebar = document.querySelector('.nav-sidebar-ipad');
        const contentArea = document.querySelector('.content-area-ipad');
        
        if (sidebar) {
            // 移动tab内容回原位置
            const tabContents = contentArea.querySelectorAll('.tab-content');
            const container = document.querySelector('.container');
            
            tabContents.forEach(content => {
                container.appendChild(content);
            });
            
            // 移除iPad结构
            sidebar.remove();
            contentArea.remove();
        }
    }

    // 用于应用调用的公共方法
    isIPadLandscapeMode() {
        return this.isIPadLandscape;
    }

    isIPadPortraitMode() {
        return this.isIPadPortrait;
    }

    isMobileMode() {
        return this.isMobile;
    }
}

// 导出供其他模块使用
window.PaginationController = PaginationController;
window.ResponsiveLayoutManager = ResponsiveLayoutManager;