// import { useState, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useStore } from '../store/useStore'
// import { Eye, EyeOff, Package, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react'

// // ── tiny reusable label+input ────────────────────────────────────
// function F({ label, children }) {
//   return (
//     <div>
//       <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">{label}</label>
//       {children}
//     </div>
//   )
// }

// // ── password input with show/hide ────────────────────────────────
// function PwdInput({ placeholder, value, onChange, match }) {
//   const [show, setShow] = useState(false)
//   return (
//     <div className="relative">
//       <input
//         type={show ? 'text' : 'password'}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//         className={`auth-input pr-20 ${match===false ? 'border-danger/60' : ''}`}
//       />
//       <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
//         {match===true  && <CheckCircle2 size={14} className="text-success" />}
//         {match===false && <span className="text-danger text-xs font-mono">✕</span>}
//         <button type="button" onClick={() => setShow(v => !v)} className="text-muted hover:text-dim transition-colors">
//           {show ? <EyeOff size={15}/> : <Eye size={15}/>}
//         </button>
//       </div>
//     </div>
//   )
// }

// // ── Left branding panel ──────────────────────────────────────────
// function BrandPanel() {
//   return (
//     <div className="hidden lg:flex w-[46%] bg-surface border-r border-border flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
//       {/* subtle grid texture */}
//       <div className="absolute inset-0 pointer-events-none"
//         style={{
//           backgroundImage:'linear-gradient(rgba(156,128,96,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(156,128,96,0.04) 1px, transparent 1px)',
//           backgroundSize:'48px 48px'
//         }}
//       />
//       {/* faint vignette */}
//       <div className="absolute inset-0 pointer-events-none"
//         style={{background:'radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(24,26,29,0.6) 100%)'}}
//       />

//       {/* Logo */}
//       <div className="relative flex items-center gap-3">
//         <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
//           <Package size={19} className="text-bg" />
//         </div>
//         <div>
//           <div className="font-serif font-semibold text-textLt text-lg tracking-tight">CoreInventory</div>
//           <div className="text-xs font-mono text-muted">Inventory Management System</div>
//         </div>
//       </div>

//       {/* Quote */}
//       <div className="relative space-y-7">
//         <div className="w-10 h-px bg-accent/50" />
//         <blockquote className="font-serif text-[2rem] leading-tight text-textLt font-medium">
//           "Every item tracked.<br />Every move logged.<br />
//           <em className="text-accentLt not-italic">Full clarity.</em>"
//         </blockquote>
//         <p className="text-dim text-sm leading-relaxed max-w-xs">
//           Replace scattered registers and spreadsheets with a centralised, real-time platform built for warehouse teams.
//         </p>
//         <div className="space-y-3 pt-1">
//           {[
//             'Multi-warehouse stock tracking',
//             'Receipts, deliveries & transfers',
//             'Physical count adjustments',
//             'Role-based access — Staff & Manager',
//           ].map(f => (
//             <div key={f} className="flex items-center gap-2.5 text-sm text-dim">
//               <div className="w-1 h-1 rounded-full bg-accentLt flex-shrink-0" />
//               {f}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="relative text-xs font-mono text-muted">© 2025 CoreInventory · v1.0</div>
//     </div>
//   )
// }

// // ═══════════════════════════════════════════════════
// //  STEP 0 — ROLE PICKER  (always first)
// // ═══════════════════════════════════════════════════
// function RolePicker({ onNext }) {
//   const [role, setRole] = useState('')
//   const [intent, setIntent] = useState('') // 'login' | 'signup'

//   const ROLES = [
//     { value:'Staff Member',        desc:'Picking, shelving, transfers, counting' },
//     { value:'Inventory Manager',   desc:'Full access — receipts, deliveries, adjustments' },
//   ]

//   const canContinue = role && intent

//   return (
//     <div className="animate-fade-in space-y-7">
//       <div className="text-center space-y-1.5">
//         {/* Mobile logo */}
//         <div className="flex lg:hidden justify-center mb-5">
//           <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
//             <Package size={18} className="text-bg"/>
//           </div>
//         </div>
//         <h1 className="font-serif text-3xl text-textLt font-semibold">Welcome</h1>
//         <p className="text-dim text-sm">Select your role to continue</p>
//       </div>

