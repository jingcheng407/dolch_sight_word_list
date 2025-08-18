#!/usr/bin/env python3
"""
检查设计文档中指定的颜色是否符合WCAG标准
"""

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def luminance(rgb):
    r, g, b = [x/255.0 for x in rgb]
    def gamma_correct(x):
        return x/12.92 if x <= 0.03928 else ((x+0.055)/1.055)**2.4
    return 0.2126*gamma_correct(r) + 0.7152*gamma_correct(g) + 0.0722*gamma_correct(b)

def contrast_ratio(color1, color2):
    l1 = luminance(hex_to_rgb(color1))
    l2 = luminance(hex_to_rgb(color2))
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

# 设计文档中提到的颜色
design_colors = {
    'text_primary_design': '#b71c1c',    # 设计文档中的红色
    'text_secondary_design': '#00b894',  # 设计文档中的青色  
    'text_accent_design': '#e65100',     # 设计文档中的橙色
}

# 我目前实际使用的颜色
current_colors = {
    'text_primary_current': '#d63031',   # 目前使用的红色
    'text_secondary_current': '#00695c', # 目前使用的青色
    'text_accent_current': '#c62828',    # 目前使用的红橙色
}

white_bg = '#ffffff'

print("🔍 设计文档颜色 vs 当前实现对比度分析")
print("=" * 60)

print("\n📋 设计文档中指定的颜色:")
for name, color in design_colors.items():
    ratio = contrast_ratio(color, white_bg)
    compliance = "✅ AA合格" if ratio >= 4.5 else "❌ 不合格"
    print(f"  {name:25} {color:8} -> {ratio:5.2f}:1 ({compliance})")

print("\n📋 当前实际使用的颜色:")
for name, color in current_colors.items():
    ratio = contrast_ratio(color, white_bg)
    compliance = "✅ AA合格" if ratio >= 4.5 else "❌ 不合格"
    print(f"  {name:25} {color:8} -> {ratio:5.2f}:1 ({compliance})")

print("\n🔀 对比分析:")
print(f"text_primary: 设计文档#{design_colors['text_primary_design']} ({contrast_ratio(design_colors['text_primary_design'], white_bg):.2f}:1) vs 实际#{current_colors['text_primary_current']} ({contrast_ratio(current_colors['text_primary_current'], white_bg):.2f}:1)")
print(f"text_secondary: 设计文档#{design_colors['text_secondary_design']} ({contrast_ratio(design_colors['text_secondary_design'], white_bg):.2f}:1) vs 实际#{current_colors['text_secondary_current']} ({contrast_ratio(current_colors['text_secondary_current'], white_bg):.2f}:1)")
print(f"text_accent: 设计文档#{design_colors['text_accent_design']} ({contrast_ratio(design_colors['text_accent_design'], white_bg):.2f}:1) vs 实际#{current_colors['text_accent_current']} ({contrast_ratio(current_colors['text_accent_current'], white_bg):.2f}:1)")

print("\n🎯 推荐方案:")
# 检查设计文档颜色是否都符合标准
design_compliant = all(contrast_ratio(color, white_bg) >= 4.5 for color in design_colors.values())
current_compliant = all(contrast_ratio(color, white_bg) >= 4.5 for color in current_colors.values())

if design_compliant:
    print("  ✅ 设计文档中的颜色全部符合WCAG AA标准，应当按设计文档修正")
else:
    print("  ❌ 设计文档中有颜色不符合WCAG AA标准")

if current_compliant:
    print("  ✅ 当前实现的颜色全部符合WCAG AA标准")
else:
    print("  ❌ 当前实现有颜色不符合WCAG AA标准")