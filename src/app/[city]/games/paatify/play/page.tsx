'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Share2, Check, Timer, Trophy, Music, ArrowLeft } from 'lucide-react'
import {
  getPaatifyPuzzleForToday, checkPaatifyAnswer, formatPaatifyTime,
  getTodayISTPatify, PAATIFY_PUZZLES, type PaatifyPuzzle
} from '@/data/paatify'

type GameStatus = 'playing' | 'countdown' | 'won' | 'lost'
const STORAGE_PREFIX = 'outsyd-paatify-'

export default function PaatifyPlayPage() {
  const puzzleRef = useRef<PaatifyPuzzle | null>(null)
  const [status, setStatus] = useState<GameStatus>('playing')
  const [hintIndex, setHintIndex] = useState(0)
  const [guesses, setGuesses] = useState<string[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [finalElapsed, setFinalElapsed] = useState(0)
  const [guessCount, setGuessCount] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [lastWrong, setLastWrong] = useState('')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [ready, setReady] = useState(false)
  const [midnightCountdown, setMidnightCountdown] = useState('')
  const [suggestions, setSuggestions] = useState<{ trackName: string; artistName: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const startTsRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const guessesRef = useRef<string[]>([])
  guessesRef.current = guesses
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cacheRef = useRef<Record<string, { trackName: string; artistName: string }[]>>({})

  // ── Init ──────────────────────────────────────────────────────
  useEffect(() => {
    puzzleRef.current = getPaatifyPuzzleForToday()
    const today = getTodayISTPatify()
    const raw = localStorage.getItem(STORAGE_PREFIX + today)
    if (raw) {
      try {
        const d = JSON.parse(raw)
        if (d.date === today) {
          startTsRef.current = d.startTimestamp || Date.now()
          setStatus(d.status)
          setGuesses(d.guesses || [])
          setHintIndex(d.hintIndex || 0)
          setFinalElapsed(d.finalElapsed || 0)
          setGuessCount(d.guessCount || 0)
          if (d.status === 'playing') {
            setElapsed(Math.floor((Date.now() - startTsRef.current) / 1000))
          }
        }
      } catch { /**/ }
    } else {
      startTsRef.current = Date.now()
    }
    setReady(true)
  }, [])

  // ── Persist ───────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return
    const today = getTodayISTPatify()
    localStorage.setItem(STORAGE_PREFIX + today, JSON.stringify({
      date: today, status, guesses, hintIndex,
      startTimestamp: startTsRef.current, finalElapsed, guessCount,
    }))
  }, [status, guesses, hintIndex, finalElapsed, guessCount, ready])

  // ── Midnight Countdown ────────────────────────────────────────
  useEffect(() => {
    if (status !== 'won' && status !== 'lost') return
    function tick() {
      const now = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000
      const istNow = new Date(now.getTime() + istOffset)
      const nextMidnightIST = new Date(
        Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + 1)
        - istOffset
      )
      const diff = Math.max(0, Math.floor((nextMidnightIST.getTime() - now.getTime()) / 1000))
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setMidnightCountdown(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status])

  // ── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'won' || status === 'lost') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTsRef.current) / 1000))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [status])

  // ── Countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'countdown') return
    let count = 3
    setCountdown(3)
    const id = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(id)
        const g = guessesRef.current
        if (g.length >= 5) {
          setFinalElapsed(Math.floor((Date.now() - startTsRef.current) / 1000))
          setStatus('lost')
        } else {
          setHintIndex(g.length)
          setStatus('playing')
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [status])

  // ── Autocomplete ──────────────────────────────────────────────
  async function fetchSuggestions(query: string) {
    if (query.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    const key = query.trim().toLowerCase()
    // Cache hit — no API call needed
    if (cacheRef.current[key]) {
      setSuggestions(cacheRef.current[key])
      setShowSuggestions(true)
      return
    }
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&country=IN&limit=8&explicit=No`
      )
      const data = await res.json()
      const results = (data.results ?? []).map((r: { trackName: string; artistName: string }) => ({
        trackName: r.trackName,
        artistName: r.artistName,
      }))
      cacheRef.current[key] = results
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch { /**/ }
  }

  function handleInputChange(value: string) {
    setInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) { setSuggestions([]); setShowSuggestions(false); return }
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 400)
  }

  function selectSuggestion(name: string) {
    setInput(name)
    setSuggestions([])
    setShowSuggestions(false)
  }

  // ── Guess Handler ─────────────────────────────────────────────
  function handleGuess() {
    if (!puzzleRef.current || !input.trim() || status !== 'playing') return
    const trimmed = input.trim()
    if (checkPaatifyAnswer(trimmed, puzzleRef.current)) {
      setFinalElapsed(Math.floor((Date.now() - startTsRef.current) / 1000))
      setGuessCount(hintIndex + 1)
      setStatus('won')
      setInput('')
    } else {
      const next = [...guesses, trimmed]
      setGuesses(next)
      setInput('')
      if (next.length >= 5) {
        setFinalElapsed(Math.floor((Date.now() - startTsRef.current) / 1000))
        setStatus('lost')
      } else {
        setLastWrong(trimmed)
        setStatus('countdown')
      }
    }
  }

  // ── Share ─────────────────────────────────────────────────────
  async function handleShare() {
    const puzzle = puzzleRef.current
    if (!puzzle) return
    const emojis = Array(5).fill('').map((_, i) => {
      if (status === 'won' && i === guessCount - 1) return '🟩'
      if (i < guesses.length) return '🟥'
      return '⬛'
    }).join('')
    const puzzleIndex = PAATIFY_PUZZLES.findIndex(p => p.id === puzzle.id)
    const puzzleNumber = puzzleIndex >= 0 ? puzzleIndex + 1 : '?'
    const text = status === 'won'
      ? `🎵 Paatify #${puzzleNumber}\nI guessed today's Tamil song in ${guessCount}/5 hints! ⏱️ ${formatPaatifyTime(finalElapsed)}\n\n${emojis}\n\nCan you beat my score? outsyd.in/chennai/games/paatify`
      : `🎵 Paatify #${puzzleNumber}\n\nI couldn't crack today's Tamil song 😔 Can you?\n\n🟥🟥🟥🟥🟥\n\noutsyd.in/chennai/games/paatify`
    if (navigator.share) { try { await navigator.share({ text }) } catch { /**/ } }
    else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (!ready) return null

  const puzzle = puzzleRef.current
  const puzzleIndex = puzzle ? PAATIFY_PUZZLES.findIndex(p => p.id === puzzle.id) : -1
  const puzzleNumber = puzzleIndex >= 0 ? puzzleIndex + 1 : '?'
  const dateDisplay = `Paatify #${puzzleNumber}`
  const displayTime = (status === 'won' || status === 'lost') ? finalElapsed : elapsed

  if (!puzzle) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>No song today</h1>
          <p style={{ color: 'var(--text-3)', marginBottom: 24, fontSize: 14 }}>Come back tomorrow for a new Tamil song!</p>
          <Link href="/" style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>← Back to Outsyd</Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <style>{`
        @keyframes wrongAppear {
          0% { transform: scale(0.95); opacity: 0; }
          60% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes countPop {
          0% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes wonAppear {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes hintFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hint-card { animation: hintFade 0.4s ease; }
        .wrong-card {
          animation: wrongAppear 0.35s ease forwards;
          box-shadow: 0 0 0 2px rgba(239,68,68,0.4), 0 0 60px rgba(239,68,68,0.3);
        }
        .won-card { animation: wonAppear 0.4s ease forwards; }
        .guess-btn { transition: all 0.2s ease; }
        .guess-btn:hover { opacity: 0.85; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(139,92,246,0.4); }
        .guess-btn:active { opacity: 0.75; transform: translateY(0); box-shadow: none; }
        .share-btn:hover { opacity: 0.85; }
        @keyframes suggestFade {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .suggestions-list { animation: suggestFade 0.15s ease; }
        .suggestion-item { transition: background 0.15s; cursor: pointer; }
        .suggestion-item:hover { background: rgba(139,92,246,0.12) !important; }
      `}</style>

      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80, paddingBottom: 60 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>

          {/* ── Header ── */}
          {(status === 'playing' || status === 'countdown') && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Music size={16} color="#8b5cf6" />
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                    Guess this Song
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{dateDisplay}</p>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#8b5cf6', letterSpacing: '-0.02em' }}>
                Hint {hintIndex + 1}
              </span>
            </div>
          )}

          {/* ── Main Area ── */}
          {status === 'won' ? (
            <WonCard puzzle={puzzle} guessCount={guessCount} finalElapsed={finalElapsed} guesses={guesses} onShare={handleShare} copied={copied} />
          ) : status === 'lost' ? (
            <LostCard puzzle={puzzle} onShare={handleShare} copied={copied} />
          ) : status === 'countdown' ? (
            <WrongCountdownCard guess={lastWrong} countdown={countdown} />
          ) : (
            <div className="hint-card" key={hintIndex} style={{
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(109,40,217,0.05) 100%)',
              border: '1.5px solid rgba(139,92,246,0.25)',
              padding: '48px 32px',
              textAlign: 'center',
              minHeight: 220,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(139,92,246,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>
                Hint {hintIndex + 1} of 5
              </div>
              <div style={{ fontSize: 48, color: 'rgba(139,92,246,0.25)', lineHeight: 0.7, fontFamily: 'Georgia, serif', fontWeight: 700, marginBottom: 12 }}>❝</div>
              <p style={{
                fontSize: 20, fontStyle: 'italic',
                color: 'var(--text)', lineHeight: 1.75,
                fontWeight: 500, letterSpacing: '0.01em',
                maxWidth: 380,
              }}>
                {hintIndex === 4
                  ? puzzle.hints.map(h => h.trim().replace(/\.+$/, '')).join('. ') + '.'
                  : puzzle.hints[hintIndex]}
              </p>
              <div style={{ fontSize: 48, color: 'rgba(139,92,246,0.25)', lineHeight: 0.7, fontFamily: 'Georgia, serif', fontWeight: 700, marginTop: 12 }}>❞</div>
            </div>
          )}

          {/* ── Hint Dots ── */}
          {(status === 'playing' || status === 'countdown') && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  width: i === hintIndex ? 20 : 8, height: 8,
                  borderRadius: 4, transition: 'all 0.3s ease',
                  background: i === hintIndex ? '#8b5cf6' : 'var(--border)',
                }} />
              ))}
            </div>
          )}

          {/* ── Input ── */}
          {status === 'playing' && (
            <div style={{ marginTop: 20 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGuess()}
                    placeholder="Yennamo Edho..."
                    autoComplete="off"
                    style={{
                      flex: 1, padding: '14px 16px',
                      background: 'var(--bg-card)', border: '1.5px solid var(--border)',
                      borderRadius: 12, color: 'var(--text)', fontSize: 15,
                      outline: 'none', fontFamily: 'inherit',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = '#8b5cf6'
                      if (suggestions.length > 0) setShowSuggestions(true)
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      setTimeout(() => setShowSuggestions(false), 150)
                    }}
                  />
                  <button
                    onClick={handleGuess}
                    className="guess-btn"
                    style={{
                      padding: '14px 22px', borderRadius: 12,
                      background: '#8b5cf6',
                      border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    Guess →
                  </button>
                </div>
                {/* ── Suggestions Dropdown ── */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions-list" style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    marginTop: 4, borderRadius: 12, overflow: 'hidden',
                    border: '1.5px solid rgba(139,92,246,0.25)',
                    background: 'var(--bg-elevated)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    zIndex: 50,
                  }}>
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="suggestion-item"
                        onMouseDown={() => selectSuggestion(s.trackName)}
                        style={{
                          padding: '11px 16px',
                          borderBottom: i < suggestions.length - 1 ? '1px solid rgba(139,92,246,0.1)' : 'none',
                          background: 'transparent',
                        }}
                      >
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>{s.trackName}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.artistName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: '0 2px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Timer size={11} />{formatPaatifyTime(displayTime)}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
                  {5 - guesses.length} {5 - guesses.length === 1 ? 'Chance' : 'Chances'} Left
                </span>
              </div>
            </div>
          )}

          {/* ── Wrong Guesses History ── */}
          {guesses.length > 0 && status !== 'won' && status !== 'lost' && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Wrong guesses
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {guesses.map((g, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                    fontSize: 13, fontWeight: 600, color: '#f87171',
                  }}>
                    <span>✗</span> {g}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Next Puzzle Countdown ── */}
          {(status === 'won' || status === 'lost') && midnightCountdown && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginBottom: 4 }}>
                Come back tomorrow for a new song in{' '}
                <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                  {midnightCountdown}
                </span>
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
                Go to <span style={{ color: 'var(--text-2)', fontWeight: 700 }}>outsyd.in/chennai/games/paatify</span>
              </p>
            </div>
          )}

        </div>
      </main>
    </>
  )
}

