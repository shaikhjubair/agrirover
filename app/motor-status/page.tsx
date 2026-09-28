'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, Clock, TerminalSquare, Cpu, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function MotorStatusPage() {
  const [status, setStatus] = useState('Offline')
  const [uptimeSeconds, setUptimeSeconds] = useState(0)
  const [logs, setLogs] = useState<any[]>([])

  // Distance = Total Motor Run Time (s) * 0.5 m/s
  const distance = (uptimeSeconds * 0.5).toFixed(1)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/status')
        if (res.ok) {
          const data = await res.json()
          setUptimeSeconds(data.motor_uptime_sec || 0)
          setStatus(data.rover || 'Unknown')
        }
      } catch (e) {
        console.error('Failed to fetch hardware status', e)
      }
    }

    const fetchLogs = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/logs')
        if (res.ok) {
          const data = await res.json()
          setLogs(data)
        }
      } catch (e) {
        console.error('Failed to fetch logs', e)
      }
    }
    
    fetchStatus()
    fetchLogs()
    
    const statusInterval = setInterval(fetchStatus, 1000)
    const logsInterval = setInterval(fetchLogs, 2000)
    
    return () => {
      clearInterval(statusInterval)
      clearInterval(logsInterval)
    }
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
                  {status === 'Moving' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'Moving' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
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
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-sans">No events logged yet.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">{log.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${log.type === 'Security' ? 'bg-rose-100 text-rose-700' : 
                              log.type === 'Disease' ? 'bg-amber-100 text-amber-700' : 
                              log.type === 'Insect' ? 'bg-rose-100 text-rose-700' : 
                              'bg-emerald-100 text-emerald-700'}`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">{log.model || 'Unknown'}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          Target detected: <span className="font-bold text-slate-900">{log.target}</span> ({log.confidence}% match) at {log.distance}m
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
