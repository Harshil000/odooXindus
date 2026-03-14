// import { useState } from 'react'
// import { useStore } from '../store/useStore'
// import { Modal, Field, Badge, DataTable, EmptyRow, PageHeader } from '../components/UI'
// import { Plus, CheckCircle, ChevronRight } from 'lucide-react'

// const STEPS = ['Pick','Pack','Validate']

// export default function Delivery() {
//   const { deliveries, products, addDelivery, validateDelivery, advanceStep, showToast } = useStore()
//   const [modal, setModal] = useState(false)
//   const [form, setForm]   = useState({ customer:'', product:'', qty:'', step:'Pick' })

//   const submit = () => {
//     if (!form.customer.trim()||!form.product||!form.qty) { showToast('Customer, product and qty required','error'); return }
//     const ref = addDelivery({ ...form, qty:parseInt(form.qty) })
//     showToast(`Delivery order ${ref} created`,'success')
//     setModal(false)
//     setForm({ customer:'', product:'', qty:'', step:'Pick' })
//   }

//   return (
//     <div className="p-6 space-y-5 animate-fade-in">
//       <PageHeader
//         title="Delivery Orders — Outgoing"
//         subtitle="Pick → Pack → Validate. Stock decreases on validation."
//         action={<button className="btn-primary" onClick={()=>setModal(true)}><Plus size={14}/>New Delivery</button>}
//       />
//       <DataTable headers={['Ref #','Customer','Product','Qty','Step','Status','Date','Actions']}>
//         {deliveries.length===0 ? <EmptyRow icon="📤" text="No delivery orders" cols={8}/> :
//           deliveries.map(d => {
//             const si = STEPS.indexOf(d.step)
//             return (
//               <tr key={d.ref} className="table-row">
//                 <td className="table-td font-mono text-xs text-accent">{d.ref}</td>
//                 <td className="table-td text-text font-medium">{d.customer}</td>
//                 <td className="table-td text-dim text-sm">{d.product}</td>
//                 <td className="table-td font-mono text-danger font-semibold">-{d.qty}</td>
//                 <td className="table-td">
//                   <div className="flex items-center gap-1">
//                     {STEPS.map((s,i)=>(
//                       <span key={s} className={`text-xs font-mono px-1.5 py-0.5 rounded transition-colors
//                         ${i<=si?'bg-accent/15 text-accentLt':'bg-border/40 text-muted'}`}>{s}</span>
//                     ))}
//                   </div>
//                 </td>
//                 <td className="table-td"><Badge status={d.status}/></td>
//                 <td className="table-td text-dim text-xs">{d.date}</td>
//                 <td className="table-td">
//                   {d.status!=='Done' ? (
//                     <div className="flex items-center gap-2">
//                       {si<2 && <button onClick={()=>{ advanceStep(d.ref); showToast('Step advanced','info') }} className="text-xs text-info hover:underline font-mono flex items-center gap-0.5"><ChevronRight size={11}/>Next</button>}
//                       <button onClick={()=>{ validateDelivery(d.ref); showToast(`${d.ref} validated`,'success') }} className="text-xs text-success hover:underline font-mono flex items-center gap-0.5"><CheckCircle size={11}/>Validate</button>
//                     </div>
//                   ) : <span className="text-xs text-muted font-mono">Shipped ✓</span>}
//                 </td>
//               </tr>
//             )
//           })
//         }
//       </DataTable>

//       <Modal open={modal} onClose={()=>setModal(false)} title="New Delivery Order">
//         <div className="space-y-4">
//           <Field label="Customer *"><input className="input-field" placeholder="e.g. Tata Motors" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}/></Field>
//           <Field label="Product *">
//             <select className="select-field w-full" value={form.product} onChange={e=>setForm({...form,product:e.target.value})}>
//               <option value="">Select product…</option>
//               {products.map(p=><option key={p.id}>{p.name}</option>)}
//             </select>
//           </Field>
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Quantity *"><input className="input-field" type="number" placeholder="10" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})}/></Field>
//             <Field label="Starting Step">
//               <select className="select-field w-full" value={form.step} onChange={e=>setForm({...form,step:e.target.value})}>
//                 {STEPS.map(s=><option key={s}>{s}</option>)}
//               </select>
//             </Field>
//           </div>
//         </div>
//         <div className="flex gap-3 mt-6">
//           <button className="btn-primary flex-1" onClick={submit}>Create Order</button>
//           <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
//         </div>
//       </Modal>
//     </div>
//   )
// }



import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Modal, Field, Badge, DataTable, EmptyRow, PageHeader } from '../components/UI'
import { Plus, CheckCircle, ChevronRight, Download } from 'lucide-react'

