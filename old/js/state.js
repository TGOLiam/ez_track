/* ============================================================
   EzTrack – Application State
   Single source of truth for runtime data.
   Configuration (PLANS, CONFIG.TIER_META, etc.) lives in config.js.
   ============================================================ */

const STATE = {
  profileId: null,
  user: null,
  business: null,
  tier: CONFIG.DEFAULT_TIER,
  billing: 'monthly',
  currentTab: 'home',
  transactionType: CONFIG.TX.INCOME,
  transactions: [],
  nextTransactionId: 1,
  inventory: [],
  customers: [],
  goals: [],
  simulaQueriesRemaining: CONFIG.AI_QUERY_LIMIT,
};

/* Weekly bar-chart seed data (demo only; production would compute from transactions) */
const WEEKDATA = [
  { day: 'Mon', income: 820,  expense: 440 },
  { day: 'Tue', income: CONFIG.SPLASH_FADE_MS,  expense: 320 },
  { day: 'Wed', income: 1020, expense: 580 },
  { day: 'Thu', income: 740,  expense: 200 },
  { day: 'Fri', income: 1240, expense: 650 },
  { day: 'Sat', income: 980,  expense: 340 },
  { day: 'Sun', income: 660,  expense: 110 },
];

/* AI conversation history (session-scoped) */
const AI_CHAT = {
  messages: [
    {
      role: 'ai',
      text: "Kamusta! I've been watching your finances. This week you earned <strong>₱6,020</strong> and spent <strong>₱1,200</strong> on supplies. Net: <strong>₱4,820</strong>. Maganda! Anything you want to check?",
      timestamp: '8:02 AM',
    },
  ],
};

/* Keyword-response map for the demo AI (fallback when LLM is unreachable) */
const AI_RESPONSES = {
  'can i afford to restock':  "Based on your cash position (₱2,340 available) and usual restock cost of ₱480–₱620, yes — you can afford it. Best to order Thursday before your weekend sales spike. 👍",
  'how much did i spend':     "Last week your total expenses were ₱1,200. Breakdown: Supplies ₱820, Utilities ₱380. That's 20% lower than the week before. 📉",
  'which category is highest': "Supplies is your #1 expense category this month at ₱3,200 (41% of total expenses). Consider bulk ordering to reduce per-unit cost.",
  'am i earning or losing':   "You're earning! Net this week: +₱4,820. Net this month so far: +₱10,630. You're on a positive trend for 3 consecutive weeks. 🎉",
  'can i restock this week':  "Yes! Your cash position supports a restock. Based on your history, a full restock costs around ₱580. Go for it before Friday — your best sales day.",
  'can i afford to hire':     "Based on your current net margins (₱10,630/month) and typical daily-rate staff cost (₱400–₱450/day), you can support 1 part-time staff member. Just watch your monthly cost vs. your ₱50K goal.",
  'am i on track for my goal': "You're at 76% (₱38,000 of ₱50,000). You need ₱12,000 more in 12 days. That's ₱1,000/day in net earnings — doable based on your recent daily average of ₱1,120.",
  'forecast next 30 days':    "Based on the last 3 months, your projected July income is ₱22,000–₱26,000. Main risk: Supplies costs have been trending up 8% month-over-month.",
  'bir deadline status':      "Your next BIR quarterly deadline is July 25. Estimated 3% percentage tax based on current revenue: ₱1,150. I've set aside a reminder for July 20.",
  'p&l this month':           "June P&L — Revenue: ₱61,200 · COGS: ₱28,400 · Operating Expenses: ₱9,200 · Net Profit: ₱23,600. That's a 38.6% net margin — very healthy for an SMB!",
};