// ── Sub-components ──────────────────────────────────────────────────

function WrongCountdownCard({ guess, countdown }: { guess: string; countdown: number }) {
  return (
    <div className="wrong-card" style={{
      borderRadius: 16, background: '#1a0a0a',
      border: '1.5px solid rgba(239,68,68,0.5)',
      padding: '40px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f87171', marginBottom: 6 }}>Wrong Guess!</h2>
      <p style={{ fontSize: 14, color: 'rgba(248,113,113,0.7)', marginBottom: 28 }}>&quot;{guess}&quot;</p>
      <div key={countdown} style={{
        fontSize: 64, fontWeight: 900, color: '#ef4444', lineHeight: 1,
        animation: 'countPop 0.3s ease forwards',
      }}>
        {countdown}
      </div>
      <p style={{ fontSize: 13, color: 'rgba(248,113,113,0.6)', marginTop: 12 }}>
        {countdown === 0 ? 'Loading next hint…' : `Next hint in ${countdown} second${countdown !== 1 ? 's' : ''}`}
      </p>
    </div>
  )
}

function WonCard({
  puzzle, guessCount, finalElapsed, guesses, onShare, copied,
}: {
  puzzle: PaatifyPuzzle; guessCount: number; finalElapsed: number
  guesses: string[]; onShare: () => void; copied: boolean
}) {
  const emojis = Array(5).fill('').map((_, i) => {
    if (i === guessCount - 1) return '🟩'
    if (i < guesses.length) return '🟥'
    return '⬛'
  }).join('')

  return (
    <div className="won-card" style={{
      borderRadius: 16,
      background: 'rgba(139,92,246,0.07)',
      border: '1.5px solid rgba(139,92,246,0.35)',
      padding: '32px 24px', textAlign: 'center',
      boxShadow: '0 0 40px rgba(139,92,246,0.15)',
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#a78bfa', marginBottom: 6, letterSpacing: '-0.02em' }}>
        Correct! You&apos;re a Paatify Pro!
      </h2>
      <p style={{ fontSize: 15, color: 'var(--text-2)', fontWeight: 600, marginBottom: 24 }}>
        🎵 {puzzle.song}
        <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 400 }}> — {puzzle.movie} ({puzzle.year})</span>
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#a78bfa' }}>{guessCount}/5</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hints Used</p>
        </div>
        <div style={{ width: 1, background: 'var(--border)' }} />
        <div>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#a78bfa' }}>{formatPaatifyTime(finalElapsed)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time</p>
        </div>
      </div>

      <div style={{ fontSize: 28, letterSpacing: 6, marginBottom: 8 }}>{emojis}</div>

      <button onClick={onShare} className="share-btn" style={{
        padding: '10px 20px', borderRadius: 10,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        color: 'var(--text-2)', fontSize: 13, fontWeight: 700,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'opacity 0.2s', marginBottom: 12,
      }}>
        {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Share Result</>}
      </button>

      <Link href="/" style={{
        display: 'block', padding: '12px 16px',
        background: '#8b5cf6', borderRadius: 12,
        fontSize: 13, color: '#fff', textDecoration: 'none', fontWeight: 700,
        lineHeight: 1.4,
      }}>
        Explore 200+ Activities &amp; Side Quests in Chennai →
      </Link>
    </div>
  )
}