//       {/* Role cards */}
//       <div className="space-y-3">
//         {ROLES.map(r => (
//           <button
//             key={r.value}
//             onClick={() => setRole(r.value)}
//             className={`w-full text-left p-4 rounded-xl border transition-all duration-150
//               ${role===r.value
//                 ? 'border-accent bg-accent/8 ring-1 ring-accent/20'
//                 : 'border-border bg-card hover:border-accent/40 hover:bg-card/80'}`}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className={`font-semibold text-sm ${role===r.value ? 'text-accentLt' : 'text-textLt'}`}>{r.value}</div>
//                 <div className="text-xs text-muted mt-0.5">{r.desc}</div>
//               </div>
//               <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
//                 ${role===r.value ? 'border-accent bg-accent' : 'border-border'}`}>
//                 {role===r.value && <div className="w-1.5 h-1.5 rounded-full bg-bg"/>}
//               </div>
//             </div>
//           </button>
//         ))}
//       </div>

//       {/* Intent buttons */}
//       <div>
//         <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">I want to</label>
//         <div className="grid grid-cols-2 gap-2">
//           {['login','signup'].map(i => (
//             <button
//               key={i}
//               onClick={() => setIntent(i)}
//               className={`py-2.5 rounded-lg border text-sm font-medium transition-all duration-150
//                 ${intent===i
//                   ? 'border-accent bg-accent text-bg'
//                   : 'border-border text-dim hover:border-accent/50 hover:text-text'}`}
//             >
//               {i === 'login' ? 'Sign In' : 'Create Account'}
//             </button>
//           ))}
//         </div>
//       </div>

//       <button
//         className={`auth-btn transition-opacity ${canContinue ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
//         onClick={() => canContinue && onNext(role, intent)}
//       >
//         Continue
//       </button>
//     </div>
//   )
// }

// // ═══════════════════════════════════════════════════
// //  SIGN IN
// // ═══════════════════════════════════════════════════
// function SignIn({ role, onBack, onForgot }) {
//   const { login, showToast } = useStore()
//   const navigate = useNavigate()
//   const [email, setEmail] = useState('')
//   const [pwd,   setPwd]   = useState('')
//   const [show,  setShow]  = useState(false)

//   const submit = () => {
//     if (!email || !pwd) { showToast('Please fill all fields', 'error'); return }
//     const name = email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
//     login({ name, email, role })
//     showToast(`Welcome back, ${name}`, 'success')
//     navigate('/')
//   }

//   return (
//     <div className="animate-fade-in space-y-6">
//       <button onClick={onBack} className="flex items-center gap-1.5 text-dim hover:text-accentLt transition-colors text-sm">
//         <ArrowLeft size={14}/> Back
//       </button>
//       <div className="space-y-1">
//         <h1 className="font-serif text-3xl text-textLt font-semibold">Sign In</h1>
//         <p className="text-dim text-sm">
//           Continuing as <span className="text-accentLt font-medium">{role}</span>
//         </p>
//       </div>
//       <div className="space-y-4">
//         <F label="Email Address">
//           <input className="auth-input" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)}/>
//         </F>
//         <F label="Password">
//           <div className="relative">
//             <input
//               className="auth-input pr-10"
//               type={show ? 'text' : 'password'}
//               placeholder="••••••••"
//               value={pwd}
//               onChange={e=>setPwd(e.target.value)}
//               onKeyDown={e=>e.key==='Enter'&&submit()}
//             />
//             <button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dim">
//               {show ? <EyeOff size={15}/> : <Eye size={15}/>}
//             </button>
//           </div>
//         </F>
//       </div>
//       <div className="flex justify-end -mt-2">
//         <button className="auth-link" onClick={onForgot}>Forgot password?</button>
//       </div>
//       <button className="auth-btn" onClick={submit}>Sign In</button>
//       <p className="text-center text-dim text-sm">
//         No account?{' '}
//         <button className="auth-link" onClick={onBack}>Go back</button>
//       </p>
//     </div>
//   )
// }

// // ═══════════════════════════════════════════════════
// //  SIGN UP
// // ═══════════════════════════════════════════════════
// function SignUp({ role, onBack }) {
//   const { login, showToast } = useStore()
//   const navigate = useNavigate()
//   const [f, setF] = useState({ name:'', email:'', pwd:'', confirm:'' })

//   const pwdOk  = f.confirm ? f.pwd === f.confirm : undefined
//   const pwdFail= f.confirm ? f.pwd !== f.confirm : undefined

