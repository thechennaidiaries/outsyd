'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Music, Mic2, Share2, PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchPaatifyWins } from '@/lib/supabase-data'
import { getTodayISTPatify } from '@/data/paatify'

const HOW_TO_PLAY = [
  { icon: <Music size={18} />, text: 'Guess the Tamil song from Google Translated English lyrics.' },
  { icon: <Mic2 size={18} />, text: 'Try to identify the song with as few hints as possible.' },
  { icon: <Share2 size={18} />, text: 'Share the results with your friends.' },
]

export default function PaatifyLandingPage() {
  const params = useParams()
  const city = params?.city ?? 'chennai'
  const [winCount, setWinCount] = useState<number | null>(null)

  useEffect(() => {
    fetchPaatifyWins(getTodayISTPatify()).then(setWinCount)
  }, [])

  return (
    <>
      <style>{`
        @keyframes pt-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pt-note-float {
          0%,100% { transform: translateY(0) rotate(-3deg); }
          50%      { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes pt-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .pt-fade-1 { animation: pt-fade-up 0.55s ease both; }
        .pt-fade-2 { animation: pt-fade-up 0.55s ease 0.08s both; }
        .pt-fade-3 { animation: pt-fade-up 0.55s ease 0.16s both; }
        .pt-fade-4 { animation: pt-fade-up 0.55s ease 0.24s both; }
        .pt-fade-5 { animation: pt-fade-up 0.55s ease 0.32s both; }
        .pt-title {
          font-size: 52px;
          font-weight: 900;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #1DB954 0%, #1ed760 55%, #4ade80 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          margin-bottom: 12px;
        }
        .pt-play-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pt-play-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 48px rgba(29,185,84,0.45) !important;
        }
        .pt-play-btn:active { transform: translateY(0); }
        .pt-note { animation: pt-note-float 3.2s ease-in-out infinite; display: inline-block; }
        .pt-step-card {
          transition: background 0.2s, border-color 0.2s;
        }
        .pt-step-card:hover {
          background: rgba(29,185,84,0.08) !important;
          border-color: rgba(29,185,84,0.4) !important;
        }

      `}</style>

      <main style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingBottom: 60,
      }}>
        <div style={{ maxWidth: 520, width: '100%', padding: '0 20px' }}>

          {/* ── Floating note icon ── */}
          <div className="pt-fade-1" style={{ textAlign: 'center', marginBottom: 8 }}>
            <span className="pt-note" style={{ fontSize: 40 }}>🎵</span>
          </div>

          {/* ── Title ── */}
          <div className="pt-fade-2" style={{ textAlign: 'center', marginBottom: 10 }}>
            <h1 className="pt-title">Paatify</h1>
            <p style={{
              fontSize: 16,
              color: 'var(--text)',
              fontWeight: 500,
              lineHeight: 1.5,
            }}>
              Guess Today&apos;s Mystery Tamil Song in 5 Chances
            </p>
          </div>

          {/* ── Daily badge ── */}
          <div className="pt-fade-3" style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '4px 12px',
              background: 'rgba(29,185,84,0.12)',
              color: '#1ed760',
              borderRadius: 20,
              border: '1px solid rgba(29,185,84,0.3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              🎵 New Songs Everyday
            </span>
          </div>


          {/* ── How to play ── */}
          <div className="pt-fade-4" style={{ marginBottom: 36 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: 14, textAlign: 'center',
            }}>
              How to play
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {HOW_TO_PLAY.map((step, i) => (
                <div key={i} className="pt-step-card" style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14, padding: '14px 16px',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(29,185,84,0.12)',
                    border: '1px solid rgba(29,185,84,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1ed760',
                  }}>
                    {step.icon}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Play Now CTA ── */}
          <div className="pt-fade-5">
            <Link
              href={`/${city}/games/paatify/play`}
              className="pt-play-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '17px 24px',
                background: 'linear-gradient(135deg, #1DB954 0%, #17a349 100%)',
                borderRadius: 16, border: 'none',
                color: '#fff', fontSize: 16, fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(29,185,84,0.35)',
                letterSpacing: '-0.01em',
              }}
            >
              <PlayCircle size={20} strokeWidth={2.2} />
              Play Paatify
            </Link>
            <p style={{
              textAlign: 'center', fontSize: 12,
              color: 'var(--text-3)', marginTop: 12, fontWeight: 500,
            }}>
              Free · No signup required · Resets daily at midnight IST
            </p>
            {winCount !== null && winCount > 0 && (
              <p style={{
                textAlign: 'center', fontSize: 13,
                color: '#1ed760', marginTop: 10, fontWeight: 600,
              }}>
                🏆 {winCount.toLocaleString()} {winCount === 1 ? 'person' : 'people'} won paatify today
              </p>
            )}
          </div>

        </div>
      </main>
    </>
  )
}
