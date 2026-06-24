import { CONFIG } from '@/config'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function PlanCard({ plan, billing, onSelect }) {
  const price = billing === 'monthly' ? plan.monthly : plan.annual
  const period = billing === 'monthly' ? '/mo' : '/yr'
  const isFree = plan.monthly === 0
  const isPopular = plan.id === 'sigla'

  return (
    <div className={`rounded-2xl border ${isPopular ? 'border-blue-500 shadow-md' : 'border-gray-200'} bg-white p-5`}>
      {isPopular && (
        <div className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
          Most Popular
        </div>
      )}

      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">{plan.nameLabel}</div>
      <div className="text-xl font-extrabold text-gray-900">{plan.tier}</div>
      <div className="text-xs text-gray-400 italic mt-1 mb-4">{plan.tagline}</div>

      <div className="mb-4">
        {isFree ? (
          <span className="text-2xl font-extrabold text-green-600">FREE</span>
        ) : (
          <span>
            <span className="text-2xl font-extrabold text-gray-900">{CONFIG.CURRENCY_SYMBOL}{price.toLocaleString()}</span>
            <span className="text-sm text-gray-400">{period}</span>
          </span>
        )}
      </div>

      <ul className="space-y-2 mb-4">
        {plan.features.map((f, i) => (
          <li key={i} className="flex gap-2 text-xs text-gray-600">
            <CheckIcon /><span>{f}</span>
          </li>
        ))}
        {plan.notIncluded.map((f, i) => (
          <li key={i} className="flex gap-2 text-xs text-gray-300">
            <XIcon /><span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[.98] ${
          isFree
            ? 'bg-green-600 text-white hover:bg-green-700'
            : isPopular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {isFree ? 'Get Started — Free' : 'Select Plan'}
      </button>
    </div>
  )
}
