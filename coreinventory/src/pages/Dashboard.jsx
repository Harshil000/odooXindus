import { useStore } from '../store/useStore'
import { Badge } from '../components/UI'
import { useNavigate } from 'react-router-dom'
import { Package, AlertTriangle, XCircle, ArrowDownToLine, ArrowUpFromLine, TrendingUp, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

const RECENT = [
  { ref:'RCP-001', type:'Receipt',    product:'Steel Rods 10mm', qty:'+100 kg',  status:'Done',    date:'Mar 10' },
  { ref:'DEL-001', type:'Delivery',   product:'Steel Rods 10mm', qty:'-20 kg',   status:'Ready',   date:'Mar 11' },
  { ref:'TRF-001', type:'Transfer',   product:'Steel Rods 10mm', qty:'30 kg',    status:'Ready',   date:'Mar 10' },
  { ref:'ADJ-001', type:'Adjustment', product:'Steel Rods 10mm', qty:'-3 kg',    status:'Done',    date:'Mar 12' },
  { ref:'RCP-002', type:'Receipt',    product:'Copper Wire 2mm', qty:'+200 mtr', status:'Waiting', date:'Mar 12' },
  { ref:'DEL-002', type:'Delivery',   product:'Bolts M8',        qty:'-200 pcs', status:'Waiting', date:'Mar 13' },
]

function qc(q) {
  if (q.startsWith('+')) return 'text-success font-mono font-semibold'
  if (q.startsWith('-')) return 'text-danger  font-mono font-semibold'
  return 'text-info font-mono font-semibold'
}

export default function Dashboard() {
  const { products } = useStore()
  const navigate = useNavigate()

  const low = products.filter(p => p.stock > 0 && p.stock <= p.reorder)
  const out = products.filter(p => p.stock === 0)
  const alerts = [...out, ...low]

  const KPIS = [
    { label:'Total Products',     val:products.length, sub:'In catalog',       icon:Package,         c:'text-textLt',  bg:'bg-card' },
    { label:'Low Stock',          val:low.length,      sub:'Need reorder',     icon:AlertTriangle,   c:'text-warning', bg:'bg-warning/8' },
    { label:'Out of Stock',       val:out.length,      sub:'Action needed',    icon:XCircle,         c:'text-danger',  bg:'bg-danger/8' },
    { label:'Pending Receipts',   val:7,               sub:'Awaiting arrival', icon:ArrowDownToLine, c:'text-info',    bg:'bg-info/8' },
    { label:'Pending Deliveries', val:5,               sub:'Ready to ship',    icon:ArrowUpFromLine, c:'text-accent',  bg:'bg-accent/8' },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        {KPIS.map(k => (
          <div key={k.label} className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-mono text-muted uppercase tracking-widest leading-tight">{k.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg}`}>
                <k.icon size={14} className={k.c}/>
              </div>
            </div>
            <div className={`text-3xl font-bold font-mono ${k.c}`}>{k.val}</div>
            <div className="text-xs text-muted mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono text-muted uppercase tracking-widest">Filter:</span>
        {['All Types','Receipts','Delivery','Internal','Adjustments'].map((f,i) => (
          <button key={f} className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors
            ${i===0 ? 'border-accent text-accentLt bg-accent/6' : 'border-border text-muted hover:border-accent/50 hover:text-dim'}`}>
            {f}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <select className="select-field text-xs py-1.5 px-3">
            <option>All Status</option>
            <option>Draft</option><option>Waiting</option><option>Ready</option><option>Done</option>
          </select>
          <select className="select-field text-xs py-1.5 px-3">
            <option>All Warehouses</option>
            <option>Main Warehouse</option><option>Production Floor</option><option>Warehouse B</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent ops */}
        <div className="col-span-2 card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <span className="font-serif font-semibold text-textLt flex items-center gap-2">
              <TrendingUp size={14} className="text-accent"/> Recent Operations
            </span>
            <button onClick={()=>navigate('/history')} className="text-xs text-accentLt font-mono hover:underline flex items-center gap-1">
              View All <ArrowRight size={11}/>
            </button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {['Ref','Type','Product','Qty','Status','Date'].map(h=>(
                <th key={h} className="table-th">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {RECENT.map(r => (
                <tr key={r.ref} className="table-row">
                  <td className="table-td font-mono text-xs text-accent">{r.ref}</td>
                  <td className="table-td text-dim text-xs">{r.type}</td>
                  <td className="table-td text-text">{r.product}</td>
                  <td className={clsx('table-td text-sm', qc(r.qty))}>{r.qty}</td>
                  <td className="table-td"><Badge status={r.status}/></td>
                  <td className="table-td text-dim text-xs">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
              <AlertTriangle size={13} className="text-warning"/>
              <span className="font-serif font-semibold text-textLt text-sm">Stock Alerts</span>
              <span className="ml-auto font-mono text-xs bg-warning/10 text-warning px-1.5 py-0.5 rounded">{alerts.length}</span>
            </div>
            <div className="p-4 space-y-2.5">
              {alerts.slice(0,4).map(p => (
                <div key={p.sku} className={p.stock===0
                  ? 'bg-danger/6 border border-danger/15 rounded-lg p-3'
                  : 'bg-warning/6 border border-warning/15 rounded-lg p-3'}>
                  <div className={`text-xs font-mono font-bold ${p.stock===0?'text-danger':'text-warning'}`}>
                    {p.stock===0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                  </div>
                  <div className="text-sm text-text mt-0.5 font-medium">{p.name}</div>
                  <div className="text-xs text-muted">{p.sku} · {p.stock} {p.uom} left</div>
                </div>
              ))}
              {alerts.length===0 && (
                <p className="text-center text-muted text-xs font-mono py-4">All levels OK ✓</p>
              )}
            </div>
          </div>

          {/* Scheduled transfers */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <span className="font-serif font-semibold text-textLt text-sm">Scheduled Transfers</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { from:'Main WH',to:'Production',product:'Steel Rods',qty:'30 pcs',status:'Ready'   },
                { from:'Rack A', to:'Rack B',    product:'Bolts M8',  qty:'500 pcs',status:'Waiting' },
              ].map((t,i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-dim">{t.from} → {t.to}</div>
                    <div className="text-sm text-text font-medium">{t.product} · {t.qty}</div>
                  </div>
                  <Badge status={t.status}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
