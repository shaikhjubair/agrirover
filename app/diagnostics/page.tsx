'use client'

import { useState, useEffect } from 'react'
import {
  Target,
  MapPin,
  Droplets,
  Bug,
  Leaf,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type TabType = 'Weeds' | 'Diseases' | 'Insects';
const tabMapping: Record<TabType, string> = {
  'Weeds': 'Weed',
  'Diseases': 'Disease',
  'Insects': 'Insect'
};

export default function DiagnosticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('Weeds')
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
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
    
    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [])

  // Filter captures that match the active tab type
  const filteredCaptures = logs.filter(log => log.type === tabMapping[activeTab])

  const getHumidityStatus = (hum: number) => {
    if (hum >= 40 && hum <= 70) {
      return { label: 'Good/Optimal', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    }
    return { label: 'Bad/Critical', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans selection:bg-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-slate-700" />
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Diagnostics Log</h1>
            </div>
            <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-500">
              <Link href="/" className="hover:text-slate-900 transition-colors">Overview</Link>
              <span className="text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md">Diagnostics</span>
              <Link href="/motor-status" className="hover:text-slate-900 transition-colors">Motor Status</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-[1200px] px-6">
        
        {/* 3-Tab Layout Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8">
          {(['Weeds', 'Diseases', 'Insects'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab === 'Weeds' && <Leaf className="h-4 w-4" />}
              {tab === 'Diseases' && <Activity className="h-4 w-4" />}
              {tab === 'Insects' && <Bug className="h-4 w-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredCaptures.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-lg">
            <p className="text-slate-500 font-medium">No {activeTab.toLowerCase()} detected in the current logs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCaptures.map(capture => {
              const distance = capture.distance || (capture.motorUptimeSecs * 0.5).toFixed(1)
              const humStatus = getHumidityStatus(capture.humidity)

              return (
                <div key={capture.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  {/* Image Section */}
                  <div className="relative aspect-[4/3] w-full bg-slate-100 border-b border-slate-200 overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={capture.image} 
                      alt="Captured detection" 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                        <Badge 
                          className={`shadow-sm px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider border-0 ${
                            capture.type === 'Disease' ? 'bg-amber-100 text-amber-800' :
                            capture.type === 'Insect' ? 'bg-rose-100 text-rose-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {capture.target} ({capture.confidence}%)
                        </Badge>
                    </div>
                  </div>

                  {/* Metadata Section */}
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    {/* Title / Targets */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Detected Object</p>
                      <h3 className="font-bold text-slate-900 leading-tight">
                        {capture.target}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">{capture.timestamp}</p>
                    </div>

                    <div className="h-[1px] bg-slate-100 w-full" />

                    {/* Sensor Data & Telemetry */}
                    <div className="grid grid-cols-1 gap-3">
                      {/* Distance */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Location</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-slate-800">
                          {distance}m <span className="text-slate-400 text-xs font-sans font-normal ml-1">(from start)</span>
                        </span>
                      </div>

                      {/* Humidity */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Droplets className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">DHT11 Hum</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${humStatus.bg} ${humStatus.border}`}>
                          <span className={`text-xs font-mono font-bold ${humStatus.text}`}>{capture.humidity || 0}%</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${humStatus.text}`}>
                            {humStatus.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Model */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Target className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">AI Model</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-slate-800">
                          {capture.model || 'YOLOv8'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
