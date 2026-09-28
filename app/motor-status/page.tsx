'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, Clock, TerminalSquare, Cpu, MapPin } from 'lucide-react'
import Link from 'next/link'

const LOGS = [
  { time: '11:30:45.020 AM', type: 'INFO', source: 'SYS_TICK', message: 'Motor Stopped at 45.5 meters' },
  { time: '11:30:43.018 AM', type: 'CMD', source: 'HTTP_GET', message: 'Motor Start signal received' },
  { time: '11:30:38.105 AM', type: 'INFO', source: 'SYS_TICK', message: 'Motor Stopped at 42.0 meters' },
  { time: '11:30:36.102 AM', type: 'CMD', source: 'HTTP_GET', message: 'Motor Start signal received' },
  { time: '11:30:31.050 AM', type: 'INFO', source: 'SYS_TICK', message: 'Motor Stopped at 38.5 meters' },
  { time: '11:30:29.048 AM', type: 'CMD', source: 'HTTP_GET', message: 'Motor Start signal received' },
  { time: '11:28:10.400 AM', type: 'WARN', source: 'ADC_0', message: 'Gas Sensor threshold triggered (ADC: 3102)' },
  { time: '11:25:00.000 AM', type: 'SYS', source: 'BOOT', message: 'ESP32 Telemetry Module Initialized' }
];

export default function MotorStatusPage() {
  const [status, setStatus] = useState('Moving')
  const [uptimeSeconds, setUptimeSeconds] = useState(1420)

  // Distance = Total Motor Run Time (s) * 0.5 m/s
  const distance = (uptimeSeconds * 0.5).toFixed(1)

  // Simulate uptime ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans selection:bg-slate-200">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm mb-8">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-slate-700" /> ESP32 Telemetry
            </h1>
            <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-500">
              <Link href="/" className="hover:text-slate-900 transition-colors">Overview</Link>
              <Link href="/diagnostics" className="hover:text-slate-900 transition-colors">Diagnostics</Link>
              <span className="text-slate-900 bg-slate-100 px-3 py-1 rounded-md">Motor Status</span>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Motor Run Time</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-baseline gap-1">
                <div className="text-3xl font-bold tracking-tight font-mono text-slate-800">{uptimeSeconds}</div>
                <div className="text-sm font-semibold text-slate-500">s</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Distance Covered</CardTitle>
              <MapPin className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-baseline gap-1">
                <div className="text-3xl font-bold tracking-tight font-mono text-slate-800">{distance}</div>
                <div className="text-sm font-semibold text-slate-500">m</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border border-slate-200 bg-slate-900 text-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Current State</CardTitle>
              <Activity className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div className="text-3xl font-bold tracking-tight uppercase">{status}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-row items-center gap-3">
            <TerminalSquare className="h-5 w-5 text-slate-400" />
            <div>
              <CardTitle className="text-base tracking-tight font-bold">Event Log</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">Raw event stream from HTTP requests and onboard sensors.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {LOGS.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{log.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                          ${log.type === 'CMD' ? 'bg-sky-100 text-sky-700' : 
                            log.type === 'WARN' ? 'bg-amber-100 text-amber-700' : 
                            log.type === 'SYS' ? 'bg-indigo-100 text-indigo-700' : 
                            'bg-slate-100 text-slate-700'}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{log.source}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
