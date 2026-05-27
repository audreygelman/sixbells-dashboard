'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F3ECD9' }}>
      <div className="rounded-xl border p-8 w-full max-w-sm" style={{ backgroundColor: '#FFFAF1', borderColor: '#1D371E' }}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#1D371E' }}>The Six Bells</h1>
          <p className="text-sm mt-1" style={{ color: '#1D371E', opacity: 0.5 }}>Performance Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: '#1D371E' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none border"
              style={{ borderColor: '#1D371E', backgroundColor: '#F3ECD9', color: '#1D371E' }}
              placeholder="Enter password"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-700">Incorrect password. Try again.</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg py-2 text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1D371E', color: '#F3ECD9' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
