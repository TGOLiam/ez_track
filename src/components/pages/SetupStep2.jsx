import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CONFIG } from '@/config'

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.127-.087.668-.087.668l-2.002 9.499s-.113.488-.544.488a.982.982 0 01-.78-.385c-.172-.223-.284-.373-.284-.373s-.487-.31-1.094-.594c-.37-.173-.63-.03-.722.045-.246.204-.738.716-.738.716s-.156.111-.328.036c-.236-.103-.356-.173-.356-.173s-1.577-.97-2.637-1.653c-.269-.168-.556-.347-.39-.594.1-.15.292-.335.292-.335s1.465-1.306 1.857-1.664c.372-.34.5-.162.19-.495-.376-.405-1.777-1.861-2.08-2.167-.21-.213-.158-.374.002-.484.147-.102.512-.176.512-.176l3.62-1.375s1.064-.397 1.064-.233c0 .012-.024.036-.024.036z" />
    </svg>
  )
}

export default function SetupStep2() {
  const navigate = useNavigate()
  const [tgCode] = useState(() => {
    const code = CONFIG.TG_CODE_MIN + Math.floor(Math.random() * CONFIG.TG_CODE_RANGE)
    return `EZT-${code}`
  })

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-6">
      <div className="mb-6">
        <div className="text-[11px] font-bold text-blue-600 mb-1">STEP 2 OF 2</div>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Connect to<br />EzTrack Bot</h1>
        <p className="text-sm text-gray-400 mt-1">Link your Telegram for daily updates</p>
        <div className="flex gap-2 mt-3">
          <div className="w-8 h-1.5 rounded-full bg-blue-600" />
          <div className="w-8 h-1.5 rounded-full bg-blue-600" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <TelegramIcon />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800">@EzTrackBot</div>
              <div className="text-xs text-gray-400">Telegram Bot</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Open Telegram</div>
                <div className="text-xs text-gray-400">Search for @EzTrackBot or tap the link</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Send this code</div>
                <div className="text-xs text-gray-400">Paste your unique link code to the bot</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <div className="font-semibold text-sm text-gray-800">You're connected!</div>
                <div className="text-xs text-gray-400">Get daily heartbeat summaries automatically</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 mb-6">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Your Link Code</div>
          <div className="text-2xl font-extrabold text-gray-900 tracking-wider">{tgCode}</div>
          <p className="text-xs text-gray-400 mt-1">Tap to copy, then send to @EzTrackBot</p>
        </div>

        <button
          onClick={() => navigate('/app/home')}
          className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[.98] transition-all mb-2"
        >
          I've Connected — Take Me In!
        </button>
        <button
          onClick={() => navigate('/app/home')}
          className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Skip for Now
        </button>
      </div>
    </div>
  )
}
