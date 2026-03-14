import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Field } from '../components/UI'
import { User, Shield, Bell, LogOut, Save } from 'lucide-react'

export default function Profile() {
  const { user, logout, showToast } = useStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name:      user?.name  || '',
    email:     user?.email || '',
    role:      user?.role  || 'Staff Member',
    warehouse: 'Main Warehouse',
    newPwd:    '',
  })

  const initials = (form.name || 'U')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const handleSave = () => showToast('Profile updated successfully', 'success')

  const handleLogout = () => {
    logout()
    showToast('Signed out', 'info')
    navigate('/login')
  }

  const NOTIFS = [
    { label: 'Low stock alerts',       desc: 'Notify when stock drops below reorder point' },
    { label: 'Receipt validations',    desc: 'Alert when a receipt is ready to validate'   },
    { label: 'Delivery order updates', desc: 'Track status changes on delivery orders'     },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-sub">Manage your account settings and preferences</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center
                        text-bg font-bold text-2xl font-mono shadow-lg shadow-accent/15 flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-serif text-xl font-semibold text-textLt truncate">{form.name || 'User'}</div>
          <div className="text-sm text-dim">{form.role}</div>
          <div className="text-sm text-muted font-mono truncate">{form.email}</div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="badge bg-success/10 text-success border border-success/20">Active</span>
          <span className="text-xs text-muted font-mono">Today</span>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-6 space-y-5">

        {/* ─── Account details ─── */}
        <div className="flex items-center gap-2">
          <User size={14} className="text-accent"/>
          <span className="text-xs font-mono text-muted uppercase tracking-widest">Account Details</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name">
            <input
              className="input-field"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Role">
            <select
              className="select-field w-full"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option>Staff Member</option>
              <option>Inventory Manager</option>
            </select>
          </Field>
        </div>

        <Field label="Email Address">
          <input
            className="input-field"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </Field>

        <Field label="Default Warehouse">
          <select
            className="select-field w-full"
            value={form.warehouse}
            onChange={e => setForm({ ...form, warehouse: e.target.value })}
          >
            <option>Main Warehouse</option>
            <option>Production Floor</option>
            <option>Warehouse B</option>
          </select>
        </Field>

        {/* ─── Security ─── */}
        <div className="border-t border-border pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-accent"/>
            <span className="text-xs font-mono text-muted uppercase tracking-widest">Security</span>
          </div>
          <Field label="New Password">
            <input
              className="input-field"
              type="password"
              placeholder="Leave blank to keep current"
              value={form.newPwd}
              onChange={e => setForm({ ...form, newPwd: e.target.value })}
            />
          </Field>
        </div>

        {/* ─── Notifications ─── */}
        <div className="border-t border-border pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-accent"/>
            <span className="text-xs font-mono text-muted uppercase tracking-widest">Notifications</span>
          </div>
          <div className="space-y-2.5">
            {NOTIFS.map(n => (
              <label
                key={n.label}
                className="flex items-center justify-between p-3 bg-bg rounded-lg border
                           border-border cursor-pointer hover:border-accent/30 transition-colors"
              >
                <div>
                  <div className="text-sm text-text font-medium">{n.label}</div>
                  <div className="text-xs text-muted">{n.desc}</div>
                </div>
                {/* toggle */}
                <div className="relative flex-shrink-0 ml-4">
                  <input type="checkbox" defaultChecked className="sr-only peer"/>
                  <div className="w-9 h-5 bg-border rounded-full peer-checked:bg-accent transition-colors duration-200 cursor-pointer"/>
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-surface rounded-full shadow
                                  transition-transform duration-200 peer-checked:translate-x-4"/>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ─── Actions ─── */}
        <div className="flex gap-3 pt-1">
          <button className="btn-primary" onClick={handleSave}>
            <Save size={14}/> Save Changes
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
