import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Modal, Field, DataTable, EmptyRow, PageHeader } from '../components/UI'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import clsx from 'clsx'

const CATS = ['Raw Materials','Safety Equipment','Finished Goods','Tools']
const UOMS = ['pcs','kg','ltr','mtr','box','roll']
const EMPTY = { name:'', sku:'', cat:'Raw Materials', uom:'pcs', stock:'', reorder:'' }

function StockBadge({ p }) {
  if (p.stock===0)           return <span className="badge badge-out">Out</span>
  if (p.stock<=p.reorder)    return <span className="badge badge-low">Low</span>
  return <span className="badge badge-ok">OK</span>
}

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useStore()
  const [modal, setModal] = useState(false)
  const [editId,setEditId]= useState(null)
  const [form, setForm]   = useState(EMPTY)
  const [q, setQ]         = useState('')
  const [cat, setCat]     = useState('')

  const filtered = products.filter(p => {
    const mq = !q   || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())
    const mc = !cat || p.cat===cat
    return mq && mc
  })

  const openCreate = () => { setEditId(null); setForm(EMPTY); setModal(true) }
  const openEdit   = p  => { setEditId(p.id); setForm({ ...p }); setModal(true) }

  const submit = () => {
    if (!form.name.trim()||!form.sku.trim()) { showToast('Name and SKU required','error'); return }
    if (editId) {
      updateProduct(editId, { ...form, stock:parseInt(form.stock)||0, reorder:parseInt(form.reorder)||0 })
      showToast('Product updated','info')
    } else {
      addProduct(form)
      showToast(`Created: ${form.name}`,'success')
    }
    setModal(false)
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Products"
        subtitle="Manage product catalogue and stock levels"
        action={<button className="btn-primary" onClick={openCreate}><Plus size={14}/>New Product</button>}
      />

      <div className="flex gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/>
          <input className="input-field pl-8 py-2 w-72 text-sm" placeholder="Search name or SKU…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <select className="select-field text-sm py-2" value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATS.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>

      <DataTable headers={['SKU','Name','Category','UoM','Stock','Min. Stock','Status','Actions']}>
        {filtered.length===0
          ? <EmptyRow icon="📦" text="No products found" cols={8}/>
          : filtered.map(p => (
            <tr key={p.id} className="table-row">
              <td className="table-td font-mono text-xs text-accent">{p.sku}</td>
              <td className="table-td text-text font-medium">{p.name}</td>
              <td className="table-td text-dim text-sm">{p.cat}</td>
              <td className="table-td text-dim text-sm">{p.uom}</td>
              <td className="table-td">
                <span className={clsx('font-mono font-semibold', p.stock===0?'text-danger':p.stock<=p.reorder?'text-warning':'text-success')}>
                  {p.stock}
                </span>
                <span className="text-muted text-xs ml-1">{p.uom}</span>
              </td>
              <td className="table-td font-mono text-dim text-sm">{p.reorder}</td>
              <td className="table-td"><StockBadge p={p}/></td>
              <td className="table-td">
                <div className="flex items-center gap-3">
                  <button onClick={()=>openEdit(p)} className="text-xs text-accentLt hover:underline font-mono flex items-center gap-1"><Pencil size={10}/>Edit</button>
                  <button onClick={()=>{ deleteProduct(p.id); showToast('Deleted','error') }} className="text-xs text-danger hover:underline font-mono flex items-center gap-1"><Trash2 size={10}/>Del</button>
                </div>
              </td>
            </tr>
          ))
        }
      </DataTable>

      <Modal open={modal} onClose={()=>setModal(false)} title={editId ? 'Edit Product' : 'New Product'}>
        <div className="space-y-4">
          <Field label="Product Name *"><input className="input-field" placeholder="e.g. Steel Rods 10mm" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU / Code *"><input className="input-field" placeholder="STL-010" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/></Field>
            <Field label="Unit of Measure">
              <select className="select-field w-full" value={form.uom} onChange={e=>setForm({...form,uom:e.target.value})}>
                {UOMS.map(u=><option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select className="select-field w-full" value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Initial Stock"><input className="input-field" type="number" placeholder="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></Field>
          </div>
          <Field label="Reorder Point (Min)"><input className="input-field" type="number" placeholder="20" value={form.reorder} onChange={e=>setForm({...form,reorder:e.target.value})}/></Field>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="btn-primary flex-1" onClick={submit}>{editId?'Save Changes':'Create Product'}</button>
          <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
