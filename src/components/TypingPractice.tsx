"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingPracticeProps {
  word: string;
  remainingCount?: number;
  showWord?: boolean;
  targetReps?: number;
  onComplete?: () => void;
}

export default function TypingPractice({
  word,
  remainingCount = 35,
  showWord = false,
  targetReps = 1,
  onComplete,
}: TypingPracticeProps) {
  const [userInput, setUserInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentRep, setCurrentRep] = useState(1);
  const completedReps = useRef(0);

  // Sound effect refs (initialized client-side only)
  const correctSfx = useRef<HTMLAudioElement | null>(null);
  const incorrectSfx = useRef<HTMLAudioElement | null>(null);
  const winSfx = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctSfx.current = new Audio("/sounds/correct.mp3");
    incorrectSfx.current = new Audio("/sounds/incorrect.mp3");
    winSfx.current = new Audio("/sounds/win.mp3");
  }, []);

  const characters = word.split("");

  const playSound = useCallback(() => {
    if ("speechSynthesis" in window && word) {
      const utterance = new SpeechSynthesisUtterance(word);
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find((v) => v.lang.startsWith("en-"));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [word]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Handle backspace to let users correct mistakes
      if (e.key === "Backspace") {
        setUserInput((prev) => prev.slice(0, -1));
        return;
      }

      // Ignore inputs if word is fully typed (waiting for reset)
      if (userInput.length >= word.length) return;

      // Only handle alphabet characters
      if (/^[a-zA-Z]$/.test(e.key)) {
        const newInput = userInput + e.key.toLowerCase();
        setUserInput(newInput);

        // Check correctness only when they finish the word
        if (newInput.length === word.length) {
          if (newInput === word.toLowerCase()) {
            // Correct word!
            setIsError(false);
            setIsSuccess(true);

            // Play the right sound: win on final rep, correct otherwise
            if (currentRep >= targetReps) {
              if (winSfx.current) { winSfx.current.currentTime = 0; winSfx.current.play(); }
            } else {
              if (correctSfx.current) { correctSfx.current.currentTime = 0; correctSfx.current.play(); }
            }

            setTimeout(() => {
              // Reset input for next iteration
              setUserInput("");
              setIsSuccess(false);
              
              completedReps.current += 1;
              // Proceed based on rep count
              if (currentRep >= targetReps) {
                onComplete?.();
              } else {
                setCurrentRep((prev) => prev + 1);
              }
            }, 600);
          } else {
            // Incorrect word -> trigger shake
            setIsError(true);
            setIsSuccess(false);
            if (incorrectSfx.current) { incorrectSfx.current.currentTime = 0; incorrectSfx.current.play(); }
            
            // Clear the error state and input after animation finishes
            setTimeout(() => {
              setUserInput("");
              setIsError(false);
            }, 400); 
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [userInput, word, characters, playSound]);

  // Autoplay sound only on the very first attempt
  useEffect(() => {
    if (completedReps.current === 0) {
      playSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto gap-16 px-6 py-12 text-zinc-900 dark:text-zinc-100">
      
      {/* Top pill for remaining words */}
      <div className="w-full flex justify-center">
        <div className="flex items-center gap-3 border border-border rounded-full px-5 py-2 bg-card/80 backdrop-blur-md shadow-sm">
          <span className="font-sans text-xs font-semibold tracking-wider uppercase text-muted-foreground">Remaining words</span>
          <span className="text-lg font-bold font-mono text-card-foreground leading-none">{String(remainingCount).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-12 w-full mt-8">

        {/* The target word display (if showWord is true) */}
        {showWord && (
          <div className="text-5xl md:text-7xl font-bold tracking-widest text-foreground uppercase mt-4 mb-2 animate-in fade-in zoom-in-95 duration-700">
            {word}
          </div>
        )}
        
        {/* Actions and progress row */}
        <div className="flex w-full items-center justify-between">
          <button 
            onClick={playSound}
            className="p-4 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95 group shadow-sm dark:shadow-lg"
            aria-label="Play pronunciation"
          >
            <Volume2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
          </button>

          <div className="flex items-end gap-1 font-mono text-4xl">
            <span className="font-bold text-foreground">{String(currentRep).padStart(2, "0")}</span>
            <span className="text-2xl text-muted-foreground font-medium tracking-widest">/{targetReps}</span>
          </div>
        </div>

        {/* The Squares (Character Boxes) */}
        <div className={cn(
            "flex items-center gap-4 flex-wrap justify-center mt-6 transition-transform",
            isError && "animate-shake"
          )}
        >
          {characters.map((_, index) => {
            const isTyped = index < userInput.length;
            const isCurrent = index === userInput.length;
            const typedChar = isTyped ? userInput[index] : "";
            
            return (
              <div
                key={`${word}-${index}`}
                className={cn(
                  "flex items-center justify-center w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-2xl border-2 text-4xl font-bold uppercase transition-all duration-200 shadow-sm",
                  isTyped 
                    ? "border-muted-foreground bg-secondary text-secondary-foreground" 
                    : "border-border bg-card text-transparent",
                  isCurrent && !isError && !isSuccess && "border-primary scale-105 shadow-md shadow-zinc-200 dark:shadow-black/50", // slight highlight for the current box
                  isError && "border-destructive bg-destructive/10 text-destructive", // Turn all boxes red during shake
                  isSuccess && "animate-pop border-green-500 bg-green-500/10 text-green-500" // Turn all boxes green during pop
                )}
              >
                {typedChar}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
