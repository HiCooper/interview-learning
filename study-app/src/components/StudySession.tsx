import { useState, useMemo, useCallback, useEffect } from 'react'
import { STUDY_CARDS } from '@/data'
import { getDueCards } from '@/store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import FlashCard from './FlashCard'
import { ArrowLeft, Timer, Brain, Shuffle, BookOpen, PenTool } from 'lucide-react'

type Phase = 'problem-first' | 'speed-review' | 'deep-ask' | 'interleave' | 'feynman'

const PHASES: { key: Phase; label: string; icon: React.ReactNode; time: number; desc: string }[] = [
  { key: 'problem-first', label: '问题前置', icon: <Brain className="w-4 h-4" />, time: 5, desc: '先看题尝试回答，不看答案。大脑搜索过程本身就在强化记忆。' },
  { key: 'speed-review', label: '速查回顾', icon: <BookOpen className="w-4 h-4" />, time: 5, desc: '揭晓答案，对照自己刚才的回答，标记偏差。判断掌握程度。' },
  { key: 'deep-ask', label: '精加工追问', icon: <PenTool className="w-4 h-4" />, time: 10, desc: '追问 3 层"为什么"——追问到触及底层原理才算真正理解。' },
  { key: 'interleave', label: '交错切换', icon: <Shuffle className="w-4 h-4" />, time: 10, desc: '换一个不同模块继续——频繁切换比只刷一个模块记住得多 43%。' },
  { key: 'feynman', label: '费曼输出', icon: <BookOpen className="w-4 h-4" />, time: 5, desc: '选一个概念，用最通俗的语言讲出来。讲不通的地方就是盲点。' },
]

interface Props {
  modules: string[]
  onComplete: (reviewed: number, duration: number) => void
  onBack: () => void
}

export default function StudySession({ modules, onComplete, onBack }: Props) {
  const [phase, setPhase] = useState(0)
  const [cardIndex, setCardIndex] = useState(0)
  const [reviewed, setReviewed] = useState(0)
  const [timer, setTimer] = useState(0)
  const [sessionStart] = useState(() => Date.now())
  const [feynmanTopic, setFeynmanTopic] = useState('')

  // Get cards for selected modules, prioritize due cards
  const cards = useMemo(() => {
    const modCards = STUDY_CARDS.filter(c => modules.includes(c.module))
    const due = getDueCards(modCards.map(c => c.id))
    const dueSet = new Set(due)
    // Shuffle: due cards first, then randomize
    const dueCards = modCards.filter(c => dueSet.has(c.id))
    const otherCards = modCards.filter(c => !dueSet.has(c.id))
    const shuffle = (arr: typeof modCards) => arr.sort(() => Math.random() - 0.5)
    return [...shuffle(dueCards), ...shuffle(otherCards)]
  }, [modules])

  const currentCard = cards[cardIndex % cards.length]

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleNextCard = useCallback((_correct: boolean) => {
    setReviewed(r => r + 1)
    // Move to next card or advance phase
    const newReviewed = reviewed + 1
    if (newReviewed >= 4 && phase < 4) {
      setPhase(p => p + 1)
    }
    setCardIndex(i => (i + 1) % cards.length)
  }, [reviewed, phase, cards.length])

  const handleComplete = () => {
    const duration = Math.round((Date.now() - sessionStart) / 1000)
    onComplete(reviewed, duration)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const currentPhase = PHASES[Math.min(phase, 4)]

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> 返回
        </Button>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Timer className="w-4 h-4" /> {formatTime(timer)}</span>
          <span>已复习 {reviewed} 题</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleComplete}>结束本轮</Button>
      </div>

      {/* Phase indicator */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {PHASES.map((p, i) => (
            <div
              key={p.key}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i < phase ? 'bg-primary' : i === phase ? 'bg-primary animate-pulse' : 'bg-secondary'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-primary">{currentPhase.label}</span>
          <span className="text-muted-foreground">· {currentPhase.desc}</span>
        </div>
      </div>

      {/* Main content */}
      {phase < 4 ? (
        <FlashCard card={currentCard} onNext={handleNextCard} />
      ) : (
        /* Feynman phase */
        <Card>
          <CardContent className="py-8 space-y-6 text-center">
            <div className="text-4xl">🗣️</div>
            <h2 className="text-xl font-semibold">费曼输出</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              从今天学过的卡片中选一个概念，拿张白纸（或打开手机录音），<br/>
              用<strong>最通俗的语言</strong>讲解它，假装听众完全不懂技术。
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {cards.slice(0, 5).map(c => (
                <Button
                  key={c.id}
                  variant={feynmanTopic === c.topic ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeynmanTopic(c.topic)}
                >
                  {c.topic}
                </Button>
              ))}
            </div>
            {feynmanTopic && (
              <div className="bg-muted rounded-lg p-4 text-left space-y-2">
                <p className="font-medium">🎯 讲解主题：{feynmanTopic}</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>用最简单的话解释它是什么</li>
                  <li>为什么需要它？（解决什么问题）</li>
                  <li>用一个生活中的类比帮助理解</li>
                  <li>讲完后回听录音，标记卡壳的地方</li>
                </ol>
              </div>
            )}
            <Button size="lg" onClick={handleComplete}>✅ 完成本轮学习</Button>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <Progress value={reviewed} max={Math.max(10, reviewed + 5)} />
      <p className="text-xs text-center text-muted-foreground">
        卡片 {cardIndex + 1} / {cards.length} · 已复习 {reviewed} 题 · 阶段 {phase + 1}/5
      </p>
    </div>
  )
}
