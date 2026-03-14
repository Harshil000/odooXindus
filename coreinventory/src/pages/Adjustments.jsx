import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Modal, Field, Badge, DataTable, EmptyRow, PageHeader } from '../components/UI'
import { Plus } from 'lucide-react'
import clsx from 'clsx'

const LOCS = ['Main Warehouse','Production Floor','Rack A','Rack B','Warehouse B']

export default function Adjustments() {
  const { adjustments, products, addAdjustment, showToast } = useStore()
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ product:'', location:'Main Warehouse', counted:'' })

  const selected  = products.find(p => p.name === form.product)
  const recorded  = selected?.stock ?? 0
  const counted   = form.counted !== '' ? parseInt(form.counted) : null
  const diff      = counted !== null ? counted - recorded : null

  const submit = () => {
    if (!form.product || form.counted === '') { showToast('Product and physical count required', 'error'); return }
    addAdjustment({ product: form.product, location: form.location, recorded, counted: parseInt(form.counted) })
    showToast(`Adjustment applied — stock set to ${form.counted}`, 'success')
    setModal(false)
    setForm({ product:'', location:'Main Warehouse', counted:'' })
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Stock Adjustments"
        subtitle="Correct mismatches between system records and physical count. Auto-logged to ledger."
        action={<button className="btn-primary" onClick={() => setModal(true)}><Plus size={14}/>New Adjustment</button>}
      />

      <DataTable headers={['Ref #', 'Product', 'Location', 'Recorded', 'Counted', 'Difference', 'Status']}>
        {adjustments.length === 0
          ? <EmptyRow icon="⚖️" text="No adjustments recorded" cols={7}/>
          : adjustments.map(a => {
              const d = a.counted - a.recorded
              return (
                <tr key={a.ref} className="table-row">
                  <td className="table-td font-mono text-xs text-accent">{a.ref}</td>
                  <td className="table-td text-text font-medium">{a.product}</td>
                  <td className="table-td text-dim text-sm">{a.location}</td>
                  <td className="table-td font-mono text-dim">{a.recorded}</td>
                  <td className="table-td font-mono text-textLt font-semibold">{a.counted}</td>
                  <td className={clsx('table-td font-mono font-bold', d >= 0 ? 'text-success' : 'text-danger')}>
                    {d >= 0 ? '+' : ''}{d}
                  </td>
                  <td className="table-td"><Badge status={a.status}/></td>
                </tr>
              )
            })
        }
      </DataTable>

      <Modal open={modal} onClose={() => setModal(false)} title="New Stock Adjustment">
        <div className="space-y-4">
          <Field label="Product *">
            <select
              className="select-field w-full"
              value={form.product}
              onChange={e => setForm({ ...form, product: e.target.value })}
            >
              <option value="">Select product…</option>
              {products.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </Field>

          <Field label="Location">
            <select
              className="select-field w-full"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            >
              {LOCS.map(l => <option key={l}>{l}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Recorded Qty (System)">
              <input
                className="input-field opacity-50 cursor-not-allowed"
                readOnly
                value={selected ? recorded : '—'}
              />
            </Field>
            <Field label="Physical Count *">
              <input
                className="input-field"
                type="number"
                placeholder="Enter actual count"
                value={form.counted}
                onChange={e => setForm({ ...form, counted: e.target.value })}
              />
            </Field>
          </div>

          {/* Live diff display */}
          {diff !== null && (
            <div className={clsx(
              'rounded-lg p-3 text-sm font-mono font-semibold border transition-all',
              diff === 0
                ? 'bg-surface border-border text-muted'
                : diff > 0
                  ? 'bg-success/6 border-success/20 text-success'
                  : 'bg-danger/6  border-danger/20  text-danger'
            )}>
              Difference: {diff > 0 ? '+' : ''}{diff} {selected?.uom || 'units'}
              {diff === 0 && '  — no change'}
            </div>
          )}

          <div className="bg-info/6 border border-info/15 rounded-lg p-3 text-xs text-dim font-mono">
            ℹ System stock will be updated to the physical count and the change logged.
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn-primary flex-1" onClick={submit}>Apply Adjustment</button>
          <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
