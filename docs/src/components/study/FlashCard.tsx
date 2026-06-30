'use client';

import { useState, useCallback } from 'react';
import type { StudyCard } from '@/lib/study-data';
import { recordReview } from '@/lib/progress-store';

interface FlashCardProps {
  card: StudyCard;
  onNext: (correct: boolean) => void;
  mode: 'test' | 'review';
}

export default function FlashCard({ card, onNext, mode }: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [selfRating, setSelfRating] = useState<'again' | 'hard' | 'good' | 'easy' | null>(null);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleRate = useCallback((rating: 'again' | 'hard' | 'good' | 'easy') => {
    setSelfRating(rating);
    const correct = rating === 'good' || rating === 'easy';
    recordReview(card.id, correct);
    setTimeout(() => {
      setRevealed(false);
      setSelfRating(null);
      onNext(correct);
    }, 300);
  }, [card.id, onNext]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Topic badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
          {card.moduleName}
        </span>
        <span className="text-xs text-gray-500">{card.topic}</span>
      </div>

      {/* Question card */}
      <div
        className={`
          relative p-8 rounded-xl border-2 transition-all duration-300 cursor-pointer min-h-[200px] flex flex-col justify-center
          ${revealed
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
          }
        `}
        onClick={!revealed ? handleReveal : undefined}
      >
        {!revealed ? (
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">点击揭晓答案 · Click to reveal</p>
            <h3 className="text-lg font-medium leading-relaxed">{card.question}</h3>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{card.question}</h3>
            <div className="border-t border-green-200 dark:border-green-800 pt-4">
              <p className="text-base leading-relaxed whitespace-pre-line">{card.answer}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rating buttons (shown after reveal) */}
      {revealed && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => handleRate('again')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            🔁 Again (1min)
          </button>
          <button
            onClick={() => handleRate('hard')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
          >
            😅 Hard
          </button>
          <button
            onClick={() => handleRate('good')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            ✅ Good
          </button>
          <button
            onClick={() => handleRate('easy')}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            🚀 Easy
          </button>
        </div>
      )}
    </div>
  );
}
