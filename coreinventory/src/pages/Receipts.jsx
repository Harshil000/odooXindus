// import { useState } from 'react'
// import { useStore } from '../store/useStore'
// import { Modal, Field, Badge, DataTable, EmptyRow, PageHeader } from '../components/UI'
// import { Plus, CheckCircle } from 'lucide-react'

// const WHS = ['Main Warehouse','Production Floor','Warehouse B']

// export default function Receipts() {
//   const { receipts, products, addReceipt, validateReceipt, showToast } = useStore()
//   const [modal, setModal] = useState(false)
//   const [form, setForm]   = useState({ supplier:'', product:'', qty:'', wh:'Main Warehouse' })

//   const submit = (status) => {
//     if (!form.supplier.trim()||!form.product||!form.qty) { showToast('Supplier, product and quantity required','error'); return }
//     const ref = addReceipt({ ...form, qty:parseInt(form.qty), status })
//     showToast(status==='Done' ? `${ref} validated — Stock +${form.qty}` : `${ref} saved as Draft`, status==='Done'?'success':'info')
//     setModal(false)
//     setForm({ supplier:'', product:'', qty:'', wh:'Main Warehouse' })
//   }

//   return (
//     <div className="p-6 space-y-5 animate-fade-in">
//       <PageHeader
//         title="Receipts — Incoming Stock"
//         subtitle="Record goods arriving from vendors. Validate to auto-increase stock."
//         action={<button className="btn-primary" onClick={()=>setModal(true)}><Plus size={14}/>New Receipt</button>}
//       />
//       <DataTable headers={['Ref #','Supplier','Product','Qty','Warehouse','Status','Date','Action']}>
//         {receipts.length===0 ? <EmptyRow icon="📥" text="No receipts yet" cols={8}/> :
//           receipts.map(r => (
//             <tr key={r.ref} className="table-row">
//               <td className="table-td font-mono text-xs text-accent">{r.ref}</td>
//               <td className="table-td text-text font-medium">{r.supplier}</td>
//               <td className="table-td text-dim text-sm">{r.product}</td>
//               <td className="table-td font-mono text-success font-semibold">+{r.qty}</td>
//               <td className="table-td text-dim text-xs">{r.wh}</td>
//               <td className="table-td"><Badge status={r.status}/></td>
//               <td className="table-td text-dim text-xs">{r.date}</td>
//               <td className="table-td">
//                 {r.status!=='Done'
//                   ? <button onClick={()=>{ validateReceipt(r.ref); showToast(`${r.ref} validated`,'success') }}
//                       className="text-xs text-success hover:underline font-mono flex items-center gap-1">
//                       <CheckCircle size={11}/>Validate
//                     </button>
//                   : <span className="text-xs text-muted font-mono">Done ✓</span>
//                 }
//               </td>
//             </tr>
//           ))
//         }
//       </DataTable>

//       <Modal open={modal} onClose={()=>setModal(false)} title="New Receipt">
//         <div className="space-y-4">
//           <Field label="Supplier Name *"><input className="input-field" placeholder="e.g. ArcelorMittal India" value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})}/></Field>
//           <Field label="Product *">
//             <select className="select-field w-full" value={form.product} onChange={e=>setForm({...form,product:e.target.value})}>
//               <option value="">Select product…</option>
//               {products.map(p=><option key={p.id}>{p.name}</option>)}
//             </select>
//           </Field>
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Quantity *"><input className="input-field" type="number" placeholder="100" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})}/></Field>
            
//             <Field label="Warehouse">
//               <select className="select-field w-full" value={form.wh} onChange={e=>setForm({...form,wh:e.target.value})}>
//                 {WHS.map(w=><option key={w}>{w}</option>)}
//               </select>
//             </Field>
//           </div>
//           <div className="bg-info/6 border border-info/15 rounded-lg p-3 text-xs text-dim font-mono">
//             ℹ Validating will automatically increase stock.
//           </div>
//         </div>
//         <div className="flex gap-2 mt-6">
//           <button className="btn-ghost flex-1" onClick={()=>submit('Draft')}>Save Draft</button>
//           <button className="btn-primary" style={{background:'#4e7c5f'}} onClick={()=>submit('Done')}><CheckCircle size={13}/>Validate</button>
//           <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
//         </div>
//       </Modal>
//     </div>
//   )
// }

