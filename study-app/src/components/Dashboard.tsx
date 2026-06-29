import { useState, useMemo, useRef } from 'react'
import { loadProgress, exportData, importData, clearAllData } from '@/store'
import { STUDY_CARDS, moduleNames } from '@/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, Tab, TabsContent } from '@/components/ui/tabs'
import { Flame, BookOpen, Calendar, Download, Upload, Trash2, Info, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progress = useMemo(() => loadProgress(), [refreshKey])

  const totalCards = STUDY_CARDS.length
  const reviewedCards = Object.keys(progress.cards).length
  const masteredCards = Object.values(progress.cards).filter(c => c.interval >= 7).length

  const moduleStats = useMemo(() => {
    const stats: Record<string, { total: number; reviewed: number; mastered: number }> = {}
    for (const mod of new Set(STUDY_CARDS.map(c => c.module))) {
      stats[mod] = { total: 0, reviewed: 0, mastered: 0 }
    }
    for (const card of STUDY_CARDS) {
      stats[card.module].total++
      const cp = progress.cards[card.id]
      if (cp) { stats[card.module].reviewed++; if (cp.interval >= 7) stats[card.module].mastered++ }
    }
    return stats
  }, [progress])

  const recentSessions = progress.sessions.slice(-7).reverse()

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `study-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importData(reader.result as string)
      setImportMsg({ type: result.success ? 'success' : 'error', text: result.message })
      if (result.success) setRefreshKey(k => k + 1)
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClear = () => {
    clearAllData()
    setShowClearConfirm(false)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold text-primary">{reviewedCards}</div><p className="text-sm text-muted-foreground">已学习 / {totalCards}</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1"><Flame className="w-6 h-6 text-orange-500" />{progress.streak}</div><p className="text-sm text-muted-foreground">连续天数</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold text-blue-600">{masteredCards}</div><p className="text-sm text-muted-foreground">已掌握</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold text-purple-600">{progress.sessions.length}</div><p className="text-sm text-muted-foreground">总学习次数</p></CardContent></Card>
      </div>

      {/* Per-module progress */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5" />各模块掌握度</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(moduleStats).map(([mod, stats]) => (
            <div key={mod} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{moduleNames[mod] || mod}</span>
                <span className="text-muted-foreground">{stats.reviewed}/{stats.total} · 掌握 {stats.mastered}</span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1"><Progress value={stats.reviewed} max={stats.total} /></div>
                <Badge variant={stats.mastered >= stats.total * 0.7 ? 'default' : 'secondary'} className="shrink-0">
                  {stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}%
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent sessions */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="w-5 h-5" />最近学习记录</CardTitle></CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">还没有学习记录，开始你的第一次学习吧！</p>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((s, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0 text-sm">
                  <span>{s.date}</span>
                  <span className="text-muted-foreground">{s.cardsReviewed} 题</span>
                  <span className="text-muted-foreground">{Math.round(s.duration / 60)} 分钟</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data storage notice + backup */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
            <Info className="w-5 h-5" /> 数据存储说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-amber-100">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-bold text-amber-700">!</span>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">你的学习记录保存在 <code className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-900 text-xs font-mono">浏览器 localStorage</code> 中</p>
              <ul className="text-muted-foreground space-y-0.5 text-xs list-disc list-inside">
                <li>关闭浏览器/重启电脑后数据<strong>不会丢失</strong></li>
                <li>清除浏览器缓存会<strong>导致数据丢失</strong></li>
                <li>更换设备或浏览器后<strong>看不到之前的数据</strong></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-amber-800">数据备份：</span>
            <Button variant="outline" size="sm" onClick={handleExport} className="border-amber-300 hover:bg-amber-100">
              <Download className="w-4 h-4 mr-1" /> 导出 JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport} className="border-amber-300 hover:bg-amber-100">
              <Upload className="w-4 h-4 mr-1" /> 导入 JSON
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

            {!showClearConfirm ? (
              <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)} className="border-red-300 text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" /> 清除数据
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={handleClear}>
                  <AlertTriangle className="w-4 h-4 mr-1" /> 确认清除
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>取消</Button>
              </div>
            )}
          </div>

          {importMsg && (
            <div className={`p-3 rounded-lg text-sm ${importMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {importMsg.type === 'success' ? '✅ ' : '❌ '}{importMsg.text}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
