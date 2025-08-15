#!/bin/bash

echo "🚀 启动 Dolch Sight Words 学习应用..."
echo "📚 Pre-primer 级别 - 40个基础常见词汇"
echo ""

# 检查uv是否安装
if ! command -v uv &> /dev/null; then
    echo "❌ 错误：未找到uv包管理器"
    echo "请先安装uv: https://docs.astral.sh/uv/getting-started/installation/"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
uv sync

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装完成"
    echo ""
    echo "🌐 启动服务器..."
    echo "访问地址: http://localhost:8000"
    echo "按 Ctrl+C 停止服务器"
    echo ""
    
    # 启动应用
    uv run python main.py
else
    echo "❌ 依赖安装失败"
    exit 1
fi