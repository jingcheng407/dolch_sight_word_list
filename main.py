import json
import random
from pathlib import Path
from typing import Dict, List

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(title="Dolch Sight Words Learning App")

# 静态文件和模板设置
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# 加载词汇数据
def load_words_data() -> Dict:
    """加载Pre-primer词汇数据"""
    with open("data/words.json", "r", encoding="utf-8") as f:
        return json.load(f)

WORDS_DATA = load_words_data()

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """主页面"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/debug", response_class=HTMLResponse)
async def debug():
    """调试页面"""
    with open("debug.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/test-fix", response_class=HTMLResponse)
async def test_fix():
    """修复测试页面"""
    with open("test_fix.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/debug_bubbles.html", response_class=HTMLResponse)
async def debug_bubbles():
    """气泡调试页面"""
    with open("debug_bubbles.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/quick_bubble_fix.html", response_class=HTMLResponse)
async def quick_bubble_fix():
    """快速气泡修复页面"""
    with open("quick_bubble_fix.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/test_bubble_words.html", response_class=HTMLResponse)
async def test_bubble_words():
    """气泡单词测试页面"""
    with open("test_bubble_words.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/main_page_test.html", response_class=HTMLResponse)
async def main_page_test():
    """主页面气泡测试页面"""
    with open("main_page_test.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/focus_bubble_test.html", response_class=HTMLResponse)
async def focus_bubble_test():
    """气泡聚焦效果测试页面"""
    with open("focus_bubble_test.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/dolch_games_demo.html", response_class=HTMLResponse)
async def dolch_games_demo():
    """Dolch游戏中心演示页面"""
    with open("dolch_games_demo.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/games.html", response_class=HTMLResponse)
async def games_redirect():
    """游戏跳转页面"""
    with open("games.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/games", response_class=HTMLResponse)
async def games_redirect_simple():
    """游戏跳转页面（简化路径）"""
    with open("games.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/api/words")
async def get_all_words():
    """获取所有Pre-primer词汇"""
    return WORDS_DATA["pre_primer"]["words"]

@app.get("/api/levels")
async def get_levels():
    """获取所有可用的Dolch等级"""
    levels = []
    for key, data in WORDS_DATA.items():
        levels.append({
            "key": key,
            "level": data["level"], 
            "description": data["description"],
            "age_range": data.get("age_range", ""),
            "word_count": len(data["words"])
        })
    return levels

@app.get("/api/words/{level}")
async def get_words_by_level(level: str):
    """根据等级获取词汇"""
    if level in WORDS_DATA:
        return {
            "level_info": {
                "key": level,
                "level": WORDS_DATA[level]["level"],
                "description": WORDS_DATA[level]["description"], 
                "age_range": WORDS_DATA[level].get("age_range", ""),
                "word_count": len(WORDS_DATA[level]["words"])
            },
            "words": WORDS_DATA[level]["words"]
        }
    return {"error": "Level not found"}

@app.get("/api/words/random")
async def get_random_words(count: int = 10, level: str = "pre_primer"):
    """获取随机词汇用于练习"""
    if level not in WORDS_DATA:
        level = "pre_primer"
    all_words = WORDS_DATA[level]["words"]
    selected_words = random.sample(all_words, min(count, len(all_words)))
    return {"level": level, "words": selected_words}

@app.get("/api/word/{word}")
async def get_word_details(word: str):
    """获取特定词汇的详细信息"""
    # 在所有等级中搜索单词
    for level_key, level_data in WORDS_DATA.items():
        for w in level_data["words"]:
            if w["word"].lower() == word.lower():
                return {
                    "word_info": w,
                    "level": level_key,
                    "level_name": level_data["level"]
                }
    return {"error": "Word not found"}

@app.get("/api/quiz")
async def get_quiz_questions(count: int = 5):
    """生成测验问题"""
    all_words = WORDS_DATA["pre_primer"]["words"]
    questions = []
    
    for _ in range(min(count, len(all_words))):
        correct_word = random.choice(all_words)
        wrong_words = random.sample([w for w in all_words if w != correct_word], 3)
        options = [correct_word] + wrong_words
        random.shuffle(options)
        
        questions.append({
            "question": f"Which word means: {correct_word['example']}",
            "options": [w["word"] for w in options],
            "correct_answer": correct_word["word"],
            "pronunciation": correct_word["pronunciation"]
        })
    
    return questions

@app.get("/api/stats")
async def get_learning_stats():
    """获取学习统计信息"""
    return {
        "total_words": len(WORDS_DATA["pre_primer"]["words"]),
        "categories": {
            "verbs": len([w for w in WORDS_DATA["pre_primer"]["words"] if w["category"] == "verb"]),
            "adjectives": len([w for w in WORDS_DATA["pre_primer"]["words"] if w["category"] == "adjective"]),
            "pronouns": len([w for w in WORDS_DATA["pre_primer"]["words"] if w["category"] == "pronoun"]),
            "prepositions": len([w for w in WORDS_DATA["pre_primer"]["words"] if w["category"] == "preposition"]),
            "others": len([w for w in WORDS_DATA["pre_primer"]["words"] if w["category"] not in ["verb", "adjective", "pronoun", "preposition"]])
        }
    }

def main():
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
