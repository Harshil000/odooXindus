import { create } from 'zustand'

const todayStr = () => new Date().toISOString().slice(0, 10)
const nowStr   = () => new Date().toLocaleString('en-IN', { hour12:false }).slice(0, 16)

let counters = { RCP:4, DEL:3, TRF:3, ADJ:3 }
const nextRef = (p) => `${p}-${String(counters[p]++).padStart(3,'0')}`

export const useStore = create((set, get) => ({

  // ── AUTH ─────────────────────────────────────────────────
  user: null,
  login:  (u) => set({ user: u }),
  logout: ()  => set({ user: null }),

  // ── PRODUCTS ─────────────────────────────────────────────
  products: [
    { id:1, sku:'STL-010', name:'Steel Rods 10mm',  cat:'Raw Materials',    uom:'kg',   stock:95,  reorder:20  },
    { id:2, sku:'CPW-002', name:'Copper Wire 2mm',  cat:'Raw Materials',    uom:'mtr',  stock:0,   reorder:50  },
    { id:3, sku:'PVC-401', name:'PVC Pipe 4in',     cat:'Raw Materials',    uom:'pcs',  stock:0,   reorder:30  },
    { id:4, sku:'SFG-L01', name:'Safety Gloves L',  cat:'Safety Equipment', uom:'pcs',  stock:8,   reorder:25  },
    { id:5, sku:'BLT-M08', name:'Bolts M8',         cat:'Raw Materials',    uom:'pcs',  stock:500, reorder:100 },
    { id:6, sku:'WRN-002', name:'Warning Tape',     cat:'Safety Equipment', uom:'roll', stock:45,  reorder:10  },
    { id:7, sku:'HMR-001', name:'Hammer 500g',      cat:'Tools',            uom:'pcs',  stock:22,  reorder:5   },
  ],
  addProduct:    (p)   => set(s => ({ products: [...s.products, { ...p, id:Date.now(), stock:parseInt(p.stock)||0, reorder:parseInt(p.reorder)||0 }] })),
  updateProduct: (id,d)=> set(s => ({ products: s.products.map(p => p.id===id ? { ...p,...d } : p) })),
  deleteProduct: (id)  => set(s => ({ products: s.products.filter(p => p.id!==id) })),
  adjustStock:   (name,delta) => set(s => ({ products: s.products.map(p => p.name===name ? { ...p, stock:Math.max(0,p.stock+delta) } : p) })),
  setStockTo:    (name,qty)   => set(s => ({ products: s.products.map(p => p.name===name ? { ...p, stock:qty } : p) })),

  // ── RECEIPTS ─────────────────────────────────────────────
  receipts: [
    { ref:'RCP-001', supplier:'ArcelorMittal India', product:'Steel Rods 10mm', qty:100, wh:'Main Warehouse', status:'Done',    date:'2025-03-10' },
    { ref:'RCP-002', supplier:'Havells Ltd',          product:'Copper Wire 2mm', qty:200, wh:'Main Warehouse', status:'Waiting', date:'2025-03-12' },
    { ref:'RCP-003', supplier:'Supreme Industries',   product:'PVC Pipe 4in',    qty:50,  wh:'Warehouse B',    status:'Draft',   date:'2025-03-13' },
  ],
  addReceipt: (r) => {
    const ref = nextRef('RCP')
    const rec = { ref, ...r, date:todayStr() }
    set(s => ({ receipts:[rec,...s.receipts] }))
    if (r.status==='Done') {
      get().adjustStock(r.product, parseInt(r.qty))
      get().logMove({ type:'Receipt', ref, product:r.product, qty:`+${r.qty}`, from:'Vendor', to:r.wh })
    }
    return ref
  },
  validateReceipt: (ref) => {
    const rec = get().receipts.find(r => r.ref===ref)
    if (!rec || rec.status==='Done') return
    get().adjustStock(rec.product, parseInt(rec.qty))
    get().logMove({ type:'Receipt', ref, product:rec.product, qty:`+${rec.qty}`, from:'Vendor', to:rec.wh })
    set(s => ({ receipts: s.receipts.map(r => r.ref===ref ? { ...r, status:'Done' } : r) }))
  },

  // ── DELIVERIES ───────────────────────────────────────────
  deliveries: [
    { ref:'DEL-001', customer:'Tata Motors',      product:'Steel Rods 10mm', qty:20,  step:'Pack', status:'Ready',   date:'2025-03-11' },
    { ref:'DEL-002', customer:'L&T Construction', product:'Bolts M8',        qty:200, step:'Pick', status:'Waiting', date:'2025-03-13' },
  ],
  addDelivery: (d) => {
    const ref = nextRef('DEL')
    set(s => ({ deliveries:[{ ref,...d, status:'Ready', date:todayStr() },...s.deliveries] }))
    return ref
  },
  validateDelivery: (ref) => {
    const d = get().deliveries.find(x => x.ref===ref)
    if (!d || d.status==='Done') return
    get().adjustStock(d.product, -parseInt(d.qty))
    get().logMove({ type:'Delivery', ref, product:d.product, qty:`-${d.qty}`, from:'Main WH', to:d.customer })
    set(s => ({ deliveries: s.deliveries.map(x => x.ref===ref ? { ...x, status:'Done', step:'Validate' } : x) }))
  },
  advanceStep: (ref) => set(s => {
    const steps = ['Pick','Pack','Validate']
    return { deliveries: s.deliveries.map(d => {
      if (d.ref!==ref) return d
      const i = steps.indexOf(d.step)
      return { ...d, step:steps[Math.min(i+1,2)], status: i>=1 ? 'Ready' : d.status }
    })}
  }),

  // ── TRANSFERS ────────────────────────────────────────────
  transfers: [
    { ref:'TRF-001', product:'Steel Rods 10mm', from:'Main Warehouse', to:'Production Floor', qty:30,  status:'Ready'   },
    { ref:'TRF-002', product:'Bolts M8',         from:'Rack A',         to:'Rack B',           qty:500, status:'Waiting' },
  ],
  addTransfer: (t) => {
    const ref = nextRef('TRF')
    set(s => ({ transfers:[{ ref,...t, status:'Waiting' },...s.transfers] }))
    return ref
  },
  validateTransfer: (ref) => {
    const t = get().transfers.find(x => x.ref===ref)
    if (!t || t.status==='Done') return
    get().logMove({ type:'Transfer', ref, product:t.product, qty:String(t.qty), from:t.from, to:t.to })
    set(s => ({ transfers: s.transfers.map(x => x.ref===ref ? { ...x, status:'Done' } : x) }))
  },

  // ── ADJUSTMENTS ──────────────────────────────────────────
  adjustments: [
    { ref:'ADJ-001', product:'Steel Rods 10mm', location:'Main Warehouse',  recorded:100, counted:97, status:'Done' },
    { ref:'ADJ-002', product:'Safety Gloves L', location:'Production Floor', recorded:25,  counted:8,  status:'Done' },
  ],
  addAdjustment: (a) => {
    const ref = nextRef('ADJ')
    set(s => ({ adjustments:[{ ref,...a, status:'Done' },...s.adjustments] }))
    get().setStockTo(a.product, parseInt(a.counted))
    const diff = parseInt(a.counted)-parseInt(a.recorded)
    get().logMove({ type:'Adjustment', ref, product:a.product, qty:(diff>=0?'+':'')+diff, from:'—', to:a.location })
    return ref
  },

  // ── HISTORY ──────────────────────────────────────────────
  history: [
    { dt:'2025-03-10 09:15', ref:'RCP-001', type:'Receipt',    product:'Steel Rods 10mm', from:'Vendor',  to:'Main WH',     qty:'+100', user:'John D.' },
    { dt:'2025-03-10 11:30', ref:'TRF-001', type:'Transfer',   product:'Steel Rods 10mm', from:'Main WH', to:'Production',  qty:'30',   user:'John D.' },
    { dt:'2025-03-11 14:00', ref:'DEL-001', type:'Delivery',   product:'Steel Rods 10mm', from:'Main WH', to:'Tata Motors', qty:'-20',  user:'John D.' },
    { dt:'2025-03-12 10:00', ref:'ADJ-001', type:'Adjustment', product:'Steel Rods 10mm', from:'—',       to:'Main WH',     qty:'-3',   user:'John D.' },
    { dt:'2025-03-12 15:45', ref:'RCP-002', type:'Receipt',    product:'Copper Wire 2mm', from:'Vendor',  to:'Main WH',     qty:'+200', user:'Admin'   },
  ],
  logMove: ({ type,ref,product,qty,from,to }) => {
    const u = get().user
    set(s => ({ history:[{ dt:nowStr(), ref, type, product, from, to, qty, user: u?.name||'System' },...s.history] }))
  },

  // ── TOAST ────────────────────────────────────────────────
  toast: null,
  showToast: (msg, type='info') => {
    set({ toast:{ msg, type, id:Date.now() } })
    setTimeout(() => set({ toast:null }), 3200)
  },
}))