//   const submit = () => {
//     if (!f.name||!f.email||!f.pwd) { showToast('All fields are required', 'error'); return }
//     if (f.pwd.length < 6)          { showToast('Password must be at least 6 characters', 'error'); return }
//     if (f.pwd !== f.confirm)       { showToast('Passwords do not match', 'error'); return }
//     login({ name:f.name, email:f.email, role })
//     showToast(`Account created! Welcome, ${f.name}`, 'success')
//     navigate('/')
//   }

//   return (
//     <div className="animate-fade-in space-y-5">
//       <button onClick={onBack} className="flex items-center gap-1.5 text-dim hover:text-accentLt transition-colors text-sm">
//         <ArrowLeft size={14}/> Back
//       </button>
//       <div className="space-y-1">
//         <h1 className="font-serif text-3xl text-textLt font-semibold">Create Account</h1>
//         <p className="text-dim text-sm">
//           Registering as <span className="text-accentLt font-medium">{role}</span>
//         </p>
//       </div>

//       <div className="space-y-4">
//         <F label="Full Name *">
//           <input className="auth-input" placeholder="John Doe" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
//         </F>
//         <F label="Email Address *">
//           <input className="auth-input" type="email" placeholder="you@company.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
//         </F>

//         {/* Role reminder pill */}
//         <div className="flex items-start gap-2 bg-accent/6 border border-accent/15 rounded-lg p-3">
//           <div className="w-1.5 h-1.5 rounded-full bg-accentLt mt-1 flex-shrink-0"/>
//           <p className="text-xs text-dim leading-relaxed">
//             <span className="text-accentLt font-medium">{role}:</span>{' '}
//             {role==='Staff Member'
//               ? 'Can perform transfers, picking, shelving and stock counting.'
//               : 'Has full access including receipts, deliveries, adjustments and reports.'}
//           </p>
//         </div>

//         <F label="Password *">
//           <PwdInput placeholder="Min. 6 characters" value={f.pwd} onChange={e=>setF({...f,pwd:e.target.value})}/>
//         </F>
//         <F label="Confirm Password *">
//           <PwdInput
//             placeholder="Re-enter password"
//             value={f.confirm}
//             onChange={e=>setF({...f,confirm:e.target.value})}
//             match={f.confirm ? pwdOk : undefined}
//           />
//           {pwdFail && <p className="text-xs text-danger mt-1 font-mono">Passwords do not match</p>}
//         </F>
//       </div>

//       <button className="auth-btn" onClick={submit}>Create Account</button>
//       <p className="text-center text-dim text-sm">
//         Already have an account?{' '}
//         <button className="auth-link" onClick={onBack}>Go back</button>
//       </p>
//     </div>
//   )
// }

// // ═══════════════════════════════════════════════════
// //  FORGOT PASSWORD  (3-step OTP flow)
// // ═══════════════════════════════════════════════════
// function ForgotPwd({ onBack }) {
//   const { showToast } = useStore()
//   const [step,    setStep]    = useState(1)
//   const [email,   setEmail]   = useState('')
//   const [otp,     setOtp]     = useState(Array(6).fill(''))
//   const [newPwd,  setNewPwd]  = useState('')
//   const [cnfPwd,  setCnfPwd]  = useState('')
//   const MOCK_OTP = '483726'
//   const refs = useRef([])

//   const pwdOk = cnfPwd ? newPwd === cnfPwd : undefined

//   // Step 1
//   const sendOtp = () => {
//     if (!email) { showToast('Enter your email address', 'error'); return }
//     showToast(`OTP sent to ${email}  (demo code: ${MOCK_OTP})`, 'info')
//     setStep(2)
//   }

//   // Step 2
//   const handleOtp = (i, val) => {
//     if (!/^\d*$/.test(val)) return
//     const next = [...otp]; next[i] = val.slice(-1); setOtp(next)
//     if (val && i < 5) refs.current[i+1]?.focus()
//     if (!val && i > 0) refs.current[i-1]?.focus()
//   }
//   const verifyOtp = () => {
//     if (otp.join('').length < 6) { showToast('Enter all 6 digits', 'error'); return }
//     if (otp.join('') !== MOCK_OTP) { showToast('Incorrect OTP — try again', 'error'); return }
//     showToast('OTP verified ✓', 'success'); setStep(3)
//   }

