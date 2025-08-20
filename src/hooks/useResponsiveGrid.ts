import { useState, useEffect, useCallback } from 'react';

export function useResponsiveGrid() {
  const [gridConfig, setGridConfig] = useState({
    columns: 8,
    rows: 4,
    maxItems: 32
  });

  const calculateGrid = useCallback(() => {
    // 使用更精确的计算方式
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // 预留给其他组件的空间（header、nav、controls、padding）
    const reservedHeight = 160;
    const reservedWidth = 16;
    
    // 可用的网格空间
    const availableHeight = Math.max(viewportHeight - reservedHeight, 250);
    const availableWidth = Math.max(viewportWidth - reservedWidth, 300);
    
    // 动态计算卡片大小 - 确保足够大显示内容
    const gap = 4;
    let cardSize = 85;
    
    // 根据屏幕大小调整卡片尺寸
    if (availableWidth >= 1200) {
      cardSize = 100;
    } else if (availableWidth >= 800) {
      cardSize = 90;
    } else if (availableWidth >= 600) {
      cardSize = 85;
    } else {
      cardSize = 75;
    }
    
    // 计算可容纳的列数和行数
    const maxCols = Math.floor((availableWidth + gap) / (cardSize + gap));
    const maxRows = Math.floor((availableHeight + gap) / (cardSize + gap));
    
    // 设置合理的范围限制
    const finalCols = Math.min(Math.max(maxCols, 4), 15);
    const finalRows = Math.min(Math.max(maxRows, 3), 8);
    
    // 确保总数不超过可用单词数
    const maxItems = Math.min(finalCols * finalRows, 40);

    setGridConfig({
      columns: finalCols,
      rows: finalRows,
      maxItems
    });
  }, []);

  useEffect(() => {
    // 初始计算
    calculateGrid();
    
    // 防抖的resize处理器
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculateGrid, 150);
    };

    window.addEventListener('resize', handleResize);
    
    // 监听方向变化（移动设备）
    window.addEventListener('orientationchange', () => {
      setTimeout(calculateGrid, 100);
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', calculateGrid);
      clearTimeout(resizeTimer);
    };
  }, [calculateGrid]);

  return gridConfig;
}