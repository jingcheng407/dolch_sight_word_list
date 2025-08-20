import { useState, useEffect } from 'react';
import { Word } from '@/types/word';
import wordsData from '@/data/words.json';

export function useWords() {
  const [words] = useState<Word[]>(() => {
    // Extract all words from all levels
    const allWords: Word[] = [];
    Object.values(wordsData).forEach(level => {
      if (level.words) {
        allWords.push(...level.words);
      }
    });
    return allWords;
  });
  const [filteredWords, setFilteredWords] = useState<Word[]>(words);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = Array.from(new Set(words.map(word => word.category)));

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredWords(words);
    } else {
      setFilteredWords(words.filter(word => word.category === selectedCategory));
    }
  }, [selectedCategory, words]);

  const shuffleWords = () => {
    const shuffled = [...filteredWords].sort(() => Math.random() - 0.5);
    setFilteredWords(shuffled);
  };

  const getWordsByCategory = (category: string) => {
    return words.filter(word => word.category === category);
  };

  const getRandomWords = (count: number, exclude: string[] = []) => {
    const availableWords = words.filter(word => !exclude.includes(word.word));
    const shuffled = availableWords.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  return {
    words,
    filteredWords,
    categories,
    selectedCategory,
    setSelectedCategory,
    shuffleWords,
    getWordsByCategory,
    getRandomWords
  };
}