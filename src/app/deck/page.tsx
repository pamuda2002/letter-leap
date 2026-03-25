"use client";

import { useState, useEffect } from "react";
import TypingPractice from "@/components/TypingPractice";
import { getDueCards, updateCardReview } from "@/app/actions";
import { Loader2 } from "lucide-react";

export default function DeckPage() {
  const [loading, setLoading] = useState(true);
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReviewButtons, setShowReviewButtons] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const cards = await getDueCards();
        setDueCards(cards);
      } catch (err) {
        console.error("Failed to load deck:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleWordComplete = () => {
    setShowReviewButtons(true);
  };

  const handleReview = async (multiplier: number | "reset") => {
    const currentCard = dueCards[currentIndex];
    if (!currentCard) return;

    let roundedDays: number | undefined;
    if (multiplier !== "reset") {
      const baseInterval = currentCard.intervalDays === 0 ? 1 : currentCard.intervalDays;
      roundedDays = Math.round(baseInterval * multiplier);
    }

    await updateCardReview(currentCard.id, multiplier, roundedDays);
    setShowReviewButtons(false);
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (dueCards.length === 0 || currentIndex >= dueCards.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full py-24 animate-in fade-in duration-500">
        <h1 className="text-4xl font-bold text-zinc-300 dark:text-zinc-600 mb-4 tracking-tight">No words for today!</h1>
        <p className="text-zinc-500 text-lg">Check the <strong className="text-zinc-400">New</strong> tab to add more.</p>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];
  const baseInterval = currentCard.intervalDays === 0 ? 1 : currentCard.intervalDays;
  const hardDays = Math.round(baseInterval * 1.5);
  const goodDays = Math.round(baseInterval * 2.0);
  const easyDays = Math.round(baseInterval * 3.0);
  const masteredDays = Math.round(baseInterval * 10.0);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-16 animate-in slide-in-from-right-8 duration-500">
      
      {!showReviewButtons ? (
        <TypingPractice 
          key={currentCard.id}
          word={currentCard.word.text} 
          remainingCount={dueCards.length - currentIndex}
          showWord={false}
          targetReps={25}
          onComplete={handleWordComplete} 
        />
      ) : (
        <div className="flex flex-col items-center gap-10 animate-in zoom-in-95 duration-300 p-8 w-full max-w-3xl mt-12 bg-card text-card-foreground border border-border rounded-3xl shadow-xl">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-widest">{currentCard.word.text}</h2>
          <p className="text-xl text-muted-foreground font-medium">How difficult was this spelling?</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full">
            <button onClick={() => handleReview('reset')} className="px-2 py-6 rounded-3xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold hover:scale-105 hover:bg-red-200 dark:hover:bg-red-900/60 transition-all border border-red-200 dark:border-red-900 shadow-sm flex flex-col items-center gap-1">
              <span className="text-xl">Reset</span>
              <span className="text-xs opacity-80 font-mono tracking-widest uppercase">0 days</span>
            </button>
            <button onClick={() => handleReview(1.5)} className="px-2 py-6 rounded-3xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold hover:scale-105 hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-all border border-orange-200 dark:border-orange-900 shadow-sm flex flex-col items-center gap-1">
              <span className="text-xl">Hard</span>
              <span className="text-xs opacity-80 font-mono tracking-widest uppercase">{hardDays} {hardDays === 1 ? 'Day' : 'Days'}</span>
            </button>
            <button onClick={() => handleReview(2.0)} className="px-2 py-6 rounded-3xl bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 font-bold hover:scale-105 hover:bg-green-200 dark:hover:bg-green-900/60 transition-all border border-green-200 dark:border-green-900 shadow-sm flex flex-col items-center gap-1">
              <span className="text-xl">Good</span>
              <span className="text-xs opacity-80 font-mono tracking-widest uppercase">{goodDays} {goodDays === 1 ? 'Day' : 'Days'}</span>
            </button>
            <button onClick={() => handleReview(3.0)} className="px-2 py-6 rounded-3xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold hover:scale-105 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-all border border-blue-200 dark:border-blue-900 shadow-sm flex flex-col items-center gap-1">
              <span className="text-xl">Easy</span>
              <span className="text-xs opacity-80 font-mono tracking-widest uppercase">{easyDays} {easyDays === 1 ? 'Day' : 'Days'}</span>
            </button>
            <button onClick={() => handleReview(10.0)} className="col-span-2 sm:col-span-1 px-2 py-6 rounded-3xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold hover:scale-105 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-all border border-purple-200 dark:border-purple-900 shadow-sm flex flex-col items-center gap-1">
              <span className="text-xl">Mastered</span>
              <span className="text-xs opacity-80 font-mono tracking-widest uppercase">{masteredDays} {masteredDays === 1 ? 'Day' : 'Days'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
