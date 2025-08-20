import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { useState, useEffect } from 'react';

export function GridDebugger() {
  const { columns, rows, maxItems } = useResponsiveGrid();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 bg-black bg-opacity-80 text-white text-xs p-2 rounded z-50 font-mono">
      <div>视窗: {dimensions.width}×{dimensions.height}</div>
      <div>网格: {columns}×{rows}</div>
      <div>卡片: {maxItems}</div>
    </div>
  );
}