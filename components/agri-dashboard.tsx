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

const scans = [
  { label: 'Early Blight', crop: 'Tomato · Row 04', time: '2 min ago', confidence: '96%', status: 'Critical', tone: 'rose' },
  { label: 'Healthy Crop', crop: 'Lettuce · Row 08', time: '18 min ago', confidence: '99%', status: 'Healthy', tone: 'emerald' },
  { label: 'Leaf Spot', crop: 'Pepper · Row 02', time: '34 min ago', confidence: '88%', status: 'Monitor', tone: 'amber' },
]

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
  const [aiStatus, setAiStatus] = useState({ status: 'Loading...', confidence: 0, timestamp: '' })

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/status')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setAiStatus(data)
      } catch (error) {
        setAiStatus(prev => ({ ...prev, status: 'Connecting...', confidence: 0 }))
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
        <section id="overview" className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600"><Sparkles className="size-3.5" /> Good morning, Sir</div><h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Field overview</h1><p className="mt-2 text-sm text-slate-500">Live intelligence from Greenhouse A · Rover 01</p></div><Button className="w-fit rounded-xl bg-slate-900 px-5 shadow-lg shadow-slate-200 hover:bg-slate-800" onClick={async () => { setScanning(true); try { const res = await fetch('http://127.0.0.1:5000/api/manual_scan', { method: 'POST' }); const data = await res.json(); setAiStatus(data); } catch (e) { console.error(e) } setScanning(false); }}><ScanLine data-icon="inline-start" />{scanning ? 'Scanning field…' : 'Start new scan'}</Button></section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <Card className="overflow-hidden rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(45,85,64,0.09)]"><CardHeader className="flex flex-row items-center justify-between px-5 pb-4 pt-5 sm:px-7 sm:pt-7"><div><CardTitle className="text-lg tracking-tight">AI vision feed</CardTitle><p className="mt-1 text-xs text-slate-400">Last updated just now · ESP32-CAM</p></div><Badge variant="outline" className="gap-1.5 rounded-full border-emerald-100 bg-emerald-50 text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" /> Live</Badge></CardHeader><CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2 sm:px-7 sm:pb-7"><div className="group relative aspect-[1.25] overflow-hidden rounded-2xl bg-slate-100"><img src="http://127.0.0.1:5000/video_feed" alt="Live camera view" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white"><Badge className="rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md hover:bg-black/25"><Camera className="mr-1.5 size-3" /> Live camera</Badge><span className="rounded-full bg-black/25 px-2 py-1 text-[10px] font-medium backdrop-blur-md">1080p · 24 FPS</span></div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-12 text-xs font-medium text-white">North bed · Camera 01</div></div><div className="group relative aspect-[1.25] overflow-hidden rounded-2xl bg-slate-100"><img src={`http://127.0.0.1:5000/api/latest_capture?t=${aiStatus.timestamp}`} alt="Live AI stream" className="absolute inset-0 h-full w-full object-cover brightness-[0.9] transition duration-700 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none' }} onLoad={(e) => { e.currentTarget.style.display = 'block' }} /><div className="absolute inset-0 -z-10 grid place-items-center bg-slate-200 text-sm font-medium text-slate-500">Waiting for capture...</div><div className="absolute left-4 top-14 z-10">{aiStatus.status === 'Loading...' ? <span className="rounded-md bg-slate-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">Loading...</span> : <span className={`rounded-md px-2 py-1 text-[10px] font-bold text-white shadow-lg ${aiStatus.status === 'Clear' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{aiStatus.status} {aiStatus.status !== 'Clear' && `· ${aiStatus.confidence}%`}</span>}</div><div className="absolute inset-x-0 top-0 flex items-center justify-between p-4"><Badge className="rounded-full border border-white/30 bg-sky-500/85 text-white hover:bg-sky-500/85"><Sparkles className="mr-1.5 size-3" /> AI processed</Badge><span className="rounded-full bg-white/75 px-2 py-1 text-[10px] font-semibold text-sky-700 backdrop-blur-md">{aiStatus.status === 'Clear' ? '0 detections' : '1 detection'}</span></div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-12 text-xs font-medium text-white">Vision model · v2.4</div></div></CardContent></Card>

          <aside id="health" className="flex flex-col gap-5"><Card className="rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(45,85,64,0.09)]"><CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6"><div><CardTitle className="text-base">Rover health</CardTitle><p className="mt-1 text-xs text-slate-400">Rover 01 · Active</p></div><div className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Activity className="size-4" /></div></CardHeader><CardContent className="flex flex-col gap-5 px-6 pb-6 pt-4"><StatusRing value={78} label="Battery" icon={BatteryCharging} color="#10b981" /><StatusRing value={92} label="WiFi signal" icon={Wifi} color="#0ea5e9" /><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-full bg-sky-50 text-sky-600"><Gauge className="size-5" /></div><div><p className="text-xs font-medium text-slate-500">Motor status</p><p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-800"><span className="size-1.5 rounded-full bg-emerald-500" /> All systems normal</p></div></div></CardContent></Card><Card className="rounded-[28px] border-0 bg-slate-900 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"><CardContent className="p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-400">Coverage today</p><p className="mt-1 text-3xl font-bold tracking-tight">18.4 <span className="text-sm font-medium text-slate-400">acres</span></p></div><div className="grid size-10 place-items-center rounded-xl bg-white/10 text-sky-300"><Radio className="size-5" /></div></div><div className="mb-2 flex justify-between text-[11px] text-slate-400"><span>Daily route</span><span>73%</span></div><Progress value={73} className="h-2 bg-white/10 [&>div]:bg-sky-400" /><p className="mt-3 text-xs text-slate-400">Est. completion <span className="font-semibold text-slate-200">Today, 4:40 PM</span></p></CardContent></Card></aside>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]"><Card className="rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(45,85,64,0.09)]"><CardHeader className="flex flex-row items-start justify-between px-6 pb-2 pt-6"><div><CardTitle className="text-lg tracking-tight">Smart diagnostics</CardTitle><p className="mt-1 text-xs text-slate-400">Most recent AI finding · 2 minutes ago</p></div><Badge className="rounded-full bg-rose-50 text-rose-600 hover:bg-rose-50"><Zap className="mr-1.5 size-3" /> Needs attention</Badge></CardHeader><CardContent className="px-6 pb-6 pt-4"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className={`grid size-16 shrink-0 place-items-center rounded-2xl ${aiStatus.status === 'Clear' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}><Leaf className="size-7" /></div><div className="min-w-0 flex-1"><div className="flex items-end justify-between gap-3"><div><p className="text-xl font-bold tracking-tight">{aiStatus.status === 'Loading...' ? 'Loading...' : (aiStatus.status === 'Clear' ? 'Healthy Crop' : aiStatus.status)}</p><p className="mt-1 text-xs text-slate-500">Live AI Feed</p></div><span className={`text-2xl font-bold ${aiStatus.status === 'Clear' ? 'text-emerald-500' : 'text-rose-500'}`}>{aiStatus.confidence}<span className="text-sm">%</span></span></div><Progress value={aiStatus.confidence} className={`mt-3 h-2 ${aiStatus.status === 'Clear' ? 'bg-emerald-100 [&>div]:bg-emerald-500' : 'bg-rose-100 [&>div]:bg-rose-500'}`} />{aiStatus.status !== 'Clear' && aiStatus.status !== 'Loading...' && <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900"><span className="font-bold">Treatment recommendation: </span>Action required for detected anomaly.</div>}</div></div></CardContent></Card><Card id="scans" className="rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(45,85,64,0.09)]"><CardHeader className="flex flex-row items-center justify-between px-6 pb-2 pt-6"><CardTitle className="text-lg tracking-tight">Recent scans</CardTitle><Button variant="ghost" size="sm" className="gap-1 rounded-lg text-xs text-slate-500">View all <ChevronRight /></Button></CardHeader><CardContent className="px-6 pb-5 pt-2">{scans.map((scan, index) => <div key={scan.label} className="flex items-center gap-3 py-3"><div className={`grid size-10 shrink-0 place-items-center rounded-xl ${scan.tone === 'rose' ? 'bg-rose-50 text-rose-500' : scan.tone === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}><Leaf className="size-4" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold text-slate-800">{scan.label}</p><Badge variant="outline" className={`rounded-full text-[10px] ${scan.tone === 'rose' ? 'border-rose-100 text-rose-600' : scan.tone === 'emerald' ? 'border-emerald-100 text-emerald-600' : 'border-amber-100 text-amber-600'}`}>{scan.status}</Badge></div><p className="mt-0.5 text-[11px] text-slate-400">{scan.crop} · {scan.time}</p></div>{index < scans.length - 1 && <Separator className="absolute" />}</div>)}</CardContent></Card></section>

        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-200/70 pt-5 text-xs text-slate-400 sm:flex-row"><p className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-500" /> All systems operational · Syncing every 30 seconds</p><div className="flex gap-5"><a className="flex items-center gap-1 hover:text-slate-700" href="#help"><CircleHelp className="size-3.5" /> Support</a><a className="flex items-center gap-1 hover:text-slate-700" href="#settings"><Settings2 className="size-3.5" /> Settings</a><span className="flex items-center gap-1"><Signal className="size-3.5" /> v2.4.1</span></div></footer>
      </div>
    </main>
  )
}