//   // Step 3
//   const resetPwd = () => {
//     if (!newPwd || !cnfPwd)  { showToast('Fill all fields', 'error'); return }
//     if (newPwd.length < 6)   { showToast('Password must be at least 6 characters', 'error'); return }
//     if (newPwd !== cnfPwd)   { showToast('Passwords do not match', 'error'); return }
//     showToast('Password reset! Please sign in.', 'success')
//     onBack()
//   }

//   const STEPS = ['Email', 'Verify OTP', 'New Password']

//   return (
//     <div className="animate-fade-in space-y-6">
//       <button onClick={onBack} className="flex items-center gap-1.5 text-dim hover:text-accentLt transition-colors text-sm">
//         <ArrowLeft size={14}/> Back to sign in
//       </button>
//       <div className="space-y-1">
//         <h1 className="font-serif text-3xl text-textLt font-semibold">Reset Password</h1>
//         <p className="text-dim text-sm">We'll send a one-time code to your email</p>
//       </div>

//       {/* Step indicator */}
//       <div className="flex items-center">
//         {STEPS.map((lbl, i) => (
//           <div key={lbl} className="flex items-center flex-1">
//             <div className="flex flex-col items-center gap-1">
//               <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold
//                 transition-all duration-300
//                 ${i+1 < step ? 'bg-success text-bg' : i+1===step ? 'bg-accent text-bg ring-2 ring-accent/25' : 'bg-border text-muted'}`}>
//                 {i+1 < step ? '✓' : i+1}
//               </div>
//               <span className={`text-xs font-mono transition-colors ${i+1===step ? 'text-accentLt' : 'text-muted'}`}>{lbl}</span>
//             </div>
//             {i < 2 && <div className={`flex-1 h-px mb-5 mx-1 transition-colors duration-300 ${i+1 < step ? 'bg-success/40' : 'bg-border'}`}/>}
//           </div>
//         ))}
//       </div>

//       {/* Step 1 — email */}
//       {step===1 && (
//         <div className="space-y-4 animate-fade-in">
//           <F label="Registered Email">
//             <input className="auth-input" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)}
//               onKeyDown={e=>e.key==='Enter'&&sendOtp()}/>
//           </F>
//           <div className="bg-info/6 border border-info/15 rounded-lg p-3 text-xs text-dim font-mono">
//             A 6-digit OTP will be sent to your registered email.
//           </div>
//           <button className="auth-btn" onClick={sendOtp}>Send OTP</button>
//         </div>
//       )}

//       {/* Step 2 — OTP boxes */}
//       {step===2 && (
//         <div className="space-y-5 animate-fade-in">
//           <p className="text-sm text-dim text-center">
//             Enter the 6-digit code sent to{' '}
//             <span className="text-accentLt font-mono">{email}</span>
//           </p>
//           <div className="flex justify-center gap-2">
//             {otp.map((d, i) => (
//               <input
//                 key={i}
//                 ref={el => refs.current[i]=el}
//                 className="otp-input"
//                 style={{width:'2.75rem', height:'3.25rem'}}
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={1}
//                 value={d}
//                 onChange={e => handleOtp(i, e.target.value)}
//                 onKeyDown={e => e.key==='Backspace' && !otp[i] && i>0 && refs.current[i-1]?.focus()}
//               />
//             ))}
//           </div>
//           <button className="auth-btn" onClick={verifyOtp}>Verify OTP</button>
//           <p className="text-center text-xs text-muted font-mono">
//             Didn't receive it?{' '}
//             <button className="auth-link text-xs" onClick={sendOtp}>Resend</button>
//           </p>
//         </div>
//       )}

//       {/* Step 3 — new password */}
//       {step===3 && (
//         <div className="space-y-4 animate-fade-in">
//           <F label="New Password">
//             <PwdInput placeholder="Min. 6 characters" value={newPwd} onChange={e=>setNewPwd(e.target.value)}/>
//           </F>
//           <F label="Confirm New Password">
//             <PwdInput
//               placeholder="Re-enter new password"
//               value={cnfPwd}
//               onChange={e=>setCnfPwd(e.target.value)}
//               match={cnfPwd ? pwdOk : undefined}
//             />
//             {cnfPwd && !pwdOk && <p className="text-xs text-danger mt-1 font-mono">Passwords do not match</p>}
//           </F>
//           <button className="auth-btn" onClick={resetPwd}>Reset Password</button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ═══════════════════════════════════════════════════
// //  MAIN AUTH PAGE
// // ═══════════════════════════════════════════════════
// export default function AuthPage() {
//   // view: 'role' | 'signin' | 'signup' | 'forgot'
//   const [view,   setView]   = useState('role')
//   const [role,   setRole]   = useState('')

