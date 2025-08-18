/**
 * 简单字体修复脚本
 * 确保所有文字都能完整显示
 */

(function() {
    'use strict';
    
    let isFixing = false;
    
    // 修复字体大小的主函数
    function fixFontSizes() {
        if (isFixing) return;
        isFixing = true;
        
        console.log('🔧 开始修复字体大小...');
        
        const wordCards = document.querySelectorAll('.word-card');
        
        wordCards.forEach(card => {
            fixCardText(card);
        });
        
        console.log(`✅ 修复了 ${wordCards.length} 个单词卡片的字体`);
        isFixing = false;
    }
    
    // 修复单个卡片的文字
    function fixCardText(card) {
        const wordText = card.querySelector('.word-text');
        const categoryText = card.querySelector('.word-category');
        
        if (!wordText) return;
        
        const word = wordText.textContent || '';
        const wordLength = word.length;
        
        // 移除之前的长度类
        wordText.classList.remove('long-word', 'very-long-word');
        
        // 根据单词长度添加对应的类
        if (wordLength > 12) {
            wordText.classList.add('very-long-word');
            console.log(`📏 超长单词: "${word}" (${wordLength} 字符)`);
        } else if (wordLength > 8) {
            wordText.classList.add('long-word');
            console.log(`📏 长单词: "${word}" (${wordLength} 字符)`);
        }
        
        // 强制设置样式确保文字不溢出
        wordText.style.cssText = `
            max-width: 100% !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            text-align: center !important;
            box-sizing: border-box !important;
        `;
        
        if (categoryText) {
            categoryText.style.cssText = `
                max-width: 100% !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                text-align: center !important;
                box-sizing: border-box !important;
            `;
        }
    }
    
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 创建防抖的修复函数
    const debouncedFix = debounce(fixFontSizes, 100);
    
    // 观察DOM变化
    function observeDOM() {
        const observer = new MutationObserver((mutations) => {
            let shouldFix = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList?.contains('word-card') || 
                                node.querySelector?.('.word-card')) {
                                shouldFix = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldFix) {
                setTimeout(fixFontSizes, 50);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }
    
    // 初始化
    function init() {
        console.log('🚀 字体修复脚本初始化...');
        
        // 等待DOM准备
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(fixFontSizes, 100);
            });
        } else {
            setTimeout(fixFontSizes, 100);
        }
        
        // 监听窗口大小变化
        window.addEventListener('resize', debouncedFix);
        
        // 监听方向变化
        window.addEventListener('orientationchange', () => {
            setTimeout(fixFontSizes, 300);
        });
        
        // 观察DOM变化
        observeDOM();
        
        // 定期检查（备用机制）
        setInterval(() => {
            const cards = document.querySelectorAll('.word-card');
            if (cards.length > 0 && !document.querySelector('.word-card .word-text[style*="max-width"]')) {
                console.log('🔄 定期检查发现需要修复字体');
                fixFontSizes();
            }
        }, 2000);
        
        // 暴露修复函数到全局
        window.fixFontSizes = fixFontSizes;
        
        console.log('✅ 字体修复脚本初始化完成');
    }
    
    // 立即执行初始化
    init();
    
    // 页面完全加载后再次执行
    window.addEventListener('load', () => {
        setTimeout(fixFontSizes, 200);
    });
    
})();