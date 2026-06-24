/* ============================================================
   EzTrack – AI Chat Tab
   Chat rendering, quick-reply buttons, real LLM via /api/chat
   proxy, with keyword-matched fallback when the server is down.
   Simula gets limited queries (10/month).
   ============================================================ */

/* ── Build financial context for the LLM ── */
function buildAIContext() {
  const txs = STATE.transactions || [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  /* Cash today: net from today's transactions */
  const todayTxs = txs.filter(t => t.date === today);
  const cashToday = todayTxs.reduce((s, t) => s + (t.type === CONFIG.TX.INCOME ? t.amt : -t.amt), 0);

  /* Weekly totals (last 7 days from today) */
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStart = weekAgo.toISOString().split('T')[0];
  const weekTxs = txs.filter(t => t.date >= weekStart);
  const weeklyIncome = weekTxs.filter(t => t.type === CONFIG.TX.INCOME).reduce((s, t) => s + t.amt, 0);
  const weeklyExpenses = weekTxs.filter(t => t.type === CONFIG.TX.EXPENSE).reduce((s, t) => s + t.amt, 0);

  /* Top expense category */
  const expByCat = {};
  txs.filter(t => t.type === CONFIG.TX.EXPENSE && t.cat).forEach(t => {
    expByCat[t.cat] = (expByCat[t.cat] || 0) + t.amt;
  });
  let topCategory = '';
  let topCategoryAmount = 0;
  for (const [cat, amt] of Object.entries(expByCat)) {
    if (amt > topCategoryAmount) { topCategory = cat; topCategoryAmount = amt; }
  }

  return {
    profileId: STATE.profileId,
    bizName: STATE.business?.name || '',
    tier: STATE.tier,
    cashToday,
    weeklyIncome,
    weeklyExpenses,
    topCategory,
    topCategoryAmount,
    recentTransactions: txs.slice(0, 10),
    inventory: STATE.inventory,
    customers: STATE.customers,
    goals: STATE.goals,
  };
}

/* ── Call the LLM proxy — returns { reply, mutations } or null ── */
async function callLLM(messages, context) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      return null;
    }
    const reply = data.choices?.[0]?.message?.content || null;
    return { reply, mutations: data.mutations || [] };
  } catch (e) {
    return null;
  }
}

/* ── Apply mutations returned by the server to the local DB ── */
function applyMutations(mutations) {
  for (const m of mutations) {
    switch (m.action) {
      case 'add_transaction': {
        const tx = m.data;
        const id = DB.addTransaction({
          profile_id: STATE.profileId,
          type: tx.type, desc: tx.desc, amt: tx.amt,
          date: tx.date, cat: tx.cat || '', time: tx.time || '',
        });
        STATE.transactions.unshift({ id, profile_id: STATE.profileId, ...tx });
        break;
      }
      case 'delete_transaction': {
        DB.deleteTransaction(m.data.id);
        STATE.transactions = STATE.transactions.filter(t => t.id !== m.data.id);
        break;
      }
      case 'add_inventory_item': {
        const id = DB.addInventoryItem({ profile_id: STATE.profileId, ...m.data });
        STATE.inventory.push({ id, profile_id: STATE.profileId, ...m.data });
        break;
      }
      case 'set_stock_threshold': {
        const item = STATE.inventory.find(i => i.id === m.data.item_id);
        if (item) item.min_threshold = m.data.min_threshold;
        break;
      }
      case 'add_customer': {
        const id = DB.addCustomer({ profile_id: STATE.profileId, ...m.data });
        STATE.customers.push({ id, profile_id: STATE.profileId, ...m.data });
        break;
      }
      case 'set_financial_goal': {
        const id = DB.addGoal({ profile_id: STATE.profileId, ...m.data });
        STATE.goals.push({ id, profile_id: STATE.profileId, ...m.data });
        break;
      }
    }
  }
  if (mutations.length && STATE.currentTab === 'home') {
    renderHomeTab();
  }
}

