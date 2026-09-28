'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, Battery, CheckCircle2, Clock, Map, Navigation, Power, AlertTriangle } from 'lucide-react'

// Dummy Data for the visual grid tracker
const GRID_SIZE = 10; // 10x10 grid
const ROVER_POS = { x: 3, y: 5 };
const OBSTACLES = [{ x: 5, y: 5 }, { x: 3, y: 7 }, { x: 8, y: 2 }];
const PATH = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}, {x: 3, y: 5}];

const TIMELINE = [
  { time: '10:45 AM', event: 'Motor started (Auto mode)', status: 'success' },
  { time: '10:52 AM', event: 'Scanning sector A (Paused)', status: 'info' },
  { time: '11:03 AM', event: 'Moving to sector B', status: 'success' },
  { time: '11:15 AM', event: 'Obstacle detected! (Rerouting)', status: 'warning' },
  { time: '11:18 AM', event: 'Resumed nominal operation', status: 'success' },
  { time: '11:30 AM', event: 'Current position: x:3, y:5', status: 'info' }
];

export default function MotorStatusPage() {
  const [status, setStatus] = useState<'Moving' | 'Scanning (Paused)' | 'Stopped/Offline'>('Moving')
  const [metrics, setMetrics] = useState({
    totalRunMinutes: 1452,
    sessionUptime: '2h 15m',
    batteryRemaining: 68,
    distanceRemaining: '4.2 km'
  });

  return (
    <div className="min-h-screen bg-[#f6faf7] text-slate-900 pb-12 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl mb-8">
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-emerald-600" /> Motor Telemetry
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mt-0.5">Live diagnostics · Rover 01</p>
          </div>
          
          {/* Live Status Indicator */}
          <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold hidden sm:inline-block">Status:</span>
              <span className="text-sm font-semibold text-emerald-700">{status}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 space-y-8">
        
        {/* Run-time Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="rounded-[24px] border-0 bg-white shadow-[0_8px_30px_rgba(45,85,64,0.06)] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              <Activity className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <CardTitle className="text-sm font-semibold text-slate-500">Total Run Time</CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-3xl font-bold tracking-tight text-slate-800">{metrics.totalRunMinutes} <span className="text-sm font-medium text-slate-400">min</span></div>
              <p className="text-xs text-slate-400 mt-1 font-medium">Lifetime operation</p>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-0 bg-white shadow-[0_8px_30px_rgba(45,85,64,0.06)] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              <Clock className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <CardTitle className="text-sm font-semibold text-slate-500">Session Uptime</CardTitle>
              <div className="h-8 w-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-3xl font-bold tracking-tight text-slate-800">{metrics.sessionUptime}</div>
              <p className="text-xs text-slate-400 mt-1 font-medium">Current continuous run</p>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-0 bg-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.12)] text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none text-rose-500">
              <Battery className="w-24 h-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <CardTitle className="text-sm font-semibold text-slate-400">Battery & Distance</CardTitle>
              <div className="h-8 w-8 rounded-full bg-white/10 text-rose-400 flex items-center justify-center">
                <Battery className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold tracking-tight">{metrics.batteryRemaining}%</div>
                <div className="text-sm font-medium text-slate-400">est. {metrics.distanceRemaining}</div>
              </div>
              <Progress value={metrics.batteryRemaining} className="mt-4 h-1.5 bg-white/10 [&>div]:bg-rose-400" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Location / Grid Tracker */}
          <Card className="lg:col-span-2 rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(45,85,64,0.06)] overflow-hidden flex flex-col">
            <CardHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg tracking-tight">Location Tracker</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1">Lightweight grid mapping for Sector 4A coordinates.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 rounded-full px-3 py-1">
                <Map className="h-3 w-3 mr-1.5 inline text-slate-400" /> Sector 4A
              </Badge>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-1 flex flex-col">
              <div className="w-full flex-1 min-h-[300px] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden relative shadow-inner">
                {/* Visual Grid Lines */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                    <div key={i} className="border-r border-b border-white last:border-r-0"></div>
                  ))}
                </div>
                
                {/* SVG Path Overlay */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
                  {PATH.map((p, i) => {
                    if (i === 0) return null;
                    const prev = PATH[i - 1];
                    const x1 = (prev.x + 0.5) * (100 / GRID_SIZE);
                    const y1 = (prev.y + 0.5) * (100 / GRID_SIZE);
                    const x2 = (p.x + 0.5) * (100 / GRID_SIZE);
                    const y2 = (p.y + 0.5) * (100 / GRID_SIZE);
                    return (
                      <line key={i} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
                    )
                  })}
                </svg>

                {/* Grid Elements Overlay */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
                  {Array.from({ length: GRID_SIZE }).map((_, y) => (
                    Array.from({ length: GRID_SIZE }).map((_, x) => {
                      const isRover = ROVER_POS.x === x && ROVER_POS.y === y;
                      const isObstacle = OBSTACLES.some(o => o.x === x && o.y === y);
                      
                      return (
                        <div key={`${x}-${y}`} className="relative flex items-center justify-center group/cell cursor-crosshair">
                          {isObstacle && (
                            <div className="h-2 w-2 md:h-2.5 md:w-2.5 bg-rose-400 rounded-sm opacity-90 shadow-sm" title="Obstacle detected"></div>
                          )}
                          {isRover && (
                            <div className="absolute z-10 flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 ring-[6px] ring-emerald-50 transition-transform duration-300">
                              <Navigation className="h-3.5 w-3.5 md:h-4 md:w-4 text-white fill-white rotate-45 ml-0.5 mt-0.5" />
                              {/* Pulse ring */}
                              <div className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-40"></div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/cell:opacity-100 transition-opacity"></div>
                        </div>
                      )
                    })
                  ))}
                </div>
              </div>
              <div className="flex gap-5 mt-5 text-[11px] font-semibold tracking-wide uppercase text-slate-400 justify-center">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm"></span> Rover</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-rose-400 shadow-sm"></span> Obstacle</span>
                <span className="flex items-center gap-2"><span className="h-0.5 w-3 bg-slate-300 rounded-full"></span> Path taken</span>
              </div>
            </CardContent>
          </Card>

          {/* Motor Health Log */}
          <Card className="rounded-[28px] border-0 bg-white shadow-[0_18px_50px_rgba(45,85,64,0.06)] flex flex-col h-[500px] lg:h-auto overflow-hidden">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-50">
              <CardTitle className="text-lg tracking-tight">Health Log</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">Timeline of recent motor events.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {TIMELINE.map((item, idx) => (
                  <div key={idx} className="relative flex gap-4">
                    {/* Timeline vertical line */}
                    {idx !== TIMELINE.length - 1 && (
                      <div className="absolute left-[13px] top-8 bottom-[-24px] w-[2px] bg-slate-100 rounded-full"></div>
                    )}
                    
                    {/* Timeline Node */}
                    <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 bg-white shadow-sm
                      ${item.status === 'success' ? 'border-emerald-100 text-emerald-500 bg-emerald-50' : 
                        item.status === 'warning' ? 'border-amber-100 text-amber-500 bg-amber-50' : 
                        'border-sky-100 text-sky-500 bg-sky-50'}`}>
                      {item.status === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                       item.status === 'warning' ? <AlertTriangle className="h-3.5 w-3.5" /> : 
                       <Power className="h-3.5 w-3.5" />}
                    </div>
                    
                    {/* Timeline Content */}
                    <div className="flex flex-col flex-1 pb-1 pt-0.5 min-w-0">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">{item.time}</span>
                      <span className="text-sm font-semibold text-slate-700 truncate">{item.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
