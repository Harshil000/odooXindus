import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Modal, Field, Badge, DataTable, EmptyRow, PageHeader } from '../components/UI'
import { Plus, CheckCircle, ArrowRight } from 'lucide-react'

const LOCS = ['Main Warehouse','Production Floor','Rack A','Rack B','Warehouse B']

export default function Transfers() {
  const { transfers, products, addTransfer, validateTransfer, showToast } = useStore()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({ product:'', from:'Main Warehouse', to:'Production Floor', qty:'' })

  const submit = () => {
    if (!form.product||!form.qty) { showToast('Product and quantity required','error'); return }
    if (form.from===form.to)      { showToast('Source and destination must differ','error'); return }
    const ref = addTransfer({ ...form, qty:parseInt(form.qty) })
    showToast(`Transfer ${ref} scheduled`,'info')
    setModal(false)
    setForm({ product:'', from:'Main Warehouse', to:'Production Floor', qty:'' })
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Internal Transfers"
        subtitle="Move stock between locations. Total stock unchanged — only location updated."
        action={<button className="btn-primary" onClick={()=>setModal(true)}><Plus size={14}/>New Transfer</button>}
      />
      <DataTable headers={['Ref #','Product','From','','To','Qty','Status','Action']}>
        {transfers.length===0 ? <EmptyRow icon="🔁" text="No transfers scheduled" cols={8}/> :
          transfers.map(t => (
            <tr key={t.ref} className="table-row">
              <td className="table-td font-mono text-xs text-accent">{t.ref}</td>
              <td className="table-td text-text font-medium">{t.product}</td>
              <td className="table-td text-dim text-sm">{t.from}</td>
              <td className="table-td text-muted"><ArrowRight size={13}/></td>
              <td className="table-td text-dim text-sm">{t.to}</td>
              <td className="table-td font-mono text-info font-semibold">{t.qty}</td>
              <td className="table-td"><Badge status={t.status}/></td>
              <td className="table-td">
                {t.status!=='Done'
                  ? <button onClick={()=>{ validateTransfer(t.ref); showToast(`${t.ref} completed`,'success') }} className="text-xs text-success hover:underline font-mono flex items-center gap-1"><CheckCircle size={11}/>Complete</button>
                  : <span className="text-xs text-muted font-mono">Done ✓</span>
                }
              </td>
            </tr>
          ))
        }
      </DataTable>

      <Modal open={modal} onClose={()=>setModal(false)} title="New Internal Transfer">
        <div className="space-y-4">
          <Field label="Product *">
            <select className="select-field w-full" value={form.product} onChange={e=>setForm({...form,product:e.target.value})}>
              <option value="">Select product…</option>
              {products.map(p=><option key={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="From *">
              <select className="select-field w-full" value={form.from} onChange={e=>setForm({...form,from:e.target.value})}>
                {LOCS.map(l=><option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="To *">
              <select className="select-field w-full" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}>
                {LOCS.map(l=><option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Quantity *"><input className="input-field" type="number" placeholder="30" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})}/></Field>
          <div className="bg-info/6 border border-info/15 rounded-lg p-3 text-xs text-dim font-mono">
            ℹ Total stock stays the same — only the location record is updated.
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="btn-primary flex-1" onClick={submit}>Schedule Transfer</button>
          <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