/* ── Keyword fallback ── */
function keywordReply(msg) {
  const key = Object.keys(AI_RESPONSES).find(k => msg.toLowerCase().includes(k));
  return key
    ? AI_RESPONSES[key]
    : 'I can see your recent transactions. Want me to check if you\'re earning or losing this week?';
}

/* ── Suggestion chip groups ── */
function suggestionChips(tier) {
  const chips = [];

  const readGroup = [
    { label: '📊 View my transactions', msg: 'Show my recent transactions' },
    { label: '💰 Am I earning or losing?', msg: 'Am I earning or losing?' },
    { label: '📦 Check my inventory', msg: 'Show my inventory items' },
    { label: '⚠️ Am I overspending?', msg: 'Check if I am overspending' },
  ];
  chips.push({ label: 'Ask about your money', chips: readGroup });

  if (tier === CONFIG.TIERS.SIGLA || tier === CONFIG.TIERS.UNLAD) {
    const manageGroup = [
      { label: '➕ Add ₱500 supplies expense', msg: 'Add a transaction for 500 pesos supplies expense' },
      { label: '🏪 Add customer Juan', msg: 'Add a customer named Juan with contact 09171234567' },
      { label: '📋 Set stock alert on noodles', msg: 'Set stock threshold to 15 for noodles' },
    ];
    chips.push({ label: 'Manage your business', chips: manageGroup });
  }

  if (tier === CONFIG.TIERS.UNLAD) {
    const planGroup = [
      { label: '🎯 Set a goal to save ₱50K', msg: 'Set a financial goal to save 50000 pesos by December' },
      { label: '📈 Forecast my cash flow', msg: 'What is my 30-day cash flow forecast?' },
      { label: '🧾 Check BIR tax deadlines', msg: 'Check my BIR tax deadlines' },
      { label: '📦 What needs restocking?', msg: 'What items need restocking?' },
    ];
    chips.push({ label: 'Plan ahead', chips: planGroup });
  }

  return chips;
}

