# Flex布局映射规则

## 概述
本文档记录从旧布局系统向Flexbox布局的重构映射规则。

## 布局模式识别与替换

### 1. Grid布局 (已部分使用Flex)

**现有模式**：
```css
/* 已经是现代布局，保持不变 */
.nav-tabs-kids {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
}
.words-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```

**处理方式**：保持Grid布局，因为它们更适合二维网格布局。

### 2. Flex布局 (已部分使用)

**现有良好的Flex实现**：
```css
.header-decoration {
    display: flex;
    justify-content: center;
    gap: 20px;
}
.progress-container {
    display: flex;
    align-items: center;
    gap: 15px;
    justify-content: center;
}
```

**处理方式**：保持不变，已经是现代Flex布局。

### 3. 需要重构的模式

#### 3.1 绝对定位装饰元素
**问题代码**：
```css
.header::before {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
}
```

**处理方式**：装饰性绝对定位保持不变，这些是视觉效果而非布局结构。

#### 3.2 inline-block布局
**问题代码**：
```css
.emoji-big {
    display: inline-block;
}
.category-badge {
    display: inline-block;
}
```

**Flex替换**：
```css
/* 容器使用flex */
.emoji-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}
.emoji-big {
    /* 移除inline-block，依赖flex容器 */
}

.category-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
}
```

#### 3.3 浮动清除
**问题代码**：
```css
.bubble-words-container {
    float: none !important;
}
```

**Flex替换**：
```css
/* 移除float声明，使用flex */
.bubble-words-container {
    display: flex;
    flex-direction: column;
}
```

## Flex工具类规划

```css
/* 基础Flex */
.flex { display: flex; }
.inline-flex { display: inline-flex; }

/* 方向 */
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-row-reverse { flex-direction: row-reverse; }
.flex-col-reverse { flex-direction: column-reverse; }

/* 主轴对齐 */
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-evenly { justify-content: space-evenly; }

/* 交叉轴对齐 */
.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }
.items-baseline { align-items: baseline; }

/* 换行 */
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

/* 间距 */
.gap-4 { gap: 4px; }
.gap-8 { gap: 8px; }
.gap-12 { gap: 12px; }
.gap-16 { gap: 16px; }
.gap-20 { gap: 20px; }
.gap-24 { gap: 24px; }

/* Flex项目 */
.flex-1 { flex: 1 1 0%; }
.flex-auto { flex: 1 1 auto; }
.flex-initial { flex: 0 1 auto; }
.flex-none { flex: none; }

/* 组合工具类 */
.center { display: flex; justify-content: center; align-items: center; }
.center-col { display: flex; flex-direction: column; justify-content: center; align-items: center; }
```

## 具体重构计划

### 阶段1：核心布局容器
- [x] 扫描分析现有布局模式
- [ ] 重构主页面容器结构
- [ ] 重构导航区域
- [ ] 重构内容区域

### 阶段2：组件级重构
- [ ] 重构游戏卡片布局
- [ ] 重构模态框布局
- [ ] 重构表单布局

### 阶段3：细节优化
- [ ] 移除无用CSS
- [ ] 统一间距系统
- [ ] 优化响应式断点

### 阶段4：验证测试
- [ ] 视觉对比测试
- [ ] 交互功能测试
- [ ] 跨浏览器测试