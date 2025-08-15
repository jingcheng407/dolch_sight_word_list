#!/usr/bin/env python3
"""
验证颜色对比度改善
根据WCAG标准计算对比度比值
"""

def hex_to_rgb(hex_color):
    """将十六进制颜色转换为RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def luminance(rgb):
    """计算相对亮度"""
    r, g, b = [x/255.0 for x in rgb]
    
    def gamma_correct(x):
        return x/12.92 if x <= 0.03928 else ((x+0.055)/1.055)**2.4
    
    return 0.2126*gamma_correct(r) + 0.7152*gamma_correct(g) + 0.0722*gamma_correct(b)

def contrast_ratio(color1, color2):
    """计算两个颜色之间的对比度比值"""
    l1 = luminance(hex_to_rgb(color1))
    l2 = luminance(hex_to_rgb(color2))
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

def check_wcag_compliance(ratio):
    """检查WCAG合规性"""
    if ratio >= 7:
        return "AAA (优秀)"
    elif ratio >= 4.5:
        return "AA (合格)"
    elif ratio >= 3:
        return "AA Large Text (大文字合格)"
    else:
        return "不合格"

# 颜色定义
colors = {
    # 原有问题色彩
    'original_primary': '#ff6b6b',
    'original_secondary': '#4ecdc4', 
    'original_accent': '#ffe66d',
    
    # 新的文本安全色（修正后）
    'text_primary': '#d63031',
    'text_secondary': '#00695c',
    'text_accent': '#c62828',
    
    # 现有安全色
    'text_dark': '#2d3436',
    'text_medium': '#636e72',
    
    # 高对比度模式色
    'hc_text_primary': '#b71c1c',
    'hc_text_secondary': '#004d40',
    'hc_text_accent': '#e65100',
    
    # 背景色
    'white_bg': '#ffffff'
}

print("🎨 文字颜色对比度验证报告")
print("=" * 50)

# 测试原有问题色彩
print("\n❌ 原有问题色彩 (vs 白色背景):")
for color_name in ['original_primary', 'original_secondary', 'original_accent']:
    ratio = contrast_ratio(colors[color_name], colors['white_bg'])
    compliance = check_wcag_compliance(ratio)
    print(f"  {color_name:20} {colors[color_name]:8} -> {ratio:5.2f}:1 ({compliance})")

# 测试新的文本安全色
print("\n✅ 新的文本安全色 (vs 白色背景):")
for color_name in ['text_primary', 'text_secondary', 'text_accent']:
    ratio = contrast_ratio(colors[color_name], colors['white_bg'])
    compliance = check_wcag_compliance(ratio)
    print(f"  {color_name:20} {colors[color_name]:8} -> {ratio:5.2f}:1 ({compliance})")

# 测试现有安全色
print("\n✅ 现有文字颜色 (vs 白色背景):")
for color_name in ['text_dark', 'text_medium']:
    ratio = contrast_ratio(colors[color_name], colors['white_bg'])
    compliance = check_wcag_compliance(ratio)
    print(f"  {color_name:20} {colors[color_name]:8} -> {ratio:5.2f}:1 ({compliance})")

# 测试高对比度模式
print("\n🔍 高对比度模式 (vs 白色背景):")
for color_name in ['hc_text_primary', 'hc_text_secondary', 'hc_text_accent']:
    ratio = contrast_ratio(colors[color_name], colors['white_bg'])
    compliance = check_wcag_compliance(ratio)
    print(f"  {color_name:20} {colors[color_name]:8} -> {ratio:5.2f}:1 ({compliance})")

print("\n📊 改善总结:")
print("- ❌ 原primary色对比度:", f"{contrast_ratio(colors['original_primary'], colors['white_bg']):.2f}:1")
print("- ✅ 新text-primary色对比度:", f"{contrast_ratio(colors['text_primary'], colors['white_bg']):.2f}:1")
print(f"- 📈 改善幅度: +{contrast_ratio(colors['text_primary'], colors['white_bg']) - contrast_ratio(colors['original_primary'], colors['white_bg']):.2f}")

print("\n🎯 WCAG AA标准要求: ≥4.5:1")
print("🏆 WCAG AAA标准要求: ≥7:1")
print("✅ 所有新的文本安全色均达到AA标准！")