/* ── Render the AI tab ── */
function renderAITab() {
  const el = document.getElementById('ai-content');
  if (!el) return;

  const remaining = STATE.tier === CONFIG.TIERS.SIMULA ? STATE.simulaQueriesRemaining : -1;
  const groups = suggestionChips(STATE.tier);

  const chatHtml = `
    <div class="chat-counter" id="ai-counter">
      ${remaining >= 0
        ? `<span class="cc-text">${remaining} AI ${remaining === 1 ? 'query' : 'queries'} remaining this month</span>
           <span class="cc-upgrade" onclick="goTo('page-plans');renderPlans();">Upgrade to Sigla</span>`
        : `<span class="cc-text">Unlimited AI queries</span>`}
    </div>
    <div class="chat-messages" id="chat-msgs">
      ${AI_CHAT.messages.map(m => `
        <div class="chat-msg ${m.role}">${m.text}</div>
        <div class="chat-ts ${m.role}-ts">${m.ts}</div>
      `).join('')}
    </div>
    <div class="sug-groups" id="ai-sug-groups">
      ${groups.map(g => `
        <div class="sug-group">
          <div class="sug-label">${g.label}</div>
          <div class="sug-chips">
            ${g.chips.map(c => `<button class="qb" onclick="sendAI('${c.msg.replace(/'/g, "\\'")}')">${c.label}</button>`).join('')}
          </div>
        </div>`).join('')}
    </div>
    <div class="chat-bar">
      ${remaining === 0
        ? `<div class="chat-bar-locked">You've used all your AI queries this month. <a onclick="goTo('page-plans');renderPlans();">Upgrade to Sigla</a> for unlimited access.</div>`
        : `<input class="chat-input-field" id="ai-input" placeholder="Ask about your finances…" onkeydown="if(event.key==='Enter')sendAIFromInput()"/>
           <button class="chat-send" onclick="sendAIFromInput()">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
           </button>`}
    </div>`;

  el.innerHTML = chatHtml;
}

function sendAIFromInput() {
  const inp = document.getElementById('ai-input');
  const msg = inp ? inp.value.trim() : '';
  if (msg) { inp.value = ''; sendAI(msg); }
}

function appendUserMessage(message) {
  const timestamp = new Date().toLocaleTimeString(CONFIG.LOCALE, { hour: '2-digit', minute: '2-digit' });
  const messagesElement = document.getElementById('chat-msgs');
  if (!messagesElement) return timestamp;
  messagesElement.innerHTML += `<div class="chat-msg user">${message}</div><div class="chat-ts user-ts">${timestamp}</div>`;
  messagesElement.innerHTML += `<div class="chat-msg ai" id="typing-indicator">Checking your records…</div>`;
  messagesElement.scrollTop = messagesElement.scrollHeight;
  return timestamp;
}

function replaceTypingIndicator(replyText, timestamp) {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.outerHTML = `<div class="chat-msg ai">${replyText}</div><div class="chat-ts ai-ts">${timestamp}</div>`;
  scrollChatToBottom();
}

function scrollChatToBottom() {
  const messagesElement = document.getElementById('chat-msgs');
  if (messagesElement) messagesElement.scrollTop = messagesElement.scrollHeight;
}

function updateSimulaCounter() {
  const counter = document.getElementById('ai-counter');
  if (!counter) return;
  const remaining = STATE.simulaQueriesRemaining;
  counter.innerHTML = remaining > 0
    ? `<span class="cc-text">${remaining} AI ${remaining === 1 ? 'query' : 'queries'} remaining this month</span>
       <span class="cc-upgrade" onclick="goTo('page-plans');renderPlans();">Upgrade to Sigla</span>`
    : `<span class="cc-text cc-exhausted">0 AI queries remaining this month</span>
       <span class="cc-upgrade" onclick="goTo('page-plans');renderPlans();">Upgrade to Sigla</span>`;
}

function lockSimulaChat() {
  const chatBar = document.querySelector('.chat-bar');
  if (chatBar) chatBar.innerHTML = '<div class="chat-bar-locked">You\'ve used all your AI queries this month. <a onclick="goTo(\'page-plans\');renderPlans();">Upgrade to Sigla</a> for unlimited access.</div>';
  const suggestions = document.getElementById('ai-sug-groups');
  if (suggestions) suggestions.innerHTML = '';
}

function decrementSimulaQueries() {
  if (STATE.tier !== CONFIG.TIERS.SIMULA) return false;
  if (STATE.simulaQueriesRemaining <= 0) return true;
  STATE.simulaQueriesRemaining--;
  if (STATE.simulaQueriesRemaining <= 0) return true;
  return false;
}

async function sendAI(message) {
  if (STATE.tier === CONFIG.TIERS.SIMULA && STATE.simulaQueriesRemaining <= 0) {
    showToast('No AI queries remaining. Upgrade to Sigla for unlimited access.');
    return;
  }

  const timestamp = appendUserMessage(message);
  if (!timestamp) return;

  const isExhausted = decrementSimulaQueries();

  const context = buildAIContext();
  const chatHistory = AI_CHAT.messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.text }));
  chatHistory.push({ role: 'user', content: message });

  const result = await callLLM(chatHistory, context);
  const reply = result ? result.reply : keywordReply(message);
  if (result && result.mutations.length) applyMutations(result.mutations);

  replaceTypingIndicator(reply, timestamp);
  AI_CHAT.messages.push({ role: 'user', text: message, ts: timestamp }, { role: 'ai', text: reply, ts: timestamp });

  if (isExhausted) {
    updateSimulaCounter();
    lockSimulaChat();
  } else if (STATE.tier === CONFIG.TIERS.SIMULA) {
    updateSimulaCounter();
  }
}
