import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StudyCard } from '@/data'
import { recordReview } from '@/store'

interface Props {
  card: StudyCard
  onNext: (correct: boolean) => void
}

export default function FlashCard({ card, onNext }: Props) {
  const [revealed, setRevealed] = useState(false)

  const handleReveal = () => { if (!revealed) setRevealed(true) }

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const correct = rating === 'good' || rating === 'easy'
    recordReview(card.id, correct)
    setRevealed(false)
    onNext(correct)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{card.moduleName}</Badge>
        <span className="text-xs text-muted-foreground">{card.topic}</span>
      </div>

      <Card
        className={`card-reveal cursor-pointer min-h-[200px] flex items-center ${
          revealed ? 'border-green-300 bg-green-50/30' : 'hover:border-primary/50'
        }`}
        onClick={handleReveal}
      >
        <CardContent className="w-full py-8">
          {!revealed ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">👆 点击揭晓答案</p>
              <p className="text-lg font-medium leading-relaxed">{card.question}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-base text-muted-foreground">{card.question}</p>
              <div className="border-t pt-4">
                <p className="leading-relaxed whitespace-pre-line">{card.answer}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {revealed && (
        <div className="flex justify-center gap-2 flex-wrap">
          <button className="rating-btn rating-again" onClick={() => handleRate('again')}>
            🔁 忘了
          </button>
          <button className="rating-btn rating-hard" onClick={() => handleRate('hard')}>
            😅 勉强
          </button>
          <button className="rating-btn rating-good" onClick={() => handleRate('good')}>
            ✅ 顺利
          </button>
          <button className="rating-btn rating-easy" onClick={() => handleRate('easy')}>
            🚀 秒答
          </button>
        </div>
      )}
    </div>
  )
}