//   const handleRoleNext = (r, intent) => {
//     setRole(r)
//     setView(intent === 'login' ? 'signin' : 'signup')
//   }

//   return (
//     <div className="auth-wrap">
//       <BrandPanel />

//       {/* Right form panel */}
//       <div className="flex-1 flex items-center justify-center p-6 lg:p-12 min-h-screen">
//         <div className="auth-panel w-full">
//           {view === 'role'   && <RolePicker onNext={handleRoleNext} />}
//           {view === 'signin' && <SignIn  role={role} onBack={()=>setView('role')} onForgot={()=>setView('forgot')} />}
//           {view === 'signup' && <SignUp  role={role} onBack={()=>setView('role')} />}
//           {view === 'forgot' && <ForgotPwd onBack={()=>setView('signin')} />}
//         </div>
//       </div>
//     </div>
//   )
// }



import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Eye, EyeOff, Package, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react'

// ── tiny reusable label+input ────────────────────────────────────
function F({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// ── email validator ──────────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ── password input with show/hide ────────────────────────────────
function PwdInput({ placeholder, value, onChange, match }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`auth-input pr-20 ${match===false ? 'border-danger/60' : ''}`}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {match===true  && <CheckCircle2 size={14} className="text-success" />}
        {match===false && <span className="text-danger text-xs font-mono">✕</span>}
        <button type="button" onClick={() => setShow(v => !v)} className="text-muted hover:text-dim transition-colors">
          {show ? <EyeOff size={15}/> : <Eye size={15}/>}
        </button>
      </div>
    </div>
  )
}

