'use client'

import { useState } from 'react'
import {
  Download,
  FileText,
  Search,
  Calendar,
  Target,
  Zap,
  Cpu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const mockLogs = [
  {
    id: 'det-1',
    type: 'Disease',
    target: 'Early Blight',
    confidence: 96,
    timestamp: '2026-09-29 08:14:22.050',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=600&auto=format&fit=crop',
    motorUptime: '01:42:15',
  },
  {
    id: 'det-2',
    type: 'Weed',
    target: 'Bindweed',
    confidence: 88,
    timestamp: '2026-09-29 07:45:10.112',
    image: 'https://images.unsplash.com/photo-1629198728070-6539d0411edc?q=80&w=600&auto=format&fit=crop',
    motorUptime: '01:12:30',
  },
  {
    id: 'det-3',
    type: 'Disease',
    target: 'Powdery Mildew',
    confidence: 91,
    timestamp: '2026-09-28 16:20:05.400',
    image: 'https://images.unsplash.com/photo-1598462729906-8d6d634283fc?q=80&w=600&auto=format&fit=crop',
    motorUptime: '02:55:00',
  },
  {
    id: 'det-4',
    type: 'Security',
    target: 'Person',
    confidence: 99,
    timestamp: '2026-09-28 14:10:00.005',
    image: 'https://images.unsplash.com/photo-1542108226-9130e1e83cc4?q=80&w=600&auto=format&fit=crop',
    motorUptime: '01:00:10',
  },
]

export default function DiagnosticsPage() {
  const [selectedLog, setSelectedLog] = useState(mockLogs[0])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLogs = mockLogs.filter(log => 
    log.target.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans selection:bg-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-slate-700" />
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Diagnostics Log</h1>
            </div>
            <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-500">
              <Link href="/" className="hover:text-slate-900 transition-colors">Overview</Link>
              <span className="text-slate-900 bg-slate-100 px-3 py-1 rounded-md">Diagnostics</span>
              <Link href="/motor-status" className="hover:text-slate-900 transition-colors">Motor Status</Link>
            </nav>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold rounded-md shadow-none border-slate-200 hover:bg-slate-50">
              <FileText className="size-3.5" /> Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 flex max-w-[1200px] flex-col gap-8 px-6 lg:flex-row">
        {/* Left Side: Gallery Grid */}
        <div className="flex-1 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by target or type..." 
              className="w-full rounded-md border border-slate-200 bg-white px-9 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className={`group cursor-pointer overflow-hidden rounded-md border bg-white transition-colors hover:bg-slate-50 ${selectedLog.id === log.id ? 'border-slate-800 ring-1 ring-slate-800' : 'border-slate-200'}`}
                onClick={() => setSelectedLog(log)}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={log.image} alt={log.target} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-slate-900 truncate">{log.target}</h3>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider rounded-sm px-1.5 py-0 bg-slate-100 text-slate-600 hover:bg-slate-200 border-0">
                      {log.type}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {log.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed Metadata Panel */}
        <aside className="w-full lg:w-[400px]">
          <div className="sticky top-24 border border-slate-200 bg-white rounded-md shadow-sm overflow-hidden">
            <div className="aspect-video w-full bg-slate-100 border-b border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedLog.image} alt={selectedLog.target} className="h-full w-full object-cover" />
            </div>

            <div className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedLog.target}</h2>
                  <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{selectedLog.type} Detection</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 shadow-none border-slate-200 text-slate-600 gap-2 hover:bg-slate-50">
                  <Download className="size-3.5" /> Image
                </Button>
              </div>

              <div className="space-y-0 text-sm border-t border-slate-200">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Calendar className="size-4" /> Capture Time
                  </span>
                  <span className="font-mono text-slate-900">{selectedLog.timestamp}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Cpu className="size-4" /> Motor Uptime
                  </span>
                  <span className="font-mono text-slate-900">{selectedLog.motorUptime}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Zap className="size-4" /> AI Confidence
                  </span>
                  <span className="font-mono text-slate-900">{selectedLog.confidence}%</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Target className="size-4" /> AI Model
                  </span>
                  <span className="font-mono text-slate-900">YOLOv8s</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
