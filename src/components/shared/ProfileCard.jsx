import { CONFIG } from '@/config'

export default function ProfileCard({ profile, onSelect }) {
  const tierMeta = CONFIG.TIER_META[profile.tier]
  const bizIcon = CONFIG.BIZ_ICONS[profile.biz_type] || '💼'

  return (
    <button
      onClick={() => onSelect(profile.id)}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow text-left cursor-pointer"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ backgroundColor: tierMeta.color }}
      >
        {profile.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 text-sm">{profile.name}</div>
        <div className="text-xs text-gray-400 truncate">
          {bizIcon} {profile.biz_name} · {profile.biz_city}
        </div>
      </div>
      <span
        className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
        style={{
          backgroundColor: tierMeta.color + '20',
          color: tierMeta.color,
        }}
      >
        {CONFIG.TIER_CARD_LABELS[profile.tier]}
      </span>
    </button>
  )
}
