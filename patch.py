import re

with open('components/agri-dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add useEffect to imports
content = content.replace("import { useState } from 'react'", "import { useState, useEffect } from 'react'")

# 2. Add state and useEffect inside AgriDashboard
hook_code = """export function AgriDashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [aiStatus, setAiStatus] = useState({ status: 'Loading...', confidence: 0 })

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/status')
        const data = await res.json()
        setAiStatus(data)
      } catch (error) {
        console.error("Failed to fetch API status", error)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])
"""
content = content.replace("export function AgriDashboard() {\n  const [menuOpen, setMenuOpen] = useState(false)\n  const [scanning, setScanning] = useState(false)", hook_code)

# 3. Replace the image and bounding box part
target_img_section = """<div className="group relative aspect-[1.25] overflow-hidden rounded-2xl bg-slate-100"><Image src="/ai-scan.png" alt="AI scan highlighting early blight on a tomato leaf" fill className="object-cover brightness-[0.9] transition duration-700 group-hover:scale-105" /><div className="absolute left-[26%] top-[25%] h-[48%] w-[44%] rounded-xl border-2 border-rose-400 shadow-[0_0_0_999px_rgba(244,63,94,0.04),0_0_22px_rgba(244,63,94,0.5)]"><span className="absolute -top-6 left-0 rounded-md bg-rose-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">Early blight · 96%</span></div><div className="absolute inset-x-0 top-0 flex items-center justify-between p-4"><Badge className="rounded-full border border-white/30 bg-sky-500/85 text-white hover:bg-sky-500/85"><Sparkles className="mr-1.5 size-3" /> AI processed</Badge><span className="rounded-full bg-white/75 px-2 py-1 text-[10px] font-semibold text-sky-700 backdrop-blur-md">4 detections</span></div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-12 text-xs font-medium text-white">Vision model · v2.4</div></div>"""

replacement_img_section = """<div className="group relative aspect-[1.25] overflow-hidden rounded-2xl bg-slate-100"><img src="http://127.0.0.1:5000/video_feed" alt="Live AI stream" className="absolute inset-0 h-full w-full object-cover brightness-[0.9] transition duration-700 group-hover:scale-105" /><div className="absolute left-4 top-14 z-10">{aiStatus.status === 'Loading...' ? <span className="rounded-md bg-slate-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">Loading...</span> : <span className={`rounded-md px-2 py-1 text-[10px] font-bold text-white shadow-lg ${aiStatus.status === 'Clear' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{aiStatus.status} {aiStatus.status !== 'Clear' && `· ${aiStatus.confidence}%`}</span>}</div><div className="absolute inset-x-0 top-0 flex items-center justify-between p-4"><Badge className="rounded-full border border-white/30 bg-sky-500/85 text-white hover:bg-sky-500/85"><Sparkles className="mr-1.5 size-3" /> AI processed</Badge><span className="rounded-full bg-white/75 px-2 py-1 text-[10px] font-semibold text-sky-700 backdrop-blur-md">{aiStatus.status === 'Clear' ? '0 detections' : '1 detection'}</span></div><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-12 text-xs font-medium text-white">Vision model · v2.4</div></div>"""

content = content.replace(target_img_section, replacement_img_section)

with open('components/agri-dashboard.tsx', 'w') as f:
    f.write(content)