function LostCard({ puzzle, onShare, copied }: { puzzle: PaatifyPuzzle; onShare: () => void; copied: boolean }) {
  return (
    <div style={{
      borderRadius: 16, background: 'var(--bg-card)',
      border: '1.5px solid var(--border)', padding: '32px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>😔</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Game Over!</h2>
      <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>The song was…</p>

      <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 8 }}>
        <p style={{ fontSize: 24, fontWeight: 900, color: '#a78bfa', letterSpacing: '-0.02em' }}>
          {puzzle.song}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
          {puzzle.movie} ({puzzle.year})
        </p>
      </div>

      <div style={{ fontSize: 28, letterSpacing: 6, marginBottom: 20 }}>🟥🟥🟥🟥🟥</div>

      <button onClick={onShare} className="share-btn" style={{
        padding: '10px 20px', borderRadius: 10,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        color: 'var(--text-2)', fontSize: 13, fontWeight: 700,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'opacity 0.2s', marginBottom: 12,
      }}>
        {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Challenge Your Friends</>}
      </button>

      <Link href="/" style={{
        display: 'block', padding: '12px 16px',
        background: '#8b5cf6', borderRadius: 12,
        fontSize: 13, color: '#fff', textDecoration: 'none', fontWeight: 700,
        lineHeight: 1.4,
      }}>
        Explore 200+ Activities &amp; Side Quests in Chennai →
      </Link>
    </div>
  )
}
