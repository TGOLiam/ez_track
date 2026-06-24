import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import { api } from '@/lib/api'
import { AI_RESPONSES } from '@/data/aiResponses'
import { getSuggestionChips } from '@/data/suggestionChips'
import { toast } from 'sonner'

function ScrollRow({ children }) {
  const ref = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollStart = useRef(0)

  const onWheel = useCallback((e) => {
    if (ref.current) {
      ref.current.scrollLeft += e.deltaY
      e.preventDefault()
    }
  }, [])

  const onMouseDown = useCallback((e) => {
    isDragging.current = true
    startX.current = e.pageX
    scrollStart.current = ref.current?.scrollLeft || 0
    ref.current?.classList.add('cursor-grabbing')
    e.preventDefault()
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !ref.current) return
    const dx = e.pageX - startX.current
    ref.current.scrollLeft = scrollStart.current - dx
  }, [])

  const onMouseUp = useCallback(() => {
    isDragging.current = false
    ref.current?.classList.remove('cursor-grabbing')
  }, [])

  return (
    <div
      ref={ref}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      className="flex gap-1.5 overflow-x-auto flex-nowrap scrollbar-none pb-1 w-full cursor-grab select-none"
    >
      {children}
    </div>
  )
}

export default function AITab() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const messages = state.chatMessages
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const queriesRemaining = state.simulaQueriesRemaining
  const tier = state.tier
  const isSimulaExhausted = tier === CONFIG.TIERS.SIMULA && queriesRemaining <= 0
  const didSeedWelcome = useRef(false)

  useEffect(() => {
    if (didSeedWelcome.current) return
    if (state.chatMessages.length === 0) {
      didSeedWelcome.current = true
      const weekTx = state.transactions.filter(t => {
        const d = new Date(t.date)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - CONFIG.WEEKLY_LOOKBACK_DAYS)
        return d >= weekAgo
      })
      const inc = weekTx.filter(t => t.type === 'inc').reduce((s, t) => s + t.amt, 0)
      const exp = weekTx.filter(t => t.type === 'exp').reduce((s, t) => s + t.amt, 0)
      const name = state.user?.name || 'Negosyante'
      const biz = state.business?.name || 'your business'

      let text
      if (inc === 0 && exp === 0 && state.transactions.length === 0) {
        text = `Welcome to EzTrack, ${name}! I'll help you track your finances, inventory, and generate documents. Start by logging a transaction or asking me about your money.`
      } else if (inc > 0 || exp > 0) {
        const net = inc - exp
        text = `Kamusta, ${name}! This week ${biz} earned <strong>₱${inc.toLocaleString()}</strong> and spent <strong>₱${exp.toLocaleString()}</strong>. Net: <strong>₱${net.toLocaleString()}</strong>. Anything you want to check?`
      } else {
        text = `Kamusta, ${name}! Welcome to ${biz}. I can track your income and expenses, manage inventory, generate receipts and reports, and give you financial insights. How can I help today?`
      }
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'ai', text, ts: new Date().toLocaleTimeString(CONFIG.LOCALE, { hour: 'numeric', minute: '2-digit' }) } })
    }
  }, [])

  function keywordReply(msg) {
    const lower = msg.toLowerCase()
    for (const key of Object.keys(AI_RESPONSES)) {
      if (lower.includes(key)) return AI_RESPONSES[key]
    }
    return "Thanks for your message! I'm currently in offline mode. Please upgrade to Sigla or Unlad for full AI chat with live data access."
  }

  function buildContext() {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - CONFIG.WEEKLY_LOOKBACK_DAYS)
    const weekTx = state.transactions.filter(t => new Date(t.date) >= weekAgo)
    const weeklyIncome = weekTx.filter(t => t.type === 'inc').reduce((s, t) => s + t.amt, 0)
    const weeklyExpenses = weekTx.filter(t => t.type === 'exp').reduce((s, t) => s + t.amt, 0)
    const cats = {}
    state.transactions.filter(t => t.type === 'exp').forEach(t => { cats[t.cat] = (cats[t.cat] || 0) + t.amt })
    const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]
    return {
      profileId: state.profileId,
      bizName: state.business?.name || 'Unnamed Business',
      tier: state.tier,
      cashToday: state.transactions.filter(t => t.date === new Date().toISOString().slice(0, 10))
        .reduce((s, t) => s + (t.type === 'inc' ? t.amt : -t.amt), 0),
      weeklyIncome,
      weeklyExpenses,
      topCategory: topCat?.[0] || 'N/A',
      topCategoryAmount: topCat?.[1] || 0,
      recentTransactions: state.transactions.slice(0, CONFIG.AI_CONTEXT_TX_LIMIT),
      inventory: state.inventory,
      customers: state.customers,
      goals: state.goals,
    }
  }

  async function refreshState() {
    try {
      const fresh = await api.post('/refresh/' + state.profileId)
      dispatch({ type: 'LOGIN', payload: fresh })
    } catch {}
  }

  async function callLLM(messages, ctx) {
    try {
      const data = await api.post('/chat', { messages, context: ctx })
      return {
        reply: data.choices?.[0]?.message?.content || '',
        toolCallsUsed: data.tool_calls_used || [],
        tables: data.tables || [],
      }
    } catch {
      return null
    }
  }

  async function handleSend(text) {
    if (!text.trim()) return
    if (isSimulaExhausted) {
      toast.error('No AI queries remaining. Upgrade to Sigla for unlimited access.')
      return
    }

    const userMsg = { role: 'user', text: text.trim(), ts: new Date().toLocaleTimeString(CONFIG.LOCALE, { hour: 'numeric', minute: '2-digit' }) }
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMsg })
    setInput('')
    setIsTyping(true)

    if (tier === CONFIG.TIERS.SIMULA) dispatch({ type: 'DECREMENT_QUERY' })

    setCooldown(true)
    setTimeout(() => setCooldown(false), 3000)

    const ctx = buildContext()
    const chatHistory = messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.text }))
    chatHistory.push({ role: 'user', content: text.trim() })
    const result = await callLLM(chatHistory, ctx)
    const reply = result ? result.reply : keywordReply(text.trim())

    await refreshState()

    const aiMsg = { role: 'ai', text: reply, ts: userMsg.ts, tools: result?.toolCallsUsed || [], tables: result?.tables || [] }
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: aiMsg })
    setIsTyping(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSend(input)
  }

  const chips = getSuggestionChips(tier)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-[11px] text-gray-400 text-center">
          {tier === CONFIG.TIERS.SIMULA
            ? `${queriesRemaining} of ${CONFIG.AI_QUERY_LIMIT} AI queries remaining this month`
            : 'Unlimited AI queries'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
              {msg.role === 'ai' && msg.tools?.length > 0 && (
                <div className="text-[10px] text-gray-400 mb-1">Used: {msg.tools.join(', ')}</div>
              )}
              <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text }} />
              {msg.tables?.map((t, ti) => (
                <div key={ti} className="overflow-x-auto mt-2 mb-1">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        {t.columns.map((col, ci) => (
                          <th key={ci} className="px-2 py-1.5 text-left font-semibold text-gray-600 border-b border-gray-200">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.rows.map((row, ri) => (
                        <tr key={ri} className={ri % 2 ? 'bg-gray-50/50' : ''}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-2 py-1.5 text-gray-700 border-b border-gray-100">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              {msg.role === 'ai' && msg.tools?.some(t => ['generate_receipt', 'generate_invoice', 'generate_report'].includes(t)) && (
                <button
                  onClick={() => navigate('/app/reports')}
                  className="mt-2 text-[11px] text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  View in My Documents
                </button>
              )}
              <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.ts}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {!isSimulaExhausted && chips.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center justify-between w-full text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2"
          >
            Suggestions
            <svg className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showSuggestions && (
            <div className="space-y-3">
              {chips.map((group, gi) => (
                <div key={gi}>
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">{group.label}</div>
                  <ScrollRow>
                    {group.chips.map((chip, ci) => (
                      <button key={ci} onClick={() => handleSend(chip.msg)}
                        className="text-[11px] px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0 whitespace-nowrap">
                        {chip.label}
                      </button>
                    ))}
                  </ScrollRow>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isSimulaExhausted ? (
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            You've used all your AI queries this month.{' '}
            <button onClick={() => navigate('/plans')} className="text-blue-600 font-semibold">Upgrade to Sigla</button> for unlimited access.
          </p>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask about your finances..." maxLength={500}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
            <button onClick={() => handleSend(input)} disabled={!input.trim() || cooldown}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
