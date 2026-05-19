import { useState } from 'react'

export default function UsernameModal({ onJoin }) {
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onJoin(trimmed)
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm border border-purple-100 shadow-sm">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3 select-none">🌱</div>
          <h1 className="text-2xl font-bold text-purple-700">Seedling</h1>
          <p className="text-sm text-purple-400 mt-1">A cozy space for your team</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
            Your display name
          </label>
          <input
            autoFocus
            type="text"
            placeholder="e.g. Kia, Kaye, AJ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="
              w-full px-4 py-3 rounded-2xl text-sm
              border border-purple-200 bg-purple-50
              text-purple-900 placeholder-purple-300
              focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white
              transition-all duration-200
            "
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="
              w-full py-3 rounded-2xl text-sm font-semibold
              bg-purple-600 text-white
              hover:bg-purple-700 active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            Enter Seedling ✨
          </button>
        </form>

        <p className="text-center text-xs text-purple-300 mt-5">
          No account needed — just pick a name
        </p>
      </div>
    </div>
  )
}
