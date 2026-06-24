import { CONFIG } from '@/config'

export function getSuggestionChips(tier) {
  const chips = []

  const readGroup = [
    { label: '📊 View my transactions', msg: 'Show my recent transactions' },
    { label: '💰 Am I earning or losing?', msg: 'Am I earning or losing?' },
    { label: '📦 Check my inventory', msg: 'Show my inventory items' },
    { label: '⚠️ Am I overspending?', msg: 'Check if I am overspending' },
  ]
  chips.push({ label: 'Ask about your money', chips: readGroup })

  if (tier === CONFIG.TIERS.SIGLA || tier === CONFIG.TIERS.UNLAD) {
    const manageGroup = [
      { label: '➕ Add ₱500 supplies expense', msg: 'Add a transaction for 500 pesos supplies expense' },
      { label: '🏪 Add customer Juan', msg: 'Add a customer named Juan with contact 09171234567' },
      { label: '📋 Set stock alert on noodles', msg: 'Set stock threshold to 15 for noodles' },
    ]
    chips.push({ label: 'Manage your business', chips: manageGroup })
  }

  if (tier === CONFIG.TIERS.SIMULA) {
    const docGroup = [
      { label: '🧾 Generate a receipt', msg: 'Generate a receipt for 2 kg Jasmine Rice at P50 each and 1L Coconut Cooking Oil at P120, paid in cash' },
    ]
    chips.push({ label: 'Generate documents', chips: docGroup })
  }

  if (tier === CONFIG.TIERS.SIGLA || tier === CONFIG.TIERS.UNLAD) {
    const docGroup = [
      { label: '🧾 Receipt for supplies', msg: 'Generate a receipt for Juan dela Cruz: 5 boxes of Ligo Sardines at P240 each, 3 packs Nescafe Coffee at P85 each, paid via GCash' },
      { label: '📄 Invoice for customer', msg: 'Create an invoice for Sari Foods Supply: 10 bags Sinandomeng Rice 25kg at P1,250 each, payment due in 7 days via Bank Transfer' },
      { label: '📈 Weekly sales report', msg: 'Generate a weekly report. Sales P18,450 expenses P7,820. Strongest day Friday P1,240. Categories: Supplies P3,200 (41%), Labor P1,800 (23%), Utilities P800 (10%). Write summary in Taglish and give 2 tips.' },
    ]
    chips.push({ label: 'Generate documents', chips: docGroup })
  }

  if (tier === CONFIG.TIERS.UNLAD) {
    const planGroup = [
      { label: '🎯 Set a goal to save ₱50K', msg: 'Set a financial goal to save 50000 pesos by December' },
      { label: '📈 Forecast my cash flow', msg: 'What is my 30-day cash flow forecast?' },
      { label: '🧾 Check BIR tax deadlines', msg: 'Check my BIR tax deadlines' },
      { label: '📦 What needs restocking?', msg: 'What items need restocking?' },
      { label: '📊 Monthly P&L report', msg: 'Generate a monthly P&L report for June. Gross sales P61,200, COGS P28,400, operating expenses P9,200, net profit P23,600. Categories: Supplies 45%, Labor 26%, Utilities 11%, Rent 11%, Marketing 7%.' },
    ]
    chips.push({ label: 'Plan ahead', chips: planGroup })
  }

  return chips
}
