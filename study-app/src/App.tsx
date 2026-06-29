import { useState, useCallback, useMemo } from 'react'
import { STUDY_CARDS, moduleNames } from './data'
import { loadProgress, recordSession } from './store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, Tab, TabsContent } from '@/components/ui/tabs'
import FlashCard from './components/FlashCard'
import Dashboard from './components/Dashboard'
import StudySession from './components/StudySession'
import { BookOpen, Brain, PenTool, Shuffle, Mic, Flame } from 'lucide-react'

type View = 'home' | 'study' | 'dashboard'

const WORKFLOW_STEPS = [
  { num: 1, icon: <Brain className="w-4 h-4" />, title: '问题前置', time: '5 min', desc: '先看题尝试回答，不看答案。大脑搜索过程本身就在强化记忆。' },
  { num: 2, icon: <BookOpen className="w-4 h-4" />, title: '速查回顾', time: '5 min', desc: '揭晓答案，对照自己刚才的回答，标记偏差。判断掌握程度。' },
  { num: 3, icon: <PenTool className="w-4 h-4" />, title: '精加工追问', time: '10 min', desc: '追问 3 层"为什么"——追问到触及底层原理才算真正理解。' },
  { num: 4, icon: <Shuffle className="w-4 h-4" />, title: '交错切换', time: '10 min', desc: '换一个不同模块继续——频繁切换比只刷一个模块记住得多 43%。' },
  { num: 5, icon: <Mic className="w-4 h-4" />, title: '费曼输出', time: '5 min', desc: '选一个概念用最通俗的语言讲出来。讲不通的地方就是盲点。' },
]

export default function App() {
  const [view, setView] = useState<View>('home')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const progress = useMemo(() => loadProgress(), [view])

  const modules = [...new Set(STUDY_CARDS.map(c => c.module))]

  const toggleModule = useCallback((m: string) => {
    setSelectedModules(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }, [])

  const selectAll = () => setSelectedModules([...modules])
  const clearAll = () => setSelectedModules([])

  const totalCards = STUDY_CARDS.length
  const reviewedCards = Object.keys(progress.cards).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            📚 面试学习系统
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {progress.streak} 天</span>
            <span>{reviewedCards}/{totalCards} 已学</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Navigation tabs */}
        <Tabs className="mb-6">
          <Tab active={view === 'home'} onClick={() => setView('home')}>🏠 首页</Tab>
          <Tab active={view === 'study'} onClick={() => setView('study')}>🧠 开始学习</Tab>
          <Tab active={view === 'dashboard'} onClick={() => setView('dashboard')}>📊 学习数据</Tab>
        </Tabs>

        {view === 'home' && (
          <div className="space-y-8">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { value: totalCards, label: '总题目', icon: <BookOpen className="w-4 h-4" /> },
                { value: reviewedCards, label: '已学习', icon: <Brain className="w-4 h-4" /> },
                { value: progress.streak, label: '连续天数', icon: <Flame className="w-4 h-4 text-orange-500" /> },
                { value: progress.sessions.length, label: '学习次数', icon: <BookOpen className="w-4 h-4" /> },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold text-primary">{s.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Workflow guide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🧪 五阶段科学学习法</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {WORKFLOW_STEPS.map(s => (
                  <div key={s.num} className="workflow-step">
                    <div className="step-number">{s.num}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{s.title}</span>
                        <Badge variant="secondary" className="text-xs">{s.time}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Module picker */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">选择学习模块（交错练习建议选 3 个）</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>全选</Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>清空</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {modules.map(m => {
                  const cardCount = STUDY_CARDS.filter(c => c.module === m).length
                  const isSelected = selectedModules.includes(m)
                  return (
                    <Card
                      key={m}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
                      }`}
                      onClick={() => toggleModule(m)}
                    >
                      <CardContent className="pt-6 text-center">
                        <h3 className="font-semibold">{isSelected ? '✅ ' : ''}{moduleNames[m] || m}</h3>
                        <p className="text-sm text-muted-foreground">{cardCount} 题</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Start button */}
            <div className="text-center">
              <Button
                size="xl"
                onClick={() => setView('study')}
                disabled={selectedModules.length === 0}
              >
                🚀 开始学习
                {selectedModules.length > 0
                  ? ` (${selectedModules.length} 个模块)`
                  : ' (请先选择模块)'}
              </Button>
            </div>
          </div>
        )}

        {view === 'study' && (
          <StudySession
            modules={selectedModules.length > 0 ? selectedModules : modules}
            onComplete={(reviewed, duration) => {
              recordSession(reviewed, duration)
              setView('dashboard')
            }}
            onBack={() => setView('home')}
          />
        )}

        {view === 'dashboard' && <Dashboard />}
      </div>
    </div>
  )
}