import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Modal, Field, Badge, DataTable, EmptyRow, PageHeader } from '../components/UI'
import { Plus, CheckCircle } from 'lucide-react'

const WHS = ['Main Warehouse','Production Floor','Warehouse B']
const STATUSES = ['Draft', 'Waiting', 'Done']

export default function Receipts() {
  const { receipts, products, addReceipt, validateReceipt, showToast } = useStore()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({ supplier:'', product:'', qty:'', wh:'Main Warehouse', status:'Draft' })

  const submit = () => {
    if (!form.supplier.trim()||!form.product||!form.qty) { showToast('Supplier, product and quantity required','error'); return }
    const ref = addReceipt({ ...form, qty:parseInt(form.qty), status: form.status })
    showToast(form.status==='Done' ? `${ref} validated — Stock +${form.qty}` : `${ref} saved as ${form.status}`, form.status==='Done'?'success':'info')
    setModal(false)
    setForm({ supplier:'', product:'', qty:'', wh:'Main Warehouse', status:'Draft' })
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Receipts — Incoming Stock"
        subtitle="Record goods arriving from vendors. Validate to auto-increase stock."
        action={<button className="btn-primary" onClick={()=>setModal(true)}><Plus size={14}/>New Receipt</button>}
      />
      <DataTable headers={['Ref #','Supplier','Product','Qty','Warehouse','Status','Date','Action']}>
        {receipts.length===0 ? <EmptyRow icon="📥" text="No receipts yet" cols={8}/> :
          receipts.map(r => (
            <tr key={r.ref} className="table-row">
              <td className="table-td font-mono text-xs text-accent">{r.ref}</td>
              <td className="table-td text-text font-medium">{r.supplier}</td>
              <td className="table-td text-dim text-sm">{r.product}</td>
              <td className="table-td font-mono text-success font-semibold">+{r.qty}</td>
              <td className="table-td text-dim text-xs">{r.wh}</td>
              <td className="table-td"><Badge status={r.status}/></td>
              <td className="table-td text-dim text-xs">{r.date}</td>
              <td className="table-td">
                {r.status!=='Done'
                  ? <button onClick={()=>{ validateReceipt(r.ref); showToast(`${r.ref} validated`,'success') }}
                      className="text-xs text-success hover:underline font-mono flex items-center gap-1">
                      <CheckCircle size={11}/>Validate
                    </button>
                  : <span className="text-xs text-muted font-mono">Done ✓</span>
                }
              </td>
            </tr>
          ))
        }
      </DataTable>

      <Modal open={modal} onClose={()=>setModal(false)} title="New Receipt">
        <div className="space-y-4">
          <Field label="Supplier Name *"><input className="input-field" placeholder="e.g. ArcelorMittal India" value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})}/></Field>
          <Field label="Product *">
            <select className="select-field w-full" value={form.product} onChange={e=>setForm({...form,product:e.target.value})}>
              <option value="">Select product…</option>
              {products.map(p=><option key={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity *"><input className="input-field" type="number" placeholder="100" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})}/></Field>
            <Field label="Warehouse">
              <select className="select-field w-full" value={form.wh} onChange={e=>setForm({...form,wh:e.target.value})}>
                {WHS.map(w=><option key={w}>{w}</option>)}
              </select>
            </Field>
          </div>

          {/* ── Status dropdown ── */}
          <Field label="Status *">
            <select
              className="select-field w-full"
              value={form.status}
              onChange={e=>setForm({...form, status:e.target.value})}
            >
              {STATUSES.map(s=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <div className="bg-info/6 border border-info/15 rounded-lg p-3 text-xs text-dim font-mono">
            ℹ Validating will automatically increase stock.
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button className="btn-primary w-full" onClick={submit}>
            <CheckCircle size={13}/>Submit Receipt
          </button>
          <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}