'use client'

import { useState } from 'react'
import {
  Download,
  FileText,
  Filter,
  Search,
  Calendar,
  Thermometer,
  Wind,
  Activity,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const mockLogs = [
  {
    id: 'det-1',
    type: 'Disease',
    target: 'Early Blight',
    confidence: 96,
    timestamp: '2026-09-29 08:14:22',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=600&auto=format&fit=crop',
    gasLevel: '14 ppm',
    temp: '26°C',
    humidity: '72%',
    motorRuntime: '42m 15s',
    sector: 'Greenhouse A'
  },
  {
    id: 'det-2',
    type: 'Weed',
    target: 'Bindweed',
    confidence: 88,
    timestamp: '2026-09-29 07:45:10',
    image: 'https://images.unsplash.com/photo-1629198728070-6539d0411edc?q=80&w=600&auto=format&fit=crop',
    gasLevel: '12 ppm',
    temp: '24°C',
    humidity: '68%',
    motorRuntime: '12m 30s',
    sector: 'Sector 4'
  },
  {
    id: 'det-3',
    type: 'Disease',
    target: 'Powdery Mildew',
    confidence: 91,
    timestamp: '2026-09-28 16:20:05',
    image: 'https://images.unsplash.com/photo-1598462729906-8d6d634283fc?q=80&w=600&auto=format&fit=crop',
    gasLevel: '15 ppm',
    temp: '27°C',
    humidity: '78%',
    motorRuntime: '115m 00s',
    sector: 'Greenhouse B'
  },
  {
    id: 'det-4',
    type: 'Security',
    target: 'Person',
    confidence: 99,
    timestamp: '2026-09-28 14:10:00',
    image: 'https://images.unsplash.com/photo-1542108226-9130e1e83cc4?q=80&w=600&auto=format&fit=crop',
    gasLevel: '10 ppm',
    temp: '25°C',
    humidity: '60%',
    motorRuntime: '60m 10s',
    sector: 'Perimeter'
  },
]

export default function DiagnosticsPage() {
  const [selectedLog, setSelectedLog] = useState(mockLogs[0])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLogs = mockLogs.filter(log => 
    log.target.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleExportCSV = () => alert('Exporting to CSV...')
  const handleExportPDF = () => alert('Exporting to PDF...')

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/70 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Diagnostics & History</h1>
            <p className="text-sm font-medium text-slate-500">Analyze past detections and rover telemetry</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 rounded-xl bg-white/50 shadow-sm backdrop-blur-md hover:bg-white/80" onClick={handleExportCSV}>
              <FileText className="size-4" /> Export CSV
            </Button>
            <Button className="gap-2 rounded-xl bg-slate-900 shadow-md hover:bg-slate-800" onClick={handleExportPDF}>
              <Download className="size-4" /> Download PDF Report
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 flex max-w-[1440px] flex-col gap-8 px-6 lg:flex-row">
        {/* Left Side: Gallery Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by target or type..." 
                className="w-full rounded-xl border-0 bg-white px-10 py-2.5 text-sm shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 rounded-xl bg-white shadow-sm">
              <Filter className="size-4" /> Filter
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredLogs.map((log) => (
              <Card 
                key={log.id} 
                className={`group cursor-pointer overflow-hidden rounded-[24px] border-0 bg-white/60 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 ${selectedLog.id === log.id ? 'ring-2 ring-emerald-500' : 'ring-1 ring-slate-200/50'}`}
                onClick={() => setSelectedLog(log)}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={log.image} alt={log.target} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute left-3 top-3">
                    <Badge className={`rounded-full shadow-md backdrop-blur-md ${
                      log.type === 'Security' ? 'bg-rose-500/90 hover:bg-rose-500' : 
                      log.type === 'Disease' ? 'bg-amber-500/90 hover:bg-amber-500' : 
                      'bg-emerald-500/90 hover:bg-emerald-500'
                    }`}>
                      {log.type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{log.target}</h3>
                    <span className="text-xs font-bold text-slate-400">{log.confidence}% conf</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="mr-1.5 size-3.5" />
                    {log.timestamp}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed Metadata Panel */}
        <aside className="w-full lg:w-[420px]">
          <Card className="sticky top-28 overflow-hidden rounded-[32px] border-0 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl">
            <div className="relative aspect-video w-full bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedLog.image} alt={selectedLog.target} className="h-full w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <Badge className={`mb-2 rounded-md border-0 ${
                  selectedLog.type === 'Security' ? 'bg-rose-500/80 text-white' : 
                  selectedLog.type === 'Disease' ? 'bg-amber-500/80 text-white' : 
                  'bg-emerald-500/80 text-white'
                } backdrop-blur-md`}>
                  {selectedLog.type} Detection
                </Badge>
                <h2 className="text-2xl font-bold text-white">{selectedLog.target}</h2>
                <p className="mt-1 flex items-center text-sm font-medium text-slate-300">
                  <Activity className="mr-1.5 size-4" /> {selectedLog.sector}
                </p>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="mb-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-sm font-medium text-slate-500">Timestamp</span>
                  <span className="text-sm font-semibold text-slate-900">{selectedLog.timestamp}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm font-medium text-slate-500">AI Confidence</span>
                  <span className="flex items-center text-sm font-semibold text-emerald-600">
                    <Zap className="mr-1 size-3.5" /> {selectedLog.confidence}% Match
                  </span>
                </div>
              </div>

              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Environmental Telemetry</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-500">
                    <Thermometer className="size-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-slate-400">Temp</p>
                    <p className="font-semibold text-slate-900">{selectedLog.temp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-500">
                    <Wind className="size-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-slate-400">Humidity</p>
                    <p className="font-semibold text-slate-900">{selectedLog.humidity}</p>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-500">
                    <Activity className="size-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase text-slate-400">Gas/Sensor Level</p>
                    <p className="font-semibold text-slate-900">{selectedLog.gasLevel} <span className="text-xs font-normal text-slate-500">(Stable)</span></p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Rover State</h4>
              <div className="flex items-center gap-4 rounded-2xl bg-slate-900 p-4 text-white">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10">
                  <Activity className="size-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Motor Runtime</p>
                  <p className="font-bold text-white">Detected at {selectedLog.motorRuntime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}
