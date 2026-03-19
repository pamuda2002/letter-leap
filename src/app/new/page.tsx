"use client";

import { useState, useEffect } from "react";
import TypingPractice from "@/components/TypingPractice";
import { getDueCardCount, getNewWords, addWordToDeck, getCardsAddedToday } from "@/app/actions";
import { Loader2, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default function NewWordsPage() {
  const [loading, setLoading] = useState(true);
  const [isFull, setIsFull] = useState(false);
  const [isDailyLimit, setIsDailyLimit] = useState(false);
  const [words, setWords] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        // Check daily limit first: max 10 new cards per day
        const cardsAddedToday = await getCardsAddedToday();
        if (cardsAddedToday >= 10) {
          setIsDailyLimit(true);
          return;
        }

        // Check backlog limit: block if 90+ due cards
        const dueCount = await getDueCardCount();
        if (dueCount >= 90) {
          setIsFull(true);
          return;
        }

        // Fetch only as many new words as the daily limit allows
        const remainingToday = 10 - cardsAddedToday;
        const newWords = await getNewWords(remainingToday);
        setWords(newWords);
      } catch (err) {
        console.error("Failed to load new words:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleWordComplete = async () => {
    const currentWord = words[currentIndex];
    if (currentWord) {
      await addWordToDeck(currentWord.id);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (isDailyLimit) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-500 max-w-lg p-10 bg-card text-card-foreground border border-border shadow-xl rounded-3xl">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold text-amber-500 tracking-tight">Daily Limit Reached!</h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            You&apos;ve already learned 10 new words today. Come back tomorrow to learn more!
          </p>
        </div>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-500 max-w-lg p-10 bg-card text-card-foreground border border-border shadow-xl rounded-3xl">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-red-500 tracking-tight">Backlog Too High!</h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            You have 90 or more words due for review. Please clear your deck before learning new ones so you don&apos;t get overwhelmed!
          </p>
        </div>
      </div>
    );
  }

  if (currentIndex >= words.length || words.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center animate-in zoom-in-95 duration-500 max-w-lg p-10 bg-card text-card-foreground border border-border shadow-xl rounded-3xl">
          <div className="w-28 h-28 rounded-full bg-green-500/10 flex items-center justify-center mb-2 border-[6px] border-green-500/20">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-5xl font-bold text-green-500 tracking-tight">Goal Complete!</h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            You have successfully mastered {words.length} new words! They have been added to your deck for regular spaced-repetition practice.
          </p>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div 
      key={currentWord.id}
      className="flex flex-col items-center justify-center h-full w-full py-16 animate-in slide-in-from-right-8 duration-500"
    >
      <div className="mb-4 bg-secondary text-secondary-foreground border border-border rounded-full px-5 py-1.5 shadow-sm">
        <span className="font-sans text-xs font-semibold tracking-wider uppercase">Learning New Words</span>
      </div>
      
      <TypingPractice 
        word={currentWord.text} 
        remainingCount={words.length - currentIndex}
        showWord={true}
        targetReps={1}
        onComplete={handleWordComplete} 
      />
    </div>
  );
}