const STEPS = ['Pick','Pack','Validate']

const downloadDelivery = (d) => {
  const content = `
COREINVENTORY — DELIVERY ORDER VOUCHER
=======================================
Ref #      : ${d.ref}
Date       : ${d.date}
Customer   : ${d.customer}
Product    : ${d.product}
Quantity   : -${d.qty}
Step       : ${d.step}
Status     : ${d.status}
=======================================
This delivery order has been validated.
  `.trim()

  const blob = new Blob([content], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${d.ref}-delivery.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Delivery() {
  const { deliveries, products, addDelivery, validateDelivery, advanceStep, showToast } = useStore()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({ customer:'', product:'', qty:'', step:'Pick' })

  const submit = () => {
    if (!form.customer.trim()||!form.product||!form.qty) { showToast('Customer, product and qty required','error'); return }
    const ref = addDelivery({ ...form, qty:parseInt(form.qty) })
    showToast(`Delivery order ${ref} created`,'success')
    setModal(false)
    setForm({ customer:'', product:'', qty:'', step:'Pick' })
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Delivery Orders — Outgoing"
        subtitle="Pick → Pack → Validate. Stock decreases on validation."
        action={<button className="btn-primary" onClick={()=>setModal(true)}><Plus size={14}/>New Delivery</button>}
      />
      <DataTable headers={['Ref #','Customer','Product','Qty','Step','Status','Date','Actions','Download']}>
        {deliveries.length===0 ? <EmptyRow icon="📤" text="No delivery orders" cols={9}/> :
          deliveries.map(d => {
            const si = STEPS.indexOf(d.step)
            return (
              <tr key={d.ref} className="table-row">
                <td className="table-td font-mono text-xs text-accent">{d.ref}</td>
                <td className="table-td text-text font-medium">{d.customer}</td>
                <td className="table-td text-dim text-sm">{d.product}</td>
                <td className="table-td font-mono text-danger font-semibold">-{d.qty}</td>
                <td className="table-td">
                  <div className="flex items-center gap-1">
                    {STEPS.map((s,i)=>(
                      <span key={s} className={`text-xs font-mono px-1.5 py-0.5 rounded transition-colors
                        ${i<=si?'bg-accent/15 text-accentLt':'bg-border/40 text-muted'}`}>{s}</span>
                    ))}
                  </div>
                </td>
                <td className="table-td"><Badge status={d.status}/></td>
                <td className="table-td text-dim text-xs">{d.date}</td>

                {/* Actions */}
                <td className="table-td">
                  {d.status!=='Done' ? (
                    <div className="flex items-center gap-2">
                      {si<2 && <button onClick={()=>{ advanceStep(d.ref); showToast('Step advanced','info') }} className="text-xs text-info hover:underline font-mono flex items-center gap-0.5"><ChevronRight size={11}/>Next</button>}
                      <button onClick={()=>{ validateDelivery(d.ref); showToast(`${d.ref} validated`,'success') }} className="text-xs text-success hover:underline font-mono flex items-center gap-0.5"><CheckCircle size={11}/>Validate</button>
                    </div>
                  ) : <span className="text-xs text-muted font-mono">Shipped ✓</span>}
                </td>

                {/* Download */}
                <td className="table-td">
                  <div className="relative group inline-flex">
                    <button
                      onClick={() => d.status === 'Done' ? downloadDelivery(d) : null}
                      className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded transition-all
                        ${d.status === 'Done'
                          ? 'text-accent hover:text-accentLt hover:underline cursor-pointer'
                          : 'text-muted cursor-not-allowed opacity-50'
                        }`}
                    >
                      <Download size={12}/> PDF
                    </button>
                    {d.status !== 'Done' && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5
                        bg-surface border border-border rounded-lg text-xs text-dim font-mono
                        whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-opacity duration-150 shadow-lg z-10">
                        ⚠ Please complete the process first
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4
                          border-transparent border-t-border"/>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )
          })
        }
      </DataTable>

      <Modal open={modal} onClose={()=>setModal(false)} title="New Delivery Order">
        <div className="space-y-4">
          <Field label="Customer *"><input className="input-field" placeholder="e.g. Tata Motors" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}/></Field>
          <Field label="Product *">
            <select className="select-field w-full" value={form.product} onChange={e=>setForm({...form,product:e.target.value})}>
              <option value="">Select product…</option>
              {products.map(p=><option key={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity *"><input className="input-field" type="number" placeholder="10" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})}/></Field>
            <Field label="Starting Step">
              <select className="select-field w-full" value={form.step} onChange={e=>setForm({...form,step:e.target.value})}>
                {STEPS.map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="btn-primary flex-1" onClick={submit}>Create Order</button>
          <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}