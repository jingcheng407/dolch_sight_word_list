// 功能验收测试脚本
// 在浏览器控制台中运行

console.log('🌈 开始功能验收测试...');

// 测试1: 检查必要元素存在
function testDOMElements() {
    console.log('\n📋 测试1: DOM元素检查');
    
    const elements = [
        'words-grid',
        'progress-fill', 
        'progress-text',
        'loading'
    ];
    
    let passed = 0;
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ ${id}: 存在`);
            passed++;
        } else {
            console.log(`❌ ${id}: 不存在`);
        }
    });
    
    console.log(`DOM元素测试: ${passed}/${elements.length} 通过`);
    return passed === elements.length;
}

// 测试2: 检查布局管理器
function testLayoutManager() {
    console.log('\n📱 测试2: 布局管理器检查');
    
    let passed = 0;
    let total = 0;
    
    // 检查类是否存在
    total++;
    if (window.ResponsiveLayoutManager) {
        console.log('✅ ResponsiveLayoutManager: 已加载');
        passed++;
    } else {
        console.log('❌ ResponsiveLayoutManager: 未加载');
    }
    
    total++;
    if (window.PaginationController) {
        console.log('✅ PaginationController: 已加载');
        passed++;
    } else {
        console.log('❌ PaginationController: 未加载');
    }
    
    // 检查应用实例
    total++;
    if (window.app) {
        console.log('✅ DolchApp实例: 存在');
        passed++;
        
        // 检查iPad相关属性
        total++;
        if (window.app.layoutManager) {
            console.log('✅ layoutManager: 已初始化');
            passed++;
        } else {
            console.log('❌ layoutManager: 未初始化');
        }
    } else {
        console.log('❌ DolchApp实例: 不存在');
    }
    
    console.log(`布局管理器测试: ${passed}/${total} 通过`);
    return passed === total;
}

// 测试3: 检查API连通性
async function testAPIConnectivity() {
    console.log('\n🌐 测试3: API连通性检查');
    
    let passed = 0;
    let total = 3;
    
    try {
        // 测试单词API
        const wordsResponse = await fetch('/api/words');
        if (wordsResponse.ok) {
            const words = await wordsResponse.json();
            if (Array.isArray(words) && words.length > 0) {
                console.log(`✅ 单词API: 正常 (${words.length}个单词)`);
                passed++;
            } else {
                console.log('❌ 单词API: 数据格式错误');
            }
        } else {
            console.log('❌ 单词API: 请求失败');
        }
    } catch (error) {
        console.log('❌ 单词API: 连接错误', error.message);
    }
    
    try {
        // 测试测验API
        const quizResponse = await fetch('/api/quiz?count=5');
        if (quizResponse.ok) {
            const quiz = await quizResponse.json();
            if (Array.isArray(quiz) && quiz.length === 5) {
                console.log(`✅ 测验API: 正常 (${quiz.length}道题)`);
                passed++;
            } else {
                console.log('❌ 测验API: 数据格式错误');
            }
        } else {
            console.log('❌ 测验API: 请求失败');
        }
    } catch (error) {
        console.log('❌ 测验API: 连接错误', error.message);
    }
    
    try {
        // 测试统计API
        const statsResponse = await fetch('/api/stats');
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            if (stats && typeof stats.total_words === 'number') {
                console.log(`✅ 统计API: 正常 (总词数: ${stats.total_words})`);
                passed++;
            } else {
                console.log('❌ 统计API: 数据格式错误');
            }
        } else {
            console.log('❌ 统计API: 请求失败');
        }
    } catch (error) {
        console.log('❌ 统计API: 连接错误', error.message);
    }
    
    console.log(`API连通性测试: ${passed}/${total} 通过`);
    return passed === total;
}

// 测试4: 检查响应式布局
function testResponsiveLayout() {
    console.log('\n📏 测试4: 响应式布局检查');
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;
    
    let passed = 0;
    let total = 4;
    
    console.log(`当前视窗: ${width}x${height} (${isLandscape ? '横屏' : '竖屏'})`);
    
    // 检查媒体查询
    const ipadLandscape = window.matchMedia('(min-width: 1024px) and (orientation: landscape)').matches;
    const ipadPortrait = window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    
    console.log(`iPad横屏匹配: ${ipadLandscape}`);
    console.log(`iPad竖屏匹配: ${ipadPortrait}`);
    console.log(`手机匹配: ${mobile}`);
    
    // 布局应该匹配其中一种
    total++;
    if (ipadLandscape || ipadPortrait || mobile) {
        console.log('✅ 媒体查询: 匹配了至少一种布局');
        passed++;
    } else {
        console.log('❌ 媒体查询: 未匹配任何布局');
    }
    
    // 检查CSS文件是否加载
    total++;
    const ipadStyles = Array.from(document.styleSheets).find(sheet => 
        sheet.href && sheet.href.includes('ipad.css')
    );
    if (ipadStyles) {
        console.log('✅ iPad CSS: 已加载');
        passed++;
    } else {
        console.log('❌ iPad CSS: 未加载');
    }
    
    // 检查容器类
    total++;
    const container = document.querySelector('.container');
    if (container) {
        console.log('✅ 主容器: 存在');
        passed++;
        
        // 检查iPad特定结构
        total++;
        if (ipadLandscape) {
            const sidebar = document.querySelector('.nav-sidebar-ipad');
            const contentArea = document.querySelector('.content-area-ipad');
            if (sidebar && contentArea) {
                console.log('✅ iPad横屏结构: 已创建');
                passed++;
            } else {
                console.log('❌ iPad横屏结构: 缺失');
            }
        } else {
            console.log('ℹ️  iPad横屏结构: 当前不适用');
            passed++; // 不是iPad横屏时算通过
        }
    } else {
        console.log('❌ 主容器: 不存在');
    }
    
    console.log(`响应式布局测试: ${passed}/${total} 通过`);
    return passed === total;
}

// 测试5: 检查触控友好性
function testTouchFriendly() {
    console.log('\n👆 测试5: 触控友好性检查');
    
    let passed = 0;
    let total = 0;
    
    const touchElements = document.querySelectorAll('button, .word-card, .tab-btn-kids, .control-btn-kids');
    console.log(`检查 ${touchElements.length} 个交互元素...`);
    
    let minSizePassed = 0;
    touchElements.forEach((element, index) => {
        total++;
        const rect = element.getBoundingClientRect();
        const minSize = Math.min(rect.width, rect.height);
        
        if (minSize >= 44) {
            minSizePassed++;
            passed++;
        } else {
            console.log(`❌ 元素 ${index + 1}: ${minSize.toFixed(1)}px < 44px`);
        }
    });
    
    console.log(`触控目标大小: ${minSizePassed}/${touchElements.length} 满足 ≥44px`);
    
    console.log(`触控友好性测试: ${passed}/${total} 通过`);
    return passed === total;
}

// 运行所有测试
async function runAllTests() {
    console.log('🌈=====================================');
    console.log('🌈      儿童英语学习应用 - 功能验收测试');
    console.log('🌈=====================================');
    
    const results = [];
    
    results.push(testDOMElements());
    results.push(testLayoutManager());
    results.push(await testAPIConnectivity());
    results.push(testResponsiveLayout());
    results.push(testTouchFriendly());
    
    const passedCount = results.filter(result => result).length;
    const totalCount = results.length;
    
    console.log('\n🏆=====================================');
    console.log(`🏆      测试总结: ${passedCount}/${totalCount} 通过`);
    console.log('🏆=====================================');
    
    if (passedCount === totalCount) {
        console.log('🎉 所有测试通过！应用已准备好使用！');
    } else {
        console.log('⚠️  部分测试未通过，需要修复相关问题。');
    }
    
    return {
        passed: passedCount,
        total: totalCount,
        success: passedCount === totalCount
    };
}

// 导出测试函数
window.testApp = {
    runAllTests,
    testDOMElements,
    testLayoutManager,
    testAPIConnectivity,
    testResponsiveLayout,
    testTouchFriendly
};

console.log('📖 测试脚本已加载！');
console.log('📖 运行 testApp.runAllTests() 开始完整测试');
console.log('📖 或运行单个测试，如 testApp.testDOMElements()');

// 如果是直接运行脚本，则自动执行测试
if (typeof window !== 'undefined' && document.readyState === 'complete') {
    setTimeout(() => {
        runAllTests();
    }, 1000);
}