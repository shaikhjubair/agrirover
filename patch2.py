import re

with open('components/agri-dashboard.tsx', 'r') as f:
    content = f.read()

# Replace smart diagnostics content with dynamic
smart_diag_old = """<div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-500"><Leaf className="size-7" /></div><div className="min-w-0 flex-1"><div className="flex items-end justify-between gap-3"><div><p className="text-xl font-bold tracking-tight">Early Blight</p><p className="mt-1 text-xs text-slate-500">Tomato · North bed · Row 04</p></div><span className="text-2xl font-bold text-rose-500">96<span className="text-sm">%</span></span></div><Progress value={96} className="mt-3 h-2 bg-rose-100 [&>div]:bg-rose-500" /><div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900"><span className="font-bold">Treatment recommendation: </span>Isolate affected plants and apply an approved copper fungicide within 24 hours.</div></div></div>"""

smart_diag_new = """<div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className={`grid size-16 shrink-0 place-items-center rounded-2xl ${aiStatus.status === 'Clear' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}><Leaf className="size-7" /></div><div className="min-w-0 flex-1"><div className="flex items-end justify-between gap-3"><div><p className="text-xl font-bold tracking-tight">{aiStatus.status === 'Loading...' ? 'Loading...' : (aiStatus.status === 'Clear' ? 'Healthy Crop' : aiStatus.status)}</p><p className="mt-1 text-xs text-slate-500">Live AI Feed</p></div><span className={`text-2xl font-bold ${aiStatus.status === 'Clear' ? 'text-emerald-500' : 'text-rose-500'}`}>{aiStatus.confidence}<span className="text-sm">%</span></span></div><Progress value={aiStatus.confidence} className={`mt-3 h-2 ${aiStatus.status === 'Clear' ? 'bg-emerald-100 [&>div]:bg-emerald-500' : 'bg-rose-100 [&>div]:bg-rose-500'}`} />{aiStatus.status !== 'Clear' && aiStatus.status !== 'Loading...' && <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900"><span className="font-bold">Treatment recommendation: </span>Action required for detected anomaly.</div>}</div></div>"""

content = content.replace(smart_diag_old, smart_diag_new)

with open('components/agri-dashboard.tsx', 'w') as f:
    f.write(content)

