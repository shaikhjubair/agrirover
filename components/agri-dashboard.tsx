'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  BatteryCharging,
  Bell,
  Camera,
  ChevronRight,
  CircleHelp,
  Gauge,
  Leaf,
  Menu,
  MoreHorizontal,
  Radio,
  ScanLine,
  Settings2,
  Signal,
  Sparkles,
  Wifi,
  X,
  Zap,
} from 'lucide-react'

function StatusRing({ value, label, icon: Icon, color }: { value: number; label: string; icon: typeof BatteryCharging; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid size-12 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${value * 3.6}deg, #e8f0ec 0deg)` }}>
        <div className="grid size-9 place-items-center rounded-full bg-white text-[11px] font-bold text-slate-800">{value}%</div>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-800"><Icon className="size-3.5" style={{ color }} /> Optimal</p>
      </div>
    </div>
  )
}

export function AgriDashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [aiStatus, setAiStatus] = useState({ mode: 'Connecting', status: 'Connecting...', target: 'Waiting', confidence: 0, color: 'slate', timestamp: '' })
  const [imageTimestamp, setImageTimestamp] = useState(Date.now())
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/status')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setAiStatus(prev => {
          if (prev.timestamp !== data.timestamp) {
            setImageTimestamp(Date.now())
          }
          return data
        })

        const logsRes = await fetch('http://127.0.0.1:5000/api/logs')
        if (logsRes.ok) {
          const logsData = await logsRes.json()
          setLogs(logsData)
        }
      } catch (error) {
        setAiStatus(prev => ({ ...prev, mode: 'Connecting', status: 'Connecting...', color: 'slate' }))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-[#f6faf7] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200"><Leaf className="size-5 fill-current" /></div>
            <div><p className="text-[17px] font-bold tracking-tight">AgriRover</p><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Field intelligence</p></div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex"><a className="text-slate-900" href="#overview">Overview</a><a href="#scans">Scan history</a><a href="#health">Rover health</a></nav>
          <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span> Rover online</div><Button variant="ghost" size="icon" aria-label="Notifications" className="rounded-full text-slate-500" onClick={() => alert('No new notifications')}><Bell /></Button><div onClick={() => alert('User profile clicked')} className="cursor-pointer"><Avatar className="size-9 border-2 border-white shadow-sm"><AvatarFallback className="bg-sky-100 text-xs font-bold text-sky-700">JM</AvatarFallback></Avatar></div><Button variant="ghost" size="icon" aria-label="Open menu" className="rounded-full md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button></div>
        </div>
        {menuOpen && <div className="flex gap-5 border-t border-slate-100 bg-white px-5 py-4 text-sm font-medium text-slate-600 md:hidden"><a href="#overview">Overview</a><a href="#scans">Scan history</a><a href="#health">Rover health</a></div>}
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <section id="overview" className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600"><Sparkles className="size-3.5" /> Good morning, Sir</div><h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Field overview</h1><p className="mt-2 text-sm text-slate-500">Live intelligence from Greenhouse A · Rover 01</p></div><Button className="w-fit rounded-xl bg-slate-900 px-5 shadow-lg shadow-slate-200 hover:bg-slate-800" onClick={async () => { setScanning(true); try { await fetch('http://127.0.0.1:5000/api/manual_scan', { method: 'POST' }); } catch (e) { console.error(e) } setTimeout(() => { setScanning(false); setImageTimestamp(Date.now()); }, 1000); }}><ScanLine data-icon="inline-start" />{scanning ? 'Scanning field…' : 'Start new scan'}</Button></section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(45,85,64,0.09)]"><CardHeader className="flex flex-row items-center justify-between px-5 pb-4 pt-5 sm:px-7 sm:pt-7"><div><CardTitle className="text-lg tracking-tight">AI vision feed</CardTitle><p className="mt-1 text-xs text-slate-400">Last updated just now · ESP32-CAM</p></div><Badge variant="outline" className="gap-1.5 rounded-full border-emerald-100 bg-emerald-50 text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" /> Live</Badge></CardHeader><CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2 sm:px-7 sm:pb-7"><div className="group relative aspect-[1.25] overflow-hidden rounded-2xl bg-slate-100"><img src="http://127.0.0.1:5000/video_feed" alt="Live Camera" className="w-full h-full object-cover" /></div><div className="group relative aspect-[1.25] overflow-hidden rounded-2xl bg-slate-100"><img src={`http://127.0.0.1:5000/api/latest_capture?t=${imageTimestamp}`} alt="AI Output" className="w-full h-full object-cover" /></div></CardContent></Card>

          <aside id="health" className="flex flex-col gap-5"><Card className="rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(45,85,64,0.09)]"><CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6"><div><CardTitle className="text-base">Rover health</CardTitle><p className="mt-1 text-xs text-slate-400">Rover 01 · Active</p></div><div className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Activity className="size-4" /></div></CardHeader><CardContent className="flex flex-col gap-5 px-6 pb-6 pt-4"><StatusRing value={78} label="Battery" icon={BatteryCharging} color="#10b981" /><StatusRing value={92} label="WiFi signal" icon={Wifi} color="#0ea5e9" /><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-full bg-sky-50 text-sky-600"><Gauge className="size-5" /></div><div><p className="text-xs font-medium text-slate-500">Motor status</p><p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-800"><span className="size-1.5 rounded-full bg-emerald-500" /> All systems normal</p></div></div></CardContent></Card><Card className="rounded-[28px] border-0 bg-slate-900 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"><CardContent className="p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-400">Coverage today</p><p className="mt-1 text-3xl font-bold tracking-tight">18.4 <span className="text-sm font-medium text-slate-400">acres</span></p></div><div className="grid size-10 place-items-center rounded-xl bg-white/10 text-sky-300"><Radio className="size-5" /></div></div><div className="mb-2 flex justify-between text-[11px] text-slate-400"><span>Daily route</span><span>73%</span></div><Progress value={73} className="h-2 bg-white/10 [&>div]:bg-sky-400" /><p className="mt-3 text-xs text-slate-400">Est. completion <span className="font-semibold text-slate-200">Today, 4:40 PM</span></p></CardContent></Card></aside>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-2">
          {/* Site Security Card */}
          <Card className={`rounded-[28px] border-2 transition-all duration-500 ${aiStatus.mode === 'Security' ? 'border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-500/20' : 'border-transparent bg-white'} shadow-[0_18px_50px_rgba(45,85,64,0.09)]`}>
            <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
              <div>
                <CardTitle className="text-lg tracking-tight">Site Security</CardTitle>
                <p className="mt-1 text-xs text-slate-400">General Object Detection</p>
              </div>
              {aiStatus.mode === 'Security' ? (
                <Badge className="animate-pulse rounded-full bg-rose-500 hover:bg-rose-600"><Zap className="mr-1.5 size-3" /> Intruder Alert</Badge>
              ) : (
                <Badge variant="outline" className="rounded-full border-emerald-100 bg-emerald-50 text-emerald-700">Safe</Badge>
              )}
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
              <div className="flex items-center gap-4">
                <div className={`grid size-14 shrink-0 place-items-center rounded-2xl ${aiStatus.mode === 'Security' ? 'bg-rose-200 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Activity className="size-6" />
                </div>
                <div>
                  <p className={`text-xl font-bold tracking-tight capitalize ${aiStatus.mode === 'Security' ? 'text-rose-600' : 'text-slate-900'}`}>
                    {aiStatus.mode === 'Security' ? `${aiStatus.target} Detected` : 'All Clear'}
                  </p>
                  {aiStatus.mode === 'Security' && <p className="text-xs font-semibold text-rose-500">{aiStatus.confidence}% Confidence</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crop Intelligence Card */}
          <Card className={`rounded-[28px] border-2 transition-all duration-500 ${aiStatus.mode === 'Health' ? 'border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-500/20' : 'border-transparent bg-white'} shadow-[0_18px_50px_rgba(45,85,64,0.09)]`}>
            <CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6">
              <div>
                <CardTitle className="text-lg tracking-tight">Crop Intelligence</CardTitle>
                <p className="mt-1 text-xs text-slate-400">Disease & Weed Diagnostics</p>
              </div>
              {aiStatus.mode === 'Health' ? (
                <Badge className="animate-pulse rounded-full bg-amber-500 hover:bg-amber-600"><Leaf className="mr-1.5 size-3" /> Action Required</Badge>
              ) : (
                <Badge variant="outline" className="rounded-full border-emerald-100 bg-emerald-50 text-emerald-700">Optimal</Badge>
              )}
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
              <div className="flex items-center gap-4">
                <div className={`grid size-14 shrink-0 place-items-center rounded-2xl ${aiStatus.mode === 'Health' ? 'bg-amber-200 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Leaf className="size-6" />
                </div>
                <div>
                  <p className={`text-xl font-bold tracking-tight capitalize ${aiStatus.mode === 'Health' ? 'text-amber-600' : 'text-slate-900'}`}>
                    {aiStatus.mode === 'Health' ? aiStatus.target : 'All Clear'}
                  </p>
                  {aiStatus.mode === 'Health' && <p className="text-xs font-semibold text-amber-500">{aiStatus.confidence}% Confidence</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900">AI Detection Activity Log</h2>
          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No activity logged yet. System is monitoring.</div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-6">
              {logs.map((log) => (
                <Card key={log.id} className="min-w-[280px] shrink-0 overflow-hidden rounded-[24px] border-0 shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
                  <div className="h-[160px] w-full bg-slate-100 relative">
                    <img src={log.image_url} alt={log.target} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge className={log.mode === 'Security' ? 'bg-rose-500' : 'bg-amber-500'}>{log.mode}</Badge>
                      <span className="text-[11px] font-medium text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="font-bold text-slate-900 capitalize">{log.target}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-200/70 pt-5 text-xs text-slate-400 sm:flex-row"><p className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-500" /> All systems operational · Syncing every 30 seconds</p><div className="flex gap-5"><a className="flex items-center gap-1 hover:text-slate-700" href="#help"><CircleHelp className="size-3.5" /> Support</a><a className="flex items-center gap-1 hover:text-slate-700" href="#settings"><Settings2 className="size-3.5" /> Settings</a><span className="flex items-center gap-1"><Signal className="size-3.5" /> v2.4.1</span></div></footer>
      </div>
    </main>
  )
}
