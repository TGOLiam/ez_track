import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { api } from '@/lib/api'
import { CONFIG } from '@/config'

export default function RegisterPage() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', pass: '', pass2: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (form.pass.length < CONFIG.MIN_PASSWORD_LENGTH) e.pass = `At least ${CONFIG.MIN_PASSWORD_LENGTH} characters`
    if (form.pass !== form.pass2) e.pass2 = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const avatar = form.name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) || 'U'
    const state = await api.post('/register', {
      name: form.name.trim(),
      email: form.email.trim(),
      avatar,
      biz_name: CONFIG.DEFAULT_BIZ_NAME,
      biz_type: CONFIG.DEFAULT_BIZ_TYPE,
      biz_city: '',
      lang: CONFIG.DEFAULT_LANG,
      tier: CONFIG.DEFAULT_TIER,
    })
    dispatch({ type: 'LOGIN', payload: state })
    navigate('/plans', { replace: true })
  }

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="flex flex-col h-full px-6 pt-6">
      <button onClick={() => navigate('/login')} className="self-start text-sm text-gray-400 mb-4 hover:text-gray-600">
        ← Back
      </button>

      <h1 className="text-2xl font-extrabold text-gray-900">Simulan natin! 🚀</h1>
      <p className="text-sm text-gray-400 mt-1 mb-6">Create your free EzTrack account</p>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pb-4">
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Full Name</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
            className={`w-full px-4 py-3.5 rounded-xl border ${errors.name ? 'border-red-400' : 'border-gray-200'} text-sm outline-none focus:border-blue-500 transition-colors`}
            placeholder="Juan Dela Cruz" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Email Address</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-400' : 'border-gray-200'} text-sm outline-none focus:border-blue-500 transition-colors`}
            placeholder="juan@email.com" />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={form.pass} onChange={e => set('pass', e.target.value)}
              className={`w-full px-4 py-3.5 pr-12 rounded-xl border ${errors.pass ? 'border-red-400' : 'border-gray-200'} text-sm outline-none focus:border-blue-500 transition-colors`}
              placeholder="At least 6 characters" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d={showPass ? "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" : "M1 1l22 22M18.94 18.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"} />
              </svg>
            </button>
          </div>
          {errors.pass && <p className="text-xs text-red-600 mt-1">{errors.pass}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Confirm Password</label>
          <div className="relative">
            <input type={showPass2 ? 'text' : 'password'} value={form.pass2} onChange={e => set('pass2', e.target.value)}
              className={`w-full px-4 py-3.5 pr-12 rounded-xl border ${errors.pass2 ? 'border-red-400' : 'border-gray-200'} text-sm outline-none focus:border-blue-500 transition-colors`}
              placeholder="Re-enter password" />
            <button type="button" onClick={() => setShowPass2(!showPass2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d={showPass2 ? "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" : "M1 1l22 22M18.94 18.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"} />
              </svg>
            </button>
          </div>
          {errors.pass2 && <p className="text-xs text-red-600 mt-1">{errors.pass2}</p>}
        </div>

        <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[.98] transition-all">
          Create Account — It's Free!
        </button>
      </form>

      <p className="text-sm text-gray-400 text-center mb-6">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-semibold">Log in</Link>
      </p>
    </div>
  )
}
