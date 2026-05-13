'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Share2, Check, Timer, Trophy, MapPin, ArrowLeft } from 'lucide-react'
import { getPuzzleForToday, checkAnswer, formatTime, getTodayIST, type GamePuzzle } from '@/data/game'

type GameStatus = 'playing' | 'countdown' | 'won' | 'lost'
const STORAGE_PREFIX = 'outsyd-game-'

export default function GamePage() {
  const puzzleRef = useRef<GamePuzzle | null>(null)
  const [status, setStatus] = useState<GameStatus>('playing')
  const [imageIndex, setImageIndex] = useState(0)
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

  const startTsRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const guessesRef = useRef<string[]>([])
  guessesRef.current = guesses

  // ── Init ──────────────────────────────────────────────────────
  useEffect(() => {
    puzzleRef.current = getPuzzleForToday()
    const today = getTodayIST()
    const raw = localStorage.getItem(STORAGE_PREFIX + today)
    if (raw) {
      try {
        const d = JSON.parse(raw)
        if (d.date === today) {
          startTsRef.current = d.startTimestamp || Date.now()
          setStatus(d.status)
          setGuesses(d.guesses || [])
          setImageIndex(d.imageIndex || 0)
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
    const today = getTodayIST()
    localStorage.setItem(STORAGE_PREFIX + today, JSON.stringify({
      date: today, status, guesses, imageIndex,
      startTimestamp: startTsRef.current, finalElapsed, guessCount,
    }))
  }, [status, guesses, imageIndex, finalElapsed, guessCount, ready])

  // ── Midnight Countdown ────────────────────────────────────────
  useEffect(() => {
    if (status !== 'won' && status !== 'lost') return
    function tick() {
      const now = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000
      // Get current time expressed in IST
      const istNow = new Date(now.getTime() + istOffset)
      // Next midnight IST = start of next IST day in UTC (subtract offset back)
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
        if (g.length >= 3) {
          setFinalElapsed(Math.floor((Date.now() - startTsRef.current) / 1000))
          setStatus('lost')
        } else {
          setImageIndex(g.length)
          setStatus('playing')
        }
      }
    }, 1000)
    return () => clearInterval(id)
  }, [status])

  // ── Guess Handler ─────────────────────────────────────────────
  function handleGuess() {
    if (!puzzleRef.current || !input.trim() || status !== 'playing') return
    const trimmed = input.trim()
    if (checkAnswer(trimmed, puzzleRef.current)) {
      setFinalElapsed(Math.floor((Date.now() - startTsRef.current) / 1000))
      setGuessCount(imageIndex + 1)
      setStatus('won')
      setInput('')
    } else {
      const next = [...guesses, trimmed]
      setGuesses(next)
      setInput('')
      if (next.length >= 3) {
        // Final wrong guess — show result immediately
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
    const emojis = Array(3).fill('').map((_, i) => {
      if (status === 'won' && i === guessCount - 1) return '🟩'
      if (i < guesses.length) return '🟥'
      return '⬛'
    }).join('')
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
    })
    const text = status === 'won'
      ? `📍 Route Thala — ${dateStr}\nI guessed today's mystery spot in Chennai in ${guessCount}/3 tries! ⏱️ ${formatTime(finalElapsed)}\n\n${emojis}\n\nPlay at: outsyd.in/chennai/game`
      : `📍 Route Thala — ${dateStr}\n\nI couldn't guess today's mystery spot in Chennai 😔 Can you guess it?\n\nPlay at: outsyd.in/chennai/game`
    if (navigator.share) { try { await navigator.share({ text }) } catch { /**/ } }
    else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (!ready) return null

  const puzzle = puzzleRef.current
  const displayTime = (status === 'won' || status === 'lost') ? finalElapsed : elapsed
  const today = getTodayIST()
  const dateDisplay = new Date(today + 'T12:00:00+05:30').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata',
  })

  // ── No Puzzle State ───────────────────────────────────────────
  if (!puzzle) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>No puzzle today</h1>
          <p style={{ color: 'var(--text-3)', marginBottom: 24, fontSize: 14 }}>Come back tomorrow for a new Chennai spot!</p>
          <Link href="/" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>← Back to Outsyd</Link>
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
        @keyframes imgFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .wrong-card {
          animation: wrongAppear 0.35s ease forwards;
          box-shadow: 0 0 0 2px rgba(239,68,68,0.4), 0 0 60px rgba(239,68,68,0.35);
        }
        .won-card { animation: wonAppear 0.4s ease forwards; }
        .game-img { animation: imgFade 0.4s ease; }
        .guess-btn:hover { opacity: 0.85; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,107,0,0.35); }
        .guess-btn:active { opacity: 0.75; transform: translateY(0); box-shadow: none; }
        .share-btn:hover { opacity: 0.85; }
      `}</style>

      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80, paddingBottom: 60 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>

          {/* ── Header ── */}
          {(status === 'playing' || status === 'countdown') && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0 20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <MapPin size={16} color="var(--accent)" />
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  Guess this {puzzle.placeType}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{dateDisplay}</p>
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
              Hint {imageIndex + 1}
            </span>
          </div>
          )}

          {/* ── Image / Countdown / Result Area ── */}
          {status === 'won' ? (
            <WonCard puzzle={puzzle} guessCount={guessCount} finalElapsed={finalElapsed} guesses={guesses} onShare={handleShare} copied={copied} />
          ) : status === 'lost' ? (
            <LostCard puzzle={puzzle} onShare={handleShare} copied={copied} />
          ) : status === 'countdown' ? (
            <WrongCountdownCard guess={lastWrong} countdown={countdown} />
          ) : (
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <img
                key={imageIndex}
                src={puzzle.images[imageIndex]}
                alt={`Clue ${imageIndex + 1}`}
                className="game-img"
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* ── Image Dots ── */}
          {(status === 'playing' || status === 'countdown') && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: i === imageIndex ? 20 : 8, height: 8,
                  borderRadius: 4, transition: 'all 0.3s ease',
                  background: i === imageIndex ? 'var(--accent)' : 'var(--border)',
                }} />
              ))}
            </div>
          )}

          {/* ── Input ── */}
          {status === 'playing' && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGuess()}
                  placeholder="Type a Chennai place or area..."
                  autoComplete="off"
                  style={{
                    flex: 1, padding: '14px 16px',
                    background: 'var(--bg-card)', border: '1.5px solid var(--border)',
                    borderRadius: 12, color: 'var(--text)', fontSize: 15,
                    outline: 'none', fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                />
                <button
                  onClick={handleGuess}
                  className="guess-btn"
                  style={{
                    padding: '14px 22px', borderRadius: 12,
                    background: 'var(--accent)',
                    border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                  }}
                >
                  Guess →
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: '0 2px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Timer size={11} />{formatTime(displayTime)}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
                  {3 - guesses.length} {3 - guesses.length === 1 ? 'Chance' : 'Chances'} Left
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
            <p style={{
              textAlign: 'center', marginTop: 20,
              fontSize: 12, color: 'var(--text-3)', fontWeight: 500,
            }}>
              Come back Tomorrow for a New {puzzle.placeType}. Loading in{' '}
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-2)' }}>
                {midnightCountdown}
              </span>
            </p>
          )}

        </div>
      </main>
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────

function WrongCountdownCard({ guess, countdown }: { guess: string; countdown: number }) {
  return (
    <div className="wrong-card" style={{
      borderRadius: 16, background: '#1a0a0a',
      border: '1.5px solid rgba(239,68,68,0.5)',
      padding: '40px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f87171', marginBottom: 6 }}>Wrong Guess!</h2>
      <p style={{ fontSize: 14, color: 'rgba(248,113,113,0.7)', marginBottom: 28 }}>"{guess}"</p>
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
  puzzle: GamePuzzle; guessCount: number; finalElapsed: number
  guesses: string[]; onShare: () => void; copied: boolean
}) {
  const emojis = Array(3).fill('').map((_, i) => {
    if (i === guessCount - 1) return '🟩'
    if (i < guesses.length) return '🟥'
    return '⬛'
  }).join('')

  return (
    <div className="won-card" style={{
      borderRadius: 16, background: 'rgba(34,197,94,0.06)',
      border: '1.5px solid rgba(34,197,94,0.3)',
      padding: '32px 24px', textAlign: 'center',
      boxShadow: '0 0 40px rgba(34,197,94,0.12)',
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>😎</div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#4ade80', marginBottom: 24, letterSpacing: '-0.02em' }}>
        Correct Guess! You&apos;re a Route Thala.
      </h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#4ade80' }}>{guessCount}/3</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tries</p>
        </div>
        <div style={{ width: 1, background: 'var(--border)' }} />
        <div>
          <p style={{ fontSize: 20, fontWeight: 900, color: '#4ade80' }}>{formatTime(finalElapsed)}</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time</p>
        </div>
      </div>

      <div style={{ fontSize: 28, letterSpacing: 6, marginBottom: 20 }}>{emojis}</div>

      <button onClick={onShare} className="share-btn" style={{
        padding: '10px 20px', borderRadius: 10,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        color: 'var(--text-2)', fontSize: 13, fontWeight: 700,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'opacity 0.2s',
      }}>
        {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Share Result</>}
      </button>

      <Link href="/" style={{
        display: 'block', marginTop: 16, padding: '12px 16px',
        background: 'var(--accent)', borderRadius: 12,
        border: 'none',
        fontSize: 13, color: '#fff', textDecoration: 'none', fontWeight: 700,
        lineHeight: 1.4,
      }}>
        Explore 200+ Activities &amp; Side Quests in Chennai →
      </Link>
    </div>
  )
}

function LostCard({ puzzle, onShare, copied }: { puzzle: GamePuzzle; onShare: () => void; copied: boolean }) {
  return (
    <div style={{
      borderRadius: 16, background: 'var(--bg-card)',
      border: '1.5px solid var(--border)', padding: '32px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>😔</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Game Over!</h2>
      <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 24 }}>The answer was…</p>

      <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
          {puzzle.location}
        </p>
      </div>

      <div style={{ fontSize: 28, letterSpacing: 6, marginBottom: 20 }}>🟥🟥🟥</div>

      <button onClick={onShare} className="share-btn" style={{
        padding: '10px 20px', borderRadius: 10,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        color: 'var(--text-2)', fontSize: 13, fontWeight: 700,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
        transition: 'opacity 0.2s',
      }}>
        {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> Challenge Your Friends to Guess</>}
      </button>

      <Link href="/" style={{
        display: 'block', marginTop: 16, padding: '12px 16px',
        background: 'var(--accent)', borderRadius: 12,
        border: 'none',
        fontSize: 13, color: '#fff', textDecoration: 'none', fontWeight: 700,
        lineHeight: 1.4,
      }}>
        Explore 200+ Activities &amp; Side Quests in Chennai →
      </Link>
    </div>
  )
}