// ── Left branding panel ──────────────────────────────────────────
function BrandPanel() {
  return (
    <div className="hidden lg:flex w-[46%] bg-surface border-r border-border flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
      {/* subtle grid texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:'linear-gradient(rgba(156,128,96,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(156,128,96,0.04) 1px, transparent 1px)',
          backgroundSize:'48px 48px'
        }}
      />
      {/* faint vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{background:'radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(24,26,29,0.6) 100%)'}}
      />

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
          <Package size={19} className="text-bg" />
        </div>
        <div>
          <div className="font-serif font-semibold text-textLt text-lg tracking-tight">CoreInventory</div>
          <div className="text-xs font-mono text-muted">Inventory Management System</div>
        </div>
      </div>

      {/* Quote */}
      <div className="relative space-y-7">
        <div className="w-10 h-px bg-accent/50" />
        <blockquote className="font-serif text-[2rem] leading-tight text-textLt font-medium">
          "Every item tracked.<br />Every move logged.<br />
          <em className="text-accentLt not-italic">Full clarity.</em>"
        </blockquote>
        <p className="text-dim text-sm leading-relaxed max-w-xs">
          Replace scattered registers and spreadsheets with a centralised, real-time platform built for warehouse teams.
        </p>
        <div className="space-y-3 pt-1">
          {[
            'Multi-warehouse stock tracking',
            'Receipts, deliveries & transfers',
            'Physical count adjustments',
            'Role-based access — Staff & Manager',
          ].map(f => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-dim">
              <div className="w-1 h-1 rounded-full bg-accentLt flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="relative text-xs font-mono text-muted">©️ 2025 CoreInventory · v1.0</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
//  STEP 0 — ROLE PICKER  (always first)
// ═══════════════════════════════════════════════════
function RolePicker({ onNext }) {
  const [role, setRole] = useState('')
  const [intent, setIntent] = useState('') // 'login' | 'signup'

  const ROLES = [
    { value:'Staff Member',        desc:'Picking, shelving, transfers, counting' },
    { value:'Inventory Manager',   desc:'Full access — receipts, deliveries, adjustments' },
  ]

  const canContinue = role && intent

  return (
    <div className="animate-fade-in space-y-7">
      <div className="text-center space-y-1.5">
        {/* Mobile logo */}
        <div className="flex lg:hidden justify-center mb-5">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <Package size={18} className="text-bg"/>
          </div>
        </div>
        <h1 className="font-serif text-3xl text-textLt font-semibold">Welcome</h1>
        <p className="text-dim text-sm">Select your role to continue</p>
      </div>

      {/* Role cards */}
      <div className="space-y-3">
        {ROLES.map(r => (
          <button
            key={r.value}
            onClick={() => setRole(r.value)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-150
              ${role===r.value
                ? 'border-accent bg-accent/8 ring-1 ring-accent/20'
                : 'border-border bg-card hover:border-accent/40 hover:bg-card/80'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-semibold text-sm ${role===r.value ? 'text-accentLt' : 'text-textLt'}`}>{r.value}</div>
                <div className="text-xs text-muted mt-0.5">{r.desc}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${role===r.value ? 'border-accent bg-accent' : 'border-border'}`}>
                {role===r.value && <div className="w-1.5 h-1.5 rounded-full bg-bg"/>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Intent buttons */}
      <div>
        <label className="block text-xs font-mono text-muted uppercase tracking-wider mb-2">I want to</label>
        <div className="grid grid-cols-2 gap-2">
          {['login','signup'].map(i => (
            <button
              key={i}
              onClick={() => setIntent(i)}
              className={`py-2.5 rounded-lg border text-sm font-medium transition-all duration-150
                ${intent===i
                  ? 'border-accent bg-accent text-bg'
                  : 'border-border text-dim hover:border-accent/50 hover:text-text'}`}
            >
              {i === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>
      </div>

      <button
        className={`auth-btn transition-opacity ${canContinue ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
        onClick={() => canContinue && onNext(role, intent)}
      >
        Continue
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════
//  SIGN IN
// ═══════════════════════════════════════════════════
function SignIn({ role, onBack, onForgot }) {
  const { login, showToast } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pwd,   setPwd]   = useState('')
  const [show,  setShow]  = useState(false)
  const [emailErr, setEmailErr] = useState('')

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (emailErr) setEmailErr('')
  }

  const submit = () => {
    if (!email || !pwd) { showToast('Please fill all fields', 'error'); return }
    if (!isValidEmail(email)) { setEmailErr('Please enter a valid email address'); return }
    const name = email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
    login({ name, email, role })
    showToast(`Welcome back, ${name}`, 'success')
    navigate('/')
  }

  return (
    <div className="animate-fade-in space-y-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-dim hover:text-accentLt transition-colors text-sm">
        <ArrowLeft size={14}/> Back
      </button>
      <div className="space-y-1">
        <h1 className="font-serif text-3xl text-textLt font-semibold">Sign In</h1>
        <p className="text-dim text-sm">
          Continuing as <span className="text-accentLt font-medium">{role}</span>
        </p>
      </div>
      <div className="space-y-4">
        <F label="Email Address">
          <input
            className={`auth-input ${emailErr ? 'border-danger/60' : ''}`}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => email && !isValidEmail(email) && setEmailErr('Please enter a valid email address')}
          />
          {emailErr && <p className="text-xs text-danger mt-1 font-mono">{emailErr}</p>}
        </F>
        <F label="Password">
          <div className="relative">
            <input
              className="auth-input pr-10"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={pwd}
              onChange={e=>setPwd(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&submit()}
            />
            <button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dim">
              {show ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
        </F>
      </div>
      <div className="flex justify-end -mt-2">
        <button className="auth-link" onClick={onForgot}>Forgot password?</button>
      </div>
      <button className="auth-btn" onClick={submit}>Sign In</button>
      <p className="text-center text-dim text-sm">
        No account?{' '}
        <button className="auth-link" onClick={onBack}>Go back</button>
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════
//  SIGN UP
// ═══════════════════════════════════════════════════
function SignUp({ role, onBack }) {
  const { login, showToast } = useStore()
  const navigate = useNavigate()
  const [f, setF] = useState({ name:'', email:'', pwd:'', confirm:'' })
  const [emailErr, setEmailErr] = useState('')

  const pwdOk  = f.confirm ? f.pwd === f.confirm : undefined
  const pwdFail= f.confirm ? f.pwd !== f.confirm : undefined

  const handleEmailChange = (e) => {
    setF({...f, email: e.target.value})
    if (emailErr) setEmailErr('')
  }

  const submit = () => {
    if (!f.name||!f.email||!f.pwd) { showToast('All fields are required', 'error'); return }
    if (!isValidEmail(f.email))    { setEmailErr('Please enter a valid email address'); return }
    if (f.pwd.length < 6)          { showToast('Password must be at least 6 characters', 'error'); return }
    if (f.pwd !== f.confirm)       { showToast('Passwords do not match', 'error'); return }
    login({ name:f.name, email:f.email, role })
    showToast(`Account created! Welcome, ${f.name}`, 'success')
    navigate('/')
  }

  return (
    <div className="animate-fade-in space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-dim hover:text-accentLt transition-colors text-sm">
        <ArrowLeft size={14}/> Back
      </button>
      <div className="space-y-1">
        <h1 className="font-serif text-3xl text-textLt font-semibold">Create Account</h1>
        <p className="text-dim text-sm">
          Registering as <span className="text-accentLt font-medium">{role}</span>
        </p>
      </div>

      <div className="space-y-4">
        <F label="Full Name *">
          <input className="auth-input" placeholder="John Doe" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
        </F>
        <F label="Email Address *">
          <input
            className={`auth-input ${emailErr ? 'border-danger/60' : ''}`}
            type="email"
            placeholder="you@company.com"
            value={f.email}
            onChange={handleEmailChange}
            onBlur={() => f.email && !isValidEmail(f.email) && setEmailErr('Please enter a valid email address')}
          />
          {emailErr && <p className="text-xs text-danger mt-1 font-mono">{emailErr}</p>}
        </F>

        {/* Role reminder pill */}
        <div className="flex items-start gap-2 bg-accent/6 border border-accent/15 rounded-lg p-3">
          <div className="w-1.5 h-1.5 rounded-full bg-accentLt mt-1 flex-shrink-0"/>
          <p className="text-xs text-dim leading-relaxed">
            <span className="text-accentLt font-medium">{role}:</span>{' '}
            {role==='Staff Member'
              ? 'Can perform transfers, picking, shelving and stock counting.'
              : 'Has full access including receipts, deliveries, adjustments and reports.'}
          </p>
        </div>

        <F label="Password *">
          <PwdInput placeholder="Min. 6 characters" value={f.pwd} onChange={e=>setF({...f,pwd:e.target.value})}/>
        </F>
        <F label="Confirm Password *">
          <PwdInput
            placeholder="Re-enter password"
            value={f.confirm}
            onChange={e=>setF({...f,confirm:e.target.value})}
            match={f.confirm ? pwdOk : undefined}
          />
          {pwdFail && <p className="text-xs text-danger mt-1 font-mono">Passwords do not match</p>}
        </F>
      </div>

      <button className="auth-btn" onClick={submit}>Create Account</button>
      <p className="text-center text-dim text-sm">
        Already have an account?{' '}
        <button className="auth-link" onClick={onBack}>Go back</button>
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════
//  FORGOT PASSWORD  (3-step OTP flow)
// ═══════════════════════════════════════════════════
function ForgotPwd({ onBack }) {
  const { showToast } = useStore()
  const [step,    setStep]    = useState(1)
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState(Array(6).fill(''))
  const [newPwd,  setNewPwd]  = useState('')
  const [cnfPwd,  setCnfPwd]  = useState('')
  const [emailErr, setEmailErr] = useState('')
  const MOCK_OTP = '483726'
  const refs = useRef([])

  const pwdOk = cnfPwd ? newPwd === cnfPwd : undefined

  // Step 1
  const sendOtp = () => {
    if (!email) { showToast('Enter your email address', 'error'); return }
    if (!isValidEmail(email)) { setEmailErr('Please enter a valid email address'); return }
    setEmailErr('')
    showToast(`OTP sent to ${email}  (demo code: ${MOCK_OTP})`, 'info')
    setStep(2)
  }

  // Step 2
  const handleOtp = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next)
    if (val && i < 5) refs.current[i+1]?.focus()
    if (!val && i > 0) refs.current[i-1]?.focus()
  }
  const verifyOtp = () => {
    if (otp.join('').length < 6) { showToast('Enter all 6 digits', 'error'); return }
    if (otp.join('') !== MOCK_OTP) { showToast('Incorrect OTP — try again', 'error'); return }
    showToast('OTP verified ✓', 'success'); setStep(3)
  }

  // Step 3
  const resetPwd = () => {
    if (!newPwd || !cnfPwd)  { showToast('Fill all fields', 'error'); return }
    if (newPwd.length < 6)   { showToast('Password must be at least 6 characters', 'error'); return }
    if (newPwd !== cnfPwd)   { showToast('Passwords do not match', 'error'); return }
    showToast('Password reset! Please sign in.', 'success')
    onBack()
  }

  const STEPS = ['Email', 'Verify OTP', 'New Password']

  return (
    <div className="animate-fade-in space-y-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-dim hover:text-accentLt transition-colors text-sm">
        <ArrowLeft size={14}/> Back to sign in
      </button>
      <div className="space-y-1">
        <h1 className="font-serif text-3xl text-textLt font-semibold">Reset Password</h1>
        <p className="text-dim text-sm">We'll send a one-time code to your email</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((lbl, i) => (
          <div key={lbl} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold
                transition-all duration-300
                ${i+1 < step ? 'bg-success text-bg' : i+1===step ? 'bg-accent text-bg ring-2 ring-accent/25' : 'bg-border text-muted'}`}>
                {i+1 < step ? '✓' : i+1}
              </div>
              <span className={`text-xs font-mono transition-colors ${i+1===step ? 'text-accentLt' : 'text-muted'}`}>{lbl}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-px mb-5 mx-1 transition-colors duration-300 ${i+1 < step ? 'bg-success/40' : 'bg-border'}`}/>}
          </div>
        ))}
      </div>

      {/* Step 1 — email */}
      {step===1 && (
        <div className="space-y-4 animate-fade-in">
          <F label="Registered Email">
            <input
              className={`auth-input ${emailErr ? 'border-danger/60' : ''}`}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => { setEmail(e.target.value); if (emailErr) setEmailErr('') }}
              onBlur={() => email && !isValidEmail(email) && setEmailErr('Please enter a valid email address')}
              onKeyDown={e=>e.key==='Enter'&&sendOtp()}
            />
            {emailErr && <p className="text-xs text-danger mt-1 font-mono">{emailErr}</p>}
          </F>
          <div className="bg-info/6 border border-info/15 rounded-lg p-3 text-xs text-dim font-mono">
            A 6-digit OTP will be sent to your registered email.
          </div>
          <button className="auth-btn" onClick={sendOtp}>Send OTP</button>
        </div>
      )}

      {/* Step 2 — OTP boxes */}
      {step===2 && (
        <div className="space-y-5 animate-fade-in">
          <p className="text-sm text-dim text-center">
            Enter the 6-digit code sent to{' '}
            <span className="text-accentLt font-mono">{email}</span>
          </p>
          <div className="flex justify-center gap-2">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={el => refs.current[i]=el}
                className="otp-input"
                style={{width:'2.75rem', height:'3.25rem'}}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleOtp(i, e.target.value)}
                onKeyDown={e => e.key==='Backspace' && !otp[i] && i>0 && refs.current[i-1]?.focus()}
              />
            ))}
          </div>
          <button className="auth-btn" onClick={verifyOtp}>Verify OTP</button>
          <p className="text-center text-xs text-muted font-mono">
            Didn't receive it?{' '}
            <button className="auth-link text-xs" onClick={sendOtp}>Resend</button>
          </p>
        </div>
      )}

      {/* Step 3 — new password */}
      {step===3 && (
        <div className="space-y-4 animate-fade-in">
          <F label="New Password">
            <PwdInput placeholder="Min. 6 characters" value={newPwd} onChange={e=>setNewPwd(e.target.value)}/>
          </F>
          <F label="Confirm New Password">
            <PwdInput
              placeholder="Re-enter new password"
              value={cnfPwd}
              onChange={e=>setCnfPwd(e.target.value)}
              match={cnfPwd ? pwdOk : undefined}
            />
            {cnfPwd && !pwdOk && <p className="text-xs text-danger mt-1 font-mono">Passwords do not match</p>}
          </F>
          <button className="auth-btn" onClick={resetPwd}>Reset Password</button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════
//  MAIN AUTH PAGE
// ═══════════════════════════════════════════════════
export default function AuthPage() {
  const [view,   setView]   = useState('role')
  const [role,   setRole]   = useState('')

  const handleRoleNext = (r, intent) => {
    setRole(r)
    setView(intent === 'login' ? 'signin' : 'signup')
  }

  return (
    <div className="auth-wrap">
      <BrandPanel />

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 min-h-screen">
        <div className="auth-panel w-full">
          {view === 'role'   && <RolePicker onNext={handleRoleNext} />}
          {view === 'signin' && <SignIn  role={role} onBack={()=>setView('role')} onForgot={()=>setView('forgot')} />}
          {view === 'signup' && <SignUp  role={role} onBack={()=>setView('role')} />}
          {view === 'forgot' && <ForgotPwd onBack={()=>setView('signin')} />}
        </div>
      </div>
    </div>
  )
}