'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  AlertTriangle,
  Bell,
  Bug,
  CheckCircle2,
  Droplets,
  Gauge,
  Leaf,
  Menu,
  Power,
  Radio,
  ScanLine,
  Settings2,
  Signal,
  Sparkles,
  Thermometer,
  X,
} from 'lucide-react'

function StatusRing({ value, label, unit = '%', icon: Icon, color }: { value: number; label: string; unit?: string; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
      <div 
        className="relative grid size-12 place-items-center rounded-full shadow-inner" 
        style={{ backgroundImage: `conic-gradient(${color} ${value * 3.6}deg, #e8f0ec 0deg)` }}
      >
        <div className="grid size-9 place-items-center rounded-full bg-white text-[11px] font-bold text-slate-800 shadow-sm">{value}{unit}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <Icon className="size-4" style={{ color }} /> {label === 'Temperature' ? 'Normal' : 'Optimal'}
        </p>
      </div>
    </div>
  )
}

function StatusIndicator({ isActive, activeText, inactiveText, label, icon: Icon, activeColor, inactiveColor }: any) {
  return (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`grid size-12 shrink-0 place-items-center rounded-full shadow-inner ${isActive ? activeColor.bg : inactiveColor.bg}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span className={`size-2.5 rounded-full ${isActive ? `${activeColor.dot} animate-pulse` : inactiveColor.dot}`} /> 
          {isActive ? activeText : inactiveText}
        </p>
      </div>
    </div>
  )
}

export function AgriDashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [aiStatus, setAiStatus] = useState({ 
    mode: 'Connecting', 
    target: 'Waiting', 
    confidence: 0, 
    timestamp: '', 
    rover: 'Scanning', 
    temperature: 0, 
    humidity: 0, 
    pump: 'OFF' 
  })
  const [imageTimestamp, setImageTimestamp] = useState(Date.now())
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/status')
        if (res.ok) {
          const data = await res.json()
          setAiStatus(prev => {
            if (prev.timestamp !== data.timestamp) setImageTimestamp(Date.now())
            return data
          })
        }
        
        const logsRes = await fetch('http://127.0.0.1:5000/api/logs')
        if (logsRes.ok) {
          const logsData = await logsRes.json()
          setLogs(logsData.filter((log: any) => log.mode === 'Health' || log.mode === 'Weed'))
        }
      } catch (error) {
        setAiStatus(prev => ({ ...prev, mode: 'Connecting' }))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const isThreatActive = aiStatus.mode === 'Health' || aiStatus.mode === 'Weed' || (aiStatus.target !== 'Waiting' && aiStatus.target !== 'All Clear')
  const isPumpActive = aiStatus.pump === 'ON'
  const isRoverMoving = aiStatus.rover === 'Moving'

  const handleScan = async () => {
    setScanning(true)
    try { 
      await fetch('http://127.0.0.1:5000/api/manual_scan', { method: 'POST' }) 
    } catch (e) { 
      console.error(e) 
    }
    setTimeout(() => { 
      setScanning(false)
      setImageTimestamp(Date.now()) 
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-[#f4f8f5] text-slate-900 font-sans selection:bg-emerald-200">
      <header className="sticky top-0 z-20 border-b border-white/80 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Leaf className="size-5 fill-current" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">AgriRover</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-600">Field Intelligence</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <Link className="text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full transition-colors" href="/">Overview</Link>
            <Link className="hover:text-slate-900 transition-colors" href="/diagnostics">Diagnostics</Link>
            <Link className="hover:text-slate-900 transition-colors" href="/motor-status">Rover Health</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span> 
              Rover Online
            </div>
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <Bell className="size-5" />
            </Button>
            <Avatar className="size-9 border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform">
              <AvatarFallback className="bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white">JS</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="rounded-full md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-white px-6 py-6 text-sm font-bold text-slate-600 md:hidden shadow-lg absolute w-full z-10">
          <Link href="/" className="hover:text-slate-900" onClick={() => setMenuOpen(false)}>Overview</Link>
          <Link href="/diagnostics" className="hover:text-slate-900" onClick={() => setMenuOpen(false)}>Diagnostics</Link>
          <Link href="/motor-status" className="hover:text-slate-900" onClick={() => setMenuOpen(false)}>Rover Health</Link>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <section id="overview" className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              <Sparkles className="size-4" /> Good morning, Jubair
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Field Overview</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">Live intelligence and weed detection from Greenhouse A · Rover 01</p>
          </div>
          <Button 
            className="w-fit rounded-xl bg-slate-900 text-white px-6 py-6 text-sm font-bold shadow-sm hover:bg-emerald-600 transition-all duration-300" 
            onClick={handleScan}
          >
            <ScanLine className="mr-2 size-5" />
            {scanning ? 'Scanning Field...' : 'Start New Scan'}
          </Button>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_400px]">
          <div className="flex flex-col gap-6">
            <Card className="overflow-hidden rounded-[32px] border border-white bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">AI Vision Feed</CardTitle>
                  <p className="mt-1 text-xs font-medium text-slate-400">YOLOv8 Plant & Weed Analysis · ESP32-CAM</p>
                </div>
                <Badge variant="outline" className="gap-2 px-3 py-1 rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 font-bold shadow-sm">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-4 px-6 pb-6 sm:grid-cols-2 sm:px-8 sm:pb-8">
                <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900 border-4 border-slate-100 shadow-inner">
                  <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                    <ScanLine className="size-3" /> Raw Camera
                  </div>
                  <img src="http://127.0.0.1:5000/video_feed" alt="Live Camera" className="w-full h-full object-cover" />
                </div>
                <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900 border-4 border-emerald-50 shadow-inner">
                  <div className="absolute top-3 left-3 z-10 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                    <Activity className="size-3" /> AI Processed
                  </div>
                  <img src={`http://127.0.0.1:5000/api/latest_capture?t=${imageTimestamp}`} alt="AI Output" className="w-full h-full object-cover" />
                </div>
              </CardContent>
            </Card>

            <div id="diagnostics" className={`relative overflow-hidden rounded-[32px] p-8 transition-all duration-500 shadow-sm border ${
              isThreatActive 
                ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-rose-500/30 border-rose-400' 
                : 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-500/20 border-emerald-300'
            }`}>
              <div className="absolute -top-24 -right-24 opacity-10">
                {isThreatActive ? <AlertTriangle className="size-96" /> : <CheckCircle2 className="size-96" />}
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <Badge className="mb-4 px-3 py-1 font-bold rounded-full border-0 bg-white/20 text-white hover:bg-white/30">
                    Smart Diagnostics
                  </Badge>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2">
                    {isThreatActive ? 'Detection Alert' : 'Crop is Healthy'}
                  </h2>
                  <p className="text-white/80 font-medium max-w-md text-sm leading-relaxed">
                    {isThreatActive 
                      ? 'The AI vision model has detected an anomaly in the scan area. Please review the details and take necessary action.' 
                      : 'No diseases or invasive weeds detected in the current camera frame. Growth conditions are optimal.'}
                  </p>
                </div>

                <div className={`p-6 rounded-3xl backdrop-blur-xl border border-white/20 w-full md:w-auto min-w-[280px] ${isThreatActive ? 'bg-black/20' : 'bg-black/10'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Detected Target</p>
                  <div className="flex items-center gap-3 mb-4">
                    {isThreatActive ? <Bug className="size-8 text-rose-200" /> : <Leaf className="size-8 text-emerald-200" />}
                    <span className="text-2xl font-black capitalize tracking-tight">{aiStatus.target}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-white/80">AI Confidence</span>
                      <span>{aiStatus.confidence}%</span>
                    </div>
                    <Progress value={aiStatus.confidence} className="h-2.5 bg-white/20 [&>div]:bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside id="health" className="flex flex-col gap-6">
            <Card className="rounded-[32px] border border-white bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between px-8 pb-2 pt-8">
                <div>
                  <CardTitle className="text-lg font-bold">Rover Telemetry</CardTitle>
                  <p className="mt-1 text-xs font-medium text-slate-400">Unit 01 · Active Diagnostics</p>
                </div>
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Activity className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 px-8 pb-8 pt-4">
                <StatusRing value={Math.round(aiStatus.temperature)} label="Temperature" unit="°C" icon={Thermometer} color="#f43f5e" />
                <StatusRing value={Math.round(aiStatus.humidity)} label="Humidity" icon={Droplets} color="#0ea5e9" />
                
                <StatusIndicator 
                  isActive={isPumpActive}
                  label="Water Pump"
                  icon={Power}
                  activeText="Active Irrigation"
                  inactiveText="Standby"
                  activeColor={{ bg: 'bg-sky-100 text-sky-600', dot: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]' }}
                  inactiveColor={{ bg: 'bg-white text-slate-400', dot: 'bg-slate-300' }}
                />

                <StatusIndicator 
                  isActive={isRoverMoving}
                  label="Motor Status"
                  icon={Gauge}
                  activeText="Patrolling Field"
                  inactiveText="Scanning Target"
                  activeColor={{ bg: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' }}
                  inactiveColor={{ bg: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500' }}
                />
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Radio className="size-24" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coverage Today</p>
                  <p className="mt-2 text-4xl font-black tracking-tight flex items-baseline gap-2">
                    18.4 <span className="text-sm font-semibold text-slate-400">acres</span>
                  </p>
                </div>
                <div className="mb-3 flex justify-between text-xs font-bold text-slate-300">
                  <span>Daily Route Progress</span>
                  <span>73%</span>
                </div>
                <Progress value={73} className="h-2.5 bg-slate-700 [&>div]:bg-gradient-to-r [&>div]:from-sky-400 [&>div]:to-emerald-400" />
                <p className="mt-4 text-xs font-medium text-slate-400">
                  Est. completion: <span className="font-bold text-white">Today, 4:40 PM</span>
                </p>
              </CardContent>
            </Card>
          </aside>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Recent Detections</h2>
            <Badge variant="outline" className="px-3 py-1 rounded-full text-slate-500 border-slate-200">History</Badge>
          </div>
          
          {logs.length === 0 ? (
            <div className="rounded-[32px] border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center text-slate-500">
              <Bug className="size-10 mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-lg text-slate-700">No issues detected</p>
              <p className="text-sm mt-1">The system is actively monitoring crops and weeds.</p>
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-8 snap-x">
              {logs.map((log) => (
                <Card key={log.id} className="min-w-[300px] shrink-0 overflow-hidden rounded-[28px] border border-slate-200 shadow-sm snap-start group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                  <div className="h-[180px] w-full bg-slate-100 relative overflow-hidden">
                    <img src={log.image_url} alt={log.target} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <Badge className="bg-rose-500 hover:bg-rose-600 border-0 shadow-sm">{log.mode}</Badge>
                      <span className="text-[10px] font-bold text-white/90 drop-shadow-md">{log.timestamp.split(' ')[1]}</span>
                    </div>
                  </div>
                  <CardContent className="p-5 bg-white">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Detected Issue</p>
                    <p className="text-lg font-black capitalize leading-tight">{log.target.replace(/_/g, ' ')}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 flex flex-col justify-between gap-4 border-t border-slate-200/80 pt-6 text-xs font-semibold text-slate-400 sm:flex-row items-center">
          <p className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Vision Core v2.4 · Monitoring active
          </p>
          <div className="flex gap-6">
            <a className="flex items-center gap-1.5 hover:text-slate-700 transition-colors" href="#settings"><Settings2 className="size-4" /> System Setup</a>
            <span className="flex items-center gap-1.5"><Signal className="size-4" /> Latency: 34ms</span>
          </div>
        </footer>
      </div>
    </main>
  )
}